import fs from 'node:fs';
import path from 'node:path';

const normalize = (value) => value.replaceAll('\\', '/').replace(/^\.\//, '');

function walk(rootDir, relativeDir) {
  const absoluteDir = path.join(rootDir, relativeDir);
  return fs.readdirSync(absoluteDir, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = normalize(path.join(relativeDir, entry.name));
    return entry.isDirectory() ? walk(rootDir, relativePath) : [relativePath];
  });
}

function localReferences(rootDir, relativePath) {
  if (!/\.(?:html|css)$/i.test(relativePath)) return [];
  const content = fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
  const values = [
    ...[...content.matchAll(/(?:src|href)=["']([^"']+)["']/gi)].map((match) => match[1]),
    ...[...content.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)].map((match) => match[1]),
  ];

  return values.flatMap((rawValue) => {
    const value = rawValue.split('#')[0].split('?')[0].trim();
    if (!value || /^(?:https?:|data:|mailto:|tel:|javascript:|#)/i.test(value)) return [];
    const base = value.startsWith('/') ? value.slice(1) : normalize(path.join(path.posix.dirname(relativePath), value));
    const resolved = base === '' ? 'index.html' : base.endsWith('/') ? `${base}index.html` : base;
    return [normalize(resolved)];
  });
}

export function inspectDeployManifest(rootDir) {
  const manifestPath = path.join(rootDir, 'deploy-manifest.json');
  const errors = [];
  if (!fs.existsSync(manifestPath)) return { errors: ['deploy-manifest.json ausente.'], files: [] };

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.schemaVersion !== 1) errors.push('schemaVersion do manifesto deve ser 1.');

  const requested = [...(manifest.rootFiles ?? []), ...(manifest.files ?? [])].map(normalize);
  for (const directory of manifest.directories ?? []) {
    const normalized = normalize(directory);
    if (!fs.existsSync(path.join(rootDir, normalized))) errors.push(`Diretório publicável ausente: ${normalized}.`);
    else requested.push(...walk(rootDir, normalized));
  }

  const files = [...new Set(requested)].sort();
  for (const relativePath of files) {
    if (!fs.existsSync(path.join(rootDir, relativePath))) errors.push(`Arquivo publicável ausente: ${relativePath}.`);
    for (const marker of manifest.forbidden ?? []) {
      if (relativePath.includes(marker)) errors.push(`Arquivo interno entrou no pacote: ${relativePath} (${marker}).`);
    }
  }

  const fileSet = new Set(files);
  for (const source of files) {
    for (const reference of localReferences(rootDir, source)) {
      const absoluteReference = path.join(rootDir, reference);
      if (!fs.existsSync(absoluteReference)) errors.push(`${source} referencia arquivo inexistente: ${reference}.`);
      else if (fs.statSync(absoluteReference).isFile() && !fileSet.has(reference)) {
        errors.push(`${source} referencia arquivo fora da allowlist: ${reference}.`);
      }
    }
  }

  return { errors: [...new Set(errors)], files, manifest };
}

export function buildDeployPackage(rootDir, outputDir) {
  const result = inspectDeployManifest(rootDir);
  if (result.errors.length) throw new Error(result.errors.join('\n'));
  if (fs.existsSync(outputDir)) throw new Error(`O destino já existe; escolha um diretório vazio: ${outputDir}`);
  for (const relativePath of result.files) {
    const destination = path.join(outputDir, relativePath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(rootDir, relativePath), destination);
  }
  return result.files.length;
}

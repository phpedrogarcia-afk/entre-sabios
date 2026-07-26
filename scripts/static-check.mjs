import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules']);
const PROTECTED_PARALLEL_FILE = /-PEDRO\.js$/i;
const SCRIPT_EXTENSIONS = new Set(['.js', '.mjs']);
const IMPORT_PATTERN = /(?:\b(?:import|export)\s+(?:[^'";]+?\s+from\s+)?|\bimport\s*\()(['"])(\.{1,2}\/[^'"]+)\1/g;

export function collectProjectFiles(rootDir) {
  const files = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue;
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolutePath);
      else if (entry.isFile()) files.push(absolutePath);
    }
  }
  visit(rootDir);
  return files;
}

export function selectStaticCheckFiles(files) {
  const scripts = files.filter((fileName) => (
    SCRIPT_EXTENSIONS.has(path.extname(fileName).toLowerCase())
    && !PROTECTED_PARALLEL_FILE.test(fileName)
  ));
  const json = files.filter((fileName) => path.extname(fileName).toLowerCase() === '.json');
  return { scripts, json };
}

export function extractRelativeImports(source) {
  return [...source.matchAll(IMPORT_PATTERN)].map((match) => match[2]);
}

function resolveRelativeImport(importer, specifier) {
  const cleanSpecifier = specifier.split(/[?#]/, 1)[0];
  const candidate = path.resolve(path.dirname(importer), cleanSpecifier);
  const possibilities = [candidate];
  if (!path.extname(candidate)) {
    possibilities.push(`${candidate}.js`, `${candidate}.mjs`, `${candidate}.json`, path.join(candidate, 'index.js'));
  }
  return possibilities.find((fileName) => fs.existsSync(fileName)) || null;
}

export function checkRelativeImports(scriptFiles) {
  const errors = [];
  for (const fileName of scriptFiles) {
    const source = fs.readFileSync(fileName, 'utf8');
    for (const specifier of extractRelativeImports(source)) {
      if (!resolveRelativeImport(fileName, specifier)) {
        errors.push(`${fileName}: import relativo inexistente: ${specifier}`);
      }
    }
  }
  return errors;
}

export function checkJsonFiles(jsonFiles) {
  const errors = [];
  for (const fileName of jsonFiles) {
    try {
      JSON.parse(fs.readFileSync(fileName, 'utf8'));
    } catch (error) {
      errors.push(`${fileName}: JSON inválido: ${error.message}`);
    }
  }
  return errors;
}

export function checkScriptSyntax(scriptFiles) {
  const errors = [];
  for (const fileName of scriptFiles) {
    const result = spawnSync(process.execPath, ['--check', fileName], { encoding: 'utf8' });
    if (result.status !== 0) {
      errors.push(`${fileName}: sintaxe inválida\n${(result.stderr || result.stdout || '').trim()}`);
    }
  }
  return errors;
}

export function runStaticCheck(rootDir) {
  const files = collectProjectFiles(rootDir);
  const selected = selectStaticCheckFiles(files);
  const errors = [
    ...checkScriptSyntax(selected.scripts),
    ...checkRelativeImports(selected.scripts),
    ...checkJsonFiles(selected.json),
  ];
  return {
    success: errors.length === 0,
    scriptsChecked: selected.scripts.length,
    jsonChecked: selected.json.length,
    errors,
  };
}

const isDirectExecution = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const report = runStaticCheck(rootDir);
  console.log(`[Entre Sábios] Sintaxe JS/MJS: ${report.scriptsChecked} arquivo(s).`);
  console.log(`[Entre Sábios] JSON: ${report.jsonChecked} arquivo(s).`);
  if (!report.success) {
    report.errors.forEach((error) => console.error(error));
    process.exit(1);
  }
  console.log('[Entre Sábios] Análise estática leve concluída sem falhas.');
}

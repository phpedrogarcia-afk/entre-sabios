import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectDeployManifest } from './deploy-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = inspectDeployManifest(rootDir);

if (result.errors.length) {
  for (const error of result.errors) console.error(`[deploy] ${error}`);
  process.exit(1);
}
console.log(`[deploy] Allowlist válida: ${result.files.length} arquivos públicos; mestre, testes e relatórios excluídos.`);

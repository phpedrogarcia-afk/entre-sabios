import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectGovernance } from './governance-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = inspectGovernance(rootDir);

for (const warning of result.warnings) console.warn(`[governança] Aviso: ${warning}`);
if (result.errors.length) {
  for (const error of result.errors) console.error(`[governança] Erro: ${error}`);
  process.exit(1);
}

console.log(`[governança] ${result.decisionCount} decisões e fontes vivas consistentes.`);

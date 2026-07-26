import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDeployPackage } from './deploy-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputArg = process.argv[2];
if (!outputArg) {
  console.error('Uso: npm run build:deploy -- <diretório-vazio-fora-do-repositório>');
  process.exit(2);
}

const outputDir = path.resolve(process.cwd(), outputArg);
const count = buildDeployPackage(rootDir, outputDir);
console.log(`[deploy] ${count} arquivos copiados para ${outputDir}.`);

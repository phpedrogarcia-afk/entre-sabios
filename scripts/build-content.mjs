import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFromFiles } from './content-build-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

try {
  const { runtime, serialized, runtimePath } = buildFromFiles({ rootDir, write: true });
  console.log(`Versão: ${runtime.contentVersion}`);
  console.log(`Ativos: ${runtime.summary.activeTotal}`);
  console.log(`Núcleos: ${runtime.summary.nucleusTotal}`);
  console.log(`Contextuais: ${runtime.summary.contextualTotal}`);
  console.log(`Gerais: ${runtime.summary.generalTotal}`);
  console.log(`Tamanho: ${Buffer.byteLength(serialized)} bytes`);
  console.log(`Sentimentos: ${JSON.stringify(runtime.summary.byFeeling)}`);
  console.log(`Runtime: ${runtimePath}`);
} catch (error) {
  console.error(`Falha ao gerar o runtime: ${error.message}`);
  process.exitCode = 1;
}

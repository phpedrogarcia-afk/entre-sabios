import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFromFiles } from './content-build-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');

try {
  const {
    runtime,
    serialized,
    serializedScript,
    runtimePath,
    runtimeScriptPath,
  } = buildFromFiles({ rootDir, write: !checkOnly });

  if (checkOnly) {
    const currentRuntime = fs.readFileSync(runtimePath, 'utf8');
    const currentRuntimeScript = fs.readFileSync(runtimeScriptPath, 'utf8');
    if (currentRuntime !== serialized || currentRuntimeScript !== serializedScript) {
      throw new Error('Runtime gerado está desatualizado. Execute npm run build:content.');
    }
  }

  console.log(`Versão: ${runtime.contentVersion}`);
  console.log(`Ativos: ${runtime.summary.activeTotal}`);
  console.log(`Núcleos: ${runtime.summary.nucleusTotal}`);
  console.log(`Contextuais: ${runtime.summary.contextualTotal}`);
  console.log(`Gerais: ${runtime.summary.generalTotal}`);
  console.log(`Tamanho: ${Buffer.byteLength(serialized)} bytes`);
  console.log(`Sentimentos: ${JSON.stringify(runtime.summary.byFeeling)}`);
  console.log(`Runtime: ${runtimePath}`);
  console.log(`Runtime local: ${runtimeScriptPath}`);
  if (checkOnly) console.log('Verificação: runtime sincronizado, sem escrita de arquivos.');
} catch (error) {
  console.error(`${checkOnly ? 'Falha ao verificar' : 'Falha ao gerar'} o runtime: ${error.message}`);
  process.exitCode = 1;
}

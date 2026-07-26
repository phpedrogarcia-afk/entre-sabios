import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_LAB_CONFIG, runEmotionalLab } from './emotional-lab-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const valueAfter = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};

if (args.includes('--help') || args.includes('-h')) {
  console.log('Uso: npm run lab:emotional -- [--input cenarios.json] [--output relatorio.json]');
  process.exit(0);
}

try {
  const inputName = valueAfter('--input');
  const outputName = valueAfter('--output');
  const config = inputName
    ? JSON.parse(fs.readFileSync(path.resolve(process.cwd(), inputName), 'utf8'))
    : DEFAULT_LAB_CONFIG;
  const report = runEmotionalLab(config, { rootDir });
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (outputName) {
    const outputPath = path.resolve(process.cwd(), outputName);
    fs.writeFileSync(outputPath, serialized, 'utf8');
    console.log(`[Entre Sábios] Laboratório exportado: ${outputPath}`);
    console.log(`[Entre Sábios] ${report.summary.scenarioCount} cenário(s), ${report.summary.selectionCount} seleções, ${report.summary.alertCount} alerta(s).`);
  } else {
    process.stdout.write(serialized);
  }
} catch (error) {
  console.error(`[Entre Sábios] Laboratório inválido: ${error.message}`);
  process.exit(2);
}


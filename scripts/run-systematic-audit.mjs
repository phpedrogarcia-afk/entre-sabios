import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSystematicAudit } from './systematic-audit-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const outputIndex = args.indexOf('--output');

if (args.includes('--help') || args.includes('-h')) {
  console.log('Uso: npm run audit:systematic [-- --output relatorio.json]');
  process.exit(0);
}

try {
  const report = runSystematicAudit({ rootDir });
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (outputIndex >= 0 && args[outputIndex + 1]) {
    const outputPath = path.resolve(process.cwd(), args[outputIndex + 1]);
    fs.writeFileSync(outputPath, serialized, 'utf8');
    console.log(`[Entre Sábios] Auditoria sistemática exportada: ${outputPath}`);
    console.log(`[Entre Sábios] ${report.matrix.scenarioCount} cenários e ${report.matrix.selectionCount} seleções.`);
  } else process.stdout.write(serialized);
} catch (error) {
  console.error(`[Entre Sábios] Auditoria sistemática inválida: ${error.message}`);
  process.exit(2);
}


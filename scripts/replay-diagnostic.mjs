import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { replayDiagnosticSession } from './diagnostic-replay-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fileName = process.argv[2];

if (!fileName || fileName === '--help' || fileName === '-h') {
  console.log('Uso: npm run replay:diagnostic -- caminho/diagnostico.json');
  process.exit(fileName ? 0 : 2);
}

try {
  const absolutePath = path.resolve(process.cwd(), fileName);
  const session = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  const report = replayDiagnosticSession(session, { rootDir });
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.success ? 0 : 1);
} catch (error) {
  console.error(`[Entre Sábios] Replay inválido: ${error.message}`);
  process.exit(2);
}

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { groupsForFiles } from './test-routing-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawArgs = process.argv.slice(2);
const listOnly = rawArgs.includes('--list');
const explicitFiles = rawArgs.filter((arg) => arg !== '--list' && arg !== '--');

function changedFiles() {
  const result = spawnSync('git', ['status', '--porcelain=v1', '-z'], { cwd: rootDir, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'Não foi possível consultar o estado do Git.');
  return result.stdout.split('\0')
    .map((entry) => entry.length > 3 && /^[ MADRCU?!]{2} /.test(entry) ? entry.slice(3) : entry)
    .map((value) => value.trim())
    .filter(Boolean);
}

const files = explicitFiles.length ? explicitFiles : changedFiles();
const groups = groupsForFiles(files);
console.log(`[testes] Arquivos considerados: ${files.length ? files.join(', ') : '(nenhuma alteração local)'}.`);
console.log(`[testes] Grupos selecionados: ${groups.join(', ')}.`);

if (listOnly) process.exit(0);

for (const group of groups) {
  const script = group === 'governance' ? 'test:governance' : `test:${group}`;
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(command, ['run', script], { cwd: rootDir, stdio: 'inherit' });
  if (result.error || result.status !== 0) process.exit(result.status ?? 1);
}

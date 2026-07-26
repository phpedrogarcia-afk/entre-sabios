import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const testsDir = path.join(rootDir, 'tests');
const requestedGroup = process.argv[2] || 'fast';

const groups = Object.freeze({
  state: [
    'canonical-contracts.test.mjs',
    'diagnostic-replay.test.mjs',
    'emotional-state-contract.test.mjs',
    'history-authority-matrix.test.mjs',
    'principal-focus-control.test.mjs',
    'static-check.test.mjs',
  ],
  lab: [
    'diagnostic-replay.test.mjs',
    'emotional-lab.test.mjs',
    'repetition-stress.test.mjs',
    'systematic-audit.test.mjs',
  ],
  synthesis: [
    'color-analogy-contract.test.mjs',
    'emotional-synthesis.test.mjs',
    'synthesis-ranking.test.mjs',
    'synthesis-interface.test.mjs',
  ],
  motivation: [
    'motivation-control.test.mjs',
    'motivation-ranking.test.mjs',
    'vulnerable-motivation-safety.test.mjs',
  ],
  ranking: [
    'runtime-selection.test.mjs',
    'principal-focus-control.test.mjs',
    'synthesis-ranking.test.mjs',
    'motivation-ranking.test.mjs',
  ],
  rotation: [
    'candidate-contract.test.mjs',
    'queue-migration.test.mjs',
    'runtime-selection.test.mjs',
    'repetition-real-path-regression.test.mjs',
    'phase9-rotation-integration.test.mjs',
  ],
  editorial: [
    'canonical-contracts.test.mjs',
    'content-runtime.test.mjs',
    'authorship-presentation.test.mjs',
    'editorial-explanations.test.mjs',
    'editorial-guidance.test.mjs',
    'book-recommendations.test.mjs',
  ],
  ui: [
    'interface-wiring.test.mjs',
    'selection-atomicity.test.mjs',
    'copy-removal-sharing.test.mjs',
    'gender-preference-removal.test.mjs',
    'share-image-layout.test.mjs',
    'tale-image.test.mjs',
  ],
  seo: ['seo.test.mjs'],
  stress: [
    'behavioral-selection.test.mjs',
    'repetition-stress.test.mjs',
    'phase9-rotation-integration.test.mjs',
    'selection-atomicity.test.mjs',
  ],
});

const allTests = fs.readdirSync(testsDir)
  .filter((fileName) => fileName.endsWith('.test.mjs'))
  .sort((left, right) => left.localeCompare(right, 'pt-BR'));
const stressTests = new Set(groups.stress);
const resolvedGroups = {
  ...groups,
  fast: allTests.filter((fileName) => !stressTests.has(fileName)),
  all: allTests,
};

if (!Object.hasOwn(resolvedGroups, requestedGroup)) {
  console.error(`Grupo desconhecido: ${requestedGroup}. Use: ${Object.keys(resolvedGroups).sort().join(', ')}.`);
  process.exit(2);
}

const selectedTests = [...new Set(resolvedGroups[requestedGroup])];
const missingTests = selectedTests.filter((fileName) => !fs.existsSync(path.join(testsDir, fileName)));
if (missingTests.length) {
  console.error(`Testes ausentes no grupo ${requestedGroup}: ${missingTests.join(', ')}.`);
  process.exit(2);
}

console.log(`[Entre Sábios] Grupo ${requestedGroup}: ${selectedTests.length} arquivo(s) de teste.`);
const result = spawnSync(
  process.execPath,
  ['--test', ...selectedTests.map((fileName) => path.join('tests', fileName))],
  { cwd: rootDir, stdio: 'inherit' },
);

if (result.error) {
  console.error(`Falha ao iniciar os testes: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);

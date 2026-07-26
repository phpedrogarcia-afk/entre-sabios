import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  collectProjectFiles,
  extractRelativeImports,
  selectStaticCheckFiles,
} from '../scripts/static-check.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('análise estática cobre fontes, scripts e testes sem tocar cópias PEDRO protegidas', () => {
  const selected = selectStaticCheckFiles(collectProjectFiles(rootDir));
  const relative = selected.scripts.map((fileName) => path.relative(rootDir, fileName).replaceAll('\\', '/'));
  assert.ok(relative.includes('script.js'));
  assert.ok(relative.includes('js/core/runtime-engine.js'));
  assert.ok(relative.includes('scripts/static-check.mjs'));
  assert.ok(relative.includes('tests/static-check.test.mjs'));
  assert.equal(relative.some((fileName) => /-PEDRO\.js$/i.test(fileName)), false);
});

test('extrator reconhece imports estáticos, dinâmicos e reexports relativos', () => {
  const source = `
    import value from '../scripts/static-check.mjs';
    import '../scripts/run-tests.mjs';
    export { helper } from '../scripts/content-build-lib.mjs';
    const lazy = import('../scripts/diagnostic-replay-lib.mjs');
    import fs from 'node:fs';
  `;
  assert.deepEqual(extractRelativeImports(source), [
    '../scripts/static-check.mjs',
    '../scripts/run-tests.mjs',
    '../scripts/content-build-lib.mjs',
    '../scripts/diagnostic-replay-lib.mjs',
  ]);
});

test('seleção de arquivos limita JSON aos arquivos reais do projeto', () => {
  const selected = selectStaticCheckFiles(collectProjectFiles(rootDir));
  assert.ok(selected.json.some((fileName) => fileName.endsWith('package.json')));
  assert.equal(selected.json.some((fileName) => fileName.includes(`${path.sep}node_modules${path.sep}`)), false);
});

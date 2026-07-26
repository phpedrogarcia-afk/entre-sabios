import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = { window: { EntreSabiosData: {} }, console };
vm.createContext(sandbox);
for (const relativePath of [
  'js/data/emotional-syntheses.js',
  'js/data/motivation-profiles.js',
  'js/core/emotional-synthesis.js',
  'js/core/synthesis-ranking-adapter.js',
  'js/core/motivation-ranking-adapter.js',
  'js/core/runtime-engine.js',
]) vm.runInContext(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'), sandbox, { filename: relativePath });

const engine = sandbox.window.EntreSabiosRuntimeEngine;

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function makeContent(id, { text, author = 'Autor', format = 'frase', placement = 'contextual', associationFeeling = 'autoconhecimento', associationPlacement = 'contextual' } = {}) {
  return {
    id,
    finalText: text || `Texto ${id}`,
    displayedAuthor: author,
    author,
    displayType: format,
    editorialFunction: 'contemplation',
    tone: 'contemplativo',
    themes: [],
    riskTags: [],
    hardExclusions: [],
    suitableIntensities: ['fraca', 'moderada', 'intensa'],
    associations: [{ feeling: associationFeeling, placement: associationPlacement }],
    placement,
    status: placement === 'nucleo'
      ? 'ATIVO_NUCLEO'
      : (placement === 'geral' ? 'ATIVO_GERAL' : 'ATIVO_CONTEXTUAL'),
    publicationEnabled: true,
  };
}

test('a progressão de níveis avança para o próximo nível quando o nível ativo se esgota', () => {
  const state = {
    primaryFeeling: 'autoconhecimento',
    secondaryFeelings: ['confusao'],
    intensity: 'moderada',
    needsMotivation: false,
  };
  const contents = [
    makeContent('level-1', {
      text: 'Reflexão central principal',
      placement: 'nucleo',
      associationFeeling: 'autoconhecimento',
      associationPlacement: 'nucleo',
    }),
    makeContent('level-2', {
      text: 'Reflexão contextual principal',
      placement: 'contextual',
      associationFeeling: 'autoconhecimento',
      associationPlacement: 'contextual',
    }),
    makeContent('secondary-level-3', {
      text: 'Reflexão secundária em núcleo',
      placement: 'nucleo',
      associationFeeling: 'confusao',
      associationPlacement: 'nucleo',
    }),
    makeContent('general-level-5', {
      text: 'Reflexão geral que não deve aparecer cedo',
      placement: 'geral',
      associationFeeling: 'esperanca',
      associationPlacement: 'contextual',
    }),
  ];

  const selector = engine.createSelector({
    version: 'progression-contract',
    contents,
    storage: createMemoryStorage(),
  });

  const first = selector.select(state, { firstResponse: false, diagnostics: true });
  const second = selector.select(state, { firstResponse: false, diagnostics: true });
  const third = selector.select(state, { firstResponse: false, diagnostics: true });
  const fourth = selector.select(state, { firstResponse: false, diagnostics: true });

  assert.equal(first.content.id, 'level-1');
  assert.equal(second.content.id, 'level-2');
  assert.equal(first.diagnostics.activeLevel, 1);
  assert.equal(second.diagnostics.activeLevel, 2);
  assert.notEqual(second.content.id, 'secondary-level-3');
  assert.ok(
    [third, fourth].every(({ level }) => [1, 2].includes(level)),
    'após o esgotamento, a seleção deve permanecer no território principal',
  );
  assert.ok([third, fourth].every(({ content }) => !['secondary-level-3', 'general-level-5'].includes(content.id)));
  assert.equal(third.content.id, 'level-1', 'a primeira repetição deve recuperar o conteúdo globalmente menos recente');
  assert.equal(fourth.content.id, 'level-2', 'a repetição seguinte deve recuperar o novo conteúdo menos recente');
  assert.ok([third, fourth].every(({ diagnostics }) => diagnostics.repeatAllowed === true));
  assert.ok([third, fourth].every(({ diagnostics }) => diagnostics.repeatReason === 'all_allowed_candidates_exhausted'));
  assert.ok([third, fourth].every(({ diagnostics }) => diagnostics.territoryCycle.exhausted === true));
  assert.equal(third.diagnostics.leastRecentCandidateId, 'level-1');
  assert.equal(fourth.diagnostics.leastRecentCandidateId, 'level-2');
  assert.deepEqual(
    third.diagnostics.eligibleCandidates.map(({ id }) => id).sort(),
    ['level-1', 'level-2'],
  );
});

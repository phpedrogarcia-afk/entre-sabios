import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = { window: { EntreSabiosData: {} }, console };
vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync(path.join(rootDir, 'js/core/runtime-engine.js'), 'utf8'),
  sandbox,
  { filename: 'js/core/runtime-engine.js' },
);
const engine = sandbox.window.EntreSabiosRuntimeEngine;

function makeContent(id, { feeling = 'autoconhecimento', placement = 'nucleo' } = {}) {
  return {
    id,
    finalText: `Texto seguro ${id}`,
    displayedAuthor: `Autor ${id}`,
    author: `Autor ${id}`,
    displayType: 'frase',
    editorialFunction: 'contemplation',
    tone: 'contemplativo',
    themes: [],
    riskTags: [],
    hardExclusions: [],
    suitableIntensities: ['fraca', 'moderada', 'intensa'],
    associations: [{ feeling, placement }],
    placement,
    status: placement === 'nucleo' ? 'ATIVO_NUCLEO' : 'ATIVO_CONTEXTUAL',
    publicationEnabled: true,
  };
}

function ids(candidates) {
  return candidates.map(({ id }) => id).sort();
}

const state = {
  primaryFeeling: 'autoconhecimento',
  secondaryFeelings: ['confusao'],
  intensity: 'moderada',
  needsMotivation: false,
};

test('contrato distingue território permitido, nível ativo, inéditos e bloqueados', () => {
  const contents = [
    makeContent('primary-core'),
    makeContent('primary-context', { placement: 'contextual' }),
    makeContent('secondary-core', { feeling: 'confusao' }),
  ];
  const selector = engine.createSelector({ version: 'phase2-contract', contents });
  const before = selector.inspect(state, { firstResponse: false, diagnostics: true });

  assert.deepEqual(Array.from(before.diagnostics.permittedLevels), [1, 2]);
  assert.deepEqual(ids(before.diagnostics.eligibleCandidates), ['primary-context', 'primary-core']);
  assert.deepEqual(ids(before.diagnostics.activeTierCandidates), ['primary-core']);
  assert.deepEqual(ids(before.diagnostics.unseenEligibleCandidates), ['primary-context', 'primary-core']);
  assert.deepEqual(ids(before.diagnostics.recentlyBlockedCandidates), []);
  assert.equal(before.diagnostics.repeatAllowed, false);
  assert.equal(before.diagnostics.repeatReason, null);

  const selected = selector.select(state, { firstResponse: false, diagnostics: true });
  const after = selector.inspect(state, { firstResponse: false, diagnostics: true });
  assert.deepEqual(ids(after.diagnostics.eligibleCandidates), ['primary-context', 'primary-core']);
  assert.deepEqual(ids(after.diagnostics.recentlyBlockedCandidates), [selected.content.id]);
  assert.equal(after.diagnostics.unseenEligibleCandidates.length, 1);
});

test('select preserva a mesma definição de elegível ao progredir para o contextual', () => {
  const contents = [makeContent('core'), makeContent('context', { placement: 'contextual' })];
  const selector = engine.createSelector({ version: 'phase2-active-tier', contents });
  selector.select(state, { firstResponse: false, diagnostics: true });
  const second = selector.select(state, { firstResponse: false, diagnostics: true });

  assert.equal(second.level, 2);
  assert.deepEqual(ids(second.diagnostics.eligibleCandidates), ['context', 'core']);
  assert.deepEqual(ids(second.diagnostics.activeTierCandidates), ['context']);
  assert.deepEqual(ids(second.diagnostics.unseenEligibleCandidates), ['context']);
  assert.deepEqual(ids(second.diagnostics.recentlyBlockedCandidates), ['core']);
});

test('repetição só é permitida depois do esgotamento de todo o território permitido', () => {
  const contents = [makeContent('first'), makeContent('second')];
  const selector = engine.createSelector({ version: 'phase2-repeat-contract', contents });
  const first = selector.select(state, { firstResponse: false, diagnostics: true });
  const second = selector.select(state, { firstResponse: false, diagnostics: true });
  const repeated = selector.select(state, { firstResponse: false, diagnostics: true });

  assert.notEqual(first.content.id, second.content.id);
  assert.equal(repeated.diagnostics.unseenEligibleCandidates.length, 0);
  assert.equal(repeated.diagnostics.repeatAllowed, true);
  assert.equal(repeated.diagnostics.repeatReason, 'all_allowed_candidates_exhausted');
});

test('ativar diagnóstico não altera a sequência publicada', () => {
  const contents = [
    makeContent('same-a'),
    makeContent('same-b'),
    makeContent('same-c', { placement: 'contextual' }),
  ];
  const plain = engine.createSelector({ version: 'phase2-selection-plain', contents });
  const diagnosed = engine.createSelector({ version: 'phase2-selection-diagnosed', contents });
  const plainIds = Array.from({ length: 6 }, () => plain.select(state, { firstResponse: false }).content.id);
  const diagnosedIds = Array.from({ length: 6 }, () => diagnosed.select(
    state,
    { firstResponse: false, diagnostics: true },
  ).content.id);

  assert.deepEqual(diagnosedIds, plainIds);
});

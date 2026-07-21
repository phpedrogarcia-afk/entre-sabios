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
const version = 'phase6-content';
const state = { primaryFeeling: 'autoconhecimento', secondaryFeelings: [], intensity: 'moderada' };
const queueKey = `${version}|autoconhecimento|moderada::level:1`;
const keys = {
  queues: `entreSabiosRuntimeQueues:${version}`,
  directions: `entreSabiosRuntimeQueueDirections:${version}`,
  recent: `entreSabiosRecentContent:${version}`,
  contexts: `entreSabiosContextHistory:${version}`,
  meta: `entreSabiosRuntimeQueueMeta:${version}`,
};

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial).map(([key, value]) => [key, String(value)]));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    has: (key) => values.has(key),
  };
}

function makeContent(id, { feeling = 'autoconhecimento' } = {}) {
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
    associations: [{ feeling, placement: 'nucleo' }],
    placement: 'nucleo',
    status: 'ATIVO_NUCLEO',
    publicationEnabled: true,
  };
}

function currentMeta(contentVersion = version) {
  return JSON.stringify({
    contentVersion,
    selectorSchemaVersion: engine.QUEUE_SELECTOR_SCHEMA_VERSION,
    rotationPolicyVersion: engine.QUEUE_ROTATION_POLICY_VERSION,
  });
}

function recentEntry(id) {
  return { id, textKey: `texto seguro ${id}`, canonicalKeys: [`content:${id}`] };
}

test('persistência separa versão do conteúdo, esquema do seletor e política de rotação', () => {
  const storage = createMemoryStorage({ favoritos: '["preservado"]' });
  const selector = engine.createSelector({ version, contents: [makeContent('a'), makeContent('b')], storage });
  selector.select(state, { firstResponse: false, diagnostics: true });
  const meta = JSON.parse(storage.getItem(keys.meta));

  assert.deepEqual(meta, {
    contentVersion: version,
    selectorSchemaVersion: 2,
    rotationPolicyVersion: 2,
  });
  assert.equal(storage.getItem('favoritos'), '["preservado"]');
});

test('fila sem metadados é invalidada seletivamente e preserva histórico e preferências', () => {
  const storage = createMemoryStorage({
    [keys.queues]: JSON.stringify({ [queueKey]: ['a', 'b'] }),
    [keys.recent]: JSON.stringify([recentEntry('a')]),
    caixaSabedoriaFavoritas: '[{"id":"favorita"}]',
    entreSabiosTheme: 'night',
    caixaSabedoriaPreferencias: '{"themes":{"tempo":1}}',
  });
  const selector = engine.createSelector({ version, contents: [makeContent('a'), makeContent('b')], storage });
  const result = selector.select(state, { firstResponse: false, diagnostics: true });

  assert.equal(result.diagnostics.queueRestoration.status, 'missing_meta_invalidated');
  assert.deepEqual(Array.from(result.diagnostics.storedQueueBefore), []);
  assert.equal(result.diagnostics.globalHistoryBefore.length, 1);
  assert.equal(storage.getItem('caixaSabedoriaFavoritas'), '[{"id":"favorita"}]');
  assert.equal(storage.getItem('entreSabiosTheme'), 'night');
  assert.equal(storage.getItem('caixaSabedoriaPreferencias'), '{"themes":{"tempo":1}}');
});

test('fila parcialmente válida preserva ordem, remove IDs inválidos e acrescenta novos', () => {
  const storage = createMemoryStorage({
    [keys.meta]: currentMeta(),
    [keys.queues]: JSON.stringify({ [queueKey]: ['b', 'a', 'secondary', 'missing'] }),
  });
  const contents = [
    makeContent('a'),
    makeContent('b'),
    makeContent('new'),
    makeContent('secondary', { feeling: 'confusao' }),
  ];
  const selector = engine.createSelector({ version, contents, storage });
  const result = selector.select(state, { firstResponse: false, diagnostics: true });
  const reconciliation = result.diagnostics.queueReconciliation;

  assert.deepEqual(Array.from(reconciliation.preservedIds), ['b', 'a']);
  assert.deepEqual(Array.from(reconciliation.removedMissingIds), ['missing']);
  assert.deepEqual(Array.from(reconciliation.removedIneligibleIds), ['secondary']);
  assert.ok(reconciliation.appendedEligibleIds.includes('new'));
  assert.deepEqual(Array.from(result.diagnostics.activeQueueBeforeSelection).slice(0, 2), ['b', 'a']);
});

test('metadado ou fila corrompidos reconstroem apenas a rotação e preservam histórico', () => {
  for (const [name, meta, queues, expectedStatus] of [
    ['meta', '{inválido', JSON.stringify({ [queueKey]: ['a'] }), 'corrupt_meta_invalidated'],
    ['queue', currentMeta(), '{inválido', 'corrupt_queue_rebuilt'],
  ]) {
    const storage = createMemoryStorage({
      [keys.meta]: meta,
      [keys.queues]: queues,
      [keys.recent]: JSON.stringify([recentEntry('a')]),
      unrelated: name,
    });
    const selector = engine.createSelector({ version, contents: [makeContent('a'), makeContent('b')], storage });
    const result = selector.select(state, { firstResponse: false, diagnostics: true });

    assert.equal(result.diagnostics.queueRestoration.status, expectedStatus);
    assert.equal(result.diagnostics.globalHistoryBefore.length, 1);
    assert.equal(storage.getItem('unrelated'), name);
  }
});

test('estados anteriores à síntese ou motivação são invalidados sem apagar dados independentes', () => {
  for (const legacyMeta of [
    { contentVersion: version, selectorSchemaVersion: 1, rotationPolicyVersion: 1 },
    { contentVersion: version, selectorSchemaVersion: 2 },
    { selectorSchemaVersion: 2, rotationPolicyVersion: 2 },
    { contentVersion: 'outra-versao', selectorSchemaVersion: 2, rotationPolicyVersion: 2 },
  ]) {
    const storage = createMemoryStorage({
      [keys.meta]: JSON.stringify(legacyMeta),
      [keys.queues]: JSON.stringify({ [queueKey]: ['a', 'b'] }),
      [keys.directions]: JSON.stringify({ [queueKey]: 'motivated' }),
      [keys.contexts]: JSON.stringify({ [`${version}|autoconhecimento|moderada`]: [{ id: 'a' }] }),
      [keys.recent]: JSON.stringify([recentEntry('a')]),
      feedback: '{"liked":true}',
    });
    const selector = engine.createSelector({ version, contents: [makeContent('a'), makeContent('b')], storage });
    const result = selector.select(state, { firstResponse: false, diagnostics: true });

    assert.equal(result.diagnostics.queueRestoration.status, 'incompatible_invalidated');
    assert.deepEqual(Array.from(result.diagnostics.storedQueueBefore), []);
    assert.equal(result.diagnostics.globalHistoryBefore.length, 1);
    assert.equal(storage.getItem('feedback'), '{"liked":true}');
  }
});

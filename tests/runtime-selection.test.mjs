import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { REQUIRED_INSECURITY_IDS, buildFromFiles } from '../scripts/content-build-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { runtime } = buildFromFiles({ rootDir, write: false });
await import(pathToFileURL(path.join(rootDir, 'js', 'core', 'runtime-engine.js')).href);
const engine = globalThis.EntreSabiosRuntimeEngine;

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function normalizeText(value) {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

test('42 cenários respeitam hierarquia, intensidade e exclusões', () => {
  let scenarios = 0;
  for (const feeling of runtime.feelings.map((item) => item.id)) {
    for (const intensity of ['fraca', 'moderada', 'intensa']) {
      scenarios += 1;
      const state = { primaryFeeling: feeling, secondaryFeelings: [], intensity };
      const selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents });
      const inspection = selector.inspect(state, { firstResponse: false });
      assert.ok(inspection.eligibleAtLevel.length > 0, `${feeling}/${intensity} sem cobertura`);
      assert.ok(inspection.ranked.every((candidate) => candidate.content.suitableIntensities.includes(intensity)));
      assert.ok(inspection.ranked.every((candidate) => candidate.content.publicationEnabled));
      assert.ok(inspection.ranked.every((candidate) => !['REMOVIDO', 'MOVER_PARA_TEXTOS'].includes(candidate.content.status)));
      assert.ok(inspection.ranked.every((candidate, index, list) => index === 0 || list[index - 1].level <= candidate.level));
      const selected = selector.select(state, { firstResponse: false });
      assert.equal(selected.level, inspection.bestLevel);
      assert.ok(runtime.contents.some((content) => content.id === selected.content.id));
    }
  }
  assert.equal(scenarios, 42);
});

test('hardExclusions respeitam primeira resposta e intensidade intensa', () => {
  const states = [
    { primaryFeeling: 'luto', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'raiva', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'medo', secondaryFeelings: [], intensity: 'intensa' },
  ];
  for (const state of states) {
    const ranked = engine.rankEligibleContents(runtime.contents, state, { firstResponse: true });
    const signals = new Set(engine.getContextSignals(state, true));
    assert.ok(ranked.every(({ content }) => !content.hardExclusions.some((item) => signals.has(item))));
  }
});

test('Insegurança fraca percorre nove núcleos antes de repetir', () => {
  const state = { primaryFeeling: 'inseguranca', secondaryFeelings: [], intensity: 'fraca' };
  const selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents });
  const inspection = selector.inspect(state, { firstResponse: false });
  assert.equal(inspection.bestLevel, 1);
  assert.equal(inspection.eligibleAtLevel.length, 9);
  const selected = Array.from({ length: 9 }, () => selector.select(state, { firstResponse: false }));
  assert.ok(selected.every((item) => item.level === 1 && !item.fallback));
  assert.deepEqual([...new Set(selected.map((item) => item.content.id))].sort(), [...REQUIRED_INSECURITY_IDS].sort());
});

test('transição da primeira resposta não repete imediatamente e percorre o ciclo', () => {
  const state = { primaryFeeling: 'inseguranca', secondaryFeelings: [], intensity: 'fraca' };
  const selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents });
  const selected = [selector.select(state, { firstResponse: true })];
  for (let index = 1; index < 9; index += 1) selected.push(selector.select(state, { firstResponse: false }));
  assert.equal(new Set(selected.map((item) => item.content.id)).size, 9);
  assert.notEqual(selected[0].content.id, selected[1].content.id);
});

test('Insegurança intensa usa somente compatíveis e mantém núcleo antes de contextual', () => {
  const state = { primaryFeeling: 'inseguranca', secondaryFeelings: [], intensity: 'intensa' };
  const selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents });
  const inspection = selector.inspect(state, { firstResponse: false });
  assert.equal(inspection.bestLevel, 1);
  assert.ok(inspection.eligibleAtLevel.every(({ content }) => content.suitableIntensities.includes('intensa')));
});

test('metadado editorial de gênero é preservado sem filtro pessoal ativo', () => {
  const engineSource = fs.readFileSync(path.join(rootDir, 'js', 'core', 'runtime-engine.js'), 'utf8');
  assert.doesNotMatch(engineSource, /genderPreference|filterGender/);
  assert.ok(runtime.contents.every((content) => ['male', 'female', 'neutral'].includes(content.filterGender)));
});

test('histórico recente persiste entre contextos e entre instâncias do seletor', () => {
  const storage = createMemoryStorage();
  const states = runtime.feelings.flatMap((feeling, feelingIndex) => ['fraca', 'moderada', 'intensa'].map((intensity, intensityIndex) => ({
    primaryFeeling: feeling.id,
    secondaryFeelings: [],
    intensity,
    firstResponse: (feelingIndex + intensityIndex) % 3 === 0,
  })));
  const selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents, storage });
  const firstBatch = states.slice(0, 15).map((state) => selector.select(state, { firstResponse: state.firstResponse }));
  const restoredSelector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents, storage });
  const secondBatch = states.slice(15, 30).map((state) => restoredSelector.select(state, { firstResponse: state.firstResponse }));
  const selected = [...firstBatch, ...secondBatch];
  assert.equal(selected.length, 30);
  assert.ok(selected.every((item, index) => index === 0 || item.content.id !== selected[index - 1].content.id));
  assert.ok(selected.every((item, index) => index === 0 || normalizeText(item.content.finalText) !== normalizeText(selected[index - 1].content.finalText)));
  assert.equal(restoredSelector.getRecentSelections().length, 30);
});

test('rotação percorre conteúdo exato e limita autor a duas aparições em cinco', () => {
  const storage = createMemoryStorage();
  const contents = [
    { id: 'a1', finalText: 'Texto um', displayedAuthor: 'Autor A', author: 'Autor A', associations: [{ feeling: 'medo', placement: 'nucleo' }], publicationEnabled: true, status: 'ATIVO_NUCLEO', suitableIntensities: ['moderada'], placement: 'nucleo', hardExclusions: [] },
    { id: 'a2', finalText: 'Texto dois', displayedAuthor: 'Autor A', author: 'Autor A', associations: [{ feeling: 'medo', placement: 'nucleo' }], publicationEnabled: true, status: 'ATIVO_NUCLEO', suitableIntensities: ['moderada'], placement: 'nucleo', hardExclusions: [] },
    { id: 'b1', finalText: 'Texto três', displayedAuthor: 'Autor B', author: 'Autor B', associations: [{ feeling: 'medo', placement: 'nucleo' }], publicationEnabled: true, status: 'ATIVO_NUCLEO', suitableIntensities: ['moderada'], placement: 'nucleo', hardExclusions: [] },
  ];
  const state = { primaryFeeling: 'medo', secondaryFeelings: [], intensity: 'moderada' };
  const selector = engine.createSelector({ version: 'teste-recencia', contents, storage });
  const selected = Array.from({ length: 3 }, () => selector.select(state, { firstResponse: false }));
  assert.equal(new Set(selected.map((item) => item.content.id)).size, 3);
  assert.equal(new Set(selected.map((item) => item.content.finalText)).size, 3);
  const authorCounts = selected.reduce((counts, item) => {
    const author = item.content.displayedAuthor;
    counts.set(author, (counts.get(author) || 0) + 1);
    return counts;
  }, new Map());
  assert.ok([...authorCounts.values()].every((count) => count <= 2));
});

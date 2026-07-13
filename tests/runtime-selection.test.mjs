import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { REQUIRED_INSECURITY_IDS, buildFromFiles } from '../scripts/content-build-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { runtime } = buildFromFiles({ rootDir, write: false });
await import(pathToFileURL(path.join(rootDir, 'js', 'core', 'runtime-engine.js')).href);
const engine = globalThis.EntreSabiosRuntimeEngine;

test('126 cenários respeitam hierarquia, intensidade, gênero e exclusões', () => {
  let scenarios = 0;
  for (const feeling of runtime.feelings.map((item) => item.id)) {
    for (const intensity of ['fraca', 'moderada', 'intensa']) {
      for (const genderPreference of ['any', 'male', 'female']) {
        scenarios += 1;
        const state = { primaryFeeling: feeling, secondaryFeelings: [], intensity };
        const selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents });
        const inspection = selector.inspect(state, { genderPreference, firstResponse: false });
        assert.ok(inspection.eligibleAtLevel.length > 0, `${feeling}/${intensity}/${genderPreference} sem cobertura`);
        assert.ok(inspection.ranked.every((candidate) => candidate.content.suitableIntensities.includes(intensity)));
        assert.ok(inspection.ranked.every((candidate) => candidate.content.publicationEnabled));
        assert.ok(inspection.ranked.every((candidate) => !['REMOVIDO', 'MOVER_PARA_TEXTOS'].includes(candidate.content.status)));
        assert.ok(inspection.ranked.every((candidate, index, list) => index === 0 || list[index - 1].level <= candidate.level));
        const neutralAtBestLevel = inspection.ranked.filter((candidate) => candidate.level === inspection.bestLevel && candidate.content.filterGender === 'neutral');
        if (neutralAtBestLevel.length) assert.ok(neutralAtBestLevel.every((candidate) => inspection.eligibleAtLevel.some((item) => item.content.id === candidate.content.id)));
        const selected = selector.select(state, { genderPreference, firstResponse: false });
        assert.equal(selected.level, inspection.bestLevel);
        assert.ok(runtime.contents.some((content) => content.id === selected.content.id));
      }
    }
  }
  assert.equal(scenarios, 126);
});

test('hardExclusions respeitam primeira resposta e intensidade intensa', () => {
  const states = [
    { primaryFeeling: 'luto', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'raiva', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'medo', secondaryFeelings: [], intensity: 'intensa' },
  ];
  for (const state of states) {
    const ranked = engine.rankEligibleContents(runtime.contents, state, { genderPreference: 'any', firstResponse: true });
    const signals = new Set(engine.getContextSignals(state, true));
    assert.ok(ranked.every(({ content }) => !content.hardExclusions.some((item) => signals.has(item))));
  }
});

test('Insegurança fraca percorre nove núcleos antes de repetir', () => {
  const state = { primaryFeeling: 'inseguranca', secondaryFeelings: [], intensity: 'fraca' };
  const selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents });
  const inspection = selector.inspect(state, { genderPreference: 'any', firstResponse: false });
  assert.equal(inspection.bestLevel, 1);
  assert.equal(inspection.eligibleAtLevel.length, 9);
  const selected = Array.from({ length: 9 }, () => selector.select(state, { genderPreference: 'any', firstResponse: false }));
  assert.ok(selected.every((item) => item.level === 1 && !item.fallback));
  assert.deepEqual([...new Set(selected.map((item) => item.content.id))].sort(), [...REQUIRED_INSECURITY_IDS].sort());
});

test('transição da primeira resposta não repete imediatamente e percorre o ciclo', () => {
  const state = { primaryFeeling: 'inseguranca', secondaryFeelings: [], intensity: 'fraca' };
  const selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents });
  const selected = [selector.select(state, { genderPreference: 'any', firstResponse: true })];
  for (let index = 1; index < 9; index += 1) selected.push(selector.select(state, { genderPreference: 'any', firstResponse: false }));
  assert.equal(new Set(selected.map((item) => item.content.id)).size, 9);
  assert.notEqual(selected[0].content.id, selected[1].content.id);
});

test('Insegurança intensa usa somente compatíveis e mantém núcleo antes de contextual', () => {
  const state = { primaryFeeling: 'inseguranca', secondaryFeelings: [], intensity: 'intensa' };
  const selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents });
  const inspection = selector.inspect(state, { genderPreference: 'any', firstResponse: false });
  assert.equal(inspection.bestLevel, 1);
  assert.ok(inspection.eligibleAtLevel.every(({ content }) => content.suitableIntensities.includes('intensa')));
});

test('gênero só altera a ordem dentro do mesmo nível', () => {
  const state = { primaryFeeling: 'amor', secondaryFeelings: [], intensity: 'moderada' };
  for (const genderPreference of ['male', 'female', 'neutral']) {
    const ranked = engine.rankEligibleContents(runtime.contents, state, { genderPreference, firstResponse: false });
    const minLevel = Math.min(...ranked.map((candidate) => candidate.level));
    assert.equal(ranked[0].level, minLevel);
    assert.ok(ranked.filter((candidate) => candidate.level === minLevel && candidate.content.filterGender === 'neutral').every((candidate) => ranked.some((item) => item.content.id === candidate.content.id)));
  }
});

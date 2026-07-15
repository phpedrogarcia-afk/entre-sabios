import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { buildFromFiles } from '../scripts/content-build-lib.mjs';

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
]) {
  vm.runInContext(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'), sandbox, { filename: relativePath });
}

const { runtime } = buildFromFiles({ rootDir, write: false });
const synthesisCatalog = sandbox.window.EntreSabiosData.emotionalSyntheses;
const synthesisResolver = sandbox.window.EntreSabiosEmotionalSynthesis.createResolver(synthesisCatalog);
const synthesisAdapter = sandbox.window.EntreSabiosSynthesisRankingAdapter.createAdapter({
  catalog: synthesisCatalog,
  resolver: synthesisResolver,
});
const motivationAdapter = sandbox.window.EntreSabiosMotivationRankingAdapter.createAdapter(
  sandbox.window.EntreSabiosData.motivationProfiles
);
const engine = sandbox.window.EntreSabiosRuntimeEngine;

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function createSelector(version, storage = null, contents = runtime.contents) {
  return engine.createSelector({
    version, contents, storage, synthesisAdapter, motivationAdapter,
  });
}

function makeContent(id, {
  editorialFunction = 'contemplation', tone = 'contemplativo', themes = [],
  format = 'frase', author = `Autor ${id}`,
} = {}) {
  return {
    id,
    publicationEnabled: true,
    status: 'ATIVO_NUCLEO',
    suitableIntensities: ['moderada'],
    hardExclusions: [],
    riskTags: [],
    finalText: `Texto seguro ${id}`,
    displayedAuthor: author,
    author,
    displayType: format,
    editorialFunction,
    tone,
    placement: 'nucleo',
    themes,
    associations: [{ feeling: 'tristeza', placement: 'nucleo' }],
  };
}

test('síntese e motivação não reduzem a elegibilidade em sentimentos, intensidades ou secundários', () => {
  const feelings = runtime.feelings.map(({ id }) => id);
  let scenarios = 0;

  for (const primaryFeeling of feelings) {
    const secondaryFeelings = feelings.filter((feeling) => feeling !== primaryFeeling).slice(0, 2);
    for (const intensity of ['fraca', 'moderada', 'intensa']) {
      for (const needsMotivation of [false, true]) {
        scenarios += 1;
        const state = { primaryFeeling, secondaryFeelings, intensity, needsMotivation };
        const baseline = engine.rankEligibleContents(runtime.contents, state, { firstResponse: false });
        const integrated = engine.rankEligibleContents(runtime.contents, state, {
          firstResponse: false, synthesisAdapter, motivationAdapter,
        });
        assert.deepEqual(
          integrated.map(({ content }) => content.id).sort(),
          baseline.map(({ content }) => content.id).sort(),
          `${primaryFeeling}:${intensity}:motivação=${needsMotivation} estreitou o conjunto`,
        );
        assert.equal(integrated[0]?.level, baseline[0]?.level);
      }
    }
  }

  assert.equal(scenarios, feelings.length * 3 * 2);
});

test('Outra perspectiva percorre o conjunto antes de repetir mesmo com motivação alternada e reload', () => {
  const storage = createMemoryStorage();
  const baseState = {
    primaryFeeling: 'autoconhecimento',
    secondaryFeelings: ['confusao', 'inseguranca'],
    intensity: 'moderada',
  };
  let selector = createSelector('phase9-full-cycle', storage);
  const inspection = selector.inspect({ ...baseState, needsMotivation: false }, { firstResponse: false });
  const bestLevelTexts = new Set(inspection.eligibleAtLevel.map(({ content }) => normalizeText(content.finalText)));
  const primaryTexts = new Set(inspection.ranked
    .filter(({ level }) => level === inspection.bestLevel || (inspection.bestLevel === 1 && level === 2))
    .map(({ content }) => normalizeText(content.finalText)));
  const selectedTexts = [];
  const selectedLevels = [];

  for (let index = 0; index < primaryTexts.size; index += 1) {
    if (index === Math.floor(primaryTexts.size / 2)) {
      selector = createSelector('phase9-full-cycle', storage);
    }
    const result = selector.select({ ...baseState, needsMotivation: index % 2 === 1 }, { firstResponse: false });
    selectedTexts.push(normalizeText(result.content.finalText));
    selectedLevels.push(result.level);
  }

  assert.equal(new Set(selectedTexts).size, primaryTexts.size);
  assert.ok(selectedTexts.every((text) => primaryTexts.has(text)));
  assert.ok(selectedLevels.slice(0, bestLevelTexts.size).every((level) => level === inspection.bestLevel));
  const afterCycle = selector.select({ ...baseState, needsMotivation: true }, { firstResponse: false });
  assert.ok(primaryTexts.has(normalizeText(afterCycle.content.finalText)));
});

test('120 transições preservam principal, segurança, histórico global e evitam sequência excessiva de autor', () => {
  const storage = createMemoryStorage();
  const states = [
    ['autoconhecimento', ['confusao', 'inseguranca'], 'moderada'],
    ['confusao', ['inseguranca', 'autoconhecimento'], 'fraca'],
    ['luto', ['saudade'], 'intensa'],
    ['saudade', ['luto'], 'moderada'],
    ['tristeza', ['solidao'], 'intensa'],
    ['ansiedade', ['medo'], 'moderada'],
    ['inseguranca', ['autoconhecimento'], 'moderada'],
  ];
  let selector = createSelector('phase9-mixed-transitions', storage);
  const selections = [];

  for (let index = 0; index < 120; index += 1) {
    if (index === 60) selector = createSelector('phase9-mixed-transitions', storage);
    const [primaryFeeling, secondaryFeelings, intensity] = states[index % states.length];
    const state = { primaryFeeling, secondaryFeelings, intensity, needsMotivation: index % 3 === 1 };
    const result = selector.select(state, { firstResponse: index < states.length });
    assert.ok(result.level <= 2, `${primaryFeeling}:${intensity} perdeu o foco principal`);
    assert.equal(engine.classifyEditorialEffects(result.content, state, {
      firstResponse: index < states.length,
    }).safe, true);
    const current = {
      id: result.content.id,
      text: normalizeText(result.content.finalText),
      author: result.content.displayedAuthor || result.content.author,
    };
    const previous = selections.at(-1);
    if (result.eligibleAtLevel > 1) {
      assert.notEqual(current.id, previous?.id, `repetição imediata em ${index}`);
      assert.notEqual(current.text, previous?.text, `texto repetido imediatamente em ${index}`);
    }
    selections.push(current);
  }

  let excessiveAuthorRuns = 0;
  for (let index = 2; index < selections.length; index += 1) {
    if (selections[index].author === selections[index - 1].author
      && selections[index].author === selections[index - 2].author) excessiveAuthorRuns += 1;
  }
  assert.equal(excessiveAuthorRuns, 0);
  assert.equal(selector.getRecentSelections().length, 120);
});

test('trajetória, autoria e formatos continuam atuando depois dos novos desempates', () => {
  const trajectoryContents = [
    makeContent('action', {
      editorialFunction: 'action', tone: 'acolhedor', themes: ['tristeza', 'continuidade'],
    }),
    makeContent('recognition', { editorialFunction: 'recognition', tone: 'acolhedor', themes: ['tristeza'] }),
    makeContent('reframing', { editorialFunction: 'reframing', tone: 'acolhedor', themes: ['tristeza'] }),
    makeContent('clarification', { editorialFunction: 'clarification', tone: 'analitico' }),
  ];
  const state = {
    primaryFeeling: 'tristeza', secondaryFeelings: [], intensity: 'moderada', needsMotivation: true,
  };
  const trajectorySelector = createSelector('phase9-trajectory', createMemoryStorage(), trajectoryContents);
  const first = trajectorySelector.select(state, { firstResponse: true });
  const second = trajectorySelector.select(state, { firstResponse: false });
  assert.equal(first.content.editorialFunction, 'recognition');
  assert.notEqual(second.content.editorialFunction, 'action');

  const diverseContents = Array.from({ length: 10 }, (_, index) => makeContent(`diverse-${index + 1}`, {
    author: `Autor ${(index % 5) + 1}`,
    format: ['microtexto', 'reflexao_curta', 'citacao_longa'][index] || 'frase',
    themes: index % 2 === 0 ? ['tristeza', 'continuidade'] : [],
  }));
  const diversitySelector = createSelector('phase9-diversity', null, diverseContents);
  const cycle = Array.from({ length: diverseContents.length }, (_, index) => diversitySelector.select({
    ...state, needsMotivation: index % 2 === 0,
  }, { firstResponse: index === 0 }).content);
  assert.equal(new Set(cycle.map(({ id }) => id)).size, diverseContents.length);
  assert.deepEqual(
    [...new Set(cycle.map(({ displayType }) => displayType))].sort(),
    ['citacao_longa', 'frase', 'microtexto', 'reflexao_curta'],
  );
  for (let index = 4; index < cycle.length; index += 1) {
    const counts = cycle.slice(index - 4, index + 1).reduce((map, content) => {
      const author = content.displayedAuthor;
      map.set(author, (map.get(author) || 0) + 1);
      return map;
    }, new Map());
    assert.ok([...counts.values()].every((count) => count <= 2));
  }
});

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL, fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'entre_sabios_runtime.json'), 'utf8'));
const baseline = JSON.parse(fs.readFileSync(path.join(rootDir, 'tests', 'fixtures', 'auditoria_comportamental_baseline.json'), 'utf8'));
await import(pathToFileURL(path.join(rootDir, 'js', 'core', 'runtime-engine.js')).href);
const engine = globalThis.EntreSabiosRuntimeEngine;

const SUPPORT_FUNCTIONS = new Set(['recognition', 'presence', 'contemplation']);
const DEVELOPED_FORMATS = new Set(['microtexto', 'reflexao_curta', 'citacao_longa']);

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

function makeContent(id, {
  feelings = ['tristeza'],
  secondaryFeelings = [],
  format = 'frase',
  editorialFunction = 'contemplation',
  tone = 'contemplativo',
  author = `Autor ${id}`,
  text = `Texto ${id}`,
  riskTags = [],
  hardExclusions = [],
} = {}) {
  return {
    id,
    finalText: text,
    displayedAuthor: author,
    author,
    displayType: format,
    editorialFunction,
    tone,
    themes: [],
    riskTags,
    hardExclusions,
    suitableIntensities: ['fraca', 'moderada', 'intensa'],
    associations: [
      ...feelings.map((feeling) => ({ feeling, placement: 'nucleo' })),
      ...secondaryFeelings.map((feeling) => ({ feeling, placement: 'contextual' })),
    ],
    placement: 'nucleo',
    status: 'ATIVO_NUCLEO',
    publicationEnabled: true,
  };
}

function selectMany(selector, state, count, firstOnly = true) {
  return Array.from({ length: count }, (_, index) => selector.select(state, { firstResponse: firstOnly ? index === 0 : true }));
}

test('baseline protege o acervo congelado por hash e versão', () => {
  const master = fs.readFileSync(path.join(rootDir, 'entre_sabios_acervo_mestre_final.json'));
  assert.equal(crypto.createHash('sha256').update(master).digest('hex'), baseline.masterSha256);
  assert.equal(runtime.contentVersion, baseline.contentVersion);
  assert.equal(runtime.contents.length, baseline.activeContents);
});

test('nível emocional superior nunca é abandonado para satisfazer diversidade ou recência', () => {
  for (const feeling of runtime.feelings.map((item) => item.id)) {
    for (const intensity of ['fraca', 'moderada', 'intensa']) {
      const state = { primaryFeeling: feeling, secondaryFeelings: [], intensity };
      const selector = engine.createSelector({ version: `hierarquia-${feeling}-${intensity}`, contents: runtime.contents });
      const bestLevel = selector.inspect(state, { firstResponse: false }).bestLevel;
      const results = selectMany(selector, state, 100);
      assert.ok(results.every((result) => result.level === bestLevel), `${feeling}:${intensity} saiu do nível ${bestLevel}`);
    }
  }
});

test('sentimento secundário refina candidatos dentro do mesmo nível sem superar o principal', () => {
  const contents = [
    makeContent('plain'),
    makeContent('dual', { secondaryFeelings: ['inseguranca'] }),
  ];
  const state = { primaryFeeling: 'tristeza', secondaryFeelings: ['inseguranca'], intensity: 'moderada' };
  const selector = engine.createSelector({ version: 'secondary-refinement', contents });
  const result = selector.select(state, { firstResponse: false });
  assert.equal(result.level, 1);
  assert.equal(result.content.id, 'dual');
});

test('todos os pares ordenados preservam o principal nas três intensidades', () => {
  const feelings = runtime.feelings.map((item) => item.id);
  let scenarios = 0;
  for (const primaryFeeling of feelings) {
    for (const secondaryFeeling of feelings) {
      if (primaryFeeling === secondaryFeeling) continue;
      for (const intensity of ['fraca', 'moderada', 'intensa']) {
        scenarios += 1;
        const state = { primaryFeeling, secondaryFeelings: [secondaryFeeling], intensity };
        const selector = engine.createSelector({ version: `pair-${primaryFeeling}-${secondaryFeeling}-${intensity}`, contents: runtime.contents });
        const result = selector.select(state, { firstResponse: true });
        assert.ok(result.level <= 2, `${primaryFeeling}+${secondaryFeeling}:${intensity} selecionou nível ${result.level}`);
        assert.ok(result.content.associations.some((association) => association.feeling === primaryFeeling
          && ['nucleo', 'contextual'].includes(association.placement)));
      }
    }
  }
  assert.equal(scenarios, 546);
});

test('inverter tristeza e insegurança altera o centro sem apagar o histórico global', () => {
  const storage = createMemoryStorage();
  const selector = engine.createSelector({ version: 'primary-inversion', contents: runtime.contents, storage });
  const sadness = { primaryFeeling: 'tristeza', secondaryFeelings: ['inseguranca'], intensity: 'moderada' };
  const insecurity = { primaryFeeling: 'inseguranca', secondaryFeelings: ['tristeza'], intensity: 'moderada' };
  const first = selector.select(sadness, { firstResponse: true });
  const second = selector.select(insecurity, { firstResponse: true });
  assert.ok(first.level <= 2 && second.level <= 2);
  assert.ok(first.content.associations.some((item) => item.feeling === 'tristeza' && ['nucleo', 'contextual'].includes(item.placement)));
  assert.ok(second.content.associations.some((item) => item.feeling === 'inseguranca' && ['nucleo', 'contextual'].includes(item.placement)));
  assert.notEqual(first.content.id, second.content.id);
  assert.equal(selector.getRecentSelections().length, 2);
});

test('cem primeiras respostas de luto por intensidade permanecem em núcleo acolhedor', () => {
  for (const intensity of ['fraca', 'moderada', 'intensa']) {
    const state = { primaryFeeling: 'luto', secondaryFeelings: [], intensity };
    const selector = engine.createSelector({ version: `grief-first-${intensity}`, contents: runtime.contents });
    const results = selectMany(selector, state, 100, false);
    assert.equal(results.length, 100);
    assert.ok(results.every((result) => result.level === 1));
    assert.ok(results.every(({ content }) => SUPPORT_FUNCTIONS.has(content.editorialFunction)));
    assert.ok(results.every(({ content }) => content.editorialFunction !== 'confrontation' && content.tone !== 'ironico'));
  }
});

test('sequência de luto mantém pelo menos 75% de apoio e não antecipa confronto ou ação', () => {
  for (const intensity of ['fraca', 'moderada', 'intensa']) {
    const state = { primaryFeeling: 'luto', secondaryFeelings: [], intensity };
    const selector = engine.createSelector({ version: `grief-sequence-${intensity}`, contents: runtime.contents });
    const results = selectMany(selector, state, 100);
    const supportive = results.filter(({ content }) => SUPPORT_FUNCTIONS.has(content.editorialFunction)).length;
    assert.ok(supportive / results.length >= 0.75, `${intensity}: apoio em ${supportive}%`);
    assert.ok(results.every(({ content }) => content.editorialFunction !== 'confrontation'));
    if (intensity === 'intensa') assert.ok(results.every(({ content }) => content.editorialFunction !== 'action'));
    assert.ok(results.every(({ content }) => content.tone !== 'ironico'));
  }
});

test('trajetória usa reconhecimento antes de reframing ou ação no mesmo nível', () => {
  const contents = [
    makeContent('action', { editorialFunction: 'action', tone: 'direto' }),
    makeContent('recognition', { editorialFunction: 'recognition', tone: 'acolhedor' }),
    makeContent('reframing', { editorialFunction: 'reframing', tone: 'analitico' }),
    makeContent('clarification', { editorialFunction: 'clarification', tone: 'analitico' }),
  ];
  const state = { primaryFeeling: 'tristeza', secondaryFeelings: [], intensity: 'intensa' };
  const selector = engine.createSelector({ version: 'trajectory', contents, storage: createMemoryStorage() });
  const first = selector.select(state, { firstResponse: true });
  const second = selector.select(state, { firstResponse: false });
  assert.equal(first.content.editorialFunction, 'recognition');
  assert.notEqual(second.content.editorialFunction, 'action');
});

test('cadência flexível mantém 20% a 30% de formatos desenvolvidos quando há três compatíveis', () => {
  const contents = [
    ...Array.from({ length: 7 }, (_, index) => makeContent(`quote-${index + 1}`)),
    ...Array.from({ length: 3 }, (_, index) => makeContent(`text-${index + 1}`, {
      format: index === 0 ? 'microtexto' : 'reflexao_curta',
    })),
  ];
  const state = { primaryFeeling: 'tristeza', secondaryFeelings: [], intensity: 'moderada' };
  const selector = engine.createSelector({ version: 'format-cadence', contents });
  const results = selectMany(selector, state, 100).map((result) => result.content);
  const developed = results.filter((content) => DEVELOPED_FORMATS.has(content.displayType)).length;
  assert.ok(developed / results.length >= 0.20 && developed / results.length <= 0.30, `frequência=${developed}%`);
  assert.ok(results.every((content, index) => index === 0
    || !(DEVELOPED_FORMATS.has(content.displayType) && DEVELOPED_FORMATS.has(results[index - 1].displayType))));
  assert.ok(results.every((content) => content.associations.some((item) => item.feeling === 'tristeza' && item.placement === 'nucleo')));
});

test('efeito editorial bloqueia crenças prejudiciais artificiais sem inserir casos no acervo', () => {
  const cases = [
    makeContent('incapacity', { text: 'Sua insegurança prova que você é incapaz.' }),
    makeContent('revenge', { feelings: ['raiva'], text: 'A vingança é justa: faça todos pagarem.' }),
    makeContent('isolation', { feelings: ['solidao'], text: 'Afaste-se de todos; sozinho é sempre melhor.' }),
    makeContent('hopeless', { text: 'Não há esperança e nada pode mudar.' }),
    makeContent('grief-pressure', { feelings: ['luto'], text: 'Você precisa superar e seguir em frente agora.' }),
  ];
  const states = [
    { primaryFeeling: 'inseguranca', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'raiva', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'solidao', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'tristeza', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'luto', secondaryFeelings: [], intensity: 'intensa' },
  ];
  cases.forEach((content, index) => {
    const effects = engine.classifyEditorialEffects(content, states[index]);
    assert.equal(effects.safe, false, `${content.id} não foi bloqueado`);
    assert.ok(effects.tags.length > 0);
  });
});

test('conteúdos selecionáveis nos sentimentos vulneráveis passam pela camada de efeito', () => {
  const feelings = ['luto', 'tristeza', 'inseguranca', 'culpa', 'ansiedade', 'falta_de_proposito', 'raiva', 'solidao'];
  for (const primaryFeeling of feelings) {
    for (const intensity of ['fraca', 'moderada', 'intensa']) {
      const state = { primaryFeeling, secondaryFeelings: [], intensity };
      const ranked = engine.rankEligibleContents(runtime.contents, state, { firstResponse: true });
      assert.ok(ranked.length > 0);
      assert.ok(ranked.every(({ content }) => engine.classifyEditorialEffects(content, state, { firstResponse: true }).safe));
    }
  }
});

test('cem transições consultam histórico global antes da escolha e sobrevivem à recarga', () => {
  const storage = createMemoryStorage();
  const states = [
    { primaryFeeling: 'tristeza', secondaryFeelings: [], intensity: 'moderada' },
    { primaryFeeling: 'tristeza', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'tristeza', secondaryFeelings: ['inseguranca'], intensity: 'intensa' },
    { primaryFeeling: 'tristeza', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'inseguranca', secondaryFeelings: ['tristeza'], intensity: 'intensa' },
    { primaryFeeling: 'tristeza', secondaryFeelings: ['inseguranca'], intensity: 'intensa' },
  ];
  let selector = engine.createSelector({ version: 'transition-history', contents: runtime.contents, storage });
  const selected = [];
  for (let index = 0; index < 100; index += 1) {
    if (index === 50) selector = engine.createSelector({ version: 'transition-history', contents: runtime.contents, storage });
    const state = states[Math.floor(index / 10) % states.length];
    const firstResponse = index % 10 === 0;
    const inspection = selector.inspect(state, { firstResponse });
    const recent = selected.slice(-12);
    const safeAlternatives = inspection.eligibleAtLevel.filter(({ content }) => !recent.some((item) => item.id === content.id
      || item.textKey === normalizeText(content.finalText)));
    const result = selector.select(state, { firstResponse });
    const current = { id: result.content.id, textKey: normalizeText(result.content.finalText) };
    if (safeAlternatives.length) {
      assert.ok(!recent.some((item) => item.id === current.id || item.textKey === current.textKey));
    }
    assert.ok(index === 0 || selected[index - 1].id !== current.id);
    selected.push(current);
  }
  assert.equal(selector.getRecentSelections().length, 100);
});

test('autor não aparece mais de duas vezes em cinco quando há alternativas equivalentes', () => {
  const contents = Array.from({ length: 10 }, (_, index) => makeContent(`author-${index + 1}`, {
    author: `Autor ${(index % 5) + 1}`,
  }));
  const state = { primaryFeeling: 'tristeza', secondaryFeelings: [], intensity: 'moderada' };
  const selector = engine.createSelector({ version: 'author-diversity', contents });
  const authors = selectMany(selector, state, 100).map(({ content }) => content.displayedAuthor);
  for (let index = 4; index < authors.length; index += 1) {
    const counts = authors.slice(index - 4, index + 1).reduce((map, author) => map.set(author, (map.get(author) || 0) + 1), new Map());
    assert.ok([...counts.values()].every((count) => count <= 2));
  }
  assert.ok(authors.every((author, index) => index < 2 || author !== authors[index - 1] || author !== authors[index - 2]));
});

test('histórico por contexto retoma a fila após recarga sem perder bloqueio global', () => {
  const storage = createMemoryStorage();
  const stateA = { primaryFeeling: 'tristeza', secondaryFeelings: ['inseguranca'], intensity: 'moderada' };
  const stateB = { primaryFeeling: 'inseguranca', secondaryFeelings: ['tristeza'], intensity: 'intensa' };
  let selector = engine.createSelector({ version: 'persistent-contexts', contents: runtime.contents, storage });
  const firstA = selectMany(selector, stateA, 6).map((result) => result.content.id);
  selectMany(selector, stateB, 6);
  selector = engine.createSelector({ version: 'persistent-contexts', contents: runtime.contents, storage });
  const resumedA = selectMany(selector, stateA, 6).map((result) => result.content.id);
  const eligibleAtLevel = selector.inspect(stateA, { firstResponse: false }).eligibleAtLevel.length;
  assert.equal(new Set([...firstA, ...resumedA]).size, Math.min(12, eligibleAtLevel));
  assert.equal(new Set([...firstA, ...resumedA].slice(0, eligibleAtLevel)).size, eligibleAtLevel);
  assert.ok(selector.getRecentSelections().length >= 18);
});

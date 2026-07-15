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

const mandatoryScenarios = [
  ['inseguranca', [], 'moderada'],
  ['falta_de_proposito', [], 'moderada'],
  ['falta_de_proposito', [], 'intensa'],
  ['tristeza', [], 'intensa'],
  ['luto', [], 'intensa'],
  ['ansiedade', [], 'intensa'],
  ['raiva', [], 'moderada'],
  ['autoconhecimento', ['confusao', 'inseguranca'], 'moderada'],
];

function state(primaryFeeling, secondaryFeelings = [], intensity = 'moderada', needsMotivation = false) {
  return { primaryFeeling, secondaryFeelings, intensity, needsMotivation };
}

function rank(currentState) {
  return engine.rankEligibleContents(runtime.contents, currentState, {
    firstResponse: true,
    synthesisAdapter,
    motivationAdapter,
  });
}

function makeContent(id, {
  primary = 'inseguranca', placement = 'nucleo', themes = [], editorialFunction = 'contemplation',
  tone = 'poetico', intensity = 'moderada', status = 'ATIVO_NUCLEO', risks = [],
} = {}) {
  return {
    id,
    publicationEnabled: true,
    status,
    suitableIntensities: [intensity],
    hardExclusions: [],
    riskTags: risks,
    finalText: `Texto seguro ${id}`,
    displayedAuthor: `Autor ${id}`,
    author: `Autor ${id}`,
    displayType: 'frase',
    editorialFunction,
    tone,
    placement: placement === 'geral' ? 'geral' : 'nucleo',
    themes,
    associations: placement === 'geral' ? [] : [{ feeling: primary, placement }],
  };
}

test('oito cenários reais preservam elegibilidade, nível, segurança e foco principal com motivação ligada', () => {
  for (const [primaryFeeling, secondaryFeelings, intensity] of mandatoryScenarios) {
    const off = rank(state(primaryFeeling, secondaryFeelings, intensity, false));
    const on = rank(state(primaryFeeling, secondaryFeelings, intensity, true));
    assert.ok(on.length > 0, `${primaryFeeling}:${intensity} sem candidatos`);
    assert.deepEqual(
      on.map(({ content }) => content.id).sort(),
      off.map(({ content }) => content.id).sort(),
      `${primaryFeeling}:${intensity} alterou elegibilidade`,
    );
    assert.equal(on[0].level, off[0].level, `${primaryFeeling}:${intensity} alterou o melhor nível`);
    assert.ok(on[0].content.associations.some((association) => (
      association.feeling === primaryFeeling && ['nucleo', 'contextual'].includes(association.placement)
    )));
    for (const candidate of on) {
      const previous = off.find(({ content }) => content.id === candidate.content.id);
      assert.equal(candidate.level, previous.level);
      assert.ok(candidate.content.suitableIntensities.includes(intensity));
      assert.equal(engine.classifyEditorialEffects(candidate.content, state(primaryFeeling, secondaryFeelings, intensity, true), {
        firstResponse: true,
      }).safe, true);
    }
  }
});

test('desligada, a motivação é neutra e preserva exatamente o ranking da síntese', () => {
  const currentState = state('autoconhecimento', ['confusao', 'inseguranca'], 'moderada', false);
  const synthesisOnly = engine.rankEligibleContents(runtime.contents, currentState, { synthesisAdapter });
  const withDisabledMotivation = engine.rankEligibleContents(runtime.contents, currentState, {
    synthesisAdapter,
    motivationAdapter,
  });
  assert.deepEqual(
    withDisabledMotivation.map(({ content, level }) => [content.id, level]),
    synthesisOnly.map(({ content, level }) => [content.id, level]),
  );
  assert.ok(withDisabledMotivation.every(({ motivationCompatibility }) => (
    motivationCompatibility.reason === 'motivation_disabled'
  )));
});

test('preferência exige duas dimensões independentes e não depende de palavras do texto', () => {
  const context = motivationAdapter.resolveState(state('inseguranca', [], 'moderada', true));
  const weak = motivationAdapter.evaluate(makeContent('weak', {
    themes: ['inseguranca'], editorialFunction: 'contemplation', tone: 'poetico',
  }), context);
  const strong = motivationAdapter.evaluate(makeContent('strong', {
    themes: ['inseguranca'], editorialFunction: 'clarification', tone: 'poetico',
  }), context);
  assert.equal(weak.strongMatch, false);
  assert.deepEqual(Array.from(weak.vector), [0, 0, 0]);
  assert.equal(strong.strongMatch, true);
  assert.deepEqual(Array.from(strong.vector), [1, 1, 0]);
});

test('conteúdo geral motivacional não supera candidato adequado ao principal', () => {
  const primary = makeContent('primary-safe', { themes: ['tempo'] });
  const genericMotivational = makeContent('generic-motivational', {
    placement: 'geral', themes: ['inseguranca'], editorialFunction: 'clarification', tone: 'acolhedor',
  });
  const ranked = engine.rankEligibleContents([genericMotivational, primary], state('inseguranca', [], 'moderada', true), {
    motivationAdapter,
  });
  assert.equal(ranked[0].content.id, 'primary-safe');
  assert.equal(ranked[0].level, 1);
  assert.equal(ranked[1].level, 5);
  const inspection = engine.createSelector({
    version: 'generic-below-primary', contents: [genericMotivational, primary], motivationAdapter,
  }).inspect(state('inseguranca', [], 'moderada', true));
  assert.equal(inspection.motivationFallback, true);
});

test('segurança e intensidade removem candidatos antes da preferência motivacional', () => {
  const safe = makeContent('safe', {
    themes: ['inseguranca'], editorialFunction: 'clarification', tone: 'acolhedor',
  });
  const unsafe = makeContent('unsafe', {
    themes: ['inseguranca'], editorialFunction: 'clarification', tone: 'acolhedor', risks: ['invalidacao_emocional'],
  });
  const wrongIntensity = makeContent('wrong-intensity', {
    themes: ['inseguranca'], editorialFunction: 'clarification', tone: 'acolhedor', intensity: 'fraca',
  });
  const ranked = engine.rankEligibleContents([unsafe, wrongIntensity, safe], state('inseguranca', [], 'moderada', true), {
    motivationAdapter,
  });
  assert.deepEqual(ranked.map(({ content }) => content.id), ['safe']);
});

test('síntese permanece anterior à motivação no desempate', () => {
  const synthesisMatch = makeContent('synthesis-match', {
    primary: 'amor', themes: ['vinculo'], editorialFunction: 'contemplation', tone: 'poetico',
  });
  synthesisMatch.associations.push({ feeling: 'medo', placement: 'contextual' });
  const motivationMatch = makeContent('motivation-match', {
    primary: 'amor', themes: ['esperanca'], editorialFunction: 'reframing', tone: 'acolhedor',
  });
  motivationMatch.associations.push({ feeling: 'medo', placement: 'contextual' });
  const ranked = engine.rankEligibleContents(
    [motivationMatch, synthesisMatch],
    state('amor', ['medo'], 'moderada', true),
    { synthesisAdapter, motivationAdapter },
  );
  assert.equal(ranked[0].content.id, 'synthesis-match');
});

test('combinação com poucos candidatos usa fallback normal quando não há sinal forte', () => {
  const contents = [
    makeContent('few-a', { themes: ['tempo'], editorialFunction: 'contemplation', tone: 'poetico' }),
    makeContent('few-b', { themes: ['silencio'], editorialFunction: 'contemplation', tone: 'poetico' }),
  ];
  const offSelector = engine.createSelector({ version: 'few-off', contents, motivationAdapter });
  const onSelector = engine.createSelector({ version: 'few-on', contents, motivationAdapter });
  const offInspection = offSelector.inspect(state('inseguranca', [], 'moderada', false));
  const onInspection = onSelector.inspect(state('inseguranca', [], 'moderada', true));
  assert.deepEqual(
    onInspection.ranked.map(({ content }) => content.id),
    offInspection.ranked.map(({ content }) => content.id),
  );
  assert.equal(onInspection.motivationFallback, true);
  assert.equal(onSelector.select(state('inseguranca', [], 'moderada', true)).motivationFallback, true);
});

test('alternar motivação reordena a fila restante sem apagar histórico ou repetir imediatamente', () => {
  const contents = [
    makeContent('toggle-neutral-a', { themes: ['tempo'], editorialFunction: 'clarification', tone: 'poetico' }),
    makeContent('toggle-strong', { themes: ['inseguranca'], editorialFunction: 'clarification', tone: 'poetico' }),
    makeContent('toggle-neutral-b', { themes: ['silencio'], editorialFunction: 'clarification', tone: 'poetico' }),
  ];
  const selector = engine.createSelector({ version: 'toggle-direction', contents, motivationAdapter });
  const first = selector.select(state('inseguranca', [], 'moderada', false));
  const second = selector.select(state('inseguranca', [], 'moderada', true));
  assert.equal(second.motivationDirectionChanged, true);
  assert.notEqual(second.content.id, first.content.id);
  assert.equal(selector.getRecentSelections().length, 2);
  if (first.content.id !== 'toggle-strong') assert.equal(second.content.id, 'toggle-strong');
});

test('diagnóstico informa preferência e fallback sem expor conteúdo novo', () => {
  const selector = engine.createSelector({
    version: 'motivation-diagnostic', contents: runtime.contents, synthesisAdapter, motivationAdapter,
  });
  const selected = selector.select(state('ansiedade', [], 'intensa', true), {
    firstResponse: true,
    diagnostics: true,
  });
  assert.equal(selected.motivation.active, true);
  assert.equal(typeof selected.motivationFallback, 'boolean');
  assert.ok(selected.diagnostics.candidatesAfterSynthesis.every((candidate) => (
    candidate.motivationalPreference && Array.isArray(candidate.motivationalPreference.vector)
  )));
  assert.deepEqual(
    selected.diagnostics.candidatesBeforeSynthesis.map(({ id }) => id).sort(),
    selected.diagnostics.candidatesAfterSynthesis.map(({ id }) => id).sort(),
  );
});

test('arquivos ativos carregam dados e adaptador locais antes do script principal', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const script = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
  assert.match(html, /js\/data\/motivation-profiles\.js/);
  assert.match(html, /js\/core\/motivation-ranking-adapter\.js/);
  assert.ok(html.indexOf('motivation-profiles.js') < html.indexOf('motivation-ranking-adapter.js'));
  assert.ok(html.indexOf('motivation-ranking-adapter.js') < html.indexOf('script.js?v='));
  assert.match(script, /motivationAdapter:\s*motivationRankingAdapter/);
  assert.doesNotMatch(script, /fetch\([^)]*motivation|openai|chatgpt/i);
});

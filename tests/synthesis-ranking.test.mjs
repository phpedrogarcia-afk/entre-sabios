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
  'js/core/emotional-synthesis.js',
  'js/core/synthesis-ranking-adapter.js',
  'js/core/runtime-engine.js',
]) {
  vm.runInContext(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'), sandbox, { filename: relativePath });
}

const { runtime } = buildFromFiles({ rootDir, write: false });
const catalog = sandbox.window.EntreSabiosData.emotionalSyntheses;
const resolver = sandbox.window.EntreSabiosEmotionalSynthesis.createResolver(catalog);
const adapter = sandbox.window.EntreSabiosSynthesisRankingAdapter.createAdapter({ catalog, resolver });
const engine = sandbox.window.EntreSabiosRuntimeEngine;

const mandatoryScenarios = [
  ['autoconhecimento', ['confusao', 'inseguranca']],
  ['luto', ['saudade']],
  ['saudade', ['luto']],
  ['amor', ['medo']],
  ['medo', ['amor']],
  ['ansiedade', ['medo']],
  ['tristeza', ['solidao']],
  ['raiva', ['culpa']],
  ['falta_de_proposito', ['confusao']],
  ['esperanca', ['luto']],
];

function state(primaryFeeling, secondaryFeelings, intensity = 'moderada', needsMotivation = false) {
  return { primaryFeeling, secondaryFeelings, intensity, needsMotivation };
}

function makeContent(id, {
  primary = 'amor', secondary = 'medo', secondaryPlacement = 'contextual', themes = [],
} = {}) {
  return {
    id,
    publicationEnabled: true,
    status: 'ATIVO_NUCLEO',
    suitableIntensities: ['moderada'],
    hardExclusions: [],
    riskTags: [],
    finalText: `Texto seguro ${id}`,
    displayedAuthor: `Autor ${id}`,
    author: `Autor ${id}`,
    displayType: 'frase',
    editorialFunction: 'inquiry',
    tone: 'contemplativo',
    placement: 'nucleo',
    themes,
    associations: [
      { feeling: primary, placement: 'nucleo' },
      { feeling: secondary, placement: secondaryPlacement },
    ],
  };
}

test('dez cenários obrigatórios preservam elegibilidade, nível e foco no sentimento principal', () => {
  for (const [primaryFeeling, secondaryFeelings] of mandatoryScenarios) {
    const currentState = state(primaryFeeling, secondaryFeelings);
    const before = engine.rankEligibleContents(runtime.contents, currentState, { firstResponse: false });
    const after = engine.rankEligibleContents(runtime.contents, currentState, {
      firstResponse: false,
      synthesisAdapter: adapter,
    });

    assert.ok(after.length > 0, `${primaryFeeling}+${secondaryFeelings.join('+')} sem candidatos`);
    assert.deepEqual(
      after.map(({ content }) => content.id).sort(),
      before.map(({ content }) => content.id).sort(),
      `${primaryFeeling}+${secondaryFeelings.join('+')} alterou elegibilidade`,
    );
    assert.equal(after[0].level, before[0].level, `${primaryFeeling} alterou o melhor nível`);
    assert.ok(after[0].level <= 2, `${primaryFeeling} perdeu prioridade para sentimentos secundários`);
    assert.ok(after[0].content.associations.some((association) => (
      association.feeling === primaryFeeling && ['nucleo', 'contextual'].includes(association.placement)
    )));
    for (const candidate of after) {
      assert.equal(candidate.level, before.find(({ content }) => content.id === candidate.content.id).level);
    }
  }
});

test('a síntese só desempata depois da compatibilidade secundária', () => {
  const strongerSecondary = makeContent('secondary-stronger', { secondaryPlacement: 'nucleo' });
  const synthesisMatch = makeContent('synthesis-match', {
    secondaryPlacement: 'contextual',
    themes: ['vinculo', 'vulnerabilidade'],
  });
  const ranked = engine.rankEligibleContents([synthesisMatch, strongerSecondary], state('amor', ['medo']), {
    synthesisAdapter: adapter,
  });
  assert.equal(ranked[0].content.id, 'secondary-stronger');
});

test('a síntese favorece metadados compatíveis apenas entre candidatos já equivalentes', () => {
  const neutral = makeContent('neutral', { themes: ['tempo'] });
  const compatible = makeContent('compatible', { themes: ['vinculo', 'vulnerabilidade'] });
  const ranked = engine.rankEligibleContents([neutral, compatible], state('amor', ['medo']), {
    synthesisAdapter: adapter,
  });
  assert.equal(ranked[0].content.id, 'compatible');
  assert.deepEqual(Array.from(ranked[0].synthesisCompatibility.vector), [1, 1, 0]);
  assert.equal(ranked.length, 2);
});

test('segurança, intensidade e nível continuam fora do alcance do adaptador', () => {
  const eligible = makeContent('eligible', { themes: ['vinculo'] });
  const wrongIntensity = { ...makeContent('wrong-intensity', { themes: ['vinculo'] }), suitableIntensities: ['fraca'] };
  const unsafe = { ...makeContent('unsafe', { themes: ['vinculo'] }), riskTags: ['invalidacao_emocional'] };
  const secondaryOnly = makeContent('secondary-only', { primary: 'medo', secondary: 'inseguranca', themes: ['vinculo'] });
  secondaryOnly.associations = [{ feeling: 'medo', placement: 'nucleo' }];
  const ranked = engine.rankEligibleContents([wrongIntensity, unsafe, secondaryOnly, eligible], state('amor', ['medo']), {
    synthesisAdapter: adapter,
  });
  assert.deepEqual(ranked.map(({ content }) => content.id), ['eligible', 'secondary-only']);
  assert.deepEqual(ranked.map(({ level }) => level), [1, 3]);
});

test('inverter o principal preserva a direção e muda a síntese resolvida', () => {
  const loveFirst = adapter.resolveState(state('amor', ['medo']));
  const fearFirst = adapter.resolveState(state('medo', ['amor']));
  assert.equal(loveFirst.resolution.directionalKey, 'amor__medo');
  assert.equal(fearFirst.resolution.directionalKey, 'medo__amor');
  assert.notEqual(loveFirst.profile.id, fearFirst.profile.id);
});

test('ordem dos dois secundários é estável e a tríade exata é usada', () => {
  const first = adapter.resolveState(state('autoconhecimento', ['confusao', 'inseguranca']));
  const reordered = adapter.resolveState(state('autoconhecimento', ['inseguranca', 'confusao']));
  assert.equal(first.resolution.reason, 'exact_triad');
  assert.equal(first.profile.id, reordered.profile.id);
  assert.deepEqual(first.mappedThemes, reordered.mappedThemes);
});

test('sem o adaptador da Fase 7, a síntese não aplica motivação', () => {
  const off = engine.createSelector({
    version: 'synthesis-motivation-off', contents: runtime.contents, synthesisAdapter: adapter,
  }).inspect(state('luto', ['saudade'], 'moderada', false));
  const on = engine.createSelector({
    version: 'synthesis-motivation-on', contents: runtime.contents, synthesisAdapter: adapter,
  }).inspect(state('luto', ['saudade'], 'moderada', true));
  assert.deepEqual(
    on.ranked.map(({ content, level, synthesisCompatibility }) => [content.id, level, synthesisCompatibility.vector]),
    off.ranked.map(({ content, level, synthesisCompatibility }) => [content.id, level, synthesisCompatibility.vector]),
  );
});

test('ambiguidade alta restringe influência a um único sinal temático', () => {
  const context = adapter.resolveState(state('ansiedade', ['saudade']));
  assert.equal(context.policy.label, 'minimal');
  const evaluation = adapter.evaluate(makeContent('many-signals', {
    primary: 'ansiedade', secondary: 'saudade', themes: context.mappedThemes,
  }), context);
  assert.deepEqual(Array.from(evaluation.vector), [1, 0, 0]);
});

test('seletor expõe diagnóstico técnico sem alterar a seleção publicada', () => {
  const selector = engine.createSelector({
    version: 'synthesis-diagnostic', contents: runtime.contents, synthesisAdapter: adapter,
  });
  const inspection = selector.inspect(state('luto', ['saudade']), { firstResponse: false });
  const selected = selector.select(state('luto', ['saudade']), { firstResponse: false, diagnostics: true });
  assert.equal(inspection.synthesis.directionalKey, 'luto__saudade');
  assert.equal(inspection.synthesis.confidence, 'high');
  assert.equal(selected.synthesis.directionalKey, 'luto__saudade');
  assert.deepEqual(selected.synthesisCompatibility.vector.length, 3);
  assert.equal(selected.level, inspection.bestLevel);
  assert.ok(selected.diagnostics.candidatesBeforeSynthesis.length > 0);
  assert.equal(selected.diagnostics.candidatesAfterSynthesis.length, selected.diagnostics.candidatesBeforeSynthesis.length);
  assert.ok(selected.diagnostics.excludedCandidates.length > 0);
  assert.equal(selected.diagnostics.chosen.id, selected.content.id);
  assert.ok(selected.diagnostics.candidatesAfterSynthesis.every((candidate) => (
    candidate.synthesisReduction === 0 && candidate.motivationalPreference === null
  )));
});

test('arquivo ativo carrega o adaptador antes da inicialização principal', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const script = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
  assert.match(html, /js\/core\/synthesis-ranking-adapter\.js/);
  assert.ok(html.indexOf('synthesis-ranking-adapter.js') < html.indexOf('script.js?v='));
  assert.match(script, /synthesisAdapter:\s*synthesisRankingAdapter/);
});

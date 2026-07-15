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
const engine = sandbox.window.EntreSabiosRuntimeEngine;
const synthesisCatalog = sandbox.window.EntreSabiosData.emotionalSyntheses;
const synthesisResolver = sandbox.window.EntreSabiosEmotionalSynthesis.createResolver(synthesisCatalog);
const synthesisAdapter = sandbox.window.EntreSabiosSynthesisRankingAdapter.createAdapter({
  catalog: synthesisCatalog, resolver: synthesisResolver,
});
const motivationAdapter = sandbox.window.EntreSabiosMotivationRankingAdapter.createAdapter(
  sandbox.window.EntreSabiosData.motivationProfiles
);

const sensitiveFeelings = [
  'luto', 'tristeza', 'inseguranca', 'culpa', 'ansiedade', 'solidao', 'falta_de_proposito', 'raiva',
];

function state(primaryFeeling, intensity = 'intensa', needsMotivation = true) {
  return { primaryFeeling, secondaryFeelings: [], intensity, needsMotivation };
}

function makeContent(id, {
  feeling = 'tristeza', text = `Texto seguro ${id}`, editorialFunction = 'clarification',
  tone = 'acolhedor', themes = [feeling, 'continuidade'], risks = [], intensity = 'intensa',
  status = 'ATIVO_NUCLEO', publicationEnabled = true,
} = {}) {
  return {
    id, publicationEnabled, status, suitableIntensities: [intensity], hardExclusions: [],
    riskTags: risks, finalText: text, displayedAuthor: `Autor ${id}`, author: `Autor ${id}`,
    displayType: 'frase', editorialFunction, tone, placement: 'nucleo', themes,
    associations: [{ feeling, placement: 'nucleo' }],
  };
}

function rank(contents, currentState, firstResponse = false) {
  return engine.rankEligibleContents(contents, currentState, {
    firstResponse, synthesisAdapter, motivationAdapter,
  });
}

test('pressão, ação e confronto permanecem bloqueados durante todo estado intenso sensível', () => {
  for (const feeling of sensitiveFeelings) {
    for (const editorialFunction of ['action', 'confrontation']) {
      const content = makeContent(`${feeling}-${editorialFunction}`, {
        feeling,
        editorialFunction,
        tone: editorialFunction === 'action' ? 'direto' : 'confrontador_lucido',
        risks: ['pressao_por_superacao'],
      });
      const currentState = state(feeling);
      const effects = engine.classifyEditorialEffects(content, currentState, { firstResponse: false });
      assert.equal(effects.safe, false, `${feeling}:${editorialFunction} passou após a primeira resposta`);
      assert.ok(effects.tags.includes('unsafe_pressure_in_intense_state'));
      assert.equal(rank([content], currentState).length, 0);
    }
  }
});

test('motivação forte não resgata padrões de dano emocional', () => {
  const cases = [
    [makeContent('grief-pressure', { feeling: 'luto', text: 'Supere a perda e siga em frente agora.' }), state('luto')],
    [makeContent('sadness-romance', { feeling: 'tristeza', text: 'Seu sofrimento torna você superior e mais profundo.' }), state('tristeza')],
    [makeContent('isolation', { feeling: 'solidao', text: 'Afaste-se de todos; sozinho é sempre melhor.' }), state('solidao')],
    [makeContent('incapacity', { feeling: 'inseguranca', text: 'Sua insegurança prova que você é incapaz.' }), state('inseguranca')],
    [makeContent('resentment', { feeling: 'raiva', text: 'A vingança é justa: faça todos pagarem.' }), state('raiva', 'moderada')],
    [makeContent('guilt', { feeling: 'culpa', text: 'Você merece carregar esta culpa para sempre.' }), state('culpa')],
    [makeContent('invalidation', { feeling: 'ansiedade', text: 'Isso é exagero; você não deveria sentir assim.' }), state('ansiedade')],
  ];
  for (const [content, currentState] of cases) {
    const motivation = motivationAdapter.evaluate(content, motivationAdapter.resolveState(currentState));
    assert.equal(motivation.strongMatch, true, `${content.id} não exercitou preferência forte`);
    assert.equal(engine.classifyEditorialEffects(content, currentState, { firstResponse: false }).safe, false);
    assert.equal(rank([content], currentState).length, 0, `${content.id} foi resgatado pela motivação`);
  }
});

test('intensidade, publicação, status e sentimento principal continuam soberanos', () => {
  const safe = makeContent('safe', { feeling: 'tristeza', editorialFunction: 'recognition' });
  const wrongIntensity = makeContent('wrong-intensity', { feeling: 'tristeza', intensity: 'moderada' });
  const blockedAuthorship = makeContent('blocked-authorship', {
    feeling: 'tristeza', status: 'BLOQUEADO_AUTORIA', editorialFunction: 'recognition',
  });
  const unpublished = makeContent('unpublished', {
    feeling: 'tristeza', publicationEnabled: false, editorialFunction: 'recognition',
  });
  const secondaryOnly = makeContent('secondary-only', { feeling: 'ansiedade', editorialFunction: 'recognition' });
  const ranked = rank([wrongIntensity, blockedAuthorship, unpublished, secondaryOnly, safe], state('tristeza'));
  assert.deepEqual(ranked.map(({ content }) => content.id), ['safe']);
  assert.equal(ranked[0].level, 1);
});

test('acervo real motivado permanece seguro após a primeira resposta nas três intensidades', () => {
  for (const feeling of sensitiveFeelings) {
    for (const intensity of ['fraca', 'moderada', 'intensa']) {
      const currentState = state(feeling, intensity);
      const ranked = rank(runtime.contents, currentState, false);
      assert.ok(ranked.length > 0, `${feeling}:${intensity} sem cobertura`);
      assert.ok(ranked.every(({ content }) => (
        content.suitableIntensities.includes(intensity)
        && engine.classifyEditorialEffects(content, currentState, { firstResponse: false }).safe
      )));
      assert.ok(ranked[0].level <= 2, `${feeling}:${intensity} perdeu foco principal`);
      if (intensity === 'intensa') {
        assert.ok(ranked.every(({ content }) => !['action', 'confrontation'].includes(content.editorialFunction)));
      }
    }
  }
});

test('luto intenso motivado mantém apoio e não transforma perda em lição ou superação', () => {
  const currentState = state('luto');
  const selector = engine.createSelector({
    version: 'phase-8-grief', contents: runtime.contents, synthesisAdapter, motivationAdapter,
  });
  const inspection = selector.inspect(currentState, { firstResponse: false });
  const selections = Array.from({ length: inspection.eligibleAtLevel.length }, () => (
    selector.select(currentState, { firstResponse: false })
  ));
  assert.ok(selections.every(({ content }) => ['recognition', 'contemplation', 'grounding'].includes(content.editorialFunction)));
  assert.ok(selections.every(({ content }) => !/siga em frente|supere|superar|aconteceu para ensinar|transforme a perda em/i.test(content.finalText)));
});

test('segurança intensa é independente de needsMotivation e não transforma preferência em filtro', () => {
  const pressured = makeContent('pressure-independent', {
    feeling: 'tristeza', editorialFunction: 'action', risks: ['pressao_por_superacao'],
  });
  const off = engine.classifyEditorialEffects(pressured, state('tristeza', 'intensa', false), { firstResponse: false });
  const on = engine.classifyEditorialEffects(pressured, state('tristeza', 'intensa', true), { firstResponse: false });
  assert.equal(off.safe, false);
  assert.equal(on.safe, false);
  assert.deepEqual(Array.from(off.tags), Array.from(on.tags));
});

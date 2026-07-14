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

test('principal com dois secundários preserva a hierarquia em todas as ordens e intensidades', () => {
  const feelings = runtime.feelings.map((item) => item.id);
  let combinations = 0;
  let orderedScenarios = 0;

  for (const primaryFeeling of feelings) {
    const secondaryOptions = feelings.filter((feeling) => feeling !== primaryFeeling);
    for (let firstIndex = 0; firstIndex < secondaryOptions.length - 1; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < secondaryOptions.length; secondIndex += 1) {
        const firstSecondary = secondaryOptions[firstIndex];
        const secondSecondary = secondaryOptions[secondIndex];
        for (const intensity of ['fraca', 'moderada', 'intensa']) {
          combinations += 1;
          const forwardState = {
            primaryFeeling,
            secondaryFeelings: [firstSecondary, secondSecondary],
            intensity,
          };
          const reverseState = {
            primaryFeeling,
            secondaryFeelings: [secondSecondary, firstSecondary],
            intensity,
          };
          const forward = engine.rankEligibleContents(runtime.contents, forwardState, { firstResponse: true });
          const reverse = engine.rankEligibleContents(runtime.contents, reverseState, { firstResponse: true });
          orderedScenarios += 2;

          assert.ok(forward.length > 0, `${primaryFeeling} sem candidato com ${firstSecondary}+${secondSecondary}`);
          assert.ok(forward[0].level <= 2, `${primaryFeeling}+${firstSecondary}+${secondSecondary}:${intensity} saiu do principal`);
          assert.ok(forward[0].content.associations.some((association) => association.feeling === primaryFeeling
            && ['nucleo', 'contextual'].includes(association.placement)));
          assert.deepEqual(
            forward.map(({ content, level }) => [content.id, level]),
            reverse.map(({ content, level }) => [content.id, level]),
            `a ordem dos secundários alterou ${primaryFeeling}+${firstSecondary}+${secondSecondary}:${intensity}`,
          );
        }
      }
    }
  }

  assert.equal(combinations, 3276);
  assert.equal(orderedScenarios, 6552);
});

test('dois secundários muito compatíveis não salvam conteúdo alheio ao principal', () => {
  const contents = [
    makeContent('primary-contextual', { feelings: [], secondaryFeelings: ['tristeza'] }),
    makeContent('secondary-only', {
      feelings: ['medo', 'inseguranca'],
      secondaryFeelings: ['medo', 'inseguranca'],
      text: 'Conteúdo com compatibilidade secundária elevada',
    }),
  ];
  contents[0].associations[0].placement = 'contextual';
  contents[1].themes = ['ameaça', 'dúvida', 'proteção'];
  const state = {
    primaryFeeling: 'tristeza',
    secondaryFeelings: ['medo', 'inseguranca'],
    secondaryThemes: ['ameaça', 'dúvida', 'proteção'],
    suitableTones: ['contemplativo'],
    intensity: 'moderada',
  };
  const ranked = engine.rankEligibleContents(contents, state, { firstResponse: false });
  assert.equal(ranked[0].content.id, 'primary-contextual');
  assert.equal(ranked[0].level, 2);
  assert.equal(ranked.find(({ content }) => content.id === 'secondary-only').level, 3);
});

test('trocas, retorno, intensidade e Outra perspectiva mantêm o principal explícito', () => {
  const storage = createMemoryStorage();
  const selector = engine.createSelector({ version: 'two-secondary-transitions', contents: runtime.contents, storage });
  const original = {
    primaryFeeling: 'tristeza',
    secondaryFeelings: ['inseguranca', 'medo'],
    intensity: 'moderada',
  };
  const reordered = { ...original, secondaryFeelings: ['medo', 'inseguranca'] };
  const changedPrimary = {
    primaryFeeling: 'inseguranca',
    secondaryFeelings: ['tristeza', 'medo'],
    intensity: 'moderada',
  };
  const changedIntensity = { ...original, intensity: 'intensa' };
  const originalSnapshot = structuredClone(original);

  const transitions = [original, reordered, changedPrimary, changedIntensity, original];
  for (const state of transitions) {
    const result = selector.select(state, { firstResponse: true });
    assert.ok(result.level <= 2);
    assert.ok(result.content.associations.some((association) => association.feeling === state.primaryFeeling
      && ['nucleo', 'contextual'].includes(association.placement)));
  }

  const perspectives = Array.from({ length: 20 }, () => selector.select(original, { firstResponse: false }));
  assert.ok(perspectives.every((result) => result.level <= 2));
  assert.ok(perspectives.every(({ content }) => content.associations.some((association) => association.feeling === 'tristeza'
    && ['nucleo', 'contextual'].includes(association.placement))));
  assert.deepEqual(original, originalSnapshot, 'o seletor alterou silenciosamente o estado emocional recebido');
  assert.equal(selector.getRecentSelections().length, transitions.length + perspectives.length);
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

test('um único formato desenvolvido percorre o ciclo sem repetição artificial', () => {
  const contents = Array.from({ length: 8 }, (_, index) => makeContent(`single-developed-${index + 1}`));
  const state = { primaryFeeling: 'tristeza', secondaryFeelings: [], intensity: 'moderada' };
  const ranked = engine.rankEligibleContents(contents, state, { firstResponse: false });
  const developedId = ranked.at(-1).content.id;
  ranked.at(-1).content.displayType = 'microtexto';
  const selector = engine.createSelector({ version: 'single-developed-cadence', contents });
  const cycle = selectMany(selector, state, contents.length).map((result) => result.content);
  const developedPositions = cycle
    .map((content, index) => (DEVELOPED_FORMATS.has(content.displayType) ? index + 1 : null))
    .filter(Boolean);

  assert.equal(new Set(cycle.map((content) => content.id)).size, contents.length);
  assert.deepEqual(developedPositions, [cycle.findIndex((content) => content.id === developedId) + 1]);
});

test('nove formatos desenvolvidos passam pelos filtros e o microtexto abstrato de luto permanece bloqueado', () => {
  const developedContents = runtime.contents.filter((content) => DEVELOPED_FORMATS.has(content.displayType));
  const reachable = new Set();
  const bestLevelReachable = new Set();

  for (const primaryFeeling of runtime.feelings.map((feeling) => feeling.id)) {
    for (const intensity of ['fraca', 'moderada', 'intensa']) {
      const state = { primaryFeeling, secondaryFeelings: [], intensity };
      const selector = engine.createSelector({ version: `format-coverage-${primaryFeeling}-${intensity}`, contents: runtime.contents });
      const inspection = selector.inspect(state, { firstResponse: false });
      inspection.ranked.forEach(({ content }) => {
        if (DEVELOPED_FORMATS.has(content.displayType)) reachable.add(content.id);
      });
      inspection.eligibleAtLevel.forEach(({ content }) => {
        if (DEVELOPED_FORMATS.has(content.displayType)) bestLevelReachable.add(content.id);
      });
    }
  }

  assert.equal(developedContents.length, 10);
  assert.equal(reachable.size, 9);
  assert.deepEqual(
    developedContents.filter((content) => !reachable.has(content.id)).map((content) => content.id),
    ['curadoria-final-epicuro-luto-microtexto'],
  );
  const blockedGriefText = developedContents.find((content) => content.id === 'curadoria-final-epicuro-luto-microtexto');
  assert.equal(engine.classifyEditorialEffects(blockedGriefText, {
    primaryFeeling: 'luto',
    secondaryFeelings: [],
    intensity: 'moderada',
  }, { firstResponse: false }).safe, false);
  assert.deepEqual([...bestLevelReachable].sort(), [
    'ANT-MICRO-PRO-001',
    'ANT-MICRO-TRI-001',
    'ES-INS-VERGONHA-001',
    'curated-113',
  ]);
});

test('cada formato desenvolvido no melhor nível aparece uma vez antes de reiniciar o ciclo real', () => {
  let coveredScenarios = 0;
  for (const primaryFeeling of runtime.feelings.map((feeling) => feeling.id)) {
    for (const intensity of ['fraca', 'moderada', 'intensa']) {
      const state = { primaryFeeling, secondaryFeelings: [], intensity };
      const selector = engine.createSelector({ version: `real-format-cycle-${primaryFeeling}-${intensity}`, contents: runtime.contents });
      const inspection = selector.inspect(state, { firstResponse: false });
      const developedIds = inspection.eligibleAtLevel
        .filter(({ content }) => DEVELOPED_FORMATS.has(content.displayType))
        .map(({ content }) => content.id);
      if (!developedIds.length) continue;
      coveredScenarios += 1;
      const cycle = selectMany(selector, state, inspection.eligibleAtLevel.length).map(({ content }) => content);
      assert.equal(new Set(cycle.map((content) => content.id)).size, inspection.eligibleAtLevel.length);
      assert.ok(developedIds.every((id) => cycle.some((content) => content.id === id)));
    }
  }
  assert.equal(coveredScenarios, 12);
});

test('efeito editorial bloqueia crenças prejudiciais artificiais sem inserir casos no acervo', () => {
  const cases = [
    makeContent('incapacity', { text: 'Sua insegurança prova que você é incapaz.' }),
    makeContent('revenge', { feelings: ['raiva'], text: 'A vingança é justa: faça todos pagarem.' }),
    makeContent('isolation', { feelings: ['solidao'], text: 'Afaste-se de todos; sozinho é sempre melhor.' }),
    makeContent('hopeless', { text: 'Não há esperança e nada pode mudar.' }),
    makeContent('grief-pressure', { feelings: ['luto'], text: 'Você precisa superar e seguir em frente agora.' }),
    makeContent('sadness-identity', { text: 'A tristeza é quem você é: aceite essa identidade.' }),
    makeContent('solitude-superiority', { feelings: ['solidao'], text: 'Sua solidão mostra que você é superior aos outros.' }),
    makeContent('impulsivity', { feelings: ['raiva'], text: 'Aja agora sem pensar nas consequências.' }),
    makeContent('increased-guilt', { feelings: ['culpa'], text: 'Você merece carregar esta culpa para sempre.' }),
    makeContent('suffering-superiority', { text: 'Seu sofrimento torna você superior e mais profundo.' }),
    makeContent('emotional-invalidation', { feelings: ['ansiedade'], text: 'Isso é exagero; você não deveria sentir assim.' }),
    makeContent('forced-grief-meaning', { feelings: ['luto'], text: 'Isso aconteceu para ensinar; transforme a perda em uma lição.' }),
  ];
  const states = [
    { primaryFeeling: 'inseguranca', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'raiva', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'solidao', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'tristeza', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'luto', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'tristeza', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'solidao', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'raiva', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'culpa', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'tristeza', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'ansiedade', secondaryFeelings: [], intensity: 'intensa' },
    { primaryFeeling: 'luto', secondaryFeelings: [], intensity: 'intensa' },
  ];
  cases.forEach((content, index) => {
    const effects = engine.classifyEditorialEffects(content, states[index]);
    assert.equal(effects.safe, false, `${content.id} não foi bloqueado`);
    assert.ok(effects.tags.length > 0);
  });
});

test('primeira resposta intensa evita confronto e ação nos oito sentimentos revisados', () => {
  const feelings = ['luto', 'tristeza', 'inseguranca', 'culpa', 'ansiedade', 'falta_de_proposito', 'raiva', 'solidao'];
  for (const primaryFeeling of feelings) {
    for (const editorialFunction of ['confrontation', 'action']) {
      const content = makeContent(`${primaryFeeling}-${editorialFunction}`, {
        feelings: [primaryFeeling],
        editorialFunction,
        tone: editorialFunction === 'confrontation' ? 'confrontador_lucido' : 'direto',
      });
      const effects = engine.classifyEditorialEffects(content, {
        primaryFeeling,
        secondaryFeelings: [],
        intensity: 'intensa',
      }, { firstResponse: true });
      assert.equal(effects.safe, false, `${primaryFeeling}:${editorialFunction} passou na primeira resposta intensa`);
    }
  }
});

test('acervo real não contém os novos padrões prejudiciais e mantém duas pendências herdadas de luto', () => {
  const feelings = new Set(['luto', 'tristeza', 'inseguranca', 'culpa', 'ansiedade', 'falta_de_proposito', 'raiva', 'solidao']);
  const newUnsafeTags = new Set([
    'encourages_impulsivity',
    'forces_meaning_on_grief',
    'increases_guilt',
    'invalidates_emotion',
    'turns_emotion_into_identity',
  ]);
  const newFindings = [];
  const inheritedGriefPending = new Set();

  for (const content of runtime.contents) {
    for (const association of content.associations) {
      if (!feelings.has(association.feeling)) continue;
      for (const intensity of content.suitableIntensities) {
        const effects = engine.classifyEditorialEffects(content, {
          primaryFeeling: association.feeling,
          secondaryFeelings: [],
          intensity,
        }, { firstResponse: false });
        if (effects.tags.some((tag) => newUnsafeTags.has(tag))) newFindings.push(content.id);
        if (association.feeling === 'luto' && !effects.safe) inheritedGriefPending.add(content.id);
      }
    }
  }

  assert.deepEqual([...new Set(newFindings)], []);
  assert.deepEqual([...inheritedGriefPending].sort(), [
    'batch05-quote-021',
    'curadoria-final-epicuro-luto-microtexto',
  ]);
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

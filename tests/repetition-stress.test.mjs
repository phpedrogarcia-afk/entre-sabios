import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

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
]) vm.runInContext(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'), sandbox, { filename: relativePath });

const runtime = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'entre_sabios_runtime.json'), 'utf8'));
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
  return String(value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function canonicalKeys(content) {
  return new Set([
    `content:${content.canonicalContentId || content.duplicateOf || content.derivedFromId || content.id}`,
    content.sourceFragmentId ? `fragment:${content.sourceFragmentId}` : null,
  ].filter(Boolean));
}

function createSelector(version, storage, contents = runtime.contents) {
  return engine.createSelector({
    version, storage, contents, synthesisAdapter, motivationAdapter,
  });
}

function makeContent(id, {
  text = `Texto seguro ${id}`, author = `Autor ${id}`, format = 'frase',
  canonicalContentId = null, sourceFragmentId = null,
} = {}) {
  return {
    id,
    finalText: text,
    displayedAuthor: author,
    author,
    displayType: format,
    editorialFunction: 'contemplation',
    tone: 'contemplativo',
    themes: [],
    riskTags: [],
    hardExclusions: [],
    suitableIntensities: ['fraca', 'moderada', 'intensa'],
    associations: [{ feeling: 'autoconhecimento', placement: 'nucleo' }],
    placement: 'nucleo',
    status: 'ATIVO_NUCLEO',
    publicationEnabled: true,
    canonicalContentId,
    sourceFragmentId,
  };
}

function allowedCandidates(inspection) {
  return inspection.ranked.filter(({ level }) => level === inspection.bestLevel
    || (inspection.bestLevel === 1 && level === 2));
}

function runStressScenario({ name, stateAt, reloadAt = () => false }) {
  const storage = createMemoryStorage();
  const contentById = new Map(runtime.contents.map((content) => [content.id, content]));
  let selector = createSelector(`phase6-${name}`, storage);
  const metrics = {
    selections: 0,
    avoidableExact: 0,
    avoidableNormalized: 0,
    avoidableCanonical: 0,
    inevitable: 0,
    firstRepeat: null,
    maximumAuthorStreak: 0,
    avoidableAuthorStreaks: 0,
    maximumConceptStreak: 0,
    formats: new Set(),
    queueSizes: [],
    queueRebuilds: 0,
    levels: new Map(),
    synthesisFallbacks: new Map(),
  };
  let previousAuthor = null;
  let authorStreak = 0;
  let previousConcept = null;
  let conceptStreak = 0;
  const eligibleBeforeFirstRepeat = new Set();
  const selectedBeforeFirstRepeat = new Set();

  for (let index = 0; index < 100; index += 1) {
    if (reloadAt(index)) selector = createSelector(`phase6-${name}`, storage);
    const state = stateAt(index);
    const inspection = selector.inspect(state, { firstResponse: false });
    const recent = selector.getRecentSelections().slice(-engine.RECENT_CONTENT_WINDOW);
    const recentIds = new Set(recent.map(({ id }) => id));
    const recentTexts = new Set(recent.map(({ textKey }) => textKey));
    const recentCanonicalKeys = new Set(recent.flatMap(({ canonicalKeys: keys, id }) => (
      keys || [...canonicalKeys(contentById.get(id) || { id })]
    )));
    const permittedCandidates = allowedCandidates(inspection);
    if (metrics.firstRepeat === null) {
      permittedCandidates.forEach(({ content }) => eligibleBeforeFirstRepeat.add(content.id));
    }
    const alternatives = permittedCandidates.filter(({ content }) => (
      !recentIds.has(content.id)
      && !recentTexts.has(normalizeText(content.finalText))
      && ![...canonicalKeys(content)].some((key) => recentCanonicalKeys.has(key))
    ));
    const result = selector.select(state, { firstResponse: false, diagnostics: true });
    const textKey = normalizeText(result.content.finalText);
    const exactRepeat = recentIds.has(result.content.id);
    const normalizedRepeat = recentTexts.has(textKey);
    const canonicalRepeat = [...canonicalKeys(result.content)].some((key) => recentCanonicalKeys.has(key));
    const repeated = exactRepeat || normalizedRepeat || canonicalRepeat;
    if (repeated) {
      metrics.firstRepeat ??= index + 1;
      if (alternatives.length) {
        if (exactRepeat) metrics.avoidableExact += 1;
        if (normalizedRepeat) metrics.avoidableNormalized += 1;
        if (canonicalRepeat) metrics.avoidableCanonical += 1;
      } else metrics.inevitable += 1;
    } else if (metrics.firstRepeat === null) selectedBeforeFirstRepeat.add(result.content.id);

    const author = result.content.displayedAuthor || result.content.author;
    authorStreak = author === previousAuthor ? authorStreak + 1 : 1;
    if (authorStreak > 2) {
      const hasOtherAuthor = alternatives.some(({ content }) => (
        (content.displayedAuthor || content.author) !== author
      ));
      if (hasOtherAuthor) metrics.avoidableAuthorStreaks += 1;
    }
    metrics.maximumAuthorStreak = Math.max(metrics.maximumAuthorStreak, authorStreak);
    previousAuthor = author;

    const concept = result.content.conceptGroup || engine.getContentConceptKeys(result.content)[0] || null;
    conceptStreak = concept && concept === previousConcept ? conceptStreak + 1 : (concept ? 1 : 0);
    metrics.maximumConceptStreak = Math.max(metrics.maximumConceptStreak, conceptStreak);
    previousConcept = concept;
    metrics.formats.add(result.content.displayType);
    metrics.levels.set(result.level, (metrics.levels.get(result.level) || 0) + 1);
    const synthesisFallback = result.synthesis?.fallbackLevel ?? 'none';
    metrics.synthesisFallbacks.set(synthesisFallback, (metrics.synthesisFallbacks.get(synthesisFallback) || 0) + 1);
    metrics.queueSizes.push(result.diagnostics?.activeQueueBeforeSelection?.length || 0);
    if (result.diagnostics?.storedQueueBefore?.length === 0
      && result.diagnostics?.activeQueueBeforeSelection?.length > 0) metrics.queueRebuilds += 1;
    assert.ok(contentById.has(result.content.id));
    assert.ok(result.level <= 2, `${name}:${index} perdeu o sentimento principal`);
    assert.equal(engine.classifyEditorialEffects(result.content, state, { firstResponse: false }).safe, true);
    metrics.selections += 1;
  }

  metrics.averageQueueSize = metrics.queueSizes.reduce((sum, size) => sum + size, 0) / metrics.queueSizes.length;
  metrics.eligibleDistinctBeforeFirstRepeat = eligibleBeforeFirstRepeat.size;
  metrics.distinctSelectedBeforeFirstRepeat = selectedBeforeFirstRepeat.size;
  metrics.coverageBeforeFirstRepeat = eligibleBeforeFirstRepeat.size
    ? selectedBeforeFirstRepeat.size / eligibleBeforeFirstRepeat.size
    : 0;
  return metrics;
}

test('oito sequências de 100 seleções não produzem repetição exata evitável', (t) => {
  const broad = { primaryFeeling: 'autoconhecimento', secondaryFeelings: ['confusao', 'inseguranca'], intensity: 'moderada' };
  const scenarios = [
    { name: 'continua', stateAt: () => ({ ...broad, needsMotivation: false }) },
    { name: 'motivada', stateAt: () => ({ ...broad, needsMotivation: true }) },
    { name: 'motivacao-alternada', stateAt: (index) => ({ ...broad, needsMotivation: index % 2 === 1 }) },
    { name: 'intensidade-alternada', stateAt: (index) => ({ ...broad, intensity: ['fraca', 'moderada', 'intensa'][index % 3] }) },
    { name: 'secundarios-alternados', stateAt: (index) => ({ ...broad, secondaryFeelings: [[], ['confusao'], ['confusao', 'inseguranca']][index % 3] }) },
    { name: 'principal-retorno', stateAt: (index) => ({ ...broad, primaryFeeling: index % 4 === 2 ? 'confusao' : 'autoconhecimento' }) },
    { name: 'fallbacks-sintese', stateAt: (index) => ({ ...broad, secondaryFeelings: [[], ['medo'], ['confusao'], ['confusao', 'inseguranca']][index % 4] }) },
    { name: 'recarregamentos', stateAt: (index) => ({ ...broad, needsMotivation: index % 2 === 0 }), reloadAt: (index) => index > 0 && index % 10 === 0 },
  ];

  for (const scenario of scenarios) {
    const metrics = runStressScenario(scenario);
    t.diagnostic(`${scenario.name}: ${JSON.stringify({
      ...metrics,
      formats: [...metrics.formats],
      levels: Object.fromEntries(metrics.levels),
      synthesisFallbacks: Object.fromEntries(metrics.synthesisFallbacks),
      queueSizes: undefined,
    })}`);
    assert.equal(metrics.avoidableExact, 0, scenario.name);
    assert.equal(metrics.avoidableNormalized, 0, scenario.name);
    assert.equal(metrics.avoidableCanonical, 0, scenario.name);
    assert.equal(metrics.avoidableAuthorStreaks, 0, scenario.name);
    assert.ok(metrics.coverageBeforeFirstRepeat > 0, `${scenario.name}: cobertura anterior à repetição não foi medida`);
    if (metrics.firstRepeat !== null) {
      assert.equal(metrics.coverageBeforeFirstRepeat, 1, `${scenario.name}: repetiu antes de percorrer os elegíveis`);
    }
    assert.ok(metrics.formats.size >= 2, `${scenario.name}: formatos deixaram de circular`);
  }
});

test('conjuntos pequenos só repetem depois do esgotamento e registram inevitabilidade', () => {
  const state = { primaryFeeling: 'autoconhecimento', secondaryFeelings: [], intensity: 'moderada' };
  const contents = [makeContent('small-a'), makeContent('small-b'), makeContent('small-c')];
  const selector = createSelector('phase6-small', createMemoryStorage(), contents);
  const results = Array.from({ length: 4 }, () => selector.select(state, { firstResponse: false, diagnostics: true }));
  assert.equal(new Set(results.slice(0, 3).map(({ content }) => content.id)).size, 3);
  assert.equal(results[3].diagnostics.repeatAllowed, true);
  assert.equal(results[3].diagnostics.repeatReason, 'all_allowed_candidates_exhausted');
  assert.equal(results[3].diagnostics.repeatProof.eligibleCount, 0);
  assert.equal(results[3].diagnostics.repeatProof.safeCandidatesChecked, 3);
  assert.equal(results[3].diagnostics.repeatProof.leastRecentCandidateId, results[0].content.id);

  const single = createSelector('phase6-single', createMemoryStorage(), [makeContent('only')]);
  const first = single.select(state, { firstResponse: false, diagnostics: true });
  const second = single.select(state, { firstResponse: false, diagnostics: true });
  assert.equal(first.content.id, second.content.id);
  assert.equal(second.diagnostics.repeatAllowed, true);
  assert.equal(second.diagnostics.repeatReason, 'all_allowed_candidates_exhausted');
  assert.equal(second.diagnostics.repeatProof.eligibleCount, 0);
  assert.equal(second.diagnostics.repeatProof.safeCandidatesChecked, 1);
  assert.equal(second.diagnostics.repeatProof.leastRecentCandidateId, first.content.id);
});

test('ciclo restaurado escolhe o menos recente depois do esgotamento global', () => {
  const state = { primaryFeeling: 'autoconhecimento', secondaryFeelings: [], intensity: 'moderada' };
  const storage = createMemoryStorage();
  const contents = [makeContent('oldest'), makeContent('middle'), makeContent('newest')];
  let selector = createSelector('phase4-restored-cycle', storage, contents);
  const firstCycle = Array.from({ length: contents.length }, () => selector.select(
    state,
    { firstResponse: false, diagnostics: true },
  ));

  selector = createSelector('phase4-restored-cycle', storage, contents);
  const repeated = selector.select(state, { firstResponse: false, diagnostics: true });

  assert.equal(repeated.content.id, firstCycle[0].content.id);
  assert.equal(repeated.diagnostics.territoryCycle.exhausted, true);
  assert.equal(repeated.diagnostics.leastRecentCandidateId, firstCycle[0].content.id);
  assert.equal(repeated.diagnostics.repeatReason, 'all_allowed_candidates_exhausted');
});

test('fila restaurada incorpora novos candidatos elegíveis sem apagar o restante', () => {
  const state = { primaryFeeling: 'autoconhecimento', secondaryFeelings: [], intensity: 'moderada' };
  const storage = createMemoryStorage();
  const initialContents = [makeContent('restore-a'), makeContent('restore-b')];
  const initialSelector = createSelector('phase6-queue-reconcile', storage, initialContents);
  initialSelector.select(state, { firstResponse: false, diagnostics: true });

  const restoredContents = [...initialContents, makeContent('restore-c')];
  const restoredSelector = createSelector('phase6-queue-reconcile', storage, restoredContents);
  const result = restoredSelector.select(state, { firstResponse: false, diagnostics: true });
  const queueBefore = result.diagnostics.activeQueueBeforeSelection;

  assert.ok(queueBefore.includes('restore-b'));
  assert.ok(queueBefore.includes('restore-c'));
  assert.ok(queueBefore.indexOf('restore-b') < queueBefore.indexOf('restore-c'));
});

test('versão incompatível reinicia a fila sem apagar o histórico global', () => {
  const state = { primaryFeeling: 'autoconhecimento', secondaryFeelings: [], intensity: 'moderada' };
  const storage = createMemoryStorage();
  const contents = [makeContent('legacy-a'), makeContent('legacy-b')];
  const selector = createSelector('phase6-queue-schema', storage, contents);
  selector.select(state, { firstResponse: false, diagnostics: true });

  storage.setItem(`entreSabiosRuntimeQueueMeta:${'phase6-queue-schema'}`, JSON.stringify({
    selectorSchemaVersion: 'legacy-v0',
    rotationPolicyVersion: 'legacy-v0',
  }));

  const restoredSelector = createSelector('phase6-queue-schema', storage, contents);
  const result = restoredSelector.select(state, { firstResponse: false, diagnostics: true });

  assert.equal(result.diagnostics.storedQueueBefore.length, 0);
  assert.equal(result.diagnostics.globalHistoryBefore.length, 1);
  assert.equal(result.diagnostics.activeQueueBeforeSelection.length, 1);
  assert.notEqual(result.content.id, selector.getRecentSelections()[0].id);
  assert.equal(result.diagnostics.repeatAllowed, false);
});

test('IDs distintos com texto literal ou normalizado igual não furam o ciclo', () => {
  const state = { primaryFeeling: 'autoconhecimento', secondaryFeelings: [], intensity: 'moderada' };
  const contents = [
    makeContent('literal-a', { text: 'A presença abre espaço.' }),
    makeContent('literal-b', { text: 'A presença abre espaço.' }),
    makeContent('normalized', { text: 'A PRESENÇA, abre espaço!' }),
    makeContent('distinct', { text: 'Observar com calma muda a relação com a dúvida.' }),
  ];
  const selector = createSelector('phase6-normalized', createMemoryStorage(), contents);
  const first = selector.select(state, { firstResponse: false });
  const second = selector.select(state, { firstResponse: false });
  assert.notEqual(normalizeText(first.content.finalText), normalizeText(second.content.finalText));
});

test('passagem-base igual é bloqueada enquanto existe alternativa canônica segura', () => {
  const state = { primaryFeeling: 'autoconhecimento', secondaryFeelings: [], intensity: 'moderada' };
  const contents = [
    makeContent('passage-a', { text: 'Primeira tradução da passagem.', canonicalContentId: 'passage-root', sourceFragmentId: 'fragment-1' }),
    makeContent('passage-b', { text: 'Adaptação diferente da mesma passagem.', canonicalContentId: 'passage-root', sourceFragmentId: 'fragment-1' }),
    makeContent('other', { text: 'Uma reflexão de origem independente.' }),
  ];
  const ranked = engine.rankEligibleContents(contents, state, { firstResponse: false });
  const firstPassage = ranked[0].content;
  const secondPassage = ranked[1].content;
  firstPassage.canonicalContentId = secondPassage.canonicalContentId = 'shared-passage';
  firstPassage.sourceFragmentId = secondPassage.sourceFragmentId = 'shared-fragment';
  const selector = createSelector('phase6-canonical', createMemoryStorage(), contents);
  const first = selector.select(state, { firstResponse: false });
  const second = selector.select(state, { firstResponse: false });
  const overlap = [...canonicalKeys(first.content)].some((key) => canonicalKeys(second.content).has(key));
  assert.equal(overlap, false, `${first.content.id} e ${second.content.id} reutilizaram a mesma passagem-base`);
});

test('autores e formatos continuam circulando em conjunto equivalente', () => {
  const state = { primaryFeeling: 'autoconhecimento', secondaryFeelings: [], intensity: 'moderada' };
  const formats = ['frase', 'microtexto', 'reflexao_curta'];
  const contents = Array.from({ length: 9 }, (_, index) => makeContent(`varied-${index}`, {
    author: `Autor ${(index % 3) + 1}`,
    format: formats[index % formats.length],
  }));
  const selector = createSelector('phase6-variety', createMemoryStorage(), contents);
  const results = Array.from({ length: 9 }, () => selector.select(state, { firstResponse: false }));
  assert.equal(new Set(results.map(({ content }) => content.id)).size, 9);
  assert.deepEqual(new Set(results.map(({ content }) => content.displayType)), new Set(formats));
  assert.ok(results.every(({ content }, index) => index < 2
    || content.displayedAuthor !== results[index - 1].content.displayedAuthor
    || content.displayedAuthor !== results[index - 2].content.displayedAuthor));
});

test('fallbacks cauteloso e sem síntese preservam a rotação e o principal', () => {
  const state = {
    primaryFeeling: 'autoconhecimento', secondaryFeelings: ['amor'], intensity: 'moderada', needsMotivation: true,
  };
  const cautiousCatalog = { ...synthesisCatalog, primaryProfiles: {} };
  const cautiousResolver = sandbox.window.EntreSabiosEmotionalSynthesis.createResolver(cautiousCatalog);
  const cautiousAdapter = sandbox.window.EntreSabiosSynthesisRankingAdapter.createAdapter({
    catalog: cautiousCatalog, resolver: cautiousResolver,
  });
  const invalidCatalog = { version: 'invalid-phase6' };
  const invalidResolver = sandbox.window.EntreSabiosEmotionalSynthesis.createResolver(invalidCatalog);
  const invalidAdapter = sandbox.window.EntreSabiosSynthesisRankingAdapter.createAdapter({
    catalog: invalidCatalog, resolver: invalidResolver,
  });

  const cautiousSelector = engine.createSelector({
    version: 'phase6-fallback-4', contents: runtime.contents, synthesisAdapter: cautiousAdapter, motivationAdapter,
  });
  const invalidSelector = engine.createSelector({
    version: 'phase6-fallback-5', contents: runtime.contents, synthesisAdapter: invalidAdapter, motivationAdapter,
  });
  const cautious = Array.from({ length: 30 }, () => cautiousSelector.select(state, { firstResponse: false }));
  const withoutSynthesis = Array.from({ length: 30 }, () => invalidSelector.select(state, { firstResponse: false }));

  assert.ok(cautious.every((result) => result.synthesis?.fallbackLevel === 4 && result.level <= 2));
  assert.equal(invalidAdapter.resolveState(state).resolution.fallbackLevel, 5);
  assert.ok(withoutSynthesis.every((result) => result.synthesis === null && result.level <= 2));
  assert.equal(new Set(cautious.map(({ content }) => normalizeText(content.finalText))).size, cautious.length);
  assert.equal(new Set(withoutSynthesis.map(({ content }) => normalizeText(content.finalText))).size, withoutSynthesis.length);
});

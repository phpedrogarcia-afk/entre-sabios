import { loadReplayEnvironment } from './diagnostic-replay-lib.mjs';

const VALID_INTENSITIES = new Set(['fraca', 'moderada', 'intensa']);
const SPECIFICITY_BY_FALLBACK = Object.freeze({ 1: 1, 2: 0.75, 3: 0.5, 4: 0.25, 5: 0, none: 0 });

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function normalizedText(value) {
  return String(value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function normalizeScenario(input, index) {
  if (!input || typeof input !== 'object') throw new Error(`Cenário ${index + 1} deve ser um objeto.`);
  if (typeof input.primaryFeeling !== 'string' || !input.primaryFeeling) {
    throw new Error(`Cenário ${index + 1}: primaryFeeling ausente.`);
  }
  const secondaryFeelings = Array.isArray(input.secondaryFeelings) ? [...new Set(input.secondaryFeelings)] : [];
  if (secondaryFeelings.length > 2 || secondaryFeelings.some((item) => typeof item !== 'string')) {
    throw new Error(`Cenário ${index + 1}: secondaryFeelings deve conter zero, um ou dois IDs.`);
  }
  const intensity = input.intensity || 'moderada';
  if (!VALID_INTENSITIES.has(intensity)) throw new Error(`Cenário ${index + 1}: intensidade inválida.`);
  const selections = Number.parseInt(input.selections ?? 30, 10);
  if (!Number.isInteger(selections) || selections < 1 || selections > 1000) {
    throw new Error(`Cenário ${index + 1}: selections deve estar entre 1 e 1000.`);
  }
  const changes = Array.isArray(input.changes) ? input.changes.map((change) => ({ ...change })) : [];
  changes.forEach((change) => {
    if (!Number.isInteger(change.at) || change.at < 1 || change.at > selections) {
      throw new Error(`Cenário ${index + 1}: cada mudança precisa de at entre 1 e selections.`);
    }
  });
  return {
    id: input.id || `scenario-${index + 1}`,
    primaryFeeling: input.primaryFeeling,
    secondaryFeelings,
    intensity,
    needsMotivation: input.needsMotivation === true,
    selections,
    activateFallbacks: input.activateFallbacks === true,
    changes,
  };
}

function stateAt(scenario, selectionNumber, previousState) {
  const changes = scenario.changes.filter((change) => change.at === selectionNumber);
  return changes.reduce((state, change) => ({
    ...state,
    ...(typeof change.primaryFeeling === 'string' ? { primaryFeeling: change.primaryFeeling } : {}),
    ...(Array.isArray(change.secondaryFeelings) ? { secondaryFeelings: [...new Set(change.secondaryFeelings)].slice(0, 2) } : {}),
    ...(VALID_INTENSITIES.has(change.intensity) ? { intensity: change.intensity } : {}),
    ...(typeof change.needsMotivation === 'boolean' ? { needsMotivation: change.needsMotivation } : {}),
  }), previousState);
}

function shouldReload(scenario, selectionNumber) {
  return scenario.changes.some((change) => change.at === selectionNumber && change.reload === true);
}

function concentration(values) {
  if (!values.length) return 0;
  const counts = values.reduce((map, value) => map.set(value, (map.get(value) || 0) + 1), new Map());
  return [...counts.values()].reduce((sum, count) => sum + (count / values.length) ** 2, 0);
}

function rankInfluence(first, second) {
  const firstPositions = new Map(first.map(({ content }, index) => [content.id, first.length <= 1 ? 0 : index / (first.length - 1)]));
  const secondPositions = new Map(second.map(({ content }, index) => [content.id, second.length <= 1 ? 0 : index / (second.length - 1)]));
  const common = [...firstPositions.keys()].filter((id) => secondPositions.has(id));
  if (!common.length) return { value: 0, commonCandidates: 0, eligibleSetChanged: first.length !== second.length };
  const value = common.reduce((sum, id) => sum + Math.abs(firstPositions.get(id) - secondPositions.get(id)), 0) / common.length;
  return {
    value,
    commonCandidates: common.length,
    eligibleSetChanged: first.length !== second.length || common.length !== first.length,
  };
}

function hasPrimaryAssociation(content, primaryFeeling) {
  return (content.associations || []).some((association) => (
    association.feeling === primaryFeeling && ['nucleo', 'contextual'].includes(association.placement)
  ));
}

function fallbackCategory(level) {
  return ({ 1: 'triad', 2: 'pair', 3: 'primary_modifier', 4: 'general_fallback', 5: 'algorithm_only' })[level] || 'none';
}

function ratioMap(values) {
  const counts = values.reduce((map, value) => map.set(value, (map.get(value) || 0) + 1), new Map());
  return Object.fromEntries([...counts].map(([key, count]) => [key, count / Math.max(1, values.length)]));
}

function countMap(values) {
  return Object.fromEntries(values.reduce((map, value) => (
    map.set(value, (map.get(value) || 0) + 1)
  ), new Map()));
}

function createAdapters(environment, activateFallbacks) {
  if (!activateFallbacks) return {
    synthesisAdapter: environment.synthesisAdapter,
    motivationAdapter: environment.motivationAdapter,
  };
  const fallbackCatalog = {
    ...environment.synthesisCatalog,
    directionalPairs: {},
    triadOverrides: {},
  };
  return {
    synthesisAdapter: environment.createSynthesisAdapter(fallbackCatalog),
    motivationAdapter: environment.motivationAdapter,
  };
}

function rankingComparisons(environment, state, adapters) {
  const baseState = { ...state, secondaryFeelings: [], needsMotivation: false };
  const secondaryState = { ...state, needsMotivation: false };
  const motivatedState = { ...state, needsMotivation: true };
  const options = { firstResponse: false, ...adapters };
  const base = environment.engine.rankEligibleContents(environment.runtime.contents, baseState, options);
  const secondary = environment.engine.rankEligibleContents(environment.runtime.contents, secondaryState, options);
  const motivated = environment.engine.rankEligibleContents(environment.runtime.contents, motivatedState, options);
  return {
    secondary: rankInfluence(base, secondary),
    motivation: rankInfluence(secondary, motivated),
  };
}

function makeAlert(id, category, title, evidence, selection = null) {
  return { id, category, title, evidence, selection, state: 'detected' };
}

export function runEmotionalLab(config, { rootDir, environment = null, generatedAt = new Date().toISOString() } = {}) {
  if (!config || !Array.isArray(config.scenarios) || config.scenarios.length === 0) {
    throw new Error('A entrada deve possuir scenarios com pelo menos um cenário.');
  }
  const loaded = environment || loadReplayEnvironment(rootDir);
  const scenarios = config.scenarios.map(normalizeScenario).map((scenario) => {
    const storage = createMemoryStorage();
    const adapters = createAdapters(loaded, scenario.activateFallbacks);
    const selectorVersion = `${loaded.runtime.contentVersion}:lab:${scenario.id}`;
    let selector = loaded.engine.createSelector({
      version: selectorVersion,
      contents: loaded.runtime.contents,
      storage,
      ...adapters,
    });
    let currentState = {
      primaryFeeling: scenario.primaryFeeling,
      secondaryFeelings: scenario.secondaryFeelings,
      intensity: scenario.intensity,
      needsMotivation: scenario.needsMotivation,
    };
    const comparisons = rankingComparisons(loaded, currentState, adapters);
    const selections = [];
    const allowedIds = new Set();
    const allowedBeforeRepeat = new Set();
    const seenKeys = new Set();
    const distinctBeforeRepeat = new Set();
    const alerts = [];
    let firstRepeat = null;

    for (let index = 1; index <= scenario.selections; index += 1) {
      currentState = stateAt(scenario, index, currentState);
      if (shouldReload(scenario, index)) {
        selector = loaded.engine.createSelector({
          version: selectorVersion,
          contents: loaded.runtime.contents,
          storage,
          ...adapters,
        });
      }
      const result = selector.select(currentState, { firstResponse: index === 1, diagnostics: true });
      if (!result) {
        alerts.push(makeAlert(`selection_gap_${index}`, 'RELEVANCE', 'Nenhum conteúdo selecionado', currentState, index));
        continue;
      }
      const content = result.content;
      const canonicalKeys = loaded.engine.getContentCanonicalKeys(content);
      const keys = [`id:${content.id}`, `text:${normalizedText(content.finalText)}`, ...canonicalKeys];
      const repeated = keys.some((key) => seenKeys.has(key));
      if (repeated && firstRepeat === null) firstRepeat = index;
      if (!firstRepeat) distinctBeforeRepeat.add(content.id);
      keys.forEach((key) => seenKeys.add(key));
      (result.diagnostics?.eligibleCandidates || []).forEach(({ id }) => {
        allowedIds.add(id);
        if (firstRepeat === null || firstRepeat === index) allowedBeforeRepeat.add(id);
      });

      const primaryRetained = hasPrimaryAssociation(content, currentState.primaryFeeling);
      if (!primaryRetained) {
        alerts.push(makeAlert(
          `primary_ignored_${index}`, 'RELEVANCE', 'Sentimento principal não está reconhecível',
          { contentId: content.id, primaryFeeling: currentState.primaryFeeling }, index,
        ));
      }
      if (repeated && (!result.diagnostics?.repeatAllowed || result.diagnostics?.unseenEligibleCandidates?.length > 0)) {
        alerts.push(makeAlert(
          `avoidable_repeat_${index}`, 'CIRCULATION', 'Repetição antes do esgotamento comprovado',
          { contentId: content.id, repeatReason: result.diagnostics?.repeatReason }, index,
        ));
      }
      if (index > 1 && selections.at(-1)?.chosen.id === content.id) {
        alerts.push(makeAlert(`current_repeat_${index}`, 'CIRCULATION', 'Conteúdo atual repetido imediatamente', { contentId: content.id }, index));
      }

      selections.push({
        index,
        state: { ...currentState, secondaryFeelings: [...currentState.secondaryFeelings] },
        directionalKey: [currentState.primaryFeeling, ...currentState.secondaryFeelings.slice().sort()].join('__'),
        synthesis: result.synthesis || null,
        relationType: result.synthesis?.relationType || null,
        fallbackLevel: result.synthesis?.fallbackLevel ?? null,
        eligibleCount: result.diagnostics?.eligibleCandidates?.length || 0,
        activeLevel: result.diagnostics?.activeLevel ?? result.level,
        progression: result.diagnostics?.territoryCycle || null,
        recentlyBlockedCandidates: result.diagnostics?.recentlyBlockedCandidates || [],
        removedCandidates: result.diagnostics?.excludedCandidates || [],
        alternativesRemaining: result.diagnostics?.unseenEligibleCandidates?.length || 0,
        chosen: {
          id: content.id,
          level: result.level,
          author: content.displayedAuthor || content.author || null,
          concepts: loaded.engine.getContentConceptKeys(content),
          format: content.displayType,
          primaryRetained,
        },
        repeatAllowed: result.diagnostics?.repeatAllowed === true,
        repeatReason: result.diagnostics?.repeatReason || null,
        selectionReason: result.reason,
      });
    }

    const selectedIds = selections.map((entry) => entry.chosen.id);
    const authors = selections.map((entry) => entry.chosen.author || 'sem_autor');
    const concepts = selections.map((entry) => entry.chosen.concepts[0] || 'sem_conceito');
    const selectedFormats = new Set(selections.map((entry) => entry.chosen.format));
    const availableFormats = new Set([...allowedIds].map((id) => (
      loaded.runtime.contents.find((content) => content.id === id)?.displayType
    )).filter(Boolean));
    const primaryRetention = selections.filter((entry) => entry.chosen.primaryRetained).length / Math.max(1, selections.length);
    const secondaryDominanceRisk = 1 - primaryRetention;
    const fallbackLevels = selections.map((entry) => entry.fallbackLevel ?? 'none');
    const synthesisSpecificity = fallbackLevels.reduce((sum, level) => (
      sum + (SPECIFICITY_BY_FALLBACK[level] ?? 0)
    ), 0) / Math.max(1, fallbackLevels.length);
    const coverageBeforeRepeat = distinctBeforeRepeat.size / Math.max(1, allowedBeforeRepeat.size);
    const candidateConcentration = concentration(selectedIds);
    const maximumDistinctInSample = Math.max(1, Math.min(selections.length, allowedIds.size));
    const minimumCandidateConcentration = 1 / maximumDistinctInSample;
    const rawCandidateConcentrationExcess = maximumDistinctInSample === 1
      ? 0
      : Math.max(0, (candidateConcentration - minimumCandidateConcentration) / (1 - minimumCandidateConcentration));
    const candidateConcentrationExcess = rawCandidateConcentrationExcess < 1e-12 ? 0 : rawCandidateConcentrationExcess;
    const metrics = {
      primaryRetention,
      secondaryInfluence: comparisons.secondary.value,
      secondaryInfluenceCommonCandidates: comparisons.secondary.commonCandidates,
      secondaryDominanceRisk,
      synthesisSpecificity,
      motivationInfluence: comparisons.motivation.value,
      motivationEligibleSetChanged: comparisons.motivation.eligibleSetChanged,
      candidateConcentration,
      candidateConcentrationExcess,
      coverageBeforeRepeat,
      fallbackRate: ratioMap(fallbackLevels.map(fallbackCategory)),
      authorConcentration: concentration(authors),
      conceptConcentration: concentration(concepts),
      formatCoverage: selectedFormats.size / Math.max(1, availableFormats.size),
      selectedFormatCount: selectedFormats.size,
      availableFormatCount: availableFormats.size,
      selectedDistinct: new Set(selectedIds).size,
      allowedDistinct: allowedIds.size,
      firstRepeat,
    };

    if (scenario.secondaryFeelings.length && metrics.secondaryInfluence === 0) {
      alerts.push(makeAlert('secondary_without_effect', 'RELEVANCE', 'Secundário não alterou o ranking', {
        secondaryFeelings: scenario.secondaryFeelings,
        commonCandidates: comparisons.secondary.commonCandidates,
      }));
    }
    if (secondaryDominanceRisk > 0) {
      alerts.push(makeAlert('secondary_dominance', 'RELEVANCE', 'Secundário ultrapassou o território principal', { secondaryDominanceRisk }));
    }
    const motivationWasRequested = scenario.needsMotivation || scenario.changes.some((change) => change.needsMotivation === true);
    if (motivationWasRequested && metrics.motivationInfluence === 0) {
      alerts.push(makeAlert('motivation_without_effect', 'RELEVANCE', 'Motivação não alterou o ranking', {
        commonCandidates: comparisons.motivation.commonCandidates,
      }));
    }
    if (metrics.motivationEligibleSetChanged) {
      alerts.push(makeAlert('motivation_changed_eligibility', 'SAFETY', 'Motivação alterou o conjunto elegível', comparisons.motivation));
    }
    if (selections.length >= 3 && new Set(selectedIds).size === 1 && allowedIds.size > 1) {
      alerts.push(makeAlert('candidate_set_collapsed', 'CIRCULATION', 'Seleções concentradas em um único conteúdo', {
        selectedId: selectedIds[0], allowedDistinct: allowedIds.size,
      }));
    }

    return {
      id: scenario.id,
      input: scenario,
      stateKey: [scenario.primaryFeeling, ...scenario.secondaryFeelings.slice().sort(), scenario.intensity].join('|'),
      metrics,
      calibration: {
        note: 'Concentração e influência são distribuições de diagnóstico; limites numéricos serão calibrados na Fase 10.',
        candidateConcentration: metrics.candidateConcentration,
        candidateConcentrationExcess: metrics.candidateConcentrationExcess,
        authorConcentration: metrics.authorConcentration,
        conceptConcentration: metrics.conceptConcentration,
      },
      alerts,
      selections,
    };
  });

  return {
    schemaVersion: 1,
    generatedAt,
    runtimeContentVersion: loaded.runtime.contentVersion,
    selectorSchemaVersion: loaded.engine.QUEUE_SELECTOR_SCHEMA_VERSION,
    rotationPolicyVersion: loaded.engine.QUEUE_ROTATION_POLICY_VERSION,
    developmentOnly: true,
    scenarios,
    summary: {
      scenarioCount: scenarios.length,
      selectionCount: scenarios.reduce((sum, scenario) => sum + scenario.selections.length, 0),
      alertCount: scenarios.reduce((sum, scenario) => sum + scenario.alerts.length, 0),
      alertsByCategory: countMap(scenarios.flatMap((scenario) => scenario.alerts.map((alert) => alert.category))),
    },
  };
}

export const DEFAULT_LAB_CONFIG = Object.freeze({
  scenarios: [
    { id: 'autoconhecimento-mistura', primaryFeeling: 'autoconhecimento', secondaryFeelings: ['confusao', 'inseguranca'], intensity: 'moderada', selections: 30 },
    { id: 'luto-saudade', primaryFeeling: 'luto', secondaryFeelings: ['saudade'], intensity: 'intensa', selections: 30 },
    { id: 'proposito-confusao', primaryFeeling: 'falta_de_proposito', secondaryFeelings: ['confusao'], intensity: 'moderada', needsMotivation: true, selections: 30 },
  ],
});

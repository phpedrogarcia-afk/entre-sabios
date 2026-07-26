import { loadReplayEnvironment } from './diagnostic-replay-lib.mjs';
import { runEmotionalLab } from './emotional-lab-lib.mjs';

const INTENSITIES = Object.freeze(['fraca', 'moderada', 'intensa']);

function quantile(values, position) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * position;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function distribution(values) {
  return {
    count: values.length,
    min: values.length ? Math.min(...values) : null,
    p10: quantile(values, 0.1),
    median: quantile(values, 0.5),
    p90: quantile(values, 0.9),
    max: values.length ? Math.max(...values) : null,
    mean: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
  };
}

export function buildSystematicAuditConfig(environment) {
  const feelings = environment.runtime.feelings.map(({ id }) => id);
  const pairProfiles = Object.values(environment.synthesisCatalog.directionalPairs);
  const triadProfiles = Object.values(environment.synthesisCatalog.triadOverrides);
  const scenarios = [];

  for (const primaryFeeling of feelings) {
    for (const intensity of INTENSITIES) {
      for (const needsMotivation of [false, true]) {
        scenarios.push({
          id: `primary:${primaryFeeling}:${intensity}:${needsMotivation ? 'on' : 'off'}`,
          auditKind: 'primary_alone', primaryFeeling, secondaryFeelings: [], intensity, needsMotivation, selections: 2,
        });
      }
    }
  }

  for (const primaryFeeling of feelings) {
    for (const secondaryFeeling of feelings.filter((feeling) => feeling !== primaryFeeling)) {
      for (const intensity of INTENSITIES) {
        scenarios.push({
          id: `pair:${primaryFeeling}:${secondaryFeeling}:${intensity}`,
          auditKind: 'ordered_pair', primaryFeeling, secondaryFeelings: [secondaryFeeling], intensity, selections: 1,
        });
      }
    }
  }

  for (const profile of pairProfiles) {
    for (const intensity of INTENSITIES) {
      scenarios.push({
        id: `priority-motivated:${profile.id}:${intensity}`,
        auditKind: 'priority_motivated_pair',
        primaryFeeling: profile.primaryFeeling,
        secondaryFeelings: profile.secondaryFeelings,
        intensity,
        needsMotivation: true,
        selections: 3,
      });
    }
    const secondary = profile.secondaryFeelings[0];
    scenarios.push({
      id: `return:${profile.id}`,
      auditKind: 'principal_inversion_and_return',
      primaryFeeling: profile.primaryFeeling,
      secondaryFeelings: [secondary],
      intensity: 'moderada',
      selections: 9,
      changes: [
        { at: 4, primaryFeeling: secondary, secondaryFeelings: [profile.primaryFeeling] },
        { at: 7, primaryFeeling: profile.primaryFeeling, secondaryFeelings: [secondary], reload: true },
      ],
    });
  }

  for (const profile of triadProfiles) {
    for (const intensity of INTENSITIES) {
      for (const needsMotivation of [false, true]) {
        scenarios.push({
          id: `triad:${profile.id}:${intensity}:${needsMotivation ? 'on' : 'off'}`,
          auditKind: 'approved_triad',
          primaryFeeling: profile.primaryFeeling,
          secondaryFeelings: profile.secondaryFeelings,
          intensity,
          needsMotivation,
          selections: 4,
        });
      }
    }
  }

  const longScenarios = [
    ['autoconhecimento', ['confusao', 'inseguranca'], 'moderada', false],
    ['luto', ['saudade'], 'intensa', false],
    ['falta_de_proposito', ['confusao'], 'moderada', true],
  ];
  longScenarios.forEach(([primaryFeeling, secondaryFeelings, intensity, needsMotivation]) => {
    scenarios.push({
      id: `long:${primaryFeeling}:${secondaryFeelings.join('+')}`,
      auditKind: 'long_session', primaryFeeling, secondaryFeelings, intensity, needsMotivation, selections: 60,
      changes: [{ at: 31, reload: true }],
    });
  });

  for (const primaryFeeling of feelings) {
    const secondaryFeeling = feelings.find((feeling) => (
      feeling !== primaryFeeling && !environment.synthesisCatalog.directionalPairs[`${primaryFeeling}__${feeling}`]
    ));
    scenarios.push({
      id: `fallback:${primaryFeeling}:${secondaryFeeling}`,
      auditKind: 'forced_fallback', primaryFeeling, secondaryFeelings: [secondaryFeeling],
      intensity: 'moderada', activateFallbacks: true, selections: 2,
    });
  }

  return {
    schemaVersion: 1,
    matrix: {
      feelings: feelings.length,
      intensities: INTENSITIES.length,
      activeDirectionalPairs: pairProfiles.length,
      activeTriads: triadProfiles.length,
      triadsCreated: 0,
    },
    scenarios,
  };
}

function compactScenario(scenario, source) {
  return {
    id: scenario.id,
    auditKind: source.auditKind,
    primaryFeeling: source.primaryFeeling,
    secondaryFeelings: source.secondaryFeelings,
    intensity: source.intensity,
    needsMotivation: source.needsMotivation === true,
    activateFallbacks: source.activateFallbacks === true,
    selectionsRequested: source.selections,
    metrics: scenario.metrics,
    alerts: scenario.alerts,
  };
}

export function summarizeSystematicAudit(labReport, config) {
  const sources = new Map(config.scenarios.map((scenario) => [scenario.id, scenario]));
  const scenarios = labReport.scenarios.map((scenario) => compactScenario(scenario, sources.get(scenario.id)));
  const withSecondary = scenarios.filter((scenario) => scenario.secondaryFeelings.length > 0);
  const motivated = scenarios.filter((scenario) => scenario.needsMotivation);
  const allAlerts = scenarios.flatMap((scenario) => scenario.alerts.map((alert) => ({ scenarioId: scenario.id, ...alert })));
  const objectiveAlertIds = new Set([
    'secondary_dominance', 'motivation_changed_eligibility', 'candidate_set_collapsed',
  ]);
  const objectiveProblems = allAlerts.filter((alert) => (
    objectiveAlertIds.has(alert.id)
    || alert.id.startsWith('primary_ignored_')
    || alert.id.startsWith('avoidable_repeat_')
    || alert.id.startsWith('current_repeat_')
    || alert.id.startsWith('selection_gap_')
  ));
  const diagnosticObservations = allAlerts.filter((alert) => !objectiveProblems.includes(alert));
  const secondaryWithoutEffect = withSecondary.filter((scenario) => scenario.metrics.secondaryInfluence === 0);
  const secondaryDominant = withSecondary.filter((scenario) => scenario.metrics.secondaryDominanceRisk > 0);
  const genericCombinations = scenarios.filter((scenario) => (
    scenario.auditKind === 'ordered_pair' && (scenario.metrics.fallbackRate.primary_modifier || 0) === 1
  ));
  const prematureRepeats = scenarios.filter((scenario) => (
    scenario.metrics.firstRepeat !== null && scenario.metrics.coverageBeforeRepeat < 1
  ));
  const candidateCountGaps = scenarios.filter((scenario) => scenario.metrics.allowedDistinct < 3);
  const formatGaps = scenarios.filter((scenario) => scenario.metrics.availableFormatCount < 2);
  const collectionGaps = [...new Map([...candidateCountGaps, ...formatGaps].map((scenario) => [scenario.id, scenario])).values()];
  const secondaryDistribution = distribution(withSecondary.map((scenario) => scenario.metrics.secondaryInfluence));
  const motivationDistribution = distribution(motivated.map((scenario) => scenario.metrics.motivationInfluence));
  const circulationScenarios = scenarios.filter((scenario) => scenario.selectionsRequested >= 3);
  const concentrationDistribution = distribution(circulationScenarios.map((scenario) => scenario.metrics.candidateConcentrationExcess));
  const lowInfluenceObservations = withSecondary.filter((scenario) => (
    scenario.metrics.secondaryInfluence > 0
    && secondaryDistribution.p10 !== null
    && scenario.metrics.secondaryInfluence <= secondaryDistribution.p10
  ));
  const highConcentrationObservations = circulationScenarios.filter((scenario) => (
    concentrationDistribution.p90 !== null
    && scenario.metrics.candidateConcentrationExcess > 0
    && scenario.metrics.candidateConcentrationExcess >= concentrationDistribution.p90
  ));

  return {
    schemaVersion: 1,
    generatedAt: labReport.generatedAt,
    runtimeContentVersion: labReport.runtimeContentVersion,
    developmentOnly: true,
    matrix: {
      ...config.matrix,
      scenarioCount: scenarios.length,
      selectionCount: labReport.summary.selectionCount,
      kinds: Object.fromEntries(config.scenarios.reduce((counts, scenario) => (
        counts.set(scenario.auditKind, (counts.get(scenario.auditKind) || 0) + 1)
      ), new Map())),
    },
    distributions: {
      secondaryInfluence: secondaryDistribution,
      motivationInfluence: motivationDistribution,
      candidateConcentration: concentrationDistribution,
      authorConcentration: distribution(circulationScenarios.map((scenario) => scenario.metrics.authorConcentration)),
      conceptConcentration: distribution(circulationScenarios.map((scenario) => scenario.metrics.conceptConcentration)),
      formatCoverage: distribution(circulationScenarios.map((scenario) => scenario.metrics.formatCoverage)),
    },
    findings: {
      objectiveProblems,
      diagnosticObservations,
      secondaryWithoutEffect: secondaryWithoutEffect.map(({ id, metrics }) => ({ id, value: metrics.secondaryInfluence })),
      secondaryDominant: secondaryDominant.map(({ id, metrics }) => ({ id, value: metrics.secondaryDominanceRisk })),
      genericCombinations: genericCombinations.map(({ id }) => id),
      prematureRepeats: prematureRepeats.map(({ id, metrics }) => ({ id, firstRepeat: metrics.firstRepeat, coverage: metrics.coverageBeforeRepeat })),
      collectionGaps: collectionGaps.map(({ id, metrics }) => ({
        id, allowedDistinct: metrics.allowedDistinct, availableFormatCount: metrics.availableFormatCount,
      })),
      candidateCountGaps: candidateCountGaps.map(({ id, metrics }) => ({ id, allowedDistinct: metrics.allowedDistinct })),
      formatGaps: formatGaps.map(({ id, metrics }) => ({ id, availableFormatCount: metrics.availableFormatCount })),
      lowInfluenceObservations: lowInfluenceObservations.map(({ id, metrics }) => ({ id, value: metrics.secondaryInfluence })),
      highConcentrationObservations: highConcentrationObservations.map(({ id, metrics }) => ({ id, value: metrics.candidateConcentrationExcess })),
    },
    scenarios,
  };
}

export function runSystematicAudit({ rootDir, generatedAt = new Date().toISOString(), environment = null } = {}) {
  const loaded = environment || loadReplayEnvironment(rootDir);
  const config = buildSystematicAuditConfig(loaded);
  const labReport = runEmotionalLab(config, { rootDir, environment: loaded, generatedAt });
  return summarizeSystematicAudit(labReport, config);
}

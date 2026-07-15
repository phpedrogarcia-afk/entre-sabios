// Leitura do estado emocional selecionado.
// A seleção mutável continua em selectedFeelingIds, primaryFeelingId,
// currentIntensity e needsMotivation. O contrato abaixo é apenas uma projeção
// normalizada para as próximas integrações; não mantém um segundo estado.

const MAX_SECONDARY_FEELINGS = 2;
const VALID_INTENSITIES = new Set(['fraca', 'moderada', 'intensa']);

function normalizeSelectionFeelingId(value) {
  return typeof value === 'string' && value.trim() ? normalizeTheme(value.trim()) : '';
}

function getValidSelectionFeelingIds(catalog = feelingsCatalog) {
  return new Set((Array.isArray(catalog) ? catalog : [])
    .map((feeling) => normalizeSelectionFeelingId(feeling?.id))
    .filter(Boolean));
}

function buildDirectionalSelectionKey(primaryFeeling, secondaryFeelings = []) {
  if (!primaryFeeling) return '';
  return [primaryFeeling, ...secondaryFeelings.slice().sort()].join('__');
}

function normalizeEmotionalSelection(selection = {}, catalog = feelingsCatalog) {
  const validFeelingIds = getValidSelectionFeelingIds(catalog);
  const sourceFeelings = Array.isArray(selection.feelings)
    ? selection.feelings
    : Array.from(selection.feelings || []);
  const distinctFeelings = Array.from(new Set(sourceFeelings
    .map(normalizeSelectionFeelingId)
    .filter((feeling) => validFeelingIds.has(feeling))));
  const requestedPrimary = normalizeSelectionFeelingId(selection.primaryFeeling);
  const primaryFeeling = validFeelingIds.has(requestedPrimary) && distinctFeelings.includes(requestedPrimary)
    ? requestedPrimary
    : (distinctFeelings[0] || null);
  const secondaryFeelings = distinctFeelings
    .filter((feeling) => feeling !== primaryFeeling)
    .slice(0, MAX_SECONDARY_FEELINGS);
  const feelings = primaryFeeling ? [primaryFeeling, ...secondaryFeelings] : [];
  const intensity = VALID_INTENSITIES.has(selection.intensity) ? selection.intensity : 'moderada';
  const normalizedNeedsMotivation = Boolean(primaryFeeling) && selection.needsMotivation === true;

  return {
    feelings,
    primaryFeeling,
    secondaryFeelings,
    intensity,
    needsMotivation: normalizedNeedsMotivation,
    directionalKey: buildDirectionalSelectionKey(primaryFeeling, secondaryFeelings),
  };
}

function getCurrentSelectionContract() {
  const feelings = getSelectedFeelingIds();
  if (feelings.length === 0) needsMotivation = false;
  return normalizeEmotionalSelection({
    feelings,
    primaryFeeling: primaryFeelingId,
    intensity: currentIntensity,
    needsMotivation,
  });
}

function interpretEmotionalState() {
  const feelings = getSelectedFeelingIds();
  const primaryFeeling = feelings.includes(primaryFeelingId) ? primaryFeelingId : (feelings[0] || null);
  const secondaryFeelings = feelings.filter((feeling) => feeling !== primaryFeeling);
  const taxonomy = emotionalTaxonomy[primaryFeeling] || { families: {} };
  const rootThemeDefinitions = Object.entries(taxonomy.families || {}).flatMap(([family, definition]) =>
    definition.themes.map((theme) => ({
      theme: normalizeTheme(theme), family, weight: definition.weight, specificity: definition.specificity,
    }))
  );
  const secondaryThemes = feelingsCatalog
    .filter((feeling) => secondaryFeelings.includes(normalizeTheme(feeling.id)))
    .flatMap((feeling) => feeling.themes || [])
    .map(normalizeTheme);
  const combinationThemes = [];

  combinationRules.forEach((rule) => {
    if (rule.feelings.every((feeling) => feelings.includes(normalizeTheme(feeling)))) {
      rule.themes.forEach((theme) => combinationThemes.push(normalizeTheme(theme)));
    }
  });

  const intensityProfile = intensityProfiles[currentIntensity] || intensityProfiles.moderada;
  const selectionContract = getCurrentSelectionContract();

  return {
    feelings,
    primaryFeeling,
    secondaryFeelings,
    rootThemeDefinitions,
    secondaryThemes: Array.from(new Set(secondaryThemes)),
    combinationThemes: Array.from(new Set(combinationThemes)),
    intensityThemes: intensityProfile.themes.map(normalizeTheme),
    intensity: currentIntensity,
    suitableTones: intensityProfile.suitableTones.map(normalizeTheme),
    needsMotivation: selectionContract.needsMotivation,
    directionalKey: selectionContract.directionalKey,
    selectionContract,
  };
}

function getSelectedFeelingIds() {
  return Array.from(selectedFeelingIds).map(normalizeTheme);
}

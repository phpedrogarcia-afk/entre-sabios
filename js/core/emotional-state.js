// Leitura do estado emocional selecionado.
// Extraído de script.js na Fase 3 da refatoração segura.
// Não alterar pesos, regras ou comportamento nesta fase.

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
    genderPreference: currentGenderPreference,
  };
}

function getSelectedFeelingIds() {
  return Array.from(selectedFeelingIds).map(normalizeTheme);
}

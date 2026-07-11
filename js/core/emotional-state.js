// Leitura do estado emocional selecionado.
// Extraído de script.js na Fase 3 da refatoração segura.
// Não alterar pesos, regras ou comportamento nesta fase.

function interpretEmotionalState() {
  const feelings = getSelectedFeelingIds();
  const primaryFeeling = feelings[0] || null;
  const secondaryFeelings = feelings.slice(1);
  const themes = new Set(getSelectedThemes().map(normalizeTheme));

  combinationRules.forEach((rule) => {
    if (rule.feelings.every((feeling) => feelings.includes(feeling))) {
      rule.themes.forEach((theme) => themes.add(normalizeTheme(theme)));
    }
  });

  const intensity = intensityProfiles[currentIntensity] || intensityProfiles.moderada;
  intensity.themes.forEach((theme) => themes.add(normalizeTheme(theme)));

  return {
    feelings,
    primaryFeeling,
    secondaryFeelings,
    intensity: currentIntensity,
    psychologicalThemes: Array.from(themes),
    suitableTones: intensity.suitableTones,
  };
}

function getSelectedFeelingIds() {
  return Array.from(selectedFeelingIds);
}

function getSelectionKey() {
  return getSelectedFeelingIds().sort().join('|') || 'sem_sentimento';
}

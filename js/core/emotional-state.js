// Leitura do estado emocional selecionado.
// A seleção mutável continua em selectedFeelingIds, primaryFeelingId,
// O contrato abaixo é apenas uma projeção
// normalizada para as próximas integrações; não mantém um segundo estado.

const emotionalSelectionContract = globalThis.EntreSabiosEmotionalSelectionContract;
const MAX_SECONDARY_FEELINGS = emotionalSelectionContract.MAX_SECONDARY_FEELINGS;
const VALID_INTENSITY_VALUES = emotionalSelectionContract.VALID_INTENSITY_VALUES;

function normalizeEmotionalSelection(selection = {}, catalog = feelingsCatalog) {
  return emotionalSelectionContract.normalizeSelection(selection, catalog, normalizeTheme);
}

function resolveGenerationIntensity(progressionStep = 0) {
  return emotionalSelectionContract.resolveGenerationIntensity(progressionStep);
}

function getCurrentSelectionContract(intensity = null) {
  const feelings = getSelectedFeelingIds();
  return normalizeEmotionalSelection({
    feelings,
    primaryFeeling: primaryFeelingId,
    intensity,
    needsMotivation: false,
  });
}

function interpretEmotionalState(intensity = null) {
  const feelings = getSelectedFeelingIds();
  return emotionalSelectionContract.interpretSelection({
    feelings,
    primaryFeeling: primaryFeelingId,
    intensity,
  }, {
    feelingsCatalog,
    intensityProfiles,
    combinationRules,
    emotionalTaxonomy,
    normalizeTheme,
  });
}

function getSelectedFeelingIds() {
  return Array.from(selectedFeelingIds).map(normalizeTheme);
}

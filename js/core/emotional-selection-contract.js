(function initEmotionalSelectionContract(root) {
  const MAX_SECONDARY_FEELINGS = 2;
  const VALID_INTENSITY_VALUES = Object.freeze(['fraca', 'moderada', 'intensa']);
  const VALID_INTENSITIES = new Set(VALID_INTENSITY_VALUES);

  function defaultNormalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function normalizeSelectionFeelingId(value, normalizeTheme = defaultNormalize) {
    return typeof value === 'string' && value.trim() ? normalizeTheme(value.trim()) : '';
  }

  function getValidSelectionFeelingIds(catalog = [], normalizeTheme = defaultNormalize) {
    return new Set((Array.isArray(catalog) ? catalog : [])
      .map((feeling) => normalizeSelectionFeelingId(feeling?.id, normalizeTheme))
      .filter(Boolean));
  }

  function buildDirectionalSelectionKey(primaryFeeling, secondaryFeelings = []) {
    if (!primaryFeeling) return '';
    return [primaryFeeling, ...secondaryFeelings.slice().sort()].join('__');
  }

  function normalizeSelection(selection = {}, catalog = [], normalizeTheme = defaultNormalize) {
    const validFeelingIds = getValidSelectionFeelingIds(catalog, normalizeTheme);
    const sourceFeelings = Array.isArray(selection.feelings)
      ? selection.feelings
      : Array.from(selection.feelings || []);
    const distinctFeelings = Array.from(new Set(sourceFeelings
      .map((feeling) => normalizeSelectionFeelingId(feeling, normalizeTheme))
      .filter((feeling) => validFeelingIds.has(feeling))));
    const requestedPrimary = normalizeSelectionFeelingId(selection.primaryFeeling, normalizeTheme);
    const primaryFeeling = validFeelingIds.has(requestedPrimary) && distinctFeelings.includes(requestedPrimary)
      ? requestedPrimary
      : (distinctFeelings[0] || null);
    const secondaryFeelings = distinctFeelings
      .filter((feeling) => feeling !== primaryFeeling)
      .slice(0, MAX_SECONDARY_FEELINGS);
    const feelings = primaryFeeling ? [primaryFeeling, ...secondaryFeelings] : [];
    const intensity = VALID_INTENSITIES.has(selection.intensity) ? selection.intensity : null;

    return {
      feelings,
      primaryFeeling,
      secondaryFeelings,
      intensity,
      needsMotivation: Boolean(primaryFeeling) && selection.needsMotivation === true,
      directionalKey: buildDirectionalSelectionKey(primaryFeeling, secondaryFeelings),
    };
  }

  function resolveGenerationIntensity(progressionStep = 0) {
    const safeStep = Number.isInteger(progressionStep) && progressionStep > 0 ? progressionStep : 0;
    if (safeStep === 0) return 'fraca';
    if (safeStep < 3) return 'moderada';
    return safeStep % 3 === 0 ? 'intensa' : 'moderada';
  }

  function interpretSelection(selection = {}, catalogs = {}) {
    const normalizeTheme = catalogs.normalizeTheme || defaultNormalize;
    const selectionContract = normalizeSelection(selection, catalogs.feelingsCatalog, normalizeTheme);
    const {
      feelings, primaryFeeling, secondaryFeelings, intensity,
    } = selectionContract;
    const taxonomy = catalogs.emotionalTaxonomy?.[primaryFeeling] || { families: {} };
    const rootThemeDefinitions = Object.entries(taxonomy.families || {}).flatMap(([family, definition]) =>
      (definition.themes || []).map((theme) => ({
        theme: normalizeTheme(theme),
        family,
        weight: definition.weight,
        specificity: definition.specificity,
      })));
    const secondaryThemes = (catalogs.feelingsCatalog || [])
      .filter((feeling) => secondaryFeelings.includes(normalizeTheme(feeling.id)))
      .flatMap((feeling) => feeling.themes || [])
      .map(normalizeTheme);
    const combinationThemes = [];

    (catalogs.combinationRules || []).forEach((rule) => {
      if ((rule.feelings || []).every((feeling) => feelings.includes(normalizeTheme(feeling)))) {
        (rule.themes || []).forEach((theme) => combinationThemes.push(normalizeTheme(theme)));
      }
    });

    const intensityProfile = intensity ? catalogs.intensityProfiles?.[intensity] : null;
    return {
      feelings,
      primaryFeeling,
      secondaryFeelings,
      rootThemeDefinitions,
      secondaryThemes: Array.from(new Set(secondaryThemes)),
      combinationThemes: Array.from(new Set(combinationThemes)),
      intensityThemes: (intensityProfile?.themes || []).map(normalizeTheme),
      intensity,
      suitableTones: (intensityProfile?.suitableTones || []).map(normalizeTheme),
      needsMotivation: selectionContract.needsMotivation,
      directionalKey: selectionContract.directionalKey,
      selectionContract,
    };
  }

  root.EntreSabiosEmotionalSelectionContract = {
    MAX_SECONDARY_FEELINGS,
    VALID_INTENSITY_VALUES,
    buildDirectionalSelectionKey,
    interpretSelection,
    normalizeSelection,
    resolveGenerationIntensity,
  };
})(typeof window !== 'undefined' ? window : globalThis);

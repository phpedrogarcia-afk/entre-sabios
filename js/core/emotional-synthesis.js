// Resolvedor local e determinístico das sínteses editoriais.
// Não seleciona conteúdos e não conhece o ranking do acervo.
(function initEmotionalSynthesis(root) {
  function unique(values) {
    return Array.from(new Set((values || []).filter(Boolean)));
  }

  function getContractKey(contract = {}) {
    if (!contract.primaryFeeling) return '';
    return [contract.primaryFeeling, ...(contract.secondaryFeelings || []).slice(0, 2).sort()].join('__');
  }

  function isAvailable(entry, includeProposed) {
    return Boolean(entry) && (entry.status === 'reviewed' || (includeProposed && entry.status === 'proposed'));
  }

  function validateCatalog(catalog) {
    const errors = [];
    if (!catalog || typeof catalog !== 'object') return ['Catálogo de sínteses ausente.'];
    if (typeof catalog.version !== 'string' || !catalog.version) errors.push('Versão ausente.');
    for (const collectionName of ['primaryProfiles', 'directionalPairs', 'triadOverrides', 'secondaryModifiers', 'themeAdapters', 'fallbackProfiles']) {
      if (!catalog[collectionName] || typeof catalog[collectionName] !== 'object') errors.push(`Coleção ausente: ${collectionName}.`);
    }
    for (const [key, profile] of Object.entries(catalog.directionalPairs || {})) {
      if (profile.id !== key) errors.push(`ID divergente no par ${key}.`);
      if (!profile.primaryFeeling || profile.secondaryFeelings?.length !== 1) errors.push(`Direção inválida no par ${key}.`);
      if (!profile.humanSummary || !profile.editorialRationale) errors.push(`Texto editorial incompleto no par ${key}.`);
      if (!['low', 'medium', 'high'].includes(profile.confidence)) errors.push(`Confiança inválida no par ${key}.`);
      if (!['low', 'medium', 'high'].includes(profile.ambiguity)) errors.push(`Ambiguidade inválida no par ${key}.`);
      if (!['proposed', 'reviewed', 'disabled'].includes(profile.status)) errors.push(`Status inválido no par ${key}.`);
    }
    for (const [key, profile] of Object.entries(catalog.triadOverrides || {})) {
      if (profile.id !== key || profile.secondaryFeelings?.length !== 2) errors.push(`Tríade inválida: ${key}.`);
    }
    return errors;
  }

  function mergePairWithModifier(pair, remainingSecondary, modifiers) {
    const modifier = remainingSecondary ? modifiers[remainingSecondary] : null;
    if (!modifier) return pair;
    return {
      ...pair,
      hiddenThemes: unique([...(pair.hiddenThemes || []), ...(modifier.hiddenThemes || [])]),
      preferredExistingSignals: {
        themes: unique([...(pair.preferredExistingSignals?.themes || []), ...(modifier.preferredThemes || [])]),
        editorialFunctions: unique(pair.preferredExistingSignals?.editorialFunctions),
        tones: unique(pair.preferredExistingSignals?.tones),
      },
      appliedModifier: remainingSecondary,
    };
  }

  function createResolver(catalog) {
    const validationErrors = validateCatalog(catalog);

    function resolve(contract = {}, options = {}) {
      const includeProposed = options.includeProposed === true;
      const primaryFeeling = contract.primaryFeeling || null;
      const secondaryFeelings = unique(contract.secondaryFeelings).filter((feeling) => feeling !== primaryFeeling).slice(0, 2);
      const directionalKey = getContractKey({ primaryFeeling, secondaryFeelings });
      const base = {
        version: catalog?.version || null,
        directionalKey,
        primaryFeeling,
        secondaryFeelings,
        needsMotivation: contract.needsMotivation === true,
      };

      if (!primaryFeeling || secondaryFeelings.length === 0) return null;
      if (validationErrors.length) return { ...base, fallbackLevel: 5, profile: null, reason: 'invalid_catalog', validationErrors };

      const triad = catalog.triadOverrides[directionalKey];
      if (secondaryFeelings.length === 2 && isAvailable(triad, includeProposed)) {
        return { ...base, fallbackLevel: 1, profile: { ...triad }, reason: 'exact_triad' };
      }

      const pairCandidates = secondaryFeelings.slice().sort().map((secondaryFeeling) => ({
        secondaryFeeling,
        key: `${primaryFeeling}__${secondaryFeeling}`,
        profile: catalog.directionalPairs[`${primaryFeeling}__${secondaryFeeling}`],
      })).filter(({ profile }) => isAvailable(profile, includeProposed));
      if (pairCandidates.length) {
        const chosen = pairCandidates[0];
        const remainingSecondary = secondaryFeelings.find((feeling) => feeling !== chosen.secondaryFeeling);
        return {
          ...base,
          fallbackLevel: 2,
          profile: mergePairWithModifier(chosen.profile, remainingSecondary, catalog.secondaryModifiers),
          reason: remainingSecondary ? 'directional_pair_with_modifier' : 'exact_directional_pair',
        };
      }

      const primaryProfile = catalog.primaryProfiles[primaryFeeling];
      const cautiousFallback = catalog.fallbackProfiles.cautious;
      if (isAvailable(primaryProfile, includeProposed) && isAvailable(cautiousFallback, includeProposed)) {
        const modifiers = secondaryFeelings.map((feeling) => catalog.secondaryModifiers[feeling]).filter(Boolean);
        return {
          ...base,
          fallbackLevel: 3,
          profile: {
            id: directionalKey,
            primaryFeeling,
            secondaryFeelings,
            humanSummary: cautiousFallback.humanSummary,
            hiddenThemes: unique([...(primaryProfile.focusThemes || []), ...modifiers.flatMap((modifier) => modifier.hiddenThemes || [])]),
            preferredExistingSignals: {
              themes: unique([...(primaryProfile.focusThemes || []), ...modifiers.flatMap((modifier) => modifier.preferredThemes || [])]),
              editorialFunctions: [],
              tones: [],
            },
            confidence: cautiousFallback.confidence,
            ambiguity: cautiousFallback.ambiguity,
            status: cautiousFallback.status,
          },
          reason: 'primary_profile_with_modifiers',
        };
      }

      if (isAvailable(cautiousFallback, includeProposed)) {
        return { ...base, fallbackLevel: 4, profile: { ...cautiousFallback, id: directionalKey }, reason: 'cautious_fallback' };
      }

      return { ...base, fallbackLevel: 5, profile: null, reason: 'current_algorithm_only' };
    }

    return { resolve, validationErrors: validationErrors.slice() };
  }

  root.EntreSabiosEmotionalSynthesis = { createResolver, getContractKey, validateCatalog };
})(typeof window !== 'undefined' ? window : globalThis);

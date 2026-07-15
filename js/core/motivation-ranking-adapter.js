// Preferência motivacional contextual e determinística.
// É neutra quando desligada e nunca participa da elegibilidade.
(function initMotivationRankingAdapter(root) {
  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function normalizedSet(values) {
    return new Set((values || []).map(normalize).filter(Boolean));
  }

  function createAdapter(catalog = {}) {
    function resolveState(state = {}) {
      const active = state.needsMotivation === true;
      const sourceProfile = catalog.primaryProfiles?.[state.primaryFeeling] || catalog.defaultProfile || null;
      const profile = sourceProfile?.status === 'reviewed' ? sourceProfile : null;
      return {
        active,
        primaryFeeling: state.primaryFeeling || null,
        profile,
        minimumIndependentSignals: Math.max(2, Number(catalog.minimumIndependentSignals) || 2),
        preferredThemes: normalizedSet(profile?.preferredThemes),
        preferredEditorialFunctions: normalizedSet(profile?.preferredEditorialFunctions),
        preferredTones: normalizedSet(profile?.preferredTones),
      };
    }

    function evaluate(content, context) {
      if (!context?.active || !context.profile) {
        return {
          vector: [0, 0, 0], applied: false, strongMatch: false,
          matchedThemes: [], matchedEditorialFunction: null, matchedTone: null,
          reason: context?.active ? 'profile_unavailable' : 'motivation_disabled',
        };
      }
      const matchedThemes = [...normalizedSet(content.themes)]
        .filter((theme) => context.preferredThemes.has(theme));
      const normalizedFunction = normalize(content.editorialFunction);
      const normalizedTone = normalize(content.tone);
      const matchedEditorialFunction = context.preferredEditorialFunctions.has(normalizedFunction)
        ? content.editorialFunction : null;
      const matchedTone = context.preferredTones.has(normalizedTone) ? content.tone : null;
      const dimensions = [matchedThemes.length > 0, Boolean(matchedEditorialFunction), Boolean(matchedTone)];
      const strongMatch = dimensions.filter(Boolean).length >= context.minimumIndependentSignals;
      return {
        vector: strongMatch ? dimensions.map((matched) => (matched ? 1 : 0)) : [0, 0, 0],
        applied: strongMatch,
        strongMatch,
        matchedThemes,
        matchedEditorialFunction,
        matchedTone,
        reason: strongMatch ? 'independent_signals_confirmed' : 'insufficient_independent_signals',
      };
    }

    function compare(first, second) {
      const firstVector = first?.vector || [0, 0, 0];
      const secondVector = second?.vector || [0, 0, 0];
      for (let index = 0; index < 3; index += 1) {
        if (firstVector[index] !== secondVector[index]) return secondVector[index] - firstVector[index];
      }
      return 0;
    }

    function describeContext(context) {
      if (!context) return null;
      return {
        active: context.active,
        primaryFeeling: context.primaryFeeling,
        profileAvailable: Boolean(context.profile),
        minimumIndependentSignals: context.minimumIndependentSignals,
      };
    }

    return { compare, describeContext, evaluate, resolveState };
  }

  root.EntreSabiosMotivationRankingAdapter = { createAdapter };
})(typeof window !== 'undefined' ? window : globalThis);

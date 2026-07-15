// Adapta sínteses editoriais já resolvidas aos metadados existentes do acervo.
// Não decide elegibilidade, não lê o texto humano da síntese e não usa motivação.
(function initSynthesisRankingAdapter(root) {
  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function uniqueNormalized(values) {
    return Array.from(new Set((values || []).map(normalize).filter(Boolean)));
  }

  function getInfluencePolicy(profile) {
    if (!profile || profile.confidence === 'low' || profile.ambiguity === 'high') {
      return { themeLimit: 1, useEditorialFunction: false, useTone: false, label: 'minimal' };
    }
    if (profile.confidence === 'high' && profile.ambiguity === 'low') {
      return { themeLimit: 2, useEditorialFunction: true, useTone: true, label: 'limited_full' };
    }
    return { themeLimit: 1, useEditorialFunction: true, useTone: false, label: 'limited' };
  }

  function createAdapter({ catalog, resolver } = {}) {
    function resolveState(state = {}) {
      const contract = state.selectionContract || {
        primaryFeeling: state.primaryFeeling,
        secondaryFeelings: state.secondaryFeelings || [],
        intensity: state.intensity,
        needsMotivation: state.needsMotivation === true,
      };
      const resolution = resolver?.resolve(contract) || null;
      const profile = resolution?.profile || null;
      if (!profile) return { resolution, profile: null, mappedThemes: [], policy: getInfluencePolicy(null) };

      const preferredThemes = profile.preferredExistingSignals?.themes || [];
      const mappedHiddenThemes = (profile.hiddenThemes || []).flatMap((theme) => catalog?.themeAdapters?.[theme] || []);
      return {
        resolution,
        profile,
        mappedThemes: uniqueNormalized([...preferredThemes, ...mappedHiddenThemes]),
        preferredEditorialFunctions: uniqueNormalized(profile.preferredExistingSignals?.editorialFunctions),
        preferredTones: uniqueNormalized(profile.preferredExistingSignals?.tones),
        policy: getInfluencePolicy(profile),
      };
    }

    function evaluate(content, context) {
      if (!context?.profile) {
        return {
          vector: [0, 0, 0], matchedThemes: [], matchedEditorialFunction: null,
          matchedTone: null, applied: false, influencePolicy: 'none',
        };
      }
      const contentThemes = new Set(uniqueNormalized(content.themes));
      const matchedThemes = context.mappedThemes.filter((theme) => contentThemes.has(theme));
      const normalizedFunction = normalize(content.editorialFunction);
      const normalizedTone = normalize(content.tone);
      const matchedEditorialFunction = context.preferredEditorialFunctions.includes(normalizedFunction)
        ? content.editorialFunction : null;
      const matchedTone = context.preferredTones.includes(normalizedTone) ? content.tone : null;
      const vector = [
        Math.min(matchedThemes.length, context.policy.themeLimit),
        context.policy.useEditorialFunction && matchedEditorialFunction ? 1 : 0,
        context.policy.useTone && matchedTone ? 1 : 0,
      ];
      return {
        vector,
        matchedThemes,
        matchedEditorialFunction,
        matchedTone,
        applied: vector.some(Boolean),
        influencePolicy: context.policy.label,
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
      if (!context?.profile) return null;
      return {
        directionalKey: context.resolution.directionalKey,
        fallbackLevel: context.resolution.fallbackLevel,
        resolutionReason: context.resolution.reason,
        hiddenThemes: [...(context.profile.hiddenThemes || [])],
        mappedThemes: [...context.mappedThemes],
        confidence: context.profile.confidence,
        ambiguity: context.profile.ambiguity,
        influencePolicy: context.policy.label,
      };
    }

    return { compare, describeContext, evaluate, resolveState };
  }

  root.EntreSabiosSynthesisRankingAdapter = { createAdapter };
})(typeof window !== 'undefined' ? window : globalThis);

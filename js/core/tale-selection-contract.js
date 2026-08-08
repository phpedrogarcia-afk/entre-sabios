(function initTaleSelectionContract(root) {
  function defaultNormalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function normalizeList(list = [], normalizeTheme = defaultNormalize) {
    return (Array.isArray(list) ? list : []).map(normalizeTheme);
  }

  function getEditorialThemes(state = {}, normalizeTheme = defaultNormalize) {
    return Array.from(new Set([
      ...(state.rootThemeDefinitions || []).map((definition) => definition.theme),
      ...(state.secondaryThemes || []),
      ...(state.combinationThemes || []),
    ].map(normalizeTheme)));
  }

  function scoreTale(tale, state = {}, currentStory = null, normalizeTheme = defaultNormalize) {
    let score = 0;
    const selectedThemes = new Set(getEditorialThemes(state, normalizeTheme));
    const taleFeelings = normalizeList(tale?.sentimentosRelacionados, normalizeTheme);
    const taleThemes = normalizeList(tale?.temas, normalizeTheme);
    const taleKeywords = normalizeList(tale?.palavrasChave, normalizeTheme);

    if (state.primaryFeeling && taleFeelings.includes(normalizeTheme(state.primaryFeeling))) score += 8;
    (state.secondaryFeelings || []).forEach((feeling) => {
      if (taleFeelings.includes(normalizeTheme(feeling))) score += 4;
    });
    taleThemes.forEach((theme) => { if (selectedThemes.has(theme)) score += 2; });
    taleKeywords.forEach((keyword) => { if (selectedThemes.has(keyword)) score += 1.5; });

    if (currentStory) {
      const storyThemes = new Set([...(currentStory.rawTags || []), ...(currentStory.temas || [])].map(normalizeTheme));
      taleThemes.forEach((theme) => { if (storyThemes.has(theme)) score += 1.2; });
    }
    return score;
  }

  function selectionKey(state = {}, normalizeTheme = defaultNormalize) {
    return [...(state.feelings || []), state.intensity]
      .map(normalizeTheme)
      .filter(Boolean)
      .sort()
      .join('|') || 'sem_sentimento';
  }

  function nearbyThemeScore(tale, state = {}, normalizeTheme = defaultNormalize) {
    const selectedThemes = new Set(getEditorialThemes(state, normalizeTheme));
    return [
      ...normalizeList(tale?.temas, normalizeTheme),
      ...normalizeList(tale?.palavrasChave, normalizeTheme),
    ].reduce((total, theme) => total + (selectedThemes.has(theme) ? 1 : 0), 0);
  }

  function rankTales({ tales = [], state = {}, currentStory = null, viewedTaleKeys = [], recentTaleKeys = [], sessionViewedIds = [], normalizeTheme = defaultNormalize }) {
    const key = selectionKey(state, normalizeTheme);
    return tales.map((tale) => {
      const baseScore = scoreTale(tale, state, currentStory, normalizeTheme);
      const viewedForSelection = viewedTaleKeys.includes(`${key}::${tale.id}`);
      const recentlyViewed = recentTaleKeys.includes(tale.id);
      const viewedInSession = sessionViewedIds.includes(tale.id);
      return {
        tale,
        baseScore,
        score: baseScore - (viewedForSelection ? 5 : 0) - (recentlyViewed ? 4 : 0),
        viewedForSelection,
        recentlyViewed,
        viewedInSession,
      };
    }).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.baseScore !== a.baseScore) return b.baseScore - a.baseScore;
      return String(a.tale.titulo || '').localeCompare(String(b.tale.titulo || ''), 'pt-BR');
    });
  }

  function selectTale(options = {}) {
    const {
      tales = [], state = {}, currentStory = null, viewedTaleKeys = [], recentTaleKeys = [],
      sessionViewedIds = [], gradualVariety = false, normalizeTheme = defaultNormalize,
    } = options;
    let session = [...sessionViewedIds];
    const restartedJourney = tales.length > 0 && session.length >= tales.length;
    if (restartedJourney) session = [];

    const ranked = rankTales({ tales, state, currentStory, viewedTaleKeys, recentTaleKeys, sessionViewedIds: session, normalizeTheme });
    const notSeen = ranked.filter((candidate) => !candidate.viewedInSession);
    const compatible = notSeen.filter((candidate) => candidate.baseScore > 0);
    const bestCompatibleScore = compatible[0]?.baseScore || 0;
    const compatiblePool = gradualVariety
      ? compatible
      : compatible.filter((candidate) => candidate.baseScore >= Math.max(1, bestCompatibleScore - 4));
    const nearbyPool = notSeen.map((candidate) => ({
      ...candidate,
      nearbyThemeScore: nearbyThemeScore(candidate.tale, state, normalizeTheme),
    })).filter((candidate) => candidate.nearbyThemeScore > 0).sort((a, b) => {
      if (b.nearbyThemeScore !== a.nearbyThemeScore) return b.nearbyThemeScore - a.nearbyThemeScore;
      if (b.baseScore !== a.baseScore) return b.baseScore - a.baseScore;
      return String(a.tale.titulo || '').localeCompare(String(b.tale.titulo || ''), 'pt-BR');
    });
    const picked = compatiblePool[0] || nearbyPool[0] || notSeen[0] || ranked[0];
    const tale = picked?.tale || tales[0] || null;
    const key = selectionKey(state, normalizeTheme);

    return {
      tale,
      restartedJourney,
      history: tale ? {
        sessionViewedIds: [...session.filter((id) => id !== tale.id), tale.id],
        viewedTaleKeys: [...viewedTaleKeys.filter((item) => item !== `${key}::${tale.id}`), `${key}::${tale.id}`].slice(-120),
        recentTaleKeys: [...recentTaleKeys.filter((id) => id !== tale.id), tale.id].slice(-6),
      } : { sessionViewedIds: session, viewedTaleKeys, recentTaleKeys },
    };
  }

  root.EntreSabiosTaleSelectionContract = {
    getEditorialThemes,
    nearbyThemeScore,
    normalizeList,
    rankTales,
    scoreTale,
    selectTale,
    selectionKey,
  };
})(typeof window !== 'undefined' ? window : globalThis);

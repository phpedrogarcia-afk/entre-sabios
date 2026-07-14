// Recomendação hierárquica de livros alinhada ao conteúdo e ao sentimento principal.
function getStoryIntensity(story) {
  return story.emotionalState?.intensity || currentIntensity || 'moderada';
}

function getStoryFeelings(story) {
  return story.emotionalState?.feelings || story.selectedFeelingIds || [];
}

function getTargetBookFunctions(story) {
  const state = story.emotionalState || interpretEmotionalState();
  if (state.intensity === 'intensa' && ['luto', 'tristeza', 'saudade', 'medo'].includes(state.primaryFeeling)) return ['validacao', 'dissolucao', 'acao'];
  if (['ansiedade', 'confusao', 'medo', 'inseguranca'].includes(state.primaryFeeling)) return ['dissolucao', 'validacao', 'acao'];
  if (state.primaryFeeling === 'falta_de_proposito') return ['acao', 'dissolucao', 'validacao'];
  if (state.primaryFeeling === 'raiva') return ['dissolucao', 'acao', 'choque'];
  if (state.primaryFeeling === 'culpa') return ['acao', 'dissolucao', 'choque'];
  return ['validacao', 'dissolucao', 'acao'];
}

function violatesBookAvoidance(book, state) {
  return (book.avoidWhen || []).some((rule) => {
    const [feeling, intensity] = rule.split(':').map(normalizeTheme);
    return feeling === state.primaryFeeling && (!intensity || intensity === state.intensity);
  });
}

function evaluateBookCandidate(book, story) {
  const state = story.emotionalState || interpretEmotionalState();
  const storyAuthor = normalizeAuthorName(story.inspirationSource || story.displayAuthor || story.author);
  const bookAuthor = normalizeAuthorName(book.author);
  const relatedAuthors = (book.relatedAuthors || []).map(normalizeAuthorName);
  const sameAuthor = storyAuthor === bookAuthor;
  const authorRelation = sameAuthor || relatedAuthors.includes(storyAuthor);
  const primaryFeelingMatch = book.feelings.includes(state.primaryFeeling);
  const rootThemes = new Set(state.rootThemeDefinitions.map((item) => item.theme));
  const storyThemes = new Set([...(story.rawTags || []), ...(story.temas || [])].map(normalizeTheme));
  const rootThemeMatches = book.themes.filter((theme) => rootThemes.has(theme));
  const contentThemeMatches = book.themes.filter((theme) => storyThemes.has(theme));
  const targetFunctions = getTargetBookFunctions(story);
  const functionFit = Math.max(0, 3 - Math.max(0, targetFunctions.indexOf(book.bookFunction)));
  const intensityFit = book.intensities.includes(state.intensity) ? 1 : 0;
  const preferenceScore = Math.max(-2, Math.min(2, preferenceProfile.books[book.title] || 0));
  const isExcluded = violatesBookAvoidance(book, state);
  const hasSubstantiveRelation = primaryFeelingMatch || rootThemeMatches.length > 0 || contentThemeMatches.length > 0;
  const isEligible = !isExcluded && book.hasEditorialDescription && hasSubstantiveRelation && intensityFit === 1;
  const reasons = [];
  if (sameAuthor) reasons.push('obra do autor da reflexão');
  else if (authorRelation) reasons.push('autoria ou tradição relacionada');
  if (primaryFeelingMatch) reasons.push('sentimento principal');
  if (rootThemeMatches.length) reasons.push(`${rootThemeMatches.length} tema(s) raiz`);
  if (contentThemeMatches.length) reasons.push(`${contentThemeMatches.length} tema(s) do conteúdo`);
  return {
    book, isExcluded, isEligible, hasSubstantiveRelation, sameAuthor, authorRelation,
    primaryFeelingMatch, rootThemeMatches, contentThemeMatches,
    functionFit, intensityFit, preferenceScore, targetFunctions, reasons,
  };
}

function compareBookCandidates(a, b) {
  const dimensions = [
    [Number(b.primaryFeelingMatch), Number(a.primaryFeelingMatch)],
    [b.rootThemeMatches.length, a.rootThemeMatches.length],
    [b.contentThemeMatches.length, a.contentThemeMatches.length],
    [b.functionFit, a.functionFit],
    [Number(b.sameAuthor), Number(a.sameAuthor)],
    [Number(b.authorRelation), Number(a.authorRelation)],
    [b.preferenceScore, a.preferenceScore],
  ];
  for (const [bv, av] of dimensions) if (bv !== av) return bv - av;
  return a.book.title.localeCompare(b.book.title);
}

function getRecentRecommendedBookTitles(limit = 4) {
  return new Set(history
    .slice(-limit)
    .map((item) => normalizeTheme(item.book?.title || ''))
    .filter(Boolean));
}

function recommendBookForStory(story) {
  const ranked = normalizedBookCatalog
    .map((book) => evaluateBookCandidate(book, story))
    .filter((candidate) => candidate.isEligible)
    .sort(compareBookCandidates);
  const recentTitles = getRecentRecommendedBookTitles();
  const fresh = ranked.filter((candidate) => !recentTitles.has(normalizeTheme(candidate.book.title)));
  const recommendation = fresh[0] || ranked[0];
  if (!recommendation) return null;
  return {
    ...recommendation,
    score: null,
    commonThemes: Array.from(new Set([...recommendation.rootThemeMatches, ...recommendation.contentThemeMatches])),
  };
}

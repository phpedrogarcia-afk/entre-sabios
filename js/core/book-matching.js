// Pontuação e recomendação de livros.
// Extraído de script.js na Fase 3 da refatoração segura.
// Não alterar pesos, regras ou comportamento nesta fase.

function getStoryIntensity(story) {
  return currentIntensity || story.currentIntensity || story.intensity || story.intensidade?.[0] || 'moderada';
}

function getStoryFeelings(story) {
  return Array.from(new Set([
    ...(story.selectedFeelingIds || []),
    ...(Array.isArray(story.sentimentos) ? story.sentimentos : []),
  ].map(normalizeTheme).filter(Boolean)));
}

function getRecentBookFunctions(limit = 2) {
  return history
    .slice(-limit)
    .map((item) => item.book?.bookFunction)
    .filter(Boolean);
}

function getTargetBookFunctions(story) {
  const intensity = getStoryIntensity(story);
  const feelings = getStoryFeelings(story);
  const tones = [story.tom, story.tone].filter(Boolean).map(normalizeTheme);

  if (intensity === 'intensa' && feelings.some((feeling) => ['luto', 'tristeza', 'saudade', 'medo'].includes(feeling))) {
    return ['validacao', 'dissolucao', 'acao'];
  }

  if (feelings.some((feeling) => ['ansiedade', 'confusao', 'confusão', 'medo'].includes(feeling))) {
    return ['dissolucao', 'validacao', 'acao'];
  }

  if (feelings.some((feeling) => ['falta_de_proposito', 'coragem'].includes(feeling))) {
    return ['acao', 'dissolucao', 'validacao'];
  }

  if (feelings.includes('raiva')) {
    const hasInjustice = (story.rawTags || story.temas || []).map(normalizeTheme)
      .some((tag) => ['injustica', 'injustiça', 'voz', 'limites', 'hipocrisia'].includes(tag));
    return hasInjustice ? ['acao', 'dissolucao', 'choque'] : ['dissolucao', 'acao', 'choque'];
  }

  if (feelings.includes('culpa')) return ['acao', 'dissolucao', 'choque'];
  if (feelings.includes('amor')) return ['dissolucao', 'acao', 'validacao'];
  if (feelings.includes('indiretas') || tones.includes('cruel_lucido') || tones.includes('confrontador')) return ['choque', 'acao', 'dissolucao'];

  return ['validacao', 'dissolucao', 'acao'];
}

function violatesBookAvoidance(book, story) {
  const feelings = getStoryFeelings(story);
  const intensity = getStoryIntensity(story);
  return (book.avoidWhen || []).some((rule) => {
    const [feeling, ruleIntensity] = rule.split(':').map(normalizeTheme);
    return feelings.includes(feeling) && (!ruleIntensity || ruleIntensity === normalizeTheme(intensity));
  });
}

function scoreBookForStory(book, story) {
  let score = 0;
  const reasons = [];
  const storyAuthor = normalizeAuthorName(story.displayAuthor || story.author);
  const bookAuthor = normalizeAuthorName(book.author);
  const relatedAuthors = book.relatedAuthors.map(normalizeAuthorName);
  const sameAuthor = storyAuthor === bookAuthor;
  const authorRelation = sameAuthor || relatedAuthors.includes(storyAuthor);

  if (sameAuthor) {
    score += 12;
    reasons.push('mesmo autor');
  } else if (authorRelation) {
    score += 5;
    reasons.push('mesma tradição ou autoria relacionada');
  }

  const storyThemes = new Set([
    ...(story.rawTags || []),
    ...(story.selectedThemes || []),
    ...(story.temas || []),
  ].map(normalizeTheme));
  const commonThemes = book.themes.filter((theme) => storyThemes.has(theme));
  score += commonThemes.length * 3;
  if (commonThemes.length) reasons.push(`${commonThemes.length} tema${commonThemes.length > 1 ? 's' : ''} em comum`);

  const feelings = getStoryFeelings(story);
  const primaryFeeling = feelings[0];
  if (primaryFeeling && book.feelings.includes(primaryFeeling)) {
    score += 4;
    reasons.push('sentimento principal');
  }
  const secondaryMatches = feelings.slice(1).filter((feeling) => book.feelings.includes(feeling));
  score += secondaryMatches.length * 2;

  const storyIntensity = getStoryIntensity(story);
  if (book.intensities.includes(storyIntensity)) {
    score += 2;
    reasons.push('intensidade emocional');
  }

  const targetFunctions = getTargetBookFunctions(story);
  const functionIndex = targetFunctions.indexOf(book.bookFunction);
  if (functionIndex === 0) {
    score += 9;
    reasons.push('função de travessia ideal');
  } else if (functionIndex === 1) {
    score += 5;
    reasons.push('boa transição emocional');
  } else if (functionIndex === 2) {
    score += 2;
  }

  if (violatesBookAvoidance(book, story)) {
    score -= 14;
    reasons.push('evita intensificar este estado');
  }

  const recentFunctions = getRecentBookFunctions(2);
  const sameFunctionStreak = recentFunctions.filter((fn) => fn === book.bookFunction).length;
  if (sameFunctionStreak >= 2) score -= 8;
  else if (sameFunctionStreak === 1 && ['choque', 'validacao'].includes(book.bookFunction)) score -= 4;

  if (storyIntensity === 'intensa' && ['luto', 'tristeza', 'saudade'].some((feeling) => feelings.includes(feeling)) && book.bookFunction === 'choque') {
    score -= 10;
  }

  if (storyIntensity === 'fraca' && book.bookFunction === 'choque' && book.depth >= 5) score -= 5;
  if (storyIntensity === 'fraca' && ['dissolucao', 'acao'].includes(book.bookFunction)) score += 3;

  const depthDifference = Math.abs((story.profundidade || 3) - book.depth);
  if (depthDifference === 0) score += 2;
  else if (depthDifference === 1) score += 1;

  const adviceWords = new Set(getAdviceThemes(story.advice || story.conselho || ''));
  const subjectMatches = book.subjects.filter((subject) => {
    const words = normalizeTheme(subject).replace(/_/g, ' ').split(/\s+/);
    return words.some((word) => adviceWords.has(word));
  });
  score += Math.min(3, subjectMatches.length);
  if (subjectMatches.length) reasons.push('continua o conselho apresentado');

  if (story.curatedBook && normalizeTheme(story.curatedBook) === normalizeTheme(book.title)) {
    score += book.bookFunction === targetFunctions[0] ? 6 : 2;
    reasons.push('obra ligada diretamente à reflexão');
  }

  const hasDirectRelation = authorRelation || commonThemes.length > 0 || (primaryFeeling && book.feelings.includes(primaryFeeling));
  if (!hasDirectRelation) score -= 5;

  score += Math.max(-2, Math.min(2, preferenceProfile.books[book.title] || 0));

  return { book, score, reasons, sameAuthor, commonThemes, targetFunctions };
}

function recommendBookForStory(story) {
  const ranked = normalizedBookCatalog
    .map((book) => scoreBookForStory(book, story))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (Number(b.sameAuthor) !== Number(a.sameAuthor)) return Number(b.sameAuthor) - Number(a.sameAuthor);
      const depthA = Math.abs((story.profundidade || 3) - a.book.depth);
      const depthB = Math.abs((story.profundidade || 3) - b.book.depth);
      if (depthA !== depthB) return depthA - depthB;
      return a.book.title.localeCompare(b.book.title);
    });
  return ranked[0] || { book: normalizedBookCatalog[0], score: 0, reasons: [] };
}

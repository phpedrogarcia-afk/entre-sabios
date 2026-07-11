// Pontuação e escolha de conteúdo filosófico.
// Extraído de script.js na Fase 3 da refatoração segura.
// Não alterar pesos, regras ou comportamento nesta fase.

function getStoryKey(author) {
  return `${author.author}::${author.quote}`;
}

function getAuthorAffinity(authorName, feelingIds) {
  return feelingIds.reduce((total, feelingId) => {
    const table = feelingAuthorAffinity[feelingId] || {};
    return total + (table[authorName] || 0);
  }, 0);
}

function getTrajectoryStrategy(state) {
  if (state.intensity === 'fraca') return 'transcendência';
  return 'catarse';
}

function scoreTrajectoryForState(author, state) {
  let score = 0;
  const reasons = [];
  const toneFamily = getToneFamily(author.tom);
  const authorThemes = new Set(author.temas || []);
  const strategy = getTrajectoryStrategy(state);

  trajectoryImpactRules.forEach((rule) => {
    const appliesToFeeling = rule.feelings.some((feeling) => state.feelings.includes(feeling));
    const appliesToIntensity = rule.intensities.includes(state.intensity);
    if (!appliesToFeeling || !appliesToIntensity) return;

    let ruleScore = 0;
    if (rule.authors.includes(author.author) || rule.authors.includes(author.displayAuthor)) ruleScore += 2.5;
    if (rule.themes.some((theme) => authorThemes.has(normalizeTheme(theme)))) ruleScore += 2;
    if (rule.tones.includes(toneFamily)) ruleScore += 1;

    if (ruleScore > 0) {
      score += ruleScore;
      reasons.push(`trajetória: ${rule.label}`);
    }
  });

  if (strategy === 'catarse') {
    if (author.profundidade >= 4) {
      score += 1;
      reasons.push('catarse: profundidade');
    }
    if (['confrontador', 'poético', 'acolhedor'].includes(toneFamily)) {
      score += 0.75;
      reasons.push('catarse: validação emocional');
    }
  } else {
    const transitionThemes = ['ação_consciente', 'autoconhecimento', 'esperança', 'aceitação', 'presente', 'sentido'];
    if (transitionThemes.some((theme) => authorThemes.has(theme))) {
      score += 1.5;
      reasons.push('transcendência: movimento possível');
    }
    if (['acolhedor', 'contemplativo', 'direto'].includes(toneFamily)) {
      score += 0.75;
      reasons.push('transcendência: tom de saída');
    }
    if (
      state.primaryFeeling === 'falta_de_proposito'
      && ['Schopenhauer', 'Emil Cioran'].includes(author.author)
      && ['confrontador', 'cruel_lucido'].includes(author.tom)
    ) {
      score -= 1.5;
      reasons.push('transcendência: reduz pessimismo');
    }
  }

  return { score, reasons };
}

function scoreContentForState(author, state) {
  let score = 0;
  const reasons = [];

  if (state.primaryFeeling && author.sentimentos.includes(state.primaryFeeling)) {
    score += 3;
    reasons.push('sentimento principal');
  }
  if (state.secondaryFeelings.some((feeling) => author.sentimentos.includes(feeling))) {
    score += 2;
    reasons.push('sentimento secundário');
  }
  if (author.intensidade.includes(state.intensity)) {
    score += 2;
    reasons.push('intensidade');
  }
  if (state.psychologicalThemes.some((theme) => author.temas.includes(theme))) {
    score += 2;
    reasons.push('tema psicológico');
  }
  if (state.suitableTones.includes(getToneFamily(author.tom))) {
    score += 1;
    reasons.push('tom adequado');
  }

  const hasIncompatibility = state.feelings.some((feeling) => author.incompativeis.includes(`${feeling}:${state.intensity}`));
  if (hasIncompatibility) {
    score -= 3;
    reasons.push('penalidade emocional');
  }

  const trajectory = scoreTrajectoryForState(author, state);
  score += trajectory.score;
  reasons.push(...trajectory.reasons);

  const affinity = getAuthorAffinity(author.author, state.feelings);
  const preference = (preferenceProfile.authors[author.author] || 0)
    + author._tagsN.reduce((total, tag) => total + (preferenceProfile.tags[tag] || 0), 0);

  return {
    score,
    reasons,
    tieBreaker: affinity + preference * 0.1,
  };
}

function getRankedCandidates(state) {
  return authorsDbNormalized
    .map((author) => ({ author, ...scoreContentForState(author, state) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.tieBreaker !== a.tieBreaker) return b.tieBreaker - a.tieBreaker;
      if (a.author.author !== b.author.author) return a.author.author.localeCompare(b.author.author);
      return a.author.variantIndex - b.author.variantIndex;
    });
}

function pickBestAuthorByThemes(selectedThemes, feelingIds = getSelectedFeelingIds(), { excludeAuthors = [] } = {}) {
  if (selectedThemes.length === 0) return null;

  const state = interpretEmotionalState();
  const rankedCandidates = getRankedCandidates(state);
  const desiredContentType = generatedContentCount % 4 === 3 ? 'text' : 'quote';

  let globallyUnseen = rankedCandidates.filter((candidate) => !viewedStoryKeys.has(getStoryKey(candidate.author)));
  if (!globallyUnseen.length) {
    // Um novo ciclo só começa quando todas as frases e todos os textos foram vistos.
    viewedStoryKeys.clear();
    recentAuthorNames = [];
    globallyUnseen = rankedCandidates;
  }

  const unseenWithoutExcluded = globallyUnseen.filter((candidate) => !excludeAuthors.includes(candidate.author.author));
  const unseen = unseenWithoutExcluded.length ? unseenWithoutExcluded : globallyUnseen;

  const desiredUnseen = unseen.filter((candidate) => candidate.author.contentType === desiredContentType);
  const activePool = desiredUnseen.length ? desiredUnseen : unseen;
  const relevantPool = activePool.filter((candidate) => candidate.score > 0);
  const rankedPool = relevantPool.length ? relevantPool : activePool;

  // Evita repetir autor em sequência, mas nunca repete conteúdo dentro do ciclo.
  const pick = rankedPool.find((candidate) => !recentAuthorNames.includes(candidate.author.author))
    || rankedPool[0];

  if (!pick) return authorsDbNormalized[0];
  const pickedKey = getStoryKey(pick.author);
  viewedStoryKeys.add(pickedKey);
  recentAuthorNames = [...recentAuthorNames.filter((name) => name !== pick.author.author), pick.author.author].slice(-4);
  generatedContentCount += 1;
  saveViewedStoryKeys();
  saveGeneratedContentCount();
  return {
    ...pick.author,
    _selectionScore: pick.score,
    _selectionReasons: pick.reasons,
    _emotionalState: state,
  };
}

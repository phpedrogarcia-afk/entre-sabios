// Contos filosóficos: seleção, ciclo e modal.
// Extraído de script.js na Fase 4 da refatoração segura.
// Não alterar comportamento nesta fase.

function normalizeTaleList(list = []) {
  return list.map(normalizeTheme);
}

function getTaleParagraphHtml(paragraphs = []) {
  return paragraphs
    .map((paragraph) => `<p>${String(paragraph).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('');
}

function getTaleRelationFallback(tale) {
  const feelings = getSelectedFeelingLabels();
  const feelingText = feelings.length ? feelings.join(', ').toLowerCase() : 'o momento que você escolheu';
  const themes = (tale.temas || []).slice(0, 3).join(', ').toLowerCase();
  return [
    `Este conto apareceu porque conversa com ${feelingText} e com temas como ${themes}. Ele amplia a frase principal sem competir com ela: em vez de entregar uma resposta pronta, transforma o sentimento em imagem, travessia e pergunta.`
  ];
}

function getTaleQuestionFallback(tale) {
  const primaryTheme = (tale.temas || [])[0] || 'este momento';
  return `O que ${primaryTheme.toLowerCase()} está tentando revelar sobre a forma como você está vivendo agora?`;
}

function scoreTaleForState(tale, state) {
  let score = 0;
  const selectedThemes = new Set((state.psychologicalThemes || []).map(normalizeTheme));
  const taleFeelings = normalizeTaleList(tale.sentimentosRelacionados);
  const taleThemes = normalizeTaleList(tale.temas);
  const taleKeywords = normalizeTaleList(tale.palavrasChave);

  if (state.primaryFeeling && taleFeelings.includes(normalizeTheme(state.primaryFeeling))) score += 8;

  (state.secondaryFeelings || []).forEach((feeling) => {
    if (taleFeelings.includes(normalizeTheme(feeling))) score += 4;
  });

  taleThemes.forEach((theme) => {
    if (selectedThemes.has(theme)) score += 2;
  });

  taleKeywords.forEach((keyword) => {
    if (selectedThemes.has(keyword)) score += 1.5;
  });

  if (currentStory) {
    const currentStoryThemes = new Set([...(currentStory.rawTags || []), ...(currentStory.temas || [])].map(normalizeTheme));
    taleThemes.forEach((theme) => {
      if (currentStoryThemes.has(theme)) score += 1.2;
    });
  }

  return score;
}

function getTaleSelectionKey(state) {
  return [
    ...(state.feelings || []),
    state.intensity || currentIntensity,
  ].map(normalizeTheme).sort().join('|') || 'sem_sentimento';
}

function markTaleAsViewed(tale, state) {
  if (!tale?.id) return;
  if (!contosJaVistos.includes(tale.id)) contosJaVistos.push(tale.id);
  const selectionKey = getTaleSelectionKey(state);
  const viewedKey = `${selectionKey}::${tale.id}`;
  viewedTaleKeys = [...viewedTaleKeys.filter((key) => key !== viewedKey), viewedKey].slice(-120);
  recentTaleKeys = [...recentTaleKeys.filter((id) => id !== tale.id), tale.id].slice(-6);
  saveViewedTaleKeys();
}

function getRankedTalesForState(state) {
  const selectionKey = getTaleSelectionKey(state);
  return philosophicalTales
    .map((tale) => {
      const baseScore = scoreTaleForState(tale, state);
      const viewedForSelection = viewedTaleKeys.includes(`${selectionKey}::${tale.id}`);
      const recentlyViewed = recentTaleKeys.includes(tale.id);
      const viewedInSession = contosJaVistos.includes(tale.id);
      const rotationPenalty = (viewedForSelection ? 5 : 0) + (recentlyViewed ? 4 : 0);
      return {
        tale,
        baseScore,
        score: baseScore - rotationPenalty,
        viewedForSelection,
        recentlyViewed,
        viewedInSession,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.baseScore !== a.baseScore) return b.baseScore - a.baseScore;
      return a.tale.titulo.localeCompare(b.tale.titulo);
    });
}

function getNearbyThemeScore(tale, state) {
  const selectedThemes = new Set((state.psychologicalThemes || []).map(normalizeTheme));
  const taleThemes = normalizeTaleList(tale.temas);
  const taleKeywords = normalizeTaleList(tale.palavrasChave);
  return [...taleThemes, ...taleKeywords].reduce((total, theme) => total + (selectedThemes.has(theme) ? 1 : 0), 0);
}

function pickBestTale({ gradualVariety = false } = {}) {
  const state = interpretEmotionalState();
  let restartedJourney = false;

  if (contosJaVistos.length >= philosophicalTales.length) {
    contosJaVistos = [];
    restartedJourney = true;
  }

  const ranked = getRankedTalesForState(state);
  const notSeenInSession = ranked.filter((candidate) => !candidate.viewedInSession);
  const compatible = notSeenInSession.filter((candidate) => candidate.baseScore > 0);
  const bestCompatibleScore = compatible[0]?.baseScore || 0;
  const compatiblePool = gradualVariety
    ? compatible
    : compatible.filter((candidate) => candidate.baseScore >= Math.max(1, bestCompatibleScore - 4));

  const nearbyPool = notSeenInSession
    .map((candidate) => ({
      ...candidate,
      nearbyThemeScore: getNearbyThemeScore(candidate.tale, state),
    }))
    .filter((candidate) => candidate.nearbyThemeScore > 0)
    .sort((a, b) => {
      if (b.nearbyThemeScore !== a.nearbyThemeScore) return b.nearbyThemeScore - a.nearbyThemeScore;
      if (b.baseScore !== a.baseScore) return b.baseScore - a.baseScore;
      return a.tale.titulo.localeCompare(b.tale.titulo);
    });

  const pick = compatiblePool[0]
    || nearbyPool[0]
    || notSeenInSession[0]
    || ranked[0];

  markTaleAsViewed(pick?.tale, state);
  return {
    tale: pick?.tale || philosophicalTales[0],
    restartedJourney,
  };
}

function showTale({ gradualVariety = false } = {}) {
  const { tale, restartedJourney } = pickBestTale({ gradualVariety });
  renderTale(tale);
  if (taleCycleNoticeEl) {
    taleCycleNoticeEl.textContent = restartedJourney
      ? 'Você já percorreu todos os contos disponíveis. Recomeçando a jornada.'
      : '';
  }
}

function renderTale(tale) {
  if (!tale) return;
  taleTitleEl.textContent = tale.titulo;
  taleOriginEl.textContent = `Origem: ${tale.origem}`;
  taleReadingTimeEl.textContent = `📖 Leitura de aproximadamente ${tale.tempoLeitura} minutos.`;
  taleTextEl.innerHTML = getTaleParagraphHtml(tale.texto);
  taleLessonEl.innerHTML = getTaleParagraphHtml(tale.explicacaoFilosofica);
  taleRelationEl.innerHTML = getTaleParagraphHtml(tale.relacaoSentimento || getTaleRelationFallback(tale));
  taleQuestionEl.innerHTML = getTaleParagraphHtml([tale.perguntaReflexao || getTaleQuestionFallback(tale)]);
}

function openPhilosophicalTale() {
  if (!ensureSelectionMin()) {
    const message = 'Escolha um sentimento primeiro para encontrar um conto que converse com o seu momento.';
    if (taleHintEl) taleHintEl.textContent = 'Selecione um sentimento primeiro.';
    showSelectionHint(message);
    reflectionTextEl.textContent = 'Selecione seus sentimentos, escolha a intensidade e clique em “ENCONTRAR UMA REFLEXÃO”.';
    return;
  }

  if (taleHintEl) taleHintEl.textContent = '';
  showTale({ gradualVariety: false });
  if (typeof taleDialog.showModal === 'function') taleDialog.showModal();
  else taleDialog.setAttribute('open', '');
}

function closePhilosophicalTale() {
  if (taleDialog.open) taleDialog.close();
  else taleDialog.removeAttribute('open');
}

// Contos filosóficos: seleção, ciclo e modal.
// Extraído de script.js na Fase 4 da refatoração segura.

function resolveTaleIntensity(explicitIntensity = currentIntensity) {
  if (VALID_INTENSITIES.has(explicitIntensity)) return explicitIntensity;
  return explicitIntensity == null || explicitIntensity === '' ? 'moderada' : null;
}

function normalizeTaleList(list = []) {
  return list.map(normalizeTheme);
}

function getStateEditorialThemes(state) {
  return Array.from(new Set([
    ...(state.rootThemeDefinitions || []).map((definition) => definition.theme),
    ...(state.secondaryThemes || []),
    ...(state.combinationThemes || []),
  ].map(normalizeTheme)));
}

function getTaleParagraphHtml(paragraphs = []) {
  return paragraphs
    .map((paragraph) => `<p>${String(paragraph).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('');
}

function getTaleFirstReflectionSection(tale) {
  if (tale.umModoDeOlhar?.length) return tale.umModoDeOlhar;
  return (tale.explicacaoFilosofica || []).slice(0, 1);
}

function getTaleSecondReflectionSection(tale) {
  if (tale.oQueTalvezEstejaPedindoParaSerVisto?.length) return tale.oQueTalvezEstejaPedindoParaSerVisto;
  const legacyParagraphs = (tale.explicacaoFilosofica || []).slice(1);
  return legacyParagraphs.length ? legacyParagraphs : (tale.explicacaoFilosofica || []);
}

function getTaleQuestionFallback(tale) {
  const primaryTheme = (tale.temas || [])[0] || 'este momento';
  return `O que ${primaryTheme.toLowerCase()} está tentando revelar sobre a forma como você está vivendo agora?`;
}

function scoreTaleForState(tale, state) {
  let score = 0;
  const selectedThemes = new Set(getStateEditorialThemes(state));
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
  const selectedThemes = new Set(getStateEditorialThemes(state));
  const taleThemes = normalizeTaleList(tale.temas);
  const taleKeywords = normalizeTaleList(tale.palavrasChave);
  return [...taleThemes, ...taleKeywords].reduce((total, theme) => total + (selectedThemes.has(theme) ? 1 : 0), 0);
}

function pickBestTale({ gradualVariety = false } = {}) {
  const state = interpretEmotionalState(resolveTaleIntensity(currentIntensity));
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
  const taleContent = taleDialog?.querySelector('.tale-content');
  if (taleContent) taleContent.scrollTop = 0;
  if (taleCycleNoticeEl) {
    taleCycleNoticeEl.textContent = restartedJourney
      ? 'Você já percorreu todos os contos disponíveis. Recomeçando a jornada.'
      : '';
  }
}

let talePageScrollY = 0;
let talePageIsLocked = false;

function lockTalePageScroll() {
  if (talePageIsLocked) return;
  talePageScrollY = window.scrollY;
  talePageIsLocked = true;
}

function unlockTalePageScroll() {
  if (!talePageIsLocked) return;
  window.scrollTo(0, talePageScrollY);
  talePageIsLocked = false;
}

function renderTale(tale) {
  if (!tale) return;
  taleTitleEl.textContent = tale.titulo;
  taleOriginEl.textContent = `Origem: ${tale.origem}`;
  taleReadingTimeEl.textContent = `📖 Leitura de aproximadamente ${tale.tempoLeitura} minutos.`;
  if (tale.imagem?.src && taleImageFrameEl && taleImageEl) {
    taleImageEl.src = tale.imagem.src;
    taleImageEl.alt = tale.imagem.alt || '';
    taleImageEl.width = tale.imagem.width || 1536;
    taleImageEl.height = tale.imagem.height || 864;
    taleImageFrameEl.hidden = false;
  } else if (taleImageFrameEl && taleImageEl) {
    taleImageFrameEl.hidden = true;
    taleImageEl.removeAttribute('src');
    taleImageEl.alt = '';
  }
  taleTextEl.innerHTML = getTaleParagraphHtml(tale.texto);
  taleLessonEl.innerHTML = getTaleParagraphHtml(getTaleFirstReflectionSection(tale));
  taleRelationEl.innerHTML = getTaleParagraphHtml(getTaleSecondReflectionSection(tale));
  taleQuestionEl.innerHTML = getTaleParagraphHtml([tale.perguntaParaLevar || tale.perguntaReflexao || getTaleQuestionFallback(tale)]);
}

function openPhilosophicalTale() {
  if (taleHintEl) taleHintEl.textContent = '';
  showTale({ gradualVariety: false });
  lockTalePageScroll();
  try {
    if (typeof taleDialog.showModal === 'function') taleDialog.showModal();
    else taleDialog.setAttribute('open', '');
    taleDialog.scrollTop = 0;
    const taleContent = taleDialog.querySelector('.tale-content');
    if (taleContent) taleContent.scrollTop = 0;
    requestAnimationFrame(() => {
      taleDialog.scrollTop = 0;
      if (taleContent) taleContent.scrollTop = 0;
    });
  } catch (error) {
    unlockTalePageScroll();
    throw error;
  }
}

function closePhilosophicalTale() {
  if (taleDialog.open) taleDialog.close();
  else {
    taleDialog.removeAttribute('open');
    unlockTalePageScroll();
  }
}

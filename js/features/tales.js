// Contos filosóficos: seleção, ciclo e modal.
// Extraído de script.js na Fase 4 da refatoração segura.

const taleSelectionContract = globalThis.EntreSabiosTaleSelectionContract;
const TALE_HISTORY_LIMIT = 120;
const TALE_READ_MARKER_PREFIX = 'read::';

function resolveTaleIntensity() {
  return 'moderada';
}

function normalizeTaleList(list = []) {
  return list.map(normalizeTheme);
}

function getStateEditorialThemes(state) {
  return taleSelectionContract.getEditorialThemes(state, normalizeTheme);
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
  return taleSelectionContract.scoreTale(tale, state, currentStory, normalizeTheme);
}

function getTaleSelectionKey(state) {
  return taleSelectionContract.selectionKey(state, normalizeTheme);
}

function getTaleReadMarker(tale) {
  return tale?.id ? `${TALE_READ_MARKER_PREFIX}${tale.id}` : '';
}

function getTaleReadMarkers(keys = viewedTaleKeys) {
  const validMarkers = new Set(philosophicalTales.map((tale) => getTaleReadMarker(tale)));
  return [...new Set(keys.filter((key) => validMarkers.has(key)))];
}

function mergeTaleHistoryWithReadMarkers(historyKeys = [], readMarkers = []) {
  const preservedReadMarkers = getTaleReadMarkers(readMarkers);
  const contextLimit = Math.max(0, TALE_HISTORY_LIMIT - preservedReadMarkers.length);
  const allContextKeys = [...new Set(historyKeys.filter((key) => !key.startsWith(TALE_READ_MARKER_PREFIX)))];
  const contextKeys = contextLimit ? allContextKeys.slice(-contextLimit) : [];
  return [...contextKeys, ...preservedReadMarkers];
}

function markTaleAsRead(tale) {
  const marker = getTaleReadMarker(tale);
  if (!marker) return;
  viewedTaleKeys = mergeTaleHistoryWithReadMarkers(
    viewedTaleKeys,
    [...getTaleReadMarkers(), marker],
  );
  saveViewedTaleKeys();
}

function markTaleAsViewed(tale, state) {
  if (!tale?.id) return;
  if (!contosJaVistos.includes(tale.id)) contosJaVistos.push(tale.id);
  const selectionKey = getTaleSelectionKey(state);
  const viewedKey = `${selectionKey}::${tale.id}`;
  viewedTaleKeys = mergeTaleHistoryWithReadMarkers(
    [...viewedTaleKeys.filter((key) => key !== viewedKey), viewedKey],
    [...getTaleReadMarkers(), getTaleReadMarker(tale)],
  );
  recentTaleKeys = [...recentTaleKeys.filter((id) => id !== tale.id), tale.id].slice(-6);
  saveViewedTaleKeys();
}

function hasTaleBeenRead(tale, readMarkers = getTaleReadMarkers()) {
  const marker = getTaleReadMarker(tale);
  return Boolean(marker && readMarkers.includes(marker));
}

function getRankedTalesForState(state) {
  return taleSelectionContract.rankTales({
    tales: philosophicalTales,
    state,
    currentStory,
    viewedTaleKeys,
    recentTaleKeys,
    sessionViewedIds: contosJaVistos,
    normalizeTheme,
  });
}

function getNearbyThemeScore(tale, state) {
  return taleSelectionContract.nearbyThemeScore(tale, state, normalizeTheme);
}

function pickBestTale({ gradualVariety = false } = {}) {
  const state = interpretEmotionalState(resolveTaleIntensity());
  const readMarkers = getTaleReadMarkers();
  const selected = taleSelectionContract.selectTale({
    tales: philosophicalTales,
    state,
    currentStory,
    viewedTaleKeys,
    recentTaleKeys,
    sessionViewedIds: contosJaVistos,
    gradualVariety,
    normalizeTheme,
  });
  const wasPreviouslyRead = hasTaleBeenRead(selected.tale, readMarkers);
  contosJaVistos = selected.history.sessionViewedIds;
  viewedTaleKeys = mergeTaleHistoryWithReadMarkers(selected.history.viewedTaleKeys, readMarkers);
  recentTaleKeys = selected.history.recentTaleKeys;
  saveViewedTaleKeys();
  return { tale: selected.tale, restartedJourney: selected.restartedJourney, wasPreviouslyRead };
}

function showTale({ gradualVariety = false } = {}) {
  const { tale, restartedJourney, wasPreviouslyRead } = pickBestTale({ gradualVariety });
  renderTale(tale, { wasPreviouslyRead });
  markTaleAsRead(tale);
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

function renderTale(tale, { wasPreviouslyRead = false } = {}) {
  if (!tale) return;
  currentTale = tale;
  taleTitleEl.textContent = tale.titulo;
  if (taleReadStatusEl) taleReadStatusEl.hidden = !wasPreviouslyRead;
  taleOriginEl.textContent = `Origem: ${tale.origem}`;
  const readingTimeText = tale.tempoLeituraTexto
    || `${tale.tempoLeitura} ${tale.tempoLeitura === 1 ? 'minuto' : 'minutos'}`;
  taleReadingTimeEl.textContent = `📖 Leitura de aproximadamente ${readingTimeText}.`;
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
  updateTaleFavoriteUi();
}

function openTaleDialog() {
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

function openPhilosophicalTale() {
  if (taleHintEl) taleHintEl.textContent = '';
  showTale({ gradualVariety: false });
  openTaleDialog();
}

function openSavedTale(taleId) {
  const tale = philosophicalTales.find((entry) => entry.id === taleId);
  if (!tale) return;
  const state = interpretEmotionalState(resolveTaleIntensity());
  markTaleAsViewed(tale, state);
  renderTale(tale, { wasPreviouslyRead: true });
  if (taleCycleNoticeEl) taleCycleNoticeEl.textContent = '';
  openTaleDialog();
}

function closePhilosophicalTale() {
  if (taleDialog.open) taleDialog.close();
  else {
    taleDialog.removeAttribute('open');
    unlockTalePageScroll();
  }
}

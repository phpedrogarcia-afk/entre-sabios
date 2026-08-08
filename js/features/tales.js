// Contos filosóficos: seleção, ciclo e modal.
// Extraído de script.js na Fase 4 da refatoração segura.

const taleSelectionContract = globalThis.EntreSabiosTaleSelectionContract;

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
  contosJaVistos = selected.history.sessionViewedIds;
  viewedTaleKeys = selected.history.viewedTaleKeys;
  recentTaleKeys = selected.history.recentTaleKeys;
  saveViewedTaleKeys();
  return { tale: selected.tale, restartedJourney: selected.restartedJourney };
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

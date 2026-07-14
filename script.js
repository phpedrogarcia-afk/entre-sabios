// =========================
// Entre Sábios
// Implementação baseada na especificação (layout minimalista)
// =========================

let feelingsCatalog = Array.isArray(window.EntreSabiosData.feelingsCatalog)
  ? window.EntreSabiosData.feelingsCatalog
  : [];
const intensityProfiles = window.EntreSabiosData.intensityProfiles;
const combinationRules = window.EntreSabiosData.combinationRules;
const emotionalTaxonomy = window.EntreSabiosData.emotionalTaxonomy;
const thinkerProfiles = window.EntreSabiosData.thinkerProfiles;
const bookCatalog = window.EntreSabiosData.bookCatalog;
const additionalBookCatalog = window.EntreSabiosData.additionalBookCatalog;
const bookClinicalRules = window.EntreSabiosData.bookClinicalRules;

function getBookClinicalMetadata(book, normalizedTags = []) {
  const key = normalizeTheme(book.title || '');
  const explicit = bookClinicalRules[key];
  if (explicit) return explicit;

  const feelings = new Set((book.feelings || []).map(normalizeTheme));
  const tags = new Set(normalizedTags);
  const all = new Set([...feelings, ...tags]);
  const has = (...terms) => terms.some((term) => all.has(normalizeTheme(term)));
  const highOnly = Array.isArray(book.intensities) && book.intensities.length === 1 && book.intensities.includes('intensa');

  if (has('ansiedade', 'presença', 'respiração', 'silêncio', 'desapego', 'aceitação', 'mente', 'compaixão')) {
    return {
      bookTone: 'acolhedor_dissolvente',
      bookFunction: 'dissolucao',
      bookAxis: 'acolhimento',
      avoidWhen: [],
      bestAfter: ['choque', 'validacao'],
      clinicalNote: 'reduz controle e devolve presença',
    };
  }

  if (has('ação', 'disciplina', 'responsabilidade', 'virtude', 'propósito', 'tempo', 'autodomínio')) {
    return {
      bookTone: highOnly ? 'confrontador' : 'contemplativo',
      bookFunction: 'acao',
      bookAxis: 'sustentacao',
      avoidWhen: highOnly ? ['luto:intensa'] : [],
      bestAfter: ['dissolucao', 'validacao'],
      clinicalNote: 'converte compreensão em gesto prático',
    };
  }

  if (has('moral', 'ironia', 'verdade', 'sombra', 'culpa', 'raiva', 'indiretas', 'vaidade')) {
    return {
      bookTone: 'cruel_lucido',
      bookFunction: 'choque',
      bookAxis: 'desconstrucao',
      avoidWhen: ['luto:intensa', 'ansiedade:intensa'],
      bestAfter: ['validacao'],
      clinicalNote: 'quebra autoengano e complacência',
    };
  }

  if (has('luto', 'saudade', 'morte', 'ausência')) {
    return {
      bookTone: 'poetico_melancolico',
      bookFunction: 'validacao',
      bookAxis: 'acolhimento',
      avoidWhen: [],
      bestAfter: [],
      clinicalNote: 'valida a dor antes de qualquer direção',
    };
  }

  return {
    bookTone: 'contemplativo',
    bookFunction: 'validacao',
    bookAxis: 'acolhimento',
    avoidWhen: [],
    bestAfter: [],
    clinicalNote: 'aproxima a obra do estado emocional sem intensificar demais',
  };
}

function enrichBookMetadata(book, index) {
  const tags = Array.from(new Set((book.tags || []).map(normalizeTheme)));
  const inferredFeelings = feelingsCatalog
    .map((feeling) => feeling.id)
    .filter((feeling) => tags.includes(normalizeTheme(feeling)));
  const relatedAuthors = Array.from(new Set([...(book.relatedAuthors || []), ...(book.authors || [])]));
  const clinical = getBookClinicalMetadata(book, tags);
  return {
    id: `book-${index + 1}`,
    title: book.title,
    author: book.author,
    themes: tags,
    feelings: (book.feelings || inferredFeelings).map(normalizeTheme),
    intensities: book.intensities || ['fraca', 'moderada', 'intensa'],
    level: book.level || 'intermediário',
    depth: book.depth || 4,
    subjects: book.subjects || tags.slice(0, 3),
    description: book.description || `A obra desenvolve temas como ${tags.slice(0, 3).join(', ')} e amplia a reflexão para além da frase inicial.`,
    link: book.link || `https://www.google.com/search?q=${encodeURIComponent(`${book.title} ${book.author} livro`)}`,
    isbn: book.isbn || '',
    relatedAuthors,
    bookTone: clinical.bookTone,
    bookFunction: clinical.bookFunction,
    bookAxis: clinical.bookAxis,
    avoidWhen: clinical.avoidWhen,
    bestAfter: clinical.bestAfter,
    clinicalNote: clinical.clinicalNote,
  };
}

const normalizedBookCatalog = [...bookCatalog, ...additionalBookCatalog]
  .map(enrichBookMetadata)
  .filter((book) => !['steve_jobs', 'coragem_o_prazer_de_viver_perigosamente'].includes(normalizeTheme(book.title)))
  .filter((book, index, catalog) => catalog.findIndex((candidate) => normalizeTheme(candidate.title) === normalizeTheme(book.title) && normalizeTheme(candidate.author) === normalizeTheme(book.author)) === index);

// =========================
// Estado
// =========================

let history = []; // lista de { quote, author, reflection, advice, tags }
let historyIndex = -1;
let currentStory = null;
let currentStoryShownAt = 0;
let currentShareStyle = 'sage';

let selectedFeelingIds = new Set();
let primaryFeelingId = null;
let currentIntensity = 'moderada';
let runtimeSelector = null;
let lastSelectionSignature = null;
let runtimeContents = [];

const preferenceProfile = loadPreferenceProfile();
const favoriteStories = loadFavoriteStories();
const viewedStoryKeys = new Set(loadViewedStoryKeys());
let generatedContentCount = loadGeneratedContentCount();
let contextualContentHistory = loadContextualContentHistory();
let viewedTaleKeys = loadViewedTaleKeys();
let recentTaleKeys = loadRecentTaleKeys();
let contosJaVistos = [];

// =========================
// UI refs
// =========================

const feelingsGridEl = document.getElementById('feelingsGrid');
const primaryFeelingControlEl = document.getElementById('primaryFeelingControl');
const primaryFeelingLabelEl = document.getElementById('primaryFeelingLabel');
const secondaryFeelingActionsEl = document.getElementById('secondaryFeelingActions');
const generateBtn = document.getElementById('generateBtn');
const backBtn = document.getElementById('backBtn');
const newBtn = document.getElementById('newBtn');
const whatsShareBtn = document.getElementById('whatsShareBtn');
const shareStatusEl = document.getElementById('shareStatus');
const shareStyleButtons = Array.from(document.querySelectorAll('[data-share-style]'));
const quoteShareBtn = document.getElementById('quoteShareBtn');

const quoteTextEl = document.getElementById('quoteText');
const quoteAuthorEl = document.getElementById('quoteAuthor');
const reflectionTextEl = document.getElementById('reflectionText');
const philosophyTextEl = document.getElementById('philosophyText');
const adviceTextEl = document.getElementById('adviceText');
const bookTextEl = document.getElementById('bookText');
const bookReasonEl = document.getElementById('bookReason');
const tagsRowEl = document.getElementById('tagsRow');
const likeBtn = document.getElementById('likeBtn');
const dislikeBtn = document.getElementById('dislikeBtn');
const favoriteBtn = document.getElementById('favoriteBtn');
const favoritesBtn = document.getElementById('favoritesBtn');
const favoritesCountEl = document.getElementById('favoritesCount');
const favoritesDialog = document.getElementById('favoritesDialog');
const favoritesListEl = document.getElementById('favoritesList');
const closeFavoritesBtn = document.getElementById('closeFavoritesBtn');
const preferenceNoteEl = document.getElementById('preferenceNote');
const explanationTitleEl = document.getElementById('explanationTitle');
const selectionHintEl = document.getElementById('selectionHint');
const aboutBtn = document.getElementById('aboutBtn');
const aboutDialog = document.getElementById('aboutDialog');
const closeAboutBtn = document.getElementById('closeAboutBtn');
const dailyQuoteTextEl = document.getElementById('dailyQuoteText');
const dailyQuoteTextCloneEl = document.getElementById('dailyQuoteTextClone');
const openTaleBtn = document.getElementById('openTaleBtn');
const taleHintEl = document.getElementById('taleHint');
const taleDialog = document.getElementById('taleDialog');
const taleTitleEl = document.getElementById('taleTitle');
const taleOriginEl = document.getElementById('taleOrigin');
const taleReadingTimeEl = document.getElementById('taleReadingTime');
const taleImageFrameEl = document.getElementById('taleImageFrame');
const taleImageEl = document.getElementById('taleImage');
const taleTextEl = document.getElementById('taleText');
const taleLessonEl = document.getElementById('taleLesson');
const taleRelationEl = document.getElementById('taleRelation');
const taleQuestionEl = document.getElementById('taleQuestion');
const taleCycleNoticeEl = document.getElementById('taleCycleNotice');
const nextTaleBtn = document.getElementById('nextTaleBtn');
const closeTaleBtn = document.getElementById('closeTaleBtn');
const closeTaleTopBtn = document.getElementById('closeTaleTopBtn');

const intensityRadioEls = Array.from(document.querySelectorAll('input[name="intensity"]'));
const contentLoadStatusEl = document.getElementById('contentLoadStatus');

const decorCanvas = document.getElementById('decorCanvas');

const shareCardThemes = window.EntreSabiosData.shareCardThemes;
const philosophicalTales = window.EntreSabiosData.philosophicalTales;

// =========================
// Init
// =========================

function loadViewedStoryKeys() {
  try {
    const saved = JSON.parse(localStorage.getItem('caixaSabedoriaHistoricoVisto') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveViewedStoryKeys() {
  try {
    localStorage.setItem('caixaSabedoriaHistoricoVisto', JSON.stringify(Array.from(viewedStoryKeys).slice(-600)));
  } catch {
    // A rotação continua funcionando durante a sessão quando o armazenamento não está disponível.
  }
}

function loadViewedTaleKeys() {
  try {
    const saved = JSON.parse(localStorage.getItem('entreSabiosContosVistos') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function loadRecentTaleKeys() {
  try {
    const saved = JSON.parse(localStorage.getItem('entreSabiosContosRecentes') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveViewedTaleKeys() {
  try {
    localStorage.setItem('entreSabiosContosVistos', JSON.stringify(viewedTaleKeys.slice(-120)));
    localStorage.setItem('entreSabiosContosRecentes', JSON.stringify(recentTaleKeys.slice(-6)));
  } catch {
    // Se o navegador bloquear armazenamento, a rotação continua funcionando apenas durante a sessão.
  }
}

function loadGeneratedContentCount() {
  try {
    const value = Number.parseInt(localStorage.getItem('caixaSabedoriaConteudosGerados') || '0', 10);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function saveGeneratedContentCount() {
  try {
    localStorage.setItem('caixaSabedoriaConteudosGerados', String(generatedContentCount));
  } catch {
    // A cadência continua válida durante a sessão.
  }
}

function loadContextualContentHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem('entreSabiosHistoricoContextual') || '[]');
    return Array.isArray(saved) ? saved.slice(-120) : [];
  } catch {
    return [];
  }
}

function saveContextualContentHistory() {
  try {
    localStorage.setItem('entreSabiosHistoricoContextual', JSON.stringify(contextualContentHistory.slice(-120)));
  } catch {
    // O histórico contextual é opcional e não impede a seleção.
  }
}

const dailyQuotes = window.EntreSabiosData.dailyQuotes;

// =========================
// Seleção da frase (sem aleatoriedade)
// Compatibilidade por tags
// =========================

function getSelectedThemes() {
  const themes = new Set();
  for (const f of feelingsCatalog) {
    if (selectedFeelingIds.has(normalizeTheme(f.id))) {
      // Compatibilidade com catálogos antigos que ainda possuem acentos em IDs.
      (f.themes || []).forEach((t) => themes.add(normalizeTheme(t)));
    }
  }
  return Array.from(themes);
}

const authorBookAliases = window.EntreSabiosData.authorBookAliases;
const functionCopy = {
  recognition: 'A frase reconhece a experiência sem exigir que ela seja resolvida imediatamente.',
  clarification: 'A frase esclarece uma diferença ou mecanismo que pode estar atuando neste momento.',
  inquiry: 'A frase abre uma pergunta para observar a experiência com mais precisão.',
  grounding: 'A frase aproxima a atenção do presente e do que pode ser percebido agora.',
  reframing: 'A frase oferece outro ângulo para compreender o que está sendo vivido.',
  confrontation: 'A frase expõe uma contradição com lucidez, sem substituir a escolha pessoal.',
  action: 'A frase aponta um gesto possível depois que a experiência foi reconhecida.',
  contemplation: 'A frase sustenta uma imagem ou tensão aberta para contemplação.',
};

function buildRuntimeStory(selection, selectedThemes) {
  const content = selection.content;
  const rawTags = Array.from(new Set([...(content.themes || []), ...selectedThemes]));
  const tags = rawTags.map((tag) => tag.replace(/_/g, ' '));
  const longTypes = new Set(['citacao_longa', 'microtexto', 'reflexao_curta']);
  const inspiration = content.inspirationSource || content.author;
  const philosophy = thinkerProfiles[inspiration]
    || 'Esta reflexão pertence ao acervo editorial Entre Sábios e foi selecionada por sua relação explícita com o sentimento escolhido.';
  const reflection = functionCopy[content.editorialFunction] || functionCopy.contemplation;
  const advice = content.secondaryFunction
    ? `${functionCopy[content.secondaryFunction] || 'Permita que a reflexão permaneça como uma pergunta aberta.'}`
    : 'Permita que a reflexão acompanhe este momento antes de procurar uma resposta definitiva.';
  return {
    key: content.id,
    quote: content.finalText,
    author: content.author,
    inspirationSource: content.inspirationSource,
    contentType: longTypes.has(content.displayType) ? 'text' : 'quote',
    displayType: content.displayType,
    displayAuthor: content.displayedAuthor,
    quoteType: content.attributionType,
    source: '',
    philosophy,
    reflection,
    advice,
    sentimentos: content.associations.map((association) => association.feeling),
    intensidade: content.suitableIntensities,
    temas: content.themes,
    tom: content.tone,
    profundidade: content.displayType === 'microtexto' ? 5 : 4,
    conselho: advice,
    explicacao: reflection,
    livro: '',
    compatibilityScore: null,
    selectionReasons: [selection.reason],
    selectionDimensions: { level: selection.level, reason: selection.reason, contextSignals: selection.contextSignals },
    relevanceTier: 6 - selection.level,
    matchConfidence: selection.level <= 2 ? 'high' : selection.level <= 4 ? 'medium' : 'low',
    coverageStatus: selection.fallback ? 'fallback' : 'covered',
    fallbackReason: selection.fallback ? 'general_content' : '',
    emotionalState: selection.state,
    rawTags,
    selectedThemes,
    selectedFeelingIds: getSelectedFeelingIds(),
    book: null,
    tags: [currentIntensity, content.tone, ...tags].slice(0, 8).map((tag) => prettifyTag(tag)),
  };
}

function getSelectedFeelingLabels() {
  const state = interpretEmotionalState();
  return [state.primaryFeeling, ...state.secondaryFeelings]
    .map((id) => feelingsCatalog.find((feeling) => normalizeTheme(feeling.id) === id)?.label)
    .filter(Boolean);
}

function generateReflection({ keepHistory = true } = {}) {
  if (!ensureSelectionMin()) {
    reflectionTextEl.textContent = 'Selecione pelo menos 1 sentimento.';
    showSelectionHint();
    return false;
  }

  const selectedThemes = getSelectedThemes();
  const selection = pickRuntimeContent();
  if (!selection) {
    reflectionTextEl.textContent = 'Ainda não há uma correspondência editorial segura para esta combinação.';
    return false;
  }
  const story = buildRuntimeStory(selection, selectedThemes);

  if (!keepHistory) {
    history = [];
    historyIndex = -1;
  }

  // Guardar histórico
  if (keepHistory) {
    // evitar duplicata consecutiva
    const last = history[historyIndex];
    if (!last || last.quote !== story.quote || last.author !== story.author) {
      history = history.slice(0, historyIndex + 1);
      history.push(story);
      historyIndex = history.length - 1;
    }
  } else {
    history = [story];
    historyIndex = 0;
  }

  renderStory(history[historyIndex]);
  return true;
}

function goBack() {
  if (historyIndex <= 0) return;
  historyIndex -= 1;
  renderStory(history[historyIndex]);
}

function newPhrase() {
  if (!ensureSelectionMin()) {
    reflectionTextEl.textContent = 'Selecione pelo menos 1 sentimento.';
    showSelectionHint();
    return false;
  }

  if (currentStory && currentStoryShownAt && Date.now() - currentStoryShownAt < 5000) {
    applyStoryPreference(currentStory, -0.5);
    savePreferenceProfile();
    recordEditorialSignal('immediateRegeneration', currentStory.emotionalState || interpretEmotionalState(), {
      contentId: currentStory.key,
      relevanceTier: currentStory.relevanceTier,
    });
  }

  const selectedThemes = getSelectedThemes();
  const selection = pickRuntimeContent();
  if (!selection) return false;

  const story = buildRuntimeStory(selection, selectedThemes);

  history = history.slice(0, historyIndex + 1);
  history.push(story);
  historyIndex = history.length - 1;
  renderStory(story);
  return true;
}

// =========================
// Compartilhamento como imagem
// =========================

// =========================
// Contos Filosóficos
// =========================

// =========================
// Eventos
// =========================

generateBtn.addEventListener('click', () => {
  if (generateReflection({ keepHistory: true })) {
    playSoftBell();
    if (window.matchMedia('(max-width: 720px)').matches) {
      document.querySelector('.col-center')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

backBtn.addEventListener('click', goBack);
newBtn.addEventListener('click', () => {
  if (newPhrase()) playSoftBell();
});

likeBtn.addEventListener('click', () => setStoryFeedback(1));
dislikeBtn.addEventListener('click', () => setStoryFeedback(-1));
favoriteBtn.addEventListener('click', toggleFavorite);
favoritesBtn.addEventListener('click', () => {
  renderFavorites();
  if (typeof favoritesDialog.showModal === 'function') favoritesDialog.showModal();
  else favoritesDialog.setAttribute('open', '');
});
closeFavoritesBtn.addEventListener('click', () => favoritesDialog.close());
favoritesDialog.addEventListener('click', (event) => {
  if (event.target === favoritesDialog) favoritesDialog.close();
});
aboutBtn.addEventListener('click', () => {
  if (typeof aboutDialog.showModal === 'function') aboutDialog.showModal();
  else aboutDialog.setAttribute('open', '');
});
closeAboutBtn.addEventListener('click', () => aboutDialog.close());
aboutDialog.addEventListener('click', (event) => {
  if (event.target === aboutDialog) aboutDialog.close();
});
openTaleBtn.addEventListener('click', openPhilosophicalTale);
nextTaleBtn.addEventListener('click', () => {
  showTale({ gradualVariety: true });
});
closeTaleBtn.addEventListener('click', closePhilosophicalTale);
closeTaleTopBtn.addEventListener('click', closePhilosophicalTale);
taleDialog.addEventListener('click', (event) => {
  if (event.target === taleDialog) closePhilosophicalTale();
});
taleDialog.addEventListener('close', unlockTalePageScroll);

shareStyleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentShareStyle = button.dataset.shareStyle || 'sage';
    updateShareStyleButtons();
    updateShareCardPreview();
    setShareStatus('');
  });
});

quoteShareBtn.addEventListener('click', () => {
  shareReflectionImage({
    styleKey: getRandomShareStyle(),
    triggerButton: quoteShareBtn,
  });
});

function setImageShareBusy(isBusy, triggerButton) {
  whatsShareBtn.disabled = isBusy;
  quoteShareBtn.disabled = isBusy;
  triggerButton?.setAttribute('aria-busy', String(isBusy));
  if (triggerButton === whatsShareBtn) {
    whatsShareBtn.textContent = isBusy ? 'Gerando...' : 'Status / Stories';
  }
}

async function shareReflectionImage({ styleKey, triggerButton }) {
  if (!currentStory) {
    setShareStatus('Gere uma reflexão antes de compartilhar.');
    return;
  }

  setImageShareBusy(true, triggerButton);
  setShareStatus('Preparando a imagem…');
  let image = null;
  let imageDownloaded = false;

  try {
    image = await createShareImage({ styleKey });

    if (canShareImageFile(image.file)) {
      await navigator.share({
        title: 'Entre Sábios',
        files: [image.file],
      });
      setShareStatus('Imagem compartilhada pelas opções do dispositivo.');
      return;
    }

    downloadBlob(image.blob, image.filename);
    imageDownloaded = true;

    if (typeof navigator.share === 'function') {
      await navigator.share({
        title: 'Entre Sábios',
        text: getShareMessage(),
        url: 'https://entresabios.com/',
      });
      setShareStatus('A imagem foi baixada e a mensagem foi aberta para compartilhar. Anexe a imagem no aplicativo escolhido.');
      return;
    }

    setShareStatus('Imagem baixada. Publique-a manualmente no Status, Stories ou aplicativo de sua escolha.');
  } catch (error) {
    if (error?.name === 'AbortError') {
      setShareStatus(imageDownloaded ? 'Compartilhamento cancelado. A imagem permanece baixada.' : 'Compartilhamento cancelado.');
    } else if (image && !imageDownloaded) {
      try {
        downloadBlob(image.blob, image.filename);
        setShareStatus('O envio direto falhou, mas a imagem foi baixada para compartilhamento manual.');
      } catch {
        setShareStatus('Não foi possível compartilhar nem baixar a imagem neste navegador.');
      }
    } else if (imageDownloaded) {
      setShareStatus('A mensagem não pôde ser aberta, mas a imagem permanece baixada.');
    } else {
      setShareStatus('Não foi possível gerar a imagem neste navegador.');
    }
  } finally {
    setImageShareBusy(false, triggerButton);
  }
}

whatsShareBtn.addEventListener('click', () => {
  shareReflectionImage({
    styleKey: currentShareStyle,
    triggerButton: whatsShareBtn,
  });
});

// =========================
// Decor (imagem decorativa discreta no canvas central)
// =========================

// =========================
// Bootstrap
// =========================

async function init() {
  generateBtn.disabled = true;
  newBtn.disabled = true;
  contentLoadStatusEl.textContent = 'Carregando o acervo de reflexões…';

  // Os seletores básicos não dependem do download do acervo runtime.
  // Assim, continuam visíveis mesmo em conexão lenta ou quando o JSON falha.
  if (typeof initThemeToggle === 'function') initThemeToggle();
  initFeelings();
  initIntensity();
  initDailyQuote();
  drawDecor();

  reflectionTextEl.textContent = 'Selecione seus sentimentos, escolha a intensidade e clique em “ENCONTRAR UMA REFLEXÃO”.';
  philosophyTextEl.textContent = 'A cada reflexão, você conhecerá uma ideia do autor escolhido.';
  adviceTextEl.textContent = '—';
  bookTextEl.textContent = '—';
  bookReasonEl.textContent = 'A recomendação aparecerá junto da reflexão.';
  updateFeedbackButtons();
  updateFavoriteUi();
  updateShareStyleButtons();
  updateShareCardPreview();

  try {
    const runtime = await window.EntreSabiosRuntimeLoader.loadRuntimeContent();
    feelingsCatalog = runtime.feelings;
    runtimeContents = runtime.contents;
    runtimeSelector = window.EntreSabiosRuntimeEngine.createSelector({
      version: runtime.contentVersion,
      contents: runtimeContents,
      storage: window.localStorage,
    });
    contentLoadStatusEl.textContent = '';
    generateBtn.disabled = false;
    newBtn.disabled = false;
  } catch (error) {
    console.error('[Entre Sábios] Não foi possível carregar o acervo:', error);
    contentLoadStatusEl.textContent = 'As reflexões estão temporariamente indisponíveis. Tente atualizar a página em instantes.';
    reflectionTextEl.textContent = 'Não foi possível carregar o acervo agora.';
    return;
  }
}

init();

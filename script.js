// =========================
// Entre Sábios
// Implementação baseada na especificação (layout minimalista)
// =========================

const feelingsCatalog = window.EntreSabiosData.feelingsCatalog;
const intensityProfiles = window.EntreSabiosData.intensityProfiles;
const combinationRules = window.EntreSabiosData.combinationRules;
const authorsDb = window.EntreSabiosData.authorsDb;
const authorQuoteVariants = window.EntreSabiosData.authorQuoteVariants;
const clarityRewrites = window.EntreSabiosData.clarityRewrites;
const authorTextVariants = window.EntreSabiosData.authorTextVariants;
const supplementalTextVariants = window.EntreSabiosData.supplementalTextVariants;
const thinkerProfiles = window.EntreSabiosData.thinkerProfiles;
const feelingAuthorAffinity = window.EntreSabiosData.feelingAuthorAffinity;
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
    feelings: book.feelings || inferredFeelings,
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
let currentShareText = '';
let currentStory = null;
let currentStoryShownAt = 0;
let currentShareStyle = 'sage';

let selectedFeelingIds = new Set();
let currentIntensity = 'moderada';
const usedStoryKeysBySelection = new Map();

const preferenceProfile = loadPreferenceProfile();
const favoriteStories = loadFavoriteStories();
const viewedStoryKeys = new Set(loadViewedStoryKeys());
let recentAuthorNames = loadRecentAuthorNames();
let generatedContentCount = loadGeneratedContentCount();
let viewedTaleKeys = loadViewedTaleKeys();
let recentTaleKeys = loadRecentTaleKeys();
let contosJaVistos = [];

// =========================
// UI refs
// =========================

const feelingsGridEl = document.getElementById('feelingsGrid');
const generateBtn = document.getElementById('generateBtn');
const backBtn = document.getElementById('backBtn');
const newBtn = document.getElementById('newBtn');
const whatsShareBtn = document.getElementById('whatsShareBtn');
const copyShareBtn = document.getElementById('copyShareBtn');
const shareStatusEl = document.getElementById('shareStatus');
const shareStyleButtons = Array.from(document.querySelectorAll('[data-share-style]'));

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
const visitorCountEl = document.getElementById('visitorCount');
const openTaleBtn = document.getElementById('openTaleBtn');
const taleHintEl = document.getElementById('taleHint');
const taleDialog = document.getElementById('taleDialog');
const taleTitleEl = document.getElementById('taleTitle');
const taleOriginEl = document.getElementById('taleOrigin');
const taleReadingTimeEl = document.getElementById('taleReadingTime');
const taleTextEl = document.getElementById('taleText');
const taleLessonEl = document.getElementById('taleLesson');
const taleRelationEl = document.getElementById('taleRelation');
const taleQuestionEl = document.getElementById('taleQuestion');
const taleCycleNoticeEl = document.getElementById('taleCycleNotice');
const nextTaleBtn = document.getElementById('nextTaleBtn');
const closeTaleBtn = document.getElementById('closeTaleBtn');
const closeTaleTopBtn = document.getElementById('closeTaleTopBtn');

const intensityRadioEls = Array.from(document.querySelectorAll('input[name="intensity"]'));

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
    localStorage.setItem('caixaSabedoriaAutoresRecentes', JSON.stringify(recentAuthorNames.slice(-4)));
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

function loadRecentAuthorNames() {
  try {
    const saved = JSON.parse(localStorage.getItem('caixaSabedoriaAutoresRecentes') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
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

const dailyQuotes = window.EntreSabiosData.dailyQuotes;

// =========================
// Seleção da frase (sem aleatoriedade)
// Compatibilidade por tags
// =========================

function getSelectedThemes() {
  const themes = new Set();
  for (const f of feelingsCatalog) {
    if (selectedFeelingIds.has(f.id)) {
      (f.themes || []).forEach((t) => themes.add(normalizeTheme(t)));
    }
  }
  return Array.from(themes);
}

const verifiedQuoteMetadata = window.EntreSabiosData.verifiedQuoteMetadata;
const authorToneProfiles = window.EntreSabiosData.authorToneProfiles;
const toneFamilies = window.EntreSabiosData.toneFamilies;

function getToneFamily(tone) {
  return toneFamilies[tone] || tone;
}

const textThemeKeywords = window.EntreSabiosData.textThemeKeywords;

const curatedContentDb = window.EntreSabiosData.curatedContentDb;

function makePerspective(id, autor, tradicao, frase, sentimentos, intensidade, temas, tom, conselho, explicacao, livro) {
  return { id, autor, tradicao, frase, sentimentos, intensidade, temas, tom, profundidade: 5, conselho, explicacao, livro };
}

const perspectiveContentDb = window.EntreSabiosData.createPerspectiveContentDb(makePerspective);

const curatedNormalized = normalizeCuratedContent();
const perspectiveNormalized = normalizePerspectiveContent();
const curatedKeys = new Set([...curatedNormalized, ...perspectiveNormalized].map((item) => normalizeContentKey(item.quote)));
const authorsDbNormalized = [
  ...curatedNormalized,
  ...perspectiveNormalized,
  ...normalizeAuthorTagsDb().filter((item) => !curatedKeys.has(normalizeContentKey(item.quote))),
];

const trajectoryImpactRules = window.EntreSabiosData.trajectoryImpactRules;

const authorBookAliases = window.EntreSabiosData.authorBookAliases;

const quoteExplanationRules = window.EntreSabiosData.quoteExplanationRules;

function buildQuoteExplanation(author, selectedFeelingLabels) {
  const normalizedQuote = normalizeTheme(author.quote).replace(/_/g, ' ');
  const rule = quoteExplanationRules.find(({ terms }) => terms.every((term) => normalizedQuote.includes(normalizeTheme(term).replace(/_/g, ' '))));
  const meaning = rule?.meaning || `A frase usa a imagem de “${author.quote.split(/[.;:!?]/)[0].toLowerCase()}” para convidar você a observar sua experiência com mais consciência, antes de reagir automaticamente.`;
  const feelingContext = selectedFeelingLabels.length
    ? ` Diante de ${selectedFeelingLabels.join(', ').toLowerCase()}, isso significa criar uma pausa e perceber qual escolha respeita melhor o que você está vivendo.`
    : '';
  return `${meaning}${feelingContext}`;
}

function buildReflectionFromAuthor(author, selectedThemes, selectedFeelingLabels) {
  // As templates pedem os sentimentos (labels) do usuário.
  const feelingsLabels = selectedFeelingLabels;

  // Conselho curto: 3 linhas.
  const reflection = author.curatedExplanation || buildQuoteExplanation(author, feelingsLabels);
  const advice = author.curatedAdvice || author.adviceTemplate(feelingsLabels);

  const rawTags = Array.from(new Set([
    ...author._tagsN,
    ...selectedThemes,
  ]));
  const tags = rawTags.map((t) => t.replace(/_/g, ' '));
  return {
    key: getStoryKey(author),
    quote: author.quote,
    author: author.author,
    contentType: author.contentType || 'quote',
    displayAuthor: author.displayAuthor || author.author,
    quoteType: author.quoteType || 'inspired',
    source: author.source || '',
    curatedBook: author.curatedBook || '',
    philosophy: author.philosophy || thinkerProfiles[author.displayAuthor] || thinkerProfiles[author.author] || 'Este pensador convida você a transformar sentimentos em perguntas e escolhas mais conscientes.',
    reflection,
    advice,
    sentimentos: author.sentimentos,
    intensidade: author.intensidade,
    temas: author.temas,
    tom: author.tom,
    profundidade: author.profundidade,
    conselho: advice,
    explicacao: reflection,
    livro: '',
    compatibilityScore: author._selectionScore ?? 0,
    selectionReasons: author._selectionReasons || [],
    emotionalState: author._emotionalState || interpretEmotionalState(),
    rawTags,
    selectedThemes,
    selectedFeelingIds: getSelectedFeelingIds(),
    book: null,
    tags: [currentIntensity, author.tom, ...tags].slice(0, 8).map((x) => prettifyTag(x)),
  };
}

function getSelectedFeelingLabels() {
  return feelingsCatalog.filter((f) => selectedFeelingIds.has(f.id)).map((f) => f.label);
}

function generateReflection({ keepHistory = true } = {}) {
  if (!ensureSelectionMin()) {
    reflectionTextEl.textContent = 'Selecione pelo menos 1 sentimento.';
    showSelectionHint();
    return false;
  }

  const selectedThemes = getSelectedThemes();
  const selectedFeelingLabels = getSelectedFeelingLabels();

  const best = pickBestAuthorByThemes(selectedThemes);
  const story = buildReflectionFromAuthor(best, selectedThemes, selectedFeelingLabels);

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
  }

  const selectedThemes = getSelectedThemes();
  const selectedFeelingLabels = getSelectedFeelingLabels();

  const excludeAuthors = currentStory ? [currentStory.author] : [];
  const best = pickBestAuthorByThemes(selectedThemes, getSelectedFeelingIds(), { excludeAuthors });
  if (!best) return false;

  const story = buildReflectionFromAuthor(best, selectedThemes, selectedFeelingLabels);

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

if (copyShareBtn) {
  copyShareBtn.addEventListener('click', async () => {
    const text = currentShareText || `${quoteTextEl.textContent}\n${quoteAuthorEl.textContent}`;
    if (!text || !navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
    setShareStatus('Mensagem copiada.');
  });
}

shareStyleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentShareStyle = button.dataset.shareStyle || 'sage';
    updateShareStyleButtons();
    updateShareCardPreview();
    setShareStatus('');
  });
});

whatsShareBtn.addEventListener('click', async () => {
  whatsShareBtn.disabled = true;
  whatsShareBtn.textContent = 'Gerando...';

  try {
    const image = await createShareImage();

    if (navigator.share && navigator.canShare?.({ files: [image.file] })) {
      await navigator.share({
        title: 'Entre Sábios',
        files: [image.file],
      });
      setShareStatus('Imagem enviada para o compartilhamento do celular.');
      return;
    }

    downloadBlob(image.blob, image.filename);
    setShareStatus('Este navegador não envia imagem direto. Baixei a imagem para publicar no Status ou Stories.');
  } catch (error) {
    if (error?.name !== 'AbortError') setShareStatus('Não consegui compartilhar a imagem neste navegador.');
  } finally {
    whatsShareBtn.disabled = false;
    whatsShareBtn.textContent = 'Status / Stories';
  }
});

// =========================
// Decor (imagem decorativa discreta no canvas central)
// =========================

// =========================
// Bootstrap
// =========================

(function init() {
  initFeelings();
  initIntensity();
  initDailyQuote();
  drawDecor();
  updateVisitorCount();

  // Placeholder de conteúdo
  reflectionTextEl.textContent = 'Selecione seus sentimentos, escolha a intensidade e clique em “ENCONTRAR UMA REFLEXÃO”.';
  philosophyTextEl.textContent = 'A cada reflexão, você conhecerá uma ideia do autor escolhido.';
  adviceTextEl.textContent = '—';
  bookTextEl.textContent = '—';
  bookReasonEl.textContent = 'A recomendação aparecerá junto da reflexão.';
  updateFeedbackButtons();
  updateFavoriteUi();
  updateShareStyleButtons();
  updateShareCardPreview();

})();

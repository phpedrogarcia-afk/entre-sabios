// Renderização da reflexão principal e tags.
// Extraído de script.js na Fase 5 da refatoração segura.
// Não alterar comportamento nem aparência nesta fase.

function updateBookRecommendation(story) {
  const recommendation = recommendBookForStory(story);
  const { book, score, reasons, commonThemes = [] } = recommendation;
  story.book = book;
  story.livro = book.title;
  story.bookCompatibilityScore = score;
  story.bookSelectionReasons = reasons;

  bookTextEl.textContent = `${book.title}, de ${book.author}`;
  const functionLabels = {
    validacao: 'validação',
    dissolucao: 'acolhimento',
    acao: 'sustentação prática',
    choque: 'desconstrução',
  };
  const authorContext = recommendation.sameAuthor
    ? `A reflexão nasce próxima de ${story.displayAuthor || story.author}, mas a indicação foi filtrada pela função clínica da leitura.`
    : `Esta obra foi escolhida para funcionar como ${functionLabels[book.bookFunction] || 'travessia'}, não apenas como eco do sentimento.`;
  const themeContext = commonThemes.length
    ? ` Ela desenvolve especialmente ${commonThemes.slice(0, 3).map((theme) => theme.replace(/_/g, ' ')).join(', ')}.`
    : ` Ela amplia o assunto predominante e oferece continuidade ao conselho apresentado.`;
  const clinicalContext = book.clinicalNote ? ` ${book.clinicalNote}.` : '';
  bookReasonEl.textContent = `${authorContext}${themeContext}${clinicalContext}`;
}

function prettifyTag(s) {
  return String(s)
    .replace(/_/g, ' ')
    .trim();
}

function ensureSelectionMin() {
  // A especificação diz “seleciona um ou mais”.
  // Mantemos o mínimo de 1 para permitir.
  return selectedFeelingIds.size >= 1;
}

function buildStoryAttribution(story) {
  const displayAuthor = story.displayAuthor || story.author || '';
  const quoteType = story.quoteType || 'inspired';

  if (!displayAuthor || displayAuthor === 'Reflexão contemporânea' || quoteType === 'unknown' || quoteType === 'anonymous') {
    return 'Reflexão contemporânea';
  }

  if (quoteType === 'exact') return displayAuthor;
  return `Ideia inspirada em ${displayAuthor}`;
}

function renderStory(story) {
  currentStory = story;
  currentStoryShownAt = Date.now();
  quoteTextEl.classList.remove('invitation');
  likeBtn.disabled = false;
  dislikeBtn.disabled = false;
  favoriteBtn.disabled = false;
  const isLongText = story.contentType === 'text';
  quoteTextEl.textContent = isLongText ? story.quote : `“${story.quote}”`;
  quoteTextEl.classList.toggle('long-quote', story.quote.length > 180);
  explanationTitleEl.textContent = isLongText
    ? 'O QUE ESTE TEXTO QUER DIZER'
    : 'O QUE ESSA FRASE QUER DIZER';
  story.attribution = buildStoryAttribution(story);
  quoteAuthorEl.textContent = `— ${story.attribution}${story.source ? ` · ${story.source}` : ''}`;
  reflectionTextEl.textContent = story.reflection;
  philosophyTextEl.textContent = story.philosophy;
  adviceTextEl.textContent = story.advice;
  updateBookRecommendation(story);

  tagsRowEl.innerHTML = '';
  story.tags.forEach((t) => {
    const el = document.createElement('div');
    el.className = 'tag';
    el.textContent = t;
    tagsRowEl.appendChild(el);
  });

  currentShareText = `${story.quote}\n— ${story.attribution}${story.source ? ` · ${story.source}` : ''}`;
  updateFeedbackButtons();
  preferenceNoteEl.textContent = '';
  updateFavoriteUi();
  updateShareCardPreview();
}

function makeTag(t) {
  const el = document.createElement('div');
  el.className = 'tag';
  el.textContent = t;
  return el;
}

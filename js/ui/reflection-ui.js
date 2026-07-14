// Renderização da reflexão principal e tags.
// Extraído de script.js na Fase 5 da refatoração segura.
// Não alterar comportamento nem aparência nesta fase.

function updateBookRecommendation(story) {
  const recommendation = recommendBookForStory(story);
  if (!recommendation?.book) {
    story.book = null;
    story.livro = '';
    story.bookCompatibilityScore = null;
    story.bookSelectionReasons = [];
    bookRecommendationEl.hidden = true;
    bookTextEl.textContent = '';
    bookReasonEl.textContent = '';
    return;
  }
  const { book, score, reasons, commonThemes = [] } = recommendation;
  story.book = book;
  story.livro = book.title;
  story.bookCompatibilityScore = score;
  story.bookSelectionReasons = reasons;

  bookRecommendationEl.hidden = false;
  bookTextEl.textContent = `${book.title}, de ${book.author}`;
  const connection = commonThemes.slice(0, 3).map(prettifyTag);
  const connectionList = connection.length > 1
    ? `${connection.slice(0, -1).join(', ')} e ${connection.at(-1)}`
    : connection[0];
  const connectionText = connection.length
    ? connection.length === 1
      ? `Ela aprofunda o tema ${connectionList}, que também sustenta esta reflexão.`
      : `Ela aprofunda os temas ${connectionList}, que também sustentam esta reflexão.`
    : `Ela aborda ${prettifyTag(story.emotionalState?.primaryFeeling || '')}, sentimento central desta reflexão.`;
  const authorText = recommendation.sameAuthor
    ? `A obra é do próprio autor associado ao conteúdo, mas foi indicada também por essa relação temática.`
    : '';
  bookReasonEl.textContent = [book.description, connectionText, authorText].filter(Boolean).join(' ');
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
  return String(story.displayAuthor || '').trim() || 'Autoria em revisão';
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
  quoteAuthorEl.textContent = `— ${story.attribution}`;
  const sourceTitle = String(story.source?.title || '').trim();
  quoteSourceEl.hidden = !sourceTitle;
  quoteSourceEl.textContent = sourceTitle ? `Fonte: ${sourceTitle}` : '';
  const hasSpecificExplanation = Boolean(String(story.reflection || '').trim());
  explanationBlockEl.hidden = !hasSpecificExplanation;
  reflectionTextEl.textContent = hasSpecificExplanation ? story.reflection : '';
  const hasSpecificPhilosophy = Boolean(String(story.philosophy || '').trim());
  philosophyBlockEl.hidden = !hasSpecificPhilosophy;
  philosophyTitleEl.textContent = hasSpecificPhilosophy ? story.philosophyLabel : '';
  philosophyTextEl.textContent = hasSpecificPhilosophy ? story.philosophy : '';
  const hasSpecificAdvice = Boolean(String(story.advice || '').trim() && String(story.adviceLabel || '').trim());
  adviceBlockEl.hidden = !hasSpecificAdvice;
  adviceTitleEl.textContent = hasSpecificAdvice ? story.adviceLabel : '';
  adviceTextEl.textContent = hasSpecificAdvice ? story.advice : '';
  updateBookRecommendation(story);

  tagsRowEl.innerHTML = '';
  story.tags.forEach((t) => {
    const el = document.createElement('div');
    el.className = 'tag';
    el.textContent = t;
    tagsRowEl.appendChild(el);
  });

  updateFeedbackButtons();
  preferenceNoteEl.textContent = '';
  updateFavoriteUi();
  updateShareCardPreview();
}

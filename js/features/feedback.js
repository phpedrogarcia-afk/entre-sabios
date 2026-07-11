// Preferências, like e dislike.
// Extraído de script.js na Fase 4 da refatoração segura.
// Não alterar comportamento nesta fase.

function loadPreferenceProfile() {
  const fallback = {
    authors: {},
    tags: {},
    books: {},
    storyFeedback: {},
  };

  try {
    const saved = localStorage.getItem('caixaSabedoriaPreferencias');
    if (!saved) return fallback;
    return { ...fallback, ...JSON.parse(saved) };
  } catch {
    return fallback;
  }
}

function savePreferenceProfile() {
  try {
    localStorage.setItem('caixaSabedoriaPreferencias', JSON.stringify(preferenceProfile));
  } catch {
    // Se o navegador bloquear localStorage, o site continua funcionando sem aprendizado persistente.
  }
}

function adjustPreference(bucket, key, delta) {
  if (!key) return;
  bucket[key] = (bucket[key] || 0) + delta;
  if (bucket[key] === 0) delete bucket[key];
}

function applyStoryPreference(story, delta) {
  adjustPreference(preferenceProfile.authors, story.author, delta * 3);
  (story.rawTags || []).forEach((tag) => adjustPreference(preferenceProfile.tags, tag, delta));
  if (story.book) adjustPreference(preferenceProfile.books, story.book.title, delta * 2);
}

function setStoryFeedback(value) {
  if (!currentStory) {
    preferenceNoteEl.textContent = 'Gere uma reflexão primeiro para marcar gostei ou não gostei.';
    return;
  }

  const key = currentStory.key;
  const previous = preferenceProfile.storyFeedback[key] || 0;
  const next = previous === value ? 0 : value;
  const delta = next - previous;

  if (delta !== 0) applyStoryPreference(currentStory, delta);

  if (next === 0) delete preferenceProfile.storyFeedback[key];
  else preferenceProfile.storyFeedback[key] = next;

  savePreferenceProfile();
  updateFeedbackButtons();
  updateBookRecommendation(currentStory);
  preferenceNoteEl.textContent = next === 0
    ? ''
    : next > 0
      ? 'Entendido. Suas próximas reflexões considerarão este estilo.'
      : 'Entendido. Vamos reduzir recomendações parecidas com esta.';
}

function updateFeedbackButtons() {
  const value = currentStory ? (preferenceProfile.storyFeedback[currentStory.key] || 0) : 0;
  likeBtn.classList.toggle('active-like', value > 0);
  dislikeBtn.classList.toggle('active-dislike', value < 0);
  likeBtn.setAttribute('aria-pressed', String(value > 0));
  dislikeBtn.setAttribute('aria-pressed', String(value < 0));
}

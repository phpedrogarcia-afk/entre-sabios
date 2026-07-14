// Preferências, like e dislike.
// Extraído de script.js na Fase 4 da refatoração segura.
// Não alterar comportamento nesta fase.

function loadPreferenceProfile() {
  const fallback = {
    tags: {},
    books: {},
    storyFeedback: {},
  };

  try {
    const saved = localStorage.getItem('caixaSabedoriaPreferencias');
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return {
      tags: parsed?.tags && typeof parsed.tags === 'object' ? parsed.tags : {},
      books: parsed?.books && typeof parsed.books === 'object' ? parsed.books : {},
      storyFeedback: parsed?.storyFeedback && typeof parsed.storyFeedback === 'object'
        ? parsed.storyFeedback
        : {},
    };
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
  if (next < 0) {
    recordEditorialSignal('frequentDislike', currentStory.emotionalState || interpretEmotionalState(), {
      contentId: currentStory.key,
      relevanceTier: currentStory.relevanceTier,
    });
  }
  updateFeedbackButtons();
  updateBookRecommendation(currentStory);
  preferenceNoteEl.textContent = next === 0
    ? ''
    : next > 0
      ? 'Entendido. Sua avaliação foi registrada.'
      : 'Entendido. Sua avaliação foi registrada sem priorizar autores.';
}

function updateFeedbackButtons() {
  const value = currentStory ? (preferenceProfile.storyFeedback[currentStory.key] || 0) : 0;
  likeBtn.classList.toggle('active-like', value > 0);
  dislikeBtn.classList.toggle('active-dislike', value < 0);
  likeBtn.setAttribute('aria-pressed', String(value > 0));
  dislikeBtn.setAttribute('aria-pressed', String(value < 0));
}

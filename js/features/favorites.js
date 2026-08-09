// Leituras salvas e sua biblioteca local (chave legada preservada).
// Extraído de script.js na Fase 4 da refatoração segura.

function loadFavoriteStories() {
  try {
    const saved = JSON.parse(localStorage.getItem('caixaSabedoriaFavoritas') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveFavoriteStories() {
  try {
    localStorage.setItem('caixaSabedoriaFavoritas', JSON.stringify(favoriteStories));
  } catch {
    // Favoritar continua sendo opcional quando o armazenamento do navegador estiver indisponível.
  }
}

function isCurrentStoryFavorite() {
  return Boolean(currentStory && favoriteStories.some((story) => story.key === currentStory.key));
}

function updateFavoriteUi() {
  const active = isCurrentStoryFavorite();
  favoriteBtn.classList.toggle('active-favorite', active);
  favoriteBtn.setAttribute('aria-pressed', String(active));
  favoriteBtn.setAttribute('aria-label', active ? 'Remover leitura salva' : 'Salvar leitura');
  favoriteBtn.title = active ? 'Remover leitura salva' : 'Salvar leitura';
  favoritesCountEl.textContent = String(favoriteStories.length);
}

function toggleFavorite() {
  if (!currentStory) {
    preferenceNoteEl.textContent = 'Gere uma reflexão primeiro para salvar a leitura.';
    return;
  }
  const index = favoriteStories.findIndex((story) => story.key === currentStory.key);

  if (index >= 0) {
    favoriteStories.splice(index, 1);
    preferenceNoteEl.textContent = 'Leitura removida das salvas.';
  } else {
    favoriteStories.unshift({
      key: currentStory.key,
      quote: currentStory.quote,
      attribution: currentStory.attribution,
      source: currentStory.source || '',
      savedAt: new Date().toISOString(),
    });
    preferenceNoteEl.textContent = 'Leitura salva para você voltar quando quiser.';
  }

  saveFavoriteStories();
  updateFavoriteUi();
}

function renderFavorites() {
  favoritesListEl.innerHTML = '';
  if (!favoriteStories.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-favorites';
    empty.textContent = 'As frases que tocarem você poderão morar aqui.';
    favoritesListEl.appendChild(empty);
    return;
  }

  favoriteStories.forEach((story) => {
    const item = document.createElement('article');
    item.className = 'favorite-item';

    const quote = document.createElement('div');
    quote.className = 'favorite-item-quote';
    quote.textContent = `“${story.quote}”`;

    const meta = document.createElement('div');
    meta.className = 'favorite-item-meta';
    meta.textContent = story.source ? `${story.attribution} · ${story.source}` : story.attribution;

    const actions = document.createElement('div');
    actions.className = 'favorite-item-actions';
    const remove = document.createElement('button');
    remove.className = 'ghost';
    remove.type = 'button';
    remove.textContent = 'Remover';
    remove.addEventListener('click', () => {
      const index = favoriteStories.findIndex((favorite) => favorite.key === story.key);
      if (index >= 0) favoriteStories.splice(index, 1);
      saveFavoriteStories();
      updateFavoriteUi();
      renderFavorites();
    });

    actions.appendChild(remove);
    item.append(quote, meta, actions);
    favoritesListEl.appendChild(item);
  });
}

// Leituras salvas e sua biblioteca local (chave legada preservada).
// Reflexões antigas continuam válidas; contos usam entradas tipadas na mesma chave.

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

function isTaleFavoriteEntry(entry) {
  return entry?.type === 'tale' && typeof entry.taleId === 'string';
}

function isCurrentStoryFavorite() {
  return Boolean(currentStory && favoriteStories.some((story) => (
    !isTaleFavoriteEntry(story) && story.key === currentStory.key
  )));
}

function isTaleFavorite(tale) {
  return Boolean(tale?.id && favoriteStories.some((entry) => (
    isTaleFavoriteEntry(entry) && entry.taleId === tale.id
  )));
}

function updateFavoriteUi() {
  const active = isCurrentStoryFavorite();
  favoriteBtn.classList.toggle('active-favorite', active);
  favoriteBtn.setAttribute('aria-pressed', String(active));
  favoriteBtn.setAttribute('aria-label', active ? 'Remover leitura salva' : 'Salvar leitura');
  favoriteBtn.title = active ? 'Remover leitura salva' : 'Salvar leitura';
  favoritesCountEl.textContent = String(favoriteStories.length);
}

function updateTaleFavoriteUi() {
  if (typeof taleFavoriteBtn === 'undefined' || !taleFavoriteBtn) return;
  const active = isTaleFavorite(typeof currentTale === 'undefined' ? null : currentTale);
  taleFavoriteBtn.classList.toggle('active-favorite', active);
  taleFavoriteBtn.setAttribute('aria-pressed', String(active));
  taleFavoriteBtn.setAttribute('aria-label', active ? 'Remover conto salvo' : 'Salvar conto');
  taleFavoriteBtn.title = active ? 'Remover conto salvo' : 'Salvar conto';
  taleFavoriteBtn.textContent = active ? '★' : '☆';
}

function toggleFavorite() {
  if (!currentStory) {
    preferenceNoteEl.textContent = 'Gere uma reflexão primeiro para salvar a leitura.';
    return;
  }
  const index = favoriteStories.findIndex((story) => (
    !isTaleFavoriteEntry(story) && story.key === currentStory.key
  ));

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

function toggleTaleFavorite() {
  if (!currentTale?.id) return;
  const index = favoriteStories.findIndex((entry) => (
    isTaleFavoriteEntry(entry) && entry.taleId === currentTale.id
  ));

  if (index >= 0) {
    favoriteStories.splice(index, 1);
  } else {
    const summary = currentTale.umModoDeOlhar?.[0]
      || currentTale.explicacaoFilosofica?.[0]
      || '';
    favoriteStories.unshift({
      type: 'tale',
      key: `tale:${currentTale.id}`,
      taleId: currentTale.id,
      title: currentTale.titulo,
      origin: currentTale.origem || '',
      summary,
      savedAt: new Date().toISOString(),
    });
  }

  saveFavoriteStories();
  updateFavoriteUi();
  updateTaleFavoriteUi();
}

function removeSavedReading(story) {
  const index = favoriteStories.indexOf(story);
  if (index >= 0) favoriteStories.splice(index, 1);
  saveFavoriteStories();
  updateFavoriteUi();
  updateTaleFavoriteUi();
  renderFavorites();
}

function renderSavedTale(story) {
  const item = document.createElement('article');
  item.className = 'favorite-item favorite-item-tale';

  const title = document.createElement('div');
  title.className = 'favorite-item-title';
  title.textContent = story.title || 'Conto filosófico';

  const meta = document.createElement('div');
  meta.className = 'favorite-item-meta';
  meta.textContent = story.origin ? `Conto · ${story.origin}` : 'Conto filosófico';

  const summary = document.createElement('div');
  summary.className = 'favorite-item-summary';
  summary.textContent = story.summary || 'Abra o conto para continuar a leitura.';

  const actions = document.createElement('div');
  actions.className = 'favorite-item-actions';
  const open = document.createElement('button');
  open.className = 'ghost favorite-item-open';
  open.type = 'button';
  open.textContent = 'Abrir conto';
  open.addEventListener('click', () => {
    if (favoritesDialog.open) favoritesDialog.close();
    openSavedTale(story.taleId);
  });
  const remove = document.createElement('button');
  remove.className = 'ghost';
  remove.type = 'button';
  remove.textContent = 'Remover';
  remove.addEventListener('click', () => removeSavedReading(story));

  actions.append(open, remove);
  item.append(title, meta, summary, actions);
  return item;
}

function renderSavedReflection(story) {
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
  remove.addEventListener('click', () => removeSavedReading(story));

  actions.appendChild(remove);
  item.append(quote, meta, actions);
  return item;
}

function renderFavorites() {
  favoritesListEl.innerHTML = '';
  if (!favoriteStories.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-favorites';
    empty.textContent = 'As reflexões e os contos que tocarem você poderão morar aqui.';
    favoritesListEl.appendChild(empty);
    return;
  }

  favoriteStories.forEach((story) => {
    favoritesListEl.appendChild(
      isTaleFavoriteEntry(story) ? renderSavedTale(story) : renderSavedReflection(story),
    );
  });
}

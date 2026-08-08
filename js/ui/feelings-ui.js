// Interface de sentimentos e síntese emocional.
// Extraído de script.js na Fase 5 da refatoração segura.
// Não alterar comportamento nem aparência nesta fase.

function initFeelings() {
  feelingsGridEl.innerHTML = '';

  for (const f of feelingsCatalog) {
    const card = document.createElement('label');
    card.className = 'feeling';

    const input = document.createElement('input');
    input.type = 'checkbox';
    const feelingId = normalizeTheme(f.id);
    card.dataset.feelingId = feelingId;
    input.value = feelingId;
    input.name = 'feelings';
    const hasRuntimeCoverage = runtimeContents.length === 0 || runtimeContents.some((content) =>
      content.associations?.some((association) => association.feeling === feelingId));
    input.disabled = !hasRuntimeCoverage;
    if (!hasRuntimeCoverage) {
      card.classList.add('unavailable');
      card.title = `${f.label}: em construção na Biblioteca V2`;
      card.setAttribute('aria-disabled', 'true');
    }

    const icon = document.createElement('span');
    icon.className = 'feeling-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = `<svg viewBox="0 0 24 24" focusable="false"><use href="assets/icons/feelings-sprite.svg#${feelingId}"></use></svg>`;

    const text = document.createElement('span');
    text.className = 'feeling-label';
    text.textContent = hasRuntimeCoverage ? f.label : `${f.label} · em construção`;

    card.appendChild(input);
    card.appendChild(icon);
    card.appendChild(text);

    input.addEventListener('change', () => {
      if (input.checked) {
        selectedFeelingIds.add(feelingId);
        if (!primaryFeelingId) primaryFeelingId = feelingId;
      } else {
        selectedFeelingIds.delete(feelingId);
        if (primaryFeelingId === feelingId) primaryFeelingId = getSelectedFeelingIds()[0] || null;
      }
      lastSelectionSignature = null;
      syncSelectedCards();
    });

    feelingsGridEl.appendChild(card);
  }

  syncSelectedCards();
}

function syncSelectedCards() {
  const cards = Array.from(feelingsGridEl.querySelectorAll('.feeling'));
  const selectedIds = getSelectedFeelingIds();
  if (!selectedIds.includes(primaryFeelingId)) primaryFeelingId = selectedIds[0] || null;
  const primaryFeeling = primaryFeelingId;
  cards.forEach((card) => {
    const input = card.querySelector('input');
    const id = input.value;
    if (selectedFeelingIds.has(id)) card.classList.add('selected');
    else card.classList.remove('selected');
    card.classList.toggle('primary-feeling', id === primaryFeeling);
  });

  renderPrimaryFeelingControl();
  generateBtn.classList.toggle('has-selection', selectedFeelingIds.size > 0);
  if (selectedFeelingIds.size > 0) {
    selectionHintEl.textContent = '';
    if (taleHintEl) taleHintEl.textContent = '';
  }
}

function setPrimaryFeeling(feelingId) {
  if (!selectedFeelingIds.has(feelingId)) return;
  primaryFeelingId = feelingId;
  lastSelectionSignature = null;
  syncSelectedCards();
  announcePrimaryFeelingChange(feelingId);
  if (currentStory) {
    currentStory.selectedFeelingIds = getSelectedFeelingIds();
    currentStory.emotionalState = interpretEmotionalState();
    updateBookRecommendation(currentStory);
    preferenceNoteEl.textContent = `Próximas escolhas serão guiadas por ${getFeelingLabel(feelingId)}.`;
  }
}

function announcePrimaryFeelingChange(feelingId) {
  if (primaryFeelingAnnouncementTimer) window.clearTimeout(primaryFeelingAnnouncementTimer);
  primaryFeelingAnnouncementEl.textContent = `Sentimento principal alterado para ${getFeelingLabel(feelingId)}.`;
  primaryFeelingAnnouncementEl.classList.add('is-visible');
  primaryFeelingAnnouncementTimer = window.setTimeout(() => {
    primaryFeelingAnnouncementEl.classList.remove('is-visible');
    primaryFeelingAnnouncementEl.textContent = '';
    primaryFeelingAnnouncementTimer = null;
  }, 2400);
}

function getFeelingLabel(feelingId) {
  return feelingsCatalog.find((feeling) => normalizeTheme(feeling.id) === feelingId)?.label || feelingId;
}

function renderPrimaryFeelingControl() {
  const selectedIds = getSelectedFeelingIds();
  primaryFeelingControlEl.hidden = selectedIds.length === 0;
  primaryFeelingLabelEl.textContent = primaryFeelingId ? getFeelingLabel(primaryFeelingId) : '—';
  secondaryFeelingActionsEl.innerHTML = '';
  selectedIds.filter((id) => id !== primaryFeelingId).forEach((id) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'focus-feeling-btn';
    button.textContent = getFeelingLabel(id);
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `Definir ${getFeelingLabel(id)} como sentimento principal`);
    button.addEventListener('click', () => setPrimaryFeeling(id));
    secondaryFeelingActionsEl.appendChild(button);
  });
  renderEmotionalSynthesis();
}

function renderEmotionalSynthesis() {
  const contract = getCurrentSelectionContract();
  if (contract.secondaryFeelings.length === 0) {
    emotionalSynthesisSummaryEl.hidden = true;
    synthesisSecondaryFeelingsEl.textContent = '';
    synthesisHumanSummaryEl.textContent = '';
    return;
  }

  const synthesis = emotionalSynthesisResolver.resolve(contract);
  if (!synthesis?.profile?.humanSummary) {
    emotionalSynthesisSummaryEl.hidden = true;
    return;
  }

  synthesisSecondaryFeelingsEl.textContent = contract.secondaryFeelings
    .map(getFeelingLabel)
    .join(contract.secondaryFeelings.length === 2 ? ' e ' : '');
  const isSpecificSynthesis = synthesis.fallbackLevel <= 2;
  synthesisHumanSummaryEl.textContent = isSpecificSynthesis ? synthesis.profile.humanSummary : '';
  emotionalSynthesisSummaryEl.classList.toggle('is-ambiguous', synthesis.profile.ambiguity === 'high');
  emotionalSynthesisSummaryEl.hidden = !isSpecificSynthesis;
}

function showSelectionHint(message = 'Escolha pelo menos um sentimento antes de gerar sua reflexão.') {
  selectionHintEl.textContent = message;
  feelingsGridEl.classList.remove('needs-selection');
  void feelingsGridEl.offsetWidth;
  feelingsGridEl.classList.add('needs-selection');
  window.setTimeout(() => feelingsGridEl.classList.remove('needs-selection'), 420);
}

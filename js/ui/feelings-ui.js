// Interface de sentimentos e intensidade.
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
    input.value = feelingId;

    const text = document.createElement('span');
    text.textContent = f.label;

    card.appendChild(input);
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
  syncMotivationPreference();

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
    synthesisMotivationDirectionEl.hidden = true;
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
  synthesisHumanSummaryEl.textContent = synthesis.profile.humanSummary;
  synthesisMotivationDirectionEl.hidden = !contract.needsMotivation;
  emotionalSynthesisSummaryEl.classList.toggle('is-ambiguous', synthesis.profile.ambiguity === 'high');
  emotionalSynthesisSummaryEl.hidden = false;
}

function showSelectionHint(message = 'Escolha pelo menos um sentimento antes de gerar sua reflexão.') {
  selectionHintEl.textContent = message;
  feelingsGridEl.classList.remove('needs-selection');
  void feelingsGridEl.offsetWidth;
  feelingsGridEl.classList.add('needs-selection');
  window.setTimeout(() => feelingsGridEl.classList.remove('needs-selection'), 420);
}

function initIntensity() {
  intensityRadioEls.forEach((r) => {
    r.addEventListener('change', () => {
      currentIntensity = r.value;
      lastSelectionSignature = null;
    });
  });
}

function syncMotivationPreference() {
  const hasEmotionalSelection = selectedFeelingIds.size > 0;
  if (!hasEmotionalSelection) needsMotivation = false;
  motivationToggleEl.disabled = !hasEmotionalSelection;
  motivationToggleEl.setAttribute('aria-pressed', String(needsMotivation));
  motivationToggleEl.classList.toggle('is-active', needsMotivation);
}

function initMotivationPreference() {
  needsMotivation = false;
  syncMotivationPreference();
  motivationToggleEl.addEventListener('click', () => {
    if (motivationToggleEl.disabled) return;
    needsMotivation = !needsMotivation;
    syncMotivationPreference();
    renderEmotionalSynthesis();
  });
}

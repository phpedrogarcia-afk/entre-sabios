// Interface de sentimentos com ícones SVG.
// Atualizado para replicar o layout da imagem de referência.

function getFeelingIcon(feelingId) {
  const icons = {
    ansiedade: '<svg viewBox="0 0 24 24"><path d="M2 12c1-2 2-4 4-4s3 2 4 4 1 4 4 4 3-2 4-4 1-4 4-4"/><path d="M2 18c1-2 2-4 4-4s3 2 4 4 1 4 4 4 3-2 4-4 1-4 4-4"/><path d="M2 6c1-2 2-4 4-4s3 2 4 4 1 4 4 4 3-2 4-4 1-4 4-4"/></svg>',
    medo: '<svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    amor: '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.3l7.8-7.9 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
    saudade: '<svg viewBox="0 0 24 24"><path d="M12 2C8 6 4 10 4 14c0 4 3.5 8 8 8s8-4 8-8c0-4-4-8-8-12Z"/></svg>',
    esperanca: '<svg viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
    solidao: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>',
    confusao: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
    autoconhecimento: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 3 2 5.5 4 7.5L12 21l3-4.5c2-2 4-4.5 4-7.5a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    inseguranca: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
    raiva: '<svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    culpa: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12l3 3 5-5"/></svg>',
    luto: '<svg viewBox="0 0 24 24"><path d="M12 2a5 5 0 0 0-5 5c0 3 2 5 5 9 3-4 5-6 5-9a5 5 0 0 0-5-5z"/><path d="M12 2v12"/></svg>',
    tristeza: '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    falta_de_proposito: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  };
  return icons[feelingId] || icons.confusao;
}

function initFeelings() {
  feelingsGridEl.innerHTML = '';

  for (const f of feelingsCatalog) {
    const card = document.createElement('label');
    card.className = 'feeling';

    const input = document.createElement('input');
    input.type = 'checkbox';
    const feelingId = normalizeTheme(f.id);
    input.value = feelingId;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'feeling-icon';
    iconSpan.innerHTML = getFeelingIcon(feelingId);

    const text = document.createElement('span');
    text.textContent = f.label;

    card.appendChild(input);
    card.appendChild(iconSpan);
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
  currentIntensity = intensityRadioEls.find((radio) => radio.checked)?.value || null;
  intensityRadioEls.forEach((r) => {
    r.addEventListener('change', () => {
      currentIntensity = r.value;
      lastSelectionSignature = null;
      if (selectedFeelingIds.size > 0) selectionHintEl.textContent = '';
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

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
    input.value = f.id;

    const text = document.createElement('span');
    text.textContent = f.label;

    card.appendChild(input);
    card.appendChild(text);

    card.addEventListener('click', (e) => {
      e.preventDefault();
      const checked = !input.checked;
      input.checked = checked;
      if (checked) selectedFeelingIds.add(f.id);
      else selectedFeelingIds.delete(f.id);
      syncSelectedCards();
    });

    feelingsGridEl.appendChild(card);
  }

  syncSelectedCards();
}

function syncSelectedCards() {
  const cards = Array.from(feelingsGridEl.querySelectorAll('.feeling'));
  const primaryFeeling = getSelectedFeelingIds()[0];
  cards.forEach((card) => {
    const input = card.querySelector('input');
    const id = input.value;
    if (selectedFeelingIds.has(id)) card.classList.add('selected');
    else card.classList.remove('selected');
    card.classList.toggle('primary-feeling', id === primaryFeeling);
  });

  generateBtn.classList.toggle('has-selection', selectedFeelingIds.size > 0);
  if (selectedFeelingIds.size > 0) {
    selectionHintEl.textContent = '';
    if (taleHintEl) taleHintEl.textContent = '';
  }
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
    });
  });
}

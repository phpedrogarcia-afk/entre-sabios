// Seleção lexicográfica do acervo runtime. Nenhum catálogo legado participa desta etapa.
const DEBUG_EMOTIONAL_SELECTION = false;

function getStoryKey(content) {
  return content.id;
}

function getSelectionSignature(state) {
  return [state.primaryFeeling, ...(state.secondaryFeelings || []).slice().sort(), state.intensity].join('|');
}

function recordEditorialSignal(event, state, details = {}) {
  if (DEBUG_EMOTIONAL_SELECTION) console.info('[Entre Sábios: editorial]', { event, ...details });
  try {
    const key = 'entreSabiosSinaisEditoriais';
    const aggregate = JSON.parse(localStorage.getItem(key) || '{}');
    const bucket = `${event}:${state.primaryFeeling}:${state.intensity}`;
    aggregate[bucket] = Math.min(999, (aggregate[bucket] || 0) + 1);
    localStorage.setItem(key, JSON.stringify(aggregate));
  } catch {
    // Sinais agregados são opcionais.
  }
}

function pickRuntimeContent() {
  if (!runtimeSelector) return null;
  const state = interpretEmotionalState();
  const signature = getSelectionSignature(state);
  const firstResponse = signature !== lastSelectionSignature;
  lastSelectionSignature = signature;
  const result = runtimeSelector.select(state, { firstResponse });
  if (!result) {
    recordEditorialSignal('contentGap', state);
    return null;
  }
  viewedStoryKeys.add(result.content.id);
  generatedContentCount += 1;
  saveViewedStoryKeys();
  saveGeneratedContentCount();
  if (DEBUG_EMOTIONAL_SELECTION) console.info('[Entre Sábios: seleção]', result);
  return { ...result, state };
}

// Seleção lexicográfica do acervo runtime. Nenhum catálogo legado participa desta etapa.
function isEmotionalSelectionDebugEnabled() {
  try {
    const queryEnabled = typeof window !== 'undefined'
      && new URLSearchParams(window.location.search).get('debugEmotional') === '1';
    const storedEnabled = typeof localStorage !== 'undefined'
      && localStorage.getItem('entreSabiosDebugEmotional') === '1';
    return queryEnabled || storedEnabled;
  } catch {
    return false;
  }
}

const SELECTION_DIAGNOSTIC_SESSION_KEY = 'entreSabiosSelectionDiagnosticSession:v1';
let activeSelectionDiagnosticSession = null;

function createSelectionDiagnosticSession() {
  return {
    schemaVersion: 1,
    sessionId: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    startedAt: new Date().toISOString(),
    selections: [],
  };
}

function loadSelectionDiagnosticSession() {
  if (!isEmotionalSelectionDebugEnabled()) return null;
  if (activeSelectionDiagnosticSession) return activeSelectionDiagnosticSession;
  try {
    const saved = JSON.parse(sessionStorage.getItem(SELECTION_DIAGNOSTIC_SESSION_KEY) || 'null');
    if (saved?.schemaVersion === 1 && Array.isArray(saved.selections)) {
      activeSelectionDiagnosticSession = saved;
      return activeSelectionDiagnosticSession;
    }
  } catch {
    // Uma sessão de diagnóstico corrompida é descartada sem afetar a seleção.
  }
  activeSelectionDiagnosticSession = createSelectionDiagnosticSession();
  return activeSelectionDiagnosticSession;
}

function saveSelectionDiagnosticSession(session) {
  activeSelectionDiagnosticSession = session;
  try {
    sessionStorage.setItem(SELECTION_DIAGNOSTIC_SESSION_KEY, JSON.stringify(session));
  } catch {
    // O diagnóstico continua no console quando sessionStorage não está disponível.
  }
  if (typeof document !== 'undefined' && isEmotionalSelectionDebugEnabled()) {
    let snapshot = document.getElementById('entreSabiosSelectionDiagnosticSnapshot');
    if (!snapshot) {
      snapshot = document.createElement('script');
      snapshot.id = 'entreSabiosSelectionDiagnosticSnapshot';
      snapshot.type = 'application/json';
      document.head.appendChild(snapshot);
    }
    snapshot.textContent = JSON.stringify(session);
  }
}

function installSelectionDiagnosticExporter(session) {
  if (typeof window === 'undefined' || !isEmotionalSelectionDebugEnabled()) return;
  window.EntreSabiosSelectionDiagnostics = {
    getSession() {
      return JSON.parse(JSON.stringify(session));
    },
    exportJson() {
      return JSON.stringify(session, null, 2);
    },
    downloadJson() {
      const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `entre-sabios-diagnostico-${session.sessionId}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 0);
    },
    clear() {
      session.selections.length = 0;
      session.startedAt = new Date().toISOString();
      saveSelectionDiagnosticSession(session);
    },
  };
}

function recordSelectionDiagnostic(result, state, diagnosticContext) {
  if (!isEmotionalSelectionDebugEnabled() || !result?.diagnostics) return;
  const session = loadSelectionDiagnosticSession();
  if (!session) return;
  const entry = {
    ...result.diagnostics,
    state: {
      primaryFeeling: state.primaryFeeling,
      secondaryFeelings: [...(state.secondaryFeelings || [])],
      intensity: state.intensity,
      directionalKey: state.directionalKey || state.selectionContract?.directionalKey || null,
    },
    synthesisProfile: result.synthesis || null,
    synthesisCompatibility: result.synthesisCompatibility || null,
    motivationProfile: result.motivation || null,
    motivationCompatibility: result.motivationCompatibility || null,
    fallbackLevel: result.synthesis?.fallbackLevel || result.level || null,
    fallback: result.fallback === true,
    selectionReason: result.reason,
    diagnosticContext,
  };
  session.selections.push(entry);
  saveSelectionDiagnosticSession(session);
  installSelectionDiagnosticExporter(session);
  console.info('[Entre Sábios: seleção emocional]', entry);
}

function getStoryKey(content) {
  return content.id;
}

function getSelectionSignature(state) {
  return [state.primaryFeeling, ...(state.secondaryFeelings || []).slice().sort(), state.intensity].join('|');
}

function recordEditorialSignal(event, state, details = {}) {
  if (isEmotionalSelectionDebugEnabled()) console.info('[Entre Sábios: editorial]', { event, ...details });
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

function pickRuntimeContent({ eventTrigger = 'unknown', currentContentId = null } = {}) {
  if (!runtimeSelector) return null;
  const state = interpretEmotionalState();
  const signature = getSelectionSignature(state);
  const firstResponse = signature !== lastSelectionSignature;
  lastSelectionSignature = signature;
  const debugEnabled = isEmotionalSelectionDebugEnabled();
  const diagnosticSession = debugEnabled ? loadSelectionDiagnosticSession() : null;
  const diagnosticContext = debugEnabled ? {
    timestamp: new Date().toISOString(),
    eventTrigger,
    sessionSelectionCounter: (diagnosticSession?.selections.length || 0) + 1,
    currentContentId,
  } : null;
  const result = runtimeSelector.select(state, {
    firstResponse,
    diagnostics: debugEnabled,
    diagnosticContext,
  });
  if (!result) {
    recordEditorialSignal('contentGap', state);
    return null;
  }
  viewedStoryKeys.add(result.content.id);
  generatedContentCount += 1;
  saveViewedStoryKeys();
  saveGeneratedContentCount();
  if (debugEnabled) recordSelectionDiagnostic(result, state, diagnosticContext);
  return { ...result, state };
}

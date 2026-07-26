import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const RUNTIME_FILES = Object.freeze([
  'js/data/emotional-syntheses.js',
  'js/data/motivation-profiles.js',
  'js/core/emotional-synthesis.js',
  'js/core/synthesis-ranking-adapter.js',
  'js/core/motivation-ranking-adapter.js',
  'js/core/runtime-engine.js',
]);

function assertString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} deve ser texto não vazio.`);
}

function assertStringArray(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${label} deve ser uma lista de textos.`);
  }
}

export function validateDiagnosticSession(session) {
  if (!session || typeof session !== 'object' || Array.isArray(session)) {
    throw new Error('A sessão de diagnóstico deve ser um objeto JSON.');
  }
  if (session.schemaVersion !== 1) {
    throw new Error(`schemaVersion incompatível: ${String(session.schemaVersion)}. Esperado: 1.`);
  }
  assertString(session.sessionId, 'sessionId');
  if (!Array.isArray(session.selections)) throw new Error('selections deve ser uma lista.');

  session.selections.forEach((entry, index) => {
    const label = `selections[${index}]`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`${label} deve ser um objeto.`);
    }
    const input = entry.input || entry.state;
    if (!input || typeof input !== 'object') throw new Error(`${label}.input está ausente.`);
    assertString(input.primaryFeeling, `${label}.input.primaryFeeling`);
    assertStringArray(input.secondaryFeelings || [], `${label}.input.secondaryFeelings`);
    assertString(input.intensity, `${label}.input.intensity`);
    assertString(entry.queueVersion, `${label}.queueVersion`);
    assertString(entry.queueKey, `${label}.queueKey`);
    assertString(entry.chosen?.id, `${label}.chosen.id`);
    for (const field of ['storedQueueBefore', 'globalHistoryBefore', 'contextHistoryBefore']) {
      if (!Array.isArray(entry[field])) throw new Error(`${label}.${field} deve ser uma lista.`);
    }
  });
  return session;
}

function createMemoryStorage(initialValues) {
  const values = new Map(Object.entries(initialValues));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function contextKeyFromEntry(entry, state) {
  const suffix = /::level:\d+$/;
  if (suffix.test(entry.queueKey)) return entry.queueKey.replace(suffix, '');
  return [entry.queueVersion, state.primaryFeeling, ...state.secondaryFeelings.slice().sort(), state.intensity].join('|');
}

function stateFromEntry(entry) {
  const input = entry.input || entry.state;
  return {
    primaryFeeling: input.primaryFeeling,
    secondaryFeelings: [...(input.secondaryFeelings || [])],
    intensity: input.intensity,
    needsMotivation: input.needsMotivation === true,
    directionalKey: input.directionalKey || null,
  };
}

function firstResponseFromEntry(entry) {
  return Array.isArray(entry.contextSignals) && entry.contextSignals.includes('primeira_resposta');
}

export function loadReplayEnvironment(rootDir) {
  const sandbox = { window: { EntreSabiosData: {} }, console };
  vm.createContext(sandbox);
  for (const relativePath of RUNTIME_FILES) {
    const source = fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
    vm.runInContext(source, sandbox, { filename: relativePath });
  }
  const runtime = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'entre_sabios_runtime.json'), 'utf8'));
  const synthesisCatalog = sandbox.window.EntreSabiosData.emotionalSyntheses;
  const synthesisResolver = sandbox.window.EntreSabiosEmotionalSynthesis.createResolver(synthesisCatalog);
  const createSynthesisResolver = (catalog = synthesisCatalog) => (
    sandbox.window.EntreSabiosEmotionalSynthesis.createResolver(catalog)
  );
  const createSynthesisAdapter = (catalog = synthesisCatalog, resolver = createSynthesisResolver(catalog)) => (
    sandbox.window.EntreSabiosSynthesisRankingAdapter.createAdapter({ catalog, resolver })
  );
  return {
    runtime,
    engine: sandbox.window.EntreSabiosRuntimeEngine,
    synthesisCatalog,
    createSynthesisResolver,
    createSynthesisAdapter,
    synthesisAdapter: createSynthesisAdapter(synthesisCatalog, synthesisResolver),
    motivationAdapter: sandbox.window.EntreSabiosMotivationRankingAdapter.createAdapter(
      sandbox.window.EntreSabiosData.motivationProfiles,
    ),
  };
}

export function replayDiagnosticSession(session, { rootDir, environment = null } = {}) {
  validateDiagnosticSession(session);
  const loaded = environment || loadReplayEnvironment(rootDir);
  const selections = session.selections.map((entry, index) => {
    const state = stateFromEntry(entry);
    const contextKey = contextKeyFromEntry(entry, state);
    const queueDirections = entry.previousQueueDirection
      ? { [entry.queueKey]: entry.previousQueueDirection }
      : {};
    const storage = createMemoryStorage({
      [`entreSabiosRuntimeQueues:${entry.queueVersion}`]: JSON.stringify({
        [entry.queueKey]: entry.storedQueueBefore,
      }),
      [`entreSabiosRuntimeQueueDirections:${entry.queueVersion}`]: JSON.stringify(queueDirections),
      [`entreSabiosRecentContent:${entry.queueVersion}`]: JSON.stringify(entry.globalHistoryBefore),
      [`entreSabiosContextHistory:${entry.queueVersion}`]: JSON.stringify({
        [contextKey]: entry.contextHistoryBefore,
      }),
      [`entreSabiosRuntimeQueueMeta:${entry.queueVersion}`]: JSON.stringify({
        contentVersion: entry.queueVersion,
        selectorSchemaVersion: loaded.engine.QUEUE_SELECTOR_SCHEMA_VERSION,
        rotationPolicyVersion: loaded.engine.QUEUE_ROTATION_POLICY_VERSION,
      }),
    });
    const selector = loaded.engine.createSelector({
      version: entry.queueVersion,
      contents: loaded.runtime.contents,
      storage,
      synthesisAdapter: loaded.synthesisAdapter,
      motivationAdapter: loaded.motivationAdapter,
    });
    const replayed = selector.select(state, {
      firstResponse: firstResponseFromEntry(entry),
      diagnostics: true,
      diagnosticContext: entry.diagnosticContext || null,
    });
    const expectedId = entry.chosen.id;
    const actualId = replayed?.content?.id || null;
    return {
      index: index + 1,
      expectedId,
      actualId,
      matched: expectedId === actualId,
      expectedLevel: entry.activeLevel ?? entry.chosen.level ?? null,
      actualLevel: replayed?.diagnostics?.activeLevel ?? replayed?.level ?? null,
      primaryFeeling: state.primaryFeeling,
      intensity: state.intensity,
      firstResponse: firstResponseFromEntry(entry),
    };
  });
  const matched = selections.filter((entry) => entry.matched).length;
  return {
    schemaVersion: 1,
    sessionId: session.sessionId,
    runtimeContentVersion: loaded.runtime.contentVersion,
    total: selections.length,
    matched,
    mismatched: selections.length - matched,
    success: matched === selections.length,
    selections,
  };
}

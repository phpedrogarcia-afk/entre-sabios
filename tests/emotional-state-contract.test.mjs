import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { pathToFileURL, fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const emotionalStateScript = fs.readFileSync(path.join(rootDir, 'js', 'core', 'emotional-state.js'), 'utf8');
const matchingScript = fs.readFileSync(path.join(rootDir, 'js', 'core', 'matching.js'), 'utf8');
const mainScript = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const runtime = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'entre_sabios_runtime.json'), 'utf8'));
await import(pathToFileURL(path.join(rootDir, 'js', 'core', 'runtime-engine.js')).href);
const engine = globalThis.EntreSabiosRuntimeEngine;

const catalog = runtime.feelings.map(({ id, label }) => ({ id, label }));

function normalizeTheme(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

function createStateSandbox(overrides = {}) {
  const sandbox = {
    normalizeTheme,
    feelingsCatalog: catalog,
    selectedFeelingIds: new Set(),
    primaryFeelingId: null,
    currentIntensity: 'moderada',
    needsMotivation: false,
    emotionalTaxonomy: {},
    combinationRules: [],
    intensityProfiles: {
      fraca: { themes: [], suitableTones: [] },
      moderada: { themes: [], suitableTones: [] },
      intensa: { themes: [], suitableTones: [] },
    },
    ...overrides,
  };
  vm.createContext(sandbox);
  vm.runInContext(emotionalStateScript, sandbox);
  return sandbox;
}

test('contrato normaliza um principal e mantém intensidade e motivação separadas', () => {
  const sandbox = createStateSandbox();
  const state = sandbox.normalizeEmotionalSelection({
    feelings: ['Autoconhecimento'],
    primaryFeeling: 'Autoconhecimento',
    intensity: 'intensa',
    needsMotivation: true,
  });
  assert.deepEqual(Array.from(state.feelings), ['autoconhecimento']);
  assert.equal(state.primaryFeeling, 'autoconhecimento');
  assert.deepEqual(Array.from(state.secondaryFeelings), []);
  assert.equal(state.intensity, 'intensa');
  assert.equal(state.needsMotivation, true);
  assert.equal(state.directionalKey, 'autoconhecimento');
});

test('um secundário é distinto do principal e entradas inválidas ou duplicadas são descartadas', () => {
  const sandbox = createStateSandbox();
  const state = sandbox.normalizeEmotionalSelection({
    feelings: ['autoconhecimento', 'autoconhecimento', 'inexistente', 'confusão', 'confusão'],
    primaryFeeling: 'autoconhecimento',
  });
  assert.deepEqual(Array.from(state.feelings), ['autoconhecimento', 'confusao']);
  assert.deepEqual(Array.from(state.secondaryFeelings), ['confusao']);
  assert.equal(state.directionalKey, 'autoconhecimento__confusao');
});

test('dois secundários produzem chave estável independentemente da ordem de clique', () => {
  const sandbox = createStateSandbox();
  const first = sandbox.normalizeEmotionalSelection({
    feelings: ['autoconhecimento', 'confusao', 'inseguranca'],
    primaryFeeling: 'autoconhecimento',
  });
  const inverted = sandbox.normalizeEmotionalSelection({
    feelings: ['autoconhecimento', 'inseguranca', 'confusao'],
    primaryFeeling: 'autoconhecimento',
  });
  assert.equal(first.directionalKey, 'autoconhecimento__confusao__inseguranca');
  assert.equal(inverted.directionalKey, first.directionalKey);
  assert.deepEqual(Array.from(inverted.secondaryFeelings), ['inseguranca', 'confusao'], 'a ordem original só é preservada fora da chave');
});

test('trocar o principal muda a direção e retornar à configuração recupera a chave', () => {
  const sandbox = createStateSandbox();
  const original = sandbox.normalizeEmotionalSelection({
    feelings: ['autoconhecimento', 'confusao', 'inseguranca'],
    primaryFeeling: 'autoconhecimento',
  });
  const changed = sandbox.normalizeEmotionalSelection({
    feelings: ['autoconhecimento', 'confusao', 'inseguranca'],
    primaryFeeling: 'confusao',
  });
  const returned = sandbox.normalizeEmotionalSelection({
    feelings: ['inseguranca', 'autoconhecimento', 'confusao'],
    primaryFeeling: 'autoconhecimento',
  });
  assert.notEqual(changed.directionalKey, original.directionalKey);
  assert.equal(changed.directionalKey, 'confusao__autoconhecimento__inseguranca');
  assert.equal(returned.directionalKey, original.directionalKey);
});

test('mais de dois secundários usa somente os dois primeiros distintos sem alterar o principal', () => {
  const sandbox = createStateSandbox();
  const state = sandbox.normalizeEmotionalSelection({
    feelings: ['amor', 'medo', 'saudade', 'luto', 'ansiedade'],
    primaryFeeling: 'amor',
  });
  assert.equal(state.primaryFeeling, 'amor');
  assert.deepEqual(Array.from(state.secondaryFeelings), ['medo', 'saudade']);
  assert.deepEqual(Array.from(state.feelings), ['amor', 'medo', 'saudade']);
});

test('principal inválido usa a primeira seleção válida e intensidade inválida volta à moderada', () => {
  const sandbox = createStateSandbox();
  const state = sandbox.normalizeEmotionalSelection({
    feelings: ['inexistente', 'tristeza', 'solidão'],
    primaryFeeling: 'tambem_inexistente',
    intensity: 'extrema',
  });
  assert.equal(state.primaryFeeling, 'tristeza');
  assert.deepEqual(Array.from(state.secondaryFeelings), ['solidao']);
  assert.equal(state.intensity, 'moderada');
});

test('limpeza total desliga motivação e uma nova sessão começa sem persistência', () => {
  const firstSession = createStateSandbox({
    selectedFeelingIds: new Set(['tristeza']),
    primaryFeelingId: 'tristeza',
    needsMotivation: true,
  });
  assert.equal(firstSession.getCurrentSelectionContract().needsMotivation, true);
  firstSession.selectedFeelingIds.clear();
  const cleared = firstSession.getCurrentSelectionContract();
  assert.equal(cleared.primaryFeeling, null);
  assert.equal(cleared.needsMotivation, false);
  assert.equal(firstSession.needsMotivation, false);

  const reloadedSession = createStateSandbox({
    selectedFeelingIds: new Set(['tristeza']),
    primaryFeelingId: 'tristeza',
  });
  assert.equal(reloadedSession.getCurrentSelectionContract().needsMotivation, false);
  assert.doesNotMatch(mainScript, /localStorage[^\n]*needsMotivation|needsMotivation[^\n]*localStorage/);
});

test('troca de intensidade não altera a chave direcional', () => {
  const sandbox = createStateSandbox();
  const moderate = sandbox.normalizeEmotionalSelection({
    feelings: ['luto', 'saudade'], primaryFeeling: 'luto', intensity: 'moderada',
  });
  const intense = sandbox.normalizeEmotionalSelection({
    feelings: ['luto', 'saudade'], primaryFeeling: 'luto', intensity: 'intensa',
  });
  assert.equal(moderate.directionalKey, intense.directionalKey);
  assert.notEqual(moderate.intensity, intense.intensity);
});

test('needsMotivation não participa da assinatura de histórico ou filas nesta fase', () => {
  const sandbox = {
    console: { info() {} },
    localStorage: { getItem: () => null, setItem() {} },
  };
  vm.createContext(sandbox);
  vm.runInContext(matchingScript, sandbox);
  const base = { primaryFeeling: 'ansiedade', secondaryFeelings: ['medo'], intensity: 'moderada' };
  assert.equal(
    sandbox.getSelectionSignature({ ...base, needsMotivation: false }),
    sandbox.getSelectionSignature({ ...base, needsMotivation: true }),
  );
});

test('sem adaptador da Fase 7, needsMotivation continua neutro para compatibilidade', () => {
  const base = {
    primaryFeeling: 'autoconhecimento',
    secondaryFeelings: ['confusao', 'inseguranca'],
    intensity: 'moderada',
    secondaryThemes: [],
    combinationThemes: [],
    intensityThemes: [],
    suitableTones: [],
  };
  const withoutMotivation = engine.createSelector({ version: 'fase1-sem-motivacao', contents: runtime.contents });
  const withMotivation = engine.createSelector({ version: 'fase1-com-motivacao', contents: runtime.contents });
  const offInspection = withoutMotivation.inspect({ ...base, needsMotivation: false });
  const onInspection = withMotivation.inspect({ ...base, needsMotivation: true });
  assert.deepEqual(onInspection, offInspection);

  const offSequence = Array.from({ length: 20 }, (_, index) => withoutMotivation.select(
    { ...base, needsMotivation: false }, { firstResponse: index === 0 },
  ));
  const onSequence = Array.from({ length: 20 }, (_, index) => withMotivation.select(
    { ...base, needsMotivation: true }, { firstResponse: index === 0 },
  ));
  assert.deepEqual(
    onSequence.map((result) => [result.content.id, result.level]),
    offSequence.map((result) => [result.content.id, result.level]),
  );
});

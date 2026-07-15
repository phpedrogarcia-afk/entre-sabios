import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const feelingsScript = fs.readFileSync(path.join(rootDir, 'js', 'ui', 'feelings-ui.js'), 'utf8');
const componentsCss = fs.readFileSync(path.join(rootDir, 'css', 'components.css'), 'utf8');
const responsiveCss = fs.readFileSync(path.join(rootDir, 'css', 'responsive.css'), 'utf8');
const matchingScript = fs.readFileSync(path.join(rootDir, 'js', 'core', 'matching.js'), 'utf8');
const runtimeEngineScript = fs.readFileSync(path.join(rootDir, 'js', 'core', 'runtime-engine.js'), 'utf8');

function createButton() {
  const attributes = new Map();
  const listeners = new Map();
  return {
    attributes,
    listeners,
    type: '',
    className: '',
    textContent: '',
    setAttribute: (name, value) => attributes.set(name, String(value)),
    addEventListener: (type, listener) => listeners.set(type, listener),
    click() { listeners.get('click')?.(); },
  };
}

function createSandbox() {
  const selectedFeelingIds = new Set(['autoconhecimento', 'confusao', 'inseguranca']);
  const secondaryFeelingActionsEl = {
    children: [],
    set innerHTML(value) { this.children = []; },
    appendChild(button) { this.children.push(button); },
  };
  const announcementClasses = new Set();
  let scheduledCallback = null;
  let scheduledDelay = null;
  let synthesisRenders = 0;
  const sandbox = {
    selectedFeelingIds,
    primaryFeelingId: 'autoconhecimento',
    currentIntensity: 'moderada',
    needsMotivation: true,
    lastSelectionSignature: 'assinatura-anterior',
    primaryFeelingAnnouncementTimer: null,
    currentStory: null,
    feelingsCatalog: [
      { id: 'autoconhecimento', label: 'Autoconhecimento' },
      { id: 'confusao', label: 'Confusão' },
      { id: 'inseguranca', label: 'Insegurança' },
    ],
    feelingsGridEl: { querySelectorAll: () => [] },
    primaryFeelingControlEl: { hidden: false },
    primaryFeelingLabelEl: { textContent: '' },
    primaryFeelingAnnouncementEl: {
      textContent: '',
      classList: {
        add: (name) => announcementClasses.add(name),
        remove: (name) => announcementClasses.delete(name),
      },
    },
    secondaryFeelingActionsEl,
    emotionalSynthesisSummaryEl: { hidden: true, classList: { toggle() {} } },
    synthesisSecondaryFeelingsEl: { textContent: '' },
    synthesisHumanSummaryEl: { textContent: '' },
    synthesisMotivationDirectionEl: { hidden: true },
    emotionalSynthesisResolver: {
      resolve() {
        synthesisRenders += 1;
        return { profile: { humanSummary: 'Síntese recalculada.', ambiguity: 'medium' } };
      },
    },
    motivationToggleEl: { disabled: false, setAttribute() {}, classList: { toggle() {} } },
    generateBtn: { classList: { toggle() {} } },
    selectionHintEl: { textContent: '' },
    taleHintEl: null,
    normalizeTheme: (value) => value,
    getSelectedFeelingIds: () => [...selectedFeelingIds],
    getCurrentSelectionContract: () => ({
      primaryFeeling: sandbox.primaryFeelingId,
      secondaryFeelings: [...selectedFeelingIds].filter((id) => id !== sandbox.primaryFeelingId).slice(0, 2),
      needsMotivation: sandbox.needsMotivation,
    }),
    document: { createElement: () => createButton() },
    window: {
      clearTimeout() { scheduledCallback = null; },
      setTimeout(callback, delay) {
        scheduledCallback = callback;
        scheduledDelay = delay;
        return 7;
      },
    },
    announcementClasses,
    getScheduledCallback: () => scheduledCallback,
    getScheduledDelay: () => scheduledDelay,
    getSynthesisRenders: () => synthesisRenders,
  };
  vm.createContext(sandbox);
  vm.runInContext(feelingsScript, sandbox);
  return sandbox;
}

test('secundários exibem somente o nome, sem legendas visuais excessivas', () => {
  const sandbox = createSandbox();
  sandbox.renderPrimaryFeelingControl();
  assert.deepEqual(sandbox.secondaryFeelingActionsEl.children.map((button) => button.textContent), ['Confusão', 'Insegurança']);
  assert.doesNotMatch(feelingsScript, /Focar nisto|tornar principal/i);
});

test('controles secundários são botões reais com nome acessível e aria-pressed', () => {
  const sandbox = createSandbox();
  sandbox.renderPrimaryFeelingControl();
  for (const button of sandbox.secondaryFeelingActionsEl.children) {
    assert.equal(button.type, 'button');
    assert.equal(button.attributes.get('aria-pressed'), 'false');
    assert.equal(button.attributes.get('aria-label'), `Definir ${button.textContent} como sentimento principal`);
    assert.ok(button.listeners.has('click'));
  }
});

test('troca explícita preserva sentimentos, intensidade e motivação e recalcula a síntese', () => {
  const sandbox = createSandbox();
  const originalSelection = [...sandbox.selectedFeelingIds];
  sandbox.renderPrimaryFeelingControl();
  const rendersBeforeClick = sandbox.getSynthesisRenders();
  sandbox.secondaryFeelingActionsEl.children.find((button) => button.textContent === 'Confusão').click();
  assert.equal(sandbox.primaryFeelingId, 'confusao');
  assert.deepEqual([...sandbox.selectedFeelingIds], originalSelection);
  assert.equal(sandbox.currentIntensity, 'moderada');
  assert.equal(sandbox.needsMotivation, true);
  assert.equal(sandbox.lastSelectionSignature, null);
  assert.ok(sandbox.getSynthesisRenders() > rendersBeforeClick);
  assert.equal(sandbox.synthesisSecondaryFeelingsEl.textContent, 'Autoconhecimento e Insegurança');
});

test('confirmação temporária é anunciada e removida sem legenda permanente', () => {
  const sandbox = createSandbox();
  sandbox.renderPrimaryFeelingControl();
  sandbox.secondaryFeelingActionsEl.children[0].click();
  assert.equal(sandbox.primaryFeelingAnnouncementEl.textContent, 'Sentimento principal alterado para Confusão.');
  assert.ok(sandbox.announcementClasses.has('is-visible'));
  assert.equal(sandbox.getScheduledDelay(), 2400);
  sandbox.getScheduledCallback()();
  assert.equal(sandbox.primaryFeelingAnnouncementEl.textContent, '');
  assert.equal(sandbox.announcementClasses.has('is-visible'), false);
  assert.equal(sandbox.primaryFeelingAnnouncementTimer, null);
});

test('região de confirmação é acessível e estilos distinguem principal e secundários', () => {
  assert.match(html, /id="primaryFeelingAnnouncement"[^>]*role="status"[^>]*aria-live="polite"[^>]*aria-atomic="true"/);
  assert.match(componentsCss, /\.primary-feeling-control strong::before\s*\{[\s\S]*?background:\s*#6f8f73/);
  assert.match(componentsCss, /\.focus-feeling-btn::before\s*\{[\s\S]*?background:\s*transparent/);
  assert.match(componentsCss, /\.focus-feeling-btn:focus-visible\s*\{[\s\S]*?outline:/);
  assert.match(responsiveCss, /@media \(max-width: 520px\)[\s\S]*?\.focus-feeling-btn\s*\{[\s\S]*?min-height:\s*44px/);
});

test('troca visual não cria caminho paralelo no ranking', () => {
  assert.doesNotMatch(matchingScript + runtimeEngineScript, /primaryFeelingAnnouncement|focus-feeling-btn|setPrimaryFeeling/);
  const setterBlock = feelingsScript.slice(feelingsScript.indexOf('function setPrimaryFeeling'), feelingsScript.indexOf('function getFeelingLabel'));
  assert.doesNotMatch(setterBlock, /pickRuntimeContent|generateReflection|runtimeSelector\.select/);
});

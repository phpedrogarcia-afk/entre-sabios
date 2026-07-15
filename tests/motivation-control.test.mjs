import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const feelingsScript = fs.readFileSync(path.join(rootDir, 'js', 'ui', 'feelings-ui.js'), 'utf8');
const matchingScript = fs.readFileSync(path.join(rootDir, 'js', 'core', 'matching.js'), 'utf8');
const componentsCss = fs.readFileSync(path.join(rootDir, 'css', 'components.css'), 'utf8');
const responsiveCss = fs.readFileSync(path.join(rootDir, 'css', 'responsive.css'), 'utf8');
const catalogScript = fs.readFileSync(path.join(rootDir, 'js', 'data', 'catalogs.js'), 'utf8');

function createToggle() {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();
  return {
    disabled: true,
    listeners,
    attributes,
    classes,
    addEventListener: (type, listener) => listeners.set(type, listener),
    setAttribute: (name, value) => attributes.set(name, String(value)),
    classList: {
      toggle(name, force) {
        if (force) classes.add(name);
        else classes.delete(name);
      },
    },
    click() {
      listeners.get('click')?.();
    },
  };
}

function createSandbox() {
  const motivationToggleEl = createToggle();
  const sandbox = {
    selectedFeelingIds: new Set(['tristeza']),
    primaryFeelingId: 'tristeza',
    currentIntensity: 'moderada',
    needsMotivation: false,
    lastSelectionSignature: 'assinatura-preservada',
    currentStory: null,
    feelingsCatalog: [{ id: 'tristeza', label: 'Tristeza' }],
    motivationToggleEl,
    emotionalSynthesisSummaryEl: { hidden: true, classList: { toggle() {} } },
    synthesisSecondaryFeelingsEl: { textContent: '' },
    synthesisHumanSummaryEl: { textContent: '' },
    synthesisMotivationDirectionEl: { hidden: true },
    emotionalSynthesisResolver: { resolve: () => null },
  };
  sandbox.getCurrentSelectionContract = () => ({
    primaryFeeling: sandbox.primaryFeelingId,
    secondaryFeelings: [],
    needsMotivation: sandbox.needsMotivation,
  });
  vm.createContext(sandbox);
  vm.runInContext(feelingsScript, sandbox);
  return sandbox;
}

test('controle de motivação é um botão opcional separado do radiogroup de intensidade', () => {
  const radiogroupEnd = html.indexOf('</div>', html.indexOf('role="radiogroup"'));
  const togglePosition = html.indexOf('id="motivationToggle"');
  assert.ok(togglePosition > radiogroupEnd, 'motivação foi inserida dentro do grupo de intensidades');
  assert.match(html, /id="motivationPreferenceTitle"[^>]*>PREFERÊNCIA OPCIONAL</);
  assert.match(html, /id="motivationToggle"[\s\S]*?type="button"[\s\S]*?aria-pressed="false"/);
  assert.match(html, /aria-describedby="motivationPreferenceHelp"/);
  assert.match(html, /Preferência opcional de direção para a reflexão\. Não altera o sentimento nem a intensidade\./);
});

test('controle inicia desligado, alterna pelos dois estados e preserva seleção e intensidade', () => {
  const sandbox = createSandbox();
  sandbox.initMotivationPreference();
  assert.equal(sandbox.needsMotivation, false);
  assert.equal(sandbox.motivationToggleEl.disabled, false);
  assert.equal(sandbox.motivationToggleEl.attributes.get('aria-pressed'), 'false');

  sandbox.motivationToggleEl.click();
  assert.equal(sandbox.needsMotivation, true);
  assert.equal(sandbox.motivationToggleEl.attributes.get('aria-pressed'), 'true');
  assert.ok(sandbox.motivationToggleEl.classes.has('is-active'));
  assert.equal(sandbox.primaryFeelingId, 'tristeza');
  assert.equal(sandbox.currentIntensity, 'moderada');
  assert.deepEqual([...sandbox.selectedFeelingIds], ['tristeza']);
  assert.equal(sandbox.lastSelectionSignature, 'assinatura-preservada');

  sandbox.motivationToggleEl.click();
  assert.equal(sandbox.needsMotivation, false);
  assert.equal(sandbox.motivationToggleEl.attributes.get('aria-pressed'), 'false');
});

test('limpar toda a seleção desliga e desabilita a preferência', () => {
  const sandbox = createSandbox();
  sandbox.initMotivationPreference();
  sandbox.motivationToggleEl.click();
  assert.equal(sandbox.needsMotivation, true);
  sandbox.selectedFeelingIds.clear();
  sandbox.syncMotivationPreference();
  assert.equal(sandbox.needsMotivation, false);
  assert.equal(sandbox.motivationToggleEl.disabled, true);
  assert.equal(sandbox.motivationToggleEl.attributes.get('aria-pressed'), 'false');
});

test('preferência permanece somente na sessão e o controle visual não apaga filas ou histórico', () => {
  const motivationFunctions = feelingsScript.slice(feelingsScript.indexOf('function syncMotivationPreference()'));
  assert.doesNotMatch(script, /localStorage[^\n]*needsMotivation|needsMotivation[^\n]*localStorage/);
  assert.doesNotMatch(motivationFunctions, /localStorage|lastSelectionSignature\s*=|runtimeSelector/);
  assert.doesNotMatch(matchingScript, /needsMotivation/);
  assert.match(script, /initFeelings\(\);[\s\S]*?initIntensity\(\);[\s\S]*?initMotivationPreference\(\);/);
});

test('estilos distinguem a preferência e oferecem foco e alvos responsivos', () => {
  assert.match(componentsCss, /\.selection-preferences\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto/);
  assert.match(componentsCss, /\.motivation-preference\s*\{[\s\S]*?border-left:/);
  assert.match(componentsCss, /\.motivation-toggle:focus-visible\s*\{[\s\S]*?outline:/);
  assert.match(componentsCss, /\.motivation-toggle\.is-active\s*\{/);
  assert.match(responsiveCss, /@media \(max-width: 520px\)[\s\S]*?\.motivation-toggle\s*\{[\s\S]*?min-height:\s*44px/);
});

test('Falta de propósito permanece no catálogo e motivação não virou sentimento ou intensidade', () => {
  assert.match(catalogScript, /id:\s*'falta_de_proposito',\s*label:\s*'Falta de propósito'/);
  assert.doesNotMatch(catalogScript, /id:\s*'motivacao'/);
  assert.doesNotMatch(html, /name="intensity"\s+value="motivacao"/);
  assert.equal((html.match(/id="motivationToggle"/g) || []).length, 1);
});

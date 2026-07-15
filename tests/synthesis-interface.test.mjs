import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const dataScript = fs.readFileSync(path.join(rootDir, 'js', 'data', 'emotional-syntheses.js'), 'utf8');
const engineScript = fs.readFileSync(path.join(rootDir, 'js', 'core', 'emotional-synthesis.js'), 'utf8');
const feelingsScript = fs.readFileSync(path.join(rootDir, 'js', 'ui', 'feelings-ui.js'), 'utf8');
const componentsCss = fs.readFileSync(path.join(rootDir, 'css', 'components.css'), 'utf8');
const responsiveCss = fs.readFileSync(path.join(rootDir, 'css', 'responsive.css'), 'utf8');
const matchingScript = fs.readFileSync(path.join(rootDir, 'js', 'core', 'matching.js'), 'utf8');
const runtimeEngineScript = fs.readFileSync(path.join(rootDir, 'js', 'core', 'runtime-engine.js'), 'utf8');

const dataSandbox = { window: {} };
vm.createContext(dataSandbox);
vm.runInContext(dataScript, dataSandbox);
vm.runInContext(engineScript, dataSandbox);
const catalog = dataSandbox.window.EntreSabiosData.emotionalSyntheses;
const resolver = dataSandbox.window.EntreSabiosEmotionalSynthesis.createResolver(catalog);

const labels = {
  autoconhecimento: 'Autoconhecimento', confusao: 'Confusão', inseguranca: 'Insegurança',
  luto: 'Luto', saudade: 'Saudade', amor: 'Amor', medo: 'Medo', raiva: 'Raiva', esperanca: 'Esperança',
};

function createInterfaceSandbox(initialContract) {
  let contract = { ...initialContract };
  const classes = new Set();
  const sandbox = {
    selectedFeelingIds: new Set([contract.primaryFeeling, ...(contract.secondaryFeelings || [])].filter(Boolean)),
    primaryFeelingId: contract.primaryFeeling,
    needsMotivation: contract.needsMotivation === true,
    feelingsCatalog: Object.entries(labels).map(([id, label]) => ({ id, label })),
    emotionalSynthesisResolver: resolver,
    emotionalSynthesisSummaryEl: {
      hidden: true,
      classList: { toggle: (name, force) => (force ? classes.add(name) : classes.delete(name)) },
    },
    synthesisSecondaryFeelingsEl: { textContent: '' },
    synthesisHumanSummaryEl: { textContent: '' },
    synthesisMotivationDirectionEl: { hidden: true },
    classes,
    normalizeTheme: (value) => value,
    getCurrentSelectionContract: () => ({ ...contract }),
    setContract(next) {
      contract = { ...next };
      this.primaryFeelingId = contract.primaryFeeling;
      this.needsMotivation = contract.needsMotivation === true;
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(feelingsScript, sandbox);
  return sandbox;
}

test('bloco possui semântica própria e não se confunde com a explicação da frase', () => {
  assert.match(html, /id="emotionalSynthesisSummary"[^>]*role="status"[^>]*aria-live="polite"[^>]*aria-atomic="true"[^>]*hidden/);
  assert.match(html, /Também presentes:\s*<span id="synthesisSecondaryFeelings">/);
  assert.match(html, /O que isso pode estar revelando:/);
  assert.match(html, /Você também busca: um impulso para continuar\./);
  assert.ok(html.indexOf('id="emotionalSynthesisSummary"') < html.indexOf('id="generateBtn"'));
  assert.notEqual(html.indexOf('id="emotionalSynthesisSummary"'), html.indexOf('id="explanationBlock"'));
});

test('somente o principal preserva a experiência atual e não mostra síntese', () => {
  const sandbox = createInterfaceSandbox({ primaryFeeling: 'amor', secondaryFeelings: [], needsMotivation: false });
  sandbox.renderEmotionalSynthesis();
  assert.equal(sandbox.emotionalSynthesisSummaryEl.hidden, true);
  assert.equal(sandbox.synthesisHumanSummaryEl.textContent, '');
});

test('par aprovado mostra secundário e descrição humana sem termos técnicos', () => {
  const sandbox = createInterfaceSandbox({ primaryFeeling: 'luto', secondaryFeelings: ['saudade'], needsMotivation: false });
  sandbox.renderEmotionalSynthesis();
  assert.equal(sandbox.emotionalSynthesisSummaryEl.hidden, false);
  assert.equal(sandbox.synthesisSecondaryFeelingsEl.textContent, 'Saudade');
  assert.equal(sandbox.synthesisHumanSummaryEl.textContent, catalog.directionalPairs.luto__saudade.humanSummary);
  assert.equal(sandbox.synthesisMotivationDirectionEl.hidden, true);
  assert.doesNotMatch(sandbox.synthesisHumanSummaryEl.textContent, /fallback|confiança|ambiguidade|tema|score|algoritmo/i);
});

test('motivação acrescenta somente a linha discreta da escolha do usuário', () => {
  const sandbox = createInterfaceSandbox({ primaryFeeling: 'amor', secondaryFeelings: ['medo'], needsMotivation: true });
  sandbox.renderEmotionalSynthesis();
  assert.equal(sandbox.synthesisMotivationDirectionEl.hidden, false);
  assert.equal(sandbox.synthesisHumanSummaryEl.textContent, catalog.directionalPairs.amor__medo.humanSummary);
});

test('troca do principal recalcula direção sem alterar os demais sentimentos', () => {
  const sandbox = createInterfaceSandbox({ primaryFeeling: 'luto', secondaryFeelings: ['saudade'], needsMotivation: false });
  sandbox.renderEmotionalSynthesis();
  const before = sandbox.synthesisHumanSummaryEl.textContent;
  sandbox.setContract({ primaryFeeling: 'saudade', secondaryFeelings: ['luto'], needsMotivation: false });
  sandbox.renderEmotionalSynthesis();
  assert.equal(sandbox.synthesisSecondaryFeelingsEl.textContent, 'Luto');
  assert.equal(sandbox.synthesisHumanSummaryEl.textContent, catalog.directionalPairs.saudade__luto.humanSummary);
  assert.notEqual(sandbox.synthesisHumanSummaryEl.textContent, before);
});

test('tríade usa os dois secundários e independe da ordem entre eles', () => {
  const first = createInterfaceSandbox({
    primaryFeeling: 'autoconhecimento', secondaryFeelings: ['confusao', 'inseguranca'], needsMotivation: false,
  });
  const inverted = createInterfaceSandbox({
    primaryFeeling: 'autoconhecimento', secondaryFeelings: ['inseguranca', 'confusao'], needsMotivation: false,
  });
  first.renderEmotionalSynthesis();
  inverted.renderEmotionalSynthesis();
  assert.equal(first.synthesisSecondaryFeelingsEl.textContent, 'Confusão e Insegurança');
  assert.equal(inverted.synthesisSecondaryFeelingsEl.textContent, 'Insegurança e Confusão');
  assert.equal(first.synthesisHumanSummaryEl.textContent, inverted.synthesisHumanSummaryEl.textContent);
});

test('combinação sem par específico apresenta fallback cauteloso com menor autoridade', () => {
  const sandbox = createInterfaceSandbox({ primaryFeeling: 'raiva', secondaryFeelings: ['amor'], needsMotivation: false });
  sandbox.renderEmotionalSynthesis();
  assert.equal(sandbox.emotionalSynthesisSummaryEl.hidden, false);
  assert.equal(sandbox.synthesisHumanSummaryEl.textContent, catalog.fallbackProfiles.cautious.humanSummary);
  assert.ok(sandbox.classes.has('is-ambiguous'));
});

test('todo o primeiro lote aprovado pode ser apresentado pelo resolvedor padrão', () => {
  const profiles = [...Object.values(catalog.directionalPairs), ...Object.values(catalog.triadOverrides)];
  for (const profile of profiles) {
    const result = resolver.resolve(profile);
    assert.ok(result?.profile?.humanSummary, profile.id);
    assert.equal(result.profile.humanSummary, profile.humanSummary, profile.id);
  }
});

test('texto pode crescer e quebrar em mobile sem altura fixa ou corte', () => {
  assert.match(componentsCss, /\.emotional-synthesis-summary\s*\{[\s\S]*?overflow-wrap:\s*anywhere/);
  assert.match(componentsCss, /\.synthesis-human-summary\s*\{[\s\S]*?line-height:\s*1\.55/);
  assert.doesNotMatch(componentsCss, /\.emotional-synthesis-summary\s*\{[^}]*max-height:/);
  assert.match(responsiveCss, /@media \(max-width: 520px\)[\s\S]*?\.synthesis-human-summary\s*\{[\s\S]*?line-height:\s*1\.6/);
});

test('renderização permanece isolada do conteúdo principal; integração usa somente metadados estruturados', () => {
  const renderBlock = feelingsScript.slice(
    feelingsScript.indexOf('function renderEmotionalSynthesis()'),
    feelingsScript.indexOf('function showSelectionHint'),
  );
  assert.doesNotMatch(renderBlock, /generateReflection|pickRuntimeContent|renderStory|currentStory|runtimeSelector|lastSelectionSignature/);
  assert.doesNotMatch(renderBlock, /synthesisRankingAdapter|rankEligibleContents/);
  assert.doesNotMatch(matchingScript + runtimeEngineScript, /humanSummary|editorialRationale/);
});

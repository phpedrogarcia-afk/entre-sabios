import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
const catalogSource = read('js/data/emotional-syntheses.js');
const resolverSource = read('js/core/emotional-synthesis.js');
const productionSynthesisStack = [
  catalogSource,
  read('js/data/motivation-profiles.js'),
  resolverSource,
  read('js/core/synthesis-ranking-adapter.js'),
  read('js/core/motivation-ranking-adapter.js'),
  read('js/core/runtime-engine.js'),
  read('js/ui/feelings-ui.js'),
].join('\n');
const activeInterfaceSources = [
  read('index.html'),
  read('script.js'),
  productionSynthesisStack,
].join('\n');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(catalogSource, sandbox);
vm.runInContext(resolverSource, sandbox);
const catalog = sandbox.window.EntreSabiosData.emotionalSyntheses;
const resolver = sandbox.window.EntreSabiosEmotionalSynthesis.createResolver(catalog);

test('todas as 29 descrições ativas são humanas, direcionais e não diagnósticas', () => {
  const forbiddenHumanTerms = /diagn[oó]stic|transtorno|doen[cç]a|sintoma cl[ií]nico|algoritmo|pontua[cç][aã]o|score|fallback|ambiguidade|tema oculto|sistema detectou|verdadeira emo[cç][aã]o|voc[eê] possui/i;
  const profiles = Object.values(catalog.directionalPairs);
  assert.equal(profiles.length, 29);

  for (const profile of profiles) {
    assert.equal(profile.status, 'reviewed', profile.id);
    assert.doesNotMatch(profile.humanSummary, forbiddenHumanTerms, profile.id);
    assert.ok(profile.humanSummary.length >= 60, profile.id);
    assert.ok(profile.editorialRationale.length >= 60, profile.id);
    assert.equal(profile.secondaryFeelings.length, 1, profile.id);
    const expectedKey = `${profile.primaryFeeling}__${profile.secondaryFeelings[0]}`;
    assert.equal(profile.id, expectedKey);
    const resolution = resolver.resolve(profile);
    assert.equal(resolution.fallbackLevel, 2, profile.id);
    assert.equal(resolution.profile.humanSummary, profile.humanSummary, profile.id);
  }
});

test('síntese e motivação não possuem rede, serviço de IA ou geração remota em produção', () => {
  assert.doesNotMatch(
    productionSynthesisStack,
    /fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|https?:\/\/|api\.openai\.com|@openai|new\s+OpenAI|chat\.completions|anthropic\.messages|generativeai/i,
  );
  assert.doesNotMatch(
    activeInterfaceSources,
    /api\.openai\.com|@openai|new\s+OpenAI|chat\.completions|anthropic\.messages|generativeai/i,
  );
  assert.match(productionSynthesisStack, /fallbackProfiles/);
  assert.match(productionSynthesisStack, /needsMotivation/);
});

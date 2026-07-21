import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const feelingIds = [
  'ansiedade', 'medo', 'amor', 'saudade', 'esperanca', 'solidao', 'confusao',
  'autoconhecimento', 'inseguranca', 'raiva', 'culpa', 'luto', 'tristeza', 'falta_de_proposito',
];
const sandbox = {
  window: { EntreSabiosData: {} },
  feelingsCatalog: feelingIds.map((id) => ({ id })),
  normalizeTheme: (value) => String(value || '').trim().toLowerCase(),
};
vm.createContext(sandbox);
for (const relativePath of [
  'js/data/emotional-syntheses.js',
  'js/core/emotional-synthesis.js',
  'js/core/synthesis-ranking-adapter.js',
  'js/core/emotional-state.js',
]) vm.runInContext(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'), sandbox, { filename: relativePath });

const catalog = sandbox.window.EntreSabiosData.emotionalSyntheses;
const resolver = sandbox.window.EntreSabiosEmotionalSynthesis.createResolver(catalog);
const adapter = sandbox.window.EntreSabiosSynthesisRankingAdapter.createAdapter({ catalog, resolver });
const createState = sandbox.normalizeEmotionalSelection;
const validRelationTypes = new Set(['reinforcement', 'tension', 'ambivalence', 'masking', 'transition', 'context']);
const plain = (value) => JSON.parse(JSON.stringify(value));

function state(primaryFeeling, secondaryFeelings, intensity = 'moderada', needsMotivation = false) {
  return { primaryFeeling, secondaryFeelings, intensity, needsMotivation };
}

function content(id, editorialFunction, tone = 'contemplativo') {
  return {
    id,
    themes: [],
    editorialFunction,
    tone,
  };
}

test('o contrato mantém principal, até dois secundários, intensidade e motivação em campos independentes', () => {
  const result = createState({
    feelings: ['amor', 'medo', 'inseguranca'],
    primaryFeeling: 'amor',
    intensity: 'intensa',
    needsMotivation: true,
  }, sandbox.feelingsCatalog);
  assert.equal(result.primaryFeeling, 'amor');
  assert.deepEqual(plain(result.secondaryFeelings), ['medo', 'inseguranca']);
  assert.equal(result.intensity, 'intensa');
  assert.equal(result.needsMotivation, true);
});

test('somente os 29 pares e a tríade existentes recebem relationType explícito e válido', () => {
  const profiles = [...Object.values(catalog.directionalPairs), ...Object.values(catalog.triadOverrides)];
  assert.equal(Object.keys(catalog.directionalPairs).length, 29);
  assert.equal(Object.keys(catalog.triadOverrides).length, 1);
  assert.equal(profiles.length, 30);
  assert.ok(profiles.every((profile) => validRelationTypes.has(profile.relationType)));
  assert.deepEqual(new Set(Object.keys(catalog.relationTypes)), validRelationTypes);
});

test('inverter a cor dominante preserva a direção e pode mudar o tipo de relação', () => {
  const grief = resolver.resolve(state('luto', ['esperanca']));
  const hope = resolver.resolve(state('esperanca', ['luto']));
  assert.equal(grief.profile.relationType, 'transition');
  assert.equal(hope.profile.relationType, 'tension');
  assert.notEqual(grief.directionalKey, hope.directionalKey);
  assert.notEqual(grief.profile.humanSummary, hope.profile.humanSummary);
});

test('fallback não diagnosticado usa context sem criar novo par ou tríade', () => {
  const before = [Object.keys(catalog.directionalPairs).length, Object.keys(catalog.triadOverrides).length];
  const fallback = resolver.resolve(state('raiva', ['amor']));
  assert.equal(fallback.fallbackLevel, 3);
  assert.equal(fallback.profile.relationType, 'context');
  assert.deepEqual([Object.keys(catalog.directionalPairs).length, Object.keys(catalog.triadOverrides).length], before);
});

test('perfil de esquema anterior sem relationType recebe fallback context', () => {
  const legacyProfile = { ...catalog.directionalPairs.amor__medo };
  delete legacyProfile.relationType;
  const legacyCatalog = {
    ...catalog,
    directionalPairs: { ...catalog.directionalPairs, amor__medo: legacyProfile },
  };
  const legacyResolver = sandbox.window.EntreSabiosEmotionalSynthesis.createResolver(legacyCatalog);
  const result = legacyResolver.resolve(state('amor', ['medo']));
  assert.equal(legacyResolver.validationErrors.length, 0);
  assert.equal(result.profile.relationType, 'context');
});

test('relationType fornece sinais estruturados de função e tom sem ler a descrição visível', () => {
  const context = adapter.resolveState(state('esperanca', ['luto']));
  assert.equal(context.relationType, 'tension');
  assert.ok(context.preferredEditorialFunctions.includes('clarification'));
  assert.ok(context.preferredTones.includes('contemplativo'));

  const aligned = adapter.evaluate(content('aligned', 'clarification'), context);
  const neutral = adapter.evaluate(content('neutral', 'action', 'direto'), context);
  assert.ok(adapter.compare(aligned, neutral) < 0);
  assert.equal(aligned.matchedEditorialFunction, 'clarification');
  assert.equal(aligned.matchedTone, 'contemplativo');
  assert.equal(aligned.vector[2], 0, 'a política limited registra o tom, mas não o promove neste perfil');

  const sources = [
    'js/core/emotional-synthesis.js',
    'js/core/synthesis-ranking-adapter.js',
  ].map((relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8')).join('\n');
  assert.doesNotMatch(sources, /humanSummary\.(?:match|includes|split)|editorialRationale\.(?:match|includes|split)/);
});

test('especificidade e fallback permanecem explícitos no diagnóstico estruturado', () => {
  const exact = adapter.resolveState(state('amor', ['medo']));
  const fallback = adapter.resolveState(state('raiva', ['amor']));
  assert.equal(exact.resolution.fallbackLevel, 2);
  assert.equal(exact.resolution.reason, 'exact_directional_pair');
  assert.equal(exact.relationType, 'ambivalence');
  assert.equal(fallback.resolution.fallbackLevel, 3);
  assert.equal(fallback.resolution.reason, 'primary_profile_with_modifiers');
  assert.equal(fallback.relationType, 'context');
});

test('relationType permanece interno e não cria rótulo diagnóstico na interface', () => {
  const interfaceSources = [
    'index.html',
    'script.js',
    'js/ui/reflection-ui.js',
    'js/ui/feelings-ui.js',
  ].map((relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8')).join('\n');
  assert.doesNotMatch(interfaceSources, /relationType|reinforcement|ambivalence|masking/);
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataScript = fs.readFileSync(path.join(rootDir, 'js', 'data', 'emotional-syntheses.js'), 'utf8');
const engineScript = fs.readFileSync(path.join(rootDir, 'js', 'core', 'emotional-synthesis.js'), 'utf8');
const matchingScript = fs.readFileSync(path.join(rootDir, 'js', 'core', 'matching.js'), 'utf8');
const runtimeEngineScript = fs.readFileSync(path.join(rootDir, 'js', 'core', 'runtime-engine.js'), 'utf8');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const proposalReports = [
  'PROPOSTAS_SINTESES_FASE_3.md',
  'PROPOSTAS_SINTESES_FASE_10_LOTE_2.md',
].map((fileName) => fs.readFileSync(path.join(rootDir, fileName), 'utf8')).join('\n');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataScript, sandbox);
vm.runInContext(engineScript, sandbox);
const catalog = sandbox.window.EntreSabiosData.emotionalSyntheses;
const synthesis = sandbox.window.EntreSabiosEmotionalSynthesis;
const resolver = synthesis.createResolver(catalog);

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

test('catálogo aprovado possui versão, 14 perfis principais, 29 pares e uma tríade', () => {
  assert.equal(catalog.version, '1.2.0');
  assert.equal(Object.keys(catalog.primaryProfiles).length, 14);
  assert.equal(Object.keys(catalog.directionalPairs).length, 29);
  assert.equal(Object.keys(catalog.triadOverrides).length, 1);
  assert.deepEqual(plain(resolver.validationErrors), []);
});

test('todas as descrições aprovadas estão revisadas e documentadas', () => {
  const visibleProfiles = [...Object.values(catalog.directionalPairs), ...Object.values(catalog.triadOverrides)];
  assert.ok(visibleProfiles.every((profile) => profile.status === 'reviewed'));
  assert.equal(catalog.fallbackProfiles.cautious.status, 'reviewed');
  for (const profile of visibleProfiles) {
    assert.ok(profile.humanSummary.length >= 60);
    assert.ok(profile.editorialRationale.length >= 60);
    assert.doesNotMatch(profile.humanSummary, /diagnóstico|algoritmo|sistema detectou|verdadeira emoção|você possui/i);
    assert.equal('finalText' in profile, false);
    assert.equal('author' in profile, false);
    assert.equal('displayedAuthor' in profile, false);
    assert.ok(proposalReports.includes(profile.humanSummary), `Descrição ausente do relatório: ${profile.id}`);
  }
  assert.ok(proposalReports.includes(catalog.fallbackProfiles.cautious.humanSummary));
});

test('lote 2 registra versão, proposta, aprovação humana e justificativa individual', () => {
  const phase10Keys = [
    'ansiedade__autoconhecimento', 'autoconhecimento__ansiedade',
    'inseguranca__amor', 'amor__inseguranca',
    'culpa__tristeza', 'tristeza__culpa',
    'falta_de_proposito__esperanca', 'esperanca__falta_de_proposito',
  ];
  for (const key of phase10Keys) {
    const profile = catalog.directionalPairs[key];
    assert.equal(profile.status, 'reviewed');
    assert.equal(profile.editorialReview.catalogVersion, '1.1.0');
    assert.equal(profile.editorialReview.proposalAuthor, 'Codex (OpenAI)');
    assert.equal(profile.editorialReview.humanReviewer, 'Pedro');
    assert.equal(profile.editorialReview.approvedOn, '2026-07-14');
    assert.ok(profile.editorialRationale.length >= 60);
    const result = resolver.resolve({
      primaryFeeling: profile.primaryFeeling,
      secondaryFeelings: profile.secondaryFeelings,
    });
    assert.equal(result.fallbackLevel, 2);
    assert.equal(result.profile.id, key);
  }
});

test('síntese do lote 2 pode ser desativada sem alterar o motor', () => {
  const key = 'culpa__tristeza';
  const customCatalog = {
    ...catalog,
    directionalPairs: {
      ...catalog.directionalPairs,
      [key]: { ...catalog.directionalPairs[key], status: 'disabled' },
    },
  };
  const customResolver = synthesis.createResolver(customCatalog);
  const result = customResolver.resolve({ primaryFeeling: 'culpa', secondaryFeelings: ['tristeza'] });
  assert.equal(result.fallbackLevel, 3);
  assert.equal(result.reason, 'primary_profile_with_modifiers');
});

test('resolvedor padrão usa o par aprovado sem opção especial', () => {
  const result = resolver.resolve({
    primaryFeeling: 'luto', secondaryFeelings: ['saudade'], needsMotivation: false,
  });
  assert.equal(result.fallbackLevel, 2);
  assert.equal(result.profile.id, 'luto__saudade');
  assert.equal(result.reason, 'exact_directional_pair');
});

test('perfil ainda proposto não é ativado pelo resolvedor padrão', () => {
  const proposedPair = { ...catalog.directionalPairs.luto__saudade, status: 'proposed' };
  const customCatalog = {
    ...catalog,
    directionalPairs: { ...catalog.directionalPairs, luto__saudade: proposedPair },
  };
  const customResolver = synthesis.createResolver(customCatalog);
  const contract = { primaryFeeling: 'luto', secondaryFeelings: ['saudade'] };
  assert.equal(customResolver.resolve(contract).fallbackLevel, 3);
  assert.equal(customResolver.resolve(contract, { includeProposed: true }).fallbackLevel, 2);
});

test('tríade exata aprovada é resolvida no nível 1', () => {
  const result = resolver.resolve({
    primaryFeeling: 'autoconhecimento', secondaryFeelings: ['inseguranca', 'confusao'], needsMotivation: true,
  }, { includeProposed: true });
  assert.equal(result.fallbackLevel, 1);
  assert.equal(result.reason, 'exact_triad');
  assert.equal(result.directionalKey, 'autoconhecimento__confusao__inseguranca');
  assert.equal(result.profile.id, result.directionalKey);
  assert.equal(result.needsMotivation, true);
  assert.equal(result.profile.confidence, 'high');
});

test('ordem dos secundários não altera a tríade resolvida', () => {
  const first = resolver.resolve({
    primaryFeeling: 'autoconhecimento', secondaryFeelings: ['confusao', 'inseguranca'],
  }, { includeProposed: true });
  const inverted = resolver.resolve({
    primaryFeeling: 'autoconhecimento', secondaryFeelings: ['inseguranca', 'confusao'],
  }, { includeProposed: true });
  assert.equal(first.directionalKey, inverted.directionalKey);
  assert.equal(first.profile.id, inverted.profile.id);
  assert.equal(first.profile.humanSummary, inverted.profile.humanSummary);
});

test('trocar o principal resolve outro par e outra descrição', () => {
  const grief = resolver.resolve({ primaryFeeling: 'luto', secondaryFeelings: ['saudade'] }, { includeProposed: true });
  const longing = resolver.resolve({ primaryFeeling: 'saudade', secondaryFeelings: ['luto'] }, { includeProposed: true });
  assert.equal(grief.fallbackLevel, 2);
  assert.equal(longing.fallbackLevel, 2);
  assert.equal(grief.directionalKey, 'luto__saudade');
  assert.equal(longing.directionalKey, 'saudade__luto');
  assert.notEqual(grief.profile.humanSummary, longing.profile.humanSummary);
});

test('par direcional recebe o segundo modificador sem concatenar descrição', () => {
  const result = resolver.resolve({
    primaryFeeling: 'amor', secondaryFeelings: ['medo', 'saudade'],
  }, { includeProposed: true });
  assert.equal(result.fallbackLevel, 2);
  assert.equal(result.reason, 'directional_pair_with_modifier');
  assert.equal(result.profile.id, 'amor__medo');
  assert.equal(result.profile.appliedModifier, 'saudade');
  assert.ok(result.profile.hiddenThemes.includes('memoria'));
  assert.equal(result.profile.humanSummary, catalog.directionalPairs.amor__medo.humanSummary);
});

test('combinação não mapeada usa perfil principal e modificadores no nível 3', () => {
  const result = resolver.resolve({
    primaryFeeling: 'raiva', secondaryFeelings: ['amor'],
  }, { includeProposed: true });
  assert.equal(result.fallbackLevel, 3);
  assert.equal(result.reason, 'primary_profile_with_modifiers');
  assert.equal(result.profile.ambiguity, 'high');
  assert.ok(result.profile.hiddenThemes.includes('vinculo'));
});

test('catálogo sem perfil principal usa fallback cauteloso no nível 4', () => {
  const customCatalog = { ...catalog, primaryProfiles: {} };
  const customResolver = synthesis.createResolver(customCatalog);
  const result = customResolver.resolve({ primaryFeeling: 'raiva', secondaryFeelings: ['amor'] }, { includeProposed: true });
  assert.equal(result.fallbackLevel, 4);
  assert.equal(result.reason, 'cautious_fallback');
  assert.equal(result.profile.ambiguity, 'high');
});

test('catálogo inválido falha com segurança no nível 5', () => {
  const invalidResolver = synthesis.createResolver({ version: 'quebrado' });
  const result = invalidResolver.resolve({ primaryFeeling: 'amor', secondaryFeelings: ['medo'] }, { includeProposed: true });
  assert.equal(result.fallbackLevel, 5);
  assert.equal(result.reason, 'invalid_catalog');
  assert.ok(result.validationErrors.length > 0);
});

test('seleção com somente um sentimento não inventa síntese', () => {
  assert.equal(resolver.resolve({ primaryFeeling: 'amor', secondaryFeelings: [] }, { includeProposed: true }), null);
});

test('todo tema interno utilizado possui adaptador editorial explícito', () => {
  const profiles = [...Object.values(catalog.directionalPairs), ...Object.values(catalog.triadOverrides)];
  const internalThemes = new Set([
    ...profiles.flatMap((profile) => profile.hiddenThemes || []),
    ...Object.values(catalog.secondaryModifiers).flatMap((modifier) => modifier.hiddenThemes || []),
  ]);
  const missing = [...internalThemes].filter((theme) => !catalog.themeAdapters[theme]);
  assert.deepEqual(missing, []);
});

test('módulo é local, determinístico e permanece desconectado da interface e do ranking', () => {
  assert.doesNotMatch(dataScript + engineScript, /fetch\(|XMLHttpRequest|WebSocket|https?:\/\/|Math\.random|Date\.now/);
  assert.doesNotMatch(matchingScript + runtimeEngineScript, /EmotionalSynthesis|emotionalSyntheses|hiddenThemes/);
  assert.doesNotMatch(html, /resolveEmotionalSynthesis|humanSummary/);
  assert.match(html, /js\/data\/emotional-syntheses\.js/);
  assert.match(html, /js\/core\/emotional-synthesis\.js/);
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { EXPECTED, validateMaster } from '../scripts/content-build-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
const master = JSON.parse(read('entre_sabios_acervo_mestre_final.json'));
const runtime = JSON.parse(read('data/entre_sabios_runtime.json'));
const sorted = (values) => [...values].sort((left, right) => left.localeCompare(right, 'pt-BR'));

function loadBrowserData(...relativePaths) {
  const context = vm.createContext({ console: { info() {}, warn() {}, error() {} } });
  context.window = context;
  context.globalThis = context;
  for (const relativePath of relativePaths) vm.runInContext(read(relativePath), context, { filename: relativePath });
  return context;
}

test('mestre, runtime e catálogo de bootstrap usam os mesmos IDs canônicos de sentimentos', () => {
  const context = loadBrowserData('js/data/catalogs.js');
  const masterFeelings = master.catalog.feelings.filter((item) => item.selectable !== false);
  const expectedIds = masterFeelings.map((item) => item.id);
  const bootstrapFeelings = Array.from(context.EntreSabiosData.feelingsCatalog);
  assert.deepEqual(runtime.feelings.map((item) => item.id), expectedIds);
  assert.deepEqual(sorted(bootstrapFeelings.map((item) => item.id)), sorted(expectedIds));
  assert.deepEqual(
    Object.fromEntries(bootstrapFeelings.map((item) => [item.id, item.label])),
    Object.fromEntries(masterFeelings.map((item) => [item.id, item.label])),
  );
  assert.ok(context.EntreSabiosData.combinationRules.every((rule) => rule.feelings.every((feeling) => expectedIds.includes(feeling))));
});

test('taxonomia, sínteses e motivação referenciam somente sentimentos canônicos', () => {
  const context = loadBrowserData(
    'js/data/catalogs.js',
    'js/data/emotional-taxonomy.js',
    'js/data/emotional-syntheses.js',
    'js/data/motivation-profiles.js',
  );
  const expectedIds = master.catalog.feelings.filter((item) => item.selectable !== false).map((item) => item.id);
  const expectedSet = new Set(expectedIds);
  assert.deepEqual(sorted(Object.keys(context.EntreSabiosData.emotionalTaxonomy)), sorted(expectedIds));
  assert.deepEqual(sorted(Object.keys(context.EntreSabiosData.emotionalSyntheses.primaryProfiles)), sorted(expectedIds));
  assert.ok(Object.keys(context.EntreSabiosData.motivationProfiles.primaryProfiles).every((id) => expectedSet.has(id)));
});

test('contrato do build, mestre, runtime e loader permanece sincronizado', () => {
  assert.equal(master.schemaVersion, EXPECTED.schemaVersion);
  assert.equal(master.contentVersion, EXPECTED.contentVersion);
  assert.equal(runtime.schemaVersion, EXPECTED.schemaVersion);
  assert.equal(runtime.contentVersion, EXPECTED.contentVersion);
  assert.equal(runtime.contents.length, EXPECTED.active);

  const context = loadBrowserData('js/core/runtime-loader.js');
  assert.equal(context.EntreSabiosRuntimeLoader.EXPECTED_VERSION, EXPECTED.contentVersion);
  assert.doesNotThrow(() => context.EntreSabiosRuntimeLoader.validateRuntimeContent(runtime));
  assert.throws(() => context.EntreSabiosRuntimeLoader.validateRuntimeContent({ ...runtime, schemaVersion: 'incompatível' }));
  assert.throws(() => context.EntreSabiosRuntimeLoader.validateRuntimeContent({ ...runtime, contents: runtime.contents.slice(1) }));
});

test('HTML usa a versão canônica do runtime nos marcadores de cache', () => {
  const html = read('index.html');
  const runtimeVersion = html.match(/data\/entre_sabios_runtime\.js\?v=([^"']+)/)?.[1];
  const loaderVersion = html.match(/js\/core\/runtime-loader\.js\?v=([^"']+)/)?.[1];
  assert.equal(runtimeVersion, EXPECTED.contentVersion);
  assert.ok(loaderVersion?.startsWith(EXPECTED.contentVersion), `Marcador do loader divergente: ${loaderVersion}`);
});

test('todos os registros do mestre respeitam os catálogos declarados', () => {
  assert.doesNotThrow(() => validateMaster(master));
});

test('validador rejeita enum, lista e associação fora dos catálogos', () => {
  const invalidTone = structuredClone(master);
  invalidTone.contents[0].tone = 'tom_inexistente';
  assert.throws(() => validateMaster(invalidTone), /tone inválido/);

  const invalidRisk = structuredClone(master);
  invalidRisk.contents[0].riskTags = ['risco_inexistente'];
  assert.throws(() => validateMaster(invalidRisk), /riskTags contém valores inválidos/);

  const invalidAssociation = structuredClone(master);
  const associated = invalidAssociation.contents.find((content) => content.associations.length);
  associated.associations[0].feeling = 'sentimento_inexistente';
  assert.throws(() => validateMaster(invalidAssociation), /sentimento inválido em associations/);
});

test('validador rejeita catálogo duplicado e divergência entre status e publicação', () => {
  const duplicateCatalogId = structuredClone(master);
  duplicateCatalogId.catalog.tones.push({ ...duplicateCatalogId.catalog.tones[0] });
  assert.throws(() => validateMaster(duplicateCatalogId), /IDs duplicados no catálogo: tones/);

  const mismatchedPublication = structuredClone(master);
  const removedContent = mismatchedPublication.contents.find((content) => content.status === 'REMOVIDO');
  removedContent.publicationEnabled = true;
  assert.throws(() => validateMaster(mismatchedPublication), /status e publicationEnabled divergem/);
});

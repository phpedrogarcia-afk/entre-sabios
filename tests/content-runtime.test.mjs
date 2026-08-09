import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  EXPECTED,
  REQUIRED_INSECURITY_IDS,
  WEAK_INSECURITY_IDS,
  buildFromFiles,
  calculateMasterTruth,
  isActive,
  isRuntimeEligible,
  validateMaster,
} from '../scripts/content-build-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const first = buildFromFiles({ rootDir, write: false });
const second = buildFromFiles({ rootDir, write: false });
const { master, runtime, serialized, serializedScript } = first;

test('mestre e runtime possuem os totais editoriais congelados', () => {
  const truth = validateMaster(master);
  assert.equal(truth.historical, 408);
  assert.equal(runtime.contents.length, 57);
  assert.deepEqual(
    [runtime.summary.nucleusTotal, runtime.summary.contextualTotal, runtime.summary.generalTotal],
    [37, 20, 0],
  );
});

test('runtime contém somente ativos publicáveis', () => {
  const statusPendingIds = runtime.contents
    .filter((content) => content.status === 'ATIVO_REFERENCIA_PENDENTE')
    .map((content) => content.id)
    .sort();
  const queuedPendingIds = master.pendingReferences.map((reference) => reference.contentId).sort();
  assert.ok(runtime.contents.every((content) => content.publicationEnabled));
  assert.ok(runtime.contents.every((content) => !['REMOVIDO', 'MOVER_PARA_TEXTOS', 'QUARENTENA_DOCUMENTAL'].includes(content.status)));
  assert.equal(statusPendingIds.length, 0);
  assert.equal(queuedPendingIds.length, 18);
});

test('IDs, textos, placements, intensidades e associações são válidos', () => {
  const ids = runtime.contents.map((content) => content.id);
  const texts = runtime.contents.map((content) => content.finalText.trim().toLocaleLowerCase('pt-BR'));
  const feelings = new Set(runtime.feelings.map((feeling) => feeling.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(texts).size, texts.length);
  assert.ok(runtime.contents.every((content) => content.placement));
  assert.ok(runtime.contents.every((content) => content.suitableIntensities.length > 0));
  assert.ok(runtime.contents.every((content) => content.associations.every((association) => feelings.has(association.feeling) && ['nucleo', 'contextual'].includes(association.placement))));
});

test('catálogo oficial contém Insegurança e não contém Coragem', () => {
  const ids = runtime.feelings.map((feeling) => feeling.id);
  assert.equal(ids.length, 14);
  assert.ok(ids.includes('inseguranca'));
  assert.ok(!ids.includes('coragem'));
});

test('os três núcleos V2 de Insegurança estão presentes', () => {
  const insecurity = runtime.contents.filter((content) => content.associations.some(
    (association) => association.feeling === 'inseguranca' && association.placement === 'nucleo',
  ));
  assert.equal(insecurity.length, 3);
  assert.deepEqual(insecurity.map((content) => content.id).sort(), [...REQUIRED_INSECURITY_IDS].sort());
  assert.deepEqual(insecurity.filter((content) => content.suitableIntensities.includes('fraca')).map((content) => content.id).sort(), [...WEAK_INSECURITY_IDS].sort());
});

test('autoria, inspiração e adaptação históricas permanecem preservadas no mestre', () => {
  const pilot = new Map(master.contents.filter((content) => content.id.startsWith('TXT-MED-')).map((content) => [content.id, content]));
  assert.equal(pilot.size, 4);
  assert.equal(pilot.get('TXT-MED-001')?.author, 'Autoria não identificada');
  assert.equal(pilot.get('TXT-MED-002')?.author, 'Autoria preservada');
  assert.equal(pilot.get('TXT-MED-003')?.displayedAuthor, 'Autoria não identificada');
  assert.equal(pilot.get('TXT-MED-004')?.attributionType, 'paraphrase');
  const protectedRelationship = master.contents.find((content) => content.id === 'TXT-CUL-001');
  assert.equal(protectedRelationship?.author, 'Autoria preservada');
  assert.equal(protectedRelationship?.displayedAuthor, 'Adaptação de texto de autoria preservada');
  const protectedHope = master.contents.find((content) => content.id === 'TXT-ESP-002');
  assert.equal(protectedHope?.author, 'Autoria preservada');
  assert.equal(protectedHope?.inspirationSource, 'Richard Dawkins');
  assert.match(protectedHope?.displayedAuthor || '', /^Autoria preservada/);
  assert.ok(master.contents.filter((content) => content.attributionType === 'inspired' && content.publicationEnabled)
    .every((content) => String(content.inspirationSource || '').trim()));
});

test('duplicateOf e derivedFromId apontam para IDs existentes no mestre', () => {
  const ids = new Set(master.contents.map((content) => content.id));
  assert.ok(master.contents.every((content) => !content.duplicateOf || ids.has(content.duplicateOf)));
  assert.ok(master.contents.every((content) => !content.derivedFromId || ids.has(content.derivedFromId)));
});

test('runtime usa a versão definitiva-2.12 e é reproduzível', () => {
  assert.equal(runtime.contentVersion, EXPECTED.contentVersion);
  assert.equal(first.serialized, second.serialized);
  assert.equal(serialized, fs.readFileSync(path.join(rootDir, 'data', 'entre_sabios_runtime.json'), 'utf8'));
  assert.equal(serializedScript, fs.readFileSync(path.join(rootDir, 'data', 'entre_sabios_runtime.js'), 'utf8'));
  assert.ok(Buffer.byteLength(serialized) < 500 * 1024, `Runtime excedeu 500 KB: ${Buffer.byteLength(serialized)} bytes`);
});

test('verdade calculada não depende dos números declarados no resumo', () => {
  const truth = calculateMasterTruth(master);
  assert.equal(truth.active, master.contents.filter(isActive).length);
  assert.equal(runtime.contents.length, master.contents.filter(isRuntimeEligible).length);
  assert.equal(truth.duplicateIds.length, 0);
  assert.equal(truth.duplicateActiveTexts.length, 0);
});

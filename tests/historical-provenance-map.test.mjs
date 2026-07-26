import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const rootDir = path.resolve(import.meta.dirname, '..');
const read = (relative) => fs.readFileSync(path.join(rootDir, relative), 'utf8');
const parse = (relative) => JSON.parse(read(relative));
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const map = parse('docs/INVENTARIO_HISTORICO_MAPA_PROVENIENCIA_2026-07-22.json');
const report = read('docs/INVENTARIO_HISTORICO_MAPA_PROVENIENCIA_2026-07-22.md');
const masterText = read('entre_sabios_acervo_mestre_final.json');
const master = JSON.parse(masterText);
const audit = parse('docs/AUDITORIA_PROVENIENCIA_COMPLETA_2026-07-18.json');

test('mapa histórico cobre os 351 IDs sem recalcular decisões A–J', () => {
  for (const field of [
    'auditMetadata', 'sourceFiles', 'fileMap', 'currentInventory', 'historicalVersions',
    'historicalContents', 'removedContents', 'changedIds', 'lineages', 'batches',
    'protectedContents', 'externalHistoricalContents', 'duplicateGroups',
    'attributionChanges', 'conflicts', 'unresolvedCases', 'statistics',
  ]) assert.ok(Object.hasOwn(map, field), `campo obrigatório ausente: ${field}`);
  assert.equal(map.records.length, 351);
  assert.equal(map.currentInventory.length, 351);
  assert.equal(new Set(map.records.map((record) => record.id)).size, 351);
  assert.deepEqual(
    map.records.map((record) => record.id).sort(),
    master.contents.map((content) => content.id).sort(),
  );
  const auditById = new Map(audit.records.map((record) => [record.id, record]));
  for (const record of map.records) {
    assert.equal(record.provenance.auditCategory, auditById.get(record.id).category);
    assert.equal(record.provenance.decisionAlreadyRecorded, auditById.get(record.id).decision);
  }
});

test('relatório expõe as seções de preservação e a condição de parada', () => {
  for (const heading of [
    '## 1. Estado da auditoria', '## 4. Linha temporal do acervo',
    '## 5. Conteúdos historicamente removidos', '## 7. Linhagens editoriais',
    '## 10. Conteúdos protegidos', '## 11. Conteúdos encontrados fora do acervo ativo',
    '## 16. Limitações da auditoria', '## 17. Próxima etapa recomendada',
    '## Garantias desta execução',
  ]) assert.ok(report.includes(heading), `seção obrigatória ausente: ${heading}`);
  assert.match(report, /sem aplicar restaurações automaticamente/);
});

test('mapa preserva estado atual e impressões digitais sem editar o acervo', () => {
  assert.equal(map.fingerprints.masterSha256, hash(masterText));
  assert.equal(map.fingerprints.runtimeJsonSha256, hash(read('data/entre_sabios_runtime.json')));
  assert.equal(map.fingerprints.runtimeJsSha256, hash(read('data/entre_sabios_runtime.js')));
  const currentById = new Map(master.contents.map((content) => [content.id, content]));
  for (const record of map.records) {
    const current = currentById.get(record.id);
    assert.equal(record.current.status, current.status);
    assert.equal(record.current.publicationEnabled, current.publicationEnabled === true);
    assert.equal(record.current.attributionType, current.attributionType);
    assert.equal(record.current.displayedAuthor, current.displayedAuthor);
    assert.equal(record.textHash, hash(current.finalText || ''));
  }
});

test('artefatos externos permanecem pistas, não restaurações automáticas', () => {
  const byReference = new Map(map.nonMasterArtifacts.map((item) => [item.reference, item]));
  assert.equal(byReference.has('TXT-LUT-003'), false);
  assert.equal(map.records.find((record) => record.id === 'TXT-LUT-003')?.current.status, 'QUARENTENA_DOCUMENTAL');
  assert.equal(map.records.find((record) => record.id === 'TXT-LUT-003')?.current.publicationEnabled, false);
  assert.ok(byReference.has('TXT-AMO-001'));
  assert.ok([...byReference].some(([reference]) => reference.includes('Existe em nós uma coragem')));
  assert.equal(byReference.has('ansiedade'), false);
  for (const item of map.nonMasterArtifacts) {
    assert.match(item.treatment, /preservar|não restaurar|não atribuir/);
  }
});

test('saídas do inventário são reproduzíveis e estão atualizadas', () => {
  const output = execFileSync(process.execPath, ['scripts/build-historical-provenance-map.mjs', '--check'], {
    cwd: rootDir,
    encoding: 'utf8',
  });
  assert.match(output, /351 IDs e \d+ artefatos externos conferidos sem escrita/);
});

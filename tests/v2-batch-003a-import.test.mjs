import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const batch = JSON.parse(fs.readFileSync('curadoria/v2/aprovados/lote-v2-003a-amor-saudade.json', 'utf8'));
const master = JSON.parse(fs.readFileSync('entre_sabios_acervo_mestre_final.json', 'utf8'));
const runtime = JSON.parse(fs.readFileSync('data/entre_sabios_runtime.json', 'utf8'));

const expectedIds = [
  'v2-amo-001-krishnamurti',
  'v2-amo-002-gibran',
  'v2-amo-003-dostoievski',
  'v2-sau-001-garrett',
  'v2-sau-002-machado',
  'v2-sau-003-camoes',
];

test('lote V2-003A preserva os seis conteúdos aprovados e o contrato editorial', () => {
  assert.equal(batch.batchId, 'V2-2026-07-003A');
  assert.equal(batch.targetContentVersion, 'definitiva-2.8');
  assert.deepEqual(batch.contents.map(({ id }) => id), expectedIds);
  assert.ok(batch.contents.every((item) => item.publicationEnabled && item.source?.title && item.source?.url));
  assert.ok(batch.contents.every((item) => item.editorialExplanation && item.editorialQuestion));
});

test('mestre e runtime preservam passagem, autoria, obra, leitura e pergunta separadas', () => {
  for (const approved of batch.contents) {
    const canonical = master.contents.find(({ id }) => id === approved.id);
    const published = runtime.contents.find(({ id }) => id === approved.id);
    assert.ok(canonical, `${approved.id} ausente do mestre`);
    assert.ok(published, `${approved.id} ausente do runtime`);
    for (const field of ['finalText', 'displayedAuthor', 'editorialExplanation', 'editorialQuestion']) {
      assert.equal(canonical[field], approved[field], `${approved.id}: ${field} divergiu do aprovado`);
      assert.equal(published[field], approved[field], `${approved.id}: ${field} divergiu no runtime`);
    }
    assert.equal(published.source.title, approved.source.title);
    assert.notEqual(published.finalText, published.editorialExplanation);
    assert.notEqual(published.finalText, published.editorialQuestion);
    assert.notEqual(published.editorialExplanation, published.editorialQuestion);
  }
});

test('Amor e Saudade possuem exatamente três conteúdos principais V2', () => {
  for (const feeling of ['amor', 'saudade']) {
    const primary = runtime.contents.filter((item) => item.primaryFeeling === feeling);
    assert.equal(primary.length, 4, feeling);
    const expectedForFeeling = batch.contents
      .filter((item) => item.primaryFeeling === feeling)
      .map(({ id }) => id);
    assert.ok(expectedForFeeling.every((id) => primary.some((item) => item.id === id)), feeling);
  }
});

test('equivalência temática de Gibran preserva a formulação V1 apenas como histórico', () => {
  const historical = master.contents.find(({ id }) => id === 'batch04-quote-011');
  const approved = master.contents.find(({ id }) => id === 'v2-amo-002-gibran');
  assert.ok(historical?.publicationEnabled);
  assert.equal(approved?.duplicateOf, historical.id);
  assert.ok(!runtime.contents.some(({ id }) => id === historical.id));
});

test('os seis itens são alcançáveis nas condições editoriais aprovadas', async () => {
  await import(pathToFileURL(path.resolve('js/core/runtime-engine.js')).href);
  const engine = globalThis.EntreSabiosRuntimeEngine;
  for (const item of batch.contents) {
    const found = item.suitableIntensities.some((intensity) => engine.rankEligibleContents(runtime.contents, {
      primaryFeeling: item.primaryFeeling,
      secondaryFeelings: [],
      intensity,
    }, { firstResponse: false }).some(({ content }) => content.id === item.id));
    assert.ok(found, `${item.id} não é alcançável`);
  }
});

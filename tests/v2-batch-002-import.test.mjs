import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const batch = JSON.parse(fs.readFileSync('curadoria/v2/aprovados/lote-v2-002-aprovados.json', 'utf8'));
const correction = JSON.parse(fs.readFileSync('CORRECAO_V2_001_LIVROS_E_KRISHNAMURTI.json', 'utf8'));
const master = JSON.parse(fs.readFileSync('entre_sabios_acervo_mestre_final.json', 'utf8'));
const runtime = JSON.parse(fs.readFileSync('data/entre_sabios_runtime.json', 'utf8'));

const expectedIds = [
  'v2-med-001-montaigne', 'v2-med-002-krishnamurti', 'v2-med-003-epicteto',
  'v2-med-004-rilke-dragoes', 'v2-med-005-epicuro', 'v2-med-006-nietzsche',
  'v2-ins-001-epicteto', 'v2-ins-002-dostoievski', 'v2-ins-003-marco-aurelio',
  'v2-con-001-rilke', 'v2-con-002-gita', 'v2-con-003-krishnamurti',
  'v2-cul-001-dhammapada', 'v2-cul-002-nietzsche', 'v2-cul-003-arendt',
  'v2-rai-001-seneca', 'v2-rai-002-aristoteles', 'v2-rai-003-gita',
];

test('lote V2-002 preserva os 18 conteúdos aprovados e o contrato editorial', () => {
  assert.equal(batch.batchId, 'V2-2026-07-002');
  assert.deepEqual(batch.contents.map(({ id }) => id), expectedIds);
  assert.ok(batch.contents.every((item) => item.status === 'ATIVO_NUCLEO' && item.publicationEnabled));
  assert.ok(batch.contents.every((item) => item.source?.title && item.source?.url));
  assert.ok(batch.contents.every((item) => item.editorialExplanation && item.editorialQuestion));
});

test('mestre e runtime preservam fala, explicação e pergunta em campos separados', () => {
  for (const approved of batch.contents) {
    const recuration = correction.recurations.find(({ contentId }) => contentId === approved.id);
    const expected = recuration ? {
      ...approved,
      finalText: recuration.replace.text,
      displayedAuthor: 'Passagem traduzida e condensada de Jiddu Krishnamurti',
      editorialExplanation: recuration.replace.editorialExplanation,
      editorialQuestion: recuration.replace.editorialQuestion,
    } : approved;
    const canonical = master.contents.find(({ id }) => id === approved.id);
    const published = runtime.contents.find(({ id }) => id === approved.id);
    assert.ok(canonical, `${approved.id} ausente do mestre`);
    assert.ok(published, `${approved.id} ausente do runtime`);
    for (const field of ['finalText', 'displayedAuthor', 'editorialExplanation', 'editorialQuestion']) {
      assert.equal(canonical[field], expected[field], `${approved.id}: ${field} divergiu do aprovado`);
      assert.equal(published[field], expected[field], `${approved.id}: ${field} divergiu no runtime`);
    }
    assert.notEqual(published.finalText, published.editorialExplanation);
    assert.notEqual(published.finalText, published.editorialQuestion);
    assert.notEqual(published.editorialExplanation, published.editorialQuestion);
  }
});

test('equivalência de Epicteto é registrada sem apagar o conteúdo histórico', () => {
  const historical = master.contents.find(({ id }) => id === 'batch02-quote-038');
  const approved = master.contents.find(({ id }) => id === 'v2-med-003-epicteto');
  assert.ok(historical?.publicationEnabled);
  assert.equal(approved?.duplicateOf, historical.id);
});

test('os 18 itens são alcançáveis em ao menos uma condição editorial aprovada', async () => {
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

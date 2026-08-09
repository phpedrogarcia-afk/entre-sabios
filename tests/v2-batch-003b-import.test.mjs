import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const batch = JSON.parse(fs.readFileSync('curadoria/v2/aprovados/LOTE_V2_003B_ESPERANCA_AUTOCONHECIMENTO.json', 'utf8'));
const master = JSON.parse(fs.readFileSync('entre_sabios_acervo_mestre_final.json', 'utf8'));
const runtime = JSON.parse(fs.readFileSync('data/entre_sabios_runtime.json', 'utf8'));
const expectedBooks = new Map([
  ['v2-esp-001-dickinson', 'Poesia completa, vol. 1 — Os fascículos'],
  ['v2-esp-002-havel', 'Entrevista à distância'],
  ['v2-esp-003-camus', 'Bodas em Tipasa'],
  ['v2-aut-001-krishnamurti', 'A Primeira e Última Liberdade'],
  ['v2-aut-002-seneca', 'Cartas a Lucílio'],
  ['v2-aut-003-agostinho', 'Confissões de santo Agostinho'],
]);

test('V2-003B preserva os seis conteúdos e os blocos editoriais separados', () => {
  assert.equal(batch.contents.length, 6);
  for (const approved of batch.contents) {
    const canonical = master.contents.find(({ id }) => id === approved.id);
    const published = runtime.contents.find(({ id }) => id === approved.id);
    assert.ok(canonical && published, approved.id);
    for (const field of ['finalText', 'displayedAuthor', 'editorialExplanation', 'editorialQuestion']) {
      assert.equal(canonical[field], approved[field], `${approved.id}: ${field}`);
      assert.equal(published[field], approved[field], `${approved.id}: runtime ${field}`);
    }
    assert.equal(published.bookRecommendation.bookTitle, expectedBooks.get(approved.id));
    assert.notEqual(published.finalText, published.editorialExplanation);
    assert.notEqual(published.finalText, published.editorialQuestion);
  }
});

test('Esperança e Autoconhecimento possuem três conteúdos principais cada', () => {
  assert.equal(runtime.contents.filter(({ primaryFeeling }) => primaryFeeling === 'esperanca').length, 3);
  assert.equal(runtime.contents.filter(({ primaryFeeling }) => primaryFeeling === 'autoconhecimento').length, 4);
});

test('Camus registra a equivalência histórica sem reativar a V1', () => {
  assert.equal(master.contents.find(({ id }) => id === 'v2-esp-003-camus')?.duplicateOf, 'batch01-quote-031');
  assert.ok(!runtime.contents.some(({ id }) => id === 'batch01-quote-031'));
});

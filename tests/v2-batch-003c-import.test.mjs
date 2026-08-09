import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const batch = JSON.parse(fs.readFileSync('curadoria/v2/aprovados/LOTE_V2_003C_FALTA_DE_PROPOSITO_LUTO.json', 'utf8'));
const master = JSON.parse(fs.readFileSync('entre_sabios_acervo_mestre_final.json', 'utf8'));
const runtime = JSON.parse(fs.readFileSync('data/entre_sabios_runtime.json', 'utf8'));
await import('../js/core/runtime-engine.js');
const engine = globalThis.EntreSabiosRuntimeEngine;
const expectedBooks = new Map([
  ['v2-fdp-001-marco-aurelio', 'Meditações'],
  ['v2-fdp-002-frankl', 'Em busca de sentido'],
  ['v2-fdp-003-tolstoi', 'Uma confissão'],
  ['v2-lut-001-cs-lewis', 'A anatomia de um luto'],
  ['v2-lut-002-george-eliot', 'Silas Marner'],
  ['v2-lut-003-joan-didion', 'O ano do pensamento mágico'],
]);

test('V2-003C preserva os seis conteúdos e os blocos editoriais separados', () => {
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

test('Falta de propósito e Luto possuem três conteúdos principais cada', () => {
  assert.equal(runtime.contents.filter(({ primaryFeeling }) => primaryFeeling === 'falta_de_proposito').length, 4);
  assert.equal(runtime.contents.filter(({ primaryFeeling }) => primaryFeeling === 'luto').length, 3);
});

test('Tennyson não integra o lote nem o runtime V2', () => {
  assert.ok(!batch.contents.some(({ author }) => /tennyson/i.test(author)));
  assert.ok(!runtime.contents.some(({ author }) => /tennyson/i.test(author)));
});

test('Lewis permanece V2 ativo sem equivalência V1 inventada', () => {
  const lewis = master.contents.find(({ id }) => id === 'v2-lut-001-cs-lewis');
  assert.equal(lewis?.publicationEnabled, true);
  assert.equal(lewis?.duplicateOf, null);
  assert.equal(lewis?.derivedFromId, null);
});

test('Marco Aurélio e Tolstói são contextuais alcançáveis após o acolhimento e bloqueados nos estados proibidos', () => {
  const ids = ['v2-fdp-001-marco-aurelio', 'v2-fdp-003-tolstoi'];
  for (const id of ids) {
    const content = runtime.contents.find((item) => item.id === id);
    assert.equal(content?.placement, 'contextual');
    assert.equal(content?.status, 'ATIVO_CONTEXTUAL');
    assert.deepEqual(content?.suitableIntensities, ['moderada']);
  }

  const state = { primaryFeeling: 'falta_de_proposito', secondaryFeelings: [], intensity: 'moderada' };
  const selector = engine.createSelector({ version: 'v2-003c-reachability', contents: runtime.contents });
  const firstInspection = selector.inspect(state, { firstResponse: true, diagnostics: true });
  for (const id of ids) {
    const excluded = firstInspection.diagnostics.excludedCandidates.find((item) => item.id === id);
    assert.ok(excluded?.reasons.includes('hard_exclusion'), `${id}: primeira resposta não foi bloqueada`);
  }

  const first = selector.select(state, { firstResponse: true });
  assert.ok(first && !ids.includes(first.content.id));
  const laterInspection = selector.inspect(state, { firstResponse: false, diagnostics: true });
  for (const id of ids) {
    assert.ok(laterInspection.ranked.some(({ content, level }) => content.id === id && level === 2), `${id}: fora do nível contextual permitido`);
  }
  const reached = new Set();
  for (let index = 0; index < runtime.contents.length; index += 1) {
    const selected = selector.select(state, { firstResponse: false });
    if (selected && ids.includes(selected.content.id)) reached.add(selected.content.id);
  }
  assert.deepEqual([...reached].sort(), [...ids].sort());

  for (const intensity of ['fraca', 'intensa']) {
    const inspection = selector.inspect(
      { primaryFeeling: 'falta_de_proposito', secondaryFeelings: [], intensity },
      { firstResponse: false, diagnostics: true },
    );
    for (const id of ids) {
      const excluded = inspection.diagnostics.excludedCandidates.find((item) => item.id === id);
      assert.ok(excluded?.reasons.includes('unsuitable_intensity'), `${id}: intensidade ${intensity} não foi bloqueada`);
    }
  }
});

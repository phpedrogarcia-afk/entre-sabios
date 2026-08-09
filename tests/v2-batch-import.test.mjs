import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const batch = JSON.parse(fs.readFileSync('curadoria/v2/aprovados/lote-v2-001-nucleo-inicial.json', 'utf8'));
const master = JSON.parse(fs.readFileSync('entre_sabios_acervo_mestre_final.json', 'utf8'));
const runtime = JSON.parse(fs.readFileSync('data/entre_sabios_runtime.json', 'utf8'));
const script = fs.readFileSync('script.js', 'utf8');
const reflectionUi = fs.readFileSync('js/ui/reflection-ui.js', 'utf8');

const expectedIds = [
  'v2-tri-001-rilke', 'v2-tri-002-tagore', 'v2-tri-003-nietzsche',
  'v2-sol-001-pessoa', 'v2-sol-002-krishnamurti', 'v2-sol-003-rilke',
  'v2-ans-001-seneca', 'v2-ans-002-krishnamurti', 'v2-ans-003-gita',
];

test('primeiro lote V2 preserva aprovação, escopo e contrato editorial completo', () => {
  assert.equal(batch.batchId, 'V2-2026-07-001');
  assert.equal(batch.approvedBy, 'Editor-chefe do Entre Sábios');
  assert.deepEqual(batch.contents.map(({ id }) => id), expectedIds);
  assert.ok(batch.contents.every((item) => item.status === 'ATIVO_NUCLEO'));
  assert.ok(batch.contents.every((item) => item.publicationEnabled === true));
  assert.ok(batch.contents.every((item) => item.associations.some(
    (association) => association.feeling === item.primaryFeeling && association.placement === 'nucleo',
  )));
  assert.ok(batch.contents.every((item) => item.editorialExplanation && item.editorialQuestion));
  assert.ok(batch.contents.every((item) => item.source?.title && item.source?.section && item.source?.url));
});

test('os nove conteúdos V2 chegam ao mestre e ao runtime com os blocos específicos', () => {
  for (const id of expectedIds) {
    const canonical = master.contents.find((item) => item.id === id);
    const published = runtime.contents.find((item) => item.id === id);
    assert.ok(canonical, `${id} ausente do mestre`);
    assert.ok(published, `${id} ausente do runtime`);
    assert.equal(published.editorialExplanation, canonical.editorialExplanation);
    assert.equal(published.editorialQuestion, canonical.editorialQuestion);
    assert.equal(published.source.title, canonical.source.title);
    assert.equal(published.source.section, canonical.source.section);
    assert.equal(published.source.translator, canonical.source.translator);
    assert.equal(published.source.url, canonical.source.url);
  }
});

test('interface prioriza explicação e pergunta canônicas e identifica tradução de trabalho', () => {
  assert.match(script, /content\.editorialExplanation/);
  assert.match(script, /content\.editorialQuestion/);
  assert.match(script, /translator: String\(content\.source\.translator/);
  assert.match(reflectionUi, /sourceTranslator/);
  assert.match(reflectionUi, /sourceTitle, sourceSection, sourceTranslator/);
});

test('Pessoa permanece sem marcação de tradução e os outros oito itens a identificam', () => {
  const pessoa = batch.contents.find(({ id }) => id === 'v2-sol-001-pessoa');
  const translated = batch.contents.filter(({ id }) => id !== 'v2-sol-001-pessoa');
  assert.equal(pessoa.source.translator, '');
  assert.ok(translated.every((item) => item.source.translator === 'Tradução de trabalho: Entre Sábios'));
});

test('os nove itens são elegíveis no sentimento principal e não entram mortos no runtime', async () => {
  await import(pathToFileURL(path.resolve('js/core/runtime-engine.js')).href);
  const engine = globalThis.EntreSabiosRuntimeEngine;
  for (const item of batch.contents) {
    const state = {
      primaryFeeling: item.primaryFeeling,
      secondaryFeelings: [],
      intensity: item.suitableIntensities[0],
    };
    const selector = engine.createSelector({ version: `v2-reach-${item.id}`, contents: runtime.contents });
    const inspection = selector.inspect(state, { firstResponse: false });
    assert.ok(inspection.ranked.some(({ content }) => content.id === item.id), `${item.id} não é elegível`);
  }
});

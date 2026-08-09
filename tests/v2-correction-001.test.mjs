import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const correction = JSON.parse(fs.readFileSync('CORRECAO_V2_001_LIVROS_E_KRISHNAMURTI.json', 'utf8'));
const master = JSON.parse(fs.readFileSync('entre_sabios_acervo_mestre_final.json', 'utf8'));
const runtime = JSON.parse(fs.readFileSync('data/entre_sabios_runtime.json', 'utf8'));
const booksSource = fs.readFileSync('js/data/books.js', 'utf8');

test('CORRECAO-V2-001 grava os 27 vínculos editoriais sem criar livros', () => {
  assert.equal(correction.bookRecommendations.length, 27);
  assert.equal(new Set(correction.bookRecommendations.map(({ contentId }) => contentId)).size, 27);
  for (const recommendation of correction.bookRecommendations) {
    const content = master.contents.find(({ id }) => id === recommendation.contentId);
    assert.ok(content, `${recommendation.contentId} ausente do mestre`);
    assert.match(content.source.notes, new RegExp(`Livro recomendado: ${recommendation.bookTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    assert.ok(content.source.notes.includes(`Relação editorial: ${recommendation.relationType}.`));
    assert.ok(content.source.notes.includes(`Por que combina: ${recommendation.whyItMatches}`));
    assert.ok(content.source.notes.includes(`O que o leitor encontra: ${recommendation.whatReaderFinds}`));
    assert.ok(content.source.notes.includes(`Por onde começar: ${recommendation.whereToStart}`));
    assert.ok(booksSource.includes(recommendation.bookTitle), `${recommendation.bookTitle} ausente do catálogo`);
  }
});

test('Krishnamurti preserva o ID e a fonte, com a passagem da floresta declarada como condensada', () => {
  const replacement = correction.recurations[0].replace;
  const canonicalMatches = master.contents.filter(({ id }) => id === 'v2-con-003-krishnamurti');
  const publishedMatches = runtime.contents.filter(({ id }) => id === 'v2-con-003-krishnamurti');
  assert.equal(canonicalMatches.length, 1);
  assert.equal(publishedMatches.length, 1);
  const canonical = canonicalMatches[0];
  const published = publishedMatches[0];
  assert.equal(canonical.finalText, replacement.text);
  assert.equal(published.finalText, replacement.text);
  assert.equal(canonical.editorialExplanation, replacement.editorialExplanation);
  assert.equal(published.editorialExplanation, replacement.editorialExplanation);
  assert.equal(canonical.editorialQuestion, replacement.editorialQuestion);
  assert.equal(published.editorialQuestion, replacement.editorialQuestion);
  assert.equal(canonical.source.title, replacement.source.title);
  assert.equal(canonical.source.url, replacement.source.url);
  assert.equal(canonical.attributionType, 'paraphrase');
  assert.match(canonical.displayedAuthor, /traduzida e condensada/i);
  assert.match(canonical.source.notes, /não apresentar como transcrição literal integral/i);
  assert.match(canonical.source.notes, /não incentivar passividade em urgências/i);
});

test('a correção preserva contagens, versão e fronteira exclusiva V2', () => {
  assert.equal(master.contents.length, 408);
  assert.equal(runtime.contents.length, 57);
  assert.equal(runtime.contentVersion, 'definitiva-2.12');
  assert.ok(runtime.contents.every(({ id }) => id.startsWith('v2-')));
});

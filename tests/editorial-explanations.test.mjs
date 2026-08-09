import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'entre_sabios_runtime.json'), 'utf8'));
const master = JSON.parse(fs.readFileSync(path.join(rootDir, 'entre_sabios_acervo_mestre_final.json'), 'utf8'));
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(rootDir, 'js', 'data', 'editorial-explanations.js'), 'utf8'), sandbox);
const explanations = sandbox.EntreSabiosData.editorialExplanations;
const profiles = sandbox.EntreSabiosData.editorialProfiles;

function normalizeText(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

test('33 conteúdos V2 ativos exigem explicação prioritária com correspondência exata', () => {
  for (const content of runtime.contents) {
    if (content.editorialExplanation) {
      assert.ok(content.editorialExplanation.length >= 35, `${content.id} possui explicação canônica insuficiente`);
      continue;
    }
    const id = content.id;
    const entry = explanations[id];
    assert.ok(entry, `${id} não possui explicação`);
    assert.equal(entry.finalText, content.finalText, `${id} mudou de texto`);
    assert.ok(entry.explanation.length >= 35, `${id} possui explicação insuficiente`);
  }
});

test('explicações recuperadas continuam idênticas às fontes editoriais anteriores', () => {
  const legacySandbox = {};
  vm.createContext(legacySandbox);
  const quoteDir = path.join(rootDir, 'js', 'data', 'quotes');
  for (const file of fs.readdirSync(quoteDir).filter((name) => name.endsWith('.js')).sort()) {
    vm.runInContext(fs.readFileSync(path.join(quoteDir, file), 'utf8'), legacySandbox, { filename: file });
  }
  vm.runInContext(fs.readFileSync(path.join(rootDir, 'js', 'data', 'perspectives.js'), 'utf8'), legacySandbox);
  const makePerspective = (id, autor, tradicao, frase, sentimentos, intensidade, temas, tom, conselho, explicacao) => ({
    id, frase, explicacao,
  });
  const legacyContents = [
    ...Object.values(legacySandbox.EntreSabiosData.quoteBatches || {}).flat(),
    ...legacySandbox.EntreSabiosData.createPerspectiveContentDb(makePerspective),
  ];

  for (const [id, entry] of Object.entries(explanations)) {
    if (entry.reviewStatus) continue;
    const source = legacyContents.find((item) => item.id === id
      && normalizeText(item.frase || item.texto) === normalizeText(entry.finalText));
    assert.ok(source, `${id} não possui fonte editorial anterior correspondente`);
    assert.equal(entry.explanation, source.explicacao, `${id} foi reescrito durante a recuperação`);
  }
});

test('34 perfis editoriais específicos não inventam pensador nem autoria', () => {
  assert.equal(Object.keys(profiles).length, 34);
  for (const [id, entry] of Object.entries(profiles)) {
    const content = runtime.contents.find((item) => item.id === id);
    const historicalContent = master.contents.find((item) => item.id === id);
    assert.equal(entry.finalText, historicalContent?.finalText, id);
    if (!content) {
      assert.ok(
        !historicalContent?.id.startsWith('v2-') || historicalContent?.status === 'REMOVIDO',
        `${id} ausente do runtime deve pertencer à V1 histórica ou estar removido`,
      );
    }
    assert.equal(entry.title, 'SOBRE ESTA REFLEXÃO', id);
    assert.ok(entry.profile.length >= 80, id);
    if (historicalContent?.status === 'REMOVIDO' && historicalContent?.changeType === 'ai_generated_provenance_removal') {
      assert.match(entry.profile, /geração por IA foi confirmada/i, id);
      assert.match(entry.profile, /não é obra autoral do Entre Sábios/i, id);
    } else {
      if (historicalContent?.author === 'Entre Sábios') assert.match(entry.profile, /original do acervo Entre Sábios/, id);
      if (historicalContent?.author === 'Autoria preservada') assert.match(entry.profile, /autoria preservada/i, id);
      if (historicalContent?.author === 'Autoria não identificada') assert.match(entry.profile, /autoria deste texto ainda não foi identificada/i, id);
    }
    assert.doesNotMatch(entry.profile, /filósofo|pensador histórico foi|citação de/, id);
  }
});

test('catálogo recuperado não contém os fallbacks técnicos removidos', () => {
  const joined = Object.values(explanations).map((entry) => entry.explanation).join('\n');
  assert.doesNotMatch(joined, /relação explícita com o sentimento|função editorial|mecanismo que pode estar atuando|tensão aberta para contemplação/i);
});

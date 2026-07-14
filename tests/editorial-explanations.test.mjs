import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'entre_sabios_runtime.json'), 'utf8'));
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(rootDir, 'js', 'data', 'editorial-explanations.js'), 'utf8'), sandbox);
const explanations = sandbox.EntreSabiosData.editorialExplanations;

function normalizeText(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

test('32 explicações prioritárias exigem correspondência exata com o runtime', () => {
  assert.equal(Object.keys(explanations).length, 32);
  for (const [id, entry] of Object.entries(explanations)) {
    const content = runtime.contents.find((item) => item.id === id);
    assert.ok(content, `${id} não existe no runtime`);
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
    const source = legacyContents.find((item) => item.id === id
      && normalizeText(item.frase || item.texto) === normalizeText(entry.finalText));
    assert.ok(source, `${id} não possui fonte editorial anterior correspondente`);
    assert.equal(entry.explanation, source.explicacao, `${id} foi reescrito durante a recuperação`);
  }
});

test('catálogo recuperado não contém os fallbacks técnicos removidos', () => {
  const joined = Object.values(explanations).map((entry) => entry.explanation).join('\n');
  assert.doesNotMatch(joined, /relação explícita com o sentimento|função editorial|mecanismo que pode estar atuando|tensão aberta para contemplação/i);
});

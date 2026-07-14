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
vm.runInContext(fs.readFileSync(path.join(rootDir, 'js', 'data', 'editorial-guidance.js'), 'utf8'), sandbox);
const guidance = sandbox.EntreSabiosData.editorialGuidance;
const contexts = sandbox.EntreSabiosData.editorialGuidanceContexts;

function normalizeText(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function loadLegacyContents() {
  const legacySandbox = {};
  vm.createContext(legacySandbox);
  const quoteDir = path.join(rootDir, 'js', 'data', 'quotes');
  for (const file of fs.readdirSync(quoteDir).filter((name) => name.endsWith('.js')).sort()) {
    vm.runInContext(fs.readFileSync(path.join(quoteDir, file), 'utf8'), legacySandbox, { filename: file });
  }
  vm.runInContext(fs.readFileSync(path.join(rootDir, 'js', 'data', 'perspectives.js'), 'utf8'), legacySandbox);
  const makePerspective = (id, autor, tradicao, frase, sentimentos, intensidade, temas, tom, conselho) => ({
    id, frase, sentimentos, intensidade, conselho,
  });
  return [
    ...Object.values(legacySandbox.EntreSabiosData.quoteBatches || {}).flat(),
    ...legacySandbox.EntreSabiosData.createPerspectiveContentDb(makePerspective),
  ];
}

test('30 orientações prioritárias exigem correspondência exata com o runtime', () => {
  assert.equal(Object.keys(guidance).length, 30);
  assert.deepEqual(Object.keys(contexts).sort(), Object.keys(guidance).sort());
  for (const [id, entry] of Object.entries(guidance)) {
    const content = runtime.contents.find((item) => item.id === id);
    assert.ok(content, `${id} não existe no runtime`);
    assert.equal(entry.finalText, content.finalText, `${id} mudou de texto`);
    assert.ok(entry.guidance.length >= 35, `${id} possui orientação insuficiente`);
  }
});

test('orientações e contextos continuam idênticos às fontes editoriais anteriores', () => {
  const legacyContents = loadLegacyContents();
  for (const [id, entry] of Object.entries(guidance)) {
    const source = legacyContents.find((item) => item.id === id
      && normalizeText(item.frase || item.texto) === normalizeText(entry.finalText));
    assert.ok(source, `${id} não possui fonte editorial anterior correspondente`);
    assert.equal(entry.guidance, source.conselho, `${id} teve a orientação reescrita`);
    assert.deepEqual([...contexts[id].feelings], [...source.sentimentos], `${id} mudou os sentimentos editoriais`);
    assert.deepEqual([...contexts[id].intensities], [...source.intensidade], `${id} mudou as intensidades editoriais`);
  }
});

test('rótulos são explícitos, permitidos e coerentes com perguntas', () => {
  const allowedLabels = new Set([
    'UMA PERGUNTA',
    'UMA POSSIBILIDADE',
    'ALGO PARA LEVAR CONSIGO',
    'UMA ORIENTAÇÃO',
    'PARA PERMANECER UM POUCO',
    'UMA PAUSA',
  ]);
  for (const [id, entry] of Object.entries(guidance)) {
    assert.ok(allowedLabels.has(entry.label), `${id} possui rótulo não autorizado`);
    if (/^Pergunte\b/.test(entry.guidance)) assert.equal(entry.label, 'UMA PERGUNTA', `${id} deveria ser pergunta`);
  }
});

test('trava contextual mantém orientação somente no sentimento e intensidade curados', () => {
  const availability = { fraca: 0, moderada: 0, intensa: 0 };
  for (const [id, context] of Object.entries(contexts)) {
    const content = runtime.contents.find((item) => item.id === id);
    const matchesPrimary = context.feelings.map(normalizeText).includes(normalizeText(content.primaryFeeling));
    for (const intensity of Object.keys(availability)) {
      if (matchesPrimary && context.intensities.includes(intensity)) availability[intensity] += 1;
    }
  }
  assert.deepEqual(availability, { fraca: 4, moderada: 25, intensa: 12 });
});

test('função real recusa texto, sentimento ou intensidade fora do contexto curado', () => {
  const script = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
  const source = script.match(/function getSpecificEditorialGuidance\(content, state\) \{[\s\S]*?\n\}/)?.[0];
  assert.ok(source, 'função contextual não encontrada em script.js');
  const functionSandbox = {
    window: { EntreSabiosData: { editorialGuidance: guidance, editorialGuidanceContexts: contexts } },
    normalizeTheme: normalizeText,
  };
  vm.createContext(functionSandbox);
  vm.runInContext(source, functionSandbox);
  const content = runtime.contents.find((item) => item.id === 'batch04-quote-021');

  const valid = functionSandbox.getSpecificEditorialGuidance(content, { primaryFeeling: 'luto', intensity: 'intensa' });
  assert.equal(valid.guidance, guidance['batch04-quote-021'].guidance);
  assert.equal(valid.label, guidance['batch04-quote-021'].label);
  assert.equal(functionSandbox.getSpecificEditorialGuidance(content, { primaryFeeling: 'luto', intensity: 'moderada' }), null);
  assert.equal(functionSandbox.getSpecificEditorialGuidance(content, { primaryFeeling: 'saudade', intensity: 'intensa' }), null);
  assert.equal(functionSandbox.getSpecificEditorialGuidance({ ...content, finalText: `${content.finalText} alterado` }, { primaryFeeling: 'luto', intensity: 'intensa' }), null);
});

test('catálogo não contém fallbacks genéricos nem promessa terapêutica', () => {
  const joined = Object.values(guidance).map((entry) => entry.guidance).join('\n');
  assert.doesNotMatch(joined, /permita que a reflexão acompanhe|frase reconhece|frase esclarece|função editorial|relação explícita/i);
  assert.doesNotMatch(joined, /vai curar|vai melhorar|cura garantida|você deve superar|diagnóstico/i);
});

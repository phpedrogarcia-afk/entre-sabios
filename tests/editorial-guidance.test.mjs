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

test('perguntas editoriais prioritárias exigem correspondência exata com o runtime', () => {
  assert.ok(Object.keys(guidance).length >= 30);
  assert.deepEqual(Object.keys(contexts).sort(), Object.keys(guidance).sort());
  for (const [id, entry] of Object.entries(guidance)) {
    const content = runtime.contents.find((item) => item.id === id);
    const historicalContent = master.contents.find((item) => item.id === id);
    assert.ok(historicalContent, `${id} não existe no mestre`);
    assert.equal(entry.finalText, historicalContent.finalText, `${id} mudou de texto`);
    if (!content) assert.equal(historicalContent.status, 'REMOVIDO', `${id} ausente do runtime não está removido`);
    assert.ok(entry.guidance.length >= 35, `${id} possui orientação insuficiente`);
  }
});

test('revisões preservam a orientação anterior e não apagam os contextos de origem', () => {
  const legacyContents = loadLegacyContents();
  for (const [id, entry] of Object.entries(guidance)) {
    const source = legacyContents.find((item) => item.id === id
      && normalizeText(item.frase || item.texto) === normalizeText(entry.finalText));
    if (!source) {
      assert.equal(entry.previousGuidance, undefined, `${id} sem fonte anterior não pode declarar orientação preservada`);
      continue;
    }
    assert.equal(entry.previousGuidance || entry.guidance, source.conselho, `${id} perdeu a orientação editorial anterior`);
    const preservedContext = contexts[id].previousContext || contexts[id];
    const currentFeelings = preservedContext.feelings.map(normalizeText);
    for (const feeling of source.sentimentos) {
      assert.ok(currentFeelings.includes(normalizeText(feeling)), `${id} perdeu o sentimento editorial ${feeling}`);
    }
    for (const intensity of source.intensidade) {
      assert.ok(preservedContext.intensities.includes(intensity), `${id} perdeu a intensidade editorial ${intensity}`);
    }
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
    if (entry.previousGuidance) {
      assert.equal(entry.label, 'UMA PERGUNTA', `${id} revisado não usa o título canônico`);
      assert.match(entry.guidance, /\?$/, `${id} revisado não termina como pergunta`);
    }
  }
});

test('trava contextual respeita o sentimento principal e as intensidades permitidas', () => {
  for (const [id, context] of Object.entries(contexts)) {
    const content = runtime.contents.find((item) => item.id === id);
    if (!content) {
      assert.equal(master.contents.find((item) => item.id === id)?.status, 'REMOVIDO', `${id} ausente do runtime não está removido`);
      continue;
    }
    const matchesPrimary = content.primaryFeeling
      ? context.feelings.map(normalizeText).includes(normalizeText(content.primaryFeeling))
      : context.universal === true;
    assert.ok(matchesPrimary, `${id} não cobre seu sentimento principal ou a condição universal`);
    for (const intensity of context.intensities) {
      assert.ok(content.suitableIntensities.includes(intensity), `${id} usa intensidade editorial inelegível`);
    }
    if (guidance[id].previousGuidance) {
      assert.deepEqual([...context.intensities].sort(), [...content.suitableIntensities].sort(), `${id} revisado não cobre todas as intensidades permitidas`);
    }
  }
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
  assert.equal(functionSandbox.getSpecificEditorialGuidance(content, { primaryFeeling: 'luto', intensity: 'neutra' }), null);
  assert.equal(functionSandbox.getSpecificEditorialGuidance(content, { primaryFeeling: 'saudade', intensity: 'intensa' }), null);
  assert.equal(functionSandbox.getSpecificEditorialGuidance({ ...content, finalText: `${content.finalText} alterado` }, { primaryFeeling: 'luto', intensity: 'intensa' }), null);
});

test('catálogo não contém fallbacks genéricos nem promessa terapêutica', () => {
  const joined = Object.values(guidance).map((entry) => entry.guidance).join('\n');
  assert.doesNotMatch(joined, /permita que a reflexão acompanhe|frase reconhece|frase esclarece|função editorial|relação explícita/i);
  assert.doesNotMatch(joined, /vai curar|vai melhorar|cura garantida|você deve superar|diagnóstico/i);
});

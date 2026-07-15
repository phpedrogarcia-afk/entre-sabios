import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { buildFromFiles } from '../scripts/content-build-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = { window: { EntreSabiosData: {} }, console };
vm.createContext(sandbox);

for (const relativePath of [
  'js/data/emotional-syntheses.js',
  'js/data/motivation-profiles.js',
  'js/core/emotional-synthesis.js',
  'js/core/synthesis-ranking-adapter.js',
  'js/core/motivation-ranking-adapter.js',
  'js/core/runtime-engine.js',
]) {
  vm.runInContext(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'), sandbox, { filename: relativePath });
}

const { runtime } = buildFromFiles({ rootDir, write: false });
const engine = sandbox.window.EntreSabiosRuntimeEngine;
const synthesisCatalog = sandbox.window.EntreSabiosData.emotionalSyntheses;
const synthesisResolver = sandbox.window.EntreSabiosEmotionalSynthesis.createResolver(synthesisCatalog);
const synthesisAdapter = sandbox.window.EntreSabiosSynthesisRankingAdapter.createAdapter({
  catalog: synthesisCatalog,
  resolver: synthesisResolver,
});
const motivationAdapter = sandbox.window.EntreSabiosMotivationRankingAdapter.createAdapter(
  sandbox.window.EntreSabiosData.motivationProfiles,
);

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

test('sequência real não reinicia o núcleo enquanto há alternativa segura e inédita do mesmo principal', () => {
  const state = {
    primaryFeeling: 'autoconhecimento',
    secondaryFeelings: ['confusao', 'inseguranca'],
    intensity: 'moderada',
    needsMotivation: false,
    directionalKey: 'autoconhecimento__confusao__inseguranca',
  };
  const selector = engine.createSelector({
    version: 'phase3-real-repetition-before-fix',
    contents: runtime.contents,
    synthesisAdapter,
    motivationAdapter,
  });
  const seenIds = new Set();
  const seenTexts = new Set();
  const sequence = [];

  for (let index = 0; index < 4; index += 1) {
    const result = selector.select(state, { firstResponse: index === 0, diagnostics: true });
    const textKey = normalizeText(result.content.finalText);
    assert.equal(seenIds.has(result.content.id), false, `ID repetido antes de percorrer os quatro núcleos: ${result.content.id}`);
    assert.equal(seenTexts.has(textKey), false, `Texto repetido antes de percorrer os quatro núcleos: ${result.content.id}`);
    seenIds.add(result.content.id);
    seenTexts.add(textKey);
    sequence.push(result.content.id);
  }

  const fifth = selector.select(state, { firstResponse: false, diagnostics: true });
  const fifthTextKey = normalizeText(fifth.content.finalText);
  const ranked = engine.rankEligibleContents(runtime.contents, state, {
    firstResponse: false,
    synthesisAdapter,
    motivationAdapter,
  });
  const safeUnseenFromSamePrimary = ranked.filter(({ content, level }) => (
    level === 2
      && !seenIds.has(content.id)
      && !seenTexts.has(normalizeText(content.finalText))
  ));
  const repeated = seenIds.has(fifth.content.id) || seenTexts.has(fifthTextKey);
  const evidence = {
    sequence: [...sequence, fifth.content.id],
    repeatedContent: fifth.content.id,
    repeatPosition: 5,
    activeLevel: fifth.level,
    activeLevelCandidates: fifth.eligibleAtLevel,
    safeUnseenSamePrimaryCount: safeUnseenFromSamePrimary.length,
    safeUnseenSamePrimaryExamples: safeUnseenFromSamePrimary.slice(0, 8).map(({ content }) => content.id),
    queueKey: fifth.diagnostics.queueKey,
    queueBefore: fifth.diagnostics.activeQueueBeforeSelection,
    globalHistoryBefore: fifth.diagnostics.globalHistoryBefore.map(({ id }) => id),
    synthesis: fifth.synthesis,
    motivation: fifth.motivation,
    fallback: fifth.fallback,
    exactAvoidanceRelaxed: fifth.exactAvoidanceRelaxed,
    repeatAllowed: fifth.diagnostics.repeatAllowed,
    repeatReason: fifth.diagnostics.repeatReason,
  };

  assert.ok(safeUnseenFromSamePrimary.length > 0, 'o cenário precisa manter alternativas contextuais seguras do principal');
  assert.equal(repeated, false, `repetição evitável reproduzida: ${JSON.stringify(evidence)}`);
});

test('duplo clique em Outra perspectiva produz somente uma seleção', () => {
  const script = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
  const lockStart = script.indexOf('const REFLECTION_SELECTION_LOCK_MS');
  const listenerStart = script.indexOf("generateBtn.addEventListener('click'");
  assert.ok(lockStart >= 0 && listenerStart > lockStart, 'trava transacional de seleção não localizada');
  const lockSource = script.slice(lockStart, listenerStart);
  const listenerMatch = script.match(/newBtn\.addEventListener\('click',[\s\S]*?\n\}\);/);
  assert.ok(listenerMatch, 'listener de Outra perspectiva não localizado');

  let clickHandler = null;
  let selections = 0;
  let bells = 0;
  let releaseLock = null;
  const eventSandbox = {
    generateBtn: { disabled: false },
    newBtn: {
      disabled: false,
      addEventListener(event, handler) {
        assert.equal(event, 'click');
        clickHandler = handler;
      },
    },
    newPhrase() {
      selections += 1;
      return true;
    },
    playSoftBell() {
      bells += 1;
    },
    runtimeSelector: {},
    window: {
      setTimeout(callback) {
        releaseLock = callback;
      },
    },
  };
  vm.runInNewContext(lockSource, eventSandbox);
  vm.runInNewContext(listenerMatch[0], eventSandbox);
  assert.equal(typeof clickHandler, 'function');

  clickHandler({ type: 'click', detail: 1 });
  clickHandler({ type: 'click', detail: 2 });

  assert.equal(selections, 1, `duplo clique disparou ${selections} seleções`);
  assert.equal(bells, 1, `duplo clique disparou ${bells} confirmações sonoras`);
  assert.equal(eventSandbox.newBtn.disabled, true);
  assert.equal(typeof releaseLock, 'function');
  releaseLock();
  assert.equal(eventSandbox.newBtn.disabled, false);
});

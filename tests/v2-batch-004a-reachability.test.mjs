import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const packageData = JSON.parse(fs.readFileSync('curadoria/v2/aprovados/V2_004A_PACOTE_COMPLETO.json', 'utf8'));
const master = JSON.parse(fs.readFileSync('entre_sabios_acervo_mestre_final.json', 'utf8'));
const runtime = JSON.parse(fs.readFileSync('data/entre_sabios_runtime.json', 'utf8'));
await import('../js/core/runtime-engine.js');
const engine = globalThis.EntreSabiosRuntimeEngine;

const expectedBooks = new Map([
  ['v2-tri-004-gibran', 'O Profeta'],
  ['v2-sol-004-pascal', 'Pensamentos'],
  ['v2-ans-004-sallatha', 'The Connected Discourses of the Buddha'],
  ['v2-med-007-dhammapada', 'Dhammapada'],
  ['v2-ins-004-emerson', 'Ensaios — Primeira série'],
  ['v2-con-004-agostinho', 'Confissões de santo Agostinho'],
]);

function inspectionFor(primaryFeeling, intensity, firstResponse) {
  const selector = engine.createSelector({ version: `v2-004a-${primaryFeeling}-${intensity}-${firstResponse}`, contents: runtime.contents });
  return selector.inspect(
    { primaryFeeling, secondaryFeelings: [], intensity },
    { firstResponse, diagnostics: true },
  );
}

function exclusionFor(inspection, id) {
  return inspection.diagnostics.excludedCandidates.find((candidate) => candidate.id === id);
}

test('V2-004A preserva os seis conteúdos, seus blocos editoriais e livros específicos', () => {
  assert.equal(packageData.contents.length, 6);
  for (const approved of packageData.contents) {
    const canonical = master.contents.find(({ id }) => id === approved.id);
    const published = runtime.contents.find(({ id }) => id === approved.id);
    assert.ok(canonical && published, approved.id);
    for (const field of ['finalText', 'displayedAuthor', 'editorialExplanation', 'editorialQuestion']) {
      assert.equal(canonical[field], approved[field], `${approved.id}: mestre ${field}`);
      assert.equal(published[field], approved[field], `${approved.id}: runtime ${field}`);
    }
    assert.equal(published.bookRecommendation.bookTitle, expectedBooks.get(approved.id));
    assert.notEqual(published.finalText, published.editorialExplanation);
    assert.notEqual(published.finalText, published.editorialQuestion);
  }
});

test('Sallatha possui a classificação aprovada e efeitos editoriais seguros', () => {
  const content = runtime.contents.find(({ id }) => id === 'v2-ans-004-sallatha');
  assert.equal(content.placement, 'contextual');
  assert.equal(content.status, 'ATIVO_CONTEXTUAL');
  assert.equal(content.attributionType, 'paraphrase');
  assert.deepEqual(content.suitableIntensities, ['fraca', 'moderada']);
  assert.deepEqual(content.riskTags, []);
  assert.deepEqual(content.hardExclusions, ['primeira_resposta', 'reconhecimento_inicial', 'ansiedade_intensa']);
  for (const intensity of ['fraca', 'moderada']) {
    const effects = engine.classifyEditorialEffects(content, { primaryFeeling: 'ansiedade', intensity }, { firstResponse: false });
    assert.equal(effects.safe, true);
    for (const tag of ['unsafe_pressure_in_intense_state', 'confirms_harmful_belief', 'risks_negative_reinforcement']) {
      assert.ok(!effects.tags.includes(tag), tag);
    }
    const inspection = inspectionFor('ansiedade', intensity, false);
    assert.ok(inspection.ranked.some(({ content: candidate }) => candidate.id === content.id));
  }
  assert.ok(exclusionFor(inspectionFor('ansiedade', 'moderada', true), content.id)?.reasons.includes('hard_exclusion'));
  assert.ok(exclusionFor(inspectionFor('ansiedade', 'intensa', false), content.id)?.reasons.includes('hard_exclusion'));
});

test('Dhammapada possui a classificação aprovada e efeitos editoriais seguros', () => {
  const content = runtime.contents.find(({ id }) => id === 'v2-med-007-dhammapada');
  assert.equal(content.placement, 'contextual');
  assert.equal(content.status, 'ATIVO_CONTEXTUAL');
  assert.equal(content.attributionType, 'paraphrase');
  assert.deepEqual(content.suitableIntensities, ['moderada']);
  assert.deepEqual(content.riskTags, ['abstracao_elevada']);
  assert.deepEqual(content.hardExclusions, ['primeira_resposta', 'reconhecimento_inicial', 'medo_intenso', 'perda_recente', 'luto_intenso']);
  const effects = engine.classifyEditorialEffects(content, { primaryFeeling: 'medo', intensity: 'moderada' }, { firstResponse: false });
  assert.equal(effects.safe, true);
  for (const tag of ['confirms_harmful_belief', 'risks_negative_reinforcement']) assert.ok(!effects.tags.includes(tag), tag);
  assert.ok(inspectionFor('medo', 'moderada', false).ranked.some(({ content: candidate }) => candidate.id === content.id));
  assert.ok(exclusionFor(inspectionFor('medo', 'moderada', true), content.id)?.reasons.includes('hard_exclusion'));
  assert.ok(exclusionFor(inspectionFor('medo', 'intensa', false), content.id)?.reasons.includes('hard_exclusion'));
  assert.ok(exclusionFor(inspectionFor('luto', 'intensa', false), content.id)?.reasons.includes('hard_exclusion'));
});

test('runtime permanece V2, sem IDs duplicados e com a distribuição editorial derivada', () => {
  assert.equal(master.contents.length, 408);
  assert.equal(runtime.contents.length, 57);
  assert.equal(runtime.contentVersion, 'definitiva-2.12');
  assert.deepEqual([runtime.summary.nucleusTotal, runtime.summary.contextualTotal], [37, 20]);
  assert.ok(runtime.contents.every(({ id }) => id.startsWith('v2-')));
  assert.equal(new Set(runtime.contents.map(({ id }) => id)).size, 57);
  for (const id of ['v2-ans-004-sallatha', 'v2-med-007-dhammapada']) {
    assert.equal(master.contents.filter((content) => content.id === id).length, 1);
    assert.equal(runtime.contents.filter((content) => content.id === id).length, 1);
  }
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const packageData = JSON.parse(fs.readFileSync('curadoria/v2/aprovados/V2_004B_HISTORICOS_APROVADOS.json', 'utf8'));
const master = JSON.parse(fs.readFileSync('entre_sabios_acervo_mestre_final.json', 'utf8'));
const runtime = JSON.parse(fs.readFileSync('data/entre_sabios_runtime.json', 'utf8'));
await import('../js/core/runtime-engine.js');
const engine = globalThis.EntreSabiosRuntimeEngine;

const expectedBooks = new Map([
  ['v2-fdp-004-george-eliot', 'Middlemarch'],
  ['v2-aut-004-nietzsche', 'Assim Falou Zaratustra'],
  ['v2-cul-004-shakespeare', 'Macbeth'],
  ['v2-rai-004-melville', 'Moby Dick'],
  ['v2-amo-004-woolf', 'Ao Farol'],
  ['v2-sau-004-proust', 'No caminho de Swann'],
]);

function inspect(primaryFeeling, intensity, firstResponse = false) {
  const selector = engine.createSelector({ version: `v2-004b-${primaryFeeling}-${intensity}-${firstResponse}`, contents: runtime.contents });
  return selector.inspect({ primaryFeeling, secondaryFeelings: [], intensity }, { firstResponse, diagnostics: true });
}

function isRanked(id, primaryFeeling, intensity) {
  return inspect(primaryFeeling, intensity).ranked.some(({ content }) => content.id === id);
}

function isHardExcluded(id, primaryFeeling, intensity, firstResponse = false) {
  return inspect(primaryFeeling, intensity, firstResponse).diagnostics.excludedCandidates
    .find((candidate) => candidate.id === id)?.reasons.includes('hard_exclusion') === true;
}

test('V2-004B preserva pacote, textos canônicos, autoria, fontes e livros', () => {
  assert.equal(packageData.contents.length, 6);
  for (const approved of packageData.contents) {
    const canonical = master.contents.find(({ id }) => id === approved.id);
    const published = runtime.contents.find(({ id }) => id === approved.id);
    assert.ok(canonical && published, approved.id);
    assert.equal(master.contents.filter(({ id }) => id === approved.id).length, 1);
    assert.equal(runtime.contents.filter(({ id }) => id === approved.id).length, 1);
    for (const field of ['finalText', 'displayedAuthor', 'attributionType', 'placement', 'editorialFunction', 'secondaryFunction', 'editorialExplanation', 'editorialQuestion']) {
      assert.equal(canonical[field], approved[field], `${approved.id}: mestre ${field}`);
      assert.equal(published[field], approved[field], `${approved.id}: runtime ${field}`);
    }
    assert.deepEqual(canonical.suitableIntensities, approved.suitableIntensities);
    assert.deepEqual(canonical.riskTags, approved.riskTags);
    assert.deepEqual(canonical.hardExclusions, approved.hardExclusions);
    assert.equal(canonical.source.title, approved.source.title);
    assert.equal(published.bookRecommendation.bookTitle, expectedBooks.get(approved.id));
  }
});

test('George Eliot é núcleo alcançável em falta de propósito fraca e moderada', () => {
  const id = 'v2-fdp-004-george-eliot';
  assert.equal(runtime.contents.find((content) => content.id === id)?.placement, 'nucleo');
  assert.ok(isRanked(id, 'falta_de_proposito', 'fraca'));
  assert.ok(isRanked(id, 'falta_de_proposito', 'moderada'));
  assert.ok(!isRanked(id, 'raiva', 'fraca'));
  const effects = engine.classifyEditorialEffects(runtime.contents.find((content) => content.id === id), { primaryFeeling: 'falta_de_proposito', intensity: 'fraca' }, { firstResponse: true });
  assert.equal(effects.safe, true);
  assert.ok(!effects.tags.includes('confirms_harmful_belief'));
});

test('Nietzsche é contextual, bloqueado na abertura e alcançável depois', () => {
  const id = 'v2-aut-004-nietzsche';
  assert.ok(isHardExcluded(id, 'autoconhecimento', 'moderada', true));
  assert.ok(runtime.contents.find((content) => content.id === id).hardExclusions.includes('reconhecimento_inicial'));
  assert.ok(isRanked(id, 'autoconhecimento', 'moderada'));
  const effects = engine.classifyEditorialEffects(runtime.contents.find((content) => content.id === id), { primaryFeeling: 'autoconhecimento', intensity: 'moderada' }, { firstResponse: false });
  assert.equal(effects.safe, true);
  assert.ok(!effects.tags.includes('glorifies_harm'));
});

test('Shakespeare reconhece culpa moderada sem confirmar condenação permanente', () => {
  const id = 'v2-cul-004-shakespeare';
  assert.ok(isHardExcluded(id, 'culpa', 'moderada', true));
  assert.ok(isHardExcluded(id, 'tristeza', 'intensa'));
  assert.ok(isRanked(id, 'culpa', 'moderada'));
  const effects = engine.classifyEditorialEffects(runtime.contents.find((content) => content.id === id), { primaryFeeling: 'culpa', intensity: 'moderada' }, { firstResponse: false });
  assert.equal(effects.safe, true);
  assert.ok(!effects.tags.includes('confirms_harmful_belief'));
  assert.match(runtime.contents.find((content) => content.id === id).editorialExplanation, /não exige transformar toda a identidade/i);
});

test('Melville é bloqueado em raiva intensa e alcançável em moderada sem incentivo à violência', () => {
  const id = 'v2-rai-004-melville';
  assert.ok(isHardExcluded(id, 'raiva', 'moderada', true));
  assert.ok(isHardExcluded(id, 'raiva', 'intensa'));
  assert.ok(isRanked(id, 'raiva', 'moderada'));
  const content = runtime.contents.find((candidate) => candidate.id === id);
  const effects = engine.classifyEditorialEffects(content, { primaryFeeling: 'raiva', intensity: 'moderada' }, { firstResponse: false });
  assert.equal(effects.safe, true);
  assert.ok(!effects.tags.includes('glorifies_harm'));
  assert.match(content.safetyNote || master.contents.find((candidate) => candidate.id === id).safetyNote, /não é modelo de coragem/i);
});

test('Woolf é alcançável em amor moderado posterior sem substituir diálogo', () => {
  const id = 'v2-amo-004-woolf';
  assert.ok(isHardExcluded(id, 'amor', 'moderada', true));
  assert.ok(isRanked(id, 'amor', 'moderada'));
  const content = master.contents.find((candidate) => candidate.id === id);
  assert.match(content.safetyNote, /silêncio substitui diálogo/i);
  assert.match(content.editorialExplanation, /não elimina a importância de construir diálogo/i);
});

test('Proust é alcançável em saudade e bloqueado em luto intenso', () => {
  const id = 'v2-sau-004-proust';
  assert.ok(isHardExcluded(id, 'saudade', 'fraca', true));
  assert.ok(isHardExcluded(id, 'luto', 'intensa'));
  assert.ok(isRanked(id, 'saudade', 'fraca'));
  assert.ok(isRanked(id, 'saudade', 'moderada'));
  const content = master.contents.find((candidate) => candidate.id === id);
  assert.match(content.safetyNote, /idealização ou ruminação/i);
  assert.match(content.editorialExplanation, /não traz literalmente o passado de volta/i);
});

test('runtime final preserva os 51 anteriores e contém somente 57 V2 em 37/20', () => {
  assert.equal(master.contents.length, 408);
  assert.equal(master.contents.filter(({ publicationEnabled }) => publicationEnabled).length, 314);
  assert.equal(runtime.contentVersion, 'definitiva-2.12');
  assert.equal(runtime.contents.length, 57);
  assert.deepEqual([runtime.summary.nucleusTotal, runtime.summary.contextualTotal], [37, 20]);
  assert.ok(runtime.contents.every(({ id }) => id.startsWith('v2-')));
  assert.equal(new Set(runtime.contents.map(({ id }) => id)).size, 57);
});

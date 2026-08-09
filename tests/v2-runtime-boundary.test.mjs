import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const v1 = JSON.parse(fs.readFileSync('curadoria/biblioteca_v1/entre_sabios_acervo_mestre_final_v1.json', 'utf8'));
const master = JSON.parse(fs.readFileSync('entre_sabios_acervo_mestre_final.json', 'utf8'));
const runtime = JSON.parse(fs.readFileSync('data/entre_sabios_runtime.json', 'utf8'));
const approvedBatches = [
  JSON.parse(fs.readFileSync('curadoria/v2/aprovados/lote-v2-001-nucleo-inicial.json', 'utf8')),
  JSON.parse(fs.readFileSync('curadoria/v2/aprovados/lote-v2-002-aprovados.json', 'utf8')),
  JSON.parse(fs.readFileSync('curadoria/v2/aprovados/lote-v2-003a-amor-saudade.json', 'utf8')),
  JSON.parse(fs.readFileSync('curadoria/v2/aprovados/LOTE_V2_003B_ESPERANCA_AUTOCONHECIMENTO.json', 'utf8')),
  JSON.parse(fs.readFileSync('curadoria/v2/aprovados/LOTE_V2_003C_FALTA_DE_PROPOSITO_LUTO.json', 'utf8')),
  JSON.parse(fs.readFileSync('curadoria/v2/aprovados/V2_004A_PACOTE_COMPLETO.json', 'utf8')),
  JSON.parse(fs.readFileSync('curadoria/v2/aprovados/V2_004B_HISTORICOS_APROVADOS.json', 'utf8')),
];
const approvedIds = approvedBatches.flatMap((batch) => batch.contents.map(({ id }) => id)).sort();

test('runtime contém exatamente os 57 IDs V2 aprovados', () => {
  assert.equal(new Set(approvedIds).size, 57);
  assert.deepEqual(runtime.contents.map(({ id }) => id).sort(), approvedIds);
  assert.ok(runtime.contents.every(({ id }) => id.startsWith('v2-')));
});

test('zero registros V1 são elegíveis no runtime', () => {
  const runtimeIds = new Set(runtime.contents.map(({ id }) => id));
  assert.equal(v1.contents.filter(({ id }) => runtimeIds.has(id)).length, 0);
  assert.equal(master.contents.filter((item) => item.publicationEnabled && !item.id.startsWith('v2-')).length, 257);
  assert.ok(master.contents.filter((item) => item.publicationEnabled && !item.id.startsWith('v2-'))
    .every(({ id }) => !runtimeIds.has(id)));
});

test('Biblioteca V1 preserva 351 registros e continua consultável para equivalências', () => {
  assert.equal(v1.contents.length, 351);
  const v1Ids = new Set(v1.contents.map(({ id }) => id));
  const equivalences = master.contents.filter((item) => item.id.startsWith('v2-') && item.duplicateOf);
  assert.deepEqual(equivalences.map(({ id, duplicateOf }) => ({ id, duplicateOf })), [
    { id: 'v2-med-003-epicteto', duplicateOf: 'batch02-quote-038' },
    { id: 'v2-amo-002-gibran', duplicateOf: 'batch04-quote-011' },
    { id: 'v2-esp-003-camus', duplicateOf: 'batch01-quote-031' },
  ]);
  assert.ok(equivalences.every(({ duplicateOf }) => v1Ids.has(duplicateOf)));
});

test('V1 permanece disponível para comparação de cobertura sem virar fallback', () => {
  const v1Feelings = new Set(v1.contents.flatMap((item) => (item.associations || []).map(({ feeling }) => feeling)));
  const v2Feelings = new Set(runtime.contents.flatMap((item) => item.associations.map(({ feeling }) => feeling)));
  assert.ok(v1Feelings.size >= v2Feelings.size);
  assert.equal(runtime.contents.filter(({ primaryFeeling }) => primaryFeeling === 'amor').length, 4);
  assert.equal(runtime.contents.filter(({ primaryFeeling }) => primaryFeeling === 'saudade').length, 4);
  assert.equal(runtime.contents.filter(({ primaryFeeling }) => primaryFeeling === 'esperanca').length, 3);
  assert.equal(runtime.contents.filter(({ primaryFeeling }) => primaryFeeling === 'autoconhecimento').length, 4);
  assert.equal(runtime.contents.filter(({ primaryFeeling }) => primaryFeeling === 'falta_de_proposito').length, 4);
  assert.equal(runtime.contents.filter(({ primaryFeeling }) => primaryFeeling === 'luto').length, 3);
  assert.ok(v1.contents.some((item) => item.associations?.some(({ feeling }) => feeling === 'amor')));
  assert.ok(v1.contents.some((item) => item.associations?.some(({ feeling }) => feeling === 'saudade')));
});

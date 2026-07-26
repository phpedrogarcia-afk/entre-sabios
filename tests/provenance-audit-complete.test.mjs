import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const master = JSON.parse(fs.readFileSync(path.join(rootDir, 'entre_sabios_acervo_mestre_final.json'), 'utf8'));
const audit = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs', 'AUDITORIA_PROVENIENCIA_COMPLETA_2026-07-18.json'), 'utf8'));

test('auditoria de proveniência cobre individualmente os 351 IDs históricos', () => {
  assert.equal(audit.records.length, master.contents.length);
  assert.deepEqual(new Set(audit.records.map((item) => item.id)), new Set(master.contents.map((item) => item.id)));
  for (const item of audit.records) {
    assert.match(item.category, /^[A-J]$/, item.id);
    assert.ok(item.text, item.id);
    assert.ok(item.decision, item.id);
    assert.ok(item.justification, item.id);
    assert.ok(item.sustainingPassage, item.id);
    assert.ok(item.confidence, item.id);
    assert.ok(item.qualityAssessment, item.id);
    assert.ok(item.survivesWithoutName, item.id);
    assert.equal(typeof item.interchangeableAttribution, 'boolean', item.id);
  }
});

test('somente confirmações expressas do editor-chefe recebem fabricação artificial comprovada', () => {
  const categoryI = audit.records.filter((item) => item.category === 'I');
  assert.equal(categoryI.length, 32);
  assert.deepEqual(
    categoryI.filter((item) => !item.id.startsWith('ANT-')).map((item) => item.id).sort(),
    ['ES-INS-VERGONHA-001', 'Reflexão contemporânea-1', 'Reflexão contemporânea-2', 'Reflexão contemporânea-4'].sort(),
  );
  assert.ok(categoryI.every((item) => !item.publicationEnabled));
  assert.equal(audit.records.filter((item) => item.category === 'H').length, 0);
  assert.ok(audit.records.filter((item) => item.artificialEvidence === 'confirmada').every((item) => item.category === 'I'));
});

test('inspirações, adaptações e autoria honesta não são removidas pela peneira de originais artificiais', () => {
  const activeMaster = master.contents.filter((item) => item.publicationEnabled);
  const activeAudit = audit.records.filter((item) => item.publicationEnabled);
  assert.equal(activeAudit.length, activeMaster.length);
  assert.equal(activeAudit.filter((item) => item.attributionType === 'inspired').length, 234);
  assert.equal(activeAudit.filter((item) => item.attributionType === 'paraphrase').length, 3);
  assert.equal(activeAudit.filter((item) => item.attributionType === 'original').length, 1);
  assert.ok(activeAudit.every((item) => !['H', 'I', 'J'].includes(item.category)));
});

test('categoria E possui âncora e categoria G declara a ausência documental', () => {
  const categoryE = audit.records.filter((item) => item.publicationEnabled && item.category === 'E');
  const categoryG = audit.records.filter((item) => item.publicationEnabled && item.category === 'G');
  assert.ok(categoryE.length > 0);
  assert.ok(categoryG.length > 0);
  assert.ok(categoryE.every((item) => item.sustainingPassage !== 'Nenhuma passagem sustentadora individual localizada no acervo ou no histórico Git.'));
  assert.ok(categoryG.filter((item) => item.attributionType === 'inspired').every((item) => item.relationship === 'distante'));
  assert.ok(categoryG.filter((item) => item.attributionType === 'inspired').every((item) => item.interchangeableAttribution));
});

test('os 257 ativos estão distribuídos em 13 lotes rastreáveis', () => {
  const lotDir = path.join(rootDir, 'docs', 'auditoria-proveniencia-lotes');
  const lotFiles = fs.readdirSync(lotDir).filter((name) => /^LOTE-\d+\.md$/.test(name)).sort();
  assert.equal(lotFiles.length, 13);
  const ids = lotFiles.flatMap((name) => [...fs.readFileSync(path.join(lotDir, name), 'utf8').matchAll(/^\| ([^|]+?) \|/gm)]
    .map((match) => match[1].trim())
    .filter((id) => id !== 'ID' && id !== '---'));
  assert.deepEqual(ids, audit.records.filter((item) => item.publicationEnabled).map((item) => item.id));
});

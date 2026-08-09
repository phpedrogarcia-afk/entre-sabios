import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditFourBlockCoverage } from '../scripts/audit-four-block-coverage.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('auditoria cobre todo o runtime sem declarar lacunas como conteúdo concluído', () => {
  const audit = auditFourBlockCoverage({ rootDir });
  assert.equal(audit.total, 57);
  assert.equal(audit.records.length, audit.total);
  assert.equal(new Set(audit.records.map((record) => record.id)).size, audit.total);
  assert.equal(audit.summary.explanationReady + audit.missing.explanation.length, audit.total);
  assert.equal(audit.summary.thinkerProfileReady + audit.missing.thinkerProfile.length, audit.total);
  assert.equal(audit.summary.canonicalQuestion + audit.missing.canonicalQuestion.length, audit.total);
  assert.equal(audit.summary.questionContextReady + audit.missing.questionContext.length, audit.total);
  assert.equal(audit.summary.bookReady + audit.missing.book.length, audit.total);
  assert.ok(audit.summary.structurallyComplete <= Math.min(
    audit.summary.explanationReady,
    audit.summary.thinkerProfileReady,
    audit.summary.questionContextReady,
    audit.summary.bookReady,
  ));
});

test('pergunta canônica exige texto interrogativo, rótulo exato e contexto integral', () => {
  const audit = auditFourBlockCoverage({ rootDir });
  for (const record of audit.records) {
    if (record.questionContextReady) assert.equal(record.canonicalQuestion, true, record.id);
  }
  assert.ok(audit.summary.guidanceExact >= audit.summary.canonicalQuestion);
  assert.ok(audit.summary.canonicalQuestion >= audit.summary.questionContextReady);
});

test('livro só conta como coberto quando todos os contextos avaliados possuem relação substantiva', () => {
  const audit = auditFourBlockCoverage({ rootDir });
  let uncoveredContexts = 0;
  for (const record of audit.records) {
    assert.equal(record.bookReady, record.bookTotalContexts > 0
      && record.bookCoveredContexts === record.bookTotalContexts, record.id);
    assert.equal(
      record.bookCoveredContexts + record.uncoveredBookContexts.length,
      record.bookTotalContexts,
      record.id,
    );
    for (const context of record.uncoveredBookContexts) {
      assert.equal(typeof context.primaryFeeling, 'string', record.id);
      assert.equal(typeof context.intensity, 'string', record.id);
      assert.equal(context.covered, false, record.id);
    }
    uncoveredContexts += record.uncoveredBookContexts.length;
  }
  assert.equal(audit.summary.bookUncoveredContexts, uncoveredContexts);
  assert.equal(audit.summary.bookCoveredContexts + audit.summary.bookUncoveredContexts, audit.summary.bookTotalContexts);
});

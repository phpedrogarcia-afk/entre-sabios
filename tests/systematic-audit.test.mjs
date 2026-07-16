import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadReplayEnvironment } from '../scripts/diagnostic-replay-lib.mjs';
import { buildSystematicAuditConfig, summarizeSystematicAudit } from '../scripts/systematic-audit-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('matriz cobre 14 principais, três intensidades e todos os pares ordenados sem criar tríades', () => {
  const environment = loadReplayEnvironment(rootDir);
  const config = buildSystematicAuditConfig(environment);
  const byKind = config.scenarios.reduce((counts, scenario) => (
    counts.set(scenario.auditKind, (counts.get(scenario.auditKind) || 0) + 1)
  ), new Map());
  assert.equal(config.matrix.feelings, 14);
  assert.equal(config.matrix.intensities, 3);
  assert.equal(config.matrix.triadsCreated, 0);
  assert.equal(byKind.get('primary_alone'), 14 * 3 * 2);
  assert.equal(byKind.get('ordered_pair'), 14 * 13 * 3);
  assert.equal(byKind.get('priority_motivated_pair'), 29 * 3);
  assert.equal(byKind.get('approved_triad'), 1 * 3 * 2);
  assert.equal(byKind.get('principal_inversion_and_return'), 29);
  assert.equal(byKind.get('long_session'), 3);
  assert.equal(byKind.get('forced_fallback'), 14);
});

test('resumo separa problemas objetivos, observações de distribuição e lacunas do acervo', () => {
  const config = {
    matrix: { feelings: 1, intensities: 1, activeDirectionalPairs: 0, activeTriads: 0, triadsCreated: 0 },
    scenarios: [{
      id: 'sample', auditKind: 'ordered_pair', primaryFeeling: 'amor', secondaryFeelings: ['medo'], intensity: 'moderada',
    }],
  };
  const metrics = {
    primaryRetention: 1, secondaryInfluence: 0, secondaryDominanceRisk: 0,
    motivationInfluence: 0, candidateConcentration: 1, candidateConcentrationExcess: 1, authorConcentration: 1,
    conceptConcentration: 1, formatCoverage: 1, fallbackRate: { primary_modifier: 1 },
    firstRepeat: null, coverageBeforeRepeat: 1, allowedDistinct: 2, availableFormatCount: 1,
  };
  const report = summarizeSystematicAudit({
    generatedAt: '2026-07-16T00:00:00.000Z', runtimeContentVersion: 'definitiva-2.1',
    summary: { selectionCount: 3 }, scenarios: [{ id: 'sample', metrics, alerts: [{
      id: 'motivation_without_effect', category: 'RELEVANCE', title: 'Observação', evidence: {}, state: 'detected',
    }] }],
  }, config);
  assert.equal(report.findings.objectiveProblems.length, 0);
  assert.equal(report.findings.diagnosticObservations.length, 1);
  assert.equal(report.findings.secondaryWithoutEffect.length, 1);
  assert.equal(report.findings.genericCombinations.length, 1);
  assert.equal(report.findings.collectionGaps.length, 1);
  assert.equal(report.findings.candidateCountGaps.length, 1);
  assert.equal(report.findings.formatGaps.length, 1);
  assert.equal(report.matrix.triadsCreated, 0);
  assert.doesNotMatch(fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8'), /systematic-audit/);
});

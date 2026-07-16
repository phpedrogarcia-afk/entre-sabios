import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runEmotionalLab } from '../scripts/emotional-lab-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('laboratório exporta métricas estruturadas sem alterar o acervo', () => {
  const masterBefore = fs.readFileSync(path.join(rootDir, 'entre_sabios_acervo_mestre_final.json'));
  const report = runEmotionalLab({
    scenarios: [{
      id: 'contrato',
      primaryFeeling: 'autoconhecimento',
      secondaryFeelings: ['confusao', 'inseguranca'],
      intensity: 'moderada',
      selections: 12,
    }],
  }, { rootDir, generatedAt: '2026-07-16T00:00:00.000Z' });
  const scenario = report.scenarios[0];
  assert.equal(report.schemaVersion, 1);
  assert.equal(report.developmentOnly, true);
  assert.equal(report.runtimeContentVersion, 'definitiva-2.1');
  assert.equal(scenario.selections.length, 12);
  for (const metric of [
    'primaryRetention', 'secondaryInfluence', 'secondaryDominanceRisk', 'synthesisSpecificity',
    'motivationInfluence', 'candidateConcentration', 'coverageBeforeRepeat', 'fallbackRate',
    'authorConcentration', 'conceptConcentration', 'formatCoverage',
  ]) assert.ok(Object.hasOwn(scenario.metrics, metric), metric);
  assert.ok(Object.hasOwn(scenario.metrics, 'candidateConcentrationExcess'));
  assert.equal(scenario.metrics.primaryRetention, 1);
  assert.equal(scenario.metrics.secondaryDominanceRisk, 0);
  assert.ok(scenario.metrics.secondaryInfluence > 0);
  assert.equal(scenario.metrics.firstRepeat, null);
  assert.ok(scenario.selections.every((entry) => entry.chosen.primaryRetained));
  assert.deepEqual(fs.readFileSync(path.join(rootDir, 'entre_sabios_acervo_mestre_final.json')), masterBefore);
});

test('laboratório simula mudança, reload, motivação e fallback sem criar caminho de produção', () => {
  const report = runEmotionalLab({
    scenarios: [{
      id: 'transicoes',
      primaryFeeling: 'luto',
      secondaryFeelings: ['saudade'],
      intensity: 'intensa',
      needsMotivation: false,
      selections: 8,
      activateFallbacks: true,
      changes: [
        { at: 3, needsMotivation: true },
        { at: 5, intensity: 'moderada', reload: true },
        { at: 7, primaryFeeling: 'saudade', secondaryFeelings: ['luto'] },
      ],
    }],
  }, { rootDir, generatedAt: '2026-07-16T00:00:00.000Z' });
  const scenario = report.scenarios[0];
  assert.equal(scenario.selections[2].state.needsMotivation, true);
  assert.equal(scenario.selections[4].state.intensity, 'moderada');
  assert.equal(scenario.selections[6].state.primaryFeeling, 'saudade');
  assert.ok(scenario.selections.every((entry) => [3, 4, 5, null].includes(entry.fallbackLevel)));
  assert.equal(scenario.alerts.some((alert) => alert.id.startsWith('avoidable_repeat')), false);
});

test('laboratório registra alerta objetivo quando um secundário não altera o ranking', () => {
  const report = runEmotionalLab({
    scenarios: [{
      id: 'sem-secundario', primaryFeeling: 'amor', secondaryFeelings: [], intensity: 'moderada', selections: 2,
    }],
  }, { rootDir, generatedAt: '2026-07-16T00:00:00.000Z' });
  assert.equal(report.scenarios[0].alerts.some((alert) => alert.id === 'secondary_without_effect'), false);
  assert.doesNotMatch(
    fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8'),
    /run-emotional-lab|emotional-lab-lib|lab:emotional/,
  );
});

test('uma única escolha não é confundida com concentração de sequência', () => {
  const report = runEmotionalLab({
    scenarios: [{
      id: 'amostra-unica', primaryFeeling: 'autoconhecimento', secondaryFeelings: ['confusao'],
      intensity: 'moderada', selections: 1,
    }],
  }, { rootDir, generatedAt: '2026-07-16T00:00:00.000Z' });
  assert.equal(report.scenarios[0].metrics.allowedDistinct > 1, true);
  assert.equal(report.scenarios[0].alerts.some((alert) => alert.id === 'candidate_set_collapsed'), false);
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  loadReplayEnvironment,
  replayDiagnosticSession,
  validateDiagnosticSession,
} from '../scripts/diagnostic-replay-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixturePath = path.join(rootDir, 'tests', 'fixtures', 'diagnostic-session-minimal.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

test('valida e reproduz uma seleção exportada pelo debug emocional', () => {
  assert.equal(validateDiagnosticSession(fixture), fixture);
  const report = replayDiagnosticSession(fixture, { rootDir });
  assert.equal(report.success, true);
  assert.equal(report.total, 1);
  assert.equal(report.matched, 1);
  assert.equal(report.mismatched, 0);
  assert.equal(report.selections[0].actualId, fixture.selections[0].chosen.id);
  assert.equal(report.selections[0].firstResponse, true);
});

test('replay informa divergência sem alterar o motor ou o arquivo de entrada', () => {
  const changed = structuredClone(fixture);
  changed.selections[0].chosen.id = 'conteudo-inexistente';
  const before = JSON.stringify(changed);
  const report = replayDiagnosticSession(changed, { rootDir });
  assert.equal(report.success, false);
  assert.equal(report.mismatched, 1);
  assert.equal(report.selections[0].actualId, 'Michel de Montaigne-1');
  assert.equal(JSON.stringify(changed), before);
});

test('reproduz uma sequência com histórico, fila remanescente e mudança de direção', () => {
  const environment = loadReplayEnvironment(rootDir);
  const selector = environment.engine.createSelector({
    version: environment.runtime.contentVersion,
    contents: environment.runtime.contents,
    synthesisAdapter: environment.synthesisAdapter,
    motivationAdapter: environment.motivationAdapter,
  });
  const states = [
    { primaryFeeling: 'ansiedade', secondaryFeelings: ['medo'], intensity: 'moderada', needsMotivation: false },
    { primaryFeeling: 'ansiedade', secondaryFeelings: ['medo'], intensity: 'moderada', needsMotivation: false },
    { primaryFeeling: 'ansiedade', secondaryFeelings: ['medo'], intensity: 'moderada', needsMotivation: true },
    { primaryFeeling: 'tristeza', secondaryFeelings: ['solidao'], intensity: 'intensa', needsMotivation: false },
  ];
  const selections = states.map((state, index) => {
    const result = selector.select(state, {
      firstResponse: index === 0 || index === 3,
      diagnostics: true,
      diagnosticContext: { eventTrigger: 'test-sequence', sessionSelectionCounter: index + 1 },
    });
    return result.diagnostics;
  });
  const session = {
    schemaVersion: 1,
    sessionId: 'generated-sequence',
    selections,
  };
  const report = replayDiagnosticSession(session, { rootDir, environment });
  assert.equal(report.success, true);
  assert.equal(report.total, states.length);
  assert.deepEqual(
    report.selections.map(({ expectedId, actualId }) => [expectedId, actualId]),
    report.selections.map(({ expectedId }) => [expectedId, expectedId]),
  );
});

test('rejeita sessão incompatível antes de iniciar o replay', () => {
  assert.throws(
    () => validateDiagnosticSession({ schemaVersion: 2, sessionId: 'future', selections: [] }),
    /schemaVersion incompatível/,
  );
  assert.throws(
    () => validateDiagnosticSession({ schemaVersion: 1, sessionId: 'broken', selections: [{}] }),
    /input está ausente/,
  );
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = {};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(rootDir, 'js', 'core', 'tale-selection-contract.js'), 'utf8'), sandbox);
const selector = sandbox.EntreSabiosTaleSelectionContract;

const tales = [
  { id: 'principal', titulo: 'A', sentimentosRelacionados: ['luto'], temas: ['presenca'], palavrasChave: [] },
  { id: 'secundario', titulo: 'B', sentimentosRelacionados: ['esperanca'], temas: [], palavrasChave: [] },
  { id: 'neutro', titulo: 'C', sentimentosRelacionados: [], temas: [], palavrasChave: [] },
];
const state = {
  feelings: ['luto', 'esperanca'], primaryFeeling: 'luto', secondaryFeelings: ['esperanca'], intensity: 'moderada',
  rootThemeDefinitions: [{ theme: 'presenca' }], secondaryThemes: [], combinationThemes: [],
};

test('conto do sentimento principal permanece acima do secundário', () => {
  assert.equal(selector.scoreTale(tales[0], state), 10);
  assert.equal(selector.scoreTale(tales[1], state), 4);
  assert.equal(selector.selectTale({ tales, state }).tale.id, 'principal');
});
test('rotação por contexto evita repetição recente e preserva histórico limitado', () => {
  const first = selector.selectTale({ tales, state });
  const second = selector.selectTale({ tales, state, ...first.history });
  assert.notEqual(second.tale.id, first.tale.id);
  assert.ok(second.history.recentTaleKeys.length <= 6);
  assert.ok(second.history.viewedTaleKeys.every((key) => key.includes('::')));
});

test('jornada reinicia somente depois de percorrer todo o conjunto', () => {
  const selected = selector.selectTale({ tales, state, sessionViewedIds: tales.map((tale) => tale.id) });
  assert.equal(selected.restartedJourney, true);
  assert.equal(selected.history.sessionViewedIds.length, 1);
});

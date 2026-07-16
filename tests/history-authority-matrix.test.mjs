import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

test('a matriz registra todas as estruturas persistentes relacionadas a conteúdo', () => {
  const matrix = read('MATRIZ_AUTORIDADE_HISTORICOS.md');
  [
    'entreSabiosRecentContent:<versão>',
    'entreSabiosRuntimeQueues:<versão>',
    'entreSabiosRuntimeQueueDirections:<versão>',
    'entreSabiosContextHistory:<versão>',
    'entreSabiosRuntimeQueueMeta:<versão>',
    'caixaSabedoriaHistoricoVisto',
    'caixaSabedoriaConteudosGerados',
    'entreSabiosHistoricoContextual',
    'entreSabiosContosVistos',
    'entreSabiosContosRecentes',
    'caixaSabedoriaFavoritas',
    'caixaSabedoriaPreferencias',
    'entreSabiosSelectionDiagnosticSession:v1',
    'entreSabiosSinaisEditoriais',
  ].forEach((key) => assert.match(matrix, new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
});

test('o histórico runtime recente é a autoridade ativa de antirrepetição', () => {
  const runtime = read('js/core/runtime-engine.js');
  assert.match(runtime, /const recentStorageKey = `entreSabiosRecentContent:\$\{version\}`/);
  assert.match(runtime, /const recentIds = new Set\(recentContents\.map/);
  assert.match(runtime, /const recentTextKeys = new Set\(recentContents\.map/);
  assert.match(runtime, /recentSelections\.push\(/);
  assert.match(runtime, /storage\.setItem\(recentStorageKey/);
  assert.doesNotMatch(runtime, /caixaSabedoriaHistoricoVisto/);
});

test('históricos legados de reflexões permanecem passivos e separados do seletor', () => {
  const script = read('script.js');
  const matching = read('js/core/matching.js');
  assert.match(matching, /const result = runtimeSelector\.select/);
  assert.ok(
    matching.indexOf('const result = runtimeSelector.select') < matching.indexOf('viewedStoryKeys.add'),
    'o registro legado deve ocorrer somente após a escolha runtime',
  );
  assert.match(script, /function loadContextualContentHistory\(/);
  assert.match(script, /function saveContextualContentHistory\(/);
  assert.equal((`${script}\n${matching}`).match(/saveContextualContentHistory\(\)/g)?.length, 1);
});

test('favoritos, avaliações e contos conservam autoridades independentes', () => {
  const favorites = read('js/features/favorites.js');
  const feedback = read('js/features/feedback.js');
  const tales = read('js/features/tales.js');
  assert.match(favorites, /caixaSabedoriaFavoritas/);
  assert.doesNotMatch(favorites, /runtimeSelector\.select|recentSelections/);
  assert.match(feedback, /caixaSabedoriaPreferencias/);
  assert.doesNotMatch(feedback, /preferenceProfile\.authors/);
  assert.match(tales, /viewedTaleKeys/);
  assert.match(tales, /recentTaleKeys/);
  assert.doesNotMatch(tales, /recentSelections|runtimeSelector\.select/);
});


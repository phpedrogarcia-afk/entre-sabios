import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const feelingsScript = fs.readFileSync(path.join(rootDir, 'js', 'ui', 'feelings-ui.js'), 'utf8');
const componentsCss = fs.readFileSync(path.join(rootDir, 'css', 'components.css'), 'utf8');
const responsiveCss = fs.readFileSync(path.join(rootDir, 'css', 'responsive.css'), 'utf8');

test('motivação foi removida da interface e do fluxo ativo', () => {
  assert.doesNotMatch(html, /motivationToggle|Preciso de motivação|motivation-profiles|motivation-ranking-adapter/);
  assert.doesNotMatch(script, /needsMotivation|motivationRankingAdapter|motivationAdapter/);
  assert.doesNotMatch(feelingsScript, /needsMotivation|syncMotivationPreference|initMotivationPreference/);
});

test('estado, listeners e estilos exclusivos do controle foram removidos', () => {
  assert.doesNotMatch(html, /motivation-preference|motivation-toggle|motivation-dot/);
  assert.doesNotMatch(componentsCss + responsiveCss, /motivation-preference|motivation-toggle|motivation-dot/);
  assert.doesNotMatch(script + feelingsScript, /addEventListener\(['"]click['"][\s\S]*needsMotivation/);
});

test('Falta de propósito continua sendo sentimento editorial válido', () => {
  const catalog = fs.readFileSync(path.join(rootDir, 'js', 'data', 'catalogs.js'), 'utf8');
  assert.match(catalog, /id:\s*'falta_de_proposito',\s*label:\s*'Falta de propósito'/);
  assert.doesNotMatch(catalog, /id:\s*'motivacao'/);
});

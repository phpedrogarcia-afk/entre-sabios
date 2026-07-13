import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const landscapeScrollCss = fs.readFileSync(path.join(rootDir, 'css', 'landscape-scroll-fix.css'), 'utf8');

test('HTML carrega runtime e não carrega bancos editoriais legados', () => {
  assert.match(html, /runtime-engine\.js/);
  assert.match(html, /runtime-loader\.js/);
  for (const legacy of ['authors.js', 'quotes/base.js', 'quotes/batch-', 'perspectives.js', 'content-normalizer.js']) {
    assert.ok(!html.includes(legacy), `Script legado ainda carregado: ${legacy}`);
  }
});

test('script principal não referencia bancos editoriais antigos', () => {
  for (const legacy of ['authorsDb', 'authorQuoteVariants', 'authorTextVariants', 'supplementalTextVariants', 'curatedContentDb', 'perspectiveContentDb']) {
    assert.ok(!script.includes(legacy), `Banco legado ainda referenciado: ${legacy}`);
  }
});

test('interface possui estado de carregamento e preferência de gênero', () => {
  assert.match(html, /id="contentLoadStatus"/);
  assert.match(html, /name="genderPreference"/);
  assert.match(html, /id="generateBtn"[^>]*disabled/);
});

test('smartphone horizontal mantém a página principal rolável', () => {
  assert.match(html, /css\/landscape-scroll-fix\.css\?v=/);
  assert.match(landscapeScrollCss, /orientation:\s*landscape/);
  assert.match(landscapeScrollCss, /touch-action:\s*pan-y pinch-zoom/);
  assert.match(landscapeScrollCss, /\.shell\s*\{[\s\S]*?height:\s*auto !important/);
  assert.match(landscapeScrollCss, /\.col-left,[\s\S]*?overflow:\s*visible !important/);
});

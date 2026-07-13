import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const landscapeScrollCss = fs.readFileSync(path.join(rootDir, 'css', 'landscape-scroll-fix.css'), 'utf8');
const tabletCss = fs.readFileSync(path.join(rootDir, 'css', 'tablet.css'), 'utf8');

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

test('modo claro é o padrão e a preferência noturna explícita continua disponível', () => {
  assert.match(html, /initialTheme\s*=\s*theme\s*===\s*'night'\s*\?\s*'night'\s*:\s*'day'/);
  assert.match(html, /colorScheme\s*=\s*initialTheme\s*===\s*'night'\s*\?\s*'dark'\s*:\s*'light'/);
  assert.match(script, /initThemeToggle\(\)/);
});

test('tablet em retrato recebe layout rolável de uma coluna', () => {
  assert.match(html, /css\/tablet\.css\?v=/);
  assert.match(tabletCss, /orientation:\s*portrait/);
  assert.match(tabletCss, /max-width:\s*1100px/);
  assert.match(tabletCss, /grid-template-columns:\s*minmax\(0, 1fr\) !important/);
  assert.match(tabletCss, /overflow-y:\s*visible !important/);
  assert.match(tabletCss, /\.tale-dialog\s*\{[\s\S]*?overflow-y:\s*auto/);
});

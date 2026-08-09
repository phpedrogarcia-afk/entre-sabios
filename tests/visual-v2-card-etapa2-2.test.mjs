import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
const html = read('index.html');
const layoutCss = read('css/layout.css');
const componentsCss = read('css/components.css');
const responsiveCss = read('css/responsive.css');
const tabletCss = read('css/tablet.css');
const landscapeCss = read('css/landscape-scroll-fix.css');
const dailyScript = read('js/ui/daily-ui.js');

const ruleBody = (css, selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] || '';
};

test('os quatro blocos editoriais crescem pelo conteúdo sem corte ou rolagem interna', () => {
  const block = ruleBody(componentsCss, '.block');
  const blockText = ruleBody(componentsCss, '.block-text');
  const smallText = ruleBody(componentsCss, '.block-text.small');
  const philosophyText = ruleBody(componentsCss, '.philosophy-block .block-text');
  const book = ruleBody(componentsCss, '.book-rec');

  for (const body of [block, blockText, book]) {
    assert.match(body, /height:\s*auto/);
    assert.match(body, /max-height:\s*none/);
    assert.match(body, /overflow:\s*visible/);
    assert.doesNotMatch(body, /overflow(?:-y)?:\s*(?:hidden|auto|scroll)/);
  }
  assert.match(smallText, /max-height:\s*none/);
  assert.match(philosophyText, /max-height:\s*none/);
  assert.doesNotMatch(componentsCss, /(?:-webkit-)?line-clamp\s*:/);
  assert.doesNotMatch(blockText, /text-overflow:\s*ellipsis/);
});

test('pais e wrappers preservam fluxo vertical e quebra segura de referências longas', () => {
  for (const [css, selector] of [
    [layoutCss, '.shell'],
    [layoutCss, '.col-center'],
    [componentsCss, '.center-card'],
    [componentsCss, '.quote-stage'],
    [componentsCss, '.quote-content'],
  ]) {
    const body = ruleBody(css, selector);
    assert.match(body, /min-width:\s*0/);
    assert.match(body, /height:\s*auto/);
    assert.match(body, /max-height:\s*none/);
    assert.match(body, /overflow:\s*visible/);
  }
  assert.match(ruleBody(componentsCss, '.block-text'), /overflow-wrap:\s*break-word/);
  assert.match(componentsCss, /#bookReason\s*\{[\s\S]*?overflow-wrap:\s*anywhere/);
  assert.match(responsiveCss, /\.block-text,[\s\S]*?\.book-rec\s*\{\s*max-height:\s*none/);
  assert.match(tabletCss, /\.block-text,[\s\S]*?\.book-rec\s*\{\s*max-height:\s*none/);
  assert.match(landscapeCss, /\.center-card\s*\{[\s\S]*?overflow:\s*visible/);
});

test('IDs editoriais e contrato dinâmico da frase diária permanecem únicos', () => {
  for (const id of [
    'explanationBlock', 'reflectionText', 'philosophyBlock', 'philosophyText',
    'adviceBlock', 'adviceText', 'bookRecommendation', 'bookText', 'bookReason',
    'dailyQuoteText', 'dailyQuoteTextClone',
  ]) {
    assert.equal([...html.matchAll(new RegExp(`id="${id}"`, 'g'))].length, 1, id);
  }
  assert.match(html, /id="dailyQuoteTextClone" aria-hidden="true"/);
  assert.match(dailyScript, /classList\.add\('is-moving'\)/);
  assert.match(dailyScript, /dailyQuoteTextCloneEl\.textContent = ''/);
});

test('ticker usa cópia única, 44 px por segundo e duração sem clamps', () => {
  assert.match(dailyScript, /DAILY_QUOTE_SPEED_PX_PER_SECOND = 44/);
  assert.match(dailyScript, /viewportWidth = Math\.ceil\(viewport\.clientWidth\)/);
  assert.match(dailyScript, /travelDistance = viewportWidth \+ textWidth/);
  assert.match(dailyScript, /duration = travelDistance \/ DAILY_QUOTE_SPEED_PX_PER_SECOND/);
  assert.doesNotMatch(dailyScript, /cloneCopies|COPY_GAP|\.fill\(/);
  assert.doesNotMatch(dailyScript, /duration\s*=\s*Math\.(?:min|max)\(/);
  assert.match(layoutCss, /animation:\s*daily-quote-loop var\(--daily-motion-duration\) linear infinite/);
  assert.doesNotMatch(layoutCss, /alternate|daily-pause-progress/);
  assert.doesNotMatch(layoutCss, /animation-play-state:\s*paused/);
});

test('smartphone mantém ticker contido e reduced motion mostra frase estática e quebrável', () => {
  const smartphone = responsiveCss.match(/@media \(max-width: 520px\) \{([\s\S]*?)\n\}/)?.[1] || '';
  assert.match(smartphone, /\.daily-viewport[\s\S]*?overflow:\s*hidden[\s\S]*?white-space:\s*nowrap/);
  assert.doesNotMatch(smartphone, /\.daily-marquee-track[\s\S]*?animation:\s*none/);
  assert.match(layoutCss, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?white-space:\s*normal/);
  assert.match(layoutCss, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?animation:\s*none[\s\S]*?transform:\s*none/);
});

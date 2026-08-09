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

test('citação, autoria e fonte formam uma única unidade sem IDs duplicados', () => {
  const stage = html.match(/<div class="quote-stage">([\s\S]*?)<\/div>\s*<div class="divider"/)?.[1] || '';
  assert.ok(stage, 'card de citação não encontrado');
  for (const id of ['quoteText', 'quoteAuthor', 'quoteSource']) {
    assert.match(stage, new RegExp(`id="${id}"`));
    assert.equal([...html.matchAll(new RegExp(`id="${id}"`, 'g'))].length, 1, id);
  }
  assert.ok(stage.indexOf('id="quoteText"') < stage.indexOf('id="quoteAuthor"'));
  assert.ok(stage.indexOf('id="quoteAuthor"') < stage.indexOf('id="quoteSource"'));
  assert.match(stage, /id="quoteSource" hidden/);
  for (const actionId of ['quoteShareBtn', 'favoriteBtn', 'likeBtn']) {
    assert.match(stage, new RegExp(`id="${actionId}"`));
  }
  assert.doesNotMatch(stage, /dislikeBtn|quote-dislike/);
});

test('papel e card crescem pelo conteúdo sem rolagem interna da citação', () => {
  const centerCard = componentsCss.match(/\.center-card\s*\{([\s\S]*?)\n\}/)?.[1] || '';
  const quoteStage = componentsCss.match(/\.quote-stage\s*\{([\s\S]*?)\n\}/)?.[1] || '';
  const quote = componentsCss.match(/\.quote\s*\{([\s\S]*?)\n\}/)?.[1] || '';
  assert.match(centerCard, /flex:\s*0 0 auto/);
  assert.match(centerCard, /overflow:\s*visible/);
  assert.match(quoteStage, /flex:\s*0 0 auto/);
  assert.match(quoteStage, /min-height:\s*0/);
  assert.match(quote, /overflow:\s*visible/);
  assert.doesNotMatch(quote, /overflow:\s*auto/);
  assert.match(responsiveCss, /\.quote-stage\s*\{\s*min-height:\s*0/);
  assert.match(tabletCss, /\.quote-stage\s*\{\s*min-height:\s*0/);
  assert.match(landscapeCss, /\.quote-stage\s*\{\s*min-height:\s*0/);
});

test('autoria e fonte continuam independentes e com hierarquia tipográfica', () => {
  assert.match(html, /class="quote-author" id="quoteAuthor"/);
  assert.match(html, /class="quote-author quote-source" id="quoteSource" hidden/);
  assert.match(componentsCss, /\.quote-source\s*\{[\s\S]*?font-size:\s*13px/);
  assert.match(componentsCss, /\.quote-author:empty\s*\{[\s\S]*?display:\s*none/);
  assert.match(componentsCss, /\.quote\.invitation \+ \.quote-author\s*\{[\s\S]*?text-align:\s*center/);
});

test('frase diária usa loop contínuo constante e respeita movimento reduzido', () => {
  assert.match(html, /class="daily-viewport" tabindex="0"/);
  assert.match(html, /class="daily-marquee-track"/);
  assert.match(html, /id="dailyQuoteTextClone" aria-hidden="true"/);
  assert.match(layoutCss, /#dailyQuoteTextClone\s*\{[\s\S]*?display:\s*none/);
  assert.match(dailyScript, /classList\.add\('is-moving'\)/);
  assert.match(dailyScript, /travelDistance = viewportWidth \+ textWidth/);
  assert.match(dailyScript, /DAILY_QUOTE_SPEED_PX_PER_SECOND = 44/);
  assert.match(dailyScript, /dailyQuoteTextCloneEl\.textContent = ''/);
  assert.doesNotMatch(dailyScript, /MIN_DURATION|MAX_DURATION|EDGE_PAUSE/);
  assert.match(layoutCss, /@keyframes daily-quote-loop[\s\S]*?translate3d\(var\(--daily-start-x\), 0, 0\)[\s\S]*?translate3d\(var\(--daily-end-x\), 0, 0\)/);
  assert.match(layoutCss, /animation:\s*daily-quote-loop var\(--daily-motion-duration\) linear infinite/);
  assert.doesNotMatch(layoutCss, /infinite\s+alternate/);
  assert.doesNotMatch(layoutCss, /animation-play-state:\s*paused/);
  assert.match(layoutCss, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.daily-marquee-track[\s\S]*?animation:\s*none/);
  assert.match(layoutCss, /mask-image:\s*linear-gradient/);
});

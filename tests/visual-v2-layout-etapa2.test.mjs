import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
const html = read('index.html');
const baseCss = read('css/base.css');
const layoutCss = read('css/layout.css');
const componentsCss = read('css/components.css');
const responsiveCss = read('css/responsive.css');
const tabletCss = read('css/tablet.css');
const landscapeCss = read('css/landscape-scroll-fix.css');
const dailyScript = read('js/ui/daily-ui.js');
const themeScript = read('js/ui/theme-ui.js');
const script = read('script.js');

test('cabeçalho V2 contém marca, frase diária e ações sem duplicar IDs', () => {
  const header = html.match(/<header class="topbar">([\s\S]*?)<\/header>/)?.[1] || '';
  assert.ok(header, 'cabeçalho principal não encontrado');
  assert.match(header, /class="brand"/);
  assert.match(header, /class="daily-strip"/);
  assert.match(header, /class="live-info"/);
  for (const id of ['dailyQuoteText', 'dailyQuoteTextClone', 'contador-online', 'themeToggleBtn', 'aboutBtn']) {
    assert.equal([...html.matchAll(new RegExp(`id="${id}"`, 'g'))].length, 1, id);
  }
  assert.equal(html.indexOf('class="brand"') < html.indexOf('class="daily-strip"'), true);
  assert.equal(html.indexOf('class="daily-strip"') < html.indexOf('class="live-info"'), true);
});

test('frase do dia permanece dinâmica e o clone legado fica oculto no mesmo componente', () => {
  assert.match(dailyScript, /dailyQuoteTextEl\.textContent = text/);
  assert.match(dailyScript, /dailyQuoteTextCloneEl\.textContent = ''/);
  assert.match(script, /initDailyQuote\(\)/);
  assert.match(html, /class="daily-marquee-track"[\s\S]*?id="dailyQuoteText"[\s\S]*?id="dailyQuoteTextClone" aria-hidden="true"/);
  assert.match(layoutCss, /\.daily-viewport\.is-moving \.daily-marquee-track\s*\{[\s\S]*?animation:\s*daily-quote-loop/);
  assert.match(layoutCss, /#dailyQuoteTextClone\s*\{[\s\S]*?display: none/);
});

test('ações transitórias continuam acessíveis e ligadas aos fluxos existentes', () => {
  assert.match(html, /<a class="explore-card essays-trigger" href="ensaios\/">[\s\S]*?class="explore-card-title">Ensaios<\/span>[\s\S]*?<\/a>/);
  assert.match(html, /id="favoritesBtn"/);
  assert.match(script, /aboutBtn\.addEventListener\('click'/);
  assert.match(script, /backBtn\.addEventListener\('click',\s*goBack\)/);
  assert.match(script, /newBtn\.addEventListener\('click',[\s\S]*?newPhrase\(/);
  assert.match(script, /favoritesBtn\.addEventListener\('click'/);
});

test('grade desktop usa três painéis contínuos próximos de 26 48 26', () => {
  const gridContract = /grid-template-columns:\s*minmax\(250px, 26fr\)\s+minmax\(520px, 48fr\)\s+minmax\(260px, 26fr\)/;
  assert.match(baseCss, gridContract);
  assert.match(layoutCss, gridContract);
  assert.match(layoutCss, /\.col-left\s*\{[\s\S]*?border-right: 1px solid var\(--border-subtle\)/);
  assert.match(layoutCss, /\.col-right\s*\{[\s\S]*?border-left: 1px solid var\(--border-subtle\)/);
  assert.match(componentsCss, /\.share-block\s*\{[\s\S]*?border: 0;[\s\S]*?background: transparent/);
});

test('documento pode crescer e breakpoints preservam uma coluna e rolagem', () => {
  assert.match(baseCss, /body\s*\{[\s\S]*?overflow-x: hidden;[\s\S]*?overflow-y: auto/);
  assert.doesNotMatch(baseCss.match(/body\s*\{([\s\S]*?)\n\}/)?.[1] || '', /overflow:\s*hidden/);
  assert.match(layoutCss, /min-height: calc\(100vh - 106px\)/);
  assert.match(responsiveCss, /grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(tabletCss, /grid-template-columns: minmax\(0, 1fr\) !important/);
  assert.match(landscapeCss, /overflow-y: auto !important/);
  assert.match(landscapeCss, /touch-action: pan-y pinch-zoom !important/);
});

test('claro continua padrão e noite usa a mesma geometria estrutural', () => {
  assert.match(themeScript, /localStorage\.getItem\(THEME_STORAGE_KEY\) === 'night' \? 'night' : 'day'/);
  assert.match(themeScript, /const nextTheme = currentTheme === 'night' \? 'day' : 'night'/);
  const nightShell = layoutCss.match(/html\[data-theme="night"\]\s+\.shell\s*\{([\s\S]*?)\}/)?.[1] || '';
  const nightTopbar = baseCss.match(/html\[data-theme="night"\]\s+\.topbar\s*\{([\s\S]*?)\}/)?.[1] || '';
  assert.doesNotMatch(nightShell, /grid-template-columns|width|height/);
  assert.doesNotMatch(nightTopbar, /grid-template-columns|width|height/);
  assert.doesNotMatch(html, /name="intensity"|motivationToggle|Preciso de motivação/);
});

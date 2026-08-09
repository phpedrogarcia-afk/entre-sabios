import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
const html = read('index.html');
const layoutCss = read('css/layout.css');
const responsiveCss = read('css/responsive.css');
const dailyScript = read('js/ui/daily-ui.js');
const mainScript = read('script.js');
const catalogsScript = read('js/data/catalogs.js');
const runtime = JSON.parse(read('data/entre_sabios_runtime.json'));

test('ícone e contrato do compartilhamento permanecem exatamente preservados', () => {
  assert.match(html, /id="quoteShareBtn" class="quote-action quote-share"[\s\S]*?<path d="M4 16c2\.8-5\.6 7\.3-8\.4 14-8\.4m-4\.2-4\.1L18\.5 7\.6l-4\.7 4\.1"\/>/);
  assert.equal([...html.matchAll(/id="quoteShareBtn"/g)].length, 1);
  assert.match(mainScript, /quoteShareBtn\.addEventListener\('click', \(\) => \{\s*shareReflectionImage\(\{\s*styleKey: getRandomShareStyle\(\),\s*triggerButton: quoteShareBtn/);
  assert.match(mainScript, /async function shareReflectionImage\(\{ styleKey, triggerButton \}\)/);
  assert.match(mainScript, /whatsShareBtn\.addEventListener\('click'[\s\S]*?styleKey: currentShareStyle/);
});

test('DOM expõe uma frase semântica e mantém o clone legado inerte e oculto', () => {
  const viewport = html.match(/<span class="daily-viewport" tabindex="0">([\s\S]*?)<\/span>\s*<\/div>/)?.[1] || '';
  assert.match(viewport, /class="daily-marquee-track"/);
  assert.equal([...html.matchAll(/id="dailyQuoteText"/g)].length, 1);
  assert.equal([...html.matchAll(/id="dailyQuoteTextClone"/g)].length, 1);
  assert.match(viewport, /id="dailyQuoteTextClone" aria-hidden="true"/);
  assert.doesNotMatch(viewport, /<marquee/i);
});

test('loop é linear, contínuo, unidirecional e calculado a 44 px por segundo', () => {
  assert.match(dailyScript, /DAILY_QUOTE_SPEED_PX_PER_SECOND = 44/);
  assert.match(dailyScript, /travelDistance = viewportWidth \+ textWidth/);
  assert.match(dailyScript, /duration = travelDistance \/ DAILY_QUOTE_SPEED_PX_PER_SECOND/);
  assert.match(layoutCss, /animation:\s*daily-quote-loop var\(--daily-motion-duration\) linear infinite/);
  assert.match(layoutCss, /translate3d\(var\(--daily-start-x\), 0, 0\)/);
  assert.match(layoutCss, /translate3d\(var\(--daily-end-x\), 0, 0\)/);
  assert.doesNotMatch(`${dailyScript}\n${layoutCss}`, /alternate|reverse|daily-pause-progress|EDGE_PAUSE|setInterval/);
});

test('movimento usa uma única cópia inclusive em smartphone e reduced motion remove transformação', () => {
  assert.match(layoutCss, /#dailyQuoteTextClone\s*\{\s*display:\s*none/);
  assert.match(layoutCss, /\.daily-viewport\.is-moving #dailyQuoteTextClone\s*\{\s*display:\s*none/);
  assert.match(layoutCss, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?#dailyQuoteTextClone[\s\S]*?display:\s*none/);
  assert.match(layoutCss, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.daily-marquee-track[\s\S]*?animation:\s*none[\s\S]*?transform:\s*none/);
  assert.match(responsiveCss, /@media \(max-width: 520px\)[\s\S]*?\.daily-viewport[\s\S]*?white-space:\s*nowrap/);
  assert.doesNotMatch(responsiveCss, /@media \(max-width: 520px\)[\s\S]*?\.daily-marquee-track[\s\S]*?animation:\s*none/);
});

test('recalcula por tamanho, carregamento de fonte e mudança do texto sem temporizadores concorrentes', () => {
  assert.match(dailyScript, /new ResizeObserver\(scheduleSync\)/);
  assert.match(dailyScript, /dailyQuoteResizeObserver\.observe\(dailyQuoteTextEl\)/);
  assert.match(dailyScript, /document\.fonts\.ready\.then\(scheduleSync\)/);
  assert.match(dailyScript, /dailyQuoteTextCloneEl\.textContent = ''/);
  assert.match(dailyScript, /cancelAnimationFrame\(dailyQuoteSyncFrame\)/);
  assert.doesNotMatch(dailyScript, /MutationObserver|setTimeout|setInterval/);
});

test('catálogo diário combina curadoria e citações curtas aprovadas sem duplicar linhas', () => {
  assert.match(dailyScript, /getDailyQuotePool/);
  assert.match(dailyScript, /content\?\.displayType === 'citacao_curta'/);
  assert.match(dailyScript, /\['exact_quote', 'translated_quote'\]\.includes/);
  assert.match(dailyScript, /DAILY_QUOTE_MAX_LINE_LENGTH = 132/);
  assert.match(dailyScript, /const seen = new Set\(\)/);
  assert.match(mainScript, /runtimeContents = runtime\.contents;\s*initFeelings\(\);\s*initDailyQuote\(\);/);
});

test('pool diário real amplia a variedade com linhas curtas e sem repetições', () => {
  const context = { window: { EntreSabiosData: {} } };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(catalogsScript, context);
  context.dailyQuotes = context.window.EntreSabiosData.dailyQuotes;
  context.runtimeContents = runtime.contents;
  vm.runInContext(dailyScript, context);
  const pool = vm.runInContext('getDailyQuotePool()', context);
  const keys = pool.map(([quote, attribution]) => `${quote.toLocaleLowerCase('pt-BR')}|${attribution.toLocaleLowerCase('pt-BR')}`);
  assert.ok(pool.length > 12, `esperava mais de 12 opções, recebeu ${pool.length}`);
  assert.equal(new Set(keys).size, pool.length);
  assert.ok(pool.every(([quote, attribution]) => quote.length + attribution.length + 7 <= 132));
  assert.ok(pool.every(([quote], index) => quote !== pool[(index + 1) % pool.length][0]));
});

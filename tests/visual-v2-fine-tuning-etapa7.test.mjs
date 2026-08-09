import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const html = read('index.html');
const base = read('css/base.css');
const layout = read('css/layout.css');
const components = read('css/components.css');
const responsive = read('css/responsive.css');
const seo = read('seo.css');
const dailyScript = read('js/ui/daily-ui.js');
const provenance = read('docs/ASSET_PROVENANCE_VISUAL_V2.md');

test('marca usa o corvo fornecido com transparência sem converter o nome do site em imagem', () => {
  const asset = path.join(root, 'assets/brand-raven-transparent-v2.png');
  assert.ok(fs.existsSync(asset));
  assert.ok(fs.statSync(asset).size > 0);
  assert.match(html, /class="brand-raven" src="assets\/brand-raven-transparent-v2\.png" alt=""/);
  assert.doesNotMatch(base, /\.brand-raven\s*\{[\s\S]*?mix-blend-mode/);
  assert.match(html, /class="brand-title">ENTRE SÁBIOS</);
  assert.doesNotMatch(html, /brand-owl/);
  assert.match(provenance, /Corvo V2[\s\S]*?Arquivo enviado diretamente pelo editor/);
});

test('faixa diária ocupa a segunda linha e se move continuamente sem pausa', () => {
  assert.match(base, /\.topbar\s*\{[\s\S]*?grid-template-rows:\s*72px 34px/);
  assert.match(layout, /\.daily-strip\s*\{[\s\S]*?grid-column:\s*1 \/ -1;[\s\S]*?grid-row:\s*2;/);
  assert.match(layout, /\.daily-track\s*\{[\s\S]*?width:\s*100%/);
  assert.match(dailyScript, /travelDistance = viewportWidth \+ textWidth/);
  assert.match(dailyScript, /dailyQuoteTextCloneEl\.textContent = ''/);
  assert.match(dailyScript, /classList\.add\('is-moving'\)/);
  assert.match(dailyScript, /DAILY_QUOTE_SPEED_PX_PER_SECOND = 44/);
  assert.doesNotMatch(layout, /animation-play-state:\s*paused/);
  assert.match(layout, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?animation:\s*none/);
});

test('atmosfera global, vidro, árvore suavizada e aspas mobile ficam protegidos', () => {
  const environment = html.match(/<div class="environment-layer"[\s\S]*?<\/div>\s*<\/div>\s*<main/)?.[0] || '';
  assert.match(environment, /environment-landscape-day/);
  assert.match(environment, /environment-landscape-night/);
  assert.match(environment, /environment-leaf-static leaf-14/);
  assert.doesNotMatch(environment, /environment-leaf-motion/);
  assert.match(environment, /class="fireflies"[\s\S]*?firefly-10/);
  assert.match(base, /--glass-panel:\s*rgba\(7, 29, 26, 0\.22\)/);
  assert.match(base, /--glass-blur:\s*5px/);
  assert.match(base, /background-size:\s*100% 100%, 100% auto/);
  assert.match(base, /\.environment-leaf::before,[\s\S]*?\.environment-leaf::after/);
  assert.match(base, /repeating-linear-gradient/);
  assert.match(base, /\.leaf-12[^\n]*--leaf-size:\s*43px/);
  assert.match(layout, /\.col-left[\s\S]*?backdrop-filter:\s*blur\(var\(--glass-blur\)\)/);
  assert.match(components, /\.environment-tree-day[\s\S]*?opacity:\s*0\.68[\s\S]*?tree-line-art-v2\.webp/);
  assert.match(components, /\.environment-tree-night[\s\S]*?opacity:\s*0\.45[\s\S]*?tree-line-art-v2\.webp/);
  assert.match(components, /\.fireflies[\s\S]*?z-index:\s*2/);
  assert.match(components, /\.firefly-7[^\n]*--firefly-size:\s*6px/);
  assert.match(base, /\.brand\s*\{[\s\S]*?gap:\s*24px/);
  assert.match(base, /\.brand-raven[\s\S]*?translateX\(-12px\)/);
  assert.match(responsive, /\.quote-ornament[\s\S]*?position:\s*static[\s\S]*?height:\s*22px/);
});

test('ações da reflexão possuem trilho estrutural separado do texto', () => {
  assert.match(html, /class="quote-actions"[\s\S]*?id="quoteShareBtn"[\s\S]*?id="favoriteBtn"[\s\S]*?id="likeBtn"[\s\S]*?class="quote-content"/);
  assert.match(components, /\.quote-actions\s*\{[\s\S]*?min-height:\s*54px;[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto auto/);
  assert.match(components, /\.quote-action\s*\{[\s\S]*?position:\s*relative/);
  assert.doesNotMatch(components, /\.quote-action\s*\{[\s\S]{0,160}?position:\s*absolute/);
});

test('sentimentos recuperam densidade e tipografia uniforme', () => {
  assert.match(components, /\.feeling\s*\{[\s\S]*?min-height:\s*48px;[\s\S]*?padding:\s*5px 10px;[\s\S]*?grid-template-columns:\s*20px minmax\(0, 1fr\)/);
  assert.match(components, /\.feeling-icon\s*\{[\s\S]*?width:\s*20px;[\s\S]*?height:\s*20px/);
  assert.match(components, /\.feeling-label\s*\{[\s\S]*?font-size:\s*12px/);
  assert.doesNotMatch(components, /data-feeling-id="(?:autoconhecimento|falta_de_proposito)"/);
  assert.doesNotMatch(responsive, /data-feeling-id="(?:autoconhecimento|falta_de_proposito)"/);
});

test('contraste noturno, CTA dos ensaios e Outra perspectiva usam a hierarquia pedida', () => {
  assert.match(components, /html\[data-theme="night"\] \.section-title,[\s\S]*?html\[data-theme="night"\] \.book-rec-label\s*\{[\s\S]*?color:\s*var\(--night-gold\)/);
  assert.match(components, /#newBtn\s*\{[\s\S]*?background:\s*linear-gradient\(135deg, var\(--accent-primary\), #24786f\)/);
  assert.match(components, /html\[data-theme="night"\] #newBtn\s*\{[\s\S]*?background:\s*linear-gradient\(135deg, var\(--accent-primary\), #2f7467\)/);
  assert.match(seo, /html\[data-theme="night"\] \.essay-page \.seo-cta\s*\{[\s\S]*?rgba\(7, 29, 26, 0\.74\)/);
  assert.match(seo, /html\[data-theme="night"\] \.essay-page \.seo-cta \.seo-button\s*\{[\s\S]*?background:\s*linear-gradient\(135deg, var\(--accent-primary\), #2f7467\)/);
});

test('escala editorial desktop mantém a frase principal como protagonista', () => {
  assert.match(components, /\.block-title\s*\{[\s\S]*?font-size:\s*12\.5px/);
  assert.match(components, /\.block-text\s*\{[\s\S]*?font-size:\s*13\.5px[\s\S]*?line-height:\s*1\.52/);
  assert.match(components, /\.book-rec-label\s*\{[\s\S]*?font-size:\s*12\.5px/);
  assert.match(components, /\.book-rec-title\s*\{[\s\S]*?font-size:\s*16px/);
  assert.match(components, /#adviceText\s*\{[\s\S]*?font-size:\s*15\.5px/);
});

test('lua dourada usa asset transparente na linha principal e não integra a faixa diária', () => {
  const asset = path.join(root, 'assets/moon-night-transparent-v2.png');
  assert.ok(fs.existsSync(asset));
  assert.ok(fs.statSync(asset).size > 0);
  assert.match(html, /class="header-moon"[\s\S]*?src="assets\/moon-night-transparent-v2\.png"/);
  const strip = html.match(/<div class="daily-strip"[\s\S]*?<\/div>\s*<\/div>/)?.[0] || '';
  assert.doesNotMatch(strip, /header-moon/);
});

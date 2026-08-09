import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
const html = read('index.html');
const layout = read('css/layout.css');
const components = read('css/components.css');
const responsive = read('css/responsive.css');
const landscape = read('css/landscape-scroll-fix.css');
const reflectionUi = read('js/ui/reflection-ui.js');

test('desktop largo bloqueia o documento e entrega a rolagem à coluna central inteira', () => {
  assert.match(html, /<section class="col-center" tabindex="0" aria-label="Leitura e reflexão">/);
  assert.match(layout, /@media \(min-width: 1101px\)[\s\S]*?html,[\s\S]*?body[\s\S]*?overflow:\s*hidden/);
  assert.match(layout, /\.shell[\s\S]*?height:\s*calc\(100dvh - 106px\)[\s\S]*?overflow:\s*hidden/);
  assert.match(layout, /\.col-center[\s\S]*?overflow-y:\s*auto[\s\S]*?overscroll-behavior:\s*contain/);
  assert.match(layout, /scrollbar-width:\s*thin/);
  assert.match(layout, /\.col-center:focus-visible[\s\S]*?outline:/);
});

test('topo central permanece na região rolável sem sobrepor o papel e mantém alvo acessível', () => {
  assert.match(responsive, /\.center-top \.ghost[\s\S]*?min-height:\s*44px/);
  assert.doesNotMatch(responsive, /\.center-top\s*\{[\s\S]{0,240}position:\s*sticky/);
});

test('faixas compacta e muito baixa preservam alvos, sentimentos e papel sem cortes', () => {
  assert.match(responsive, /@media \(min-width: 1101px\) and \(min-height: 760px\) and \(max-height: 959px\)/);
  assert.match(responsive, /min-height:\s*48px[\s\S]*?grid-template-columns:\s*20px minmax\(0, 1fr\)/);
  assert.match(responsive, /\.primary[\s\S]*?min-height:\s*48px/);
  assert.match(responsive, /\.quote-content[\s\S]*?padding:\s*32px clamp\(28px, 2\.4vw, 36px\) 30px/);
  assert.match(responsive, /@media \(min-width: 1101px\) and \(max-height: 759px\)/);
  assert.match(responsive, /min-height:\s*48px[\s\S]*?grid-template-columns:\s*20px minmax\(0, 1fr\)/);
  assert.doesNotMatch(components, /\.quote-stage[\s\S]{0,500}overflow(?:-y)?:\s*(?:auto|scroll)/);
});

test('tipo editorial controla microtexto e parágrafos sem tocar no conteúdo canônico', () => {
  assert.match(reflectionUi, /const isLongText = story\.contentType === 'text'/);
  assert.match(reflectionUi, /classList\.toggle\('quote-microtext', isLongText\)/);
  assert.match(reflectionUi, /copy\.split\(\/\\r\?\\n\[ \\t\]\*\\r\?\\n\//);
  assert.match(reflectionUi, /classList\.toggle\('has-paragraphs', paragraphs\.length > 1\)/);
  assert.match(components, /\.quote\.quote-microtext[\s\S]*?font-size:\s*clamp\(21px, 1\.7vw, 25px\)/);
  assert.match(components, /\.quote\.has-paragraphs[\s\S]*?gap:\s*0\.8em/);
  assert.match(responsive, /\.quote\.quote-microtext[\s\S]*?font-size:\s*clamp\(19px, 1\.55vw, 23px\)/);
});

test('mobile, tablet e smartphone horizontal continuam no fluxo do documento', () => {
  assert.match(responsive, /@media \(max-width: 1099px\)[\s\S]*?body[\s\S]*?overflow-y:\s*auto/);
  assert.doesNotMatch(responsive, /@media \(max-width: 900px\), \(max-height: 700px\)/);
  assert.match(landscape, /orientation: landscape\) and \(max-width: 1099px\)/);
  assert.doesNotMatch(landscape, /orientation: landscape\) and \(max-height: 600px\) \{/);
});

test('ações aprovadas da DEC-036 permanecem no papel e sem dislike', () => {
  const stage = html.match(/<div class="quote-stage">([\s\S]*?)<div class="divider"/)?.[1] || '';
  assert.match(stage, /id="quoteShareBtn"[\s\S]*?id="favoriteBtn"[\s\S]*?id="likeBtn"/);
  assert.doesNotMatch(stage, /dislike|thumb|Não gostei/);
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
const html = read('index.html');
const script = read('script.js');
const css = read('css/components.css');
const responsive = read('css/responsive.css');
const landscape = read('css/landscape-scroll-fix.css');

function ruleBody(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] || '';
}

test('card mantém contratos de DOM, ordem editorial e ações da DEC-036', () => {
  const stage = html.match(/<div class="quote-stage">([\s\S]*?)<\/div>\s*<div class="divider"/)?.[1] || '';
  assert.match(stage, /class="quote-actions"[\s\S]*?id="quoteShareBtn"[\s\S]*?id="favoriteBtn"[\s\S]*?id="likeBtn"[\s\S]*?class="quote-content"/);
  assert.match(stage, /class="quote-ornament" aria-hidden="true"/);
  assert.match(stage, /id="quoteText"[\s\S]*?id="quoteAuthor"[\s\S]*?id="quoteSource"/);
  assert.match(stage, /id="quoteAuthor"><\/div>/);
  assert.doesNotMatch(stage, /dislike|thumb|Não gostei/);
  assert.ok(html.indexOf('id="explanationBlock"') < html.indexOf('id="philosophyBlock"'));
  assert.ok(html.indexOf('id="philosophyBlock"') < html.indexOf('id="adviceBlock"'));
  assert.ok(html.indexOf('id="adviceBlock"') < html.indexOf('id="bookRecommendation"'));
});

test('papel editorial usa largura, respiro, borda, raio e crescimento aprovados', () => {
  const card = ruleBody(css, '.center-card');
  const stage = ruleBody(css, '.quote-stage');
  const content = ruleBody(css, '.quote-content');
  assert.match(card, /border-radius:\s*0/);
  assert.match(card, /border:\s*0/);
  assert.match(card, /box-shadow:\s*none/);
  assert.match(card, /overflow:\s*visible/);
  assert.match(stage, /width:\s*100%/);
  assert.match(stage, /border:\s*1px solid/);
  assert.match(stage, /border-radius:\s*14px/);
  assert.match(stage, /height:\s*auto/);
  assert.match(stage, /max-height:\s*none/);
  assert.match(content, /padding:\s*26px clamp\(42px, 3\.6vw, 52px\) 40px/);
});

test('citação, autoria e fonte têm hierarquia legível sem corte', () => {
  const quote = ruleBody(css, '.quote');
  const longQuote = ruleBody(css, '.quote.long-quote');
  const author = ruleBody(css, '.quote-author');
  const source = ruleBody(css, '.quote-source');
  assert.match(quote, /font-size:\s*clamp\(29px, 2\.25vw, 34px\)/);
  assert.match(quote, /font-weight:\s*400/);
  assert.match(quote, /line-height:\s*1\.3/);
  assert.match(quote, /text-align:\s*left/);
  assert.match(quote, /white-space:\s*pre-line/);
  assert.match(quote, /overflow:\s*visible/);
  assert.match(longQuote, /font-size:\s*clamp\(24px, 1\.9vw, 29px\)/);
  assert.match(author, /font-size:\s*16px/);
  assert.match(author, /margin-top:\s*22px/);
  assert.match(source, /font-size:\s*13px/);
  assert.match(source, /overflow-wrap:\s*anywhere/);
  assert.match(css, /\.quote-author:empty \+ \.quote-source:not\(\[hidden\]\)[\s\S]*?margin-top:\s*22px/);
});

test('ações preservam trilho estrutural, alvo de toque, foco e estados ativos', () => {
  const action = ruleBody(css, '.quote-action');
  assert.match(action, /width:\s*44px/);
  assert.match(action, /height:\s*44px/);
  assert.match(action, /position:\s*relative/);
  assert.match(ruleBody(css, '.quote-actions'), /min-height:\s*54px[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto auto/);
  assert.match(ruleBody(css, '.quote-share'), /justify-self:\s*start/);
  assert.match(ruleBody(css, '.quote-favorite'), /justify-self:\s*end/);
  assert.match(ruleBody(css, '.quote-like'), /justify-self:\s*end/);
  assert.match(css, /\.quote-action:focus-visible\s*\{[\s\S]*?outline:\s*none/);
  assert.match(css, /\.quote-action:focus-visible::after\s*\{[\s\S]*?background:\s*currentColor/);
  assert.match(css, /\.quote-action\.active-favorite svg[\s\S]*?fill:/);
  assert.match(css, /\.quote-action\.active-like svg[\s\S]*?fill:/);
});

test('quatro blocos formam fluxo leve, sem caixas ou rolagem interna', () => {
  const block = ruleBody(css, '.block');
  const text = ruleBody(css, '.block-text');
  assert.match(block, /height:\s*auto/);
  assert.match(block, /max-height:\s*none/);
  assert.match(block, /border-radius:\s*0/);
  assert.match(block, /background:\s*transparent/);
  assert.match(block, /overflow:\s*visible/);
  assert.doesNotMatch(block, /box-shadow|overflow(?:-y)?:\s*(?:hidden|auto|scroll)/);
  assert.match(text, /font-size:\s*13\.5px/);
  assert.match(text, /line-height:\s*1\.52/);
  assert.doesNotMatch(css, /(?:-webkit-)?line-clamp\s*:/);
});

test('títulos, pensador, pergunta e livro recebem hierarquia editorial própria', () => {
  assert.match(ruleBody(css, '.block-title'), /font-size:\s*12\.5px[\s\S]*?letter-spacing:\s*0\.06em/);
  assert.match(css, /\.philosophy-block::before[\s\S]*?width:\s*2px/);
  assert.match(ruleBody(css, '#adviceText'), /font-family:\s*var\(--font\)[\s\S]*?font-size:\s*15\.5px[\s\S]*?font-style:\s*italic/);
  assert.match(ruleBody(css, '.book-rec-title'), /font-family:\s*var\(--font\)[\s\S]*?font-size:\s*16px/);
  assert.match(ruleBody(css, '.book-rec-why'), /line-height:\s*1\.5/);
});

test('estado de carregamento reaproveita trava atômica e revela em sequência reduzível', () => {
  assert.match(script, /generateBtn\.setAttribute\('aria-busy', 'true'\)[\s\S]*?centerCardEl\?\.classList\.add\('is-reflection-loading'\)/);
  assert.match(script, /centerCardEl\?\.classList\.remove\('is-reflection-loading'\)[\s\S]*?generateBtn\.disabled/);
  assert.match(css, /\.center-card\.is-reflection-loading \.quote-stage,[\s\S]*?opacity:\s*0\.7[\s\S]*?translateY\(6px\)/);
  assert.match(css, /#philosophyBlock[\s\S]*?transition-delay:\s*120ms/);
  assert.match(css, /#adviceBlock[\s\S]*?transition-delay:\s*170ms/);
  assert.match(css, /#bookRecommendation[\s\S]*?transition-delay:\s*220ms/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?transition:\s*none[\s\S]*?transform:\s*none/);
});

test('desktop compacto, tablet, smartphone e paisagem mantêm escala e fluxo', () => {
  assert.match(responsive, /@media \(min-width: 901px\) and \(max-width: 1400px\)[\s\S]*?padding:\s*16px 20px 24px[\s\S]*?\.quote-stage[\s\S]*?width:\s*100%[\s\S]*?font-size:\s*clamp\(26px, 2\.15vw, 31px\)/);
  assert.match(responsive, /@media \(max-width: 520px\)[\s\S]*?\.center-card[\s\S]*?padding:\s*16px 0 24px[\s\S]*?\.quote-stage[\s\S]*?width:\s*100%/);
  assert.match(responsive, /@media \(max-width: 520px\)[\s\S]*?padding:\s*22px 26px 34px[\s\S]*?font-size:\s*clamp\(21px, 6\.2vw, 25px\)/);
  assert.match(landscape, /\.center-card[\s\S]*?overflow:\s*visible !important/);
});

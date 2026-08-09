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
const tablet = read('css/tablet.css');
const script = read('script.js');
const sharing = read('js/features/sharing.js');
const favorites = read('js/features/favorites.js');

const countId = (id) => (html.match(new RegExp(`id="${id}"`, 'g')) || []).length;

test('Explorar realoca os três destinos existentes sem duplicar IDs ou funções', () => {
  const rightPanel = html.match(/<!-- COLUNA DIREITA -->([\s\S]*?)<\/aside>/)?.[1] || '';
  const centerTop = html.match(/<div class="center-top">([\s\S]*?)<\/div>/)?.[1] || '';
  const header = html.match(/<div class="live-info"[\s\S]*?<\/div>\s*<\/header>/)?.[0] || '';

  assert.match(rightPanel, /id="exploreTitle">EXPLORAR/);
  assert.match(rightPanel, /id="openTaleBtn"[\s\S]*?href="ensaios\/"[\s\S]*?id="favoritesBtn"/);
  assert.match(rightPanel, /id="talesTitle">Contos Filosóficos/);
  assert.match(rightPanel, /Contos Filosóficos[\s\S]*?Ensaios[\s\S]*?Leituras salvas/);
  assert.doesNotMatch(rightPanel, />Ler um conto</);
  assert.doesNotMatch(centerTop, /favoritesBtn|favoritesCount|Leituras salvas/);
  assert.match(centerTop, /id="backBtn"[\s\S]*?id="newBtn"/);
  assert.doesNotMatch(header, /href="ensaios\/"|>Ensaios</);

  for (const id of ['openTaleBtn', 'taleDialog', 'favoritesBtn', 'favoritesDialog', 'favoritesList', 'favoritesCount']) {
    assert.equal(countId(id), 1, `${id} deve permanecer único`);
  }
});

test('Contos, Ensaios e Leituras salvas preservam os contratos funcionais reais', () => {
  assert.match(script, /openTaleBtn\.addEventListener\('click', openPhilosophicalTale\)/);
  assert.match(script, /favoritesBtn\.addEventListener\('click'[\s\S]*?renderFavorites\(\)[\s\S]*?favoritesDialog\.showModal/);
  assert.match(favorites, /localStorage\.getItem\('caixaSabedoriaFavoritas'\)/);
  assert.match(favorites, /localStorage\.setItem\('caixaSabedoriaFavoritas'/);
  assert.match(html, /<a class="explore-card essays-trigger" href="ensaios\/">/);
  assert.match(html, /id="favoritesBtn"[\s\S]*?<span id="favoritesCount">0<\/span>/);
});

test('Compartilhar mantém um único fluxo funcional e plataformas apenas informativas', () => {
  const rightPanel = html.match(/<!-- COLUNA DIREITA -->([\s\S]*?)<\/aside>/)?.[1] || '';
  assert.equal(countId('whatsShareBtn'), 1);
  assert.equal(countId('quoteShareBtn'), 1);
  assert.match(rightPanel, /id="sharePanelTitle">COMPARTILHAR/);
  assert.match(rightPanel, /Leve esta reflexão para alguém\./);
  assert.match(rightPanel, /id="whatsShareBtn"[\s\S]*?>Status \/ Stories</);
  assert.match(rightPanel, /class="share-platform-icons"[\s\S]*?<span title="WhatsApp"[\s\S]*?<span title="Instagram"[\s\S]*?<span title="Facebook"/);
  assert.doesNotMatch(rightPanel, /<(?:button|a)[^>]*(?:Instagram|Facebook)/i);
  assert.match(script, /whatsShareBtn\.addEventListener\('click'[\s\S]*?shareReflectionImage\(/);
  assert.match(script, /navigator\.share\([\s\S]*?files:/);
  assert.match(script, /downloadBlob\(image\.blob, image\.filename\)/);
  assert.match(sharing, /width = 1080, height = 1350/);
});

test('cream, sage e blue preservam seletor, estado e acessibilidade', () => {
  for (const style of ['cream', 'sage', 'blue']) {
    assert.equal((html.match(new RegExp(`data-share-style="${style}"`, 'g')) || []).length, 1);
  }
  assert.match(script, /let currentShareStyle = 'sage'/);
  assert.match(sharing, /button\.setAttribute\('aria-pressed', String\(active\)\)/);
  assert.match(html, /data-share-style="cream"[^>]*aria-label="Estilo creme"[^>]*aria-pressed="false"/);
  assert.match(html, /data-share-style="sage"[^>]*aria-label="Estilo verde-sálvia"[^>]*aria-pressed="true"/);
  assert.match(html, /data-share-style="blue"[^>]*aria-label="Estilo azul"[^>]*aria-pressed="false"/);
  assert.match(components, /\.share-style-option[\s\S]*?width:\s*42px[\s\S]*?border-radius:\s*50%/);
  assert.match(components, /\.share-style-option\.active[\s\S]*?0 0 0 5px/);
});

test('densidade desktop e fluxo responsivo preservam a arquitetura da Etapa 4.1', () => {
  assert.match(layout, /\.col-right\s*\{[\s\S]*?overflow:\s*hidden/);
  assert.match(layout, /\.col-center[\s\S]*?overflow-y:\s*auto/);
  assert.match(components, /\.explore-card[\s\S]*?min-height:\s*96px/);
  assert.match(responsive, /min-height: 760px\) and \(max-height: 959px\)[\s\S]*?\.explore-card[\s\S]*?min-height:\s*80px/);
  assert.match(responsive, /max-height: 759px\)[\s\S]*?\.explore-card[\s\S]*?min-height:\s*70px/);
  assert.match(responsive, /@media \(max-width: 1099px\)[\s\S]*?\.right-ambient-space[\s\S]*?display:\s*none/);
  assert.match(responsive, /@media \(max-width: 520px\)[\s\S]*?\.explore-card[\s\S]*?min-height:\s*76px/);
  assert.match(tablet, /\.center-top #newBtn[\s\S]*?grid-column:\s*auto/);
});

test('DEC-036 continua intacta no cartão central', () => {
  const stage = html.match(/<div class="quote-stage">([\s\S]*?)<div class="divider"/)?.[1] || '';
  assert.match(stage, /id="quoteShareBtn"[\s\S]*?class="quote-action quote-share"/);
  assert.match(stage, /id="favoriteBtn"[\s\S]*?class="quote-action quote-favorite"/);
  assert.match(stage, /id="likeBtn"[\s\S]*?class="quote-action quote-like"/);
  assert.doesNotMatch(stage, /dislike|Não gostei|thumb/i);
});

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
const html = read('index.html');
const base = read('css/base.css');
const layout = read('css/layout.css');
const components = read('css/components.css');
const responsive = read('css/responsive.css');
const modals = read('css/modals.css');
const atmosphereCss = `${base}\n${layout}\n${components}\n${responsive}`;

const rasterContracts = new Map([
  ['assets/environment/landscape-day.webp', { width: 1600, height: 800, maxBytes: 300_000 }],
  ['assets/environment/landscape-night.webp', { width: 1600, height: 800, maxBytes: 300_000 }],
  ['assets/environment/tree-day.webp', { width: 900, height: 847, maxBytes: 300_000 }],
  ['assets/environment/tree-night.webp', { width: 900, height: 849, maxBytes: 300_000 }],
  ['assets/environment/tree-line-art-v2.webp', { width: 900, height: 900, maxBytes: 350_000 }],
]);

function readWebpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP');
  const chunk = buffer.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8X') {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }
  assert.equal(chunk, 'VP8 ');
  assert.equal(buffer.subarray(23, 26).toString('hex'), '9d012a');
  return {
    width: buffer.readUInt16LE(26) & 0x3fff,
    height: buffer.readUInt16LE(28) & 0x3fff,
  };
}

const sha256 = (relativePath) => crypto
  .createHash('sha256')
  .update(fs.readFileSync(path.join(rootDir, relativePath)))
  .digest('hex')
  .toUpperCase();

test('1–3: toda decoração é oculta da acessibilidade, não interativa e não focável', () => {
  for (const className of ['environment-layer', 'environment-overlay-layer', 'header-moon', 'paper-texture', 'right-ambient-space']) {
    assert.match(html, new RegExp(`class="${className}" aria-hidden="true"`));
  }
  assert.match(atmosphereCss, /\.environment-layer,[\s\S]*?\.environment-overlay-layer[\s\S]*?pointer-events:\s*none[\s\S]*?user-select:\s*none/);
  assert.match(atmosphereCss, /\.right-ambient-space[\s\S]*?pointer-events:\s*none[\s\S]*?user-select:\s*none/);
  assert.doesNotMatch(html.match(/<div class="environment-layer"[\s\S]*?<\/div>/)?.[0] || '', /button|href=|tabindex=/);
  assert.doesNotMatch(html.match(/<div class="right-ambient-space"[\s\S]*?<\/div>\s*<\/aside>/)?.[0] || '', /button|href=|tabindex=/);
});

test('4–7 e 21: árvores, lua e vagalumes respeitam exclusivamente day/night', () => {
  assert.match(components, /\.environment-tree-day[\s\S]*?display:\s*block[\s\S]*?tree-line-art-v2\.webp/);
  assert.match(components, /\.environment-tree-night[\s\S]*?display:\s*none[\s\S]*?tree-line-art-v2\.webp/);
  assert.match(components, /html\[data-theme="night"\] \.environment-tree-day[\s\S]*?display:\s*none/);
  assert.match(components, /html\[data-theme="night"\] \.environment-tree-night[\s\S]*?display:\s*block/);
  assert.match(base, /\.header-moon[\s\S]*?display:\s*none/);
  assert.match(base, /html\[data-theme="night"\] \.header-moon\s*\{[\s\S]*?display:\s*grid/);
  assert.match(components, /\.fireflies[\s\S]*?display:\s*none/);
  assert.match(components, /html\[data-theme="night"\] \.fireflies[\s\S]*?display:\s*block/);
  assert.match(base, /\.environment-landscape-day[\s\S]*?landscape-day\.webp/);
  assert.match(base, /\.environment-landscape-night[\s\S]*?landscape-night\.webp/);
  assert.match(base, /html\[data-theme="night"\] \.environment-landscape-day[\s\S]*?display:\s*none/);
  assert.match(base, /html\[data-theme="night"\] \.environment-landscape-night[\s\S]*?display:\s*block/);
  assert.doesNotMatch(components, /\.center-card[\s\S]{0,420}?landscape-(?:day|night)\.webp/);
  assert.doesNotMatch(atmosphereCss, /filter:\s*invert\(/);
});

test('8: folhas são estáticas e reduced motion interrompe vagalumes e ticker', () => {
  assert.equal((html.match(/environment-leaf environment-leaf-static/g) || []).length, 14);
  assert.doesNotMatch(`${html}\n${base}`, /environment-leaf-motion|ambient-leaf-drift/);
  assert.match(components, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.firefly[\s\S]*?animation:\s*none/);
  assert.match(layout, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.daily-marquee-track[\s\S]*?animation:\s*none/);
});

test('9–11: decoração fica fora de controles/texto e dialogs permanecem no plano superior', () => {
  assert.match(base, /\.environment-layer\s*\{[\s\S]*?z-index:\s*0/);
  assert.match(base, /\.environment-overlay-layer\s*\{[\s\S]*?z-index:\s*auto/);
  assert.match(base, /\.environment-landscape[\s\S]*?z-index:\s*0/);
  assert.match(base, /\.environment-leaf[\s\S]*?z-index:\s*0/);
  assert.match(base, /\.topbar,\s*\.shell[\s\S]*?z-index:\s*1/);
  assert.match(base, /\.topbar[\s\S]*?z-index:\s*10/);
  assert.match(components, /\.center-card > :not\(\.paper-texture\)[\s\S]*?z-index:\s*1/);
  assert.match(components, /\.right-ambient-space[\s\S]*?overflow:\s*hidden/);
  assert.match(html, /<div class="right-panel-content">[\s\S]*?<div class="right-ambient-space" aria-hidden="true">/);
  assert.match(modals, /\.favorites-dialog::backdrop/);
  assert.match(modals, /\.tale-dialog\[open\]/);
});

test('12–17: overflow, rolagem e geometria funcional permanecem nos contratos V2', () => {
  assert.match(base, /body[\s\S]*?overflow-x:\s*hidden/);
  assert.match(layout, /@media \(min-width: 1101px\)[\s\S]*?\.col-right[\s\S]*?overflow-x:\s*hidden[\s\S]*?overflow-y:\s*auto/);
  assert.match(layout, /@media \(min-width: 1101px\)[\s\S]*?\.col-center[\s\S]*?overflow-y:\s*auto/);
  assert.match(layout, /@media \(min-width: 1101px\)[\s\S]*?html,\s*body[\s\S]*?overflow:\s*hidden/);
  assert.match(responsive, /@media \(max-width: 1099px\)[\s\S]*?body[\s\S]*?overflow-y:\s*auto/);
  assert.match(responsive, /@media \(max-width: 1099px\)[\s\S]*?\.right-ambient-space[\s\S]*?display:\s*none/);
  assert.match(atmosphereCss, /\.environment-tree[\s\S]*?position:\s*absolute/);
  assert.match(atmosphereCss, /\.header-moon[\s\S]*?position:\s*absolute/);
  assert.match(atmosphereCss, /\.paper-texture[\s\S]*?position:\s*absolute/);
});

test('18–20: caminhos, formato, dimensões e orçamento dos raster são válidos', () => {
  let total = 0;
  for (const [relativePath, contract] of rasterContracts) {
    const absolutePath = path.join(rootDir, relativePath);
    assert.equal(fs.existsSync(absolutePath), true, `${relativePath} deve existir`);
    const buffer = fs.readFileSync(absolutePath);
    const dimensions = readWebpDimensions(buffer);
    assert.deepEqual(dimensions, { width: contract.width, height: contract.height });
    assert.ok(buffer.byteLength < contract.maxBytes, `${relativePath} excedeu 300 KB`);
    total += buffer.byteLength;
  }
  assert.ok(total < 1_500_000, 'conjunto ambiental deve ficar abaixo de 1,5 MB');
  for (const asset of ['landscape-day.webp', 'landscape-night.webp', 'tree-line-art-v2.webp']) {
    assert.match(atmosphereCss, new RegExp(asset.replace('.', '\\.')));
  }
});

test('22–23: foco, teclado e funções críticas continuam presentes', () => {
  for (const id of ['themeToggleBtn', 'generateBtn', 'quoteShareBtn', 'favoriteBtn', 'likeBtn', 'openTaleBtn', 'favoritesBtn', 'whatsShareBtn']) {
    assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, `${id} deve permanecer único`);
  }
  assert.match(base, /\.theme-toggle:focus-visible/);
  assert.match(components, /\.quote-action:focus-visible/);
  assert.match(components, /\.explore-card:hover,\s*\.explore-card:focus-visible/);
  assert.match(html, /localStorage\.getItem\('entreSabiosTheme'\)/);
});

test('24: hashes protegidos de conteúdo, runtime, core, livros e contos não mudaram', () => {
  const protectedHashes = {
    'entre_sabios_acervo_mestre_final.json': '9BD7E418ABF7B96C2B74FABC3844333BD54571C6A592EF85FA514953EDC61A16',
    'data/entre_sabios_runtime.json': 'A5B310F3FC84650E5C17A63ADC1B108FB61327DC755B59B1F631EC2EA01C1151',
    'data/entre_sabios_runtime.js': '8A5815D6E7BDFE8D3C4DA31C1B7DE295CE59AAFED793C9982343D1A6E7291C21',
    'js/core/runtime-engine.js': '20C8F6DBD39D9F218BBBE1AA30FB42CDE7959328C217008487AA122A861E50A5',
    'js/core/matching.js': 'C68A7D9BDDEDF6C9855B23B931DA204E10806365E59BE5A82C52F21F8F1690A0',
    'js/core/emotional-selection-contract.js': '7B066DE0A716504730A2BB9357F07D967BB5052C17107C362E69A93CBB5FD12D',
    'js/core/emotional-state.js': '066734D7391472385FD45788B3FCB55D89FCB75D1CDE4D3F6C69A729C3BC3578',
    'js/core/tale-selection-contract.js': '0823C8686F15CD89C049A2FE8EC47F9DDAF71DD7BF16A488A629845C12D8FF49',
    'js/core/book-matching.js': '29D2D9F1B5F4C7442116C6A6645F33F4552E9FD1D337FDDE55AFAC033CB5185C',
    'js/data/books.js': 'BD0287222903AC7481E8732E3777741EC725BA849BBAB5B38C2D33A0042309F5',
    'js/data/tales.js': '05B38F765417C5E3A7B8FDF9EF52FA975D8DA1020E9BA549EFE019DBFE79F38E',
    'js/features/tales.js': '39916FCFF864A9D570C84500C3B4875BF076DF98E8B5052505A73F5D2D706ADD',
  };
  for (const [relativePath, expectedHash] of Object.entries(protectedHashes)) {
    assert.equal(sha256(relativePath), expectedHash, relativePath);
  }
});

test('proveniência não promove assets legados de origem desconhecida', () => {
  const provenance = read('docs/ASSET_PROVENANCE_VISUAL_V2.md');
  assert.match(provenance, /Total integrado: \*\*561\.302 bytes\*\*/);
  assert.match(provenance, /brand-icon\.jpg[\s\S]*?Provisório/);
  assert.match(provenance, /falling-leaves\.png[\s\S]*?Provisório/);
  assert.match(provenance, /quote-landscape\.png[\s\S]*?Provisório/);
  assert.match(provenance, /capturas visuais canônicas[\s\S]*?não foram[\s\S]*?recortadas/);
});

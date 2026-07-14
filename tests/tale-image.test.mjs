import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const talesSource = fs.readFileSync(path.join(rootDir, 'js', 'data', 'tales.js'), 'utf8');
const talesFeature = fs.readFileSync(path.join(rootDir, 'js', 'features', 'tales.js'), 'utf8');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const modalCss = fs.readFileSync(path.join(rootDir, 'css', 'modals.css'), 'utf8');
const staticTaleHtml = fs.readFileSync(path.join(rootDir, 'contos', 'mito-da-caverna', 'index.html'), 'utf8');
const sitemap = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8');
const sandbox = {};
vm.runInNewContext(talesSource, sandbox);
const tales = sandbox.EntreSabiosData.philosophicalTales;

test('somente o conto-piloto da caverna possui imagem', () => {
  const illustrated = tales.filter((tale) => tale.imagem);
  assert.equal(illustrated.length, 1);
  assert.equal(illustrated[0].id, 'mito-da-caverna');
  assert.deepEqual(
    [illustrated[0].imagem.width, illustrated[0].imagem.height],
    [1536, 864],
  );
  assert.ok(illustrated[0].imagem.alt.length >= 40);
});

test('imagem-piloto é WebP leve e está dentro do projeto', () => {
  const imagePath = path.join(rootDir, tales.find((tale) => tale.id === 'mito-da-caverna').imagem.src);
  const image = fs.readFileSync(imagePath);
  assert.equal(image.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(image.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(image.byteLength < 200 * 1024, `Imagem excedeu 200 KB: ${image.byteLength} bytes`);
});

test('modal aplica imagem responsiva, acessível e preguiçosa com fallback oculto', () => {
  assert.match(html, /id="taleImage"[^>]*width="1536"[^>]*height="864"[^>]*loading="lazy"[^>]*decoding="async"/);
  assert.match(talesFeature, /taleImageFrameEl\.hidden\s*=\s*false/);
  assert.match(talesFeature, /taleImageFrameEl\.hidden\s*=\s*true/);
  assert.match(talesFeature, /taleImageEl\.removeAttribute\('src'\)/);
  assert.match(modalCss, /\.tale-image-frame\s*\{[\s\S]*?width:\s*min\(100%,\s*520px\)[\s\S]*?aspect-ratio:\s*16\s*\/\s*9/);
  assert.match(modalCss, /\.tale-image\s*\{[\s\S]*?object-fit:\s*cover/);
});

test('página canônica e sitemap usam somente a imagem-piloto', () => {
  const absoluteImageUrl = 'https://entresabios.com/assets/contos/alegoria-da-caverna-piloto.webp';
  assert.match(staticTaleHtml, /<figure class="seo-tale-image">[\s\S]*?<img[^>]*loading="lazy"[^>]*decoding="async"/);
  assert.match(staticTaleHtml, new RegExp(`<meta property="og:image" content="${absoluteImageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  const articleSchema = [...staticTaleHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]))
    .find((schema) => schema['@type'] === 'Article');
  assert.equal(articleSchema.image, absoluteImageUrl);
  assert.equal([...sitemap.matchAll(/<image:image>/g)].length, 1);
  assert.ok(sitemap.includes(`<image:loc>${absoluteImageUrl}</image:loc>`));
});

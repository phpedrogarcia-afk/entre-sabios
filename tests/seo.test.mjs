import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://entresabios.com';

function collectIndexFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectIndexFiles(fullPath);
    return entry.isFile() && entry.name === 'index.html' ? [fullPath] : [];
  });
}

const internalFiles = ['contos', 'ensaios', 'pensadores', 'sentimentos']
  .flatMap((section) => collectIndexFiles(path.join(rootDir, section)));
const htmlFiles = [path.join(rootDir, 'index.html'), ...internalFiles];

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function matchValue(html, expression, label, filePath) {
  const value = html.match(expression)?.[1];
  assert.ok(value, `${label} ausente em ${path.relative(rootDir, filePath)}`);
  return value;
}

function schemasFrom(html, filePath) {
  return [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((match) => {
    assert.doesNotThrow(() => JSON.parse(match[1]), `JSON-LD inválido em ${path.relative(rootDir, filePath)}`);
    return JSON.parse(match[1]);
  });
}

test('77 páginas possuem metadados canônicos coerentes no host sem www', () => {
  assert.equal(htmlFiles.length, 77);
  const canonicals = htmlFiles.map((filePath) => {
    const html = read(filePath);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /<meta\s+name="description"\s+content="[^"]+"/);
    const canonical = matchValue(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i, 'Canonical', filePath);
    const ogUrl = matchValue(html, /<meta\s+property="og:url"\s+content="([^"]+)"/i, 'og:url', filePath);
    assert.equal(ogUrl, canonical, `og:url diferente do canonical em ${path.relative(rootDir, filePath)}`);
    assert.ok(canonical.startsWith(`${origin}/`), `Host canônico incorreto: ${canonical}`);
    assert.ok(!html.includes('https://www.entresabios.com'), `Host www remanescente em ${path.relative(rootDir, filePath)}`);
    return canonical;
  });
  assert.equal(new Set(canonicals).size, htmlFiles.length);
});

test('páginas internas possuem breadcrumb visual e BreadcrumbList equivalente', () => {
  for (const filePath of internalFiles) {
    const html = read(filePath);
    assert.match(html, /<nav class="seo-breadcrumb" aria-label="Navegação estrutural">/);
    assert.match(html, /aria-current="page"/);
    const schemas = schemasFrom(html, filePath);
    const breadcrumbs = schemas.filter((schema) => schema['@type'] === 'BreadcrumbList');
    assert.equal(breadcrumbs.length, 1, `BreadcrumbList ausente ou duplicado em ${path.relative(rootDir, filePath)}`);
    const items = breadcrumbs[0].itemListElement;
    assert.ok(items.length >= 2);
    items.forEach((item, index) => {
      assert.equal(item['@type'], 'ListItem');
      assert.equal(item.position, index + 1);
      assert.ok(item.name);
      assert.ok(item.item.startsWith(`${origin}/`));
    });
    const canonical = matchValue(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i, 'Canonical', filePath);
    assert.equal(items.at(-1).item, canonical);
  }
  const homeSchemas = schemasFrom(read(path.join(rootDir, 'index.html')), path.join(rootDir, 'index.html'));
  assert.equal(homeSchemas.filter((schema) => schema['@type'] === 'BreadcrumbList').length, 0);
});

test('sitemap contém somente as 77 URLs canônicas e campos permitidos', () => {
  const sitemap = read(path.join(rootDir, 'sitemap.xml'));
  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.doesNotMatch(sitemap, /<priority>|<changefreq>/);
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const canonicalUrls = htmlFiles.map((filePath) => matchValue(
    read(filePath),
    /<link\s+rel="canonical"\s+href="([^"]+)"/i,
    'Canonical',
    filePath,
  ));
  assert.equal(sitemapUrls.length, 77);
  assert.deepEqual(new Set(sitemapUrls), new Set(canonicalUrls));
  const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
  assert.ok(lastmods.every((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)));
  assert.deepEqual(new Set(lastmods), new Set(['2026-07-13', '2026-07-14']));
  assert.match(sitemap, /xmlns:image="http:\/\/www\.google\.com\/schemas\/sitemap-image\/1\.1"/);
  assert.equal([...sitemap.matchAll(/<image:image>/g)].length, 1);
  assert.match(sitemap, /<image:loc>https:\/\/entresabios\.com\/assets\/contos\/alegoria-da-caverna-piloto\.webp<\/image:loc>/);
  assert.match(read(path.join(rootDir, 'robots.txt')), /Sitemap:\s+https:\/\/entresabios\.com\/sitemap\.xml/);
  const htaccess = read(path.join(rootDir, '.htaccess'));
  assert.match(htaccess, /AddType image\/svg\+xml \.svg \.svgz/);
  assert.match(htaccess, /RewriteCond %\{HTTP_HOST\} \^www\\\.entresabios\\\.com\$/);
  assert.match(htaccess, /RewriteRule \^ https:\/\/entresabios\.com%\{REQUEST_URI\} \[R=301,L,NE\]/);
});

test('referências internas de href e src apontam para arquivos ou âncoras existentes', () => {
  const failures = [];
  for (const filePath of htmlFiles) {
    const html = read(filePath);
    const references = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
    for (const reference of references) {
      if (/^(?:https?:|data:|mailto:|tel:|javascript:)/i.test(reference)) continue;
      const [relativeReference, fragment = ''] = reference.split('#', 2);
      const cleanReference = relativeReference.split('?')[0];
      let targetPath = cleanReference
        ? cleanReference.startsWith('/')
          ? path.resolve(rootDir, cleanReference.slice(1))
          : path.resolve(path.dirname(filePath), cleanReference)
        : filePath;
      if (cleanReference.endsWith('/') || (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory())) {
        targetPath = path.join(targetPath, 'index.html');
      }
      if (!fs.existsSync(targetPath)) {
        failures.push(`${path.relative(rootDir, filePath)} -> ${reference}`);
        continue;
      }
      if (fragment && path.extname(targetPath).toLowerCase() === '.html') {
        const targetHtml = read(targetPath);
        const escapedFragment = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (!new RegExp(`\\bid="${escapedFragment}"`).test(targetHtml)) {
          failures.push(`${path.relative(rootDir, filePath)} -> âncora ${reference}`);
        }
      }
    }
  }
  assert.deepEqual(failures, []);
});

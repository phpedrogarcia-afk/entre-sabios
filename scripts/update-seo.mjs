import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonicalOrigin = 'https://entresabios.com';
const lastRelevantChange = '2026-07-13';
const caveTaleUrl = `${canonicalOrigin}/contos/mito-da-caverna/`;
const caveImageUrl = `${canonicalOrigin}/assets/contos/alegoria-da-caverna-piloto.webp`;
const sectionNames = ['contos', 'ensaios', 'pensadores', 'sentimentos'];

function collectIndexFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectIndexFiles(fullPath);
    return entry.isFile() && entry.name === 'index.html' ? [fullPath] : [];
  });
}

function decodeHtmlText(value) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCanonical(html, relativePath) {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if (!match) throw new Error(`Canonical ausente em ${relativePath}`);
  return match[1];
}

function getPageTitle(html, relativePath) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!match) throw new Error(`H1 ausente em ${relativePath}`);
  return { html: match[1].trim(), text: decodeHtmlText(match[1]) };
}

function getBreadcrumbs(relativePath, pageTitle, canonical) {
  const normalizedPath = relativePath.replace(/\\/g, '/');
  const home = { name: 'Início', item: `${canonicalOrigin}/`, href: normalizedPath === 'ensaios/index.html' ? '../' : '../../' };
  const current = { name: pageTitle.text, item: canonical, current: true };

  if (normalizedPath === 'ensaios/index.html') {
    return [home, { name: 'Ensaios', item: `${canonicalOrigin}/ensaios/`, current: true }];
  }
  if (normalizedPath.startsWith('ensaios/')) {
    return [home, { name: 'Ensaios', item: `${canonicalOrigin}/ensaios/`, href: '../' }, current];
  }
  if (normalizedPath.startsWith('contos/')) {
    return [home, { name: 'Contos', item: `${canonicalOrigin}/#talesTitle`, href: '../../#talesTitle' }, current];
  }
  if (normalizedPath.startsWith('sentimentos/')) {
    return [home, { name: 'Sentimentos', item: `${canonicalOrigin}/#feelingsGrid`, href: '../../#feelingsGrid' }, current];
  }
  return [home, current];
}

function renderVisualBreadcrumb(items, pageTitle) {
  return items.map((item, index) => {
    const separator = index ? ' <span aria-hidden="true">/</span> ' : '';
    if (item.href) return `${separator}<a href="${item.href}">${item.name}</a>`;
    const label = item.current && index === items.length - 1 ? pageTitle.html : item.name;
    return `${separator}<span aria-current="page">${label}</span>`;
  }).join('');
}

function renderBreadcrumbSchema(items) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  });
}

const internalFiles = sectionNames.flatMap((section) => collectIndexFiles(path.join(rootDir, section)));
const htmlFiles = [path.join(rootDir, 'index.html'), ...internalFiles];
const canonicalUrls = [];

for (const filePath of htmlFiles) {
  const relativePath = path.relative(rootDir, filePath);
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replaceAll('https://www.entresabios.com', canonicalOrigin);

  if (relativePath !== 'index.html') {
    html = html.replace(/seo\.css\?v=[^"']+/g, 'seo.css?v=20260714-1');
    html = html.replace(/\s*<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi, (scriptTag, body) => (
      /"@type"\s*:\s*"BreadcrumbList"/.test(body) ? '' : scriptTag
    ));
    const canonical = getCanonical(html, relativePath);
    const pageTitle = getPageTitle(html, relativePath);
    const breadcrumbs = getBreadcrumbs(relativePath, pageTitle, canonical);
    const visual = `<nav class="seo-breadcrumb" aria-label="Navegação estrutural">${renderVisualBreadcrumb(breadcrumbs, pageTitle)}</nav>`;
    if (!/<nav class="seo-breadcrumb"[\s\S]*?<\/nav>/i.test(html)) throw new Error(`Breadcrumb visual ausente em ${relativePath}`);
    html = html.replace(/<nav class="seo-breadcrumb"[\s\S]*?<\/nav>/i, visual);
    const schema = `  <script type="application/ld+json">${renderBreadcrumbSchema(breadcrumbs)}</script>\n`;
    html = html.replace('</head>', `${schema}</head>`);
  }

  canonicalUrls.push(getCanonical(html, relativePath));
  fs.writeFileSync(filePath, html, 'utf8');
}

const uniqueCanonicalUrls = [...new Set(canonicalUrls)];
if (uniqueCanonicalUrls.length !== htmlFiles.length) throw new Error('Há URLs canônicas ausentes ou duplicadas.');

const orderedUrls = uniqueCanonicalUrls.sort((a, b) => {
  if (a === `${canonicalOrigin}/`) return -1;
  if (b === `${canonicalOrigin}/`) return 1;
  return a.localeCompare(b, 'pt-BR');
});
const sitemapEntries = orderedUrls.map((url) => {
  const lines = [
    '  <url>',
    `    <loc>${url}</loc>`,
    `    <lastmod>${url === caveTaleUrl ? '2026-07-14' : lastRelevantChange}</lastmod>`,
  ];
  if (url === caveTaleUrl) {
    lines.push('    <image:image>');
    lines.push(`      <image:loc>${caveImageUrl}</image:loc>`);
    lines.push('      <image:caption>Ilustração editorial da Alegoria da Caverna de Platão.</image:caption>');
    lines.push('    </image:image>');
  }
  lines.push('  </url>');
  return lines.join('\n');
}).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${sitemapEntries}\n</urlset>\n`;
fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), sitemap, 'utf8');
fs.writeFileSync(path.join(rootDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${canonicalOrigin}/sitemap.xml\n`, 'utf8');

console.info(`SEO atualizado: ${htmlFiles.length} páginas e ${orderedUrls.length} URLs canônicas.`);

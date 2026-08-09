import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonicalOrigin = 'https://entresabios.com';
const organizationId = `${canonicalOrigin}/#organization`;
const websiteId = `${canonicalOrigin}/#website`;
const brandIconUrl = `${canonicalOrigin}/assets/brand-icon.jpg`;
const caveTaleUrl = `${canonicalOrigin}/contos/mito-da-caverna/`;
const caveImageUrl = `${canonicalOrigin}/assets/contos/alegoria-da-caverna-piloto.webp`;
const sectionNames = ['contos', 'ensaios', 'pensadores', 'sentimentos', 'sobre'];
const today = new Date().toISOString().slice(0, 10);
const cssVersion = '20260809-seo-library-1';
const seoCssVersion = '20260809-transparency-1';
const retrySignal = new Int32Array(new SharedArrayBuffer(4));

function writeFileWithRetry(filePath, content) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return;
    } catch (error) {
      if (!['EBUSY', 'EPERM', 'UNKNOWN'].includes(error.code) || attempt === 4) throw error;
      Atomics.wait(retrySignal, 0, 0, 80 * (attempt + 1));
    }
  }
}

function writeFileIfChanged(filePath, content) {
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8') === content) return false;
  writeFileWithRetry(filePath, content);
  return true;
}

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

function relativePrefix(relativePath) {
  const directory = path.posix.dirname(relativePath.replace(/\\/g, '/'));
  if (directory === '.') return '';
  return '../'.repeat(directory.split('/').length);
}

function getBreadcrumbs(relativePath, pageTitle, canonical) {
  const normalizedPath = relativePath.replace(/\\/g, '/');
  const prefix = relativePrefix(normalizedPath);
  const home = { name: 'Início', item: `${canonicalOrigin}/`, href: prefix };
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

function gitDates(relativePath) {
  const gitPath = relativePath.replace(/\\/g, '/');
  const history = spawnSync('git', ['log', '--follow', '--format=%cs', '--', gitPath], {
    cwd: rootDir,
    encoding: 'utf8',
  });
  const dates = history.status === 0
    ? history.stdout.split(/\r?\n/).map((date) => date.trim()).filter(Boolean)
    : [];
  const status = spawnSync('git', ['status', '--porcelain=v1', '--', gitPath], {
    cwd: rootDir,
    encoding: 'utf8',
  });
  return {
    published: dates.at(-1) || today,
    modified: status.status === 0 && status.stdout.trim() ? today : (dates[0] || today),
  };
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId,
    name: 'Entre Sábios',
    url: `${canonicalOrigin}/sobre/`,
    email: 'ph.pedrocontato@gmail.com',
    logo: {
      '@type': 'ImageObject',
      url: brandIconUrl,
      width: 128,
      height: 128,
    },
  };
}

function organizationReference() {
  return {
    '@type': 'Organization',
    '@id': organizationId,
    name: 'Entre Sábios',
    url: `${canonicalOrigin}/sobre/`,
  };
}

function enhanceSchema(schema, { canonical, dates, relativePath, pageTitle }) {
  if (!schema || typeof schema !== 'object' || schema['@type'] === 'BreadcrumbList') return schema;
  schema['@context'] = 'https://schema.org';

  if (schema['@type'] === 'Organization') return organizationSchema();

  schema.inLanguage = 'pt-BR';
  if (schema['@type'] === 'WebSite') {
    schema['@id'] = websiteId;
    schema.url = `${canonicalOrigin}/`;
    schema.publisher = { '@id': organizationId };
  }

  if (['WebPage', 'CollectionPage', 'AboutPage'].includes(schema['@type'])) {
    schema['@id'] = `${canonical}#webpage`;
    schema.isPartOf = { '@type': 'WebSite', '@id': websiteId, name: 'Entre Sábios', url: `${canonicalOrigin}/` };
  }

  if (schema['@type'] === 'Article') {
    schema.mainEntityOfPage = { '@type': 'WebPage', '@id': canonical };
    schema.author = organizationReference();
    schema.editor = organizationReference();
    schema.publisher = {
      ...organizationReference(),
      logo: { '@type': 'ImageObject', url: brandIconUrl, width: 128, height: 128 },
    };
    schema.isPartOf = { '@type': 'WebSite', '@id': websiteId };
    schema.datePublished = dates.published;
    schema.dateModified = dates.modified;
  }

  if (relativePath.replace(/\\/g, '/').startsWith('pensadores/') && schema['@type'] === 'WebPage') {
    schema.mainEntity = {
      '@type': 'Person',
      name: pageTitle.text.split(':')[0].replace(/\s+—\s+Entre Sábios$/, '').trim(),
      url: canonical,
    };
  }

  if (relativePath.replace(/\\/g, '/') === 'sobre/index.html' && schema['@type'] === 'AboutPage') {
    schema.mainEntity = { '@id': organizationId };
  }
  return schema;
}

function updateStructuredData(html, context) {
  return html.replace(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi, (scriptTag, body) => {
    let schema;
    try {
      schema = JSON.parse(body);
    } catch {
      throw new Error(`JSON-LD inválido em ${context.relativePath}`);
    }
    if (schema['@type'] === 'BreadcrumbList') return '';
    return `<script type="application/ld+json">${JSON.stringify(enhanceSchema(schema, context))}</script>`;
  });
}

function removeManagedBreadcrumbSchema(html) {
  const withoutBreadcrumb = html.replace(/[ \t]*<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>[ \t]*(?:\r?\n)?/gi, (scriptTag, body) => (
    /"@type"\s*:\s*"BreadcrumbList"/.test(body) ? '' : scriptTag
  ));
  return withoutBreadcrumb
    .replace(/(<head>[\s\S]*?<\/head>)/i, (head) => head.replace(/^[ \t]+$/gm, ''))
    .replace(/\n(?:[ \t]*\n)+(?=[ \t]*<\/head>)/g, '\n');
}

function ensureOrganizationOnHome(html, relativePath) {
  if (relativePath !== 'index.html' || /"@type"\s*:\s*"Organization"/.test(html)) return html;
  const schema = `  <script type="application/ld+json">${JSON.stringify(organizationSchema())}</script>\n`;
  return html.replace('</head>', `${schema}</head>`);
}

function updateStylesheetLoading(html, relativePath) {
  const prefix = relativePrefix(relativePath);
  const directStyles = ['base', 'layout', 'components', 'modals', 'responsive']
    .map((name) => `<link rel="stylesheet" href="${prefix}css/${name}.css?v=${cssVersion}" />`)
    .join('\n  ');
  return html
    .replace(/<link\s+rel="stylesheet"\s+href="(?:\.\.\/)*style\.css\?v=[^"]+"\s*\/>/i, directStyles)
    .replace(/seo\.css\?v=[^"']+/g, `seo.css?v=${seoCssVersion}`);
}

function ensureFavicon(html) {
  if (/<link\s+rel="icon"/i.test(html)) return html;
  const links = '  <link rel="icon" href="/assets/brand-icon.jpg" type="image/jpeg" />\n'
    + '  <link rel="apple-touch-icon" href="/assets/brand-icon.jpg" />\n';
  return html.replace('</head>', `${links}</head>`);
}

function formatDate(date) {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function updateArticleByline(html, relativePath, dates) {
  if (!/"@type"\s*:\s*"Article"/.test(html)) return html;
  const prefix = relativePrefix(relativePath);
  const byline = `<p class="seo-byline">Edição editorial: <a href="${prefix}sobre/">Entre Sábios</a> · Publicado em <time datetime="${dates.published}">${formatDate(dates.published)}</time> · Atualizado em <time datetime="${dates.modified}">${formatDate(dates.modified)}</time></p>`;
  if (/<p class="seo-byline">[\s\S]*?<\/p>/i.test(html)) {
    return html.replace(/<p class="seo-byline">[\s\S]*?<\/p>/i, byline);
  }
  return html.replace(/(<p class="seo-lead">[\s\S]*?<\/p>)/i, `$1\n  ${byline}`);
}

const internalFiles = sectionNames.flatMap((section) => collectIndexFiles(path.join(rootDir, section)));
const htmlFiles = [path.join(rootDir, 'index.html'), ...internalFiles];
const pageRecords = [];
let updatedPages = 0;

for (const filePath of htmlFiles) {
  const relativePath = path.relative(rootDir, filePath);
  const originalHtml = fs.readFileSync(filePath, 'utf8');
  const originalComparable = removeManagedBreadcrumbSchema(originalHtml);
  let html = originalHtml.replaceAll('https://www.entresabios.com', canonicalOrigin);
  html = removeManagedBreadcrumbSchema(html);
  html = updateStylesheetLoading(html, relativePath);
  html = ensureFavicon(html);
  html = ensureOrganizationOnHome(html, relativePath);
  const canonical = getCanonical(html, relativePath);
  const pageTitle = getPageTitle(html, relativePath);
  const dates = gitDates(relativePath);
  const context = { canonical, dates, relativePath, pageTitle };
  html = updateStructuredData(html, context);
  html = updateArticleByline(html, relativePath, dates);

  let breadcrumbs = null;
  if (relativePath !== 'index.html') {
    breadcrumbs = getBreadcrumbs(relativePath, pageTitle, canonical);
    const visual = `<nav class="seo-breadcrumb" aria-label="Navegação estrutural">${renderVisualBreadcrumb(breadcrumbs, pageTitle)}</nav>`;
    if (!/<nav class="seo-breadcrumb"[\s\S]*?<\/nav>/i.test(html)) throw new Error(`Breadcrumb visual ausente em ${relativePath}`);
    html = html.replace(/<nav class="seo-breadcrumb"[\s\S]*?<\/nav>/i, visual);
  }

  if (html !== originalComparable && dates.modified !== today) {
    dates.modified = today;
    html = updateStructuredData(html, context);
    html = updateArticleByline(html, relativePath, dates);
  }

  if (breadcrumbs) {
    const schema = `  <script type="application/ld+json">${renderBreadcrumbSchema(breadcrumbs)}</script>\n`;
    html = html.replace('</head>', `${schema}</head>`);
  }

  pageRecords.push({ canonical, dateModified: dates.modified, relativePath });
  if (html !== originalHtml) {
    writeFileWithRetry(filePath, html);
    updatedPages += 1;
  }
}

const uniqueCanonicalUrls = new Set(pageRecords.map((record) => record.canonical));
if (uniqueCanonicalUrls.size !== htmlFiles.length) throw new Error('Há URLs canônicas ausentes ou duplicadas.');

const orderedRecords = pageRecords.sort((a, b) => {
  if (a.canonical === `${canonicalOrigin}/`) return -1;
  if (b.canonical === `${canonicalOrigin}/`) return 1;
  return a.canonical.localeCompare(b.canonical, 'pt-BR');
});
const sitemapEntries = orderedRecords.map(({ canonical, dateModified }) => {
  const lines = [
    '  <url>',
    `    <loc>${canonical}</loc>`,
    `    <lastmod>${dateModified}</lastmod>`,
  ];
  if (canonical === caveTaleUrl) {
    lines.push('    <image:image>');
    lines.push(`      <image:loc>${caveImageUrl}</image:loc>`);
    lines.push('      <image:caption>Ilustração editorial da Alegoria da Caverna de Platão.</image:caption>');
    lines.push('    </image:image>');
  }
  lines.push('  </url>');
  return lines.join('\n');
}).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${sitemapEntries}\n</urlset>\n`;
writeFileIfChanged(path.join(rootDir, 'sitemap.xml'), sitemap);
writeFileIfChanged(path.join(rootDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${canonicalOrigin}/sitemap.xml\n`);

console.info(`SEO atualizado: ${htmlFiles.length} páginas, ${orderedRecords.length} URLs canônicas e ${updatedPages} página(s) regravada(s).`);

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const rootDir = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

test('página inicial evita cadeia de CSS e mantém orçamento explícito de JavaScript local', () => {
  assert.doesNotMatch(html, /href="style\.css\?v=/);
  for (const stylesheet of ['base', 'layout', 'components', 'modals', 'responsive']) {
    assert.match(html, new RegExp(`href="css/${stylesheet}\\.css\\?v=`));
  }

  const localScripts = [...html.matchAll(/<script\s+src="([^"]+\.js)(?:\?[^\"]*)?"/g)]
    .map((match) => match[1])
    .filter((source) => !source.startsWith('http'));
  const totalBytes = localScripts.reduce((total, source) => (
    total + fs.statSync(path.join(rootDir, source)).size
  ), 0);
  assert.ok(localScripts.length <= 29, `Quantidade de scripts locais cresceu: ${localScripts.length}`);
  assert.ok(totalBytes <= 750_000, `JavaScript local excedeu 750 KB: ${totalBytes} bytes`);
});

test('Firebase Presence inicia depois do load e não duplica Google Analytics', () => {
  assert.doesNotMatch(html, /firebase-analytics\.js|getAnalytics\(|measurementId/);
  assert.match(html, /async function initializePresence\(\)/);
  assert.match(html, /import\("https:\/\/www\.gstatic\.com\/firebasejs\/10\.12\.5\/firebase-app\.js"\)/);
  assert.match(html, /window\.addEventListener\("load", schedulePresence, \{ once: true \}\)/);
  assert.match(html, /requestIdleCallback/);
  assert.equal((html.match(/googletagmanager\.com\/gtag\/js/g) || []).length, 1);
  assert.ok(html.includes("gtag('config', 'G-9591SHYV5M')"));
});

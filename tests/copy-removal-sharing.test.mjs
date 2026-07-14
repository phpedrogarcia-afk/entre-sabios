import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const sharing = fs.readFileSync(path.join(rootDir, 'js', 'features', 'sharing.js'), 'utf8');
const forbiddenCopy = /navigator\.clipboard|execCommand\s*\(\s*["']copy|copyShare|copyBtn|copyButton|copy-button|>\s*Copiar\b|aria-label=["'][^"']*copiar|title=["'][^"']*copiar/i;

function activeAssetPaths() {
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)]
    .map((match) => match[1].split('?')[0])
    .filter((source) => !/^https?:/i.test(source) && source !== 'data/entre_sabios_runtime.js');
  return [...new Set([
    ...scripts,
    'style.css',
    'css/base.css',
    'css/layout.css',
    'css/components.css',
    'css/modals.css',
    'css/responsive.css',
    'css/landscape-scroll-fix.css',
    'css/tablet.css',
  ])];
}

function extractShareFunction() {
  const start = script.indexOf('async function shareReflectionImage');
  const end = script.indexOf('\nwhatsShareBtn.addEventListener', start);
  assert.ok(start >= 0 && end > start, 'Função de compartilhamento não encontrada');
  return script.slice(start, end).trim();
}

async function runShareScenario({ fileShare = false, textShare = false, shareError = null } = {}) {
  const calls = { downloads: [], shares: [], statuses: [], busy: [] };
  const image = {
    blob: { kind: 'png' },
    file: { name: 'entre-sabios-sage-stories.png' },
    filename: 'entre-sabios-sage-stories.png',
  };
  const navigator = {};
  if (fileShare || textShare) {
    navigator.share = async (payload) => {
      calls.shares.push(payload);
      if (shareError) throw shareError;
    };
  }
  const sandbox = {
    currentStory: { key: 'story' },
    navigator,
    setImageShareBusy: (value) => calls.busy.push(value),
    setShareStatus: (message) => calls.statuses.push(message),
    createShareImage: async () => image,
    canShareImageFile: () => fileShare,
    downloadBlob: (blob, filename) => calls.downloads.push({ blob, filename }),
    getShareMessage: () => 'Mensagem compartilhável',
  };
  vm.createContext(sandbox);
  vm.runInContext(extractShareFunction(), sandbox);
  await sandbox.shareReflectionImage({ styleKey: 'sage', triggerButton: null });
  return calls;
}

test('interface, scripts e estilos ativos não contêm mecanismo de cópia', () => {
  assert.doesNotMatch(html, forbiddenCopy);
  for (const relativePath of activeAssetPaths()) {
    assert.doesNotMatch(
      fs.readFileSync(path.join(rootDir, relativePath), 'utf8'),
      forbiddenCopy,
      `Vestígio de cópia em ${relativePath}`,
    );
  }
});

test('compartilhamento de arquivo usa Web Share sem download quando suportado', async () => {
  const calls = await runShareScenario({ fileShare: true });
  assert.equal(calls.shares.length, 1);
  assert.deepEqual(Object.keys(calls.shares[0]), ['title', 'files']);
  assert.equal(calls.downloads.length, 0);
  assert.equal(calls.statuses.at(-1), 'Imagem compartilhada pelas opções do dispositivo.');
  assert.deepEqual(calls.busy, [true, false]);
});

test('sem compartilhamento de arquivo, baixa a imagem e usa Web Share de texto quando disponível', async () => {
  const calls = await runShareScenario({ textShare: true });
  assert.equal(calls.downloads.length, 1);
  assert.equal(calls.shares.length, 1);
  assert.deepEqual(Object.keys(calls.shares[0]), ['title', 'text', 'url']);
  assert.match(calls.statuses.at(-1), /imagem foi baixada/);
});

test('navegador sem Web Share mantém download e orientação para envio manual', async () => {
  const calls = await runShareScenario();
  assert.equal(calls.downloads.length, 1);
  assert.equal(calls.shares.length, 0);
  assert.match(calls.statuses.at(-1), /Imagem baixada/);
  assert.match(calls.statuses.at(-1), /Status, Stories/);
});

test('falha no envio direto baixa a imagem sem reintroduzir cópia', async () => {
  const calls = await runShareScenario({ fileShare: true, shareError: new Error('falha de envio') });
  assert.equal(calls.shares.length, 1);
  assert.equal(calls.downloads.length, 1);
  assert.match(calls.statuses.at(-1), /imagem foi baixada/);
  assert.doesNotMatch(calls.statuses.join(' '), /copi/i);
});

test('geração da imagem permanece ligada ao canvas PNG em formato Stories', () => {
  assert.match(sharing, /drawShareCard\(\{\s*width\s*=\s*1080,\s*height\s*=\s*1920/);
  assert.match(sharing, /canvas\.toBlob\([^]*?'image\/png'/);
  assert.match(sharing, /entre-sabios-\$\{resolvedStyleKey\}-stories\.png/);
});

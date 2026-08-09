import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const rootDir = path.resolve(import.meta.dirname, '..');
const favoritesSource = fs.readFileSync(path.join(rootDir, 'js', 'features', 'favorites.js'), 'utf8');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const talesSource = fs.readFileSync(path.join(rootDir, 'js', 'features', 'tales.js'), 'utf8');

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
}

function createButton() {
  const classes = new Set();
  const attributes = new Map();
  return {
    textContent: '',
    title: '',
    classList: { toggle(name, active) { active ? classes.add(name) : classes.delete(name); } },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    getAttribute(name) { return attributes.get(name); },
  };
}

function createElement() {
  const handlers = new Map();
  return {
    className: '',
    textContent: '',
    type: '',
    children: [],
    addEventListener(type, handler) { handlers.set(type, handler); },
    append(...items) { this.children.push(...items); },
    appendChild(item) { this.children.push(item); },
    click() { handlers.get('click')?.(); },
  };
}

function createSandbox({ storage, favorites, currentTale = null }) {
  const opened = [];
  const sandbox = {
    localStorage: storage,
    favoriteStories: favorites,
    currentStory: null,
    currentTale,
    favoriteBtn: createButton(),
    taleFavoriteBtn: createButton(),
    favoritesCountEl: { textContent: '' },
    preferenceNoteEl: { textContent: '' },
    favoritesListEl: {
      innerHTML: '',
      children: [],
      appendChild(item) { this.children.push(item); },
    },
    favoritesDialog: { open: true, close() { this.open = false; } },
    openSavedTale(id) { opened.push(id); },
    document: { createElement },
  };
  vm.runInNewContext(favoritesSource, sandbox);
  return { sandbox, opened };
}

test('conto usa estrela própria, resumo na biblioteca e a chave histórica', () => {
  assert.match(html, /id="taleFavoriteBtn"[^>]+aria-label="Salvar conto"/);
  assert.match(html, /id="taleReadStatus"[^>]+hidden>Lido</);
  assert.match(talesSource, /renderTale\(tale, \{ wasPreviouslyRead \}\)/);
  assert.match(talesSource, /interpretEmotionalState\(resolveTaleIntensity\(\)\)/);

  const storage = createStorage({ caixaSabedoriaFavoritas: '[]' });
  const favorites = [];
  const currentTale = {
    id: 'conto-1',
    titulo: 'Um conto',
    origem: 'Tradição oral',
    umModoDeOlhar: ['Um resumo curto para retomar a leitura.'],
  };
  const { sandbox } = createSandbox({ storage, favorites, currentTale });
  sandbox.toggleTaleFavorite();

  const saved = JSON.parse(storage.getItem('caixaSabedoriaFavoritas'));
  assert.equal(saved.length, 1);
  assert.equal(saved[0].type, 'tale');
  assert.equal(saved[0].taleId, 'conto-1');
  assert.equal(saved[0].summary, 'Um resumo curto para retomar a leitura.');
  assert.equal(sandbox.taleFavoriteBtn.getAttribute('aria-pressed'), 'true');
});

test('leituras antigas permanecem intactas e conto salvo reabre no diálogo completo', () => {
  const legacy = { key: 'antiga', quote: 'Uma reflexão.', attribution: 'Autoria' };
  const tale = {
    type: 'tale',
    key: 'tale:conto-2',
    taleId: 'conto-2',
    title: 'Outro conto',
    origin: 'Fonte conhecida',
    summary: 'Somente o resumo aparece aqui.',
  };
  const storage = createStorage({ caixaSabedoriaFavoritas: JSON.stringify([legacy, tale]) });
  const { sandbox, opened } = createSandbox({ storage, favorites: [legacy, tale] });
  sandbox.renderFavorites();

  assert.equal(sandbox.favoritesListEl.children.length, 2);
  const taleCard = sandbox.favoritesListEl.children[1];
  assert.equal(taleCard.children[0].textContent, 'Outro conto');
  assert.equal(taleCard.children[2].textContent, 'Somente o resumo aparece aqui.');
  const actions = taleCard.children[3];
  actions.children[0].click();
  assert.deepEqual(opened, ['conto-2']);
  assert.equal(sandbox.favoritesDialog.open, false);
  assert.deepEqual(JSON.parse(storage.getItem('caixaSabedoriaFavoritas'))[0], legacy);
});

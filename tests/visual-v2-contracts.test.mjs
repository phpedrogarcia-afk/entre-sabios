import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
const html = read('index.html');
const script = read('script.js');
const favoritesScript = read('js/features/favorites.js');
const feedbackScript = read('js/features/feedback.js');
const reflectionUiScript = read('js/ui/reflection-ui.js');
const themeScript = read('js/ui/theme-ui.js');
const baseCss = read('css/base.css');

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    snapshot() { return Object.fromEntries(values); },
  };
}

function createButton() {
  const classes = new Set();
  const attributes = new Map();
  return {
    textContent: '',
    title: '',
    disabled: true,
    classList: {
      toggle(name, active) { active ? classes.add(name) : classes.delete(name); },
      contains(name) { return classes.has(name); },
    },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    getAttribute(name) { return attributes.get(name); },
  };
}

function createFeatureSandbox({
  storage,
  currentStory,
  favoriteStories = [],
  consoleErrors = [],
}) {
  const sandbox = {
    console: { error(...args) { consoleErrors.push(args); } },
    localStorage: storage,
    currentStory,
    favoriteStories,
    preferenceProfile: { tags: {}, books: {}, storyFeedback: {} },
    favoriteBtn: createButton(),
    favoritesCountEl: { textContent: '' },
    favoritesListEl: { innerHTML: '', children: [], appendChild(item) { this.children.push(item); } },
    preferenceNoteEl: { textContent: '' },
    likeBtn: createButton(),
    recordEditorialSignal() {},
    interpretEmotionalState() { return { primaryFeeling: 'confusao', intensity: 'moderada' }; },
    updateBookRecommendation() {},
    document: {
      createElement() {
        return {
          className: '',
          textContent: '',
          type: '',
          children: [],
          addEventListener() {},
          append(...items) { this.children.push(...items); },
          appendChild(item) { this.children.push(item); },
        };
      },
    },
  };
  vm.runInNewContext(favoritesScript, sandbox);
  vm.runInNewContext(feedbackScript, sandbox);
  return sandbox;
}

test('todos os IDs funcionais críticos existem uma única vez', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  assert.deepEqual(duplicates, []);

  const criticalIds = [
    'feelingsGrid', 'primaryFeelingControl', 'generateBtn', 'backBtn', 'newBtn',
    'likeBtn', 'favoriteBtn', 'favoritesBtn', 'favoritesDialog',
    'themeToggleBtn', 'quoteText', 'quoteAuthor', 'quoteSource', 'explanationBlock',
    'philosophyBlock', 'adviceBlock', 'bookRecommendation', 'openTaleBtn', 'taleDialog',
  ];
  for (const id of criticalIds) assert.equal(ids.filter((candidate) => candidate === id).length, 1, id);
});

test('ações principais permanecem ligadas aos fluxos reais e sem controles públicos removidos', () => {
  assert.match(script, /generateBtn\.addEventListener\('click',[\s\S]*?generateReflection\(/);
  assert.match(script, /newBtn\.addEventListener\('click',[\s\S]*?newPhrase\(/);
  assert.match(script, /backBtn\.addEventListener\('click',\s*goBack\)/);
  assert.match(script, /likeBtn\.addEventListener\('click',\s*\(\) => setStoryFeedback\(1\)\)/);
  assert.match(script, /favoriteBtn\.addEventListener\('click',\s*toggleFavorite\)/);
  const likeBinding = script.match(/likeBtn\.addEventListener\([^\n]+/)?.[0] || '';
  const favoriteBinding = script.match(/favoriteBtn\.addEventListener\([^\n]+/)?.[0] || '';
  assert.doesNotMatch(likeBinding, /toggleFavorite/);
  assert.doesNotMatch(favoriteBinding, /setStoryFeedback/);
  assert.doesNotMatch(html, /name="intensity"|motivationToggle|Como você quer receber esta reflexão/);
});

test('coração alterna apenas feedback positivo e nunca cria favorito ou valor negativo', () => {
  const storage = createMemoryStorage({ caixaSabedoriaFavoritas: '[]' });
  const currentStory = { key: 'reflexao-atual', rawTags: [], emotionalState: {} };
  const sandbox = createFeatureSandbox({ storage, currentStory });

  sandbox.setStoryFeedback(1);
  assert.equal(sandbox.preferenceProfile.storyFeedback[currentStory.key], 1);
  assert.deepEqual(sandbox.favoriteStories, []);
  assert.equal(storage.getItem('caixaSabedoriaFavoritas'), '[]');

  sandbox.setStoryFeedback(1);
  assert.equal(sandbox.preferenceProfile.storyFeedback[currentStory.key], undefined);
  assert.ok(Object.values(sandbox.preferenceProfile.storyFeedback).every((value) => value !== -1));
  assert.deepEqual(sandbox.favoriteStories, []);
});

test('estrela alterna apenas leitura salva e nunca produz feedback', () => {
  const storage = createMemoryStorage();
  const currentStory = {
    key: 'reflexao-atual', quote: 'Uma reflexão.', attribution: 'Autoria', source: '', rawTags: [],
  };
  const sandbox = createFeatureSandbox({ storage, currentStory });

  sandbox.toggleFavorite();
  assert.equal(sandbox.favoriteStories.length, 1);
  assert.deepEqual(sandbox.preferenceProfile.storyFeedback, {});
  assert.equal(JSON.parse(storage.getItem('caixaSabedoriaFavoritas')).length, 1);

  sandbox.toggleFavorite();
  assert.equal(sandbox.favoriteStories.length, 0);
  assert.deepEqual(sandbox.preferenceProfile.storyFeedback, {});
  assert.deepEqual(JSON.parse(storage.getItem('caixaSabedoriaFavoritas')), []);
});

test('favoritos legados viram Leituras salvas sem nova chave e negativos antigos sobrevivem', () => {
  const legacyFavorites = [{ key: 'legada', quote: 'Leitura antiga.', attribution: 'Autoria antiga' }];
  const legacyProfile = { tags: {}, books: {}, storyFeedback: { preservadoNegativo: -1, preservadoPositivo: 1 } };
  const storage = createMemoryStorage({
    caixaSabedoriaFavoritas: JSON.stringify(legacyFavorites),
    caixaSabedoriaPreferencias: JSON.stringify(legacyProfile),
  });
  const currentStory = { key: 'nova', quote: 'Nova.', attribution: 'Autoria', rawTags: [], emotionalState: {} };
  const sandbox = createFeatureSandbox({
    storage,
    currentStory,
    favoriteStories: JSON.parse(storage.getItem('caixaSabedoriaFavoritas')),
  });
  sandbox.preferenceProfile = sandbox.loadPreferenceProfile();

  sandbox.renderFavorites();
  assert.equal(sandbox.favoritesListEl.children.length, 1);
  assert.match(html, /id="favoritesBtn"[\s\S]*?Leituras salvas/);
  assert.match(html, /id="favoritesTitle">LEITURAS SALVAS</);

  sandbox.setStoryFeedback(1);
  sandbox.toggleFavorite();
  const persisted = JSON.parse(storage.getItem('caixaSabedoriaPreferencias'));
  assert.equal(persisted.storyFeedback.preservadoNegativo, -1);
  assert.equal(persisted.storyFeedback.preservadoPositivo, 1);
  assert.equal(persisted.storyFeedback.nova, 1);
  assert.ok(Object.hasOwn(storage.snapshot(), 'caixaSabedoriaFavoritas'));
  assert.ok(!Object.hasOwn(storage.snapshot(), 'leiturasSalvas'));
});

test('dislike não existe no caminho público e negativos legados permanecem intactos', () => {
  assert.doesNotMatch(html, /dislikeBtn|quote-dislike|Não gostei/);
  assert.doesNotMatch(script, /dislikeBtn|setStoryFeedback\(-1\)/);
  assert.doesNotMatch(reflectionUiScript, /dislikeBtn/);
  assert.doesNotMatch(feedbackScript, /dislikeBtn|active-dislike/);

  const consoleErrors = [];
  const sandbox = createFeatureSandbox({
    storage: createMemoryStorage(),
    currentStory: { key: 'negativa-legada', rawTags: [] },
    consoleErrors,
  });
  sandbox.preferenceProfile.storyFeedback['negativa-legada'] = -1;
  assert.doesNotThrow(() => sandbox.updateFeedbackButtons());
  assert.deepEqual(consoleErrors, []);
  assert.equal(sandbox.likeBtn.getAttribute('aria-pressed'), 'false');
  assert.equal(sandbox.preferenceProfile.storyFeedback['negativa-legada'], -1);
});

test('textos públicos distinguem Gostei, Salvar leitura e pergunta editorial', () => {
  assert.match(html, /id="likeBtn"[^>]*aria-label="Gostei desta reflexão"/);
  assert.match(html, /id="favoriteBtn"[^>]*aria-label="Salvar leitura"/);
  assert.match(html, /id="likeBtn"[\s\S]*?<svg[^>]+aria-hidden="true"><path d="M20\.8 5\.9/);
  assert.match(html, /id="favoriteBtn"[\s\S]*?<svg[^>]+aria-hidden="true"><path d="m12 3 /);
  assert.match(html, /id="adviceTitle">UMA PERGUNTA PARA LEVAR CONSIGO</);
  assert.match(script, /label: 'UMA PERGUNTA PARA LEVAR CONSIGO'/);
  assert.match(favoritesScript, /Remover leitura salva/);
  assert.match(favoritesScript, /caixaSabedoriaFavoritas/);
  assert.match(feedbackScript, /active \? 'Remover gostei' : 'Gostei desta reflexão'/);
});

test('tokens V2 usam day e night sem renomear o contrato persistente', () => {
  const tokens = [
    'surface-page', 'surface-header', 'surface-panel', 'surface-reading', 'text-primary',
    'text-secondary', 'text-on-dark', 'accent-title', 'accent-active', 'accent-primary',
    'border-subtle', 'border-active', 'shadow-card', 'shadow-deep', 'focus-ring',
    'state-hover', 'state-disabled', 'decorative-texture-opacity',
  ];
  assert.match(baseCss, /html\[data-theme="day"\]/);
  assert.match(baseCss, /html\[data-theme="night"\]/);
  for (const token of tokens) assert.match(baseCss, new RegExp(`--${token}:`), token);
  assert.match(themeScript, /const THEME_STORAGE_KEY = 'entreSabiosTheme'/);
  assert.match(themeScript, /theme === 'night' \? 'night' : 'day'/);
});

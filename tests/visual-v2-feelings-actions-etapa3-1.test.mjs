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
const componentsCss = read('css/components.css');
const responsiveCss = read('css/responsive.css');
const sprite = read('assets/icons/feelings-sprite.svg');

const feelingIds = [
  'ansiedade', 'medo', 'amor', 'saudade', 'esperanca', 'solidao', 'autoconhecimento',
  'confusao', 'inseguranca', 'raiva', 'culpa', 'luto', 'tristeza', 'falta_de_proposito',
];

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, String(value)); },
    snapshot() { return Object.fromEntries(values); },
  };
}

function createButton() {
  const classes = new Set();
  const attributes = new Map();
  return {
    title: '',
    classList: {
      toggle(name, active) { active ? classes.add(name) : classes.delete(name); },
      contains(name) { return classes.has(name); },
    },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    getAttribute(name) { return attributes.get(name); },
  };
}

function createFeatureSandbox({ storage, currentStory, favoriteStories = [] }) {
  const sandbox = {
    localStorage: storage,
    currentStory,
    favoriteStories,
    preferenceProfile: { tags: {}, books: {}, storyFeedback: {} },
    favoriteBtn: createButton(),
    likeBtn: createButton(),
    favoritesCountEl: { textContent: '' },
    favoritesListEl: { innerHTML: '', children: [], appendChild(item) { this.children.push(item); } },
    preferenceNoteEl: { textContent: '' },
    recordEditorialSignal() { throw new Error('Gostei não pode registrar sinal negativo'); },
    interpretEmotionalState() { return {}; },
    updateBookRecommendation() {},
    document: {
      createElement() {
        return {
          className: '', textContent: '', type: '', children: [],
          addEventListener() {}, append(...items) { this.children.push(...items); },
          appendChild(item) { this.children.push(item); },
        };
      },
    },
  };
  vm.runInNewContext(favoritesScript, sandbox);
  vm.runInNewContext(feedbackScript, sandbox);
  return sandbox;
}

test('família única preserva os 14 símbolos com traço leve e dimensões editoriais', () => {
  for (const id of feelingIds) assert.equal((sprite.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, id);
  assert.equal((sprite.match(/<symbol id=/g) || []).length, 16);
  assert.doesNotMatch(sprite, /fill=|stroke=|stroke-width=/);
  assert.match(componentsCss, /\.feeling-icon svg,[\s\S]*?fill:\s*none;[\s\S]*?stroke:\s*currentColor;[\s\S]*?stroke-width:\s*1\.5;/);
  assert.match(componentsCss, /\.feeling-icon\s*\{[\s\S]*?width:\s*20px;[\s\S]*?height:\s*20px;/);
  assert.match(responsiveCss, /@media \(min-width: 1101px\) and \(min-height: 760px\) and \(max-height: 959px\)[\s\S]*?\.feeling-icon\s*\{[\s\S]*?width:\s*20px;[\s\S]*?height:\s*20px;/);
  assert.match(responsiveCss, /@media \(max-width: 520px\)[\s\S]*?\.feeling-icon\s*\{[\s\S]*?width:\s*21px;[\s\S]*?height:\s*21px;/);
});

test('observador, pena, labels e alvos de toque mantêm proporção e interação', () => {
  assert.match(componentsCss, /\.feelings-heading-icon\s*\{[\s\S]*?width:\s*34px;[\s\S]*?height:\s*34px;/);
  assert.match(componentsCss, /\.tip-icon\s*\{[\s\S]*?width:\s*28px;[\s\S]*?height:\s*28px;/);
  assert.match(componentsCss, /\.feeling\s*\{[\s\S]*?min-height:\s*48px;[\s\S]*?grid-template-columns:\s*20px minmax\(0, 1fr\);[\s\S]*?gap:\s*9px;/);
  assert.match(responsiveCss, /\.feeling\s*\{[\s\S]*?min-height:\s*56px;/);
  assert.match(html, /id="feelingsGrid"/);
  assert.match(read('js/ui/feelings-ui.js'), /input\.type = 'checkbox'[\s\S]*?input\.name = 'feelings'[\s\S]*?card\.appendChild\(input\)/);
});

test('card público contém apenas compartilhar, estrela e coração no trilho aprovado', () => {
  const stage = html.match(/<div class="quote-stage">([\s\S]*?)<div class="quote-content">/)?.[1] || '';
  assert.equal((html.match(/id="quoteShareBtn"/g) || []).length, 1);
  assert.equal((html.match(/id="favoriteBtn"/g) || []).length, 1);
  assert.equal((html.match(/id="likeBtn"/g) || []).length, 1);
  assert.doesNotMatch(html, /dislikeBtn|quote-dislike|Não gostei/);
  assert.match(stage, /id="favoriteBtn"[\s\S]*?<svg[^>]*>[\s\S]*?<path d="m12 3 /);
  assert.match(html, /id="likeBtn"[\s\S]*?<svg[^>]*>[\s\S]*?<path d="M20\.8 5\.9/);
  assert.match(componentsCss, /\.quote-actions\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto auto/);
  assert.match(componentsCss, /\.quote-share\s*\{[\s\S]*?justify-self:\s*start/);
  assert.match(componentsCss, /\.quote-favorite\s*\{[\s\S]*?justify-self:\s*end/);
  assert.match(componentsCss, /\.quote-like\s*\{[\s\S]*?justify-self:\s*end/);
});

test('estrela salva somente leitura e atualiza semântica nos dois estados', () => {
  const storage = createStorage({ caixaSabedoriaFavoritas: '[]' });
  const story = { key: 'atual', quote: 'Texto.', attribution: 'Autoria', source: '' };
  const sandbox = createFeatureSandbox({ storage, currentStory: story });
  assert.match(script, /favoriteBtn\.addEventListener\('click', toggleFavorite\)/);
  assert.doesNotMatch(script.match(/favoriteBtn\.addEventListener\([^\n]+/)?.[0] || '', /setStoryFeedback/);

  sandbox.updateFavoriteUi();
  assert.equal(sandbox.favoriteBtn.getAttribute('aria-pressed'), 'false');
  assert.equal(sandbox.favoriteBtn.getAttribute('aria-label'), 'Salvar leitura');
  sandbox.toggleFavorite();
  assert.equal(sandbox.favoriteBtn.getAttribute('aria-pressed'), 'true');
  assert.equal(sandbox.favoriteBtn.getAttribute('aria-label'), 'Remover leitura salva');
  assert.equal(sandbox.favoriteBtn.title, 'Remover leitura salva');
  assert.deepEqual(sandbox.preferenceProfile.storyFeedback, {});
  assert.equal(JSON.parse(storage.getItem('caixaSabedoriaFavoritas')).length, 1);
});

test('coração alterna somente Gostei e nunca altera favoritos nem produz menos um', () => {
  const storage = createStorage({ caixaSabedoriaFavoritas: '[]' });
  const story = { key: 'atual', rawTags: [], emotionalState: {} };
  const sandbox = createFeatureSandbox({ storage, currentStory: story });
  assert.match(script, /likeBtn\.addEventListener\('click', \(\) => setStoryFeedback\(1\)\)/);
  assert.doesNotMatch(script.match(/likeBtn\.addEventListener\([^\n]+/)?.[0] || '', /toggleFavorite|-1/);

  sandbox.updateFeedbackButtons();
  assert.equal(sandbox.likeBtn.getAttribute('aria-pressed'), 'false');
  assert.equal(sandbox.likeBtn.getAttribute('aria-label'), 'Gostei desta reflexão');
  sandbox.setStoryFeedback(1);
  assert.equal(sandbox.likeBtn.getAttribute('aria-pressed'), 'true');
  assert.equal(sandbox.likeBtn.getAttribute('aria-label'), 'Remover gostei');
  assert.equal(sandbox.likeBtn.title, 'Remover gostei');
  assert.equal(sandbox.preferenceProfile.storyFeedback.atual, 1);
  assert.equal(storage.getItem('caixaSabedoriaFavoritas'), '[]');
  sandbox.setStoryFeedback(1);
  assert.equal(sandbox.preferenceProfile.storyFeedback.atual, undefined);
  assert.ok(Object.values(sandbox.preferenceProfile.storyFeedback).every((value) => value !== -1));
});

test('dados legados sobrevivem à inicialização e à nova interação positiva', () => {
  const legacyFavorites = [{ key: 'antiga', quote: 'Antiga.', attribution: 'Autoria' }];
  const legacyProfile = { tags: {}, books: {}, storyFeedback: { antigaNegativa: -1 } };
  const storage = createStorage({
    caixaSabedoriaFavoritas: JSON.stringify(legacyFavorites),
    caixaSabedoriaPreferencias: JSON.stringify(legacyProfile),
    entreSabiosSinaisEditoriais: JSON.stringify([{ type: 'frequentDislike' }]),
  });
  const sandbox = createFeatureSandbox({
    storage,
    currentStory: { key: 'nova', rawTags: [], emotionalState: {} },
    favoriteStories: JSON.parse(storage.getItem('caixaSabedoriaFavoritas')),
  });
  sandbox.preferenceProfile = sandbox.loadPreferenceProfile();
  sandbox.renderFavorites();
  sandbox.setStoryFeedback(1);
  assert.equal(sandbox.favoritesListEl.children.length, 1);
  assert.equal(JSON.parse(storage.getItem('caixaSabedoriaPreferencias')).storyFeedback.antigaNegativa, -1);
  assert.equal(JSON.parse(storage.getItem('entreSabiosSinaisEditoriais'))[0].type, 'frequentDislike');
  assert.ok(!Object.hasOwn(storage.snapshot(), 'leiturasSalvas'));
});

test('remoção do dislike é atômica sem adaptador oculto ou referência obrigatória', () => {
  for (const source of [html, script, feedbackScript, reflectionUiScript, componentsCss, responsiveCss]) {
    assert.doesNotMatch(source, /dislikeBtn|quote-dislike|active-dislike/);
  }
  assert.match(feedbackScript, /function setStoryFeedback\(value\)/);
  assert.match(feedbackScript, /if \(next < 0\)[\s\S]*?recordEditorialSignal\('frequentDislike'/);
});

test('ações preservam área, foco, currentColor e preenchimentos leves nos dois temas', () => {
  assert.match(componentsCss, /\.quote-action\s*\{[\s\S]*?width:\s*44px;[\s\S]*?height:\s*44px;/);
  assert.match(componentsCss, /\.quote-action svg\s*\{[\s\S]*?width:\s*22px;[\s\S]*?fill:\s*none;[\s\S]*?stroke:\s*currentColor;[\s\S]*?stroke-width:\s*1\.6;/);
  assert.match(componentsCss, /\.quote-action:hover,[\s\S]*?\.quote-action:focus-visible/);
  assert.match(componentsCss, /\.quote-action\.active-like svg\s*\{[\s\S]*?fill:\s*currentColor/);
  assert.match(componentsCss, /\.quote-action\.active-favorite svg\s*\{[\s\S]*?fill:\s*currentColor/);
  assert.match(componentsCss, /html\[data-theme="night"\] \.quote-action\.active-like/);
  assert.match(componentsCss, /html\[data-theme="night"\] \.quote-action\.active-favorite svg/);
});

test('compartilhamento aprovado permanece idêntico e semanticamente separado', () => {
  const approvedShare = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16c2.8-5.6 7.3-8.4 14-8.4m-4.2-4.1L18.5 7.6l-4.7 4.1"/></svg>';
  assert.ok(html.includes(approvedShare));
  assert.match(script, /quoteShareBtn\.addEventListener\('click',[\s\S]*?shareReflectionImage/);
  const binding = script.match(/quoteShareBtn\.addEventListener\('click',[\s\S]*?\n\}\);/)?.[0] || '';
  assert.doesNotMatch(binding, /toggleFavorite|setStoryFeedback/);
});

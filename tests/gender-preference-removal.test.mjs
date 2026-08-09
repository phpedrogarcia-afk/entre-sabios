import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { pathToFileURL, fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const runtime = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'entre_sabios_runtime.json'), 'utf8'));
const feedbackSource = fs.readFileSync(path.join(rootDir, 'js', 'features', 'feedback.js'), 'utf8');
const matchingSource = fs.readFileSync(path.join(rootDir, 'js', 'core', 'matching.js'), 'utf8');
const forbiddenPreference = /genderPreference|currentGenderPreference|genderRadioEls|initGenderPreference|name=["']genderPreference|PREFERÊNCIA DE AUTORIA|preferenciaGenero|genderWeight/i;

function localAssetPaths() {
  const scriptPaths = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)]
    .map((match) => match[1].split('?')[0])
    .filter((source) => !/^https?:/i.test(source) && source !== 'data/entre_sabios_runtime.js');
  const cssPaths = [
    'style.css',
    'css/base.css',
    'css/layout.css',
    'css/components.css',
    'css/modals.css',
    'css/responsive.css',
    'css/landscape-scroll-fix.css',
    'css/tablet.css',
  ];
  return [...new Set([...scriptPaths, ...cssPaths])];
}

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial).map(([key, value]) => [key, String(value)]));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    snapshot: () => Object.fromEntries(values),
  };
}

test('interface, scripts carregados e estilos ativos não contêm preferência de gênero', () => {
  assert.doesNotMatch(html, forbiddenPreference);
  for (const relativePath of localAssetPaths()) {
    const source = fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
    assert.doesNotMatch(source, forbiddenPreference, `Vestígio ativo em ${relativePath}`);
  }
});

test('perfil antigo ignora autoria e gênero e não os salva novamente', () => {
  const legacy = {
    tags: { calma: 2 },
    books: { Meditações: 1 },
    storyFeedback: { item: 1 },
    authors: { 'Autor antigo': 99 },
    gender: 'female',
    genderPreference: 'female',
  };
  let persisted = null;
  const sandbox = {
    localStorage: {
      getItem: () => JSON.stringify(legacy),
      setItem: (_key, value) => { persisted = JSON.parse(value); },
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(feedbackSource, sandbox);
  const loaded = sandbox.loadPreferenceProfile();
  sandbox.preferenceProfile = loaded;
  sandbox.savePreferenceProfile();

  assert.deepEqual(JSON.parse(JSON.stringify(loaded)), {
    tags: legacy.tags,
    books: legacy.books,
    storyFeedback: legacy.storyFeedback,
  });
  assert.deepEqual(persisted, JSON.parse(JSON.stringify(loaded)));
  assert.ok(!('authors' in persisted));
  assert.ok(!('gender' in persisted));
  assert.ok(!('genderPreference' in persisted));
});

test('campo antigo de gênero não entra na assinatura nem nas chaves persistidas da fila', async () => {
  await import(pathToFileURL(path.join(rootDir, 'js', 'core', 'runtime-engine.js')).href);
  const engine = globalThis.EntreSabiosRuntimeEngine;
  const storage = createMemoryStorage();
  const selector = engine.createSelector({ version: 'fase-9-compat', contents: runtime.contents, storage });
  const baseState = { primaryFeeling: 'tristeza', secondaryFeelings: ['inseguranca'], intensity: 'moderada' };

  selector.select({ ...baseState, genderPreference: 'female', gender: 'female' }, { firstResponse: true });
  selector.select({ ...baseState, genderPreference: 'male', gender: 'male' }, { firstResponse: false });

  const persisted = storage.snapshot();
  assert.ok(Object.keys(persisted).every((key) => !/gender|genero|female|male/i.test(key)));
  assert.ok(Object.values(persisted).every((value) => !/genderPreference|"gender"|female|male/i.test(value)));
  const queueState = JSON.parse(persisted['entreSabiosRuntimeQueues:fase-9-compat']);
  assert.deepEqual(Object.keys(queueState), ['fase-9-compat|tristeza|inseguranca|moderada::level:1']);
});

test('analytics editorial ignora propriedades antigas de gênero', () => {
  let persisted = null;
  const sandbox = {
    console: { info() {} },
    localStorage: {
      getItem: () => '{}',
      setItem: (_key, value) => { persisted = JSON.parse(value); },
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(matchingSource, sandbox);
  sandbox.recordEditorialSignal('contentGap', {
    primaryFeeling: 'tristeza',
    intensity: 'moderada',
    genderPreference: 'female',
    gender: 'female',
  });
  assert.deepEqual(persisted, { 'contentGap:tristeza:moderada': 1 });
});

test('gênero permanece somente como metadado editorial válido do runtime', () => {
  assert.ok(runtime.contents.every((content) => ['male', 'female', 'neutral'].includes(content.filterGender)));
});

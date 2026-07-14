import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'entre_sabios_runtime.json'), 'utf8'));

function createBookSandbox() {
  const sandbox = { console, window: null };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const relativePath of [
    'js/data/catalogs.js',
    'js/data/books.js',
    'js/data/emotional-taxonomy.js',
    'js/core/normalization.js',
  ]) {
    vm.runInContext(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'), sandbox, { filename: relativePath });
  }
  sandbox.authorBookAliases = sandbox.EntreSabiosData.authorBookAliases;
  const mainScript = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
  vm.runInContext(mainScript.slice(0, mainScript.indexOf('let history')), sandbox, { filename: 'script-book-normalization.js' });
  sandbox.preferenceProfile = { books: {} };
  sandbox.currentIntensity = 'moderada';
  sandbox.history = [];
  vm.runInContext('globalThis.__normalizedBooks = normalizedBookCatalog', sandbox);
  vm.runInContext(fs.readFileSync(path.join(rootDir, 'js/core/book-matching.js'), 'utf8'), sandbox, { filename: 'book-matching.js' });
  return sandbox;
}

function createStory(sandbox, content, intensity, primaryFeeling = content.primaryFeeling) {
  const normalizedThemes = (content.themes || []).map(sandbox.normalizeTheme);
  return {
    key: content.id,
    inspirationSource: content.inspirationSource,
    displayAuthor: content.displayedAuthor,
    author: content.author,
    rawTags: content.themes,
    temas: content.themes,
    emotionalState: {
      primaryFeeling,
      secondaryFeelings: [],
      feelings: [primaryFeeling],
      intensity,
      rootThemeDefinitions: normalizedThemes.map((theme) => ({ theme })),
    },
  };
}

test('catálogo publicável preserva somente títulos ativos e descrições editoriais são explícitas', () => {
  const sandbox = createBookSandbox();
  const books = sandbox.__normalizedBooks;
  const identities = books.map((book) => `${sandbox.normalizeTheme(book.title)}|${sandbox.normalizeTheme(book.author)}`);
  assert.equal(new Set(identities).size, identities.length, 'há livro duplicado após a normalização');
  assert.ok(books.some((book) => book.title === 'A Primeira e Última Liberdade'));
  assert.ok(books.some((book) => book.title === 'Irmã Outsider'));
  assert.ok(!books.some((book) => book.title === 'A Liberdade Primeira e Última'));
  assert.ok(!books.some((book) => book.title === 'A Irmã Exterior'));
  assert.ok(!books.some((book) => book.title === 'Em Busca de Nós Mesmos'));
  assert.equal(books.filter((book) => book.hasEditorialDescription).length, 30);
  assert.ok(books.filter((book) => book.hasEditorialDescription).every((book) => book.description.length >= 45));
});

test('todas as recomendações do runtime possuem relação substantiva, intensidade e descrição', () => {
  const sandbox = createBookSandbox();
  const evaluated = [];
  for (const content of runtime.contents) {
    const primaryFeelings = content.primaryFeeling
      ? [content.primaryFeeling]
      : runtime.feelings.map((feeling) => feeling.id);
    for (const primaryFeeling of primaryFeelings) {
      for (const intensity of content.suitableIntensities) {
        const recommendation = sandbox.recommendBookForStory(createStory(sandbox, content, intensity, primaryFeeling));
        evaluated.push(recommendation);
        if (!recommendation) continue;
        assert.equal(recommendation.isEligible, true);
        assert.equal(recommendation.isExcluded, false);
        assert.equal(recommendation.intensityFit, 1);
        assert.equal(recommendation.book.hasEditorialDescription, true);
        assert.ok(recommendation.book.description);
        assert.equal(recommendation.hasSubstantiveRelation, true);
        assert.ok(recommendation.primaryFeelingMatch
          || recommendation.rootThemeMatches.length
          || recommendation.contentThemeMatches.length);
      }
    }
  }
  assert.ok(evaluated.some(Boolean), 'nenhum contexto recebeu recomendação');
  assert.ok(evaluated.some((recommendation) => !recommendation), 'a ausência segura nunca foi exercitada');
});

test('mesmo autor não torna uma obra irrelevante elegível', () => {
  const sandbox = createBookSandbox();
  const content = runtime.contents.find((item) => item.id === 'Aristóteles-2');
  const recommendation = sandbox.recommendBookForStory(createStory(sandbox, content, 'moderada'));
  assert.notEqual(recommendation?.book.title, 'Ética a Nicômaco');
  assert.ok(!recommendation || recommendation.hasSubstantiveRelation);
});

test('ausência de relação confiável devolve null em vez do primeiro livro', () => {
  const sandbox = createBookSandbox();
  const story = {
    inspirationSource: 'Autor sem catálogo',
    rawTags: ['tema_sem_correspondencia'],
    temas: ['tema_sem_correspondencia'],
    emotionalState: {
      primaryFeeling: 'sentimento_sem_catalogo',
      secondaryFeelings: [],
      feelings: ['sentimento_sem_catalogo'],
      intensity: 'moderada',
      rootThemeDefinitions: [{ theme: 'tema_sem_correspondencia' }],
    },
  };
  assert.equal(sandbox.recommendBookForStory(story), null);
});

test('rotação evita repetir livro recente quando existe alternativa elegível', () => {
  const sandbox = createBookSandbox();
  const content = runtime.contents.find((item) => item.id === 'batch03-quote-022');
  const story = createStory(sandbox, content, 'moderada');
  const titles = [];
  for (let index = 0; index < 4; index += 1) {
    const recommendation = sandbox.recommendBookForStory(story);
    assert.ok(recommendation);
    titles.push(recommendation.book.title);
    sandbox.history.push({ book: recommendation.book });
  }
  assert.equal(new Set(titles).size, titles.length);
});

test('interface explica a relação concreta e oculta somente a recomendação ausente', () => {
  const makeElement = () => ({ textContent: '', hidden: false });
  const sandbox = {
    bookRecommendationEl: makeElement(),
    bookTextEl: makeElement(),
    bookReasonEl: makeElement(),
    recommendBookForStory: () => ({
      book: {
        title: 'Livro verificado',
        author: 'Autoria verificada',
        description: 'A obra investiga como o medo altera a percepção e restringe escolhas possíveis.',
      },
      score: null,
      reasons: ['sentimento principal'],
      commonThemes: ['medo', 'percepção'],
      sameAuthor: false,
    }),
  };
  vm.createContext(sandbox);
  const uiSource = fs.readFileSync(path.join(rootDir, 'js/ui/reflection-ui.js'), 'utf8');
  vm.runInContext(uiSource, sandbox);
  const story = { emotionalState: { primaryFeeling: 'medo' } };

  sandbox.updateBookRecommendation(story);
  assert.equal(sandbox.bookRecommendationEl.hidden, false);
  assert.equal(sandbox.bookTextEl.textContent, 'Livro verificado, de Autoria verificada');
  assert.match(sandbox.bookReasonEl.textContent, /investiga como o medo/i);
  assert.match(sandbox.bookReasonEl.textContent, /os temas medo e percepção/i);
  assert.doesNotMatch(sandbox.bookReasonEl.textContent, /função|clínic|travessia editorial|eco do sentimento/i);

  sandbox.recommendBookForStory = () => null;
  sandbox.updateBookRecommendation(story);
  assert.equal(sandbox.bookRecommendationEl.hidden, true);
  assert.equal(sandbox.bookTextEl.textContent, '');
  assert.equal(sandbox.bookReasonEl.textContent, '');
});

test('justificativa usa concordância correta quando existe somente um tema comum', () => {
  const makeElement = () => ({ textContent: '', hidden: false });
  const sandbox = {
    bookRecommendationEl: makeElement(),
    bookTextEl: makeElement(),
    bookReasonEl: makeElement(),
    recommendBookForStory: () => ({
      book: { title: 'Dhammapada', author: 'Buda', description: 'Ensinamentos sobre sofrimento.' },
      score: null,
      reasons: [],
      commonThemes: ['sofrimento'],
      sameAuthor: false,
    }),
  };
  vm.createContext(sandbox);
  const uiSource = fs.readFileSync(path.join(rootDir, 'js/ui/reflection-ui.js'), 'utf8');
  vm.runInContext(uiSource, sandbox);
  sandbox.updateBookRecommendation({ emotionalState: { primaryFeeling: 'tristeza' } });
  assert.match(sandbox.bookReasonEl.textContent, /o tema sofrimento, que também sustenta esta reflexão/i);
  assert.doesNotMatch(sandbox.bookReasonEl.textContent, /sofrimento, temas/i);
});

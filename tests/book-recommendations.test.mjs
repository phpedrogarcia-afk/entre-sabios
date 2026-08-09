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
    bookRecommendation: content.bookRecommendation,
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
  assert.equal(books.filter((book) => book.hasEditorialDescription).length, 65);
  assert.ok(books.filter((book) => book.hasEditorialDescription).every((book) => book.description.length >= 45));
});

test('os 27 conteúdos V2-001 e V2-002 recebem a recomendação editorial coerente', () => {
  const cases = [
    ['v2-tri-001-rilke', 'Cartas a um jovem poeta', 'moderada'],
    ['v2-tri-002-tagore', 'Fruit-Gathering', 'moderada'],
    ['v2-tri-003-nietzsche', 'Aurora', 'moderada'],
    ['v2-sol-001-pessoa', 'O Livro do Desassossego', 'moderada'],
    ['v2-sol-002-krishnamurti', 'Comentários sobre o Viver', 'moderada'],
    ['v2-sol-003-rilke', 'Cartas a um jovem poeta', 'moderada'],
    ['v2-ans-001-seneca', 'Cartas a Lucílio', 'moderada'],
    ['v2-ans-002-krishnamurti', 'O Livro da Vida', 'moderada'],
    ['v2-ans-003-gita', 'Bhagavad Gita', 'moderada'],
    ['v2-med-001-montaigne', 'Ensaios', 'moderada'],
    ['v2-med-002-krishnamurti', 'A Primeira e Última Liberdade', 'moderada'],
    ['v2-med-003-epicteto', 'Manual de Epicteto', 'moderada'],
    ['v2-med-004-rilke-dragoes', 'Cartas a um jovem poeta', 'moderada'],
    ['v2-med-005-epicuro', 'Carta a Meneceu', 'moderada'],
    ['v2-med-006-nietzsche', 'Assim Falou Zaratustra', 'moderada'],
    ['v2-ins-001-epicteto', 'Manual de Epicteto', 'moderada'],
    ['v2-ins-002-dostoievski', 'Memórias do Subsolo', 'moderada'],
    ['v2-ins-003-marco-aurelio', 'Meditações', 'moderada'],
    ['v2-con-001-rilke', 'Cartas a um jovem poeta', 'moderada'],
    ['v2-con-002-gita', 'Bhagavad Gita', 'moderada'],
    ['v2-con-003-krishnamurti', 'Comentários sobre o Viver', 'moderada'],
    ['v2-cul-001-dhammapada', 'Dhammapada', 'moderada'],
    ['v2-cul-002-nietzsche', 'Genealogia da Moral', 'moderada'],
    ['v2-cul-003-arendt', 'A Condição Humana', 'moderada'],
    ['v2-rai-001-seneca', 'Sobre a Ira', 'moderada'],
    ['v2-rai-002-aristoteles', 'Retórica', 'moderada'],
    ['v2-rai-003-gita', 'Bhagavad Gita', 'moderada'],
  ];

  for (const [contentId, title, intensity] of cases) {
    const sandbox = createBookSandbox();
    const content = runtime.contents.find((item) => item.id === contentId);
    const book = sandbox.__normalizedBooks.find((item) => item.title === title);
    assert.ok(content, `${contentId} ausente do runtime`);
    assert.ok(book, `${title} ausente do catálogo`);
    const story = createStory(sandbox, content, intensity);
    const candidate = sandbox.evaluateBookCandidate(book, story);
    assert.equal(candidate.isEligible, true, `${title} não é elegível para ${contentId}`);
    assert.equal(candidate.primaryFeelingMatch, true, `${title} não preserva o sentimento principal`);
    assert.equal(candidate.intensityFit, 1, `${title} não cobre a intensidade aprovada`);
    const recommendation = sandbox.recommendBookForStory(story);
    assert.equal(recommendation?.book.title, title, `${contentId} recebeu ${recommendation?.book.title || 'nenhuma obra'}`);
  }
});

test('os seis conteúdos V2-003A possuem os livros aprovados como candidatos elegíveis', () => {
  const sandbox = createBookSandbox();
  const cases = [
    ['v2-amo-001-krishnamurti', 'Sobre o amor e a solidão', 'moderada'],
    ['v2-amo-002-gibran', 'O Profeta', 'fraca'],
    ['v2-amo-003-dostoievski', 'Os Irmãos Karamázov', 'moderada'],
    ['v2-sau-001-garrett', 'Folhas Caídas', 'moderada'],
    ['v2-sau-002-machado', 'Dom Casmurro', 'fraca'],
    ['v2-sau-003-camoes', 'Rimas', 'fraca'],
  ];
  for (const [contentId, title, intensity] of cases) {
    const content = runtime.contents.find((item) => item.id === contentId);
    const book = sandbox.__normalizedBooks.find((item) => item.title === title);
    assert.ok(content, `${contentId} ausente do runtime`);
    assert.ok(book, `${title} ausente do catálogo`);
    const candidate = sandbox.evaluateBookCandidate(book, createStory(sandbox, content, intensity));
    assert.equal(candidate.isEligible, true, `${title} não é elegível para ${contentId}`);
    assert.equal(candidate.primaryFeelingMatch, true, `${title} não preserva o sentimento principal`);
    assert.equal(candidate.intensityFit, 1, `${title} não cobre a intensidade aprovada`);
  }
});

test('os 57 conteúdos V2 resolvem exatamente o vínculo editorial, mesmo com o livro no histórico recente', () => {
  const sandbox = createBookSandbox();
  assert.equal(runtime.contents.length, 57);
  for (const content of runtime.contents) {
    assert.ok(content.bookRecommendation?.bookTitle, `${content.id} não possui vínculo editorial`);
    const linkedBooks = sandbox.__normalizedBooks.filter(
      (book) => sandbox.normalizeTheme(book.title) === sandbox.normalizeTheme(content.bookRecommendation.bookTitle),
    );
    assert.equal(linkedBooks.length, 1, `${content.id} não resolve para exatamente um livro`);
    sandbox.history = [{ book: linkedBooks[0] }];
    const recommendation = sandbox.recommendBookForStory(
      createStory(sandbox, content, content.suitableIntensities[0]),
    );
    assert.equal(recommendation?.book.title, content.bookRecommendation.bookTitle, `${content.id} perdeu o vínculo na rotação`);
    assert.ok(recommendation?.specificLink, `${content.id} usou o fallback genérico`);
  }
});

test('conteúdo sem vínculo preserva o recomendador genérico', () => {
  const sandbox = createBookSandbox();
  const content = runtime.contents.find((item) => item.id === 'v2-tri-001-rilke');
  const story = createStory(sandbox, { ...content, bookRecommendation: null }, 'moderada');
  assert.ok(sandbox.recommendBookForStory(story)?.book);
});

test('vínculo inexistente registra erro e cai com segurança no recomendador genérico', () => {
  const sandbox = createBookSandbox();
  const errors = [];
  sandbox.console = { ...console, error: (message) => errors.push(message) };
  const content = runtime.contents.find((item) => item.id === 'v2-tri-001-rilke');
  const story = createStory(sandbox, { ...content, bookRecommendation: { bookTitle: 'Título inexistente' } }, 'moderada');
  assert.ok(sandbox.recommendBookForStory(story)?.book);
  assert.match(errors[0], /ausente ou ambiguo/);
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
        if (!recommendation.specificLink) assert.equal(recommendation.intensityFit, 1);
        assert.equal(recommendation.book.hasEditorialDescription, true);
        assert.ok(recommendation.book.description);
        assert.equal(recommendation.hasSubstantiveRelation, true);
        if (!recommendation.specificLink) {
          assert.ok(recommendation.primaryFeelingMatch
            || recommendation.rootThemeMatches.length
            || recommendation.contentThemeMatches.length);
        }
      }
    }
  }
  assert.ok(evaluated.some(Boolean), 'nenhum contexto recebeu recomendação');
  assert.ok(evaluated.every(Boolean), 'todo contexto publicado deve receber recomendação substantiva');
});

test('mesmo autor não torna uma obra irrelevante elegível', () => {
  const sandbox = createBookSandbox();
  const content = runtime.contents.find((item) => item.id === 'v2-rai-002-aristoteles');
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
  const content = runtime.contents.find((item) => item.id === 'v2-med-001-montaigne');
  const story = createStory(sandbox, { ...content, bookRecommendation: null }, 'moderada');
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

test('interface apresenta os três blocos editoriais do vínculo específico', () => {
  const makeElement = () => ({ textContent: '', hidden: false });
  const sandbox = {
    bookRecommendationEl: makeElement(), bookTextEl: makeElement(), bookReasonEl: makeElement(),
    recommendBookForStory: () => ({
      book: { title: 'Cartas a um jovem poeta', author: 'Rainer Maria Rilke', description: 'Descrição genérica.' },
      score: null, reasons: [], commonThemes: [], sameAuthor: true,
      specificLink: {
        whyItMatches: 'Relação editorial exata.',
        whatReaderFinds: 'Cartas sobre formação interior.',
        whereToStart: 'Carta de 12 de agosto de 1904.',
      },
    }),
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(rootDir, 'js/ui/reflection-ui.js'), 'utf8'), sandbox);
  sandbox.updateBookRecommendation({ emotionalState: { primaryFeeling: 'tristeza' } });
  assert.equal(sandbox.bookTextEl.textContent, 'Cartas a um jovem poeta, de Rainer Maria Rilke');
  assert.match(sandbox.bookReasonEl.textContent, /Por que este livro\? Relação editorial exata\./);
  assert.match(sandbox.bookReasonEl.textContent, /O que o leitor encontrará\? Cartas sobre formação interior\./);
  assert.match(sandbox.bookReasonEl.textContent, /Por onde começar\? Carta de 12 de agosto de 1904\./);
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

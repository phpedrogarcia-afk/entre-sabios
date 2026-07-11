// Normalização e inferência de conteúdo filosófico.
// Extraído de script.js na Fase 3 da refatoração segura.
// Não alterar pesos, regras ou comportamento nesta fase.

function inferTone(authorName) {
  const entry = Object.entries(authorToneProfiles).find(([, authors]) => authors.includes(authorName));
  return entry?.[0] || 'contemplativo';
}

function inferContentFeelings(tags) {
  const normalizedTags = new Set(tags.map(normalizeTheme));
  return feelingsCatalog
    .filter((feeling) => feeling.themes.some((theme) => normalizedTags.has(normalizeTheme(theme))) || normalizedTags.has(feeling.id))
    .map((feeling) => feeling.id);
}

function inferTextThemes(text, tags) {
  const normalizedText = normalizeTheme(text).replace(/_/g, ' ');
  const themes = new Set(tags.map(normalizeTheme));
  Object.entries(textThemeKeywords).forEach(([theme, keywords]) => {
    if (keywords.some((keyword) => normalizedText.includes(normalizeTheme(keyword).replace(/_/g, ' ')))) {
      themes.add(normalizeTheme(theme));
    }
  });
  return Array.from(themes);
}

function inferIntensities(tone, depth) {
  if (tone === 'confrontador') return ['fraca', 'moderada'];
  if (tone === 'analítico' && depth >= 5) return ['fraca', 'moderada'];
  if (tone === 'acolhedor' || tone === 'direto') return ['fraca', 'moderada', 'intensa'];
  return ['moderada', 'intensa'];
}

function inferIncompatibleStates(tone) {
  const family = getToneFamily(tone);
  if (family === 'confrontador') return ['ansiedade:intensa', 'medo:intensa', 'tristeza:intensa', 'culpa:intensa', 'luto:intensa'];
  if (family === 'analítico') return ['confusão:intensa'];
  return [];
}

function normalizePerspectiveContent() {
  return perspectiveContentDb.map((item, index) => ({
    author: item.autor, displayAuthor: item.autor, quote: item.frase, contentType: 'quote', variantIndex: 2000 + index,
    quoteType: 'inspired', source: `Leitura editorial inspirada em ${item.autor}`, tags: item.temas,
    _tagsN: item.temas.map(normalizeTheme), sentimentos: item.sentimentos, intensidade: item.intensidade,
    temas: item.temas.map(normalizeTheme), tom: item.tom, profundidade: item.profundidade,
    incompativeis: inferIncompatibleStates(item.tom), adviceTemplate: () => item.conselho,
    reflectionTemplate: () => item.explicacao, curatedExplanation: item.explicacao,
    curatedAdvice: item.conselho, curatedBook: item.livro, curatedId: item.id,
    philosophy: `${item.autor} oferece aqui uma perspectiva ligada a ${item.tradicao}, com tom ${item.tom.replace(/_/g, ' e ')}.`,
  }));
}

function normalizeCuratedContent() {
  return curatedContentDb.map((item, index) => ({
    author: item.autor,
    displayAuthor: item.autor,
    quote: item.frase || item.texto,
    contentType: item.contentType || (item.texto ? 'text' : 'quote'),
    variantIndex: 1000 + index,
    quoteType: item.quoteType || 'inspired',
    source: item.source || '',
    tags: item.temas,
    _tagsN: item.temas.map(normalizeTheme),
    sentimentos: item.sentimentos,
    intensidade: item.intensidade,
    temas: item.temas.map(normalizeTheme),
    tom: item.tom,
    profundidade: item.profundidade,
    incompativeis: inferIncompatibleStates(item.tom),
    adviceTemplate: () => item.conselho,
    reflectionTemplate: () => item.explicacao,
    curatedExplanation: item.explicacao,
    curatedAdvice: item.conselho,
    curatedBook: item.livro,
    curatedId: item.id,
  }));
}

function normalizeAuthorTagsDb() {
  // Pré-normalização e expansão das variações para reduzir repetição.
  return authorsDb.flatMap((a) => {
    const quoteVariants = (authorQuoteVariants[a.author] || [a.quote]).map((entry) => {
      const quote = typeof entry === 'string' ? entry : entry.text;
      return {
      text: clarityRewrites[quote] || quote,
      contentType: 'quote',
      source: typeof entry === 'string' ? '' : entry.source,
    };
    });
    const textVariants = [
      ...(authorTextVariants[a.author] || []),
      ...(supplementalTextVariants[a.author] || []),
    ].map((entry) => ({
      ...entry,
      contentType: 'text',
    }));

    return [...quoteVariants, ...textVariants].map((entry, variantIndex) => {
      const quote = entry.text;
      const verified = verifiedQuoteMetadata[quote];
      const tone = inferTone(a.author);
      const depth = entry.contentType === 'text' ? 5 : Math.min(5, 3 + Math.floor(quote.length / 90));
      const themes = inferTextThemes(quote, a.tags);
      return {
        ...a,
        quote,
        variantIndex,
        contentType: entry.contentType,
        quoteType: verified?.type || (verified ? 'exact' : 'inspired'),
        displayAuthor: verified?.author || a.author,
        source: verified?.source || entry.source || '',
        _tagsN: a.tags.map(normalizeTheme),
        sentimentos: inferContentFeelings(a.tags),
        intensidade: inferIntensities(tone, depth),
        temas: themes,
        tom: tone,
        profundidade: depth,
        incompativeis: inferIncompatibleStates(tone),
      };
    });
  });
}

function normalizeContentKey(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

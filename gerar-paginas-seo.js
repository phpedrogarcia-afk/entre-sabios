const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SITE_URL = 'https://www.entresabios.com';
const LASTMOD = '2026-07-10';
const SCRIPT_VERSION = '20260710-9';
const STYLE_VERSION = '20260710-5';
const SOCIAL_IMAGE = `${SITE_URL}/assets/entre-sabios-social.png`;

const ROOT = __dirname;
const DATA_SCRIPTS = [
  'js/data/catalogs.js',
  'js/data/authors.js',
  'js/data/books.js',
  'js/data/share-themes.js',
  'js/data/tales.js',
  'js/data/metadata.js',
  'js/data/quotes/base.js',
  'js/data/quotes/batch-01.js',
  'js/data/quotes/batch-02.js',
  'js/data/quotes/batch-03.js',
  'js/data/quotes/batch-04.js',
  'js/data/quotes/batch-05.js',
  'js/data/quotes/batch-06.js',
  'js/data/quotes/batch-07.js',
  'js/data/quotes/batch-08.js',
  'js/data/quotes/index.js',
  'js/data/perspectives.js',
  'js/data/matching-rules.js',
];
const CORE_SCRIPTS = [
  'js/core/normalization.js',
  'js/core/emotional-state.js',
  'js/core/content-normalizer.js',
  'js/core/matching.js',
  'js/core/book-matching.js',
];
const FEATURE_SCRIPTS = [
  'js/features/feedback.js',
  'js/features/favorites.js',
  'js/features/sharing.js',
  'js/features/tales.js',
  'js/features/visitors.js',
];
const UI_SCRIPTS = [
  'js/ui/feelings-ui.js',
  'js/ui/daily-ui.js',
  'js/ui/reflection-ui.js',
  'js/ui/effects-ui.js',
];
const PREFERRED_AUTHORS = [
  'Jiddu Krishnamurti', 'Nisargadatta Maharaj', 'Chögyam Trungpa', 'Nietzsche', 'Platão',
  'Marco Aurélio', 'Epicteto', 'Sêneca', 'Clarice Lispector', 'Dostoiévski',
  'Fernando Pessoa', 'Rumi', 'Carl Jung', 'Schopenhauer', 'Lao-Tsé', 'Sócrates',
];

function canvasContext() {
  return {
    clearRect() {}, fillRect() {}, drawImage() {}, fillText() {}, beginPath() {}, moveTo() {},
    lineTo() {}, quadraticCurveTo() {}, bezierCurveTo() {}, closePath() {}, fill() {}, stroke() {},
    save() {}, restore() {}, clip() {}, arc() {}, translate() {}, rotate() {}, scale() {},
    measureText(text) { return { width: String(text).length * 10 }; },
    createLinearGradient() { return { addColorStop() {} }; },
  };
}

function mockElement() {
  return {
    innerHTML: '', textContent: '', value: '', checked: false, className: '', style: {}, dataset: {},
    width: 1200, height: 900,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    appendChild() {}, addEventListener() {}, removeEventListener() {}, setAttribute() {}, removeAttribute() {},
    querySelector() { return mockElement(); }, querySelectorAll() { return []; },
    getContext() { return canvasContext(); },
    toBlob(cb) { cb(new Blob(['x'])); },
    toDataURL() { return 'data:image/png;base64,'; },
  };
}

function loadProjectData() {
  const storage = { getItem() { return null; }, setItem() {}, removeItem() {} };
  const sandbox = {
    console,
    Blob,
    Image: function Image() {},
    fetch: async () => ({ ok: false, json: async () => ({}) }),
    setTimeout() {},
    clearTimeout() {},
    URL: { createObjectURL() { return 'blob:x'; }, revokeObjectURL() {} },
    localStorage: storage,
    sessionStorage: storage,
    navigator: { share: null, clipboard: null },
    window: {
      addEventListener() {},
      matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {} }; },
      location: { href: SITE_URL },
      navigator: { share: null, clipboard: null },
    },
    document: {
      getElementById() { return mockElement(); },
      querySelector() { return mockElement(); },
      querySelectorAll() { return []; },
      createElement() { return mockElement(); },
      addEventListener() {},
    },
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  DATA_SCRIPTS.forEach((file) => {
    const dataSrc = fs.readFileSync(path.join(ROOT, file), 'utf8');
    vm.runInContext(dataSrc, sandbox);
  });
  CORE_SCRIPTS.forEach((file) => {
    const coreSrc = fs.readFileSync(path.join(ROOT, file), 'utf8');
    vm.runInContext(coreSrc, sandbox);
  });
  FEATURE_SCRIPTS.forEach((file) => {
    const featureSrc = fs.readFileSync(path.join(ROOT, file), 'utf8');
    vm.runInContext(featureSrc, sandbox);
  });
  UI_SCRIPTS.forEach((file) => {
    const uiSrc = fs.readFileSync(path.join(ROOT, file), 'utf8');
    vm.runInContext(uiSrc, sandbox);
  });
  const src = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
  vm.runInContext(`${src}
globalThis.__seoData = {
  feelingsCatalog,
  philosophicalTales,
  authorsDbNormalized,
  thinkerProfiles,
  normalizedBookCatalog
};`, sandbox);
  return sandbox.__seoData;
}

function loadEssaysData() {
  const file = path.join(ROOT, 'ensaios-data.json');
  if (!fs.existsSync(file)) {
    return {
      section: {
        title: 'Ensaios',
        intro: 'Investigações sobre os medos, desejos e perguntas que atravessam a experiência humana, à luz de grandes pensadores.',
        editorialNote: 'Um conflito humano. Um pensador. Uma investigação profunda.',
      },
      essays: [],
    };
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content, 'utf8');
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

function stripAccents(text) {
  return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function slugify(text) {
  return stripAccents(text)
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeTheme(text) {
  return stripAccents(text).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

function titleCaseFromId(id) {
  return String(id).split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function humanTheme(theme) {
  const key = normalizeTheme(theme);
  const labels = {
    consciencia: 'consciência',
    identificacao: 'identificação',
    observacao: 'observação',
    nao_dualidade: 'não-dualidade',
    autoconhecimento: 'autoconhecimento',
    ansiedade: 'ansiedade',
    confusao: 'confusão',
    medo: 'medo',
    solidao: 'solidão',
    proposito: 'propósito',
    falta_de_proposito: 'falta de propósito',
    acao_consciente: 'ação consciente',
    aceitacao: 'aceitação',
    coracao: 'coração',
    impermanencia: 'impermanência',
    desconstrucao: 'desconstrução',
    compaixao: 'compaixão',
    presenca: 'presença',
    silencio: 'silêncio',
    sabedoria: 'sabedoria',
    liberdade: 'liberdade',
    responsabilidade: 'responsabilidade',
    reparacao: 'reparação',
    autocompaixao: 'autocompaixão',
    condicao_humana: 'condição humana',
    controle_emocional: 'controle emocional',
    espiritualidade: 'espiritualidade',
    introspeccao: 'introspecção',
    melancolia: 'melancolia',
    direcao: 'direção',
    sofrimento: 'sofrimento',
    luto: 'luto',
    saudade: 'saudade',
    esperanca: 'esperança',
    coragem: 'coragem',
    raiva: 'raiva',
    culpa: 'culpa',
    tristeza: 'tristeza',
  };
  return labels[key] || String(theme).replace(/_/g, ' ');
}

const feelingCopy = {
  ansiedade: {
    h1: 'Ansiedade segundo a filosofia: quando a mente tenta viver antes do tempo',
    intro: 'A ansiedade costuma transformar possibilidades em ameaças. No Entre Sábios, ela é tratada como um convite para observar a mente, separar fatos de antecipações e recuperar presença.',
    explanation: 'Filósofos estoicos, pensadores contemplativos e mestres da observação direta ajudam a perceber que nem todo pensamento urgente merece governo. A pergunta filosófica não é apenas como eliminar a ansiedade, mas como não confundir a vida inteira com o medo do próximo instante.',
  },
  medo: {
    h1: 'Medo na filosofia: coragem, liberdade e o que ainda pode ser escolhido',
    intro: 'O medo protege, mas também pode estreitar a vida. A filosofia ajuda a distinguir prudência de prisão interior.',
    explanation: 'Quando o medo aparece, os grandes pensadores perguntam o que realmente está em risco, o que depende de nós e qual pequena atitude ainda preserva dignidade. Coragem não é ausência de medo; é uma resposta mais lúcida diante dele.',
  },
  amor: {
    h1: 'Amor segundo os pensadores: vínculo, presença e liberdade',
    intro: 'O amor pode abrir a vida, mas também revelar apego, saudade e desejo de posse.',
    explanation: 'No Entre Sábios, o amor aparece como uma experiência que pede presença e responsabilidade. Os pensadores ajudam a diferenciar cuidado de controle, entrega de dependência e vínculo de domínio.',
  },
  saudade: {
    h1: 'Saudade e filosofia: memória, ausência e continuidade',
    intro: 'A saudade é uma presença que ficou sem corpo imediato. Ela lembra que vínculos continuam trabalhando em nós.',
    explanation: 'A reflexão filosófica não tenta apagar a saudade. Ela procura dar forma à memória para que a ausência não seja apenas vazio, mas também reconhecimento do que teve valor.',
  },
  esperança: {
    h1: 'Esperança na filosofia: sentido, travessia e próximo passo',
    intro: 'Esperança não é negar a dificuldade. É encontrar uma razão para continuar respondendo à vida.',
    explanation: 'Quando tudo parece suspenso, a esperança filosófica pergunta qual gesto ainda pode carregar sentido. Ela não precisa ser grandiosa; muitas vezes nasce de uma tarefa simples, de uma responsabilidade ou de uma direção pequena.',
  },
  solidão: {
    h1: 'Solidão segundo a filosofia: silêncio, presença e pertencimento',
    intro: 'A solidão pode doer como abandono ou amadurecer como escuta interior.',
    explanation: 'Pensadores e poetas mostram que estar só não significa necessariamente estar vazio. A solidão pode revelar necessidades, vínculos ausentes e também uma forma mais honesta de presença consigo mesmo.',
  },
  'confusão': {
    h1: 'Confusão e filosofia: clareza quando as respostas ainda não chegaram',
    intro: 'A confusão surge quando antigas explicações já não bastam e uma nova compreensão ainda não se formou.',
    explanation: 'A filosofia não trata a confusão como fracasso. Muitas vezes, ela é o começo de uma investigação mais honesta: observar, perguntar melhor e suportar alguns instantes sem conclusão apressada.',
  },
  autoconhecimento: {
    h1: 'Autoconhecimento: observar a si mesmo sem fugir do que aparece',
    intro: 'Conhecer-se não é criar uma imagem perfeita, mas olhar com precisão para pensamentos, desejos, medos e contradições.',
    explanation: 'O Entre Sábios aproxima autoconhecimento de responsabilidade interior. A pergunta não é “como pareço?”, mas “o que realmente está se movendo em mim, e que resposta isso pede?”.',
  },
  coragem: {
    h1: 'Coragem na filosofia: agir sem esperar que o medo desapareça',
    intro: 'Coragem é uma forma de presença diante do risco, da mudança e da responsabilidade.',
    explanation: 'Os pensadores tratam a coragem como prática. Ela nasce em escolhas concretas: assumir um passo, sustentar um limite, dizer a verdade possível e continuar quando a vida exige firmeza.',
  },
  raiva: {
    h1: 'Raiva e filosofia: limites, dignidade e resposta consciente',
    intro: 'A raiva pode revelar uma fronteira violada, mas também pode arrastar a pessoa para reações que pioram a ferida.',
    explanation: 'A filosofia ajuda a escutar o que a raiva denuncia sem entregar a ela todo o comando. Entre repressão e explosão, existe a possibilidade de limite, dignidade e ação proporcional.',
  },
  culpa: {
    h1: 'Culpa segundo a filosofia: responsabilidade sem autopunição infinita',
    intro: 'A culpa pode prender a pessoa no passado ou abrir caminho para reparação.',
    explanation: 'Pensar a culpa filosoficamente é perguntar se ela está produzindo consciência ou apenas castigo interior. O ponto não é negar o erro, mas transformar lucidez em responsabilidade possível.',
  },
  luto: {
    h1: 'Luto e filosofia: perda, memória e amor depois da ausência',
    intro: 'O luto não é um problema a resolver rapidamente. É uma travessia do amor quando a presença mudou de forma.',
    explanation: 'A filosofia e a literatura ajudam a dar linguagem à perda. Não para diminuir a dor, mas para impedir que ela seja vivida completamente sem companhia, memória ou sentido.',
  },
  tristeza: {
    h1: 'Tristeza na filosofia: escutar a dor sem reduzir a vida a ela',
    intro: 'A tristeza pode ser sinal de perda, cansaço, desencanto ou necessidade de cuidado.',
    explanation: 'A reflexão filosófica não transforma tristeza em defeito. Ela pergunta o que essa dor está mostrando e como atravessá-la sem negar sua realidade nem fazer dela a única verdade.',
  },
  falta_de_proposito: {
    h1: 'Falta de propósito: quando a vida pede sentido e direção',
    intro: 'A falta de propósito aparece quando a pessoa continua andando, mas já não sabe por que caminho vale a pena seguir.',
    explanation: 'Os pensadores ajudam a deslocar a pergunta de uma missão grandiosa para um próximo gesto verdadeiro. Sentido não é sempre descoberto de uma vez; muitas vezes é construído em responsabilidade, presença e ação.',
  },
};

function siteHeader(prefix = '../..') {
  return `<header class="topbar seo-topbar">
  <a class="brand" href="${prefix}/" aria-label="Entre Sábios, página inicial">
    <div class="brand-icon" aria-hidden="true"></div>
    <div class="brand-text">
      <div class="brand-title">ENTRE SÁBIOS</div>
      <div class="brand-subtitle">Reflexões para a vida</div>
    </div>
  </a>
  <a class="seo-home-link" href="${prefix}/">Encontrar uma reflexão</a>
</header>`;
}

function pageShell({ title, description, canonical, ogType = 'website', body, structuredData, prefix = '../..' }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-9591SHYV5M"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-9591SHYV5M');
  </script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7691321285448824" crossorigin="anonymous"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="Entre Sábios" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:image" content="${SOCIAL_IMAGE}" />
  <meta property="og:image:alt" content="Entre Sábios: reflexões filosóficas para momentos da vida." />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="stylesheet" href="${prefix}/style.css?v=${STYLE_VERSION}" />
  <link rel="stylesheet" href="${prefix}/seo.css?v=${LASTMOD.replaceAll('-', '')}-1" />
  ${structuredData ? jsonLd(structuredData) : ''}
</head>
<body class="seo-page">
  ${siteHeader(prefix)}
  <main class="seo-container">
    ${body}
  </main>
</body>
</html>
`;
}

function pillLinks(items, basePath) {
  return items.map((item) => `<a class="seo-pill" href="${basePath}/${item.slug}/">${escapeHtml(item.label)}</a>`).join('\n');
}

function quoteList(items) {
  return items.slice(0, 4).map((item) => `<blockquote>
  <p>${escapeHtml(item.quote)}</p>
  <footer>— ${escapeHtml(item.displayAuthor || item.author)}${item.source ? ` · ${escapeHtml(item.source)}` : ''}</footer>
</blockquote>`).join('\n');
}

function paragraphList(items) {
  return items.slice(0, 2).map((item) => `<p>${escapeHtml(item.quote)}</p>`).join('\n');
}

function getAuthorSlug(author) {
  return slugify(author);
}

function uniqueBy(list, keyFn) {
  const seen = new Set();
  return list.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderFeelingPages(data, urls) {
  const feelings = data.feelingsCatalog.map((f) => ({ ...f, slug: slugify(f.id.replace(/_/g, '-')), label: f.label || titleCaseFromId(f.id) }));
  const taleLinksByFeeling = new Map();
  data.philosophicalTales.forEach((tale) => {
    (tale.sentimentosRelacionados || []).forEach((feeling) => {
      const list = taleLinksByFeeling.get(feeling) || [];
      list.push({ label: tale.titulo, slug: slugify(tale.id || tale.titulo) });
      taleLinksByFeeling.set(feeling, list);
    });
  });

  feelings.forEach((feeling) => {
    const copy = feelingCopy[feeling.id] || {
      h1: `${feeling.label} segundo a filosofia`,
      intro: `Uma página do Entre Sábios para pensar ${feeling.label.toLowerCase()} a partir de frases e reflexões do acervo.`,
      explanation: 'A filosofia ajuda a transformar sentimentos em perguntas mais claras, sem negar a complexidade do que está sendo vivido.',
    };

    const relatedContent = data.authorsDbNormalized
      .filter((item) => (item.sentimentos || []).includes(feeling.id))
      .sort((a, b) => (b.profundidade || 0) - (a.profundidade || 0));
    const generatedAuthorNames = new Set(PREFERRED_AUTHORS);
    const authors = uniqueBy(relatedContent.filter((item) => generatedAuthorNames.has(item.author)), (item) => item.author)
      .slice(0, 7)
      .map((item) => ({ label: item.displayAuthor || item.author, slug: getAuthorSlug(item.author) }));
    const quotes = relatedContent.filter((item) => item.contentType === 'quote');
    const texts = relatedContent.filter((item) => item.contentType === 'text');
    const tales = uniqueBy(taleLinksByFeeling.get(feeling.id) || [], (item) => item.slug).slice(0, 5);
    const canonical = `${SITE_URL}/sentimentos/${feeling.slug}/`;

    const body = `<article class="seo-card">
  <nav class="seo-breadcrumb"><a href="../../">Entre Sábios</a> <span>/</span> <span>Sentimentos</span></nav>
  <h1>${escapeHtml(copy.h1)}</h1>
  <p class="seo-lead">${escapeHtml(copy.intro)}</p>
  <section>
    <h2>Uma leitura filosófica desse sentimento</h2>
    <p>${escapeHtml(copy.explanation)}</p>
  </section>
  <section>
    <h2>Pensadores relacionados</h2>
    <div class="seo-pills">${pillLinks(authors, '../../pensadores')}</div>
  </section>
  <section>
    <h2>Frases do acervo</h2>
    ${quoteList(quotes)}
  </section>
  <section>
    <h2>Pequenos trechos reflexivos</h2>
    ${paragraphList(texts)}
  </section>
  <section>
    <h2>Contos filosóficos relacionados</h2>
    <div class="seo-pills">${pillLinks(tales, '../../contos')}</div>
  </section>
  <section class="seo-cta">
    <h2>Como você está se sentindo agora?</h2>
    <p>Escolha seus sentimentos e encontre uma reflexão para o seu momento.</p>
    <a class="seo-button" href="../../">Encontrar uma reflexão</a>
  </section>
</article>`;

    writeFile(path.join(ROOT, 'sentimentos', feeling.slug, 'index.html'), pageShell({
      title: `${copy.h1} — Entre Sábios`,
      description: copy.intro,
      canonical,
      body,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: copy.h1,
        description: copy.intro,
        url: canonical,
        isPartOf: { '@type': 'WebSite', name: 'Entre Sábios', url: SITE_URL },
      },
    }));
    urls.push(canonical);
  });
}

function renderTalePages(data, urls) {
  const feelingLabels = new Map(data.feelingsCatalog.map((f) => [f.id, f.label]));
  data.philosophicalTales.forEach((tale) => {
    const slug = slugify(tale.id || tale.titulo);
    const canonical = `${SITE_URL}/contos/${slug}/`;
    const themes = (tale.temas || []).map((label) => ({ label: humanTheme(label), slug: slugify(label) }));
    const feelings = (tale.sentimentosRelacionados || []).map((id) => ({ label: feelingLabels.get(id) || titleCaseFromId(id), slug: slugify(id.replace(/_/g, '-')) }));
    const taleThemeSet = new Set([...(tale.temas || []), ...(tale.palavrasChave || []), ...(tale.sentimentosRelacionados || [])].map(normalizeTheme));
    const related = data.philosophicalTales
      .filter((other) => other.id !== tale.id)
      .map((other) => {
        const otherSet = new Set([...(other.temas || []), ...(other.palavrasChave || []), ...(other.sentimentosRelacionados || [])].map(normalizeTheme));
        const score = [...taleThemeSet].reduce((total, item) => total + (otherSet.has(item) ? 1 : 0), 0);
        return { other, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ other }) => ({ label: other.titulo, slug: slugify(other.id || other.titulo) }));
    const description = `${tale.titulo}: uma história de ${tale.origem || 'tradição filosófica'} sobre ${(tale.temas || []).slice(0, 3).join(', ')}.`;

    const body = `<article class="seo-card seo-article">
  <nav class="seo-breadcrumb"><a href="../../">Entre Sábios</a> <span>/</span> <span>Contos Filosóficos</span></nav>
  <h1>${escapeHtml(tale.titulo)}</h1>
  <p class="seo-lead">${escapeHtml(description)}</p>
  <div class="seo-meta">
    <span>Origem: ${escapeHtml(tale.origem || 'Tradição filosófica')}</span>
    <span>Tradição: ${escapeHtml(tale.tradicao || 'Sabedoria clássica')}</span>
    <span>📖 Leitura de aproximadamente ${escapeHtml(tale.tempoLeitura || 3)} minutos</span>
  </div>
  <section>
    <h2>O conto</h2>
    ${(tale.texto || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('\n')}
  </section>
  <section>
    <h2>O que este conto nos ensina?</h2>
    ${(tale.explicacaoFilosofica || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('\n')}
  </section>
  <section>
    <h2>Pergunta para reflexão</h2>
    <p class="seo-question">${escapeHtml(tale.perguntaReflexao || 'Que parte desta história conversa com o seu momento?')}</p>
  </section>
  <section>
    <h2>Sentimentos relacionados</h2>
    <div class="seo-pills">${pillLinks(feelings, '../../sentimentos')}</div>
  </section>
  <section>
    <h2>Temas</h2>
    <div class="seo-tags">${themes.map((t) => `<span>${escapeHtml(t.label)}</span>`).join('')}</div>
  </section>
  <section>
    <h2>Outros contos relacionados</h2>
    <div class="seo-pills">${pillLinks(related, '../../contos')}</div>
  </section>
  <section class="seo-cta">
    <h2>Esta história encontrou algo em você?</h2>
    <p>Escolha o que está sentindo e encontre uma reflexão filosófica para este momento.</p>
    <a class="seo-button" href="../../">Encontrar uma reflexão</a>
  </section>
</article>`;

    writeFile(path.join(ROOT, 'contos', slug, 'index.html'), pageShell({
      title: `${tale.titulo} — Contos Filosóficos | Entre Sábios`,
      description,
      canonical,
      ogType: 'article',
      body,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: tale.titulo,
        description,
        mainEntityOfPage: canonical,
        image: SOCIAL_IMAGE,
        publisher: { '@type': 'Organization', name: 'Entre Sábios' },
      },
    }));
    urls.push(canonical);
  });
}

function renderThinkerPages(data, urls) {
  const validFeelings = new Set(data.feelingsCatalog.map((f) => f.id));
  const feelingLabels = new Map(data.feelingsCatalog.map((f) => [f.id, f.label]));
  const existingAuthors = new Set(data.authorsDbNormalized.map((item) => item.author));
  PREFERRED_AUTHORS.filter((author) => existingAuthors.has(author)).forEach((author) => {
    const content = data.authorsDbNormalized.filter((item) => item.author === author);
    const slug = getAuthorSlug(author);
    const canonical = `${SITE_URL}/pensadores/${slug}/`;
    const themes = uniqueBy(content.flatMap((item) => item.temas || []).map((theme) => ({ label: humanTheme(theme), slug: slugify(theme) })), (item) => item.slug).slice(0, 10);
    const feelings = uniqueBy(content.flatMap((item) => item.sentimentos || [])
      .filter((id) => validFeelings.has(id))
      .map((id) => ({ label: feelingLabels.get(id) || titleCaseFromId(id), slug: slugify(id.replace(/_/g, '-')) })), (item) => item.slug).slice(0, 8);
    const quotes = content.filter((item) => item.contentType === 'quote');
    const texts = content.filter((item) => item.contentType === 'text');
    const profile = data.thinkerProfiles[author] || `${author} aparece no acervo do Entre Sábios por sua contribuição para pensar sentimentos, escolhas e vida interior.`;
    const description = `${author} no Entre Sábios: reflexões sobre ${themes.slice(0, 4).map((t) => t.label).join(', ')}.`;
    const themeSet = new Set(themes.map((t) => normalizeTheme(t.label)));
    const relatedTales = data.philosophicalTales
      .map((tale) => {
        const taleSet = new Set([...(tale.temas || []), ...(tale.palavrasChave || [])].map(normalizeTheme));
        const score = [...themeSet].reduce((total, theme) => total + (taleSet.has(theme) ? 1 : 0), 0);
        return { tale, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ tale }) => ({ label: tale.titulo, slug: slugify(tale.id || tale.titulo) }));

    const body = `<article class="seo-card">
  <nav class="seo-breadcrumb"><a href="../../">Entre Sábios</a> <span>/</span> <span>Pensadores</span></nav>
  <h1>${escapeHtml(author)}: reflexões para momentos da vida</h1>
  <p class="seo-lead">${escapeHtml(profile)}</p>
  <section>
    <h2>Os temas que atravessam seu pensamento</h2>
    <div class="seo-tags">${themes.map((t) => `<span>${escapeHtml(t.label)}</span>`).join('')}</div>
  </section>
  <section>
    <h2>Frases existentes no acervo</h2>
    ${quoteList(quotes)}
  </section>
  <section>
    <h2>Reflexões de ${escapeHtml(author)} para momentos da vida</h2>
    ${paragraphList(texts)}
    <div class="seo-pills">${pillLinks(feelings, '../../sentimentos')}</div>
  </section>
  <section>
    <h2>Contos e narrativas relacionadas</h2>
    <div class="seo-pills">${pillLinks(relatedTales, '../../contos')}</div>
  </section>
  <section class="seo-cta">
    <h2>Qual dessas questões está mais presente em você hoje?</h2>
    <p>Escolha um sentimento e receba uma reflexão alinhada ao seu momento.</p>
    <a class="seo-button" href="../../">Encontrar uma reflexão</a>
  </section>
</article>`;

    writeFile(path.join(ROOT, 'pensadores', slug, 'index.html'), pageShell({
      title: `${author} — Reflexões filosóficas | Entre Sábios`,
      description,
      canonical,
      body,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${author} — Entre Sábios`,
        description,
        url: canonical,
        isPartOf: { '@type': 'WebSite', name: 'Entre Sábios', url: SITE_URL },
      },
    }));
    urls.push(canonical);
  });
}

function renderEssaysPages(essaysData, urls) {
  const section = essaysData.section || {};
  const essays = Array.isArray(essaysData.essays) ? essaysData.essays.filter((essay) => essay.status !== 'draft') : [];
  const canonical = `${SITE_URL}/ensaios/`;

  const cards = essays.length
    ? essays.map((essay) => {
      const url = `./${escapeHtml(essay.slug)}/`;
      return `<article class="essay-card">
        <div class="essay-kicker">${escapeHtml(essay.theme || 'Ensaio')}</div>
        <h2><a href="${url}">${escapeHtml(essay.title)}</a></h2>
        <p>${escapeHtml(essay.subtitle || '')}</p>
        <div class="essay-meta">
          <span>${escapeHtml(essay.thinker || 'Entre Sábios')}</span>
          <span>Leitura de aproximadamente ${escapeHtml(essay.readingTime || 8)} minutos</span>
        </div>
      </article>`;
    }).join('\n')
    : `<div class="essay-empty">
        <p>Os primeiros ensaios estão em preparação editorial. Esta área será publicada em ritmo lento: um texto por vez, com investigação, revisão e cuidado de fontes.</p>
      </div>`;

  const body = `<article class="seo-card essays-index">
  <nav class="seo-breadcrumb"><a href="../">Entre Sábios</a> <span>/</span> <span>Ensaios</span></nav>
  <p class="essay-section-label">Ensaios</p>
  <h1>${escapeHtml(section.title || 'Ensaios')}</h1>
  <p class="seo-lead">${escapeHtml(section.intro || 'Investigações filosóficas para experiências humanas reais.')}</p>
  <p class="essay-editorial-note">${escapeHtml(section.editorialNote || 'Um conflito humano. Um pensador. Uma investigação profunda.')}</p>
  <section>
    <h2>Ensaios disponíveis</h2>
    <div class="essays-grid">${cards}</div>
  </section>
  <section class="seo-cta">
    <h2>E você, o que está sentindo agora?</h2>
    <p>Entre Sábios relaciona seu momento a reflexões de filósofos, escritores e grandes pensadores.</p>
    <a class="seo-button" href="../">Encontrar uma reflexão</a>
  </section>
</article>`;

  writeFile(path.join(ROOT, 'ensaios', 'index.html'), pageShell({
    title: 'Ensaios — Entre Sábios',
    description: section.intro || 'Investigações filosóficas sobre conflitos humanos, à luz de grandes pensadores.',
    canonical,
    prefix: '..',
    body,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Ensaios — Entre Sábios',
      description: section.intro || 'Investigações filosóficas sobre conflitos humanos.',
      url: canonical,
      isPartOf: { '@type': 'WebSite', name: 'Entre Sábios', url: SITE_URL },
    },
  }));
  urls.push(canonical);

  essays.forEach((essay) => {
    const essayCanonical = `${SITE_URL}/ensaios/${essay.slug}/`;
    const image = essay.image ? `${SITE_URL}/${essay.image.replace(/^\/+/, '')}` : SOCIAL_IMAGE;
    const paragraphs = Array.isArray(essay.paragraphs) ? essay.paragraphs : [];
    const sources = Array.isArray(essay.sources) ? essay.sources : [];
    const links = Array.isArray(essay.links) ? essay.links : [];
    const body = `<article class="seo-card essay-page">
  <nav class="seo-breadcrumb"><a href="../../">Entre Sábios</a> <span>/</span> <a href="../">Ensaios</a></nav>
  <p class="essay-section-label">${escapeHtml(essay.theme || 'Ensaio')}</p>
  <h1>${escapeHtml(essay.title)}</h1>
  <p class="seo-lead">${escapeHtml(essay.subtitle || '')}</p>
  <div class="seo-meta">
    <span>Ensaio editorial — Entre Sábios</span>
    <span>Pensador principal: ${escapeHtml(essay.thinker || '')}</span>
    <span>Leitura de aproximadamente ${escapeHtml(essay.readingTime || 8)} minutos</span>
  </div>
  ${essay.image ? `<img class="essay-hero" src="../../${escapeHtml(essay.image)}" alt="${escapeHtml(essay.imageAlt || essay.title)}" width="1200" height="675" loading="eager" />` : ''}
  <section class="essay-body">
    ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n')}
  </section>
  ${essay.finalQuestion ? `<section><h2>Pergunta final</h2><p class="seo-question">${escapeHtml(essay.finalQuestion)}</p></section>` : ''}
  ${sources.length ? `<section><h2>Fontes e leituras</h2><ul class="essay-sources">${sources.map((source) => `<li>${escapeHtml(source)}</li>`).join('')}</ul></section>` : ''}
  ${links.length ? `<section><h2>Leituras relacionadas</h2><div class="seo-pills">${links.map((link) => `<a class="seo-pill" href="../../${escapeHtml(link.href).replace(/^\/+/, '')}">${escapeHtml(link.label)}</a>`).join('')}</div></section>` : ''}
  <section class="seo-cta">
    <h2>E você, o que está sentindo agora?</h2>
    <p>Escolha seu momento e encontre uma reflexão filosófica para atravessá-lo com mais clareza.</p>
    <a class="seo-button" href="../../">Encontrar uma reflexão</a>
  </section>
</article>`;

    writeFile(path.join(ROOT, 'ensaios', essay.slug, 'index.html'), pageShell({
      title: `${essay.title} — Ensaios | Entre Sábios`,
      description: essay.metaDescription || essay.subtitle || section.intro,
      canonical: essayCanonical,
      ogType: 'article',
      body,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: essay.title,
        description: essay.metaDescription || essay.subtitle || section.intro,
        mainEntityOfPage: essayCanonical,
        image,
        publisher: { '@type': 'Organization', name: 'Entre Sábios' },
      },
    }));
    urls.push(essayCanonical);
  });
}

function writeSitemap(urls) {
  const uniqueUrls = Array.from(new Set([`${SITE_URL}/`, ...urls])).sort((a, b) => {
    if (a === `${SITE_URL}/`) return -1;
    if (b === `${SITE_URL}/`) return 1;
    return a.localeCompare(b);
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map((url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${url === `${SITE_URL}/` ? 'weekly' : 'monthly'}</changefreq>
    <priority>${url === `${SITE_URL}/` ? '1.0' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>
`;
  writeFile(path.join(ROOT, 'sitemap.xml'), xml);
}

function main() {
  const data = loadProjectData();
  const essaysData = loadEssaysData();
  cleanDir(path.join(ROOT, 'sentimentos'));
  cleanDir(path.join(ROOT, 'contos'));
  cleanDir(path.join(ROOT, 'pensadores'));
  cleanDir(path.join(ROOT, 'ensaios'));
  const urls = [];
  renderFeelingPages(data, urls);
  renderTalePages(data, urls);
  renderThinkerPages(data, urls);
  renderEssaysPages(essaysData, urls);
  writeSitemap(urls);
  console.log(`SEO gerado: ${urls.length + 1} URLs no sitemap.`);
}

main();

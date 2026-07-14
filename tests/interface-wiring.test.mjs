import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const embeddedRuntimeScript = fs.readFileSync(path.join(rootDir, 'data', 'entre_sabios_runtime.js'), 'utf8');
const runtimeLoaderScript = fs.readFileSync(path.join(rootDir, 'js', 'core', 'runtime-loader.js'), 'utf8');
const matchingScript = fs.readFileSync(path.join(rootDir, 'js', 'core', 'matching.js'), 'utf8');
const feedbackScript = fs.readFileSync(path.join(rootDir, 'js', 'features', 'feedback.js'), 'utf8');
const feelingsScript = fs.readFileSync(path.join(rootDir, 'js', 'ui', 'feelings-ui.js'), 'utf8');
const reflectionUiScript = fs.readFileSync(path.join(rootDir, 'js', 'ui', 'reflection-ui.js'), 'utf8');
const sharingScript = fs.readFileSync(path.join(rootDir, 'js', 'features', 'sharing.js'), 'utf8');
const layoutCss = fs.readFileSync(path.join(rootDir, 'css', 'layout.css'), 'utf8');
const componentsCss = fs.readFileSync(path.join(rootDir, 'css', 'components.css'), 'utf8');
const landscapeScrollCss = fs.readFileSync(path.join(rootDir, 'css', 'landscape-scroll-fix.css'), 'utf8');
const tabletCss = fs.readFileSync(path.join(rootDir, 'css', 'tablet.css'), 'utf8');

test('HTML carrega runtime e não carrega bancos editoriais legados', () => {
  assert.match(html, /runtime-engine\.js/);
  assert.match(html, /data\/entre_sabios_runtime\.js\?v=definitiva-2\.1/);
  assert.match(html, /runtime-loader\.js/);
  for (const legacy of ['authors.js', 'quotes/base.js', 'quotes/batch-', 'perspectives.js', 'content-normalizer.js']) {
    assert.ok(!html.includes(legacy), `Script legado ainda carregado: ${legacy}`);
  }
});

test('script principal não referencia bancos editoriais antigos', () => {
  for (const legacy of ['authorsDb', 'authorQuoteVariants', 'authorTextVariants', 'supplementalTextVariants', 'curatedContentDb', 'perspectiveContentDb']) {
    assert.ok(!script.includes(legacy), `Banco legado ainda referenciado: ${legacy}`);
  }
});

test('interface possui estado de carregamento e não exibe preferência pessoal de autoria', () => {
  assert.match(html, /id="contentLoadStatus"/);
  assert.doesNotMatch(html, /name="genderPreference"|PREFERÊNCIA DE AUTORIA/);
  assert.match(html, /id="generateBtn"[^>]*disabled/);
  assert.doesNotMatch(script, /currentGenderPreference|genderRadioEls|initGenderPreference/);
  assert.doesNotMatch(matchingScript, /genderPreference/);
  assert.doesNotMatch(feedbackScript, /preferenceProfile\.authors/);
});

test('sentimentos são montados antes do carregamento assíncrono do acervo', () => {
  assert.match(script, /feelingsCatalog\s*=\s*Array\.isArray\(window\.EntreSabiosData\.feelingsCatalog\)/);
  const initBlock = script.slice(script.indexOf('async function init()'));
  assert.ok(initBlock.indexOf('initFeelings();') < initBlock.indexOf('await window.EntreSabiosRuntimeLoader.loadRuntimeContent()'));
});

test('acervo incorporado habilita a reflexão sem depender de fetch local', async () => {
  const sandbox = {
    console: { info() {} },
    fetch() { throw new Error('fetch não deve ser chamado com o acervo incorporado'); },
  };
  vm.runInNewContext(embeddedRuntimeScript, sandbox);
  vm.runInNewContext(runtimeLoaderScript, sandbox);
  const loaded = await sandbox.EntreSabiosRuntimeLoader.loadRuntimeContent();
  assert.equal(loaded.contentVersion, 'definitiva-2.1');
  assert.equal(loaded.contents.length, 283);
  assert.equal(loaded.feelings.length, 14);
});

test('troca de sentimento ou intensidade não apaga a rotação recente', () => {
  assert.doesNotMatch(feelingsScript, /runtimeSelector\?\.clear\(\)/);
});

test('explicação usa somente texto específico e oculta o bloco quando ele não existe', () => {
  assert.match(html, /id="explanationBlock"/);
  assert.match(html, /js\/data\/editorial-explanations\.js/);
  assert.match(script, /function getSpecificEditorialExplanation\(content\)/);
  assert.match(script, /entry\.finalText !== content\.finalText/);
  assert.match(script, /const reflection = getSpecificEditorialExplanation\(content\)/);
  assert.doesNotMatch(script, /const functionCopy\s*=/);
  assert.match(reflectionUiScript, /explanationBlockEl\.hidden = !hasSpecificExplanation/);
  assert.match(reflectionUiScript, /hasSpecificExplanation \? story\.reflection : ''/);
});

test('orientação usa somente conteúdo específico, contexto curado e rótulo editorial', () => {
  assert.match(html, /id="adviceBlock"/);
  assert.match(html, /id="adviceTitle"/);
  assert.match(html, /js\/data\/editorial-guidance\.js/);
  assert.match(script, /function getSpecificEditorialGuidance\(content, state\)/);
  assert.match(script, /entry\.finalText !== content\.finalText/);
  assert.match(script, /allowedFeelings\.includes\(primaryFeeling\)/);
  assert.match(script, /allowedIntensities\.includes\(intensity\)/);
  assert.match(script, /const editorialGuidance = getSpecificEditorialGuidance\(content, selection\.state\)/);
  assert.doesNotMatch(script, /const adviceFunctionCopy\s*=/);
  assert.doesNotMatch(script, /Permita que a reflexão acompanhe este momento/);
  assert.match(reflectionUiScript, /adviceBlockEl\.hidden = !hasSpecificAdvice/);
  assert.match(reflectionUiScript, /adviceTitleEl\.textContent = hasSpecificAdvice \? story\.adviceLabel : ''/);
  assert.match(reflectionUiScript, /adviceTextEl\.textContent = hasSpecificAdvice \? story\.advice : ''/);
  assert.match(html, /<\/div>\s*<div class="book-rec" id="bookRecommendation" aria-live="polite">/);
});

test('renderização alterna orientação presente e ausente sem ocultar o livro', () => {
  const makeElement = () => ({
    textContent: '',
    innerHTML: '',
    hidden: false,
    disabled: true,
    classList: { remove() {}, toggle() {} },
    appendChild() {},
  });
  const sandbox = {
    currentStory: null,
    currentStoryShownAt: 0,
    quoteTextEl: makeElement(),
    likeBtn: makeElement(),
    dislikeBtn: makeElement(),
    favoriteBtn: makeElement(),
    explanationTitleEl: makeElement(),
    quoteAuthorEl: makeElement(),
    quoteSourceEl: makeElement(),
    explanationBlockEl: makeElement(),
    reflectionTextEl: makeElement(),
    philosophyBlockEl: makeElement(),
    philosophyTitleEl: makeElement(),
    philosophyTextEl: makeElement(),
    adviceBlockEl: makeElement(),
    adviceTitleEl: makeElement(),
    adviceTextEl: makeElement(),
    bookRecommendationEl: makeElement(),
    bookTextEl: makeElement(),
    bookReasonEl: makeElement(),
    tagsRowEl: makeElement(),
    preferenceNoteEl: makeElement(),
    document: { createElement: makeElement },
    recommendBookForStory: () => ({
      book: { title: 'Livro seguro', author: 'Autor real', bookFunction: 'validacao', clinicalNote: '' },
      score: 1,
      reasons: [],
      commonThemes: [],
      sameAuthor: false,
    }),
    updateFeedbackButtons() {},
    updateFavoriteUi() {},
    updateShareCardPreview() {},
  };
  vm.createContext(sandbox);
  vm.runInContext(reflectionUiScript, sandbox);
  const baseStory = {
    quote: 'Uma frase específica.',
    displayAuthor: 'Autoria rastreável',
    contentType: 'quote',
    reflection: '',
    philosophy: 'Contexto do pensador.',
    philosophyLabel: 'CONHEÇA O PENSADOR',
    source: null,
    tags: [],
  };

  sandbox.renderStory({ ...baseStory, advice: 'Uma orientação específica.', adviceLabel: 'UMA ORIENTAÇÃO' });
  assert.equal(sandbox.adviceBlockEl.hidden, false);
  assert.equal(sandbox.adviceTitleEl.textContent, 'UMA ORIENTAÇÃO');
  assert.equal(sandbox.adviceTextEl.textContent, 'Uma orientação específica.');
  assert.equal(sandbox.bookTextEl.textContent, 'Livro seguro, de Autor real');

  sandbox.renderStory({ ...baseStory, advice: '', adviceLabel: '' });
  assert.equal(sandbox.adviceBlockEl.hidden, true);
  assert.equal(sandbox.adviceTitleEl.textContent, '');
  assert.equal(sandbox.adviceTextEl.textContent, '');
  assert.equal(sandbox.bookTextEl.textContent, 'Livro seguro, de Autor real');
});

test('apresentação de autoria, fonte e perfil evita fallbacks editoriais enganosos', () => {
  const makeElement = () => ({
    textContent: '',
    innerHTML: '',
    hidden: false,
    disabled: true,
    classList: { remove() {}, toggle() {} },
    appendChild() {},
  });
  const sandbox = {
    currentStory: null,
    currentStoryShownAt: 0,
    quoteTextEl: makeElement(),
    likeBtn: makeElement(),
    dislikeBtn: makeElement(),
    favoriteBtn: makeElement(),
    explanationTitleEl: makeElement(),
    quoteAuthorEl: makeElement(),
    quoteSourceEl: makeElement(),
    explanationBlockEl: makeElement(),
    reflectionTextEl: makeElement(),
    philosophyBlockEl: makeElement(),
    philosophyTitleEl: makeElement(),
    philosophyTextEl: makeElement(),
    adviceBlockEl: makeElement(),
    adviceTitleEl: makeElement(),
    adviceTextEl: makeElement(),
    bookRecommendationEl: makeElement(),
    bookTextEl: makeElement(),
    bookReasonEl: makeElement(),
    tagsRowEl: makeElement(),
    preferenceNoteEl: makeElement(),
    document: { createElement: makeElement },
    recommendBookForStory: () => null,
    updateFeedbackButtons() {},
    updateFavoriteUi() {},
    updateShareCardPreview() {},
  };
  vm.createContext(sandbox);
  vm.runInContext(reflectionUiScript, sandbox);

  const baseStory = {
    quote: 'Uma frase rastreável.',
    contentType: 'quote',
    reflection: '',
    advice: '',
    adviceLabel: '',
    tags: [],
  };
  sandbox.renderStory({
    ...baseStory,
    displayAuthor: 'Autoria identificada',
    source: { title: 'Obra identificada', status: 'verified_translation_pending' },
    philosophy: 'Perfil editorial específico.',
    philosophyLabel: 'CONHEÇA A TRADIÇÃO',
  });
  assert.equal(sandbox.quoteAuthorEl.textContent, '— Autoria identificada');
  assert.equal(sandbox.quoteSourceEl.hidden, false);
  assert.equal(sandbox.quoteSourceEl.textContent, 'Fonte: Obra identificada');
  assert.equal(sandbox.philosophyBlockEl.hidden, false);
  assert.equal(sandbox.philosophyTitleEl.textContent, 'CONHEÇA A TRADIÇÃO');

  sandbox.renderStory({ ...baseStory, displayAuthor: '', source: null, philosophy: '', philosophyLabel: '' });
  assert.equal(sandbox.quoteAuthorEl.textContent, '— Autoria em revisão');
  assert.equal(sandbox.quoteSourceEl.hidden, true);
  assert.equal(sandbox.quoteSourceEl.textContent, '');
  assert.equal(sandbox.philosophyBlockEl.hidden, true);
  assert.equal(sandbox.philosophyTitleEl.textContent, '');
  assert.equal(sandbox.philosophyTextEl.textContent, '');
});

test('livro usa o recomendador existente e oculta somente o subbloco quando não há relação segura', () => {
  const bookMatchingScript = fs.readFileSync(path.join(rootDir, 'js', 'core', 'book-matching.js'), 'utf8');
  assert.match(html, /id="bookRecommendation"/);
  assert.match(script, /const bookRecommendationEl = document\.getElementById\('bookRecommendation'\)/);
  assert.match(bookMatchingScript, /hasSubstantiveRelation/);
  assert.match(bookMatchingScript, /book\.hasEditorialDescription/);
  assert.match(bookMatchingScript, /candidate\.isEligible/);
  assert.match(bookMatchingScript, /if \(!recommendation\) return null/);
  assert.match(reflectionUiScript, /bookRecommendationEl\.hidden = true/);
  assert.match(reflectionUiScript, /bookRecommendationEl\.hidden = false/);
  assert.doesNotMatch(reflectionUiScript, /função editorial|função clínica|travessia editorial|continuidade ao conselho/);
});

test('sentimento principal só muda por seleção inicial, remoção ou ação explícita de foco', () => {
  const listeners = new Map();
  const selectedFeelingIds = new Set(['tristeza', 'inseguranca', 'medo']);
  const sandbox = {
    selectedFeelingIds,
    primaryFeelingId: 'tristeza',
    lastSelectionSignature: 'assinatura-atual',
    currentStory: null,
    currentIntensity: 'moderada',
    feelingsCatalog: [
      { id: 'tristeza', label: 'Tristeza' },
      { id: 'inseguranca', label: 'Insegurança' },
      { id: 'medo', label: 'Medo' },
    ],
    feelingsGridEl: { querySelectorAll: () => [] },
    primaryFeelingControlEl: { hidden: false },
    primaryFeelingLabelEl: { textContent: '' },
    secondaryFeelingActionsEl: {
      set innerHTML(value) { this.children = []; },
      children: [],
      appendChild(button) { this.children.push(button); },
    },
    generateBtn: { classList: { toggle() {} } },
    selectionHintEl: { textContent: '' },
    taleHintEl: null,
    intensityRadioEls: [{ value: 'intensa', addEventListener: (type, listener) => listeners.set(type, listener) }],
    getSelectedFeelingIds: () => [...selectedFeelingIds],
    normalizeTheme: (value) => value,
    document: {
      createElement() {
        const buttonListeners = new Map();
        return {
          addEventListener: (type, listener) => buttonListeners.set(type, listener),
          setAttribute() {},
          click: () => buttonListeners.get('click')?.(),
        };
      },
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(feelingsScript, sandbox);

  sandbox.syncSelectedCards();
  assert.equal(sandbox.primaryFeelingId, 'tristeza', 'adicionar ou reordenar secundários mudou o principal');

  sandbox.initIntensity();
  listeners.get('change')();
  assert.equal(sandbox.primaryFeelingId, 'tristeza', 'mudar intensidade mudou o principal');

  const insecurityFocus = sandbox.secondaryFeelingActionsEl.children.find((button) => button.textContent.startsWith('Insegurança'));
  insecurityFocus.click();
  assert.equal(sandbox.primaryFeelingId, 'inseguranca', 'a ação explícita de foco não mudou o principal');

  const newPhraseBlock = script.slice(script.indexOf('function newPhrase()'), script.indexOf('// =========================\n// Compartilhamento como imagem'));
  assert.doesNotMatch(newPhraseBlock, /primaryFeelingId\s*=/, 'Outra perspectiva altera o principal');
});

test('ajustes discretos de presença, assinatura e compartilhamento da frase estão ligados', () => {
  assert.match(html, /Presentes:\s*<span id="contador-online">0<\/span>/);
  assert.doesNotMatch(html, /Presentes agora:/);
  assert.match(html, /id="quoteShareBtn"[^>]+aria-label="Compartilhar esta reflexão"/);
  assert.match(html, /id="quoteShareBtn"[\s\S]*?<svg[^>]+aria-hidden="true"/);
  assert.match(script, /quoteShareBtn\.addEventListener\('click',[\s\S]*?shareReflectionImage\(/);
  assert.match(sharingScript, /fillText\('entresabios\.com'/);
  assert.match(sharingScript, /fillText\('ENTRE SÁBIOS'/);
  assert.match(componentsCss, /\.quote-share\s*\{[\s\S]*?top:\s*8px;[\s\S]*?left:\s*8px;/);
  assert.match(componentsCss, /\.quote-share:focus-visible\s*\{[\s\S]*?outline:/);
});

test('compartilhamento preserva escolha manual e sorteia apenas no atalho da frase', () => {
  const styles = [...html.matchAll(/data-share-style="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(styles, ['cream', 'sage', 'blue']);
  assert.match(sharingScript, /function getRandomShareStyle\(\)[\s\S]*?Object\.keys\(shareCardThemes\)[\s\S]*?Math\.random\(\)/);
  assert.match(script, /quoteShareBtn\.addEventListener\('click',[\s\S]*?styleKey:\s*getRandomShareStyle\(\)/);
  assert.match(script, /whatsShareBtn\.addEventListener\('click',[\s\S]*?styleKey:\s*currentShareStyle/);
  assert.match(sharingScript, /drawShareCard\(\{\s*width\s*=\s*1080,\s*height\s*=\s*1920/);
});

test('compartilhamento possui Web Share progressivo e download sem botão de copiar mensagem', () => {
  assert.doesNotMatch(html, /copyShareBtn|Copiar mensagem/);
  assert.match(html, /O envio direto depende dos aplicativos disponíveis no dispositivo/);
  assert.match(sharingScript, /navigator\.canShare\(\{\s*files:\s*\[file\]\s*\}\)/);
  assert.doesNotMatch(sharingScript, /navigator\.clipboard|execCommand\('copy'\)|copyShareMessage/);
  assert.match(script, /navigator\.share\(\{[\s\S]*?files:\s*\[image\.file\]/);
  assert.match(script, /downloadBlob\(image\.blob, image\.filename\)/);
  assert.match(script, /error\?\.name\s*===\s*'AbortError'/);
  assert.doesNotMatch(script, /copyShareBtn|copyShareMessage/);
});

test('smartphone horizontal mantém a página principal rolável', () => {
  assert.match(html, /css\/landscape-scroll-fix\.css\?v=/);
  assert.match(landscapeScrollCss, /orientation:\s*landscape/);
  assert.match(landscapeScrollCss, /touch-action:\s*pan-y pinch-zoom/);
  assert.match(landscapeScrollCss, /\.shell\s*\{[\s\S]*?height:\s*auto !important/);
  assert.match(landscapeScrollCss, /\.col-left,[\s\S]*?overflow:\s*visible !important/);
});

test('modo claro é o padrão e a preferência noturna explícita continua disponível', () => {
  assert.match(html, /initialTheme\s*=\s*theme\s*===\s*'night'\s*\?\s*'night'\s*:\s*'day'/);
  assert.match(html, /colorScheme\s*=\s*initialTheme\s*===\s*'night'\s*\?\s*'dark'\s*:\s*'light'/);
  assert.match(script, /initThemeToggle\(\)/);
});

test('faixa diária respeita a preferência por movimento reduzido', () => {
  assert.match(layoutCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(layoutCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.daily-track\s*\{[\s\S]*?animation:\s*none/);
});

test('tablet em retrato recebe layout rolável de uma coluna', () => {
  assert.match(html, /css\/tablet\.css\?v=/);
  assert.match(tabletCss, /orientation:\s*portrait/);
  assert.match(tabletCss, /max-width:\s*1100px/);
  assert.match(tabletCss, /grid-template-columns:\s*minmax\(0, 1fr\) !important/);
  assert.match(tabletCss, /overflow-y:\s*visible !important/);
  assert.match(tabletCss, /\.tale-dialog\s*\{[\s\S]*?overflow-y:\s*auto/);
});

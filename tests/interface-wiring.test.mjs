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

test('ajustes discretos de presença, assinatura e compartilhamento da frase estão ligados', () => {
  assert.match(html, /Presentes:\s*<span id="contador-online">0<\/span>/);
  assert.doesNotMatch(html, /Presentes agora:/);
  assert.match(html, /id="quoteShareBtn"[^>]+aria-label="Compartilhar esta reflexão"/);
  assert.match(html, /id="quoteShareBtn"[\s\S]*?<svg[^>]+aria-hidden="true"/);
  assert.match(script, /quoteShareBtn\.addEventListener\('click',[\s\S]*?shareReflectionImage\(/);
  assert.match(sharingScript, /fillText\('entresabios\.com'/);
  assert.doesNotMatch(sharingScript, /fillText\('ENTRE SÁBIOS'/);
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

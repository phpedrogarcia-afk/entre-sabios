import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
const html = read('index.html');
const feelingsUi = read('js/ui/feelings-ui.js');
const componentsCss = read('css/components.css');
const responsiveCss = read('css/responsive.css');
const landscapeCss = read('css/landscape-scroll-fix.css');
const sprite = read('assets/icons/feelings-sprite.svg');

const expectedFeelings = [
  'ansiedade', 'medo', 'amor', 'saudade', 'esperanca', 'solidao', 'autoconhecimento',
  'confusao', 'inseguranca', 'raiva', 'culpa', 'luto', 'tristeza', 'falta_de_proposito',
];

test('painel preserva cópia, IDs funcionais e ausência de controles públicos removidos', () => {
  assert.match(html, /COMO VOCÊ ESTÁ SE SENTINDO\?/);
  assert.match(html, /Selecione um ou mais e escolha qual deve orientar a reflexão\./);
  for (const id of ['feelingsGrid', 'primaryFeelingControl', 'primaryFeelingLabel', 'secondaryFeelingActions', 'generateBtn', 'selectionHint']) {
    assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, id);
  }
  assert.doesNotMatch(html, /name="intensity"|motivationToggle|Como você quer receber esta reflexão/);
});

test('sprite local contém observador, pena e uma família completa de 14 ícones', () => {
  for (const id of ['observer', 'feather', ...expectedFeelings]) {
    assert.equal((sprite.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, id);
    assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, `símbolo interno ${id}`);
  }
  assert.equal((sprite.match(/viewBox="0 0 24 24"/g) || []).length, 16);
  assert.doesNotMatch(sprite, /<script|font-family|<image/i);
  assert.equal((sprite.match(/https?:\/\//g) || []).length, 1, 'somente o namespace SVG pode conter URL');
  assert.match(html, /<use href="#observer">/);
  assert.match(html, /<use href="#feather">/);
  assert.doesNotMatch(html, /assets\/icons\/feelings-sprite\.svg#/);
});

test('cada sentimento continua sendo um checkbox dentro do label e recebe seu SVG decorativo', () => {
  assert.match(feelingsUi, /document\.createElement\('label'\)/);
  assert.match(feelingsUi, /input\.type = 'checkbox'/);
  assert.match(feelingsUi, /input\.name = 'feelings'/);
  assert.match(feelingsUi, /card\.appendChild\(input\)[\s\S]*?card\.appendChild\(icon\)[\s\S]*?card\.appendChild\(text\)/);
  assert.match(feelingsUi, /icon\.setAttribute\('aria-hidden', 'true'\)/);
  assert.match(feelingsUi, /<use href="#\$\{feelingId\}">/);
  assert.doesNotMatch(feelingsUi, /addEventListener\('(keydown|pointerdown|touchstart)'/);
});

test('estado principal vem da lógica existente e permanece distinto do secundário', () => {
  assert.match(feelingsUi, /card\.classList\.toggle\('primary-feeling', id === primaryFeeling\)/);
  assert.match(feelingsUi, /selectedFeelingIds\.has\(id\)/);
  assert.match(componentsCss, /\.feeling\.selected:not\(\.primary-feeling\)/);
  assert.match(componentsCss, /\.feeling\.primary-feeling\s*\{/);
  assert.match(componentsCss, /\.feeling\.unavailable\s*\{/);
  assert.match(componentsCss, /\.feeling:focus-within\s*\{/);
  assert.doesNotMatch(componentsCss, /input:checked[^\n]*primary-feeling/);
});

test('medidas editoriais e botão atômico estão contratados sem deslocamento de conteúdo', () => {
  assert.match(componentsCss, /\.feelings-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,[\s\S]*?gap:\s*9px/);
  assert.match(componentsCss, /\.feeling\s*\{[\s\S]*?min-height:\s*48px[\s\S]*?border-radius:\s*10px/);
  assert.match(componentsCss, /\.feelings-heading-icon\s*\{[\s\S]*?width:\s*34px;[\s\S]*?height:\s*34px[\s\S]*?stroke-width:\s*1\.5/);
  assert.match(componentsCss, /\.feeling\s*\{[\s\S]*?grid-template-columns:\s*20px minmax\(0, 1fr\)[\s\S]*?gap:\s*9px/);
  assert.match(componentsCss, /\.feeling-icon\s*\{[\s\S]*?width:\s*20px;[\s\S]*?height:\s*20px/);
  assert.match(componentsCss, /\.feeling-icon svg,[\s\S]*?\.tip-icon\s*\{[\s\S]*?fill:\s*none;[\s\S]*?stroke:\s*currentColor;[\s\S]*?stroke-width:\s*1\.5;[\s\S]*?stroke-linecap:\s*round;[\s\S]*?stroke-linejoin:\s*round/);
  assert.match(componentsCss, /\.tip-icon\s*\{[\s\S]*?width:\s*28px;[\s\S]*?height:\s*28px/);
  assert.match(componentsCss, /\.primary\s*\{[\s\S]*?min-height:\s*52px[\s\S]*?border-radius:\s*999px/);
  assert.match(html, /id="generateBtn"[^>]*aria-busy="false"/);
  assert.match(componentsCss, /\.primary::after\s*\{[\s\S]*?position:\s*absolute/);
  assert.match(componentsCss, /\.tip-box\s*\{[\s\S]*?min-height:\s*96px/);
});

test('breakpoints preservam toque, duas colunas e quatro apenas quando há 120px por cartão', () => {
  assert.match(responsiveCss, /\.feeling\s*\{[\s\S]*?min-height:\s*56px/);
  assert.match(responsiveCss, /@media \(max-width:\s*520px\)/);
  assert.match(responsiveCss, /@media \(max-width:\s*520px\)[\s\S]*?grid-template-columns:\s*21px minmax\(0, 1fr\)[\s\S]*?gap:\s*12px[\s\S]*?\.feelings-heading-icon\s*\{[\s\S]*?width:\s*30px;[\s\S]*?\.tip-icon\s*\{[\s\S]*?width:\s*24px/);
  assert.match(landscapeCss, /min-width:\s*548px/);
  assert.match(landscapeCss, /grid-template-columns:\s*repeat\(4, minmax\(120px, 1fr\)\)/);
});

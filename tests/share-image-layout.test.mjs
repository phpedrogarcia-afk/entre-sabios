import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sharingScript = fs.readFileSync(path.join(rootDir, 'js', 'features', 'sharing.js'), 'utf8');
const runtime = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'entre_sabios_runtime.json'), 'utf8'));

function fontSize(font) {
  return Number(String(font).match(/([\d.]+)px/)?.[1] || 16);
}

function createCanvasHarness(story) {
  const calls = [];
  const context = {
    font: '16px serif',
    globalAlpha: 1,
    measureText(text) {
      return { width: [...String(text)].length * fontSize(this.font) * 0.54 };
    },
    fillText(text, x, y) {
      calls.push({ text: String(text), x, y, font: this.font, width: this.measureText(text).width });
    },
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
    beginPath() {}, moveTo() {}, arcTo() {}, closePath() {}, fill() {}, save() {}, restore() {},
    clip() {}, fillRect() {}, stroke() {}, bezierCurveTo() {}, translate() {}, rotate() {}, scale() {},
    lineTo() {}, rect() {},
  };
  const canvas = { width: 0, height: 0, getContext: () => context };
  const sandbox = {
    currentStory: story,
    currentShareStyle: 'sage',
    quoteTextEl: { textContent: '' },
    quoteAuthorEl: { textContent: '' },
    shareCardThemes: Object.fromEntries(['cream', 'sage', 'blue'].map((key) => [key, {
        page: '#fff', top: '#fff', bottom: '#ddd', glow: '#fff', leaf: '#aaa',
        leafDark: '#888', ink: '#111', muted: '#333', stroke: '#777',
      }])),
    document: { createElement: () => canvas },
    Math: Object.create(Math),
    URL, File: undefined,
  };
  sandbox.Math.random = () => 0.5;
  vm.createContext(sandbox);
  vm.runInContext(sharingScript, sandbox);
  return { sandbox, canvas, calls };
}

const scenarios = [
  {
    name: 'frase curta e autoria exata',
    story: { quote: 'Torna-te quem tu és.', displayAuthor: 'Píndaro', source: { title: 'Odes Píticas' } },
  },
  {
    name: 'frase média inspirada com acentos e travessão',
    story: {
      quote: 'Às vezes, a coragem não faz ruído — apenas permanece quando seria mais fácil partir.',
      displayAuthor: 'Leitura editorial inspirada em Søren Kierkegaard',
      source: { title: 'Temor e Tremor', status: 'verified_translation_pending' },
    },
  },
  {
    name: 'texto longo, multilinha e crédito longo',
    story: {
      quote: 'A atenção começa quando deixamos de exigir que a experiência confirme nossas certezas.\nNesse intervalo, o que parecia obstáculo pode revelar outra maneira de olhar, sem prometer respostas imediatas e sem apagar a dificuldade que ainda existe. '.repeat(3).trim(),
      displayAuthor: 'Fórmula tradicional de Píndaro retomada editorialmente por Friedrich Nietzsche',
      source: { title: 'Assim Falou Zaratustra — tradução editorial em revisão' },
    },
  },
];

for (const scenario of scenarios) {
  test(`cartão Stories preserva conteúdo: ${scenario.name}`, () => {
    const { sandbox, canvas, calls } = createCanvasHarness(scenario.story);
    sandbox.drawShareCard();
    assert.equal(canvas.width, 1080);
    assert.equal(canvas.height, 1920);
    assert.ok(calls.length > 3);
    assert.ok(calls.every((call) => call.x - call.width / 2 >= 0 && call.x + call.width / 2 <= canvas.width));
    assert.ok(calls.every((call) => call.y >= 0 && call.y <= canvas.height));
    assert.doesNotMatch(calls.map((call) => call.text).join(' '), /\[object Object\]/);
    assert.match(calls.map((call) => call.text).join(' '), /ENTRE SÁBIOS/);
    assert.match(calls.map((call) => call.text).join(' '), /entresabios\.com/);
  });
}

test('fonte estruturada é normalizada e não duplica o crédito', () => {
  const { sandbox } = createCanvasHarness({
    quote: 'Uma frase.',
    displayAuthor: 'Entre Sábios',
    source: { title: 'Antologia do Silêncio', status: 'verified' },
  });
  assert.equal(sandbox.getSharePayload().source, 'Antologia do Silêncio');
  assert.equal(sandbox.formatShareAttribution('Píndaro', { title: 'Píndaro' }), 'Píndaro');
  assert.equal(sandbox.formatShareAttribution('Autor', { title: 'Obra' }), 'Autor · Obra');
  assert.doesNotMatch(sandbox.getShareMessage(), /\[object Object\]/);
});

test('quebra respeita parágrafos e divide tokens maiores que a largura útil', () => {
  const { sandbox } = createCanvasHarness(null);
  const context = { font: '30px serif', measureText: (text) => ({ width: String(text).length * 16 }) };
  const lines = sandbox.wrapCanvasText(context, 'primeira linha\nhiperextraordinariamentelongo', 112);
  assert.ok(lines.includes(''));
  assert.ok(lines.every((line) => context.measureText(line).width <= 112));
});

test('todo o acervo ativo cabe nas três variações sem corte ou fonte serializada', () => {
  const seenTypes = new Set();
  for (const content of runtime.contents.filter((item) => item.publicationEnabled)) {
    seenTypes.add(content.attributionType);
    const story = {
      quote: content.finalText,
      displayAuthor: content.displayedAuthor,
      source: content.source?.status !== 'not_applicable' ? content.source : null,
    };
    for (const styleKey of ['cream', 'sage', 'blue']) {
      const { sandbox, canvas, calls } = createCanvasHarness(story);
      sandbox.drawShareCard({ styleKey });
      assert.ok(
        calls.every((call) => call.x - call.width / 2 >= 0 && call.x + call.width / 2 <= canvas.width),
        `${content.id} excedeu a largura no estilo ${styleKey}`,
      );
      assert.ok(
        calls.every((call) => call.y >= 0 && call.y <= canvas.height),
        `${content.id} excedeu a altura no estilo ${styleKey}`,
      );
      assert.doesNotMatch(calls.map((call) => call.text).join(' '), /\[object Object\]/, content.id);
    }
  }
  assert.deepEqual(
    [...seenTypes].sort(),
    ['exact_quote', 'inspired', 'original', 'traditional', 'translated_quote'],
  );
});

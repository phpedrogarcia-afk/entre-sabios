import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const talesSource = fs.readFileSync(path.join(rootDir, 'js', 'data', 'tales.js'), 'utf8');
const talesFeature = fs.readFileSync(path.join(rootDir, 'js', 'features', 'tales.js'), 'utf8');
const homeHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const sandbox = {};
vm.runInNewContext(talesSource, sandbox);

const tales = sandbox.EntreSabiosData.philosophicalTales;
const firstBatchIds = ['dois-monges-e-a-mulher', 'flecha-envenenada', 'mito-de-narciso'];
const secondBatchIds = ['agricultor-e-o-cavalo', 'navio-de-teseu', 'grande-inquisidor'];
const thirdBatchIds = ['caixa-de-pandora', 'sonho-da-borboleta', 'davi-e-golias'];
const fourthBatchIds = ['mito-da-caverna', 'patinho-feio', 'kisa-gotami'];
const fifthBatchIds = ['nachiketa-e-yama', 'o-espelho-machado', 'elefante-no-escuro'];
const sixthBatchIds = ['anel-de-giges', 'xicara-de-cha', 'filho-prodigo'];
const seventhBatchIds = ['mito-de-er', 'barco-vazio', 'os-talentos'];
const eighthBatchIds = ['sisifo', 'arvore-inutil', 'bom-samaritano'];
const ninthBatchIds = ['icaro', 'carruagem-da-mente', 'nasrudin-chave'];
const tenthBatchIds = ['prometeu', 'cachorro-amarrado-carroca', 'morte-de-ivan-ilitch'];
const eleventhBatchIds = ['taca-quebrada', 'jornada-do-heroi', 'a-sombra-jung'];
const reviewedBatchIds = [...firstBatchIds, ...secondBatchIds, ...thirdBatchIds, ...fourthBatchIds, ...fifthBatchIds, ...sixthBatchIds, ...seventhBatchIds, ...eighthBatchIds, ...ninthBatchIds, ...tenthBatchIds, ...eleventhBatchIds];
const firstBatch = firstBatchIds.map((id) => tales.find((tale) => tale.id === id));
const secondBatch = secondBatchIds.map((id) => tales.find((tale) => tale.id === id));
const thirdBatch = thirdBatchIds.map((id) => tales.find((tale) => tale.id === id));
const fourthBatch = fourthBatchIds.map((id) => tales.find((tale) => tale.id === id));
const fifthBatch = fifthBatchIds.map((id) => tales.find((tale) => tale.id === id));
const sixthBatch = sixthBatchIds.map((id) => tales.find((tale) => tale.id === id));
const seventhBatch = seventhBatchIds.map((id) => tales.find((tale) => tale.id === id));
const eighthBatch = eighthBatchIds.map((id) => tales.find((tale) => tale.id === id));
const ninthBatch = ninthBatchIds.map((id) => tales.find((tale) => tale.id === id));
const tenthBatch = tenthBatchIds.map((id) => tales.find((tale) => tale.id === id));
const eleventhBatch = eleventhBatchIds.map((id) => tales.find((tale) => tale.id === id));
const reviewedTales = reviewedBatchIds.map((id) => tales.find((tale) => tale.id === id));

test('primeiro lote contém somente os três contos autorizados com metadados editoriais próprios', () => {
  assert.equal(firstBatch.length, 3);
  assert.ok(firstBatch.every(Boolean));
  assert.deepEqual(
    firstBatch.map((tale) => tale.titulo),
    ['Os Dois Monges e a Mulher', 'A Flecha Envenenada', 'O Mito de Narciso'],
  );
  assert.match(firstBatch[0].origem, /Muddy Road.*Tanzan.*Ekido/);
  assert.match(firstBatch[1].origem, /Cūḷamāluṅkya Sutta \(MN 63\)/);
  assert.match(firstBatch[2].origem, /Ovídio.*Metamorfoses.*livro III/);
});

test('segundo lote contém somente os três contos aprovados e preserva suas linhagens', () => {
  assert.equal(secondBatch.length, 3);
  assert.ok(secondBatch.every(Boolean));
  assert.deepEqual(
    secondBatch.map((tale) => tale.titulo),
    ['O Agricultor e o Cavalo', 'O Navio de Teseu', 'O Grande Inquisidor'],
  );
  assert.match(secondBatch[0].origem, /Huainanzi.*capítulo 18.*塞翁失馬/);
  assert.match(secondBatch[1].origem, /Plutarco.*Vida de Teseu.*23.*Thomas Hobbes.*De Corpore.*11\.7/);
  assert.match(secondBatch[2].origem, /Fiódor Dostoiévski.*Os Irmãos Karamázov.*livro V.*capítulo 5/);
});

test('terceiro lote preserva três tradições e atribuições de adaptação verificáveis', () => {
  assert.deepEqual(thirdBatch.map((tale) => tale.titulo), ['A Caixa de Pandora', 'O Sonho da Borboleta', 'Davi e Golias']);
  assert.match(thirdBatch[0].origem, /Hesíodo.*Trabalhos e os Dias/);
  assert.match(thirdBatch[1].origem, /Zhuangzi.*capítulo 2/);
  assert.match(thirdBatch[2].origem, /1 Samuel 17/);
});

test('quarto lote reúne alegoria, conto literário e tradição budista sem apagar as fontes', () => {
  assert.deepEqual(fourthBatch.map((tale) => tale.titulo), ['O Mito da Caverna', 'O Patinho Feio', 'A Mostarda de Kisa Gotami']);
  assert.match(fourthBatch[0].origem, /Platão.*República.*livro VII/);
  assert.match(fourthBatch[1].origem, /Hans Christian Andersen.*1843/);
  assert.match(fourthBatch[2].origem, /tradição comentarial theravāda.*Kisā Gotamī/);
});

test('quinto lote preserva diálogo indiano, ironia machadiana e parábola sufi', () => {
  assert.deepEqual(fifthBatch.map((tale) => tale.titulo), ['Nachiketa e Yama', 'O Espelho', 'O Elefante no Escuro']);
  assert.match(fifthBatch[0].origem, /Kaṭha Upaniṣad.*1\.1–1\.2/);
  assert.match(fifthBatch[1].origem, /Machado de Assis.*Papéis Avulsos.*1882/);
  assert.match(fifthBatch[2].origem, /Rumi.*Masnavi.*livro III.*1259–1268/);
});

test('sexto lote separa experimento moral, anedota zen e parábola bíblica', () => {
  assert.deepEqual(sixthBatch.map((tale) => tale.titulo), ['O Anel de Giges', 'A Xícara de Chá', 'O Filho Pródigo']);
  assert.match(sixthBatch[0].origem, /Platão.*livro II.*359b–360b/);
  assert.match(sixthBatch[1].origem, /circulação moderna.*Nan-in/);
  assert.match(sixthBatch[2].origem, /Lucas 15:11–32/);
});

test('sétimo lote distingue mito escatológico, imagem taoista e parábola de prestação de contas', () => {
  assert.deepEqual(seventhBatch.map((tale) => tale.titulo), ['O Mito de Er', 'O Barco Vazio', 'Os Talentos']);
  assert.match(seventhBatch[0].origem, /Platão.*livro X.*614b–621d/);
  assert.match(seventhBatch[1].origem, /Zhuangzi.*capítulo 20/);
  assert.match(seventhBatch[2].origem, /Mateus 25:14–30/);
});

test('oitavo lote separa absurdo, inutilidade taoista e cuidado narrativo', () => {
  assert.deepEqual(eighthBatch.map((tale) => tale.titulo), ['Sísifo', 'A Árvore Inútil', 'O Bom Samaritano']);
  assert.match(eighthBatch[0].origem, /mito grego.*Albert Camus/);
  assert.match(eighthBatch[1].origem, /Zhuangzi.*capítulos 1 e 4/);
  assert.match(eighthBatch[2].origem, /Lucas 10:25–37/);
});

test('nono lote distingue tragédia de voo, analogia indiana e humor de Nasrudin', () => {
  assert.deepEqual(ninthBatch.map((tale) => tale.titulo), ['Ícaro', 'A Carruagem da Mente', 'Nasrudin e a Chave Perdida']);
  assert.match(ninthBatch[0].origem, /Ovídio.*Metamorfoses.*livro VIII/);
  assert.match(ninthBatch[1].origem, /Kaṭha Upaniṣad.*1\.3\.3–9/);
  assert.match(ninthBatch[2].origem, /circulação moderna.*Nasrudin/);
});

test('décimo lote reúne mito técnico, fragmento estoico e novela russa', () => {
  assert.deepEqual(tenthBatch.map((tale) => tale.titulo), ['Prometeu', 'O Cachorro Amarrado à Carroça', 'A Morte de Ivan Ilitch']);
  assert.match(tenthBatch[0].origem, /Hesíodo.*Teogonia.*Trabalhos e os Dias/);
  assert.match(tenthBatch[1].origem, /Zenão e Crisipo.*Hipólito/);
  assert.match(tenthBatch[2].origem, /Liev Tolstói.*1886/);
});

test('décimo primeiro lote distingue exercício estoico, mapa comparativo e alegoria editorial', () => {
  assert.deepEqual(eleventhBatch.map((tale) => tale.titulo), ['A Taça Quebrada', 'A Jornada do Herói', 'A Sombra']);
  assert.match(eleventhBatch[0].origem, /Epicteto.*Manual.*Discursos/);
  assert.match(eleventhBatch[1].origem, /Síntese editorial.*Joseph Campbell.*1949/);
  assert.match(eleventhBatch[2].origem, /Alegoria editorial.*C\. G\. Jung/);
});

test('os 33 contos pertencem a um dos onze lotes editoriais concluídos', () => {
  assert.equal(tales.length, 33);
  assert.equal(reviewedBatchIds.length, 33);
  assert.deepEqual(new Set(reviewedBatchIds), new Set(tales.map((tale) => tale.id)));
});

test('cada conto revisado possui narrativa e três seções posteriores distintas', () => {
  for (const tale of reviewedTales) {
    assert.ok(tale.texto.length >= 4, tale.id);
    assert.equal(tale.umModoDeOlhar.length, 1);
    assert.equal(tale.oQueTalvezEstejaPedindoParaSerVisto.length, 1);
    assert.equal(typeof tale.perguntaParaLevar, 'string');
    assert.match(tale.perguntaParaLevar, /\?$/);
    assert.doesNotMatch(tale.perguntaParaLevar, /você não acha|deveria|precisa aprender|por que você não/i);
    assert.equal(tale.explicacaoFilosofica, undefined);
    assert.equal(tale.perguntaReflexao, undefined);
  }

  assert.match(firstBatch[0].texto.join(' '), /portão do templo|cabaça/);
  assert.match(firstBatch[1].texto.join(' '), /cirurgião|estojo de instrumentos/);
  assert.match(firstBatch[2].texto.join(' '), /Eco|Nêmesis|ninfas/);
  assert.match(secondBatch[0].texto.join(' '), /curral|soldados|ripas/);
  assert.match(secondBatch[1].texto.join(' '), /porto|carpinteiro|duas embarcações/);
  assert.match(secondBatch[2].texto.join(' '), /cela|lâmpada|beijou/);
  assert.equal(new Set(reviewedTales.map((tale) => tale.texto.at(-1))).size, reviewedTales.length);
});

test('estimativas de leitura do lote correspondem ao conteúdo revisado', () => {
  for (const tale of reviewedTales) {
    const words = [
      ...tale.texto,
      ...tale.umModoDeOlhar,
      ...tale.oQueTalvezEstejaPedindoParaSerVisto,
      tale.perguntaParaLevar,
    ].join(' ').trim().split(/\s+/).length;
    assert.equal(tale.tempoLeitura, Math.max(1, Math.ceil(words / 200)), tale.id);
  }
});

test('modal usa somente a nova estrutura e não revela a recomendação', () => {
  assert.match(homeHtml, />Um modo de olhar</);
  assert.match(homeHtml, />O que talvez esteja pedindo para ser visto</);
  assert.match(homeHtml, />Uma pergunta para levar consigo</);
  assert.doesNotMatch(homeHtml, /Por que este conto apareceu para você\?/i);
  assert.doesNotMatch(homeHtml, /O que esse conto nos ensina\?/i);
  assert.doesNotMatch(talesFeature, /Este conto apareceu porque/i);
  assert.match(talesFeature, /getTaleFirstReflectionSection/);
  assert.match(talesFeature, /getTaleSecondReflectionSection/);
});

test('catálogo e controlador de contos usam marcador derivado do conteúdo', () => {
  const dataMarker = homeHtml.match(/js\/data\/tales\.js\?v=([^"']+)/)?.[1];
  const featureMarker = homeHtml.match(/js\/features\/tales\.js\?v=([^"']+)/)?.[1];
  const contentDigest = crypto.createHash('sha256')
    .update(talesSource)
    .update(talesFeature)
    .digest('hex')
    .slice(0, 12);
  assert.equal(dataMarker, `tales-${contentDigest}`);
  assert.equal(featureMarker, dataMarker);
});

test('as páginas públicas dos lotes revisados estão sincronizadas com o catálogo', () => {
  for (const tale of reviewedTales) {
    const html = fs.readFileSync(path.join(rootDir, 'contos', tale.id, 'index.html'), 'utf8');
    assert.match(html, /<h2>Um modo de olhar<\/h2>/);
    assert.match(html, /<h2>O que talvez esteja pedindo para ser visto<\/h2>/);
    assert.match(html, /<h2>Uma pergunta para levar consigo<\/h2>/);
    assert.doesNotMatch(html, /O que este conto nos ensina\?|Pergunta para reflexão/i);
    const readingTimeText = tale.tempoLeituraTexto
      || `${tale.tempoLeitura} ${tale.tempoLeitura === 1 ? 'minuto' : 'minutos'}`;
    assert.ok(html.includes(`Leitura de aproximadamente ${readingTimeText}`));
    assert.doesNotMatch(html, /Leitura de aproximadamente 1 minutos/);
    assert.ok(html.includes(tale.origem));
    for (const paragraph of tale.texto) assert.ok(html.includes(paragraph));
    assert.ok(html.includes(tale.umModoDeOlhar[0]));
    assert.ok(html.includes(tale.oQueTalvezEstejaPedindoParaSerVisto[0]));
    assert.ok(html.includes(tale.perguntaParaLevar));
  }
});

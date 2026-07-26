import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'entre_sabios_runtime.json'), 'utf8'));
const master = JSON.parse(fs.readFileSync(path.join(rootDir, 'entre_sabios_acervo_mestre_final.json'), 'utf8'));
const script = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const reflectionUi = fs.readFileSync(path.join(rootDir, 'js', 'ui', 'reflection-ui.js'), 'utf8');
const catalogSandbox = { window: {} };
vm.createContext(catalogSandbox);
vm.runInContext(fs.readFileSync(path.join(rootDir, 'js', 'data', 'catalogs.js'), 'utf8'), catalogSandbox);
const profiles = catalogSandbox.window.EntreSabiosData.thinkerProfiles;

test('todos os conteúdos publicados preservam autoria e classificação editorial rastreáveis', () => {
  const allowedTypes = new Set(['original', 'inspired', 'paraphrase', 'translated_quote', 'traditional', 'exact_quote']);
  assert.ok(runtime.contents.every((content) => allowedTypes.has(content.attributionType)));
  assert.ok(runtime.contents.every((content) => String(content.author || '').trim()));
  assert.ok(runtime.contents.every((content) => String(content.displayedAuthor || '').trim()));
  assert.ok(runtime.contents.filter((content) => content.attributionType === 'inspired')
    .every((content) => String(content.inspirationSource || '').trim()));
});

test('originais artificiais sem base saem do runtime e inspirações em sábios permanecem', () => {
  const originals = runtime.contents.filter((content) => content.attributionType === 'original');
  const masterById = new Map(master.contents.map((content) => [content.id, content]));
  const entreSabiosOriginals = originals.filter((content) => content.displayedAuthor === 'Entre Sábios');
  assert.equal(entreSabiosOriginals.length, 0);
  assert.equal(originals.length, 1);
  const retiredUnbased = ['Reflexão contemporânea-1', 'Reflexão contemporânea-2', 'ES-INS-VERGONHA-001', 'Reflexão contemporânea-4'];
  for (const id of retiredUnbased) {
    const content = masterById.get(id);
    assert.equal(content?.status, 'REMOVIDO');
    assert.equal(content?.publicationEnabled, false);
    assert.equal(content?.changeType, 'unbased_ai_original_removal');
    assert.match(content?.changeReason || '', /IA sem base autoral/);
  }
  const machado = runtime.contents.find((content) => content.id === 'batch04-quote-038');
  assert.equal(machado?.finalText, 'O ciúme costuma escrever romances inteiros com meia linha de realidade.');
  assert.equal(machado?.attributionType, 'inspired');
  assert.equal(machado?.displayedAuthor, 'Entre Sábios, inspirado em Machado de Assis');
  const unidentified = originals.find((content) => content.id === 'TXT-MED-003');
  assert.equal(unidentified?.author, 'Autoria não identificada');
  assert.equal(unidentified?.displayedAuthor, 'Autoria não identificada');
  assert.doesNotMatch(masterById.get('TXT-MED-003')?.source?.notes || '', /original do Entre Sábios/i);
  const retiredAnthology = master.contents.filter((content) => content.originalCollection === 'antologia_do_silencio.pdf');
  assert.equal(retiredAnthology.length, 28);
  assert.ok(retiredAnthology.every((content) => content.status === 'REMOVIDO' && content.publicationEnabled === false));
  assert.ok(retiredAnthology.every((content) => /gerada por IA/i.test(content.changeReason)));
});

test('frase transformada de Duna preserva essência, autoria e fonte sem virar citação', () => {
  const content = runtime.contents.find((item) => item.id === 'batch07-quote-011');
  const masterContent = master.contents.find((item) => item.id === 'batch07-quote-011');
  assert.equal(content?.finalText, 'O medo não precisa desaparecer para perder autoridade; basta ser visto sem trono.');
  assert.equal(content?.attributionType, 'inspired');
  assert.equal(content?.author, 'Autoria preservada');
  assert.equal(content?.displayedAuthor, 'Autoria preservada — inspirado na Litania contra o Medo, de Frank Herbert');
  assert.equal(content?.source?.title, 'Duna — Litania contra o Medo');
  assert.equal(content?.source?.status, 'verified');
  assert.equal(masterContent?.source?.page, '14');
  assert.match(masterContent?.source?.notes || '', /substancialmente transformada/);
});

test('síntese de profecia e destino em Duna permanece inspiração temática sem passagem inventada', () => {
  const content = runtime.contents.find((item) => item.id === 'batch07-quote-012');
  const masterContent = master.contents.find((item) => item.id === 'batch07-quote-012');
  assert.equal(content?.finalText, 'Quem confunde profecia com destino entrega o futuro à primeira história convincente.');
  assert.equal(content?.attributionType, 'inspired');
  assert.equal(content?.author, 'Autoria preservada');
  assert.equal(content?.displayedAuthor, 'Autoria preservada — inspirado nos temas de profecia e destino do ciclo de Duna, de Frank Herbert');
  assert.equal(content?.source?.title, 'Ciclo original de Duna — profecia, narrativa e destino');
  assert.equal(content?.source?.status, 'verified');
  assert.equal(masterContent?.source?.page, '');
  assert.match(masterContent?.source?.section || '', /sem passagem única/i);
});

test('síntese de sobrevivência e consciência em Duna preserva o texto e não inventa passagem', () => {
  const content = runtime.contents.find((item) => item.id === 'batch07-quote-014');
  const masterContent = master.contents.find((item) => item.id === 'batch07-quote-014');
  assert.equal(content?.finalText, 'A sobrevivência sem consciência pode transformar a pessoa naquilo de que tentava escapar.');
  assert.equal(content?.attributionType, 'inspired');
  assert.equal(content?.author, 'Autoria preservada');
  assert.equal(content?.displayedAuthor, 'Autoria preservada — inspirado nos temas de sobrevivência e consciência do ciclo de Duna, de Frank Herbert');
  assert.equal(content?.source?.title, 'Ciclo original de Duna — sobrevivência, consciência e transformação');
  assert.equal(content?.source?.status, 'verified');
  assert.equal(masterContent?.source?.page, '');
  assert.match(masterContent?.source?.section || '', /sem passagem única/i);
});

test('síntese de mente, deserto e água em Duna permanece inspiração temática composta', () => {
  const content = runtime.contents.find((item) => item.id === 'batch07-quote-015');
  const masterContent = master.contents.find((item) => item.id === 'batch07-quote-015');
  assert.equal(content?.finalText, 'A mente treinada não elimina o deserto; aprende a não desperdiçar água com ilusões.');
  assert.equal(content?.attributionType, 'inspired');
  assert.equal(content?.author, 'Autoria preservada');
  assert.equal(content?.displayedAuthor, 'Autoria preservada — inspirado nos temas de treinamento mental e disciplina da água em Duna, de Frank Herbert');
  assert.equal(content?.source?.title, 'Duna — treinamento mental, deserto e disciplina da água');
  assert.equal(content?.source?.status, 'verified');
  assert.equal(masterContent?.source?.page, '');
  assert.match(masterContent?.source?.section || '', /temática composta/i);
  assert.match(masterContent?.source?.section || '', /sem passagem única/i);
});

test('citação traduzida de Alan Watts confirma a obra sem inventar a proveniência em português', () => {
  const content = runtime.contents.find((item) => item.id === 'curated-03');
  const masterContent = master.contents.find((item) => item.id === 'curated-03');
  assert.equal(content?.finalText, 'A única maneira de compreender a mudança é entrar nela, mover-se com ela e participar da dança.');
  assert.equal(content?.attributionType, 'translated_quote');
  assert.equal(content?.author, 'Alan Watts');
  assert.equal(content?.displayedAuthor, 'Alan Watts');
  assert.equal(content?.source?.title, 'The Wisdom of Insecurity: A Message for an Age of Anxiety');
  assert.equal(content?.source?.status, 'verified_translation_pending');
  assert.equal(masterContent?.source?.publisher, 'Pantheon Books');
  assert.equal(masterContent?.source?.year, 1951);
  assert.equal(masterContent?.source?.translator, '');
  assert.equal(masterContent?.source?.page, '');
  assert.equal(masterContent?.humanReviewRequired, true);
});

test('aforismo de Nietzsche confirma o original sem inventar a tradução portuguesa', () => {
  const content = runtime.contents.find((item) => item.id === 'batch01-quote-007');
  const masterContent = master.contents.find((item) => item.id === 'batch01-quote-007');
  assert.equal(content?.finalText, 'Quem tem um porquê suporta quase qualquer como.');
  assert.equal(content?.attributionType, 'translated_quote');
  assert.equal(content?.author, 'Friedrich Nietzsche');
  assert.equal(content?.displayedAuthor, 'Friedrich Nietzsche');
  assert.equal(content?.source?.title, 'Götzen-Dämmerung oder Wie man mit dem Hammer philosophirt');
  assert.equal(content?.source?.status, 'verified_translation_pending');
  assert.equal(masterContent?.source?.section, 'Sprüche und Pfeile, § 12');
  assert.equal(masterContent?.source?.publisher, 'C.G. Naumann');
  assert.equal(masterContent?.source?.year, 1889);
  assert.equal(masterContent?.source?.translator, '');
  assert.equal(masterContent?.source?.page, '');
  assert.equal(masterContent?.primaryFeeling, 'falta_de_proposito');
  assert.equal(masterContent?.placement, 'contextual');
  assert.equal(masterContent?.editorialFunction, 'reframing');
  assert.equal(masterContent?.humanReviewRequired, true);
});

test('fórmula de Píndaro preserva a retomada de Nietzsche sem fundir as fontes', () => {
  const content = runtime.contents.find((item) => item.id === 'batch01-quote-008');
  const masterContent = master.contents.find((item) => item.id === 'batch01-quote-008');
  assert.equal(content?.finalText, 'Torna-te quem tu és.');
  assert.equal(content?.attributionType, 'traditional');
  assert.equal(content?.author, 'Píndaro / Friedrich Nietzsche');
  assert.equal(content?.displayedAuthor, 'Fórmula de Píndaro retomada por Friedrich Nietzsche');
  assert.equal(content?.source?.title, 'Píndaro, Pítica 2, v. 72; Nietzsche, Die fröhliche Wissenschaft, § 270');
  assert.equal(content?.source?.status, 'verified_translation_pending');
  assert.match(masterContent?.source?.section || '', /Pítica 2, v\. 72/);
  assert.match(masterContent?.source?.section || '', /Die fröhliche Wissenschaft, § 270/);
  assert.match(masterContent?.source?.section || '', /carta a Lou Salomé/);
  assert.equal(masterContent?.source?.translator, '');
  assert.equal(masterContent?.source?.page, '');
  assert.equal(masterContent?.primaryFeeling, 'autoconhecimento');
  assert.equal(masterContent?.placement, 'contextual');
  assert.equal(masterContent?.editorialFunction, 'action');
  assert.equal(masterContent?.humanReviewRequired, true);
});

test('estrela dançante de Nietzsche confirma a passagem sem inventar a tradução portuguesa', () => {
  const content = runtime.contents.find((item) => item.id === 'batch01-quote-009');
  const masterContent = master.contents.find((item) => item.id === 'batch01-quote-009');
  assert.equal(content?.finalText, 'É preciso ainda ter caos dentro de si para dar à luz uma estrela dançante.');
  assert.equal(content?.attributionType, 'translated_quote');
  assert.equal(content?.author, 'Friedrich Nietzsche');
  assert.equal(content?.displayedAuthor, 'Friedrich Nietzsche');
  assert.equal(content?.source?.title, 'Also sprach Zarathustra. Ein Buch für Alle und Keinen');
  assert.equal(content?.source?.status, 'verified_translation_pending');
  assert.equal(masterContent?.source?.section, 'Erster Teil, Zarathustras Vorrede, § 5');
  assert.equal(masterContent?.source?.publisher, 'Ernst Schmeitzner');
  assert.equal(masterContent?.source?.year, 1883);
  assert.equal(masterContent?.source?.translator, '');
  assert.equal(masterContent?.source?.page, '');
  assert.equal(masterContent?.primaryFeeling, 'confusao');
  assert.equal(masterContent?.placement, 'contextual');
  assert.equal(masterContent?.editorialFunction, 'contemplation');
  assert.equal(masterContent?.humanReviewRequired, true);
});

test('adaptação de Clarice preserva o texto sem fingir citação literal', () => {
  const content = runtime.contents.find((item) => item.id === 'batch01-quote-014');
  const masterContent = master.contents.find((item) => item.id === 'batch01-quote-014');
  assert.equal(content?.finalText, 'Que ninguém se engane: só se consegue a simplicidade através de muito trabalho.');
  assert.equal(content?.attributionType, 'paraphrase');
  assert.equal(content?.author, 'Autoria preservada');
  assert.equal(content?.displayedAuthor, 'Adaptação de trecho de Clarice Lispector, em A hora da estrela');
  assert.equal(content?.inspirationSource, 'Clarice Lispector');
  assert.equal(content?.source?.title, 'A hora da estrela');
  assert.equal(content?.source?.status, 'verified');
  assert.equal(masterContent?.source?.publisher, 'José Olympio');
  assert.equal(masterContent?.source?.year, 1977);
  assert.equal(masterContent?.source?.page, '15');
  assert.match(masterContent?.source?.notes || '', /primeira pessoa/);
  assert.match(masterContent?.source?.notes || '', /revisão de direitos/);
  assert.equal(masterContent?.humanReviewRequired, true);
});

test('epígrafe de La Rochefoucauld não é confundida com a máxima 1 nem com tradução identificada', () => {
  const content = runtime.contents.find((item) => item.id === 'batch01-quote-025');
  const masterContent = master.contents.find((item) => item.id === 'batch01-quote-025');
  assert.equal(content?.finalText, 'Nossas virtudes são, quase sempre, vícios disfarçados.');
  assert.equal(content?.attributionType, 'translated_quote');
  assert.equal(content?.author, 'François de La Rochefoucauld');
  assert.equal(content?.displayedAuthor, 'François de La Rochefoucauld');
  assert.equal(content?.source?.title, 'Réflexions ou sentences et maximes morales');
  assert.equal(content?.source?.status, 'verified_translation_pending');
  assert.match(masterContent?.source?.section || '', /Epígrafe/);
  assert.notEqual((masterContent?.source?.section || '').trim().toLowerCase(), 'máxima 1');
  assert.equal(masterContent?.source?.publisher, 'Claude Barbin');
  assert.equal(masterContent?.source?.year, 1675);
  assert.equal(masterContent?.source?.translator, '');
  assert.equal(masterContent?.source?.page, '');
  assert.match(masterContent?.source?.notes || '', /Rosa Freire d’Aguiar/);
  assert.match(masterContent?.source?.notes || '', /redação diferente/);
  assert.equal(masterContent?.humanReviewRequired, true);
});

test('máxima 2 de La Rochefoucauld identifica a tradução brasileira sem reescrever o texto', () => {
  const content = runtime.contents.find((item) => item.id === 'batch01-quote-026');
  const masterContent = master.contents.find((item) => item.id === 'batch01-quote-026');
  assert.equal(content?.finalText, 'O amor-próprio é o maior de todos os aduladores.');
  assert.equal(content?.attributionType, 'translated_quote');
  assert.equal(content?.author, 'François de La Rochefoucauld');
  assert.equal(content?.displayedAuthor, 'François de La Rochefoucauld');
  assert.equal(content?.source?.title, 'Reflexões ou sentenças e máximas morais');
  assert.equal(content?.source?.status, 'verified');
  assert.equal(content?.status, 'ATIVO_NUCLEO');
  assert.equal(masterContent?.source?.section, 'Máxima 2');
  assert.equal(masterContent?.source?.publisher, 'Penguin Classics Companhia das Letras');
  assert.equal(masterContent?.source?.year, 2014);
  assert.equal(masterContent?.source?.translator, 'Rosa Freire d’Aguiar');
  assert.equal(masterContent?.source?.page, '11');
  assert.equal(masterContent?.humanReviewRequired, false);
});

test('máxima 218 de La Rochefoucauld identifica a tradução de Alcântara Silveira sem reescrever o texto', () => {
  const content = runtime.contents.find((item) => item.id === 'batch01-quote-027');
  const masterContent = master.contents.find((item) => item.id === 'batch01-quote-027');
  assert.equal(content?.finalText, 'A hipocrisia é uma homenagem que o vício presta à virtude.');
  assert.equal(content?.attributionType, 'translated_quote');
  assert.equal(content?.author, 'François de La Rochefoucauld');
  assert.equal(content?.displayedAuthor, 'François de La Rochefoucauld');
  assert.equal(content?.source?.title, 'Reflexões e máximas morais');
  assert.equal(content?.source?.status, 'verified');
  assert.equal(content?.status, 'ATIVO_GERAL');
  assert.equal(masterContent?.source?.section, 'Máxima 218');
  assert.equal(masterContent?.source?.publisher, 'Cultrix');
  assert.equal(masterContent?.source?.year, 1962);
  assert.equal(masterContent?.source?.translator, 'Alcântara Silveira');
  assert.equal(masterContent?.source?.page, '69');
  assert.match(masterContent?.source?.notes || '', /Universidade Federal do Ceará/);
  assert.equal(masterContent?.humanReviewRequired, false);
});

test('máxima 19 de La Rochefoucauld documenta o original sem inventar a proveniência da tradução', () => {
  const content = runtime.contents.find((item) => item.id === 'batch01-quote-028');
  const masterContent = master.contents.find((item) => item.id === 'batch01-quote-028');
  assert.equal(content?.finalText, 'Temos todos força bastante para suportar os males dos outros.');
  assert.equal(content?.attributionType, 'translated_quote');
  assert.equal(content?.author, 'François de La Rochefoucauld');
  assert.equal(content?.displayedAuthor, 'François de La Rochefoucauld');
  assert.equal(content?.source?.title, 'Réflexions ou sentences et maximes morales');
  assert.equal(content?.source?.status, 'verified_translation_pending');
  assert.equal(content?.status, 'ATIVO_REFERENCIA_PENDENTE');
  assert.equal(masterContent?.source?.section, 'Máxima 19');
  assert.equal(masterContent?.source?.edition, '5ª edição francesa');
  assert.equal(masterContent?.source?.publisher, 'Claude Barbin');
  assert.equal(masterContent?.source?.year, 1678);
  assert.equal(masterContent?.source?.translator, '');
  assert.equal(masterContent?.source?.page, '');
  assert.match(masterContent?.source?.notes || '', /Rosa Freire d’Aguiar/);
  assert.match(masterContent?.source?.notes || '', /continuam não identificados/);
  assert.equal(masterContent?.humanReviewRequired, true);
});

test('máxima 361 de La Rochefoucauld identifica a tradução de Brito Broca e Wilson Lousada', () => {
  const content = runtime.contents.find((item) => item.id === 'batch01-quote-029');
  const masterContent = master.contents.find((item) => item.id === 'batch01-quote-029');
  assert.equal(content?.finalText, 'O ciúme nasce sempre com o amor, mas nem sempre morre com ele.');
  assert.equal(content?.attributionType, 'translated_quote');
  assert.equal(content?.author, 'François de La Rochefoucauld');
  assert.equal(content?.displayedAuthor, 'François de La Rochefoucauld');
  assert.equal(content?.source?.title, 'Pensadores franceses — Reflexões morais');
  assert.equal(content?.source?.status, 'verified');
  assert.equal(content?.status, 'ATIVO_NUCLEO');
  assert.equal(masterContent?.source?.section, 'La Rochefoucauld, máxima 361');
  assert.equal(masterContent?.source?.edition, 'Clássicos Jackson, volume XII');
  assert.equal(masterContent?.source?.publisher, 'W. M. Jackson Inc. Editores');
  assert.equal(masterContent?.source?.year, 1949);
  assert.equal(masterContent?.source?.translator, 'J. Brito Broca e Wilson Lousada');
  assert.equal(masterContent?.source?.page, '');
  assert.match(masterContent?.source?.notes || '', /página física não foi inferida/i);
  assert.equal(masterContent?.humanReviewRequired, false);
});

test('máxima 38 de La Rochefoucauld documenta o original sem atribuir traduções divergentes', () => {
  const content = runtime.contents.find((item) => item.id === 'batch01-quote-030');
  const masterContent = master.contents.find((item) => item.id === 'batch01-quote-030');
  assert.equal(content?.finalText, 'Prometemos conforme nossas esperanças; cumprimos conforme nossos temores.');
  assert.equal(content?.attributionType, 'translated_quote');
  assert.equal(content?.author, 'François de La Rochefoucauld');
  assert.equal(content?.displayedAuthor, 'François de La Rochefoucauld');
  assert.equal(content?.source?.title, 'Réflexions ou sentences et maximes morales');
  assert.equal(content?.source?.status, 'verified_translation_pending');
  assert.equal(content?.status, 'ATIVO_REFERENCIA_PENDENTE');
  assert.equal(masterContent?.source?.section, 'Máxima 38');
  assert.equal(masterContent?.source?.edition, '5ª edição francesa');
  assert.equal(masterContent?.source?.publisher, 'Claude Barbin');
  assert.equal(masterContent?.source?.year, 1678);
  assert.equal(masterContent?.source?.translator, '');
  assert.equal(masterContent?.source?.page, '');
  assert.match(masterContent?.source?.notes || '', /Rosa Freire d’Aguiar/);
  assert.match(masterContent?.source?.notes || '', /J\. Brito Broca e Wilson Lousada/);
  assert.match(masterContent?.source?.notes || '', /continuam não identificados/);
  assert.equal(masterContent?.humanReviewRequired, true);
});

test('Retorno a Tipasa documenta o original sem atribuir a redação portuguesa a uma tradução divergente', () => {
  const content = runtime.contents.find((item) => item.id === 'batch01-quote-031');
  const masterContent = master.contents.find((item) => item.id === 'batch01-quote-031');
  assert.equal(content?.finalText, 'No meio do inverno, aprendi enfim que havia em mim um verão invencível.');
  assert.equal(content?.attributionType, 'translated_quote');
  assert.equal(content?.author, 'Albert Camus');
  assert.equal(content?.displayedAuthor, 'Albert Camus');
  assert.equal(content?.source?.title, 'L’Été');
  assert.equal(content?.source?.status, 'verified_translation_pending');
  assert.equal(content?.status, 'ATIVO_REFERENCIA_PENDENTE');
  assert.equal(masterContent?.source?.section, 'Retour à Tipasa');
  assert.equal(masterContent?.source?.edition, '1ª edição francesa');
  assert.equal(masterContent?.source?.publisher, 'Gallimard');
  assert.equal(masterContent?.source?.year, 1954);
  assert.equal(masterContent?.source?.translator, '');
  assert.equal(masterContent?.source?.page, '');
  assert.match(masterContent?.source?.notes || '', /Au milieu de l'hiver/);
  assert.match(masterContent?.source?.notes || '', /Vera Queiroz da Costa e Silva/);
  assert.match(masterContent?.source?.notes || '', /redação diferente/);
  assert.match(masterContent?.source?.notes || '', /sem tradutor e edição de origem identificados/);
  assert.equal(masterContent?.humanReviewRequired, true);
});

test('perfil só é apresentado quando existe texto editorial específico', () => {
  const nonOriginal = runtime.contents.filter((content) => content.attributionType !== 'original');
  const withProfile = nonOriginal.filter((content) => profiles[content.inspirationSource || content.author]);
  const withoutProfile = nonOriginal.filter((content) => !profiles[content.inspirationSource || content.author]);
  assert.equal(withProfile.length + withoutProfile.length, nonOriginal.length);
  assert.match(script, /const philosophy = String\(thinkerProfiles\[inspiration\] \|\| ''\)\.trim\(\)/);
  assert.doesNotMatch(script, /Esta reflexão pertence ao acervo editorial Entre Sábios/);
  assert.match(reflectionUi, /philosophyBlockEl\.hidden = !hasSpecificPhilosophy/);
  assert.match(reflectionUi, /getPhilosophyHeading\(story\)/);
  assert.doesNotMatch(reflectionUi, /philosophyTitleEl\.textContent[^;]*story\.adviceLabel/);
});

test('somente as 27 fontes documentais específicas são encaminhadas à interface', () => {
  const specificSources = runtime.contents.filter((content) => content.source?.status !== 'not_applicable');
  const genericSources = runtime.contents.filter((content) => content.source?.status === 'not_applicable');
  assert.equal(specificSources.length, 27);
  assert.equal(genericSources.length, 230);
  assert.ok(specificSources.every((content) => String(content.source.title || '').trim()));
  assert.match(script, /content\.source\?\.status !== 'not_applicable'/);
  assert.match(reflectionUi, /quoteSourceEl\.textContent = sourceTitle \? `Fonte: \$\{sourceTitle\}` : ''/);
});

test('ausência inesperada de displayedAuthor não atribui conteúdo automaticamente ao site', () => {
  assert.match(reflectionUi, /Autoria em revisão/);
  assert.doesNotMatch(reflectionUi, /story\.displayAuthor \|\| 'Entre Sábios'/);
});

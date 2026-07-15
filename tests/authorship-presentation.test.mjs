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
  const allowedTypes = new Set(['original', 'inspired', 'translated_quote', 'traditional', 'exact_quote']);
  assert.ok(runtime.contents.every((content) => allowedTypes.has(content.attributionType)));
  assert.ok(runtime.contents.every((content) => String(content.author || '').trim()));
  assert.ok(runtime.contents.every((content) => String(content.displayedAuthor || '').trim()));
  assert.ok(runtime.contents.filter((content) => content.attributionType === 'inspired')
    .every((content) => String(content.inspirationSource || '').trim()));
});

test('os 32 originais Entre Sábios continuam congelados pela curadoria aprovada', () => {
  const originals = runtime.contents.filter((content) => content.attributionType === 'original');
  const masterById = new Map(master.contents.map((content) => [content.id, content]));
  assert.equal(originals.length, 32);
  for (const content of originals) {
    const masterContent = masterById.get(content.id);
    assert.equal(content.displayedAuthor, 'Entre Sábios');
    assert.equal(content.inspirationSource, null);
    assert.equal(masterContent?.humanReviewRequired, false);
    assert.match(masterContent?.source?.notes || '', /Conteúdo original/);
  }
});

test('perfil só é apresentado quando existe texto editorial específico', () => {
  const nonOriginal = runtime.contents.filter((content) => content.attributionType !== 'original');
  const withProfile = nonOriginal.filter((content) => profiles[content.inspirationSource || content.author]);
  const withoutProfile = nonOriginal.filter((content) => !profiles[content.inspirationSource || content.author]);
  assert.equal(withProfile.length, 185);
  assert.equal(withoutProfile.length, 66);
  assert.match(script, /const philosophy = String\(thinkerProfiles\[inspiration\] \|\| ''\)\.trim\(\)/);
  assert.doesNotMatch(script, /Esta reflexão pertence ao acervo editorial Entre Sábios/);
  assert.match(reflectionUi, /philosophyBlockEl\.hidden = !hasSpecificPhilosophy/);
  assert.match(reflectionUi, /getPhilosophyHeading\(story\)/);
  assert.doesNotMatch(reflectionUi, /philosophyTitleEl\.textContent[^;]*story\.adviceLabel/);
});

test('somente as 20 fontes documentais específicas são encaminhadas à interface', () => {
  const specificSources = runtime.contents.filter((content) => content.source?.status !== 'not_applicable');
  const genericSources = runtime.contents.filter((content) => content.source?.status === 'not_applicable');
  assert.equal(specificSources.length, 20);
  assert.equal(genericSources.length, 263);
  assert.ok(specificSources.every((content) => String(content.source.title || '').trim()));
  assert.match(script, /content\.source\?\.status !== 'not_applicable'/);
  assert.match(reflectionUi, /quoteSourceEl\.textContent = sourceTitle \? `Fonte: \$\{sourceTitle\}` : ''/);
});

test('ausência inesperada de displayedAuthor não atribui conteúdo automaticamente ao site', () => {
  assert.match(reflectionUi, /Autoria em revisão/);
  assert.doesNotMatch(reflectionUi, /story\.displayAuthor \|\| 'Entre Sábios'/);
});

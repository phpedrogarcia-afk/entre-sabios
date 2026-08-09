import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const screenshotDir = process.env.ENTRE_SABIOS_SCREENSHOT_DIR
  || path.join(os.tmpdir(), 'entre-sabios-layout-v2-etapa4-20260729');

async function openLayout(page, { width, height, theme = 'day', reducedMotion = 'no-preference' }) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion });
  await page.addInitScript((savedTheme) => {
    localStorage.clear();
    if (savedTheme === 'night') localStorage.setItem('entreSabiosTheme', 'night');
  }, theme);
  await page.goto('/');
  await expect(page.locator('#contentLoadStatus')).toHaveText('');
  await expect(page.locator('#feelingsGrid .feeling')).toHaveCount(14);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

async function generateRealReflection(page) {
  const feeling = page.locator('#feelingsGrid .feeling input:not([disabled])').first();
  await feeling.evaluate((input) => input.click());
  await page.locator('#generateBtn').click();
  await expect(page.locator('#quoteText')).not.toHaveClass(/invitation/);
  await expect(page.locator('#quoteAuthor')).not.toHaveText('');
  await expect(page.locator('.center-card')).not.toHaveClass(/is-reflection-loading/);
}

async function setVisualFixture(page, fixture = {}) {
  await page.evaluate((copy) => {
    const setText = (selector, value) => {
      const element = document.querySelector(selector);
      if (element && value !== undefined) element.textContent = value;
    };
    const quote = document.getElementById('quoteText');
    quote.classList.remove('invitation');
    quote.classList.toggle('long-quote', Boolean(copy.long));
    quote.classList.toggle('quote-microtext', Boolean(copy.microtext));
    quote.classList.remove('has-paragraphs');
    setText('#quoteText', copy.quote);
    setText('#quoteAuthor', copy.author);
    setText('#quoteSource', copy.source);
    const source = document.getElementById('quoteSource');
    if (copy.source !== undefined) source.hidden = !copy.source;
    setText('#reflectionText', copy.reflection);
    setText('#philosophyText', copy.philosophy);
    setText('#adviceText', copy.question);
    setText('#bookText', copy.book);
    setText('#bookReason', copy.bookReason);
  }, fixture);
}

async function centralMetrics(page) {
  return page.evaluate(() => {
    const rect = (selector) => document.querySelector(selector).getBoundingClientRect();
    const style = (selector) => getComputedStyle(document.querySelector(selector));
    const card = rect('.center-card');
    const stage = rect('.quote-stage');
    const content = rect('.quote-content');
    const quote = rect('#quoteText');
    const blocks = [...document.querySelectorAll('.block:not([hidden])')];
    return {
      stageRatio: stage.width / card.width,
      stageRadius: parseFloat(style('.quote-stage').borderRadius),
      stageHeight: stage.height,
      contentPaddingTop: parseFloat(style('.quote-content').paddingTop),
      contentPaddingLeft: parseFloat(style('.quote-content').paddingLeft),
      quoteFontSize: parseFloat(style('#quoteText').fontSize),
      quoteLineHeight: parseFloat(style('#quoteText').lineHeight),
      quoteAlign: style('#quoteText').textAlign,
      quoteFits: quote.height + 1 >= document.querySelector('#quoteText').scrollHeight,
      cardFits: document.querySelector('.center-card').scrollHeight <= document.querySelector('.center-card').clientHeight + 1,
      blocksFit: blocks.every((block) => block.scrollHeight <= block.clientHeight + 1),
      blocksTransparent: blocks.every((block) => getComputedStyle(block).backgroundColor === 'rgba(0, 0, 0, 0)'),
      blocksSquare: blocks.every((block) => parseFloat(getComputedStyle(block).borderRadius) === 0),
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      actions: [...document.querySelectorAll('.quote-action')].map((action) => {
        const actionRect = action.getBoundingClientRect();
        return { id: action.id, width: actionRect.width, height: actionRect.height };
      }),
      contentLeftInset: content.left - stage.left,
    };
  });
}

test.beforeAll(() => fs.mkdirSync(screenshotDir, { recursive: true }));

for (const theme of ['day', 'night']) {
  test(`1448 inicial ${theme} usa convite compacto sem falsa autoria`, async ({ page }) => {
    await openLayout(page, { width: 1448, height: 1086, theme });
    const metrics = await centralMetrics(page);
    expect(metrics.stageRatio).toBeGreaterThanOrEqual(0.89);
    expect(metrics.stageRatio).toBeLessThanOrEqual(0.93);
    expect(metrics.stageRadius).toBeGreaterThanOrEqual(12);
    expect(metrics.stageRadius).toBeLessThanOrEqual(15);
    expect(metrics.stageHeight).toBeLessThan(280);
    expect(metrics.blocksTransparent).toBe(true);
    expect(metrics.blocksSquare).toBe(true);
    expect(metrics.blocksFit).toBe(true);
    expect(metrics.horizontalOverflow).toBeLessThanOrEqual(1);
    await expect(page.locator('#quoteAuthor')).toBeHidden();
    await expect(page.locator('#quoteSource')).toBeHidden();
    await page.screenshot({ path: path.join(screenshotDir, `1448-inicial-${theme}.png`), fullPage: true });
  });
}

for (const theme of ['day', 'night']) {
  test(`1448 frase curta ${theme} preserva papel, autoria e fonte`, async ({ page }) => {
    await openLayout(page, { width: 1448, height: 1086, theme });
    await generateRealReflection(page);
    await setVisualFixture(page, {
      quote: 'O essencial amadurece quando encontra tempo e atenção.',
      author: '— Autoria documentada',
      source: 'Fonte: Obra documentada · seção verificável',
    });
    const metrics = await centralMetrics(page);
    expect(metrics.quoteAlign).toBe('left');
    expect(metrics.quoteFontSize).toBeGreaterThanOrEqual(29);
    expect(metrics.quoteFontSize).toBeLessThanOrEqual(35);
    expect(metrics.contentPaddingTop).toBeGreaterThanOrEqual(25);
    expect(metrics.contentPaddingTop).toBeLessThanOrEqual(27);
    expect(metrics.contentPaddingLeft).toBeGreaterThanOrEqual(42);
    expect(metrics.contentPaddingLeft).toBeLessThanOrEqual(52);
    expect(metrics.quoteFits).toBe(true);
    expect(metrics.cardFits).toBe(true);
    await page.screenshot({ path: path.join(screenshotDir, `1448-curta-${theme}.png`), fullPage: true });
  });
}

for (const theme of ['day', 'night']) {
  test(`1448 texto longo ${theme} cresce sem corte ou rolagem interna`, async ({ page }) => {
    await openLayout(page, { width: 1448, height: 1086, theme });
    await generateRealReflection(page);
    await setVisualFixture(page, {
      long: true,
      quote: 'A atenção não elimina a incerteza. Ela abre espaço para perceber o que pede cuidado, distinguir o que depende de nós e atravessar cada escolha sem exigir da vida uma resposta pronta antes do próximo passo.\n\nQuando a pressa cede, o pensamento encontra proporção e o gesto pode nascer inteiro.',
      author: '— Autoria documentada',
      source: 'Fonte: Edição crítica com referência editorial extensa · capítulo 12 · tradução documentada',
    });
    const metrics = await centralMetrics(page);
    expect(metrics.quoteAlign).toBe('left');
    expect(metrics.quoteFontSize).toBeGreaterThanOrEqual(24);
    expect(metrics.quoteFontSize).toBeLessThanOrEqual(29);
    expect(metrics.quoteFits).toBe(true);
    expect(metrics.cardFits).toBe(true);
    expect(metrics.blocksFit).toBe(true);
    await page.screenshot({ path: path.join(screenshotDir, `1448-longa-${theme}.png`), fullPage: true });
  });
}

for (const theme of ['day', 'night']) {
  test(`1366 compacto ${theme} mantém escala e fluxo`, async ({ page }) => {
    await openLayout(page, { width: 1366, height: 768, theme });
    await generateRealReflection(page);
    const metrics = await centralMetrics(page);
    expect(metrics.stageRatio).toBeGreaterThanOrEqual(0.9);
    expect(metrics.stageRatio).toBeLessThanOrEqual(0.96);
    expect(metrics.quoteFontSize).toBeGreaterThanOrEqual(19);
    expect(metrics.quoteFontSize).toBeLessThanOrEqual(31);
    expect(metrics.cardFits).toBe(true);
    expect(metrics.horizontalOverflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: path.join(screenshotDir, `1366-gerada-${theme}.png`), fullPage: true });
  });
}

for (const theme of ['day', 'night']) {
  test(`390 ${theme} preserva leitura completa e alvos de toque`, async ({ page }) => {
    await openLayout(page, { width: 390, height: 844, theme });
    await generateRealReflection(page);
    const metrics = await centralMetrics(page);
    expect(metrics.stageRatio).toBeGreaterThanOrEqual(0.99);
    expect(metrics.stageRatio).toBeLessThanOrEqual(1.01);
    expect(metrics.quoteFontSize).toBeGreaterThanOrEqual(20);
    expect(metrics.quoteFontSize).toBeLessThanOrEqual(25);
    expect(metrics.contentPaddingLeft).toBeGreaterThanOrEqual(24);
    expect(metrics.contentPaddingLeft).toBeLessThanOrEqual(28);
    expect(metrics.actions.map(({ id }) => id)).toEqual(['quoteShareBtn', 'favoriteBtn', 'likeBtn']);
    expect(metrics.actions.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
    expect(metrics.blocksFit).toBe(true);
    expect(metrics.horizontalOverflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: path.join(screenshotDir, `390-gerada-${theme}.png`), fullPage: true });
  });
}

test('ausências de autoria e fonte não deixam lacunas artificiais', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086 });
  await generateRealReflection(page);
  await setVisualFixture(page, { author: '', source: 'Fonte: Documento preservado' });
  await expect(page.locator('#quoteAuthor')).toBeHidden();
  await expect(page.locator('#quoteSource')).toBeVisible();
  await page.locator('.quote-stage').screenshot({ path: path.join(screenshotDir, 'autoria-ausente.png') });

  await setVisualFixture(page, { author: '— Autoria documentada', source: '' });
  await expect(page.locator('#quoteAuthor')).toBeVisible();
  await expect(page.locator('#quoteSource')).toBeHidden();
  await page.locator('.quote-stage').screenshot({ path: path.join(screenshotDir, 'fonte-ausente.png') });
});

test('pergunta e livro longos crescem integralmente', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086 });
  await generateRealReflection(page);
  await setVisualFixture(page, {
    question: 'Que parte desta experiência você consegue acolher sem apressar uma conclusão — e que pequena escolha concreta pode receber sua atenção antes que o dia termine?',
  });
  await expect(page.locator('#adviceBlock')).toHaveJSProperty('scrollHeight', await page.locator('#adviceBlock').evaluate((element) => element.clientHeight));
  await page.locator('#adviceBlock').screenshot({ path: path.join(screenshotDir, 'pergunta-longa.png') });

  await setVisualFixture(page, {
    book: 'Uma obra de título deliberadamente longo para preservar a leitura editorial, de Autoria Documentada',
    bookReason: 'A recomendação oferece um percurso gradual por atenção, responsabilidade e tempo. O leitor encontrará capítulos extensos e uma referência bibliográfica que precisa permanecer inteira, sem reticências, corte ou rolagem interna.',
  });
  const bookFits = await page.locator('#bookRecommendation').evaluate((element) => element.scrollHeight <= element.clientHeight + 1);
  expect(bookFits).toBe(true);
  await page.locator('#bookRecommendation').screenshot({ path: path.join(screenshotDir, 'livro-longo.png') });
});

test('foco, estrela, coração e carregamento mantêm estados visuais reais', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086 });
  await generateRealReflection(page);
  await page.locator('#quoteShareBtn').focus();
  await expect(page.locator('#quoteShareBtn')).toBeFocused();
  await page.locator('.quote-stage').screenshot({ path: path.join(screenshotDir, 'foco-compartilhar.png') });

  await page.locator('#favoriteBtn').click();
  await expect(page.locator('#favoriteBtn')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.quote-stage').screenshot({ path: path.join(screenshotDir, 'estrela-ativa.png') });

  await page.locator('#likeBtn').click();
  await expect(page.locator('#likeBtn')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.quote-stage').screenshot({ path: path.join(screenshotDir, 'coracao-ativo.png') });

  await page.evaluate(() => document.getElementById('generateBtn').click());
  await expect(page.locator('#generateBtn')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('.center-card')).toHaveClass(/is-reflection-loading/);
  await page.locator('.col-center').screenshot({ path: path.join(screenshotDir, 'carregamento-atomico.png') });
});

test('movimento reduzido elimina transição e deslocamento', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086, reducedMotion: 'reduce' });
  await generateRealReflection(page);
  await page.locator('.center-card').evaluate((card) => card.classList.add('is-reflection-loading'));
  const motion = await page.evaluate(() => {
    const stage = getComputedStyle(document.querySelector('.quote-stage'));
    const block = getComputedStyle(document.querySelector('.block'));
    return { stageDuration: stage.transitionDuration, blockDuration: block.transitionDuration, transform: stage.transform };
  });
  expect(motion.stageDuration).toBe('0s');
  expect(motion.blockDuration).toBe('0s');
  expect(motion.transform).toBe('none');
  await page.locator('.col-center').screenshot({ path: path.join(screenshotDir, 'movimento-reduzido.png') });
});

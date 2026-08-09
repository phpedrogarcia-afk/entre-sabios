import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const screenshotDir = process.env.ENTRE_SABIOS_SCREENSHOT_DIR
  || path.join(os.tmpdir(), 'entre-sabios-layout-v2-etapa4-1-20260729');

async function openLayout(page, { width, height, theme = 'day' }) {
  await page.setViewportSize({ width, height });
  await page.addInitScript((savedTheme) => {
    localStorage.clear();
    if (savedTheme === 'night') localStorage.setItem('entreSabiosTheme', 'night');
  }, theme);
  await page.goto('/');
  await expect(page.locator('#contentLoadStatus')).toHaveText('');
  await expect(page.locator('#feelingsGrid .feeling')).toHaveCount(14);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

async function setFixture(page, kind = 'short') {
  await page.evaluate((fixtureKind) => {
    const quote = document.getElementById('quoteText');
    quote.classList.remove('invitation', 'long-quote', 'quote-microtext', 'has-paragraphs');
    quote.replaceChildren();

    if (fixtureKind === 'short') {
      quote.textContent = '“O essencial amadurece quando encontra tempo e atenção.”';
    } else {
      const paragraphs = [
        'A atenção não elimina a incerteza. Ela abre espaço para perceber o que pede cuidado, distinguir o que depende de nós e atravessar cada escolha sem exigir da vida uma resposta pronta antes do próximo passo.',
        'Quando a pressa cede, o pensamento encontra proporção e o gesto pode nascer inteiro.',
      ];
      quote.classList.add('long-quote');
      if (fixtureKind === 'microtext') quote.classList.add('quote-microtext');
      quote.classList.add('has-paragraphs');
      for (const paragraph of paragraphs) {
        const span = document.createElement('span');
        span.className = 'quote-paragraph';
        span.textContent = paragraph;
        quote.appendChild(span);
      }
    }

    const values = {
      quoteAuthor: '— Autoria documentada',
      quoteSource: 'Fonte: Edição crítica · capítulo 12 · tradução documentada',
      reflectionText: 'A leitura preserva a dúvida sem transformar hesitação em paralisia. O sentido aparece por aproximação, com responsabilidade e tempo.',
      philosophyText: 'A tradição filosófica aqui apresentada distingue atenção, escolha e consequência sem prometer respostas absolutas.',
      adviceText: 'Que parte desta experiência pode receber atenção antes de exigir uma conclusão?',
      bookText: 'Uma obra de título editorialmente extenso, de Autoria Documentada',
      bookReason: 'A recomendação oferece um percurso gradual por atenção, responsabilidade e tempo, preservando a referência completa.',
    };
    for (const [id, value] of Object.entries(values)) {
      const element = document.getElementById(id);
      element.hidden = false;
      element.textContent = value;
    }
  }, kind);
}

async function viewportMetrics(page) {
  return page.evaluate(() => {
    const query = (selector) => document.querySelector(selector);
    const rect = (selector) => query(selector).getBoundingClientRect();
    const center = query('.col-center');
    const left = query('.col-left');
    const right = query('.col-right');
    const shell = rect('.shell');
    return {
      viewport: { width: innerWidth, height: innerHeight },
      body: {
        clientHeight: document.body.clientHeight,
        scrollHeight: document.body.scrollHeight,
        overflowY: getComputedStyle(document.body).overflowY,
      },
      document: {
        clientHeight: document.documentElement.clientHeight,
        scrollHeight: document.documentElement.scrollHeight,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      },
      headerHeight: rect('.topbar').height,
      shell: { top: shell.top, bottom: shell.bottom, height: shell.height },
      center: {
        clientHeight: center.clientHeight,
        scrollHeight: center.scrollHeight,
        overflowY: getComputedStyle(center).overflowY,
        overscroll: getComputedStyle(center).overscrollBehavior,
      },
      left: { clientHeight: left.clientHeight, scrollHeight: left.scrollHeight, top: rect('.col-left').top },
      right: {
        clientHeight: right.clientHeight,
        scrollHeight: right.scrollHeight,
        overflowY: getComputedStyle(right).overflowY,
        top: rect('.col-right').top,
      },
    };
  });
}

async function assertDesktopFrame(page) {
  const metrics = await viewportMetrics(page);
  expect(metrics.body.overflowY).toBe('hidden');
  expect(metrics.body.scrollHeight).toBeLessThanOrEqual(metrics.viewport.height + 1);
  expect(metrics.document.scrollHeight).toBeLessThanOrEqual(metrics.viewport.height + 1);
  expect(metrics.document.scrollWidth - metrics.document.clientWidth).toBeLessThanOrEqual(1);
  expect(metrics.shell.bottom).toBeLessThanOrEqual(metrics.viewport.height + 1);
  expect(metrics.center.overflowY).toBe('auto');
  expect(metrics.center.overscroll).toContain('contain');
  return metrics;
}

test.beforeAll(() => fs.mkdirSync(screenshotDir, { recursive: true }));

for (const scenario of [
  { width: 1448, height: 1086, theme: 'day', kind: 'short', name: '1448x1086-dia-curta' },
  { width: 1448, height: 1086, theme: 'night', kind: 'short', name: '1448x1086-noite-curta' },
  { width: 1448, height: 1086, theme: 'day', kind: 'long', name: '1448x1086-dia-longa' },
  { width: 1600, height: 900, theme: 'day', kind: 'short', name: '1600x900-dia' },
  { width: 1920, height: 1080, theme: 'day', kind: 'short', name: '1920x1080-dia' },
]) {
  test(`${scenario.name} preserva a composição desktop`, async ({ page }) => {
    await openLayout(page, scenario);
    await setFixture(page, scenario.kind);
    await assertDesktopFrame(page);
    const fits = await page.evaluate(() => [...document.querySelectorAll('.quote-stage, .block:not([hidden]), .book-rec:not([hidden])')]
      .every((element) => element.scrollHeight <= element.clientHeight + 1));
    expect(fits).toBe(true);
    await page.screenshot({ path: path.join(screenshotDir, `${scenario.name}.png`), fullPage: true });
  });
}

for (const theme of ['day', 'night']) {
  test(`1366x768 ${theme} rola a região central longa e preserva a lateral acessível`, async ({ page }) => {
    await openLayout(page, { width: 1366, height: 768, theme });
    await setFixture(page, 'microtext');
    const metrics = await assertDesktopFrame(page);
    expect(metrics.center.scrollHeight).toBeGreaterThan(metrics.center.clientHeight);
    expect(metrics.left.scrollHeight).toBeLessThanOrEqual(metrics.left.clientHeight + 1);
    expect(metrics.right.overflowY).toBe('auto');

    const compact = await page.evaluate(() => {
      const style = (selector) => getComputedStyle(document.querySelector(selector));
      const rect = (selector) => document.querySelector(selector).getBoundingClientRect();
      const feelingHeights = [...document.querySelectorAll('.feeling')].map((item) => item.getBoundingClientRect().height);
      const quoteFont = parseFloat(style('#quoteText').fontSize);
      const paragraphGap = parseFloat(style('#quoteText').rowGap);
      return {
        feelingMin: Math.min(...feelingHeights),
        feelingMax: Math.max(...feelingHeights),
        observer: rect('.feelings-heading-icon').height,
        generateHeight: rect('#generateBtn').height,
        quoteFont,
        paragraphGap,
        paperPaddingTop: parseFloat(style('.quote-content').paddingTop),
        paperPaddingLeft: parseFloat(style('.quote-content').paddingLeft),
        blockFont: parseFloat(style('.block-text').fontSize),
      };
    });
    expect(compact.feelingMin).toBeGreaterThanOrEqual(47);
    expect(compact.feelingMax).toBeLessThanOrEqual(50);
    expect(compact.observer).toBeGreaterThanOrEqual(28);
    expect(compact.observer).toBeLessThanOrEqual(31);
    expect(compact.generateHeight).toBeGreaterThanOrEqual(48);
    expect(compact.quoteFont).toBeGreaterThanOrEqual(19);
    expect(compact.quoteFont).toBeLessThanOrEqual(23);
    expect(compact.paragraphGap / compact.quoteFont).toBeGreaterThanOrEqual(0.7);
    expect(compact.paragraphGap / compact.quoteFont).toBeLessThanOrEqual(0.9);
    expect(compact.paperPaddingTop).toBeGreaterThanOrEqual(28);
    expect(compact.paperPaddingTop).toBeLessThanOrEqual(34);
    expect(compact.paperPaddingLeft).toBeGreaterThanOrEqual(28);
    expect(compact.paperPaddingLeft).toBeLessThanOrEqual(36);
    expect(compact.blockFont).toBeGreaterThanOrEqual(14);
    expect(compact.blockFont).toBeLessThanOrEqual(15);

    await page.screenshot({ path: path.join(screenshotDir, `1366x768-${theme}-longa-topo.png`) });
    const before = await page.evaluate(() => ({
      body: scrollY,
      header: document.querySelector('.topbar').getBoundingClientRect().top,
      left: document.querySelector('.col-left').getBoundingClientRect().top,
      right: document.querySelector('.col-right').getBoundingClientRect().top,
      center: document.querySelector('.col-center').getBoundingClientRect().top,
      controlsTop: document.querySelector('.center-top').getBoundingClientRect().top,
    }));
    await page.locator('.col-center').focus();
    await expect(page.locator('.col-center')).toBeFocused();
    await page.locator('.col-center').press('PageDown');
    await expect.poll(() => page.locator('.col-center').evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    const after = await page.evaluate(() => ({
      body: scrollY,
      header: document.querySelector('.topbar').getBoundingClientRect().top,
      left: document.querySelector('.col-left').getBoundingClientRect().top,
      right: document.querySelector('.col-right').getBoundingClientRect().top,
      center: document.querySelector('.col-center').getBoundingClientRect().top,
      controlsTop: document.querySelector('.center-top').getBoundingClientRect().top,
      controlsPosition: getComputedStyle(document.querySelector('.center-top')).position,
      outline: getComputedStyle(document.querySelector('.col-center')).outlineStyle,
    }));
    expect(after.body).toBe(before.body);
    expect(after.header).toBeCloseTo(before.header, 1);
    expect(after.left).toBeCloseTo(before.left, 1);
    expect(after.right).toBeCloseTo(before.right, 1);
    expect(after.controlsTop).toBeLessThan(before.controlsTop);
    expect(after.controlsPosition).toBe('static');
    expect(after.outline).not.toBe('none');
    await page.screenshot({ path: path.join(screenshotDir, `1366x768-${theme}-longa-centro-rolado.png`) });
  });
}

test('conteúdo curto que cabe não cria deslocamento central', async ({ page }) => {
  await openLayout(page, { width: 1600, height: 900 });
  await setFixture(page, 'short');
  await page.evaluate(() => {
    for (const selector of ['#explanationBlock', '#philosophyBlock', '#adviceBlock', '#bookRecommendation', '#tagsRow']) {
      document.querySelector(selector).hidden = true;
    }
  });
  const metrics = await assertDesktopFrame(page);
  expect(metrics.center.scrollHeight).toBeLessThanOrEqual(metrics.center.clientHeight + 1);
  await page.locator('.col-center').focus();
  await page.locator('.col-center').press('PageDown');
  expect(await page.locator('.col-center').evaluate((element) => element.scrollTop)).toBe(0);
});

test('tipografia muda por tipo editorial sem contagem de caracteres', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086 });
  await setFixture(page, 'short');
  const shortFont = await page.locator('#quoteText').evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  await setFixture(page, 'long');
  const longFont = await page.locator('#quoteText').evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  await setFixture(page, 'microtext');
  const microFont = await page.locator('#quoteText').evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  expect(shortFont).toBeGreaterThanOrEqual(29);
  expect(shortFont).toBeLessThanOrEqual(34);
  expect(longFont).toBeGreaterThanOrEqual(24);
  expect(longFont).toBeLessThanOrEqual(29);
  expect(microFont).toBeGreaterThanOrEqual(21);
  expect(microFont).toBeLessThanOrEqual(25);
  expect(shortFont).toBeGreaterThan(longFont);
  expect(longFont).toBeGreaterThan(microFont);
});

for (const theme of ['day', 'night']) {
  test(`390x844 ${theme} preserva rolagem do documento`, async ({ page }) => {
    await openLayout(page, { width: 390, height: 844, theme });
    await setFixture(page, 'microtext');
    const metrics = await viewportMetrics(page);
    expect(metrics.body.overflowY).not.toBe('hidden');
    expect(metrics.document.scrollHeight).toBeGreaterThan(metrics.document.clientHeight);
    expect(metrics.center.overflowY).toBe('visible');
    expect(await page.locator('.center-top').evaluate((element) => getComputedStyle(element).position)).not.toBe('sticky');
    expect(metrics.document.scrollWidth - metrics.document.clientWidth).toBeLessThanOrEqual(1);
    await page.screenshot({ path: path.join(screenshotDir, `390x844-${theme}.png`), fullPage: true });
  });
}

test('smartphone horizontal mantém uma coluna e rolagem normal', async ({ page }) => {
  await openLayout(page, { width: 844, height: 390 });
  await setFixture(page, 'microtext');
  const state = await page.evaluate(() => ({
    bodyOverflow: getComputedStyle(document.body).overflowY,
    shellColumns: getComputedStyle(document.querySelector('.shell')).gridTemplateColumns.split(' ').length,
    centerOverflow: getComputedStyle(document.querySelector('.col-center')).overflowY,
    documentScrolls: document.documentElement.scrollHeight > document.documentElement.clientHeight,
  }));
  expect(state.bodyOverflow).not.toBe('hidden');
  expect(state.shellColumns).toBe(1);
  expect(state.centerOverflow).toBe('visible');
  expect(state.documentScrolls).toBe(true);
});

test('limiar de 1100 mantém documento; 1101 ativa aplicação desktop', async ({ page }) => {
  await openLayout(page, { width: 1100, height: 800 });
  expect(await page.locator('body').evaluate((element) => getComputedStyle(element).overflowY)).not.toBe('hidden');
  await page.setViewportSize({ width: 1101, height: 800 });
  expect(await page.locator('body').evaluate((element) => getComputedStyle(element).overflowY)).toBe('hidden');
  expect(await page.locator('.col-center').evaluate((element) => getComputedStyle(element).overflowY)).toBe('auto');
});

test('geometria do desktop compacto é a mesma de dia e de noite e não há erros', async ({ page }) => {
  await openLayout(page, { width: 1366, height: 768, theme: 'day' });
  await setFixture(page, 'microtext');
  const geometry = () => page.evaluate(() => {
    const pick = (selector) => {
      const rect = document.querySelector(selector).getBoundingClientRect();
      return [rect.x, rect.y, rect.width, rect.height];
    };
    return ['.topbar', '.col-left', '.col-center', '.col-right', '.quote-stage'].map(pick);
  });
  const day = await geometry();
  await page.evaluate(() => { document.documentElement.dataset.theme = 'night'; });
  const night = await geometry();
  expect(night).toEqual(day);
  expect(await page.locator('.quote-stage').evaluate((element) => getComputedStyle(element).overflowY)).toBe('visible');
  expect(await page.locator('.center-card').evaluate((element) => getComputedStyle(element).overflowY)).toBe('visible');
});

import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const screenshotDir = process.env.ENTRE_SABIOS_SCREENSHOT_DIR
  || path.join(os.tmpdir(), 'entre-sabios-layout-v2-etapa5-20260729');

const savedFixtures = [
  { key: 'etapa5-1', quote: 'A atenção devolve medida ao instante.', attribution: 'Entre Sábios', source: 'Acervo de teste', savedAt: '2026-07-29T12:00:00.000Z' },
  { key: 'etapa5-2', quote: 'Toda travessia começa por reconhecer a margem.', attribution: 'Entre Sábios', source: 'Acervo de teste', savedAt: '2026-07-29T12:01:00.000Z' },
  { key: 'etapa5-3', quote: 'O silêncio também organiza perguntas.', attribution: 'Entre Sábios', source: 'Acervo de teste', savedAt: '2026-07-29T12:02:00.000Z' },
];

async function openLayout(page, { width, height, theme = 'day', favorites = [], mockShare = false }) {
  await page.setViewportSize({ width, height });
  await page.addInitScript(({ savedTheme, savedFavorites, shouldMockShare }) => {
    localStorage.clear();
    if (savedTheme === 'night') localStorage.setItem('entreSabiosTheme', 'night');
    localStorage.setItem('caixaSabedoriaFavoritas', JSON.stringify(savedFavorites));
    if (shouldMockShare) {
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: async (payload) => { window.__etapa5SharedPayload = payload; },
      });
    }
  }, { savedTheme: theme, savedFavorites: favorites, shouldMockShare: mockShare });
  await page.goto('/');
  await expect(page.locator('#contentLoadStatus')).toHaveText('');
  await expect(page.locator('#feelingsGrid .feeling')).toHaveCount(14);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

async function generateReflection(page) {
  await page.locator('#feelingsGrid .feeling').first().click();
  await page.locator('#generateBtn').click();
  await expect(page.locator('#quoteText')).not.toContainText('Como você está se sentindo hoje?');
}

async function rightMetrics(page) {
  return page.evaluate(() => {
    const right = document.querySelector('.col-right');
    const center = document.querySelector('.col-center');
    const ambient = document.querySelector('.right-ambient-space');
    return {
      viewport: [innerWidth, innerHeight],
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bodyOverflow: getComputedStyle(document.body).overflowY,
      right: {
        clientHeight: right.clientHeight,
        scrollHeight: right.scrollHeight,
        overflowY: getComputedStyle(right).overflowY,
        ambientEnd: ambient.offsetTop + ambient.offsetHeight,
      },
      center: {
        clientHeight: center.clientHeight,
        scrollHeight: center.scrollHeight,
        overflowY: getComputedStyle(center).overflowY,
      },
      cardHeights: [...document.querySelectorAll('.explore-card')].map((card) => card.getBoundingClientRect().height),
      duplicateIds: [...document.querySelectorAll('[id]')]
        .map((element) => element.id)
        .filter((id, index, ids) => ids.indexOf(id) !== index),
    };
  });
}

test.beforeAll(() => fs.mkdirSync(screenshotDir, { recursive: true }));

test('estrutura final usa os destinos reais sem duplicação', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086 });
  await expect(page.locator('.live-info .essays-trigger')).toHaveCount(0);
  await expect(page.locator('.center-top #favoritesBtn')).toHaveCount(0);
  await expect(page.locator('.center-top > *')).toHaveCount(2);
  await expect(page.locator('.col-right #openTaleBtn')).toHaveCount(1);
  await expect(page.locator('.col-right .essays-trigger')).toHaveAttribute('href', 'ensaios/');
  await expect(page.locator('.col-right #favoritesBtn')).toHaveCount(1);
  const metrics = await rightMetrics(page);
  expect(metrics.duplicateIds).toEqual([]);
  expect(metrics.documentOverflow).toBeLessThanOrEqual(1);
});

test('Contos e Leituras salvas abrem os mesmos diálogos e preservam itens antigos', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086, favorites: savedFixtures });
  await expect(page.locator('#favoritesCount')).toHaveText('3');
  await page.locator('#favoritesBtn').click();
  await expect(page.locator('#favoritesDialog')).toHaveAttribute('open', '');
  await expect(page.locator('#favoritesList .favorite-item')).toHaveCount(3);
  await page.screenshot({ path: path.join(screenshotDir, 'modal-leituras-salvas.png') });
  await page.locator('#closeFavoritesBtn').click();

  await page.locator('#openTaleBtn').click();
  await expect(page.locator('#taleDialog')).toHaveAttribute('open', '');
  await expect(page.locator('#taleTitle')).not.toHaveText('—');
  await page.screenshot({ path: path.join(screenshotDir, 'modal-contos.png') });
});

test('contador lateral acompanha salvar e remover a reflexão atual', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086, favorites: savedFixtures });
  await generateReflection(page);
  await expect(page.locator('#favoritesCount')).toHaveText('3');
  await page.locator('#favoriteBtn').click();
  await expect(page.locator('#favoritesCount')).toHaveText('4');
  await page.locator('#favoriteBtn').click();
  await expect(page.locator('#favoritesCount')).toHaveText('3');
});

test('Voltar e Outra perspectiva continuam no fluxo central', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086 });
  await generateReflection(page);
  const first = await page.locator('#quoteText').textContent();
  await page.locator('#newBtn').click();
  await expect.poll(() => page.locator('#quoteText').textContent()).not.toBe(first);
  await page.locator('#backBtn').click();
  await expect(page.locator('#quoteText')).toHaveText(first);
});

test('Status Stories preserva imagem, Web Share e estilo escolhido', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086, mockShare: true });
  await generateReflection(page);
  await page.locator('[data-share-style="blue"]').click();
  await expect(page.locator('[data-share-style="blue"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#whatsShareBtn').click();
  await expect(page.locator('#shareStatus')).toContainText('Imagem compartilhada');
  const payload = await page.evaluate(() => ({
    title: window.__etapa5SharedPayload?.title,
    files: window.__etapa5SharedPayload?.files?.length,
    filename: window.__etapa5SharedPayload?.files?.[0]?.name,
  }));
  expect(payload.title).toBe('Entre Sábios');
  expect(payload.files).toBe(1);
  expect(payload.filename).toContain('blue-stories.png');
  await expect(page.locator('.share-platform-icons button, .share-platform-icons a, .share-platform-icons [role="button"]')).toHaveCount(0);
});

test('cream, sage e blue têm estado ativo inequívoco e foco por teclado', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086 });
  for (const style of ['cream', 'sage', 'blue']) {
    const option = page.locator(`[data-share-style="${style}"]`);
    await option.click();
    await expect(option).toHaveAttribute('aria-pressed', 'true');
    await option.focus();
    await expect(option).toBeFocused();
    const ring = await option.evaluate((element) => getComputedStyle(element).boxShadow);
    expect(ring).not.toBe('none');
    await page.locator('.col-right').screenshot({ path: path.join(screenshotDir, `estilo-${style}-ativo.png`) });
  }
});

test('cada card recebe foco visível e mantém alvo mínimo', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086 });
  const cards = [
    ['#openTaleBtn', 'foco-contos.png'],
    ['.explore-card.essays-trigger', 'foco-ensaios.png'],
    ['#favoritesBtn', 'foco-leituras-salvas.png'],
  ];
  for (const [selector, filename] of cards) {
    const card = page.locator(selector);
    await card.focus();
    await expect(card).toBeFocused();
    expect(await card.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
    expect(await card.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
    await page.locator('.col-right').screenshot({ path: path.join(screenshotDir, filename) });
  }
});

for (const scenario of [
  { width: 1448, height: 1086, theme: 'day', name: '1448x1086-dia' },
  { width: 1448, height: 1086, theme: 'night', name: '1448x1086-noite' },
  { width: 1366, height: 768, theme: 'day', name: '1366x768-dia' },
  { width: 1366, height: 768, theme: 'night', name: '1366x768-noite' },
  { width: 1600, height: 900, theme: 'day', name: '1600x900-dia' },
]) {
  test(`${scenario.name} mantém painel estável e sem corte`, async ({ page }) => {
    await openLayout(page, scenario);
    const metrics = await rightMetrics(page);
    expect(metrics.bodyOverflow).toBe('hidden');
    expect(metrics.right.overflowY).toBe('auto');
    expect(metrics.right.ambientEnd).toBeLessThanOrEqual(metrics.right.scrollHeight + 1);
    expect(metrics.center.overflowY).toBe('auto');
    expect(metrics.documentOverflow).toBeLessThanOrEqual(1);
    expect(Math.min(...metrics.cardHeights)).toBeGreaterThanOrEqual(68);
    await page.screenshot({ path: path.join(screenshotDir, `${scenario.name}.png`) });
  });
}

for (const theme of ['day', 'night']) {
  test(`390x844 ${theme} empilha Explorar depois da reflexão`, async ({ page }) => {
    await openLayout(page, { width: 390, height: 844, theme });
    const state = await page.evaluate(() => {
      const center = document.querySelector('.col-center').getBoundingClientRect();
      const explore = document.querySelector('.explore-section').getBoundingClientRect();
      const share = document.querySelector('.share-block').getBoundingClientRect();
      return {
        bodyOverflow: getComputedStyle(document.body).overflowY,
        centerBottom: center.bottom,
        exploreTop: explore.top,
        exploreBottom: explore.bottom,
        shareTop: share.top,
        columns: getComputedStyle(document.querySelector('.shell')).gridTemplateColumns.split(' ').length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        cardWidths: [...document.querySelectorAll('.explore-card')].map((card) => card.getBoundingClientRect().width),
      };
    });
    expect(state.bodyOverflow).not.toBe('hidden');
    expect(state.columns).toBe(1);
    expect(state.exploreTop).toBeGreaterThanOrEqual(state.centerBottom - 1);
    expect(state.shareTop).toBeGreaterThan(state.exploreBottom);
    expect(state.overflow).toBeLessThanOrEqual(1);
    expect(Math.max(...state.cardWidths) - Math.min(...state.cardWidths)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: path.join(screenshotDir, `390x844-${theme}.png`), fullPage: true });
  });
}

test('zero e várias leituras salvas permanecem visualmente legíveis', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086 });
  await expect(page.locator('#favoritesCount')).toHaveText('0');
  await page.locator('.col-right').screenshot({ path: path.join(screenshotDir, 'explorar-zero-leituras.png') });

  await openLayout(page, { width: 1448, height: 1086, favorites: savedFixtures });
  await expect(page.locator('#favoritesCount')).toHaveText('3');
  await page.locator('.col-right').screenshot({ path: path.join(screenshotDir, 'explorar-varias-leituras.png') });
});

test('não há erros de console durante os caminhos laterais', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await openLayout(page, { width: 1366, height: 768, favorites: savedFixtures });
  await page.locator('#favoritesBtn').click();
  await page.locator('#closeFavoritesBtn').click();
  await page.locator('#openTaleBtn').click();
  await page.locator('#closeTaleTopBtn').click();
  for (const style of ['cream', 'sage', 'blue']) await page.locator(`[data-share-style="${style}"]`).click();
  expect(errors).toEqual([]);
});

import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const screenshotDir = process.env.ENTRE_SABIOS_SCREENSHOT_DIR
  || path.join(os.tmpdir(), 'entre-sabios-layout-v2-etapa6-20260730');

const savedFixtures = [
  { key: 'etapa6-1', quote: 'A atenção devolve medida ao instante.', attribution: 'Entre Sábios', source: 'Acervo de teste', savedAt: '2026-07-30T12:00:00.000Z' },
  { key: 'etapa6-2', quote: 'Toda travessia começa por reconhecer a margem.', attribution: 'Entre Sábios', source: 'Acervo de teste', savedAt: '2026-07-30T12:01:00.000Z' },
];

async function openLayout(page, { width, height, theme = 'day', favorites = [], reducedMotion = false }) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });
  await page.addInitScript(({ savedTheme, savedFavorites }) => {
    localStorage.clear();
    localStorage.setItem('entreSabiosTheme', savedTheme);
    localStorage.setItem('caixaSabedoriaFavoritas', JSON.stringify(savedFavorites));
  }, { savedTheme: theme, savedFavorites: favorites });
  await page.goto('/');
  await expect(page.locator('#contentLoadStatus')).toHaveText('');
  await expect(page.locator('#feelingsGrid .feeling')).toHaveCount(14);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

async function environmentMetrics(page) {
  return page.evaluate(() => {
    const right = document.querySelector('.col-right');
    const center = document.querySelector('.col-center');
    const decorative = [...document.querySelectorAll('.environment-layer, .environment-overlay-layer, .header-moon, .paper-texture, .right-ambient-space')];
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bodyOverflow: getComputedStyle(document.body).overflowY,
      rightDelta: right.scrollHeight - right.clientHeight,
      rightOverflow: getComputedStyle(right).overflowY,
      centerOverflow: getComputedStyle(center).overflowY,
      pointerEvents: decorative.map((element) => getComputedStyle(element).pointerEvents),
      theme: document.documentElement.dataset.theme,
      moon: getComputedStyle(document.querySelector('.header-moon')).display,
      treeDay: getComputedStyle(document.querySelector('.environment-tree-day')).display,
      treeDayOpacity: Number.parseFloat(getComputedStyle(document.querySelector('.environment-tree-day')).opacity),
      treeNight: getComputedStyle(document.querySelector('.environment-tree-night')).display,
      fireflies: getComputedStyle(document.querySelector('.fireflies')).display,
      firefliesZIndex: getComputedStyle(document.querySelector('.fireflies')).zIndex,
      fireflyNearTreeSize: Number.parseFloat(getComputedStyle(document.querySelector('.firefly-7')).width),
      staticLeaves: [...document.querySelectorAll('.environment-leaf-static')]
        .filter((element) => getComputedStyle(element).display !== 'none').length,
      animatedLeaves: [...document.querySelectorAll('.environment-leaf')]
        .filter((element) => getComputedStyle(element).animationName !== 'none').length,
      landscapeDay: getComputedStyle(document.querySelector('.environment-landscape-day')).display,
      landscapeNight: getComputedStyle(document.querySelector('.environment-landscape-night')).display,
    };
  });
}

test.beforeAll(() => fs.mkdirSync(screenshotDir, { recursive: true }));

for (const scenario of [
  { width: 1448, height: 1086, theme: 'day', name: '1448x1086-day' },
  { width: 1448, height: 1086, theme: 'night', name: '1448x1086-night' },
  { width: 1366, height: 768, theme: 'day', name: '1366x768-day' },
  { width: 1366, height: 768, theme: 'night', name: '1366x768-night' },
  { width: 1600, height: 900, theme: 'day', name: '1600x900-day' },
  { width: 1920, height: 1080, theme: 'night', name: '1920x1080-night' },
]) {
  test(`${scenario.name} preserva camadas, rolagem e tema`, async ({ page }) => {
    const brokenLocalAssets = [];
    page.on('response', (response) => {
      if (response.url().includes('/assets/') && response.status() >= 400) brokenLocalAssets.push([response.status(), response.url()]);
    });
    await openLayout(page, scenario);
    const metrics = await environmentMetrics(page);
    expect(metrics.theme).toBe(scenario.theme);
    expect(metrics.overflow).toBeLessThanOrEqual(1);
    expect(metrics.bodyOverflow).toBe('hidden');
    expect(metrics.rightOverflow).toBe('auto');
    expect(metrics.rightDelta).toBeGreaterThanOrEqual(0);
    expect(metrics.centerOverflow).toBe('auto');
    expect(metrics.pointerEvents).toEqual(['none', 'none', 'none', 'none', 'none']);
    expect(metrics.moon).toBe(scenario.theme === 'night' ? 'grid' : 'none');
    expect(metrics.treeDay).toBe(scenario.theme === 'day' ? 'block' : 'none');
    expect(metrics.treeDayOpacity).toBeGreaterThanOrEqual(0.68);
    expect(metrics.treeNight).toBe(scenario.theme === 'night' ? 'block' : 'none');
    expect(metrics.fireflies).toBe(scenario.theme === 'night' ? 'block' : 'none');
    expect(metrics.firefliesZIndex).toBe('2');
    expect(metrics.fireflyNearTreeSize).toBe(6);
    expect(metrics.staticLeaves).toBe(14);
    expect(metrics.animatedLeaves).toBe(0);
    expect(metrics.landscapeDay).toBe(scenario.theme === 'day' ? 'block' : 'none');
    expect(metrics.landscapeNight).toBe(scenario.theme === 'night' ? 'block' : 'none');
    expect(brokenLocalAssets).toEqual([]);
    await page.screenshot({ path: path.join(screenshotDir, `${scenario.name}.png`) });
  });
}

for (const scenario of [
  { width: 390, height: 844, theme: 'day', name: '390x844-day', visibleLeaves: 6 },
  { width: 390, height: 844, theme: 'night', name: '390x844-night', visibleLeaves: 6 },
  { width: 844, height: 390, theme: 'day', name: '844x390-day-horizontal', visibleLeaves: 10 },
]) {
  test(`${scenario.name} mantém documento rolável e decoração reduzida`, async ({ page }) => {
    await openLayout(page, scenario);
    const state = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bodyOverflow: getComputedStyle(document.body).overflowY,
      shellOverflow: getComputedStyle(document.querySelector('.shell')).overflowY,
      moon: getComputedStyle(document.querySelector('.header-moon')).display,
      ambient: getComputedStyle(document.querySelector('.right-ambient-space')).display,
      staticLeaves: [...document.querySelectorAll('.environment-leaf-static')].length,
      visibleLeaves: [...document.querySelectorAll('.environment-leaf-static')]
        .filter((element) => getComputedStyle(element).display !== 'none').length,
      animatedLeaves: [...document.querySelectorAll('.environment-leaf')]
        .filter((element) => getComputedStyle(element).animationName !== 'none').length,
    }));
    expect(state.overflow).toBeLessThanOrEqual(1);
    expect(state.bodyOverflow).not.toBe('hidden');
    expect(state.shellOverflow).not.toBe('hidden');
    expect(state.moon).toBe('none');
    expect(state.ambient).toBe('none');
    expect(state.staticLeaves).toBe(14);
    expect(state.visibleLeaves).toBe(scenario.visibleLeaves);
    expect(state.animatedLeaves).toBe(0);
    await page.screenshot({ path: path.join(screenshotDir, `${scenario.name}.png`), fullPage: true });
  });
}

test('reduced motion remove animações ambientais e do ticker', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086, theme: 'night', reducedMotion: true });
  const motion = await page.evaluate(() => ({
    leaf: getComputedStyle(document.querySelector('.environment-leaf-static')).animationName,
    firefly: getComputedStyle(document.querySelector('.firefly')).animationName,
    ticker: getComputedStyle(document.querySelector('.daily-marquee-track')).animationName,
  }));
  expect(motion).toEqual({ leaf: 'none', firefly: 'none', ticker: 'none' });
  await page.screenshot({ path: path.join(screenshotDir, '1448x1086-night-reduced-motion.png') });
});

test('smartphone uniformiza os 14 nomes de sentimentos sem vazamento', async ({ page }) => {
  await openLayout(page, { width: 390, height: 844, theme: 'day' });
  const labels = await page.evaluate(() => ({
    documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    items: [...document.querySelectorAll('.feeling')].map((card) => {
      const label = card.querySelector('.feeling-label');
      return {
        id: card.dataset.feelingId,
        fontSize: getComputedStyle(label).fontSize,
        overflow: card.scrollWidth - card.clientWidth,
      };
    }),
  }));
  expect(labels.items).toHaveLength(14);
  expect(new Set(labels.items.map((item) => item.fontSize)).size).toBe(1);
  expect(Number.parseFloat(labels.items[0].fontSize)).toBeLessThanOrEqual(12.5);
  expect(labels.items.every((item) => item.overflow <= 1)).toBe(true);
  expect(labels.documentOverflow).toBeLessThanOrEqual(1);
});

test('modo noturno separa títulos dourados do conteúdo e alinha os dois CTAs azuis', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086, theme: 'night' });
  const colors = await page.evaluate(() => {
    const titleSelectors = ['.section-title', '.block-title', '.book-rec-label', '.share-title'];
    return {
      titles: titleSelectors.map((selector) => getComputedStyle(document.querySelector(selector)).color),
      content: getComputedStyle(document.querySelector('.block-text')).color,
      generateBackground: getComputedStyle(document.querySelector('#generateBtn')).backgroundImage,
      newBackground: getComputedStyle(document.querySelector('#newBtn')).backgroundImage,
    };
  });
  expect(new Set(colors.titles).size).toBe(1);
  expect(colors.titles[0]).not.toBe(colors.content);
  expect(colors.newBackground).toBe(colors.generateBackground);
});

test('CTA final dos ensaios mantém vidro verde-escuro legível no tema noturno', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('entreSabiosTheme', 'night');
  });
  await page.goto('/ensaios/jung-e-a-sombra/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  const cta = await page.evaluate(() => ({
    background: getComputedStyle(document.querySelector('.seo-cta')).backgroundImage,
    backgroundColor: getComputedStyle(document.querySelector('.seo-cta')).backgroundColor,
    title: getComputedStyle(document.querySelector('.seo-cta h2')).color,
    copy: getComputedStyle(document.querySelector('.seo-cta p')).color,
    buttonBackground: getComputedStyle(document.querySelector('.seo-cta .seo-button')).backgroundImage,
    buttonColor: getComputedStyle(document.querySelector('.seo-cta .seo-button')).color,
  }));
  expect(cta.backgroundColor).toBe('rgba(7, 29, 26, 0.74)');
  expect(cta.title).not.toBe(cta.copy);
  expect(cta.buttonBackground).toContain('linear-gradient');
  expect(cta.buttonColor).not.toBe('rgba(0, 0, 0, 0)');
  await page.locator('.seo-cta').screenshot({ path: path.join(screenshotDir, 'essay-cta-night.png') });
});

test('dialogs ficam acima da atmosfera e mantêm os caminhos reais', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086, theme: 'night', favorites: savedFixtures });
  await page.locator('#favoritesBtn').click();
  await expect(page.locator('#favoritesDialog')).toHaveAttribute('open', '');
  await expect(page.locator('#favoritesList .favorite-item')).toHaveCount(2);
  await page.screenshot({ path: path.join(screenshotDir, 'modal-leituras-salvas-night.png') });
  await page.locator('#closeFavoritesBtn').click();
  await page.locator('#openTaleBtn').click();
  await expect(page.locator('#taleDialog')).toHaveAttribute('open', '');
  await expect(page.locator('#taleTitle')).not.toHaveText('—');
  await page.screenshot({ path: path.join(screenshotDir, 'modal-contos-night.png') });
});

test('recortes documentam marca, lua, árvores, vagalumes, paisagem e papel', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086, theme: 'day' });
  await page.locator('.brand').screenshot({ path: path.join(screenshotDir, 'crop-brand-owl-day.png') });
  await page.locator('.right-ambient-space').screenshot({ path: path.join(screenshotDir, 'crop-tree-day.png') });
  await page.locator('.shell').screenshot({ path: path.join(screenshotDir, 'crop-landscape-global-day.png') });
  await page.locator('#themeToggleBtn').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await page.locator('.header-moon').screenshot({ path: path.join(screenshotDir, 'crop-moon-night.png') });
  await page.locator('.right-ambient-space').screenshot({ path: path.join(screenshotDir, 'crop-tree-fireflies-night.png') });
  await page.locator('.shell').screenshot({ path: path.join(screenshotDir, 'crop-landscape-global-night.png') });
});

test('teclado e controles continuam acima das camadas decorativas', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086, theme: 'day' });
  await page.locator('#themeToggleBtn').focus();
  await expect(page.locator('#themeToggleBtn')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#aboutBtn')).toBeFocused();
  const topHit = await page.evaluate(() => {
    const button = document.querySelector('#openTaleBtn');
    const rect = button.getBoundingClientRect();
    return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)?.closest('#openTaleBtn')?.id;
  });
  expect(topHit).toBe('openTaleBtn');
});

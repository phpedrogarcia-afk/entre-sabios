import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const screenshotDir = process.env.ENTRE_SABIOS_SCREENSHOT_DIR
  || path.join(os.tmpdir(), 'entre-sabios-layout-v2-etapa3-playwright-20260729');

const expectedLabels = [
  'Ansiedade', 'Medo', 'Amor', 'Saudade', 'Esperança', 'Solidão', 'Autoconhecimento',
  'Confusão', 'Insegurança', 'Raiva', 'Culpa', 'Luto', 'Tristeza', 'Falta de propósito',
];

async function openPanel(page, { width, height, theme = 'day' }) {
  await page.setViewportSize({ width, height });
  await page.addInitScript((selectedTheme) => {
    localStorage.clear();
    if (selectedTheme === 'night') localStorage.setItem('entreSabiosTheme', 'night');
  }, theme);
  await page.goto('/');
  await expect(page.locator('#contentLoadStatus')).toHaveText('');
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await expect(page.locator('.feeling')).toHaveCount(14);
}

async function saveScreenshot(page, name) {
  fs.mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({ path: path.join(screenshotDir, `${name}.png`), fullPage: false });
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

for (const theme of ['day', 'night']) {
  test(`desktop 1448 ${theme} preserva 14 cartões, semântica e medidas editoriais`, async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await openPanel(page, { width: 1448, height: 1086, theme });

    const state = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.feeling')];
      const rect = (node) => {
        const box = node.getBoundingClientRect();
        return { width: box.width, height: box.height, top: box.top, bottom: box.bottom };
      };
      return {
        labels: cards.map((card) => card.querySelector('.feeling-label').textContent),
        cardRects: cards.map(rect),
        checkboxCount: cards.filter((card) => card.matches('label') && card.querySelector('input[type="checkbox"][name="feelings"]')).length,
        iconHrefs: cards.map((card) => card.querySelector('use')?.getAttribute('href')),
        columns: getComputedStyle(document.getElementById('feelingsGrid')).gridTemplateColumns.split(' ').length,
        gap: parseFloat(getComputedStyle(document.getElementById('feelingsGrid')).gap),
        observer: rect(document.querySelector('.feelings-heading-icon')),
        button: rect(document.getElementById('generateBtn')),
        tip: rect(document.querySelector('.tip-box')),
        tipOverflow: document.querySelector('.tip-box').scrollHeight - document.querySelector('.tip-box').clientHeight,
      };
    });
    expect(state.labels).toEqual(expectedLabels);
    expect(state.checkboxCount).toBe(14);
    expect(state.iconHrefs).toHaveLength(14);
    expect(state.iconHrefs.every((href) => href?.startsWith('#'))).toBe(true);
    expect(new Set(state.iconHrefs).size).toBe(14);
    expect(state.columns).toBe(2);
    expect(state.gap).toBeGreaterThanOrEqual(9);
    for (const card of state.cardRects) {
      expect(card.height).toBeGreaterThanOrEqual(47);
      expect(card.height).toBeLessThanOrEqual(49);
    }
    expect(state.observer.width).toBeGreaterThanOrEqual(32);
    expect(state.observer.width).toBeLessThanOrEqual(36);
    expect(state.button.height).toBeGreaterThanOrEqual(64);
    expect(state.button.height).toBeLessThanOrEqual(68);
    expect(state.tip.height).toBeGreaterThanOrEqual(96);
    expect(state.tipOverflow).toBeLessThanOrEqual(0);
    await expectNoHorizontalOverflow(page);
    await saveScreenshot(page, `painel-1448-${theme}-sem-selecao`);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}

test('principal, secundários, troca explícita, foco e trava atômica têm estados próprios', async ({ page }) => {
  await openPanel(page, { width: 1448, height: 1086 });
  const anxiety = page.locator('.feeling[data-feeling-id="ansiedade"] input');
  const fear = page.locator('.feeling[data-feeling-id="medo"] input');
  const love = page.locator('.feeling[data-feeling-id="amor"] input');

  await page.locator('.feeling[data-feeling-id="ansiedade"]').click();
  await anxiety.evaluate((node) => node.blur());
  await expect(page.locator('.feeling[data-feeling-id="ansiedade"]')).toHaveClass(/primary-feeling/);
  await expect(page.locator('#primaryFeelingLabel')).toHaveText('Ansiedade');
  await saveScreenshot(page, 'painel-1448-day-um-principal');

  await page.locator('#themeToggleBtn').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await page.waitForTimeout(320);
  await saveScreenshot(page, 'painel-1448-night-um-principal');
  await page.locator('#themeToggleBtn').click();
  await page.waitForTimeout(320);

  await page.locator('.feeling[data-feeling-id="medo"]').click();
  await page.locator('.feeling[data-feeling-id="amor"]').click();
  await love.evaluate((node) => node.blur());
  await expect(page.locator('.feeling.selected')).toHaveCount(3);
  await expect(page.locator('.feeling.primary-feeling')).toHaveCount(1);
  await expect(page.locator('.feeling[data-feeling-id="medo"]')).toHaveClass(/selected/);
  await expect(page.getByRole('button', { name: 'Definir Medo como sentimento principal' })).toBeVisible();
  await saveScreenshot(page, 'painel-1448-principal-dois-secundarios');

  await page.getByRole('button', { name: 'Definir Medo como sentimento principal' }).click();
  await expect(page.locator('#primaryFeelingLabel')).toHaveText('Medo');
  await expect(page.locator('.feeling[data-feeling-id="medo"]')).toHaveClass(/primary-feeling/);
  await expect(page.locator('.feeling[data-feeling-id="ansiedade"]')).not.toHaveClass(/primary-feeling/);

  await love.focus();
  await expect(love).toBeFocused();
  await saveScreenshot(page, 'painel-1448-foco-teclado');
  await love.press('Space');
  await expect(love).not.toBeChecked();

  const generate = page.locator('#generateBtn');
  const before = await generate.boundingBox();
  await generate.click();
  await expect(generate).toHaveAttribute('aria-busy', 'true');
  await expect(generate).toBeDisabled();
  const during = await generate.boundingBox();
  expect(during.width).toBe(before.width);
  expect(during.height).toBe(before.height);
  await saveScreenshot(page, 'painel-1448-botao-bloqueado-carregando');
  await expect(generate).toHaveAttribute('aria-busy', 'false', { timeout: 1000 });
  await expect(generate).toBeEnabled();
  await expectNoHorizontalOverflow(page);
});

for (const theme of ['day', 'night']) {
  test(`desktop compacto 1366 ${theme} mantém cartões em 48px`, async ({ page }) => {
    await openPanel(page, { width: 1366, height: 768, theme });
    const metrics = await page.locator('.feeling').evaluateAll((cards) => cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }));
    for (const card of metrics) {
      expect(card.height).toBeGreaterThanOrEqual(47);
      expect(card.height).toBeLessThanOrEqual(50);
    }
    await expectNoHorizontalOverflow(page);
    await saveScreenshot(page, `painel-1366-${theme}`);
  });
}

for (const theme of ['day', 'night']) {
  test(`smartphone 390 ${theme} mantém duas colunas, toque e conteúdo integral`, async ({ page }) => {
    await openPanel(page, { width: 390, height: 844, theme });
    const state = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.feeling')];
      const tip = document.querySelector('.tip-box');
      return {
        columns: getComputedStyle(document.getElementById('feelingsGrid')).gridTemplateColumns.split(' ').length,
        minCardHeight: Math.min(...cards.map((card) => card.getBoundingClientRect().height)),
        labels: cards.map((card) => card.querySelector('.feeling-label').textContent),
        tipCut: tip.scrollHeight - tip.clientHeight,
      };
    });
    expect(state.columns).toBe(2);
    expect(state.minCardHeight).toBeGreaterThanOrEqual(44);
    expect(state.labels).toEqual(expectedLabels);
    expect(state.tipCut).toBeLessThanOrEqual(0);
    await expectNoHorizontalOverflow(page);
    await saveScreenshot(page, `painel-390-${theme}`);
  });
}

test('smartphone horizontal usa quatro colunas somente com cartões de ao menos 120px', async ({ page }) => {
  await openPanel(page, { width: 844, height: 390 });
  const wide = await page.evaluate(() => ({
    columns: getComputedStyle(document.getElementById('feelingsGrid')).gridTemplateColumns.split(' ').length,
    minWidth: Math.min(...[...document.querySelectorAll('.feeling')].map((card) => card.getBoundingClientRect().width)),
  }));
  expect(wide.columns).toBe(4);
  expect(wide.minWidth).toBeGreaterThanOrEqual(120);
  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 520, height: 390 });
  const narrowColumns = await page.locator('#feelingsGrid').evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
  expect(narrowColumns).toBe(2);
  await expectNoHorizontalOverflow(page);
});

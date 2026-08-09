import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const screenshotDir = process.env.ENTRE_SABIOS_SCREENSHOT_DIR
  || path.join(os.tmpdir(), 'entre-sabios-layout-v2-etapa3-1-20260729');

async function openLayout(page, { width, height, theme }) {
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

async function generateReflection(page, selectedCount = 1) {
  const available = page.locator('#feelingsGrid .feeling input:not([disabled])');
  expect(await available.count()).toBeGreaterThanOrEqual(selectedCount);
  for (let index = 0; index < selectedCount; index += 1) {
    await available.nth(index).evaluate((input) => input.click());
  }
  await page.locator('#generateBtn').click();
  await expect(page.locator('#quoteText')).not.toHaveClass(/invitation/);
}

async function visualMetrics(page) {
  return page.evaluate(() => {
    const size = (selector) => {
      const element = document.querySelector(selector);
      const style = getComputedStyle(element);
      return { width: parseFloat(style.width), height: parseFloat(style.height) };
    };
    const actionSize = [...document.querySelectorAll('.quote-action')].map((element) => {
      const style = getComputedStyle(element);
      return { id: element.id, width: parseFloat(style.width), height: parseFloat(style.height) };
    });
    return {
      card: size('.feeling-icon'),
      observer: size('.feelings-heading-icon'),
      feather: size('.tip-icon'),
      actionSize,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      stageActions: [...document.querySelectorAll('.quote-actions > .quote-action')].map((node) => node.id),
    };
  });
}

test('1448 claro e escuro preservam geometria, delicadeza e ausência de polegares', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  fs.mkdirSync(screenshotDir, { recursive: true });

  await openLayout(page, { width: 1448, height: 1086, theme: 'day' });
  const day = await visualMetrics(page);
  expect(day.card).toEqual({ width: 20, height: 20 });
  expect(day.observer).toEqual({ width: 34, height: 34 });
  expect(day.feather).toEqual({ width: 28, height: 28 });
  expect(day.stageActions).toEqual(['quoteShareBtn', 'favoriteBtn', 'likeBtn']);
  expect(day.actionSize.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
  expect(day.horizontalOverflow).toBeLessThanOrEqual(1);
  await expect(page.locator('#dislikeBtn')).toHaveCount(0);
  await page.screenshot({ path: path.join(screenshotDir, '1448x1086-claro-sem-selecao.png'), fullPage: false });
  await page.locator('.col-left').screenshot({ path: path.join(screenshotDir, 'painel-esquerdo-depois.png') });

  await openLayout(page, { width: 1448, height: 1086, theme: 'night' });
  const night = await visualMetrics(page);
  expect(night.card).toEqual(day.card);
  expect(night.observer).toEqual(day.observer);
  expect(night.feather).toEqual(day.feather);
  expect(night.stageActions).toEqual(day.stageActions);
  expect(night.horizontalOverflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(screenshotDir, '1448x1086-escuro-sem-selecao.png'), fullPage: false });
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('principal e secundários preservam inputs, estados e painel refinado', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086, theme: 'day' });
  const available = page.locator('#feelingsGrid .feeling input:not([disabled])');
  for (let index = 0; index < 3; index += 1) await available.nth(index).evaluate((input) => input.click());
  await expect(page.locator('#feelingsGrid .feeling.selected')).toHaveCount(3);
  await expect(page.locator('#feelingsGrid .feeling.primary-feeling')).toHaveCount(1);
  await expect(page.locator('#feelingsGrid .feeling.selected:not(.primary-feeling)')).toHaveCount(2);
  await page.screenshot({ path: path.join(screenshotDir, '1448x1086-claro-principal-secundarios.png'), fullPage: false });
});

test('estrela e coração mantêm contratos, estados visuais e foco por teclado', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086, theme: 'day' });
  await generateReflection(page);
  const favorite = page.locator('#favoriteBtn');
  const like = page.locator('#likeBtn');
  const share = page.locator('#quoteShareBtn');
  const favoritesBefore = await page.evaluate(() => localStorage.getItem('caixaSabedoriaFavoritas'));
  const feedbackBefore = await page.evaluate(() => localStorage.getItem('caixaSabedoriaPreferencias'));

  await expect(favorite).toHaveAttribute('aria-pressed', 'false');
  await expect(favorite).toHaveAttribute('aria-label', 'Salvar leitura');
  await expect(like).toHaveAttribute('aria-pressed', 'false');
  await expect(like).toHaveAttribute('aria-label', 'Gostei desta reflexão');
  await favorite.screenshot({ path: path.join(screenshotDir, 'estrela-inativa.png') });
  await like.screenshot({ path: path.join(screenshotDir, 'coracao-inativo.png') });
  await page.locator('.quote-stage').screenshot({ path: path.join(screenshotDir, 'card-acoes-inativas.png') });

  await favorite.click();
  await expect(favorite).toHaveAttribute('aria-pressed', 'true');
  await expect(favorite).toHaveAttribute('aria-label', 'Remover leitura salva');
  await favorite.screenshot({ path: path.join(screenshotDir, 'estrela-ativa.png') });
  expect(await page.evaluate(() => localStorage.getItem('caixaSabedoriaPreferencias'))).toBe(feedbackBefore);

  const savedAfterFavorite = await page.evaluate(() => localStorage.getItem('caixaSabedoriaFavoritas'));
  expect(savedAfterFavorite).not.toBe(favoritesBefore);
  await like.click();
  await expect(like).toHaveAttribute('aria-pressed', 'true');
  await expect(like).toHaveAttribute('aria-label', 'Remover gostei');
  await like.screenshot({ path: path.join(screenshotDir, 'coracao-ativo.png') });
  expect(await page.evaluate(() => localStorage.getItem('caixaSabedoriaFavoritas'))).toBe(savedAfterFavorite);
  expect(await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('caixaSabedoriaPreferencias')).storyFeedback))).not.toContain(-1);
  await page.locator('.quote-stage').screenshot({ path: path.join(screenshotDir, 'card-compartilhar-estrela-coracao.png') });

  await share.focus();
  await page.keyboard.press('Tab');
  await expect(favorite).toBeFocused();
  await page.locator('.quote-stage').screenshot({ path: path.join(screenshotDir, 'foco-teclado-estrela.png') });
});

for (const theme of ['day', 'night']) {
  test(`390x844 ${theme} preserva proporções, toque e rolagem`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await openLayout(page, { width: 390, height: 844, theme });
    const metrics = await visualMetrics(page);
    expect(metrics.card).toEqual({ width: 21, height: 21 });
    expect(metrics.observer).toEqual({ width: 30, height: 30 });
    expect(metrics.feather).toEqual({ width: 24, height: 24 });
    expect(metrics.actionSize.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
    expect(metrics.horizontalOverflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: path.join(screenshotDir, `390x844-${theme === 'day' ? 'claro' : 'escuro'}.png`), fullPage: true });
    expect(errors).toEqual([]);
  });
}

test('1366x768 usa escala compacta prevista sem alterar contratos', async ({ page }) => {
  await openLayout(page, { width: 1366, height: 768, theme: 'day' });
  const metrics = await visualMetrics(page);
  expect(metrics.card).toEqual({ width: 20, height: 20 });
  expect(metrics.observer).toEqual({ width: 29, height: 29 });
  expect(metrics.feather).toEqual({ width: 22, height: 22 });
  expect(metrics.stageActions).toEqual(['quoteShareBtn', 'favoriteBtn', 'likeBtn']);
  expect(metrics.horizontalOverflow).toBeLessThanOrEqual(1);
});

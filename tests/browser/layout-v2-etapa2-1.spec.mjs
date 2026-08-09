import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const screenshotDir = process.env.ENTRE_SABIOS_SCREENSHOT_DIR
  || path.join(os.tmpdir(), 'entre-sabios-layout-v2-etapa2-1-playwright-20260729');

const initialStates = [
  { name: '1536x1152-claro-inicial', width: 1536, height: 1152, theme: 'day' },
  { name: '1536x1152-escuro-inicial', width: 1536, height: 1152, theme: 'night' },
];

const generatedStates = [
  { name: '1536x1152-claro-gerada', width: 1536, height: 1152, theme: 'day' },
  { name: '1536x1152-escuro-gerada', width: 1536, height: 1152, theme: 'night' },
  { name: '1366x768-claro-gerada', width: 1366, height: 768, theme: 'day' },
  { name: '1366x768-escuro-gerada', width: 1366, height: 768, theme: 'night' },
  { name: '390x844-claro-gerada', width: 390, height: 844, theme: 'day' },
  { name: '390x844-escuro-gerada', width: 390, height: 844, theme: 'night' },
];

async function openLayout(page, state) {
  await page.setViewportSize({ width: state.width, height: state.height });
  await page.addInitScript((theme) => {
    localStorage.clear();
    if (theme === 'night') localStorage.setItem('entreSabiosTheme', 'night');
  }, state.theme);
  await page.goto('/');
  await expect(page.locator('#contentLoadStatus')).toHaveText('');
  await expect(page.locator('#feelingsGrid .feeling')).toHaveCount(14);
  await expect(page.locator('html')).toHaveAttribute('data-theme', state.theme);
}

async function generateReflection(page) {
  const feeling = page.locator('#feelingsGrid .feeling input:not([disabled])').first();
  await feeling.evaluate((input) => input.click());
  await expect(feeling).toBeChecked();
  await expect(page.locator('#generateBtn')).toBeEnabled();
  await page.locator('#generateBtn').click();
  await expect(page.locator('#quoteText')).not.toHaveClass(/invitation/);
  await expect(page.locator('#quoteAuthor')).not.toHaveText('');
}

async function assertUnifiedCard(page) {
  const geometry = await page.evaluate(() => {
    const stage = document.querySelector('.quote-stage');
    const quote = document.getElementById('quoteText');
    const author = document.getElementById('quoteAuthor');
    const source = document.getElementById('quoteSource');
    const card = document.querySelector('.center-card');
    return {
      sameStage: [quote, author, source].every((node) => stage?.contains(node)),
      ordered: Boolean(
        quote?.compareDocumentPosition(author) & Node.DOCUMENT_POSITION_FOLLOWING
        && author?.compareDocumentPosition(source) & Node.DOCUMENT_POSITION_FOLLOWING
      ),
      quoteOverflowY: getComputedStyle(quote).overflowY,
      quoteFits: quote.scrollHeight <= quote.clientHeight + 1,
      stageFits: stage.scrollHeight <= stage.clientHeight + 1,
      cardFits: card.scrollHeight <= card.clientHeight + 1,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(geometry.sameStage).toBe(true);
  expect(geometry.ordered).toBe(true);
  expect(geometry.quoteOverflowY).toBe('visible');
  expect(geometry.quoteFits).toBe(true);
  expect(geometry.stageFits).toBe(true);
  expect(geometry.cardFits).toBe(true);
  expect(geometry.horizontalOverflow).toBeLessThanOrEqual(1);
}

for (const state of initialStates) {
  test(`card inicial unificado e screenshot ${state.name}`, async ({ page }) => {
    await openLayout(page, state);
    await assertUnifiedCard(page);
    await expect(page.locator('#quoteAuthor')).toBeHidden();
    await expect(page.locator('#quoteSource')).toBeHidden();
    fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({ path: path.join(screenshotDir, `${state.name}.png`), fullPage: false });
  });
}

for (const state of generatedStates) {
  test(`card gerado unificado e screenshot ${state.name}`, async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      const text = message.text();
      const externalReportOnlyCsp = text.includes('google.com') && text.includes('report-only Content Security Policy');
      if (message.type() === 'error' && !externalReportOnlyCsp) consoleErrors.push(text);
    });
    await openLayout(page, state);
    await generateReflection(page);
    await assertUnifiedCard(page);
    await expect(page.locator('#dislikeBtn')).toHaveCount(0);
    await page.locator('#likeBtn').click();
    await expect(page.locator('#likeBtn')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#favoriteBtn').click();
    await expect(page.locator('#favoriteBtn')).toHaveAttribute('aria-pressed', 'true');
    if (state.width < 600) await page.locator('.center-card').scrollIntoViewIfNeeded();
    fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({ path: path.join(screenshotDir, `${state.name}.png`), fullPage: false });
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}

test('frase diária move constantemente, sem pausa, e respeita reduced motion', async ({ page }) => {
  await openLayout(page, { width: 1536, height: 1152, theme: 'day' });
  await page.evaluate(() => {
    dailyQuoteTextEl.textContent = '“Uma frase diária deliberadamente extensa percorre o cabeçalho com serenidade, revela cada palavra sem pressa e preserva uma pausa silenciosa em cada extremidade do caminho.” — Entre Sábios';
    dailyQuoteTextCloneEl.textContent = '';
    syncDailyQuoteMotion();
  });

  const viewport = page.locator('.daily-viewport');
  const track = page.locator('.daily-marquee-track');
  await expect(viewport).toHaveClass(/is-moving/);
  const metrics = await viewport.evaluate((node) => {
    const style = getComputedStyle(node);
    const start = parseFloat(style.getPropertyValue('--daily-start-x'));
    const end = parseFloat(style.getPropertyValue('--daily-end-x'));
    const distance = Math.abs(start - end);
    const duration = parseFloat(style.getPropertyValue('--daily-motion-duration'));
    return { distance, duration, speed: distance / duration };
  });
  expect(metrics.speed).toBeGreaterThanOrEqual(43.9);
  expect(metrics.speed).toBeLessThanOrEqual(44.1);

  fs.mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({ path: path.join(screenshotDir, 'ticker-1536x1152-inicio.png'), fullPage: false });
  await track.evaluate((node) => { node.style.animationDelay = '-5s'; });
  await page.waitForTimeout(180);
  const movingTransform = await track.evaluate((node) => getComputedStyle(node).transform);
  expect(movingTransform).not.toBe('none');
  expect(movingTransform).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
  await page.screenshot({ path: path.join(screenshotDir, 'ticker-1536x1152-em-movimento.png'), fullPage: false });

  await viewport.hover();
  await expect(track).toHaveCSS('animation-play-state', 'running');
  await viewport.focus();
  await expect(track).toHaveCSS('animation-play-state', 'running');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(track).toHaveCSS('animation-name', 'none');
  await expect(track).toHaveCSS('transform', 'none');
  await page.screenshot({ path: path.join(screenshotDir, 'ticker-1536x1152-reduced-motion.png'), fullPage: false });
});

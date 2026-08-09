import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const screenshotDir = process.env.ENTRE_SABIOS_SCREENSHOT_DIR
  || path.join(os.tmpdir(), 'entre-sabios-layout-v2-etapa2-3-playwright-20260729');

const longQuote = '“A atenção atravessa cada instante com serenidade, acolhe os detalhes do caminho e preserva espaço para uma leitura inteira, constante e sem pressa.” — Entre Sábios';

async function openLayout(page, { width, height, theme = 'day', reducedMotion = 'no-preference' }) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion });
  await page.addInitScript((selectedTheme) => {
    localStorage.clear();
    if (selectedTheme === 'night') localStorage.setItem('entreSabiosTheme', 'night');
  }, theme);
  await page.goto('/');
  await expect(page.locator('#contentLoadStatus')).toHaveText('');
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

async function setDailyQuote(page, text) {
  await page.evaluate((value) => {
    dailyQuoteTextEl.textContent = value;
    syncDailyQuoteMotion();
  }, text);
}

async function saveScreenshot(page, name) {
  fs.mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({ path: path.join(screenshotDir, `${name}.png`), fullPage: false });
}

test('ticker desktop usa uma única cópia, movimento linear e reinício fora da faixa', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await openLayout(page, { width: 1448, height: 1086 });
  await setDailyQuote(page, longQuote);

  const viewport = page.locator('.daily-viewport');
  const track = page.locator('.daily-marquee-track');
  const main = page.locator('#dailyQuoteText');
  const clone = page.locator('#dailyQuoteTextClone');
  await expect(viewport).toHaveClass(/is-moving/);
  await expect(clone).toHaveAttribute('aria-hidden', 'true');

  const metrics = await page.evaluate(() => {
    const viewportNode = document.querySelector('.daily-viewport');
    const trackNode = document.querySelector('.daily-marquee-track');
    const mainNode = document.getElementById('dailyQuoteText');
    const cloneNode = document.getElementById('dailyQuoteTextClone');
    const viewportStyle = getComputedStyle(viewportNode);
    const trackStyle = getComputedStyle(trackNode);
    const mainRect = mainNode.getBoundingClientRect();
    const start = parseFloat(viewportStyle.getPropertyValue('--daily-start-x'));
    const end = parseFloat(viewportStyle.getPropertyValue('--daily-end-x'));
    const distance = Math.abs(start - end);
    const duration = parseFloat(viewportStyle.getPropertyValue('--daily-motion-duration'));
    return {
      animationName: trackStyle.animationName,
      direction: trackStyle.animationDirection,
      duration,
      iterationCount: trackStyle.animationIterationCount,
      timing: trackStyle.animationTimingFunction,
      distance,
      expectedDistance: viewportNode.clientWidth + Math.ceil(mainRect.width),
      speed: distance / duration,
      cloneDisplay: getComputedStyle(cloneNode).display,
      cloneText: cloneNode.textContent,
      visibleTrackChildren: [...trackNode.children].filter((node) => getComputedStyle(node).display !== 'none').length,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(metrics.animationName).toBe('daily-quote-loop');
  expect(metrics.direction).toBe('normal');
  expect(metrics.iterationCount).toBe('infinite');
  expect(metrics.timing).toBe('linear');
  expect(metrics.distance).toBe(metrics.expectedDistance);
  expect(metrics.speed).toBeGreaterThanOrEqual(43.95);
  expect(metrics.speed).toBeLessThanOrEqual(44.05);
  expect(metrics.cloneDisplay).toBe('none');
  expect(metrics.cloneText).toBe('');
  expect(metrics.visibleTrackChildren).toBe(1);
  expect(metrics.horizontalOverflow).toBeLessThanOrEqual(1);

  const animationInfo = await track.evaluate((node) => {
    const animation = node.getAnimations()[0];
    animation.pause();
    animation.currentTime = 0;
    return { duration: animation.effect.getTiming().duration };
  });
  await saveScreenshot(page, 'ticker-desktop-claro-inicio');
  await track.evaluate((node) => { node.getAnimations()[0].currentTime = 2000; });
  await saveScreenshot(page, 'ticker-desktop-claro-2s');
  await track.evaluate((node) => { node.getAnimations()[0].currentTime = 5000; });
  await saveScreenshot(page, 'ticker-desktop-claro-5s');

  const keyframes = await track.evaluate((node) => node.getAnimations()[0].effect.getKeyframes().map(({ transform }) => transform));
  await track.evaluate((node) => { const animation = node.getAnimations()[0]; animation.currentTime = animation.effect.getTiming().duration - 40; });
  await saveScreenshot(page, 'ticker-desktop-claro-proximo-reinicio');
  await track.evaluate((node) => { const animation = node.getAnimations()[0]; animation.currentTime = animation.effect.getTiming().duration + 40; });
  await saveScreenshot(page, 'ticker-desktop-claro-apos-reinicio');
  expect(keyframes).toHaveLength(2);
  expect(keyframes[0]).not.toBe(keyframes[1]);

  await track.evaluate((node) => {
    node.style.animation = 'none';
    void node.offsetWidth;
    node.style.animation = '';
  });
  await viewport.hover();
  await expect(track).toHaveCSS('animation-play-state', 'running');
  const hoverBefore = await track.evaluate((node) => node.getAnimations()[0].currentTime);
  await page.waitForTimeout(240);
  const hoverAfter = await track.evaluate((node) => node.getAnimations()[0].currentTime);
  expect(hoverAfter).toBeGreaterThan(hoverBefore + 100);
  await saveScreenshot(page, 'ticker-desktop-claro-hover-em-movimento');
  await page.mouse.move(2, 2);
  await page.waitForTimeout(180);
  const resumedAt = await track.evaluate((node) => node.getAnimations()[0].currentTime);
  expect(resumedAt).toBeGreaterThan(hoverAfter + 100);

  await viewport.focus();
  await expect(track).toHaveCSS('animation-play-state', 'running');
  const focusBefore = await track.evaluate((node) => node.getAnimations()[0].currentTime);
  await page.waitForTimeout(180);
  const focusAfter = await track.evaluate((node) => node.getAnimations()[0].currentTime);
  expect(focusAfter).toBeGreaterThan(focusBefore + 100);
  await viewport.evaluate((node) => node.blur());
  await page.waitForTimeout(180);
  const focusResumedAt = await track.evaluate((node) => node.getAnimations()[0].currentTime);
  expect(focusResumedAt).toBeGreaterThan(focusAfter + 100);

  expect(await clone.textContent()).toBe('');
  expect(await main.textContent()).toBe(longQuote);
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('compartilhamento preservado permanece funcional e isolado do ticker', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086 });
  await setDailyQuote(page, longQuote);
  const before = await page.evaluate(() => ({
    dailyText: document.getElementById('dailyQuoteText').textContent,
    dailyClass: document.querySelector('.daily-viewport').className,
    iconPath: document.querySelector('#quoteShareBtn path').getAttribute('d'),
  }));
  expect(before.iconPath).toBe('M4 16c2.8-5.6 7.3-8.4 14-8.4m-4.2-4.1L18.5 7.6l-4.7 4.1');

  const shareButton = page.locator('#quoteShareBtn');
  await expect(shareButton).toHaveAttribute('aria-label', 'Compartilhar esta reflexão');
  const buttonBox = await shareButton.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return { width: rect.width, height: rect.height, display: getComputedStyle(node).display };
  });
  expect(buttonBox.width).toBeGreaterThanOrEqual(32);
  expect(buttonBox.height).toBeGreaterThanOrEqual(32);
  expect(buttonBox.display).not.toBe('none');
  await shareButton.click();

  const after = await page.evaluate(() => ({
    dailyText: document.getElementById('dailyQuoteText').textContent,
    dailyClass: document.querySelector('.daily-viewport').className,
  }));
  expect(after).toEqual({ dailyText: before.dailyText, dailyClass: before.dailyClass });
});

test('estrela e coração preenchem sem halo circular nos dois temas', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086 });
  await page.locator('.feeling[data-feeling-id="ansiedade"]').click();
  await page.locator('#generateBtn').click();
  await expect(page.locator('#generateBtn')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#quoteText')).not.toHaveClass(/invitation/);

  await page.locator('#favoriteBtn').click();
  await page.locator('#likeBtn').click();
  await expect(page.locator('#favoriteBtn')).toHaveClass(/active-favorite/);
  await expect(page.locator('#favoriteBtn')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#likeBtn')).toHaveClass(/active-like/);
  await expect(page.locator('#likeBtn')).toHaveAttribute('aria-pressed', 'true');

  const activeStyle = async (selector) => page.locator(selector).evaluate((button) => {
    const style = getComputedStyle(button);
    const iconStyle = getComputedStyle(button.querySelector('svg'));
    return { background: style.backgroundColor, boxShadow: style.boxShadow, color: style.color, fill: iconStyle.fill };
  });
  for (const selector of ['#favoriteBtn', '#likeBtn']) {
    const day = await activeStyle(selector);
    expect(day.background).toBe('rgba(0, 0, 0, 0)');
    expect(day.boxShadow).toBe('none');
    expect(day.fill).toBe(day.color);
  }

  await page.locator('#themeToggleBtn').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  for (const selector of ['#favoriteBtn', '#likeBtn']) {
    const night = await activeStyle(selector);
    expect(night.background).toBe('rgba(0, 0, 0, 0)');
    expect(night.boxShadow).toBe('none');
    expect(night.fill).toBe(night.color);
  }
});

for (const theme of ['day', 'night']) {
  test(`tema ${theme} preserva ticker e composição desktop`, async ({ page }) => {
    await openLayout(page, { width: 1448, height: 1086, theme });
    await setDailyQuote(page, longQuote);
    await expect(page.locator('.daily-viewport')).toHaveClass(/is-moving/);
    await expect(page.locator('.daily-marquee-track')).toHaveCSS('animation-direction', 'normal');
    await saveScreenshot(page, `ticker-desktop-${theme}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('frase curta também se move, com cópia única e máscara', async ({ page }) => {
  await openLayout(page, { width: 1448, height: 1086 });
  await setDailyQuote(page, '“Presença.” — Entre Sábios');
  const viewport = page.locator('.daily-viewport');
  const track = page.locator('.daily-marquee-track');
  await expect(viewport).toHaveClass(/is-moving/);
  await expect(track).toHaveCSS('animation-name', 'daily-quote-loop');
  await expect(page.locator('#dailyQuoteTextClone')).toBeHidden();
  await expect(page.locator('#dailyQuoteTextClone')).toHaveText('');
  const mask = await viewport.evaluate((node) => getComputedStyle(node).maskImage);
  expect(mask).not.toBe('none');
});

test('reduced motion mostra a frase integral, quebrável e sem clone', async ({ page }) => {
  await openLayout(page, { width: 800, height: 900, reducedMotion: 'reduce' });
  await setDailyQuote(page, longQuote);
  const track = page.locator('.daily-marquee-track');
  const main = page.locator('#dailyQuoteText');
  await expect(track).toHaveCSS('animation-name', 'none');
  await expect(track).toHaveCSS('transform', 'none');
  await expect(main).toHaveCSS('white-space', 'normal');
  await expect(page.locator('#dailyQuoteTextClone')).toBeHidden();
  const state = await page.evaluate(() => ({
    cloneEmpty: document.getElementById('dailyQuoteTextClone').textContent === '',
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  expect(state.cloneEmpty).toBe(true);
  expect(state.horizontalOverflow).toBeLessThanOrEqual(1);
  await saveScreenshot(page, 'ticker-reduced-motion');
});

for (const theme of ['day', 'night']) {
  test(`smartphone ${theme} contém a frase sem ampliar a página`, async ({ page }) => {
    await openLayout(page, { width: 390, height: 844, theme });
    await setDailyQuote(page, longQuote);
    const state = await page.evaluate(() => {
      const main = document.getElementById('dailyQuoteText');
      const clone = document.getElementById('dailyQuoteTextClone');
      const track = document.querySelector('.daily-marquee-track');
      return {
        animation: getComputedStyle(track).animationName,
        cloneDisplay: getComputedStyle(clone).display,
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        lineHeight: parseFloat(getComputedStyle(main).lineHeight),
        textHeight: main.getBoundingClientRect().height,
        transform: getComputedStyle(track).transform,
        whiteSpace: getComputedStyle(main).whiteSpace,
      };
    });
    expect(state.animation).toBe('daily-quote-loop');
    expect(state.cloneDisplay).toBe('none');
    expect(state.horizontalOverflow).toBeLessThanOrEqual(1);
    expect(state.transform).not.toBe('none');
    expect(state.whiteSpace).toBe('nowrap');
    expect(state.textHeight).toBeLessThanOrEqual(state.lineHeight + 1);
    await saveScreenshot(page, `ticker-smartphone-${theme}`);
  });
}

test('aspas ficam em uma linha própria e não cobrem reflexão longa no smartphone', async ({ page }) => {
  await openLayout(page, { width: 390, height: 844, theme: 'night' });
  await page.locator('.feeling[data-feeling-id="luto"]').click();
  await page.locator('#generateBtn').click();
  await expect(page.locator('#generateBtn')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#quoteText')).not.toHaveClass(/invitation/);

  const geometry = await page.evaluate(() => {
    const quote = document.getElementById('quoteText').getBoundingClientRect();
    const ornament = document.querySelector('.quote-ornament').getBoundingClientRect();
    return {
      ornamentPosition: getComputedStyle(document.querySelector('.quote-ornament')).position,
      ornamentBottom: ornament.bottom,
      quoteTop: quote.top,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(geometry.ornamentPosition).toBe('static');
  expect(geometry.ornamentBottom).toBeLessThanOrEqual(geometry.quoteTop + 1);
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  await saveScreenshot(page, 'quote-longa-smartphone-night');
});

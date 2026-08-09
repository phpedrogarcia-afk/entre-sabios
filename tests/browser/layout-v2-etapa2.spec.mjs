import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const screenshotDir = process.env.ENTRE_SABIOS_SCREENSHOT_DIR
  || path.join(os.tmpdir(), 'entre-sabios-layout-v2-etapa2-playwright-20260729');

const states = [
  { name: '1536x1152-claro', width: 1536, height: 1152, theme: 'day' },
  { name: '1536x1152-escuro', width: 1536, height: 1152, theme: 'night' },
  { name: '1366x768-claro', width: 1366, height: 768, theme: 'day' },
  { name: '1366x768-escuro', width: 1366, height: 768, theme: 'night' },
  { name: '390x844-claro', width: 390, height: 844, theme: 'day' },
  { name: '390x844-escuro', width: 390, height: 844, theme: 'night' },
];

async function openLayout(page, state) {
  await page.setViewportSize({ width: state.width, height: state.height });
  await page.addInitScript((theme) => {
    if (!sessionStorage.getItem('layoutV2Initialized')) {
      localStorage.clear();
      if (theme === 'night') localStorage.setItem('entreSabiosTheme', 'night');
      sessionStorage.setItem('layoutV2Initialized', 'true');
    }
  }, state.theme);
  await page.goto('/');
  await expect(page.locator('#contentLoadStatus')).toHaveText('');
  await expect(page.locator('#feelingsGrid .feeling')).toHaveCount(14);
}

test('tema, Sobre e Leituras salvas continuam acionáveis no cabeçalho integrado', async ({ page }) => {
  await openLayout(page, { width: 1366, height: 768, theme: 'day' });

  await page.locator('#themeToggleBtn').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  expect(await page.evaluate(() => localStorage.getItem('entreSabiosTheme'))).toBe('night');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');

  await page.locator('#aboutBtn').click();
  await expect(page.locator('#aboutDialog')).toHaveAttribute('open', '');
  await page.locator('#closeAboutBtn').click();
  await expect(page.locator('#aboutDialog')).not.toHaveAttribute('open', '');

  await page.locator('#favoritesBtn').click();
  await expect(page.locator('#favoritesDialog')).toHaveAttribute('open', '');
  await page.locator('#closeFavoritesBtn').click();
  await expect(page.locator('#favoritesDialog')).not.toHaveAttribute('open', '');
  await expect(page.locator('a[href="ensaios/"]')).toHaveAttribute('href', 'ensaios/');
});

for (const state of states) {
  test(`estrutura e screenshot ${state.name}`, async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await openLayout(page, state);

    await expect(page.locator('#dailyQuoteText')).toHaveCount(1);
    await expect(page.locator('#dailyQuoteText')).not.toContainText('A sabedoria começa quando');
    await expect(page.locator('#contador-online')).toBeVisible();
    await expect(page.locator('#themeToggleBtn')).toBeVisible();
    await expect(page.locator('#aboutBtn')).toBeVisible();
    await expect(page.locator('a[href="ensaios/"]')).toBeVisible();
    await expect(page.locator('#backBtn')).toBeVisible();
    await expect(page.locator('#newBtn')).toBeVisible();
    await expect(page.locator('#favoritesBtn')).toBeVisible();

    const geometry = await page.evaluate(() => {
      const rect = (selector) => {
        const box = document.querySelector(selector)?.getBoundingClientRect();
        return box ? { x: box.x, y: box.y, width: box.width, height: box.height, bottom: box.bottom } : null;
      };
      return {
        viewport: { width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth },
        theme: document.documentElement.dataset.theme,
        header: rect('.topbar'),
        daily: rect('.daily-strip'),
        shell: rect('.shell'),
        left: rect('.col-left'),
        center: rect('.col-center'),
        right: rect('.col-right'),
      };
    });

    expect(geometry.theme).toBe(state.theme);
    expect(geometry.viewport.scrollWidth).toBeLessThanOrEqual(geometry.viewport.width + 1);
    expect(geometry.header).not.toBeNull();
    expect(geometry.daily).not.toBeNull();
    expect(geometry.shell).not.toBeNull();
    expect(geometry.header.y).toBeCloseTo(0, 0);
    expect(geometry.daily.y).toBeGreaterThanOrEqual(geometry.header.y - 1);
    expect(geometry.daily.bottom).toBeLessThanOrEqual(geometry.header.bottom + 1);
    expect(geometry.shell.y).toBeGreaterThanOrEqual(geometry.header.bottom - 1);

    if (state.width >= 1200) {
      const total = geometry.left.width + geometry.center.width + geometry.right.width;
      expect(geometry.left.y).toBeCloseTo(geometry.center.y, 0);
      expect(geometry.center.y).toBeCloseTo(geometry.right.y, 0);
      expect(geometry.left.width / total).toBeGreaterThan(0.26);
      expect(geometry.left.width / total).toBeLessThan(0.30);
      expect(geometry.center.width / total).toBeGreaterThan(0.44);
      expect(geometry.center.width / total).toBeLessThan(0.49);
      expect(geometry.right.width / total).toBeGreaterThan(0.24);
      expect(geometry.right.width / total).toBeLessThan(0.28);
    } else {
      expect(geometry.left.width).toBeLessThanOrEqual(state.width + 1);
      expect(geometry.center.y).toBeGreaterThanOrEqual(geometry.left.y + geometry.left.height - 1);
      expect(geometry.right.y).toBeGreaterThanOrEqual(geometry.center.y + geometry.center.height - 1);
    }

    fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({ path: path.join(screenshotDir, `${state.name}.png`), fullPage: false });
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}

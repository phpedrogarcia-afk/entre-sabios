import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'android-retrato', width: 390, height: 844 },
  { name: 'android-paisagem', width: 844, height: 390 },
  { name: 'tablet-retrato', width: 768, height: 1024 },
  { name: 'tablet-paisagem', width: 1024, height: 768 },
];

async function openReadyPage(page) {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');
  await expect(page.locator('#contentLoadStatus')).toHaveText('');
  await expect(page.locator('#feelingsGrid .feeling')).toHaveCount(14);
}

test('fluxo principal carrega sentimentos e gera outra perspectiva sem erro', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await openReadyPage(page);

  await expect(page.locator('input[name="intensity"]:checked')).toHaveCount(0);
  await page.locator('#feelingsGrid .feeling').first().click();
  await expect(page.locator('#generateBtn')).toBeEnabled();
  await page.locator('#generateBtn').click();
  await expect(page.locator('input[name="intensity"]:checked')).toHaveCount(0);

  const quote = page.locator('#quoteText');
  await expect(quote).not.toContainText('Como você está se sentindo hoje?');
  const firstText = await quote.textContent();
  await page.locator('#newBtn').click();
  await expect(quote).not.toHaveText(firstText ?? '');
  expect(pageErrors).toEqual([]);
});

for (const viewport of viewports) {
  test(`não produz overflow horizontal em ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openReadyPage(page);
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });
}

test('conto abre sem sentimento no smartphone e possui área rolável até o final', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openReadyPage(page);
  await expect(page.locator('#feelingsGrid .feeling[aria-pressed="true"]')).toHaveCount(0);
  await expect(page.locator('input[name="intensity"]:checked')).toHaveCount(0);
  await page.locator('#openTaleBtn').click();
  await expect(page.locator('#taleDialog')).toHaveAttribute('open', '');
  await expect(page.locator('#feelingsGrid .feeling[aria-pressed="true"]')).toHaveCount(0);
  await expect(page.locator('input[name="intensity"]:checked')).toHaveCount(0);
  await expect(page.locator('#taleTitle')).not.toHaveText('—');
  await expect(page.locator('#taleText p')).not.toHaveCount(0);
  await expect(page.locator('#taleLesson p')).not.toHaveCount(0);
  await expect(page.locator('#taleRelation p')).not.toHaveCount(0);
  await expect(page.locator('#taleQuestion p')).toHaveCount(1);
  await expect(page.locator('#taleDialog h3')).toHaveText([
    'Um modo de olhar',
    'O que talvez esteja pedindo para ser visto',
    'Uma pergunta para levar consigo',
  ]);

  const scrollResult = await page.locator('#taleDialog').evaluate((dialog) => {
    const candidates = [dialog, dialog.querySelector('.tale-content')].filter(Boolean);
    const target = candidates.find((element) => element.scrollHeight > element.clientHeight + 1);
    if (!target) return { found: false, moved: false };
    target.scrollTop = target.scrollHeight;
    return { found: true, moved: target.scrollTop > 0 };
  });
  expect(scrollResult).toEqual({ found: true, moved: true });
});

test('conto abre, fecha e reabre diretamente após escolher um sentimento', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await openReadyPage(page);

  await page.locator('#feelingsGrid .feeling').first().click();
  await page.locator('#openTaleBtn').click();
  await expect(page.locator('#taleDialog')).toHaveAttribute('open', '');
  await expect(page.locator('#taleTitle')).not.toHaveText('—');
  await expect(page.locator('#taleText p')).not.toHaveCount(0);

  await page.locator('#closeTaleTopBtn').click();
  await expect(page.locator('#taleDialog')).not.toHaveAttribute('open', '');

  await page.locator('#openTaleBtn').click();
  await expect(page.locator('#taleDialog')).toHaveAttribute('open', '');
  await expect(page.locator('#taleText p')).not.toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

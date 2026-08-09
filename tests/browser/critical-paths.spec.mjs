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

  await expect(page.locator('input[name="intensity"]')).toHaveCount(0);
  await expect(page.getByText('Preciso de motivação')).toHaveCount(0);
  await page.locator('#feelingsGrid .feeling').first().click();
  await expect(page.locator('#generateBtn')).toBeEnabled();
  await page.locator('#generateBtn').click();

  const quote = page.locator('#quoteText');
  await expect(quote).not.toContainText('Como você está se sentindo hoje?');
  const firstText = await quote.textContent();
  await page.locator('#newBtn').click();
  await expect(quote).not.toHaveText(firstText ?? '');
  expect(pageErrors).toEqual([]);
});

test('um, dois e três sentimentos preservam síntese específica e recarga', async ({ page }) => {
  await openReadyPage(page);
  const feelings = page.locator('#feelingsGrid .feeling');
  await feelings.nth(0).click();
  await expect(page.locator('#emotionalSynthesisSummary')).toBeHidden();
  await feelings.nth(1).click();
  await expect(page.locator('#emotionalSynthesisSummary .synthesis-title'))
    .toHaveText('Quando esses sentimentos se encontram');
  await feelings.nth(2).click();
  await expect(page.locator('#primaryFeelingControl')).toBeVisible();
  await page.reload();
  await expect(page.locator('input[name="intensity"]')).toHaveCount(0);
  await expect(page.getByText('Preciso de motivação')).toHaveCount(0);
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
  await expect(page.locator('input[name="intensity"]')).toHaveCount(0);
  await page.locator('#openTaleBtn').click();
  await expect(page.locator('#taleDialog')).toHaveAttribute('open', '');
  await expect(page.locator('#feelingsGrid .feeling[aria-pressed="true"]')).toHaveCount(0);
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

test('conto salvo aparece por resumo e reabre o texto completo com indicação de lido', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openReadyPage(page);

  await page.locator('#openTaleBtn').click();
  const savedTitle = await page.locator('#taleTitle').textContent();
  await expect(page.locator('#taleReadStatus')).toBeHidden();
  await page.locator('#taleFavoriteBtn').click();
  await expect(page.locator('#taleFavoriteBtn')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#closeTaleTopBtn').click();

  await page.locator('#favoritesBtn').click();
  const savedCard = page.locator('.favorite-item-tale');
  await expect(savedCard).toHaveCount(1);
  await expect(savedCard.locator('.favorite-item-title')).toHaveText(savedTitle ?? '');
  await expect(savedCard.locator('.favorite-item-summary')).not.toHaveText('');
  await expect(savedCard.locator('.tale-text')).toHaveCount(0);
  await savedCard.locator('.favorite-item-open').click();

  await expect(page.locator('#taleDialog')).toHaveAttribute('open', '');
  await expect(page.locator('#taleTitle')).toHaveText(savedTitle ?? '');
  await expect(page.locator('#taleReadStatus')).toBeVisible();
  await expect(page.locator('#taleText p')).not.toHaveCount(0);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('caixaSabedoriaFavoritas') || '[]'));
  expect(stored).toHaveLength(1);
  expect(stored[0]).toMatchObject({ type: 'tale', title: savedTitle });
});

test('histórico antigo de rotação não marca contos como lidos', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const taleIds = philosophicalTales.map((tale) => tale.id);
    localStorage.clear();
    localStorage.setItem(
      'entreSabiosContosVistos',
      JSON.stringify(taleIds.map((id) => `moderada::${id}`)),
    );
    localStorage.setItem('entreSabiosContosRecentes', JSON.stringify(taleIds.slice(-6)));
  });
  await page.reload();
  await expect(page.locator('#contentLoadStatus')).toHaveText('');

  await page.locator('#openTaleBtn').click();
  await expect(page.locator('#taleDialog')).toHaveAttribute('open', '');
  await expect(page.locator('#taleReadStatus')).toBeHidden();
});

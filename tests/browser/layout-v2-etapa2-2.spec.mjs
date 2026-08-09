import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const screenshotDir = process.env.ENTRE_SABIOS_SCREENSHOT_DIR
  || path.join(os.tmpdir(), 'entre-sabios-layout-v2-etapa2-2-playwright-20260729');

const longEditorial = {
  reflection: 'Uma leitura cuidadosa não precisa encerrar o sentido desta frase. Ela pode acompanhar a tensão entre pressa e atenção, reconhecer o que ainda não tem resposta e abrir espaço para observar o momento com mais nitidez. O texto permanece inteiro até este marcador: FIM-REFLEXAO.',
  philosophy: 'O pensador apresentado aqui trabalha a experiência como investigação contínua, sem transformar dúvida em falha pessoal. Sua contribuição se torna mais clara quando cada afirmação pode ser examinada no cotidiano. Perfil integral até este marcador: FIM-PENSADOR.',
  advice: 'Que detalhe concreto desta experiência merece ser observado antes de você escolher o próximo passo, e o que muda quando a resposta não precisa chegar imediatamente? Pergunta integral até este marcador: FIM-PERGUNTA.',
  book: 'Uma obra de título deliberadamente longo para testar quebra segura — edição comentada e ampliada',
  reason: 'A recomendação aprofunda a relação entre atenção, escolha e incerteza sem prometer uma solução pronta. Referência longa preservada: https://example.org/biblioteca/uma-referencia-editorial-deliberadamente-longa-sem-quebras. Justificativa integral até este marcador: FIM-LIVRO.',
};

const visualStates = [
  { name: '1448x1086-claro-reflexao-longa', width: 1448, height: 1086, theme: 'day' },
  { name: '1448x1086-escuro-reflexao-longa', width: 1448, height: 1086, theme: 'night' },
  { name: '1366x768-claro-reflexao-longa', width: 1366, height: 768, theme: 'day' },
  { name: '390x844-claro-reflexao-longa', width: 390, height: 844, theme: 'day' },
  { name: '390x844-escuro-reflexao-longa', width: 390, height: 844, theme: 'night' },
];

async function openLayout(page, state) {
  await page.setViewportSize({ width: state.width, height: state.height });
  await page.addInitScript((theme) => {
    localStorage.clear();
    if (theme === 'night') localStorage.setItem('entreSabiosTheme', 'night');
  }, state.theme);
  await page.goto('/');
  await expect(page.locator('#contentLoadStatus')).toHaveText('');
  await expect(page.locator('html')).toHaveAttribute('data-theme', state.theme);
}

async function renderLongEditorial(page) {
  await page.evaluate((copy) => {
    const content = {
      reflectionText: copy.reflection,
      philosophyText: copy.philosophy,
      adviceText: copy.advice,
      bookText: copy.book,
      bookReason: copy.reason,
    };
    for (const [id, text] of Object.entries(content)) document.getElementById(id).textContent = text;
    for (const id of ['explanationBlock', 'philosophyBlock', 'adviceBlock', 'bookRecommendation']) {
      document.getElementById(id).hidden = false;
    }
  }, longEditorial);
}

async function editorialGeometry(page) {
  return page.evaluate(() => {
    const selectors = [
      '#explanationBlock', '#reflectionText', '#philosophyBlock', '#philosophyText',
      '#adviceBlock', '#adviceText', '#bookRecommendation', '#bookText', '.book-rec-why',
    ];
    const items = Object.fromEntries(selectors.map((selector) => {
      const element = document.querySelector(selector);
      const style = getComputedStyle(element);
      return [selector, {
        maxHeight: style.maxHeight,
        overflowX: style.overflowX,
        overflowY: style.overflowY,
        fits: element.scrollHeight <= element.clientHeight + 1,
      }];
    }));
    const ids = [...document.querySelectorAll('[id]')].map((node) => node.id);
    return {
      items,
      endings: {
        reflection: document.getElementById('reflectionText').textContent.endsWith('FIM-REFLEXAO.'),
        philosophy: document.getElementById('philosophyText').textContent.endsWith('FIM-PENSADOR.'),
        advice: document.getElementById('adviceText').textContent.endsWith('FIM-PERGUNTA.'),
        book: document.getElementById('bookReason').textContent.endsWith('FIM-LIVRO.'),
      },
      duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
      documentGrows: document.documentElement.scrollHeight > document.documentElement.clientHeight,
      centerGrows: document.querySelector('.col-center').scrollHeight > document.querySelector('.col-center').clientHeight,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

for (const state of visualStates) {
  test(`texto editorial integral e screenshot ${state.name}`, async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await openLayout(page, state);
    await renderLongEditorial(page);
    const geometry = await editorialGeometry(page);
    for (const item of Object.values(geometry.items)) {
      expect(item.maxHeight).toBe('none');
      expect(item.overflowX).toBe('visible');
      expect(item.overflowY).toBe('visible');
      expect(item.fits).toBe(true);
    }
    expect(geometry.endings).toEqual({ reflection: true, philosophy: true, advice: true, book: true });
    expect(geometry.duplicateIds).toEqual([]);
    if (state.width >= 1101) {
      expect(geometry.documentGrows).toBe(false);
      expect(geometry.centerGrows).toBe(true);
    } else {
      expect(geometry.documentGrows).toBe(true);
    }
    expect(geometry.horizontalOverflow).toBeLessThanOrEqual(1);

    await page.locator('#explanationBlock').scrollIntoViewIfNeeded();
    fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({ path: path.join(screenshotDir, `${state.name}.png`), fullPage: false });
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}

test('frase do dia usa distância real, velocidade contínua aprovada e reduced motion', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await openLayout(page, { width: 1448, height: 1086, theme: 'day' });
  await page.evaluate(() => {
    let text = '“A atenção se move com serenidade';
    const viewport = document.querySelector('.daily-viewport');
    while (true) {
      dailyQuoteTextEl.textContent = `${text}.” — Entre Sábios`;
      const overflow = dailyQuoteTextEl.scrollWidth - viewport.clientWidth;
      if (overflow >= 450) break;
      text += ', observa cada detalhe e preserva o tempo da leitura';
    }
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
  await page.screenshot({ path: path.join(screenshotDir, 'frase-do-dia-inicio.png'), fullPage: false });
  await track.evaluate((node) => { node.style.animationDelay = '-3s'; });
  await page.waitForTimeout(180);
  const movingTransform = await track.evaluate((node) => getComputedStyle(node).transform);
  expect(movingTransform).not.toBe('none');
  expect(movingTransform).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
  await page.screenshot({ path: path.join(screenshotDir, 'frase-do-dia-em-movimento.png'), fullPage: false });

  await viewport.hover();
  await expect(track).toHaveCSS('animation-play-state', 'running');
  await viewport.focus();
  await expect(track).toHaveCSS('animation-play-state', 'running');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(track).toHaveCSS('animation-name', 'none');
  await expect(track).toHaveCSS('transform', 'none');
  await expect(page.locator('#dailyQuoteText')).toHaveCSS('white-space', 'normal');
  await page.screenshot({ path: path.join(screenshotDir, 'frase-do-dia-reduced-motion.png'), fullPage: false });
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('frase curta e smartphone permanecem em movimento sem overflow horizontal', async ({ page }) => {
  await openLayout(page, { width: 390, height: 844, theme: 'day' });
  await page.evaluate(() => {
    dailyQuoteTextEl.textContent = '“Breve e inteira.” — Entre Sábios';
    dailyQuoteTextCloneEl.textContent = '';
    syncDailyQuoteMotion();
  });
  await expect(page.locator('.daily-marquee-track')).toHaveCSS('animation-name', 'daily-quote-loop');
  await expect(page.locator('#dailyQuoteTextClone')).toHaveCSS('display', 'none');
  await expect(page.locator('#dailyQuoteTextClone')).toHaveText('');
  const mobile = await page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    whiteSpace: getComputedStyle(document.getElementById('dailyQuoteText')).whiteSpace,
  }));
  expect(mobile.horizontalOverflow).toBeLessThanOrEqual(1);
  expect(mobile.whiteSpace).toBe('nowrap');
});

// Frase do dia.
// Extraído de script.js na Fase 5 da refatoração segura.
// O movimento permanece contínuo quando animações são permitidas. Há uma única
// cópia visual da frase: ela atravessa a faixa e reinicia fora da área visível.

let dailyQuoteResizeObserver = null;
let dailyQuoteSyncFrame = null;

const DAILY_QUOTE_SPEED_PX_PER_SECOND = 44;
const DAILY_QUOTE_MAX_TEXT_LENGTH = 104;
const DAILY_QUOTE_MAX_LINE_LENGTH = 132;

function getDailyQuotePool() {
  const approvedRuntimeQuotes = (Array.isArray(runtimeContents) ? runtimeContents : [])
    .filter((content) =>
      content?.displayType === 'citacao_curta'
      && ['exact_quote', 'translated_quote'].includes(content.attributionType)
      && content.publicationEnabled !== false
      && content.status !== 'REMOVIDO'
      && String(content.finalText || '').trim().length <= DAILY_QUOTE_MAX_TEXT_LENGTH)
    .map((content) => [
      String(content.finalText || '').trim(),
      String(content.displayedAuthor || content.author || '').trim(),
    ])
    .filter(([quote, attribution]) =>
      quote
      && attribution
      && quote.length + attribution.length + 7 <= DAILY_QUOTE_MAX_LINE_LENGTH);

  const seen = new Set();
  return [...dailyQuotes, ...approvedRuntimeQuotes].filter(([quote, attribution]) => {
    const key = `${String(quote).trim().toLocaleLowerCase('pt-BR')}|${String(attribution).trim().toLocaleLowerCase('pt-BR')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function syncDailyQuoteMotion() {
  const viewport = dailyQuoteTextEl?.closest('.daily-viewport');
  const marqueeTrack = viewport?.querySelector('.daily-marquee-track');
  if (!viewport || !marqueeTrack || !dailyQuoteTextCloneEl) return;

  const textWidth = Math.ceil(dailyQuoteTextEl.getBoundingClientRect().width);
  if (textWidth <= 0) return;

  const viewportWidth = Math.ceil(viewport.clientWidth);
  const travelDistance = viewportWidth + textWidth;
  const duration = travelDistance / DAILY_QUOTE_SPEED_PX_PER_SECOND;

  dailyQuoteTextCloneEl.textContent = '';
  viewport.classList.add('is-moving');
  viewport.style.setProperty('--daily-start-x', `${viewportWidth}px`);
  viewport.style.setProperty('--daily-end-x', `${-textWidth}px`);
  viewport.style.setProperty('--daily-motion-duration', `${duration.toFixed(3)}s`);
  viewport.style.setProperty('--daily-motion-offset', `${(-duration * 0.24).toFixed(3)}s`);
}

function initDailyQuote() {
  const quotePool = getDailyQuotePool();
  if (!quotePool.length) return;
  const now = new Date();
  const dayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  const [quote, attribution] = quotePool[dayNumber % quotePool.length];
  const text = `“${quote}” — ${attribution}`;
  dailyQuoteTextEl.textContent = text;
  dailyQuoteTextCloneEl.textContent = '';

  const scheduleSync = () => {
    if (typeof cancelAnimationFrame === 'function' && dailyQuoteSyncFrame !== null) {
      cancelAnimationFrame(dailyQuoteSyncFrame);
    }
    if (typeof requestAnimationFrame === 'function') {
      dailyQuoteSyncFrame = requestAnimationFrame(() => {
        dailyQuoteSyncFrame = null;
        syncDailyQuoteMotion();
      });
    } else syncDailyQuoteMotion();
  };

  scheduleSync();
  if (typeof ResizeObserver === 'function') {
    dailyQuoteResizeObserver?.disconnect();
    dailyQuoteResizeObserver = new ResizeObserver(scheduleSync);
    dailyQuoteResizeObserver.observe(dailyQuoteTextEl.closest('.daily-viewport'));
    dailyQuoteResizeObserver.observe(dailyQuoteTextEl);
  } else if (typeof window !== 'undefined') {
    window.addEventListener('resize', scheduleSync, { passive: true });
  }

  if (typeof document !== 'undefined' && document.fonts?.ready) {
    document.fonts.ready.then(scheduleSync);
  }
}

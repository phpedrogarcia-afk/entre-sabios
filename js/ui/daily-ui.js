// Frase do dia.
// Extraído de script.js na Fase 5 da refatoração segura.
// O movimento é ativado somente quando a frase ultrapassa o espaço disponível.

let dailyQuoteResizeObserver = null;
let dailyQuoteSyncFrame = null;

const DAILY_QUOTE_SPEED_PX_PER_SECOND = 44;
const DAILY_QUOTE_COPY_GAP_PX = 64;

function syncDailyQuoteMotion() {
  const viewport = dailyQuoteTextEl?.closest('.daily-viewport');
  const marqueeTrack = viewport?.querySelector('.daily-marquee-track');
  if (!viewport || !marqueeTrack || !dailyQuoteTextCloneEl) return;

  if (dailyQuoteTextCloneEl.textContent !== dailyQuoteTextEl.textContent) {
    dailyQuoteTextCloneEl.textContent = dailyQuoteTextEl.textContent;
  }

  const textWidth = Math.ceil(dailyQuoteTextEl.getBoundingClientRect().width);
  const combinedWidth = (textWidth * 2) + DAILY_QUOTE_COPY_GAP_PX;
  const overflow = Math.max(0, combinedWidth - viewport.clientWidth);
  const isOverflowing = overflow > 1;
  const loopDistance = textWidth + DAILY_QUOTE_COPY_GAP_PX;
  const duration = loopDistance / DAILY_QUOTE_SPEED_PX_PER_SECOND;

  viewport.classList.toggle('is-overflowing', isOverflowing);
  viewport.style.setProperty('--daily-copy-gap', `${DAILY_QUOTE_COPY_GAP_PX}px`);
  viewport.style.setProperty('--daily-loop-distance', `${-loopDistance}px`);
  viewport.style.setProperty('--daily-motion-duration', isOverflowing ? `${duration.toFixed(3)}s` : '0s');
}

function initDailyQuote() {
  const now = new Date();
  const dayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  const [quote, attribution] = dailyQuotes[dayNumber % dailyQuotes.length];
  const text = `“${quote}” — ${attribution}`;
  dailyQuoteTextEl.textContent = text;
  dailyQuoteTextCloneEl.textContent = text;

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

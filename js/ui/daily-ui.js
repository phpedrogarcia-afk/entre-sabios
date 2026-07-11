// Frase do dia.
// Extraído de script.js na Fase 5 da refatoração segura.
// Não alterar comportamento nem aparência nesta fase.

function computeCurrentTimeString() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function initDailyQuote() {
  const now = new Date();
  const dayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  const [quote, attribution] = dailyQuotes[dayNumber % dailyQuotes.length];
  const text = `“${quote}” — ${attribution}`;
  dailyQuoteTextEl.textContent = text;
  dailyQuoteTextCloneEl.textContent = text;
}

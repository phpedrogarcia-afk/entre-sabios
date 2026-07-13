// Normalização de temas, autores e texto auxiliar.
// Extraído de script.js na Fase 3 da refatoração segura.
// Não alterar pesos, regras ou comportamento nesta fase.

function normalizeTheme(t) {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

// Apenas textos com referência editorial conhecida aparecem como citação direta.
// Todo o restante do banco é apresentado honestamente como uma ideia inspirada no pensador.

function normalizeAuthorName(name) {
  const normalized = normalizeTheme(name).replace(/_/g, ' ');
  return authorBookAliases[normalized] || normalized;
}

function getAdviceThemes(advice) {
  const normalizedAdvice = normalizeTheme(advice).replace(/_/g, ' ');
  return Array.from(new Set(normalizedAdvice.split(/\s+/).filter((word) => word.length >= 5)));
}

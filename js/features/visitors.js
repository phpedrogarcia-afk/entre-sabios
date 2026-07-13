// Contador de visitantes/presentes.
// Extraído de script.js na Fase 4 da refatoração segura.
// Não alterar comportamento nesta fase.

async function updateVisitorCount() {
  if (!visitorCountEl) return;

  const namespace = 'caixa-de-sabedoria-phped';
  const counter = 'visitas';
  const sessionKey = 'caixaSabedoriaVisitCounted';
  const shouldIncrement = !sessionStorage.getItem(sessionKey);
  const action = shouldIncrement ? 'up' : '';
  const url = `https://api.counterapi.dev/v1/${namespace}/${counter}/${action}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Contador indisponível');
    const data = await response.json();
    const count = Number(data.count ?? data.value ?? data.data?.count);
    if (!Number.isFinite(count)) throw new Error('Resposta inválida');
    visitorCountEl.textContent = new Intl.NumberFormat('pt-BR').format(count);
    if (shouldIncrement) sessionStorage.setItem(sessionKey, '1');
  } catch {
    visitorCountEl.textContent = '—';
    visitorCountEl.title = 'Contador temporariamente indisponível';
  }
}

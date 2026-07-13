(function initRuntimeLoader(root) {
  const EXPECTED_VERSION = 'definitiva-2.1';
  const RUNTIME_URL = `data/entre_sabios_runtime.json?v=${encodeURIComponent(EXPECTED_VERSION)}`;

  async function loadRuntimeContent() {
    const response = await fetch(RUNTIME_URL, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Falha HTTP ${response.status} ao carregar o acervo.`);
    const runtime = await response.json();
    if (runtime.schemaVersion !== '1.1.0') throw new Error(`Schema incompatível: ${runtime.schemaVersion}`);
    if (runtime.contentVersion !== EXPECTED_VERSION) throw new Error(`Versão incompatível: ${runtime.contentVersion}`);
    if (!Array.isArray(runtime.contents) || runtime.contents.length !== 283) throw new Error('Quantidade de conteúdos ativos incompatível.');
    if (!Array.isArray(runtime.feelings) || runtime.feelings.length !== 14) throw new Error('Catálogo de sentimentos incompatível.');
    if (runtime.feelings.some((feeling) => feeling.id === 'coragem')) throw new Error('Coragem não pode ser um sentimento selecionável.');
    root.EntreSabiosRuntime = runtime;
    console.info(`[Entre Sábios] Acervo ${runtime.contentVersion} carregado: ${runtime.contents.length} conteúdos.`);
    return runtime;
  }

  root.EntreSabiosRuntimeLoader = { EXPECTED_VERSION, RUNTIME_URL, loadRuntimeContent };
})(typeof window !== 'undefined' ? window : globalThis);

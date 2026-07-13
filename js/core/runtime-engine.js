(function initRuntimeEngine(root) {
  const LEVEL_REASONS = {
    1: 'associação principal em núcleo',
    2: 'associação principal contextual',
    3: 'associação secundária em núcleo',
    4: 'associação secundária contextual',
    5: 'conteúdo geral de fallback',
  };

  function getSelectionLevel(content, state) {
    const associations = content.associations || [];
    const primary = state.primaryFeeling;
    const secondary = new Set(state.secondaryFeelings || []);
    if (associations.some((item) => item.feeling === primary && item.placement === 'nucleo')) return 1;
    if (associations.some((item) => item.feeling === primary && item.placement === 'contextual')) return 2;
    if (associations.some((item) => secondary.has(item.feeling) && item.placement === 'nucleo')) return 3;
    if (associations.some((item) => secondary.has(item.feeling) && item.placement === 'contextual')) return 4;
    if (content.placement === 'geral') return 5;
    return null;
  }

  function getContextSignals(state, firstResponse) {
    const signals = new Set();
    if (firstResponse) {
      signals.add('primeira_resposta');
      signals.add('reconhecimento_inicial');
    }
    if (state.intensity === 'intensa') {
      const intenseSignal = {
        ansiedade: 'ansiedade_intensa',
        medo: 'medo_intenso',
        raiva: 'raiva_intensa',
        tristeza: 'tristeza_intensa',
        luto: 'luto_intenso',
      }[state.primaryFeeling];
      if (intenseSignal) signals.add(intenseSignal);
    }
    return signals;
  }

  function isBlocked(content, signals) {
    return (content.hardExclusions || []).some((exclusion) => signals.has(exclusion));
  }

  function genderRank(content, preference) {
    if (!preference || preference === 'any') return 0;
    if (content.filterGender === preference) return 0;
    if (content.filterGender === 'neutral') return 1;
    return 2;
  }

  function stableHash(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function rankEligibleContents(contents, state, options = {}) {
    const genderPreference = options.genderPreference || 'any';
    const firstResponse = options.firstResponse === true;
    const signals = getContextSignals(state, firstResponse);
    return contents
      .filter((content) => content.publicationEnabled === true)
      .filter((content) => ['ATIVO_NUCLEO', 'ATIVO_CONTEXTUAL', 'ATIVO_GERAL', 'ATIVO_REFERENCIA_PENDENTE'].includes(content.status))
      .filter((content) => content.suitableIntensities.includes(state.intensity))
      .filter((content) => !isBlocked(content, signals))
      .map((content) => ({ content, level: getSelectionLevel(content, state), genderRank: genderRank(content, genderPreference) }))
      .filter((candidate) => candidate.level !== null)
      .sort((a, b) => a.level - b.level
        || a.genderRank - b.genderRank
        || stableHash(`${state.primaryFeeling}:${state.intensity}:${a.content.id}`) - stableHash(`${state.primaryFeeling}:${state.intensity}:${b.content.id}`)
        || a.content.id.localeCompare(b.content.id, 'pt-BR'));
  }

  function contextKey(version, state, options) {
    return [version, state.primaryFeeling, ...(state.secondaryFeelings || []).slice().sort(), state.intensity, options.genderPreference || 'any', options.firstResponse ? 'initial' : 'continued'].join('|');
  }

  function createSelector({ version, contents, storage = null } = {}) {
    const queues = new Map();
    const lastSelectedByContext = new Map();
    const storageKey = `entreSabiosRuntimeQueues:${version}`;
    if (storage) {
      try {
        const saved = JSON.parse(storage.getItem(storageKey) || '{}');
        Object.entries(saved).forEach(([key, ids]) => queues.set(key, Array.isArray(ids) ? ids : []));
      } catch {
        // A rotação em memória continua disponível.
      }
    }

    function persist() {
      if (!storage) return;
      try {
        storage.setItem(storageKey, JSON.stringify(Object.fromEntries(queues)));
      } catch {
        // Persistência é opcional; nunca afeta a elegibilidade.
      }
    }

    function inspect(state, options = {}) {
      const ranked = rankEligibleContents(contents, state, options);
      const bestLevel = ranked[0]?.level ?? null;
      const eligibleAtLevel = ranked.filter((candidate) => candidate.level === bestLevel);
      return { ranked, bestLevel, eligibleAtLevel, signals: [...getContextSignals(state, options.firstResponse === true)] };
    }

    function select(state, options = {}) {
      const inspection = inspect(state, options);
      if (inspection.bestLevel === null) return null;
      const key = contextKey(version, state, options);
      const baseKey = contextKey(version, state, { ...options, firstResponse: false });
      const eligibleIds = inspection.eligibleAtLevel.map((candidate) => candidate.content.id);
      let queue = (queues.get(key) || []).filter((id) => eligibleIds.includes(id));
      if (!queue.length) queue = eligibleIds.slice();
      const lastSelected = lastSelectedByContext.get(baseKey);
      if (queue.length > 1 && queue[0] === lastSelected) queue.push(queue.shift());
      const selectedId = queue.shift();
      queues.set(key, queue);
      lastSelectedByContext.set(baseKey, selectedId);
      persist();
      const selected = inspection.eligibleAtLevel.find((candidate) => candidate.content.id === selectedId);
      return {
        content: selected.content,
        level: selected.level,
        reason: LEVEL_REASONS[selected.level],
        fallback: selected.level === 5,
        eligibleAtLevel: eligibleIds.length,
        contextSignals: inspection.signals,
      };
    }

    function clear() {
      queues.clear();
      lastSelectedByContext.clear();
      if (storage) {
        try { storage.removeItem(storageKey); } catch { /* opcional */ }
      }
    }

    return { inspect, select, clear };
  }

  root.EntreSabiosRuntimeEngine = {
    LEVEL_REASONS,
    createSelector,
    getContextSignals,
    getSelectionLevel,
    rankEligibleContents,
  };
})(typeof window !== 'undefined' ? window : globalThis);

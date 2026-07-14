(function initRuntimeEngine(root) {
  const LEVEL_REASONS = {
    1: 'associação principal em núcleo',
    2: 'associação principal contextual',
    3: 'associação secundária em núcleo',
    4: 'associação secundária contextual',
    5: 'conteúdo geral de fallback',
  };
  const RECENT_CONTENT_WINDOW = 12;
  const RECENT_AUTHOR_WINDOW = 5;
  const RECENT_HISTORY_LIMIT = 120;
  const CONTEXT_HISTORY_LIMIT = 120;
  const DEVELOPED_FORMATS = new Set(['microtexto', 'reflexao_curta', 'citacao_longa']);
  const VULNERABLE_FEELINGS = new Set(['luto', 'tristeza', 'inseguranca', 'culpa', 'ansiedade', 'solidao']);

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

  function normalizeComparableText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function getContentAuthorKey(content) {
    return normalizeComparableText(content.displayedAuthor || content.author || 'entre sabios');
  }

  function getSecondaryCompatibility(content, state) {
    const secondary = new Set(state.secondaryFeelings || []);
    const secondaryAssociation = (content.associations || []).reduce((score, association) => {
      if (!secondary.has(association.feeling)) return score;
      return score + (association.placement === 'nucleo' ? 4 : 2);
    }, 0);
    const contextualThemes = new Set([
      ...(state.secondaryThemes || []),
      ...(state.combinationThemes || []),
      ...(state.intensityThemes || []),
    ].map(normalizeComparableText));
    const themeScore = (content.themes || []).filter((theme) => contextualThemes.has(normalizeComparableText(theme))).length;
    const suitableTones = new Set((state.suitableTones || []).map(normalizeComparableText));
    const toneScore = suitableTones.has(normalizeComparableText(content.tone)) ? 1 : 0;
    return secondaryAssociation + themeScore + toneScore;
  }

  function classifyEditorialEffects(content, state = {}, options = {}) {
    const text = normalizeComparableText(content.finalText);
    const tags = new Set();
    const functionEffects = {
      recognition: 'recognizes_emotion',
      presence: 'offers_presence',
      clarification: 'clarifies_mechanism',
      reframing: 'expands_perspective',
      inquiry: 'invites_reflection',
      grounding: 'offers_grounding',
      confrontation: 'confronts_safely',
      contemplation: 'offers_presence',
    };
    if (functionEffects[content.editorialFunction]) tags.add(functionEffects[content.editorialFunction]);

    const riskEffects = {
      invalidacao_emocional: 'confirms_harmful_belief',
      culpabilizacao: 'risks_negative_reinforcement',
      desesperanca_absoluta: 'confirms_harmful_belief',
      romantizacao_do_sofrimento: 'romanticizes_suffering',
      moralizacao: 'risks_negative_reinforcement',
      conselho_prematuro: 'risks_negative_reinforcement',
      pressao_por_superacao: 'risks_negative_reinforcement',
    };
    (content.riskTags || []).forEach((risk) => {
      if (riskEffects[risk]) tags.add(riskEffects[risk]);
    });

    if (/(inseguranca|medo).*(prova|mostra).*(incapaz|inadequad)/.test(text)) tags.add('confirms_harmful_belief');
    if (/(vinganca|vingar|faca (todos|alguem|quem).*(pagar|sofrer))/.test(text)) tags.add('justifies_resentment');
    if (/(afaste se de todos|ninguem merece sua companhia|sozinho e (sempre )?melhor)/.test(text)) tags.add('encourages_isolation');
    if (/(nao ha esperanca|nada (vai|pode) mudar|nao existe saida)/.test(text)) tags.add('confirms_harmful_belief');
    if (state.primaryFeeling === 'luto' && /(siga em frente|seguir em frente|supere|superar|deixe para tras)/.test(text)) {
      tags.add('risks_negative_reinforcement');
    }

    const unsafeTags = new Set([
      'confirms_harmful_belief',
      'encourages_isolation',
      'justifies_resentment',
      'romanticizes_suffering',
    ]);
    let safe = ![...tags].some((tag) => unsafeTags.has(tag));
    if (state.primaryFeeling === 'luto') {
      const unsafeGriefRisk = (content.riskTags || []).some((risk) => [
        'conselho_prematuro',
        'pressao_por_superacao',
        'moralizacao',
        'romantizacao_do_sofrimento',
        'abstracao_elevada',
      ].includes(risk));
      const unsafeGriefFunction = content.editorialFunction === 'confrontation'
        || content.tone === 'ironico'
        || (state.intensity === 'intensa' && content.editorialFunction === 'action')
        || (options.firstResponse && content.editorialFunction === 'action');
      if (unsafeGriefRisk || unsafeGriefFunction || tags.has('risks_negative_reinforcement')) safe = false;
    }
    if (options.firstResponse && VULNERABLE_FEELINGS.has(state.primaryFeeling)
      && ['confrontation', 'action'].includes(content.editorialFunction)) safe = false;

    return { safe, tags: [...tags] };
  }

  function getTrajectoryPriority(content, state, contextHistory, firstResponse) {
    const hasRecognition = contextHistory.some((item) => ['recognition', 'presence'].includes(item.editorialFunction));
    const earlyIntense = state.intensity === 'intensa' && contextHistory.length < 3;
    let order;
    if (firstResponse || !hasRecognition) {
      order = ['recognition', 'presence', 'contemplation', 'clarification', 'grounding', 'inquiry', 'reframing', 'confrontation', 'action'];
    } else if (earlyIntense) {
      order = ['recognition', 'presence', 'contemplation', 'clarification', 'grounding', 'inquiry', 'reframing', 'confrontation', 'action'];
    } else {
      order = ['clarification', 'inquiry', 'grounding', 'reframing', 'contemplation', 'recognition', 'presence', 'action', 'confrontation'];
    }
    const index = order.indexOf(content.editorialFunction);
    return index >= 0 ? index : order.length;
  }

  function buildCadencedQueue(candidates) {
    const developed = candidates.filter(({ content }) => DEVELOPED_FORMATS.has(content.displayType));
    const concise = candidates.filter(({ content }) => !DEVELOPED_FORMATS.has(content.displayType));
    if (developed.length < 3 || !concise.length) return candidates.map(({ content }) => content.id);
    const interval = Math.max(1, Math.floor(concise.length / developed.length));
    const ordered = [];
    let conciseIndex = 0;
    for (const developedCandidate of developed) {
      ordered.push(...concise.slice(conciseIndex, conciseIndex + interval));
      conciseIndex += interval;
      ordered.push(developedCandidate);
    }
    ordered.push(...concise.slice(conciseIndex));
    return ordered.map(({ content }) => content.id);
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
    const firstResponse = options.firstResponse === true;
    const signals = getContextSignals(state, firstResponse);
    return contents
      .filter((content) => content.publicationEnabled === true)
      .filter((content) => ['ATIVO_NUCLEO', 'ATIVO_CONTEXTUAL', 'ATIVO_GERAL', 'ATIVO_REFERENCIA_PENDENTE'].includes(content.status))
      .filter((content) => content.suitableIntensities.includes(state.intensity))
      .filter((content) => !isBlocked(content, signals))
      .filter((content) => classifyEditorialEffects(content, state, options).safe)
      .map((content) => ({ content, level: getSelectionLevel(content, state) }))
      .filter((candidate) => candidate.level !== null)
      .sort((a, b) => a.level - b.level
        || getSecondaryCompatibility(b.content, state) - getSecondaryCompatibility(a.content, state)
        || stableHash(`${state.primaryFeeling}:${state.intensity}:${a.content.id}`) - stableHash(`${state.primaryFeeling}:${state.intensity}:${b.content.id}`)
        || a.content.id.localeCompare(b.content.id, 'pt-BR'));
  }

  function contextKey(version, state) {
    return [version, state.primaryFeeling, ...(state.secondaryFeelings || []).slice().sort(), state.intensity].join('|');
  }

  function createSelector({ version, contents, storage = null } = {}) {
    const queues = new Map();
    const contextHistories = new Map();
    const storageKey = `entreSabiosRuntimeQueues:${version}`;
    const recentStorageKey = `entreSabiosRecentContent:${version}`;
    const contextHistoryStorageKey = `entreSabiosContextHistory:${version}`;
    let recentSelections = [];
    if (storage) {
      try {
        const saved = JSON.parse(storage.getItem(storageKey) || '{}');
        Object.entries(saved).forEach(([key, ids]) => queues.set(key, Array.isArray(ids) ? ids : []));
      } catch {
        // A rotação em memória continua disponível.
      }
      try {
        const savedRecent = JSON.parse(storage.getItem(recentStorageKey) || '[]');
        if (Array.isArray(savedRecent)) {
          recentSelections = savedRecent
            .filter((item) => item && typeof item.id === 'string' && typeof item.textKey === 'string')
            .slice(-RECENT_HISTORY_LIMIT);
        }
      } catch {
        // O histórico recente continua disponível apenas em memória.
      }
      try {
        const savedContexts = JSON.parse(storage.getItem(contextHistoryStorageKey) || '{}');
        Object.entries(savedContexts).forEach(([key, entries]) => {
          if (Array.isArray(entries)) contextHistories.set(key, entries.slice(-CONTEXT_HISTORY_LIMIT));
        });
      } catch {
        // A trajetória por contexto continua disponível apenas em memória.
      }
    }

    function persist() {
      if (!storage) return;
      try {
        storage.setItem(storageKey, JSON.stringify(Object.fromEntries(queues)));
        storage.setItem(recentStorageKey, JSON.stringify(recentSelections.slice(-RECENT_HISTORY_LIMIT)));
        storage.setItem(contextHistoryStorageKey, JSON.stringify(Object.fromEntries(contextHistories)));
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
      const baseKey = contextKey(version, state);
      const contextHistory = contextHistories.get(baseKey) || [];
      const effectiveOptions = {
        ...options,
        firstResponse: options.firstResponse === true && contextHistory.length === 0,
      };
      const inspection = inspect(state, effectiveOptions);
      if (inspection.bestLevel === null) return null;
      const key = baseKey;
      const recentContents = recentSelections.slice(-RECENT_CONTENT_WINDOW);
      const recentIds = new Set(recentContents.map((item) => item.id));
      const recentTextKeys = new Set(recentContents.map((item) => item.textKey));
      const lastSelection = recentSelections.at(-1);
      const levelCandidates = inspection.ranked.filter((candidate) => candidate.level === inspection.bestLevel);
      const eligibleIds = levelCandidates.map((candidate) => candidate.content.id);
      const levelKey = `${key}::level:${inspection.bestLevel}`;
      let queue = (queues.get(levelKey) || []).filter((id) => eligibleIds.includes(id));
      const cycleRestarted = queue.length === 0;
      if (cycleRestarted) queue = buildCadencedQueue(levelCandidates);
      const candidateById = new Map(levelCandidates.map((candidate) => [candidate.content.id, candidate]));
      const queuedCandidates = queue.map((id) => candidateById.get(id)).filter(Boolean);
      let candidates = queuedCandidates.filter(({ content }) => {
        const textKey = normalizeComparableText(content.finalText);
        return !recentIds.has(content.id) && !recentTextKeys.has(textKey);
      });
      const exactAvoidanceRelaxed = candidates.length === 0;
      if (exactAvoidanceRelaxed) {
        candidates = queuedCandidates.filter(({ content }) => {
          const textKey = normalizeComparableText(content.finalText);
          return content.id !== lastSelection?.id && textKey !== lastSelection?.textKey;
        });
        if (!candidates.length) candidates = queuedCandidates;
        candidates = candidates.slice().sort((a, b) => {
          const getRecency = ({ content }) => {
            const textKey = normalizeComparableText(content.finalText);
            const index = recentContents.findIndex((item) => item.id === content.id || item.textKey === textKey);
            return index < 0 ? -1 : index;
          };
          return getRecency(a) - getRecency(b);
        });
      }

      const bestTrajectoryPriority = Math.min(...candidates.map(({ content }) => getTrajectoryPriority(
        content,
        state,
        contextHistory,
        effectiveOptions.firstResponse,
      )));
      const trajectoryCandidates = candidates.filter(({ content }) => getTrajectoryPriority(
        content,
        state,
        contextHistory,
        effectiveOptions.firstResponse,
      ) === bestTrajectoryPriority);
      if (trajectoryCandidates.length) candidates = trajectoryCandidates;

      const recentFormats = contextHistory.slice(-10).map((item) => item.format);
      const lastFormat = recentFormats.at(-1);
      const recentDeveloped = recentFormats.filter((format) => DEVELOPED_FORMATS.has(format)).length;
      const developedEligible = levelCandidates.filter(({ content }) => DEVELOPED_FORMATS.has(content.displayType)).length;
      const developedCandidates = candidates.filter(({ content }) => DEVELOPED_FORMATS.has(content.displayType));
      const conciseCandidates = candidates.filter(({ content }) => !DEVELOPED_FORMATS.has(content.displayType));
      const remainingDeveloped = queuedCandidates.filter(({ content }) => DEVELOPED_FORMATS.has(content.displayType)).length;
      const remainingConcise = queuedCandidates.length - remainingDeveloped;
      const conciseStreak = [...recentFormats].reverse().findIndex((format) => DEVELOPED_FORMATS.has(format));
      if (DEVELOPED_FORMATS.has(lastFormat) && conciseCandidates.length) {
        candidates = conciseCandidates;
      } else if (!DEVELOPED_FORMATS.has(lastFormat) && developedCandidates.length
        && remainingConcise > 0 && remainingDeveloped >= remainingConcise) {
        candidates = developedCandidates;
      } else if (developedCandidates.length && (conciseStreak === -1 ? recentFormats.length : conciseStreak) >= 5) {
        candidates = developedCandidates;
      } else if (developedEligible >= 3 && recentFormats.length >= 4) {
        const developedShare = recentDeveloped / recentFormats.length;
        if (developedShare < 0.2 && developedCandidates.length) candidates = developedCandidates;
        if (developedShare >= 0.3 && conciseCandidates.length) candidates = conciseCandidates;
      }

      const recentAuthorCounts = recentSelections.slice(-(RECENT_AUTHOR_WINDOW - 1)).reduce((counts, item) => {
        counts.set(item.authorKey, (counts.get(item.authorKey) || 0) + 1);
        return counts;
      }, new Map());
      const authorSafeCandidates = candidates.filter(({ content }) => (recentAuthorCounts.get(getContentAuthorKey(content)) || 0) < 2);
      const authorAvoidanceRelaxed = authorSafeCandidates.length === 0;
      if (!authorAvoidanceRelaxed) candidates = authorSafeCandidates;

      const selected = candidates[0];
      const selectedId = selected.content.id;
      const selectedTextKey = normalizeComparableText(selected.content.finalText);
      queue = queue.filter((id) => {
        const candidate = candidateById.get(id);
        return id !== selectedId && normalizeComparableText(candidate?.content.finalText) !== selectedTextKey;
      });
      queues.set(levelKey, queue);
      recentSelections.push({
        id: selectedId,
        textKey: selectedTextKey,
        authorKey: getContentAuthorKey(selected.content),
        format: selected.content.displayType,
      });
      recentSelections = recentSelections.slice(-RECENT_HISTORY_LIMIT);
      contextHistories.set(baseKey, [...contextHistory, {
        id: selectedId,
        editorialFunction: selected.content.editorialFunction,
        format: selected.content.displayType,
        authorKey: getContentAuthorKey(selected.content),
      }].slice(-CONTEXT_HISTORY_LIMIT));
      persist();
      return {
        content: selected.content,
        level: selected.level,
        reason: LEVEL_REASONS[selected.level],
        fallback: selected.level === 5,
        eligibleAtLevel: candidateById.size,
        contextSignals: inspection.signals,
        cycleRestarted,
        exactAvoidanceRelaxed,
        authorAvoidanceRelaxed,
        trajectoryStage: effectiveOptions.firstResponse ? 'initial' : (contextHistory.length < 3 ? 'recognition' : 'development'),
      };
    }

    function clear({ includeRecent = false } = {}) {
      queues.clear();
      contextHistories.clear();
      if (includeRecent) recentSelections = [];
      if (storage) {
        try {
          storage.removeItem(storageKey);
          storage.removeItem(contextHistoryStorageKey);
          if (includeRecent) storage.removeItem(recentStorageKey);
        } catch { /* opcional */ }
      }
    }

    function getRecentSelections() {
      return recentSelections.map((item) => ({ ...item }));
    }

    return { inspect, select, clear, getRecentSelections };
  }

  root.EntreSabiosRuntimeEngine = {
    LEVEL_REASONS,
    RECENT_AUTHOR_WINDOW,
    RECENT_CONTENT_WINDOW,
    classifyEditorialEffects,
    createSelector,
    getContextSignals,
    getSelectionLevel,
    rankEligibleContents,
  };
})(typeof window !== 'undefined' ? window : globalThis);

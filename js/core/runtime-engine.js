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
  const QUEUE_SELECTOR_SCHEMA_VERSION = 2;
  const QUEUE_ROTATION_POLICY_VERSION = 2;
  const DEVELOPED_FORMATS = new Set(['microtexto', 'reflexao_curta', 'citacao_longa']);
  const VULNERABLE_FEELINGS = new Set(['luto', 'tristeza', 'inseguranca', 'culpa', 'ansiedade', 'solidao']);
  const INTENSE_SAFETY_FEELINGS = new Set([
    ...VULNERABLE_FEELINGS, 'falta_de_proposito', 'raiva',
  ]);
  const INTENSE_PRESSURE_RISKS = new Set([
    'pressao_por_superacao', 'conselho_prematuro', 'culpabilizacao',
    'moralizacao', 'agressividade', 'romantizacao_do_sofrimento',
  ]);
  const INTENSE_FIRST_RESPONSE_FEELINGS = new Set(['falta_de_proposito', 'raiva']);
  const FEELING_THEME_KEYS = new Set([
    'ansiedade', 'medo', 'amor', 'saudade', 'esperanca', 'solidao', 'autoconhecimento',
    'confusao', 'inseguranca', 'raiva', 'culpa', 'luto', 'tristeza', 'falta de proposito',
  ]);

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

  function getComparableWords(value) {
    return new Set(normalizeComparableText(value)
      .split(' ')
      .filter((word) => word.length > 1)
      .map((word) => (word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word)));
  }

  function areNearDuplicateTexts(firstValue, secondValue) {
    const first = normalizeComparableText(firstValue);
    const second = normalizeComparableText(secondValue);
    if (!first || !second) return false;
    if (first === second) return true;
    const firstWords = getComparableWords(first);
    const secondWords = getComparableWords(second);
    const shortestSize = Math.min(firstWords.size, secondWords.size);
    if (shortestSize < 6) return false;
    const intersectionSize = [...firstWords].filter((word) => secondWords.has(word)).length;
    const unionSize = firstWords.size + secondWords.size - intersectionSize;
    const jaccard = intersectionSize / unionSize;
    const containment = intersectionSize / shortestSize;
    return jaccard >= 0.8 || (jaccard >= 0.68 && containment >= 0.85);
  }

  function getContentConceptKeys(content) {
    return [...new Set((content.themes || [])
      .map(normalizeComparableText)
      .filter((theme) => theme && !FEELING_THEME_KEYS.has(theme)))];
  }

  function getContentCanonicalKeys(content) {
    return [...new Set([
      `content:${content.canonicalContentId || content.duplicateOf || content.derivedFromId || content.id}`,
      content.sourceFragmentId ? `fragment:${content.sourceFragmentId}` : null,
    ].filter(Boolean))];
  }

  function hasCanonicalKey(content, canonicalKeys) {
    return getContentCanonicalKeys(content).some((key) => canonicalKeys.has(key));
  }

  function getCanonicalDiagnostic(content) {
    return {
      canonicalContentId: content.canonicalContentId || content.duplicateOf || content.derivedFromId || null,
      sourceFragmentId: content.sourceFragmentId || null,
      conceptGroup: content.conceptGroup || null,
    };
  }

  function getCandidateDiagnostic(candidate, state = null, { includeText = false } = {}) {
    const { content, level, synthesisCompatibility, motivationCompatibility } = candidate;
    const textKey = normalizeComparableText(content.finalText);
    const diagnostic = {
      id: content.id,
      author: content.displayedAuthor || content.author || 'Entre Sábios',
      authorKey: getContentAuthorKey(content),
      authorshipCategory: content.attributionType || content.authorshipType || content.sourceCategory || null,
      format: content.displayType || null,
      editorialFunction: content.editorialFunction || null,
      themes: [...(content.themes || [])],
      conceptKeys: getContentConceptKeys(content),
      ...getCanonicalDiagnostic(content),
      level,
      synthesisBonus: synthesisCompatibility || null,
      motivationBonus: motivationCompatibility || null,
      synthesisPreference: synthesisCompatibility || null,
      synthesisReduction: 0,
      motivationalPreference: motivationCompatibility || null,
      finalScore: {
        model: 'lexicographic',
        level,
        secondaryCompatibility: state ? getSecondaryCompatibility(content, state) : null,
        synthesisVector: synthesisCompatibility?.vector || [0, 0, 0],
        motivationVector: motivationCompatibility?.vector || [0, 0, 0],
      },
    };
    if (includeText) {
      diagnostic.text = content.finalText;
      diagnostic.normalizedText = textKey;
      diagnostic.normalizedTextHash = stableHash(textKey).toString(16).padStart(8, '0');
    }
    return diagnostic;
  }

  function hasRecentConcept(content, recentSelections) {
    const conceptKeys = getContentConceptKeys(content);
    if (!conceptKeys.length) return false;
    return recentSelections.some((item) => {
      const recentKeys = Array.isArray(item.conceptKeys)
        ? item.conceptKeys
        : [item.conceptKey].filter(Boolean);
      return conceptKeys.some((key) => recentKeys.includes(key));
    });
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
    if (/(tristeza|dor|sofrimento).*(define quem voce e|e quem voce e|sua identidade)/.test(text)) tags.add('turns_emotion_into_identity');
    if (/(solidao|sozinho|dor|sofrer|sofrimento|escuridao).*(superior|melhor que os outros|mais profundo|profundidade)/.test(text)) {
      tags.add('romanticizes_suffering');
    }
    if (/(aja|reaja|decida).*(agora|imediatamente).*(sem pensar|sem medir|sem considerar)/.test(text)) tags.add('encourages_impulsivity');
    if (/(merece|deve).*(carregar|sentir|sofrer|punir).*(culpa|culpado|punicao)/.test(text)
      || /culpa.*prova.*(mau|ruim|imperdoavel)/.test(text)) tags.add('increases_guilt');
    if (/(isso e exagero|nao deveria sentir|pare de sentir|nao ha motivo para sentir)/.test(text)) tags.add('invalidates_emotion');
    if (state.primaryFeeling === 'luto' && /(siga em frente|seguir em frente|supere|superar|deixe para tras)/.test(text)) {
      tags.add('risks_negative_reinforcement');
    }
    if (state.primaryFeeling === 'luto'
      && /(precisa encontrar sentido|aconteceu para (te )?ensinar|transforme a perda em (uma )?licao)/.test(text)) {
      tags.add('forces_meaning_on_grief');
    }

    const unsafeTags = new Set([
      'confirms_harmful_belief',
      'encourages_isolation',
      'justifies_resentment',
      'romanticizes_suffering',
      'encourages_impulsivity',
      'forces_meaning_on_grief',
      'increases_guilt',
      'invalidates_emotion',
      'turns_emotion_into_identity',
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
    if (options.firstResponse && state.intensity === 'intensa'
      && INTENSE_FIRST_RESPONSE_FEELINGS.has(state.primaryFeeling)
      && ['confrontation', 'action'].includes(content.editorialFunction)) safe = false;
    if (state.intensity === 'intensa' && INTENSE_SAFETY_FEELINGS.has(state.primaryFeeling)) {
      const pressureRisk = (content.riskTags || []).some((risk) => INTENSE_PRESSURE_RISKS.has(risk));
      const pressureFunction = ['confrontation', 'action'].includes(content.editorialFunction);
      if (pressureRisk || pressureFunction) {
        tags.add('unsafe_pressure_in_intense_state');
        safe = false;
      }
    }

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

  function getEligibilityExclusions(content, state, options = {}) {
    const signals = getContextSignals(state, options.firstResponse === true);
    const exclusions = [];
    if (content.publicationEnabled !== true) exclusions.push('publication_disabled');
    if (!['ATIVO_NUCLEO', 'ATIVO_CONTEXTUAL', 'ATIVO_GERAL', 'ATIVO_REFERENCIA_PENDENTE'].includes(content.status)) {
      exclusions.push('inactive_status');
    }
    if (!content.suitableIntensities.includes(state.intensity)) exclusions.push('unsuitable_intensity');
    if (isBlocked(content, signals)) exclusions.push('hard_exclusion');
    if (!classifyEditorialEffects(content, state, options).safe) exclusions.push('unsafe_editorial_effect');
    if (getSelectionLevel(content, state) === null) exclusions.push('outside_emotional_levels');
    return exclusions;
  }

  function rankEligibleContents(contents, state, options = {}) {
    const firstResponse = options.firstResponse === true;
    const signals = getContextSignals(state, firstResponse);
    const synthesisAdapter = options.synthesisAdapter || null;
    const synthesisContext = synthesisAdapter?.resolveState(state) || null;
    const motivationAdapter = options.motivationAdapter || null;
    const motivationContext = motivationAdapter?.resolveState(state) || null;
    return contents
      .filter((content) => content.publicationEnabled === true)
      .filter((content) => ['ATIVO_NUCLEO', 'ATIVO_CONTEXTUAL', 'ATIVO_GERAL', 'ATIVO_REFERENCIA_PENDENTE'].includes(content.status))
      .filter((content) => content.suitableIntensities.includes(state.intensity))
      .filter((content) => !isBlocked(content, signals))
      .filter((content) => classifyEditorialEffects(content, state, options).safe)
      .map((content) => {
        const candidate = { content, level: getSelectionLevel(content, state) };
        if (synthesisAdapter) candidate.synthesisCompatibility = synthesisAdapter.evaluate(content, synthesisContext);
        if (motivationAdapter) candidate.motivationCompatibility = motivationAdapter.evaluate(content, motivationContext);
        return candidate;
      })
      .filter((candidate) => candidate.level !== null)
      .sort((a, b) => a.level - b.level
        || getSecondaryCompatibility(b.content, state) - getSecondaryCompatibility(a.content, state)
        || synthesisAdapter?.compare(a.synthesisCompatibility, b.synthesisCompatibility)
        || motivationAdapter?.compare(a.motivationCompatibility, b.motivationCompatibility)
        || stableHash(`${state.primaryFeeling}:${state.intensity}:${a.content.id}`) - stableHash(`${state.primaryFeeling}:${state.intensity}:${b.content.id}`)
        || a.content.id.localeCompare(b.content.id, 'pt-BR'));
  }

  function contextKey(version, state) {
    return [version, state.primaryFeeling, ...(state.secondaryFeelings || []).slice().sort(), state.intensity].join('|');
  }

  function createSelector({
    version, contents, storage = null, synthesisAdapter = null, motivationAdapter = null,
  } = {}) {
    const contentById = new Map(contents.map((content) => [content.id, content]));
    const queues = new Map();
    const queueDirections = new Map();
    const contextHistories = new Map();
    const storageKey = `entreSabiosRuntimeQueues:${version}`;
    const queueDirectionStorageKey = `entreSabiosRuntimeQueueDirections:${version}`;
    const recentStorageKey = `entreSabiosRecentContent:${version}`;
    const contextHistoryStorageKey = `entreSabiosContextHistory:${version}`;
    const queueMetaStorageKey = `entreSabiosRuntimeQueueMeta:${version}`;
    let recentSelections = [];
    let queueStateCompatible = true;
    const queueRestoration = {
      contentVersion: version,
      selectorSchemaVersion: QUEUE_SELECTOR_SCHEMA_VERSION,
      rotationPolicyVersion: QUEUE_ROTATION_POLICY_VERSION,
      status: storage ? 'empty' : 'memory_only',
      queueParseError: false,
    };
    if (storage) {
      let savedMeta = {};
      const savedMetaRaw = storage.getItem(queueMetaStorageKey);
      const hasMeta = savedMetaRaw !== null;
      const persistedQueueStateExists = [
        storage.getItem(storageKey),
        storage.getItem(queueDirectionStorageKey),
        storage.getItem(contextHistoryStorageKey),
      ].some((value) => typeof value === 'string' && value.trim() && value.trim() !== '{}' && value.trim() !== '[]');
      try {
        if (savedMetaRaw) savedMeta = JSON.parse(savedMetaRaw) || {};
        queueStateCompatible = !persistedQueueStateExists || (hasMeta
          && savedMeta.contentVersion === version
          && savedMeta.selectorSchemaVersion === QUEUE_SELECTOR_SCHEMA_VERSION
          && savedMeta.rotationPolicyVersion === QUEUE_ROTATION_POLICY_VERSION);
        queueRestoration.status = !persistedQueueStateExists
          ? 'empty'
          : (queueStateCompatible ? 'compatible' : (hasMeta ? 'incompatible_invalidated' : 'missing_meta_invalidated'));
      } catch {
        queueStateCompatible = false;
        queueRestoration.status = 'corrupt_meta_invalidated';
      }
      if (queueStateCompatible) {
        try {
          const saved = JSON.parse(storage.getItem(storageKey) || '{}');
          Object.entries(saved).forEach(([key, ids]) => queues.set(key, Array.isArray(ids) ? ids : []));
        } catch {
          queueRestoration.queueParseError = true;
          queueRestoration.status = 'corrupt_queue_rebuilt';
        }
      } else {
        queues.clear();
        queueDirections.clear();
        contextHistories.clear();
        try {
          storage.removeItem(storageKey);
          storage.removeItem(queueDirectionStorageKey);
          storage.removeItem(contextHistoryStorageKey);
          storage.removeItem(queueMetaStorageKey);
        } catch { /* invalidação seletiva opcional */ }
      }
      try {
        const savedRecent = JSON.parse(storage.getItem(recentStorageKey) || '[]');
        if (Array.isArray(savedRecent)) {
          recentSelections = savedRecent
            .filter((item) => item && typeof item.id === 'string' && typeof item.textKey === 'string')
            .map((item) => ({
              ...item,
              canonicalKeys: Array.isArray(item.canonicalKeys)
                ? item.canonicalKeys
                : getContentCanonicalKeys(contentById.get(item.id) || { id: item.id }),
            }))
            .slice(-RECENT_HISTORY_LIMIT);
        }
      } catch {
        // O histórico recente continua disponível apenas em memória.
      }
      if (queueStateCompatible) {
        try {
          const savedDirections = JSON.parse(storage.getItem(queueDirectionStorageKey) || '{}');
          Object.entries(savedDirections).forEach(([key, direction]) => {
            if (['standard', 'motivated'].includes(direction)) queueDirections.set(key, direction);
          });
        } catch {
          // A direção da fila pode ser reconstruída sem afetar a elegibilidade.
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
    }

    function persist() {
      if (!storage) return;
      try {
        storage.setItem(storageKey, JSON.stringify(Object.fromEntries(queues)));
        storage.setItem(queueDirectionStorageKey, JSON.stringify(Object.fromEntries(queueDirections)));
        storage.setItem(recentStorageKey, JSON.stringify(recentSelections.slice(-RECENT_HISTORY_LIMIT)));
        storage.setItem(contextHistoryStorageKey, JSON.stringify(Object.fromEntries(contextHistories)));
        storage.setItem(queueMetaStorageKey, JSON.stringify({
          contentVersion: version,
          selectorSchemaVersion: QUEUE_SELECTOR_SCHEMA_VERSION,
          rotationPolicyVersion: QUEUE_ROTATION_POLICY_VERSION,
        }));
      } catch {
        // Persistência é opcional; nunca afeta a elegibilidade.
      }
    }

    function hasRecentSelectionMatch(candidate, recentEntries) {
      const textKey = normalizeComparableText(candidate.content.finalText);
      const candidateCanonicalKeys = new Set(getContentCanonicalKeys(candidate.content));
      return recentEntries.some((item) => item.id === candidate.content.id
        || item.textKey === textKey
        || (item.canonicalKeys || []).some((key) => candidateCanonicalKeys.has(key)));
    }

    function getLastSelectionIndex(candidate, recentEntries) {
      for (let index = recentEntries.length - 1; index >= 0; index -= 1) {
        if (hasRecentSelectionMatch(candidate, [recentEntries[index]])) return index;
      }
      return -1;
    }

    function getPermittedLevels(bestLevel) {
      if (bestLevel === null) return [];
      return bestLevel === 1 ? [1, 2] : [bestLevel];
    }

    function buildCandidateContract(ranked, state, { activeLevel, recentEntries = recentSelections } = {}) {
      const permittedLevels = getPermittedLevels(ranked[0]?.level ?? null);
      const permittedLevelSet = new Set(permittedLevels);
      const eligible = ranked.filter((candidate) => permittedLevelSet.has(candidate.level));
      const unseen = eligible.filter((candidate) => !hasRecentSelectionMatch(candidate, recentEntries));
      const recentlyBlocked = eligible.filter((candidate) => hasRecentSelectionMatch(candidate, recentEntries));
      return {
        permittedLevels,
        eligibleCandidates: eligible.map((candidate) => getCandidateDiagnostic(candidate, state)),
        activeTierCandidates: eligible.filter((candidate) => candidate.level === activeLevel)
          .map((candidate) => getCandidateDiagnostic(candidate, state)),
        unseenEligibleCandidates: unseen.map((candidate) => getCandidateDiagnostic(candidate, state)),
        recentlyBlockedCandidates: recentlyBlocked.map((candidate) => getCandidateDiagnostic(candidate, state)),
        repeatAllowed: false,
        repeatReason: null,
      };
    }

    function inspect(state, options = {}) {
      const ranked = rankEligibleContents(contents, state, { ...options, synthesisAdapter, motivationAdapter });
      const bestLevel = ranked[0]?.level ?? null;
      const eligibleAtLevel = ranked.filter((candidate) => candidate.level === bestLevel);
      const synthesisContext = synthesisAdapter?.resolveState(state) || null;
      const motivationContext = motivationAdapter?.resolveState(state) || null;
      const candidateContract = buildCandidateContract(ranked, state, { activeLevel: bestLevel });
      let diagnostics = null;
      if (options.diagnostics === true) {
        const beforeSynthesis = synthesisAdapter
          ? rankEligibleContents(contents, state, {
            ...options, diagnostics: false, synthesisAdapter: null, motivationAdapter: null,
          })
          : ranked;
        diagnostics = {
          input: {
            primaryFeeling: state.primaryFeeling,
            secondaryFeelings: [...(state.secondaryFeelings || [])],
            intensity: state.intensity,
            needsMotivation: state.needsMotivation === true,
            directionalKey: state.directionalKey || state.selectionContract?.directionalKey || null,
          },
          rawCandidates: contents.map((content) => ({ id: content.id })),
          candidatesBeforeSynthesis: beforeSynthesis.map((candidate) => getCandidateDiagnostic(candidate, state)),
          candidatesAfterSynthesis: ranked.map(({
            content, level, synthesisCompatibility, motivationCompatibility,
          }) => getCandidateDiagnostic({ content, level, synthesisCompatibility, motivationCompatibility }, state)),
          ...candidateContract,
          eligibleAtLevel: eligibleAtLevel.map((candidate) => getCandidateDiagnostic(candidate, state)),
          excludedCandidates: contents.map((content) => ({
            id: content.id,
            reasons: getEligibilityExclusions(content, state, options),
          })).filter((item) => item.reasons.length > 0),
        };
      }
      return {
        ranked,
        bestLevel,
        eligibleAtLevel,
        signals: [...getContextSignals(state, options.firstResponse === true)],
        synthesis: synthesisAdapter?.describeContext(synthesisContext) || null,
        motivation: motivationAdapter?.describeContext(motivationContext) || null,
        motivationFallback: Boolean(motivationAdapter) && state.needsMotivation === true
          && !ranked.some((candidate) => (
            candidate.level === bestLevel && candidate.motivationCompatibility?.strongMatch
          )),
        diagnostics,
      };
    }

    function select(state, options = {}) {
      const baseKey = contextKey(version, state);
      const contextHistory = contextHistories.get(baseKey) || [];
      const globalHistoryBefore = recentSelections.map((item) => ({ ...item }));
      const contextHistoryBefore = contextHistory.map((item) => ({ ...item }));
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
      const recentCanonicalKeys = new Set(recentContents.flatMap((item) => item.canonicalKeys || []));
      const cycleIds = new Set(recentSelections.map((item) => item.id));
      const cycleTextKeys = new Set(recentSelections.map((item) => item.textKey));
      const cycleCanonicalKeys = new Set(recentSelections.flatMap((item) => item.canonicalKeys || []));
      const lastSelection = recentSelections.at(-1);
      const hasNotBeenSeenInCycle = ({ content }) => {
        const textKey = normalizeComparableText(content.finalText);
        return !cycleIds.has(content.id)
          && !cycleTextKeys.has(textKey)
          && !hasCanonicalKey(content, cycleCanonicalKeys);
      };
      const hasNotBeenRecentlySeen = ({ content }) => {
        const textKey = normalizeComparableText(content.finalText);
        return !recentIds.has(content.id)
          && !recentTextKeys.has(textKey)
          && !hasCanonicalKey(content, recentCanonicalKeys);
      };
      const primaryProgressionLevels = getPermittedLevels(inspection.bestLevel);
      const permittedLevelSet = new Set(primaryProgressionLevels);
      const territoryCandidates = inspection.ranked.filter(({ level }) => permittedLevelSet.has(level));
      const unseenTerritoryCandidates = territoryCandidates.filter(hasNotBeenSeenInCycle);
      const territoryCycleExhausted = unseenTerritoryCandidates.length === 0;
      const cycleUnseenLevel = primaryProgressionLevels.find((level) => inspection.ranked.some((candidate) => (
        candidate.level === level && hasNotBeenSeenInCycle(candidate)
      )));
      const candidatesOtherThanCurrent = territoryCandidates.filter((candidate) => (
        !lastSelection || !hasRecentSelectionMatch(candidate, [lastSelection])
      ));
      const repeatCandidates = candidatesOtherThanCurrent.length ? candidatesOtherThanCurrent : territoryCandidates;
      const leastRecentCandidate = territoryCycleExhausted
        ? repeatCandidates.slice().sort((left, right) => (
          getLastSelectionIndex(left, globalHistoryBefore) - getLastSelectionIndex(right, globalHistoryBefore)
        ))[0] || null
        : null;
      const activeLevel = cycleUnseenLevel ?? leastRecentCandidate?.level ?? inspection.bestLevel;
      const levelCandidates = inspection.ranked.filter((candidate) => candidate.level === activeLevel);
      const eligibleIds = levelCandidates.map((candidate) => candidate.content.id);
      const levelKey = `${key}::level:${activeLevel}`;
      const storedQueueBefore = [...(queues.get(levelKey) || [])];
      let queue = storedQueueBefore.filter((id) => eligibleIds.includes(id));
      const removedMissingIds = storedQueueBefore.filter((id) => !contentById.has(id));
      const removedIneligibleIds = storedQueueBefore.filter((id) => contentById.has(id) && !eligibleIds.includes(id));
      const preservedQueueIds = [...queue];
      const queueDirection = state.needsMotivation === true ? 'motivated' : 'standard';
      const previousQueueDirection = queueDirections.get(levelKey);
      const motivationDirectionChanged = Boolean(previousQueueDirection && previousQueueDirection !== queueDirection);
      if (motivationDirectionChanged && queue.length) {
        const remainingIds = new Set(queue);
        queue = buildCadencedQueue(levelCandidates).filter((id) => remainingIds.has(id));
      }
      queueDirections.set(levelKey, queueDirection);
      const unseenLevelIds = new Set(levelCandidates
        .filter(hasNotBeenSeenInCycle)
        .map(({ content }) => content.id));
      const recentUnseenLevelIds = new Set(levelCandidates
        .filter(hasNotBeenRecentlySeen)
        .map(({ content }) => content.id));
      const freshLevelIds = unseenLevelIds.size ? unseenLevelIds : recentUnseenLevelIds;
      const orderedLevelIds = buildCadencedQueue(levelCandidates);
      const appendedEligibleIds = [];
      if (freshLevelIds.size) {
        queue = queue.filter((id) => freshLevelIds.has(id));
        orderedLevelIds.forEach((id) => {
          if (freshLevelIds.has(id) && !queue.includes(id)) {
            queue.push(id);
            appendedEligibleIds.push(id);
          }
        });
      }
      const cycleRestarted = queue.length === 0;
      if (cycleRestarted) {
        queue = orderedLevelIds;
        orderedLevelIds.forEach((id) => {
          if (!preservedQueueIds.includes(id) && !appendedEligibleIds.includes(id)) appendedEligibleIds.push(id);
        });
      }
      const activeQueueBeforeSelection = [...queue];
      const candidateById = new Map(levelCandidates.map((candidate) => [candidate.content.id, candidate]));
      const candidateContract = buildCandidateContract(inspection.ranked, state, {
        activeLevel,
        recentEntries: globalHistoryBefore,
      });
      const queuedCandidates = territoryCycleExhausted && leastRecentCandidate
        ? [leastRecentCandidate]
        : queue.map((id) => candidateById.get(id)).filter(Boolean);
      let candidates = queuedCandidates.filter(({ content }) => {
        const textKey = normalizeComparableText(content.finalText);
        return !recentIds.has(content.id)
          && !recentTextKeys.has(textKey)
          && !hasCanonicalKey(content, recentCanonicalKeys);
      });
      const repetitionRemovedIds = queuedCandidates
        .filter((candidate) => !candidates.includes(candidate))
        .map(({ content }) => content.id);
      const exactAvoidanceRelaxed = candidates.length === 0;
      if (exactAvoidanceRelaxed) {
        candidates = queuedCandidates.filter(({ content }) => {
          const textKey = normalizeComparableText(content.finalText);
          const lastCanonicalKeys = new Set(lastSelection?.canonicalKeys || []);
          return content.id !== lastSelection?.id
            && textKey !== lastSelection?.textKey
            && !hasCanonicalKey(content, lastCanonicalKeys);
        });
        if (!candidates.length) candidates = queuedCandidates;
        candidates = candidates.slice().sort((a, b) => {
          const getRecency = ({ content }) => {
            const textKey = normalizeComparableText(content.finalText);
            const canonicalKeys = new Set(getContentCanonicalKeys(content));
            const index = recentContents.findIndex((item) => item.id === content.id
              || item.textKey === textKey
              || (item.canonicalKeys || []).some((key) => canonicalKeys.has(key)));
            return index < 0 ? -1 : index;
          };
          return getRecency(a) - getRecency(b);
        });
      }

      const nearDuplicateSafeCandidates = candidates.filter(({ content }) => !recentContents.some((item) => (
        areNearDuplicateTexts(content.finalText, item.textKey)
      )));
      const nearDuplicatePenalizedIds = candidates
        .filter((candidate) => !nearDuplicateSafeCandidates.includes(candidate))
        .map(({ content }) => content.id);
      const nearDuplicateAvoidanceRelaxed = nearDuplicateSafeCandidates.length === 0;
      if (!nearDuplicateAvoidanceRelaxed) candidates = nearDuplicateSafeCandidates;

      const conceptSafeCandidates = candidates.filter(({ content }) => !hasRecentConcept(content, recentContents));
      const conceptPenalizedIds = candidates
        .filter((candidate) => !conceptSafeCandidates.includes(candidate))
        .map(({ content }) => content.id);
      const conceptAvoidanceRelaxed = conceptSafeCandidates.length === 0;
      if (!conceptAvoidanceRelaxed) candidates = conceptSafeCandidates;

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

      const recentAuthors = recentSelections.slice(-(RECENT_AUTHOR_WINDOW - 1));
      const recentAuthorCounts = recentAuthors.reduce((counts, item) => {
        counts.set(item.authorKey, (counts.get(item.authorKey) || 0) + 1);
        return counts;
      }, new Map());
      const recentAuthorKeys = new Set(recentAuthors.map((item) => item.authorKey));
      const authorFreshCandidates = candidates.filter(({ content }) => !recentAuthorKeys.has(getContentAuthorKey(content)));
      const authorPenalizedIds = candidates
        .filter((candidate) => !authorFreshCandidates.includes(candidate))
        .map(({ content }) => content.id);
      const authorFreshnessRelaxed = authorFreshCandidates.length === 0;
      if (!authorFreshnessRelaxed) candidates = authorFreshCandidates;
      const authorSafeCandidates = candidates.filter(({ content }) => (recentAuthorCounts.get(getContentAuthorKey(content)) || 0) < 2);
      const authorAvoidanceRelaxed = authorSafeCandidates.length === 0;
      if (!authorAvoidanceRelaxed) candidates = authorSafeCandidates;

      const selected = candidates[0];
      const selectedId = selected.content.id;
      const selectedTextKey = normalizeComparableText(selected.content.finalText);
      const selectedCanonicalKeys = getContentCanonicalKeys(selected.content);
      const selectedCanonicalKeySet = new Set(selectedCanonicalKeys);
      queue = queue.filter((id) => {
        const candidate = candidateById.get(id);
        return id !== selectedId
          && normalizeComparableText(candidate?.content.finalText) !== selectedTextKey
          && !getContentCanonicalKeys(candidate.content).some((key) => selectedCanonicalKeySet.has(key));
      });
      queues.set(levelKey, queue);
      recentSelections.push({
        id: selectedId,
        textKey: selectedTextKey,
        canonicalKeys: selectedCanonicalKeys,
        authorKey: getContentAuthorKey(selected.content),
        conceptKeys: getContentConceptKeys(selected.content),
        format: selected.content.displayType,
      });
      recentSelections = recentSelections.slice(-RECENT_HISTORY_LIMIT);
      contextHistories.set(baseKey, [...contextHistory, {
        id: selectedId,
        editorialFunction: selected.content.editorialFunction,
        format: selected.content.displayType,
        authorKey: getContentAuthorKey(selected.content),
      }].slice(-CONTEXT_HISTORY_LIMIT));
      const globalHistoryAfter = recentSelections.map((item) => ({ ...item }));
      const contextHistoryAfter = (contextHistories.get(baseKey) || []).map((item) => ({ ...item }));
      persist();
      const selectedWasPreviouslySeen = hasRecentSelectionMatch(selected, globalHistoryBefore);
      const safeUnseenOutsideQueue = levelCandidates.filter(({ content }) => {
        const textKey = normalizeComparableText(content.finalText);
        return !activeQueueBeforeSelection.includes(content.id)
          && !recentIds.has(content.id)
          && !recentTextKeys.has(textKey)
          && !hasCanonicalKey(content, recentCanonicalKeys);
      });
      const repeatAllowed = selectedWasPreviouslySeen
        && candidateContract.unseenEligibleCandidates.length === 0;
      const repeatReason = repeatAllowed
        ? 'all_allowed_candidates_exhausted'
        : (selectedWasPreviouslySeen ? 'unseen_allowed_candidates_remain' : null);
      return {
        content: selected.content,
        level: selected.level,
        reason: LEVEL_REASONS[selected.level],
        fallback: selected.level === 5,
        eligibleAtLevel: candidateById.size,
        contextSignals: inspection.signals,
        cycleRestarted,
        exactAvoidanceRelaxed,
        nearDuplicateAvoidanceRelaxed,
        conceptAvoidanceRelaxed,
        authorFreshnessRelaxed,
        authorAvoidanceRelaxed,
        synthesis: inspection.synthesis,
        synthesisCompatibility: selected.synthesisCompatibility || null,
        motivation: inspection.motivation,
        motivationCompatibility: selected.motivationCompatibility || null,
        motivationFallback: inspection.motivationFallback,
        motivationDirectionChanged,
        diagnostics: inspection.diagnostics ? {
          ...inspection.diagnostics,
          timestamp: options.diagnosticContext?.timestamp || new Date().toISOString(),
          eventTrigger: options.diagnosticContext?.eventTrigger || 'unknown',
          sessionSelectionCounter: options.diagnosticContext?.sessionSelectionCounter || null,
          currentContentId: options.diagnosticContext?.currentContentId || null,
          queueKey: levelKey,
          queueVersion: version,
          bestLevel: inspection.bestLevel,
          activeLevel,
          ...candidateContract,
          territoryCycle: {
            scope: 'global_session_allowed_territory',
            permittedLevels: [...primaryProgressionLevels],
            eligibleCount: territoryCandidates.length,
            unseenCount: unseenTerritoryCandidates.length,
            exhausted: territoryCycleExhausted,
            currentContentExcluded: Boolean(lastSelection && candidatesOtherThanCurrent.length),
          },
          leastRecentCandidateId: leastRecentCandidate?.content.id || null,
          levelProgressionReason: territoryCycleExhausted
            ? 'allowed_territory_exhausted_least_recent_repeat'
            : (activeLevel === inspection.bestLevel
              ? 'best_level_has_unseen_content'
              : 'best_level_exhausted_progressed_within_primary_feeling'),
          queueDirection,
          previousQueueDirection: previousQueueDirection || null,
          queueRestoration: { ...queueRestoration },
          queueReconciliation: {
            preservedIds: preservedQueueIds,
            removedMissingIds,
            removedIneligibleIds,
            appendedEligibleIds,
          },
          storedQueueBefore,
          activeQueueBeforeSelection,
          queueAfterSelection: [...queue],
          globalHistoryBefore,
          contextHistoryBefore,
          globalHistoryAfter,
          contextHistoryAfter,
          recentBeforeSelection: recentContents.map((item) => ({ ...item })),
          removedBySafety: inspection.diagnostics.excludedCandidates
            .filter(({ reasons }) => reasons.includes('unsafe_editorial_effect') || reasons.includes('hard_exclusion')),
          removedByPrimary: inspection.diagnostics.candidatesAfterSynthesis
            .filter(({ level }) => level !== inspection.bestLevel)
            .map(({ id, level }) => ({ id, level })),
          removedByIntensity: inspection.diagnostics.excludedCandidates
            .filter(({ reasons }) => reasons.includes('unsuitable_intensity')),
          removedByRepetition: repetitionRemovedIds,
          penalizedByNearDuplicate: nearDuplicatePenalizedIds,
          penalizedByConcept: conceptPenalizedIds,
          penalizedByAuthor: authorPenalizedIds,
          safeUnseenOutsideActiveQueue: safeUnseenOutsideQueue
            .map((candidate) => getCandidateDiagnostic(candidate, state)),
          repeatAllowed,
          repeatReason,
          repeatProof: repeatAllowed ? {
            eligibleCount: candidateContract.unseenEligibleCandidates.length,
            safeCandidatesChecked: territoryCandidates.length,
            nextTierCandidatesChecked: territoryCandidates
              .filter(({ level }) => level !== inspection.bestLevel).length,
            leastRecentCandidateId: leastRecentCandidate?.content.id || null,
          } : null,
          chosen: {
            ...getCandidateDiagnostic(selected, state, { includeText: true }),
            finalReason: LEVEL_REASONS[selected.level],
          },
        } : null,
        trajectoryStage: effectiveOptions.firstResponse ? 'initial' : (contextHistory.length < 3 ? 'recognition' : 'development'),
      };
    }

    function clear({ includeRecent = false } = {}) {
      queues.clear();
      queueDirections.clear();
      contextHistories.clear();
      if (includeRecent) recentSelections = [];
      if (storage) {
        try {
          storage.removeItem(storageKey);
          storage.removeItem(queueDirectionStorageKey);
          storage.removeItem(contextHistoryStorageKey);
          storage.removeItem(queueMetaStorageKey);
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
    QUEUE_ROTATION_POLICY_VERSION,
    QUEUE_SELECTOR_SCHEMA_VERSION,
    RECENT_AUTHOR_WINDOW,
    RECENT_CONTENT_WINDOW,
    areNearDuplicateTexts,
    classifyEditorialEffects,
    createSelector,
    getContentConceptKeys,
    getContentCanonicalKeys,
    getContextSignals,
    getSelectionLevel,
    rankEligibleContents,
  };
})(typeof window !== 'undefined' ? window : globalThis);

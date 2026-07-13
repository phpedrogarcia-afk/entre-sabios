// Taxonomia editorial usada para classificar relevância antes de qualquer refinamento.
(function initEmotionalTaxonomy(root) {
  const data = root.EntreSabiosData = root.EntreSabiosData || {};

  const family = (weight, specificity, themes) => ({ weight, specificity, themes });

  data.emotionalTaxonomy = {
    ansiedade: { families: {
      antecipacao: family(3, 'high', ['ansiedade', 'antecipacao', 'futuro', 'pensamento_acelerado', 'preocupacao']),
      controle: family(2, 'medium', ['controle', 'controle_emocional', 'incerteza']),
      regulacao: family(1, 'low', ['respiracao', 'acolhimento', 'regulacao_emocional']),
    } },
    medo: { families: {
      ameaca: family(3, 'high', ['medo', 'perigo', 'ameaca', 'terror']),
      evitacao: family(2, 'medium', ['fuga', 'evitacao', 'paralisia', 'prudencia']),
      coragem: family(2, 'medium', ['coragem', 'enfrentamento', 'acao']),
    } },
    amor: { families: {
      vinculo: family(3, 'high', ['amor', 'vinculo', 'intimidade', 'cuidado']),
      apego: family(2, 'medium', ['apego', 'posse', 'medo_de_perda']),
      reciprocidade: family(2, 'medium', ['reciprocidade', 'relacao', 'liberdade_no_amor']),
    } },
    saudade: { families: {
      ausencia: family(3, 'high', ['saudade', 'ausencia', 'distancia']),
      memoria: family(2, 'medium', ['memoria', 'lembranca', 'passado']),
      vinculo: family(2, 'medium', ['vinculo', 'despedida', 'continuidade']),
    } },
    esperanca: { families: {
      possibilidade: family(3, 'high', ['esperanca', 'possibilidade', 'recomeco']),
      sentido: family(2, 'medium', ['proposito', 'significado', 'sentido']),
      perseveranca: family(2, 'medium', ['persistencia', 'superacao', 'resiliencia']),
    } },
    solidao: { families: {
      isolamento: family(3, 'high', ['solidao', 'isolamento', 'desconexao']),
      pertencimento: family(2, 'medium', ['pertencimento', 'conexao', 'companhia']),
      solitude: family(2, 'medium', ['solitude', 'introspeccao', 'autenticidade']),
    } },
    confusao: { families: {
      desorientacao: family(3, 'high', ['confusao', 'duvida', 'desorientacao', 'caos']),
      clareza: family(2, 'medium', ['clareza', 'discernimento', 'investigacao']),
      ambiguidade: family(2, 'medium', ['ambiguidade', 'incerteza', 'misterio']),
    } },
    autoconhecimento: { families: {
      investigacao_do_eu: family(3, 'high', ['autoconhecimento', 'investigacao_do_eu', 'conhece_te_a_ti']),
      identidade: family(2, 'medium', ['identidade', 'autoimagem', 'eu']),
      sombra: family(2, 'medium', ['sombra', 'projecao', 'individuacao']),
    } },
    inseguranca: { families: {
      autovalor: family(3, 'high', ['inseguranca', 'inadequacao', 'inferioridade', 'baixa_autoestima', 'nao_se_sentir_suficiente']),
      julgamento: family(3, 'high', ['medo_de_julgamento', 'necessidade_de_aprovacao', 'aprovacao_externa', 'vergonha_social', 'autojulgamento']),
      comparacao: family(2, 'medium', ['comparacao', 'sentimento_de_inferioridade']),
      rejeicao: family(2, 'medium', ['rejeicao', 'medo_de_rejeicao', 'medo_de_errar']),
      identidade: family(2, 'medium', ['autoimagem', 'identidade', 'pertencimento']),
      vulnerabilidade: family(1, 'low', ['vulnerabilidade', 'incerteza', 'duvida', 'julgamento']),
    } },
    raiva: { families: {
      violacao: family(3, 'high', ['raiva', 'injustica', 'ofensa', 'agressividade']),
      limites: family(2, 'medium', ['limites', 'dignidade', 'respeito']),
      ressentimento: family(2, 'medium', ['ressentimento', 'indiretas', 'vinganca']),
    } },
    culpa: { families: {
      responsabilidade: family(3, 'high', ['culpa', 'responsabilidade', 'erro', 'remorso']),
      reparacao: family(2, 'medium', ['reparacao', 'perdao', 'restituicao']),
      autojulgamento: family(2, 'medium', ['autojulgamento', 'vergonha', 'autocompaixao']),
    } },
    luto: { families: {
      perda: family(3, 'high', ['luto', 'perda', 'morte', 'ausencia']),
      despedida: family(2, 'medium', ['despedida', 'saudade', 'memoria']),
      continuidade: family(2, 'medium', ['continuidade', 'vinculo', 'legado']),
    } },
    tristeza: { families: {
      sofrimento: family(3, 'high', ['tristeza', 'sofrimento', 'dor', 'melancolia']),
      desalento: family(2, 'medium', ['desalento', 'desanimo', 'vazio']),
      recomposicao: family(2, 'medium', ['consolo', 'acolhimento', 'autocompaixao']),
    } },
    falta_de_proposito: { families: {
      sentido: family(3, 'high', ['falta_de_proposito', 'proposito', 'sentido', 'significado']),
      direcao: family(2, 'medium', ['direcao', 'vocacao', 'escolha']),
      absurdo: family(2, 'medium', ['absurdo', 'niilismo', 'vazio_existencial']),
    } },
  };

  data.genericRelevanceThemes = [
    'aceitacao', 'silencio', 'presenca', 'observacao', 'equilibrio', 'sabedoria',
    'espiritualidade', 'contemplacao', 'atencao', 'compreensao', 'acao_consciente',
  ];

  data.editorialSafetyMatrix = [
    { feelings: ['luto'], intensities: ['intensa'], hardBlock: ['desprezo_pela_vulnerabilidade', 'humilhacao', 'invalidacao_emocional', 'romantizacao_do_sofrimento'] },
    { feelings: ['tristeza'], intensities: ['intensa'], hardBlock: ['desesperanca_absoluta', 'humilhacao', 'invalidacao_emocional'] },
    { feelings: ['inseguranca'], intensities: ['intensa'], hardBlock: ['humilhacao', 'desprezo_pela_vulnerabilidade'], softPenalty: ['pressao_por_superacao_imediata', 'agressividade'] },
    { feelings: ['ansiedade', 'medo'], intensities: ['intensa'], hardBlock: ['fatalismo'], softPenalty: ['agressividade', 'pressao_por_superacao_imediata'] },
    { feelings: ['culpa'], intensities: ['intensa'], hardBlock: ['culpabilizador', 'humilhacao'], softPenalty: ['fatalismo'] },
  ];
})(typeof window !== 'undefined' ? window : globalThis);

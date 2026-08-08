// Direções editoriais locais para a preferência opcional de motivação.
// Usam somente metadados já existentes e nunca criam conteúdo ou elegibilidade.
(function initMotivationProfiles(root) {
  const data = root.EntreSabiosData = root.EntreSabiosData || {};
  const profile = (themes, editorialFunctions, tones) => ({
    preferredThemes: themes,
    preferredEditorialFunctions: editorialFunctions,
    preferredTones: tones,
    status: 'reviewed',
  });

  data.motivationProfiles = Object.freeze({
    version: '1.0.0',
    minimumIndependentSignals: 2,
    defaultProfile: profile(
      ['esperanca', 'continuidade', 'escolha', 'sentido'],
      ['grounding', 'reframing', 'inquiry'],
      ['acolhedor', 'direto', 'contemplativo']
    ),
    primaryProfiles: Object.freeze({
      inseguranca: profile(
        ['inseguranca', 'escolha', 'identidade', 'coragem'],
        ['recognition', 'clarification', 'reframing'],
        ['acolhedor', 'direto', 'analitico']
      ),
      falta_de_proposito: profile(
        ['sentido', 'escolha', 'continuidade', 'falta_de_proposito'],
        ['clarification', 'inquiry', 'reframing'],
        ['acolhedor', 'direto', 'analitico']
      ),
      tristeza: profile(
        ['tristeza', 'continuidade', 'corpo', 'esperanca'],
        ['grounding', 'recognition', 'contemplation', 'reframing'],
        ['acolhedor', 'contemplativo']
      ),
      luto: profile(
        ['luto', 'continuidade', 'vinculo', 'memoria'],
        ['recognition', 'contemplation', 'grounding'],
        ['acolhedor', 'contemplativo']
      ),
      raiva: profile(
        ['raiva', 'escolha', 'corpo', 'limites'],
        ['clarification', 'reframing', 'grounding'],
        ['direto', 'analitico', 'acolhedor']
      ),
      ansiedade: profile(
        ['ansiedade', 'corpo', 'escolha', 'futuro'],
        ['grounding', 'clarification', 'reframing'],
        ['acolhedor', 'analitico', 'contemplativo']
      ),
    }),
  });
})(typeof window !== 'undefined' ? window : globalThis);

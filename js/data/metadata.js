// Dados extraídos de script.js durante a Fase 2 da refatoração segura.
// Não alterar conteúdo editorial nesta fase.
(function initEntreSabiosData(root) {
  const data = root.EntreSabiosData = root.EntreSabiosData || {};

data.verifiedQuoteMetadata = {
  'Eu não devo ter medo. O medo é o assassino da mente.': {
    author: 'Frank Herbert',
    source: 'Duna · Litania contra o medo (trecho curto)',
  },
  'Não são as coisas que perturbam, mas as ideias que fazemos delas.': {
    author: 'Epicteto',
    source: 'Manual, capítulo 5',
  },
  'A ansiedade é a vertigem da liberdade.': {
    author: 'Kierkegaard',
    source: 'O Conceito de Angústia',
  },
  'A vida só pode ser compreendida olhando-se para trás; mas só pode ser vivida olhando-se para frente.': {
    author: 'Kierkegaard',
    source: 'Diários, 1843 (tradução corrente)',
  },
  'O essencial é invisível aos olhos: mora na quietude.': {
    author: 'Antoine de Saint-Exupéry',
    type: 'inspired',
  },
  'Uma vida sem exame perde a chance de se tornar consciente.': {
    author: 'Sócrates',
    source: 'Apologia de Sócrates, 38a (ideia traduzida)',
    type: 'inspired',
  },
  'Quem tem um porquê enfrenta qualquer como.': {
    author: 'Nietzsche',
    source: 'Crepúsculo dos Ídolos, Máximas e Flechas, 12 (tradução corrente)',
  },
};

data.authorToneProfiles = {
  acolhedor: ['Clarice Lispector', 'Rumi', 'Simone Weil', 'Maya Angelou', 'Viktor Frankl', 'Buda — Sutta Nipata'],
  direto: ['Marco Aurélio', 'Epicteto', 'Sêneca', 'Frank Herbert', 'Bhagavad Gita', 'Confúcio', 'Ptahhotep'],
  confrontador: ['Nietzsche', 'Osho', 'Steve Jobs'],
  analítico: ['Platão', 'Sócrates', 'Aristóteles', 'Carl Jung', 'Hannah Arendt', 'Heráclito'],
  acolhedor_dissolvente: ['Nisargadatta Maharaj'],
  cruel_lucido: ['Chögyam Trungpa'],
};

data.toneFamilies = {
  acolhedor_dissolvente: 'acolhedor',
  poetico_melancolico: 'poético',
  cruel_lucido: 'confrontador',
  xamanico_ancestral: 'contemplativo',
  erotico_devocional: 'poético',
  clinico_compassivo: 'acolhedor',
};

data.textThemeKeywords = {
  futuro: ['futuro', 'amanhã', 'antecipação'],
  controle: ['controle', 'controlar', 'depende de você'],
  observação: ['observar', 'perceber', 'atenção'],
  acolhimento: ['acolher', 'cuidado', 'gentileza', 'compaixão'],
  'pensamento acelerado': ['pressa', 'imaginação', 'mente'],
  limites: ['limite', 'dignidade', 'respeito'],
  responsabilidade: ['responsabilidade', 'responder', 'escolha'],
  reparação: ['reparar', 'perdoar', 'culpa'],
  'autocompaixão': ['autocompaixão', 'não se culpar', 'gentil'],
  pertencimento: ['solidão', 'conexão', 'juntos'],
  desapego: ['desapego', 'soltar', 'resultado'],
  clareza: ['clareza', 'verdade', 'compreender'],
  sentido: ['sentido', 'propósito', 'porquê'],
  'ação consciente': ['agir', 'ação', 'próximo passo'],
  insegurança: ['insegurança', 'inseguro', 'insegura', 'inadequação'],
  comparação: ['comparação', 'comparar', 'comparando'],
  autoimagem: ['autoimagem', 'imagem de si', 'imagem'],
  aprovação: ['aprovação', 'validar', 'validação', 'aplauso'],
  julgamento: ['julgamento', 'julgar', 'julgado', 'julgada'],
  rejeição: ['rejeição', 'rejeitado', 'rejeitada'],
};
})(typeof window !== 'undefined' ? window : globalThis);

// Propostas editoriais locais para a síntese emocional e filosófica.
// Primeiro lote aprovado editorialmente após a Fase 3.
(function initEmotionalSyntheses(root) {
  const data = root.EntreSabiosData = root.EntreSabiosData || {};

  const signal = (themes, editorialFunctions = [], tones = []) => ({ themes, editorialFunctions, tones });
  const reviewed = (id, primaryFeeling, secondaryFeelings, humanSummary, hiddenThemes, preferredExistingSignals, editorialRationale, confidence = 'medium', ambiguity = 'medium') => ({
    id,
    primaryFeeling,
    secondaryFeelings,
    humanSummary,
    hiddenThemes,
    preferredExistingSignals,
    confidence,
    ambiguity,
    editorialRationale,
    status: 'reviewed',
  });
  const reviewedPhase10 = (...args) => ({
    ...reviewed(...args),
    editorialReview: {
      catalogVersion: '1.1.0',
      proposalAuthor: 'Codex (OpenAI)',
      humanReviewer: 'Pedro',
      approvedOn: '2026-07-14',
      source: 'PROPOSTAS_SINTESES_FASE_10_LOTE_2.md',
    },
  });

  data.emotionalSyntheses = {
    version: '1.1.0',
    primaryProfiles: {
      ansiedade: { focusThemes: ['ansiedade', 'antecipacao', 'controle'], status: 'reviewed' },
      medo: { focusThemes: ['medo', 'vulnerabilidade', 'protecao'], status: 'reviewed' },
      amor: { focusThemes: ['amor', 'vinculo', 'proximidade'], status: 'reviewed' },
      saudade: { focusThemes: ['saudade', 'memoria', 'distancia'], status: 'reviewed' },
      esperanca: { focusThemes: ['esperanca', 'possibilidade', 'continuidade'], status: 'reviewed' },
      solidao: { focusThemes: ['solidao', 'pertencimento', 'conexao'], status: 'reviewed' },
      confusao: { focusThemes: ['confusao', 'clareza', 'duvida'], status: 'reviewed' },
      autoconhecimento: { focusThemes: ['autoconhecimento', 'identidade', 'observacao'], status: 'reviewed' },
      inseguranca: { focusThemes: ['inseguranca', 'autoimagem', 'validacao'], status: 'reviewed' },
      raiva: { focusThemes: ['raiva', 'limites', 'dignidade'], status: 'reviewed' },
      culpa: { focusThemes: ['culpa', 'responsabilidade', 'reparacao'], status: 'reviewed' },
      luto: { focusThemes: ['luto', 'perda', 'ausencia'], status: 'reviewed' },
      tristeza: { focusThemes: ['tristeza', 'sofrimento', 'acolhimento'], status: 'reviewed' },
      falta_de_proposito: { focusThemes: ['proposito', 'sentido', 'direcao'], status: 'reviewed' },
    },
    directionalPairs: {
      autoconhecimento__confusao: reviewed(
        'autoconhecimento__confusao', 'autoconhecimento', ['confusao'],
        'Talvez compreender a si mesmo esteja difícil porque as dúvidas mudam antes que uma resposta consiga se firmar.',
        ['identidade', 'necessidadeDeClareza'], signal(['autoconhecimento', 'identidade', 'clareza', 'observacao'], ['inquiry', 'clarification']),
        'Mantém o autoconhecimento no centro e trata a confusão como dificuldade de organizar o olhar sobre si.'
      ),
      autoconhecimento__inseguranca: reviewed(
        'autoconhecimento__inseguranca', 'autoconhecimento', ['inseguranca'],
        'Talvez olhar para si esteja esbarrando no receio de não encontrar uma imagem suficientemente segura ou aceitável.',
        ['identidade', 'imagemDeSi', 'necessidadeDeValidacao'], signal(['autoconhecimento', 'identidade', 'autoimagem', 'comparacao'], ['inquiry', 'recognition']),
        'Mantém a investigação de si como foco e usa a insegurança como tensão ligada à autoimagem.'
      ),
      confusao__autoconhecimento: reviewed(
        'confusao__autoconhecimento', 'confusao', ['autoconhecimento'],
        'Pode estar difícil organizar as dúvidas porque cada resposta parece também mudar a maneira como você se compreende.',
        ['necessidadeDeClareza', 'identidade'], signal(['confusao', 'clareza', 'autoconhecimento', 'observacao'], ['clarification', 'inquiry']),
        'Mantém a confusão como problema central e acrescenta o autoconhecimento como campo onde as respostas se deslocam.'
      ),
      inseguranca__autoconhecimento: reviewed(
        'inseguranca__autoconhecimento', 'inseguranca', ['autoconhecimento'],
        'Talvez a dúvida sobre o próprio valor esteja tornando o olhar para si mais exigente do que esclarecedor.',
        ['imagemDeSi', 'autojulgamento', 'identidade'], signal(['inseguranca', 'autoimagem', 'autoconhecimento', 'autocompaixao'], ['recognition', 'inquiry']),
        'Mantém a insegurança no centro e usa o autoconhecimento para iluminar a exigência dirigida a si.'
      ),
      luto__saudade: reviewed(
        'luto__saudade', 'luto', ['saudade'],
        'Talvez a ausência esteja doendo também porque o vínculo continua vivo na memória e nos gestos que ficaram.',
        ['ausencia', 'vinculoContinuado', 'memoria'], signal(['luto', 'perda', 'memoria', 'vinculo'], ['recognition', 'presence', 'contemplation'], ['acolhedor', 'contemplativo']),
        'Mantém a perda no centro e apresenta a saudade como permanência do vínculo, sem pressionar por superação.', 'high', 'low'
      ),
      saudade__luto: reviewed(
        'saudade__luto', 'saudade', ['luto'],
        'A lembrança pode estar trazendo presença e, ao mesmo tempo, a consciência de que algo não pode voltar da mesma forma.',
        ['memoria', 'irreversibilidade', 'vinculoContinuado'], signal(['saudade', 'memoria', 'perda', 'aceitacao'], ['recognition', 'contemplation']),
        'Mantém a lembrança e o desejo de presença no centro; o luto acrescenta irreversibilidade.'
      ),
      amor__medo: reviewed(
        'amor__medo', 'amor', ['medo'],
        'Talvez o desejo de se aproximar esteja acompanhado pelo receio de perder, ferir-se ou não ser correspondido.',
        ['vinculo', 'vulnerabilidadeAfetiva', 'medoDePerda'], signal(['amor', 'vinculo', 'medo', 'apego'], ['recognition', 'inquiry']),
        'Mantém o vínculo afetivo no centro e apresenta o medo como vulnerabilidade diante da proximidade.'
      ),
      medo__amor: reviewed(
        'medo__amor', 'medo', ['amor'],
        'Talvez o medo esteja ganhando força justamente onde existe algo ou alguém que importa profundamente.',
        ['vulnerabilidadeAfetiva', 'vinculo', 'medoDePerda'], signal(['medo', 'amor', 'vinculo', 'observacao'], ['recognition', 'clarification']),
        'Mantém o medo no centro e usa o amor para explicar por que a ameaça percebida possui peso afetivo.'
      ),
      ansiedade__medo: reviewed(
        'ansiedade__medo', 'ansiedade', ['medo'],
        'Pode estar difícil separar o perigo real daquilo que a mente antecipa enquanto tenta se preparar para o que ainda não aconteceu.',
        ['antecipacao', 'necessidadeDeControle', 'ameacaPossivel'], signal(['ansiedade', 'antecipacao', 'medo', 'controle'], ['recognition', 'clarification', 'grounding']),
        'Mantém a antecipação ansiosa no centro e utiliza o medo como percepção de ameaça.'
      ),
      medo__ansiedade: reviewed(
        'medo__ansiedade', 'medo', ['ansiedade'],
        'Talvez uma ameaça possível esteja mantendo a mente em alerta, procurando controlar antes mesmo de saber o que acontecerá.',
        ['ameacaPossivel', 'antecipacao', 'necessidadeDeControle'], signal(['medo', 'ansiedade', 'pensamento acelerado', 'observacao'], ['recognition', 'grounding']),
        'Mantém a ameaça percebida no centro e trata a ansiedade como ampliação antecipatória.'
      ),
      tristeza__solidao: reviewed(
        'tristeza__solidao', 'tristeza', ['solidao'],
        'Talvez a tristeza esteja ficando mais pesada porque parece não haver com quem dividir plenamente o que está sendo vivido.',
        ['sofrimentoCompartilhado', 'pertencimento', 'acolhimento'], signal(['tristeza', 'solidao', 'acolhimento', 'conexao'], ['recognition', 'presence']),
        'Mantém a tristeza no centro e usa a solidão como ausência percebida de amparo.'
      ),
      solidao__tristeza: reviewed(
        'solidao__tristeza', 'solidao', ['tristeza'],
        'Talvez a distância dos outros esteja tornando mais visível uma tristeza que antes encontrava algum abrigo na presença.',
        ['pertencimento', 'distanciaAfetiva', 'tristeza'], signal(['solidao', 'pertencimento', 'tristeza', 'conexao'], ['recognition', 'presence']),
        'Mantém a experiência de distância no centro e apresenta a tristeza como tonalidade dessa ausência.'
      ),
      raiva__culpa: reviewed(
        'raiva__culpa', 'raiva', ['culpa'],
        'Talvez a necessidade de reconhecer um limite esteja se chocando com o receio de ter ferido alguém ou ido longe demais.',
        ['limites', 'responsabilidade', 'reparacao'], signal(['raiva', 'limites', 'culpa', 'responsabilidade'], ['recognition', 'clarification', 'inquiry']),
        'Mantém a raiva e seus limites no centro; a culpa acrescenta responsabilidade sem invalidar a emoção.'
      ),
      culpa__raiva: reviewed(
        'culpa__raiva', 'culpa', ['raiva'],
        'Talvez o peso da responsabilidade esteja misturado à raiva pelo que aconteceu, pelo que foi permitido ou pelo que não pôde ser evitado.',
        ['responsabilidade', 'ressentimento', 'reparacao'], signal(['culpa', 'responsabilidade', 'raiva', 'reparacao'], ['recognition', 'clarification']),
        'Mantém a responsabilidade no centro e usa a raiva como tensão sobre o acontecimento e seus limites.'
      ),
      falta_de_proposito__confusao: reviewed(
        'falta_de_proposito__confusao', 'falta_de_proposito', ['confusao'],
        'Pode estar difícil encontrar direção quando muitas possibilidades existem, mas nenhuma parece ter significado suficiente.',
        ['sentido', 'direcao', 'necessidadeDeClareza'], signal(['proposito', 'sentido', 'direcao', 'confusao'], ['clarification', 'inquiry']),
        'Mantém a falta de sentido no centro e apresenta a confusão como dificuldade de organizar possibilidades.'
      ),
      confusao__falta_de_proposito: reviewed(
        'confusao__falta_de_proposito', 'confusao', ['falta_de_proposito'],
        'Talvez as dúvidas estejam se acumulando porque ainda não há um sentido claro capaz de organizar as escolhas.',
        ['necessidadeDeClareza', 'sentido', 'direcao'], signal(['confusao', 'clareza', 'proposito', 'sentido'], ['clarification', 'inquiry']),
        'Mantém as dúvidas no centro e utiliza a falta de propósito como ausência de um eixo organizador.'
      ),
      falta_de_proposito__inseguranca: reviewed(
        'falta_de_proposito__inseguranca', 'falta_de_proposito', ['inseguranca'],
        'Talvez a busca por direção esteja esbarrando no medo de escolher errado ou de não ser capaz de sustentar um caminho.',
        ['direcao', 'medoDeErrar', 'autoeficacia'], signal(['proposito', 'direcao', 'inseguranca', 'medo de errar'], ['recognition', 'inquiry']),
        'Mantém a busca de sentido no centro e trata a insegurança como receio diante da escolha.'
      ),
      esperanca__luto: reviewed(
        'esperanca__luto', 'esperanca', ['luto'],
        'Talvez exista uma abertura para continuar, ainda que ela precise conviver com a perda sem apagá-la.',
        ['possibilidade', 'continuidade', 'perda'], signal(['esperanca', 'continuidade', 'luto', 'aceitacao'], ['presence', 'contemplation']),
        'Mantém a possibilidade no centro, mas subordina qualquer movimento ao respeito pela perda.', 'high', 'medium'
      ),
      luto__esperanca: reviewed(
        'luto__esperanca', 'luto', ['esperanca'],
        'Talvez a perda ainda ocupe o centro, enquanto uma possibilidade discreta de continuidade começa a aparecer sem exigir pressa.',
        ['perda', 'continuidade', 'possibilidade'], signal(['luto', 'perda', 'esperanca', 'continuidade'], ['recognition', 'presence', 'contemplation'], ['acolhedor', 'contemplativo']),
        'Mantém o luto no centro e permite esperança somente como continuidade discreta, sem cobrança.', 'high', 'low'
      ),
      amor__saudade: reviewed(
        'amor__saudade', 'amor', ['saudade'],
        'Talvez o vínculo continue procurando presença por meio da memória, do desejo de proximidade e daquilo que ainda importa.',
        ['vinculo', 'memoria', 'proximidade'], signal(['amor', 'vinculo', 'saudade', 'memoria'], ['contemplation', 'recognition']),
        'Mantém o amor no centro e apresenta a saudade como forma de procura pela presença.'
      ),
      saudade__amor: reviewed(
        'saudade__amor', 'saudade', ['amor'],
        'Talvez a falta esteja revelando a profundidade de um afeto que permanece presente mesmo na distância.',
        ['memoria', 'vinculo', 'distanciaAfetiva'], signal(['saudade', 'amor', 'memoria', 'vinculo'], ['recognition', 'contemplation']),
        'Mantém a falta e a lembrança no centro; o amor acrescenta a continuidade do vínculo.'
      ),
      ansiedade__autoconhecimento: reviewedPhase10(
        'ansiedade__autoconhecimento', 'ansiedade', ['autoconhecimento'],
        'Talvez a urgência de entender o que acontece dentro de você esteja fazendo cada dúvida parecer algo que precisa ser resolvido antes do tempo.',
        ['antecipacao', 'observacaoDeSi', 'necessidadeDeControle'], signal(['ansiedade', 'autoconhecimento', 'observacao'], ['recognition', 'grounding', 'inquiry'], ['acolhedor', 'contemplativo']),
        'Mantém a antecipação ansiosa no centro e usa o autoconhecimento como campo onde a urgência por explicações aparece.'
      ),
      autoconhecimento__ansiedade: reviewedPhase10(
        'autoconhecimento__ansiedade', 'autoconhecimento', ['ansiedade'],
        'Talvez olhar para si esteja revelando uma mente que se adianta aos acontecimentos e procura certezas antes de conseguir apenas observar o que sente.',
        ['observacaoDeSi', 'antecipacao', 'necessidadeDeCerteza'], signal(['autoconhecimento', 'observacao', 'ansiedade', 'clareza'], ['inquiry', 'clarification', 'grounding']),
        'Mantém a investigação de si no centro; a ansiedade acrescenta antecipação e dificuldade de observar sem concluir depressa.'
      ),
      inseguranca__amor: reviewedPhase10(
        'inseguranca__amor', 'inseguranca', ['amor'],
        'Talvez a dúvida sobre o próprio valor esteja ficando mais intensa justamente onde existe o desejo de ser visto, acolhido e amado sem precisar provar que merece isso.',
        ['imagemDeSi', 'necessidadeDeValidacao', 'vulnerabilidadeAfetiva'], signal(['inseguranca', 'autoimagem', 'amor', 'vinculo'], ['recognition', 'inquiry'], ['acolhedor', 'contemplativo']),
        'Mantém a autoimagem insegura no centro e apresenta o amor como contexto de exposição e desejo de acolhimento, sem afirmar dependência afetiva.', 'high', 'medium'
      ),
      amor__inseguranca: reviewedPhase10(
        'amor__inseguranca', 'amor', ['inseguranca'],
        'Talvez o desejo de se aproximar esteja convivendo com o receio de não ser suficiente ou de precisar esconder partes de si para preservar o vínculo.',
        ['vinculo', 'vulnerabilidadeAfetiva', 'imagemDeSi'], signal(['amor', 'vinculo', 'inseguranca', 'autoimagem'], ['recognition', 'inquiry']),
        'Mantém o vínculo afetivo no centro e trata a insegurança como receio de inadequação diante da proximidade.', 'high', 'medium'
      ),
      culpa__tristeza: reviewedPhase10(
        'culpa__tristeza', 'culpa', ['tristeza'],
        'Talvez o peso do que você acredita ter feito, deixado de fazer ou não conseguido evitar esteja se transformando também em tristeza.',
        ['responsabilidade', 'autojulgamento', 'sofrimento'], signal(['culpa', 'responsabilidade', 'reparacao', 'tristeza', 'autocompaixao'], ['recognition', 'contemplation']),
        'Mantém a responsabilidade percebida no centro, sem confirmar condenação, e reconhece a tristeza como efeito possível desse peso.', 'high', 'medium'
      ),
      tristeza__culpa: reviewedPhase10(
        'tristeza__culpa', 'tristeza', ['culpa'],
        'Talvez a tristeza esteja mais pesada porque, além da dor, existe a sensação de que você deveria ter agido, sentido ou escolhido de outro modo.',
        ['sofrimento', 'autojulgamento', 'responsabilidade'], signal(['tristeza', 'acolhimento', 'culpa', 'autocompaixao'], ['recognition', 'contemplation']),
        'Mantém a tristeza no centro e apresenta a culpa como cobrança dirigida a si, sem aumentar culpabilização.', 'high', 'medium'
      ),
      falta_de_proposito__esperanca: reviewedPhase10(
        'falta_de_proposito__esperanca', 'falta_de_proposito', ['esperanca'],
        'Talvez a direção ainda não esteja clara, mas alguma possibilidade começa a parecer digna de atenção, mesmo sem oferecer certeza sobre o caminho inteiro.',
        ['sentido', 'direcao', 'possibilidade'], signal(['sentido', 'proposito', 'esperanca', 'continuidade'], ['clarification', 'inquiry', 'contemplation']),
        'Mantém a ausência de direção no centro e limita a esperança a uma abertura discreta, sem promessa ou cobrança por superação.', 'high', 'low'
      ),
      esperanca__falta_de_proposito: reviewedPhase10(
        'esperanca__falta_de_proposito', 'esperanca', ['falta_de_proposito'],
        'Talvez exista uma abertura para continuar procurando, embora o sentido ainda não tenha tomado uma forma clara ou definitiva.',
        ['possibilidade', 'continuidade', 'sentido'], signal(['esperanca', 'continuidade', 'sentido', 'proposito'], ['recognition', 'contemplation', 'inquiry']),
        'Mantém a possibilidade no centro e reconhece que ela pode existir antes de uma direção definida, sem converter esperança em otimismo obrigatório.', 'high', 'low'
      ),
    },
    triadOverrides: {
      autoconhecimento__confusao__inseguranca: reviewed(
        'autoconhecimento__confusao__inseguranca', 'autoconhecimento', ['confusao', 'inseguranca'],
        'Talvez você esteja tentando compreender quem é enquanto suas dúvidas exigem uma certeza que nenhuma definição consegue oferecer por completo.',
        ['identidade', 'imagemDeSi', 'necessidadeDeCerteza'], signal(['autoconhecimento', 'identidade', 'autoimagem', 'clareza'], ['inquiry', 'clarification']),
        'A combinação mantém o autoconhecimento como foco e utiliza confusão e insegurança como tensões ligadas à tentativa de se definir.', 'high', 'medium'
      ),
    },
    secondaryModifiers: {
      ansiedade: { hiddenThemes: ['antecipacao', 'necessidadeDeControle'], preferredThemes: ['ansiedade', 'antecipacao'] },
      medo: { hiddenThemes: ['ameacaPossivel', 'vulnerabilidade'], preferredThemes: ['medo', 'observacao'] },
      amor: { hiddenThemes: ['vinculo', 'vulnerabilidadeAfetiva'], preferredThemes: ['amor', 'vinculo'] },
      saudade: { hiddenThemes: ['memoria', 'distanciaAfetiva'], preferredThemes: ['saudade', 'memoria'] },
      esperanca: { hiddenThemes: ['possibilidade', 'continuidade'], preferredThemes: ['esperanca', 'continuidade'] },
      solidao: { hiddenThemes: ['pertencimento', 'distanciaAfetiva'], preferredThemes: ['solidao', 'conexao'] },
      confusao: { hiddenThemes: ['necessidadeDeClareza', 'duvida'], preferredThemes: ['confusao', 'clareza'] },
      autoconhecimento: { hiddenThemes: ['identidade', 'observacaoDeSi'], preferredThemes: ['autoconhecimento', 'identidade'] },
      inseguranca: { hiddenThemes: ['imagemDeSi', 'necessidadeDeValidacao'], preferredThemes: ['inseguranca', 'autoimagem'] },
      raiva: { hiddenThemes: ['limites', 'dignidade'], preferredThemes: ['raiva', 'limites'] },
      culpa: { hiddenThemes: ['responsabilidade', 'reparacao'], preferredThemes: ['culpa', 'reparacao'] },
      luto: { hiddenThemes: ['perda', 'ausencia'], preferredThemes: ['luto', 'perda'] },
      tristeza: { hiddenThemes: ['sofrimento', 'acolhimento'], preferredThemes: ['tristeza', 'acolhimento'] },
      falta_de_proposito: { hiddenThemes: ['sentido', 'direcao'], preferredThemes: ['proposito', 'sentido'] },
    },
    themeAdapters: {
      identidade: ['identidade', 'autoconhecimento'], imagemDeSi: ['autoimagem', 'comparacao'], necessidadeDeCerteza: ['clareza', 'controle'],
      necessidadeDeClareza: ['clareza', 'observacao'], vinculo: ['vinculo', 'amor'], vinculoContinuado: ['vinculo', 'memoria'],
      ausencia: ['perda', 'saudade'], memoria: ['memoria', 'saudade'], irreversibilidade: ['perda', 'aceitacao'],
      antecipacao: ['antecipacao', 'pensamento acelerado'], necessidadeDeControle: ['controle', 'regulacao emocional'],
      pertencimento: ['pertencimento', 'conexao'], responsabilidade: ['responsabilidade', 'reparacao'],
      sentido: ['sentido', 'proposito'], direcao: ['direcao', 'acao consciente'], possibilidade: ['esperanca', 'continuidade'],
      necessidadeDeValidacao: ['validacao', 'aprovacao externa'], autojulgamento: ['autojulgamento', 'autocompaixao'],
      vulnerabilidadeAfetiva: ['vulnerabilidade', 'amor'], medoDePerda: ['medo', 'perda'], ameacaPossivel: ['medo', 'observacao'],
      sofrimentoCompartilhado: ['acolhimento', 'conexao'], distanciaAfetiva: ['solidao', 'saudade'], tristeza: ['tristeza', 'sofrimento'],
      limites: ['limites', 'dignidade'], reparacao: ['reparacao', 'responsabilidade'], ressentimento: ['raiva', 'desapego'],
      medoDeErrar: ['medo de errar', 'inseguranca'], autoeficacia: ['identidade', 'acao consciente'], continuidade: ['continuidade', 'esperanca'],
      perda: ['perda', 'luto'], proximidade: ['amor', 'conexao'], vulnerabilidade: ['medo', 'acolhimento'],
      observacaoDeSi: ['autoconhecimento', 'observacao'], dignidade: ['dignidade', 'limites'], sofrimento: ['sofrimento', 'condicao humana'],
      acolhimento: ['acolhimento', 'aceitacao'], duvida: ['confusao', 'clareza'],
    },
    fallbackProfiles: {
      cautious: {
        humanSummary: 'Esses sentimentos podem estar se atravessando de uma maneira difícil de separar. Talvez não seja necessário compreender todos eles de uma vez.',
        confidence: 'low', ambiguity: 'high', status: 'reviewed',
      },
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);

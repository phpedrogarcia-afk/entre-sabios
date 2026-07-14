// Normalização e inferência de conteúdo filosófico.
// Extraído de script.js na Fase 3 da refatoração segura.
// Não alterar pesos, regras ou comportamento nesta fase.

function inferTone(authorName) {
  const entry = Object.entries(authorToneProfiles).find(([, authors]) => authors.includes(authorName));
  return entry?.[0] || 'contemplativo';
}

function inferContentFeelings(tags) {
  const normalizedTags = new Set(tags.map(normalizeTheme));
  return feelingsCatalog
    .filter((feeling) => feeling.themes.some((theme) => normalizedTags.has(normalizeTheme(theme))) || normalizedTags.has(feeling.id))
    .map((feeling) => feeling.id);
}

function inferTextThemes(text, tags) {
  const normalizedText = normalizeTheme(text).replace(/_/g, ' ');
  const themes = new Set(tags.map(normalizeTheme));
  Object.entries(textThemeKeywords).forEach(([theme, keywords]) => {
    if (keywords.some((keyword) => normalizedText.includes(normalizeTheme(keyword).replace(/_/g, ' ')))) {
      themes.add(normalizeTheme(theme));
    }
  });
  return Array.from(themes);
}

function inferIntensities(tone, depth) {
  if (tone === 'confrontador') return ['fraca', 'moderada'];
  if (tone === 'analítico' && depth >= 5) return ['fraca', 'moderada'];
  if (tone === 'acolhedor' || tone === 'direto') return ['fraca', 'moderada', 'intensa'];
  return ['moderada', 'intensa'];
}

function inferIncompatibleStates(tone) {
  const family = getToneFamily(tone);
  if (family === 'confrontador') return ['ansiedade:intensa', 'medo:intensa', 'tristeza:intensa', 'culpa:intensa', 'luto:intensa'];
  if (family === 'analítico') return ['confusão:intensa'];
  return [];
}

function normalizePerspectiveContent() {
  const editorialQuarantine = new Set(['persp-08', 'persp-17']);
  const editorialToneOverrides = {
    'persp-01': 'contemplativo',
    'persp-02': 'contemplativo',
    'persp-03': 'acolhedor',
    'persp-04': 'contemplativo',
    'persp-05': 'contemplativo',
    'persp-06': 'poético',
    'persp-07': 'poético',
    'persp-09': 'poético',
    'persp-10': 'poético',
    'persp-11': 'contemplativo',
    'persp-12': 'analítico',
    'persp-13': 'contemplativo',
    'persp-14': 'contemplativo',
    'persp-15': 'analítico',
    'persp-16': 'poético',
    'persp-18': 'acolhedor',
    'persp-19': 'contemplativo',
    'persp-20': 'acolhedor',
    'persp-21': 'acolhedor',
    'persp-22': 'direto',
    'persp-23': 'poético',
    'persp-24': 'acolhedor',
    'persp-25': 'acolhedor',
    'persp-26': 'contemplativo',
    'persp-27': 'contemplativo',
  };
  return perspectiveContentDb.filter((item) => !editorialQuarantine.has(item.id)).map((item, index) => ({
    author: item.autor, displayAuthor: item.autor, quote: item.frase, contentType: 'quote', variantIndex: 2000 + index,
    quoteType: 'inspired', source: `Leitura editorial inspirada em ${item.autor}`, tags: item.temas,
    _tagsN: item.temas.map(normalizeTheme), sentimentos: item.sentimentos, intensidade: item.intensidade,
    temas: item.temas.map(normalizeTheme), tom: editorialToneOverrides[item.id] || item.tom, profundidade: item.profundidade,
    incompativeis: inferIncompatibleStates(editorialToneOverrides[item.id] || item.tom), adviceTemplate: () => item.conselho,
    riskTags: (item.riskTags || []).map(normalizeTheme),
    reflectionTemplate: () => item.explicacao, curatedExplanation: item.explicacao,
    curatedAdvice: item.conselho, curatedBook: item.livro, curatedId: item.id,
    philosophy: `${item.autor} oferece aqui uma perspectiva ligada a ${item.tradicao}, com tom ${item.tom.replace(/_/g, ' e ')}.`,
  }));
}

function normalizeCuratedContent() {
  return curatedContentDb
    .filter((item) => !['quarantine', 'removed'].includes(item.editorialStatus))
    .map((item, index) => ({
    author: item.autor,
    displayAuthor: item.autor,
    quote: item.frase || item.texto,
    contentType: item.contentType || (item.texto ? 'text' : 'quote'),
    variantIndex: 1000 + index,
    quoteType: item.quoteType || 'inspired',
    source: item.source || '',
    tags: item.temas,
    _tagsN: item.temas.map(normalizeTheme),
    sentimentos: item.sentimentos,
    intensidade: item.intensidade,
    temas: item.temas.map(normalizeTheme),
    tom: item.tom,
    profundidade: item.profundidade,
    incompativeis: inferIncompatibleStates(item.tom),
    riskTags: (item.riskTags || []).map(normalizeTheme),
    adviceTemplate: () => item.conselho,
    reflectionTemplate: () => item.explicacao,
    curatedExplanation: item.explicacao,
    curatedAdvice: item.conselho,
    curatedBook: item.livro,
    curatedId: item.id,
    }));
}

function normalizeAuthorTagsDb() {
  // Pré-normalização e expansão das variações para reduzir repetição.
  const editorialVariantQuarantine = new Set([
    'Aristóteles|Somos aquilo que fazemos repetidamente.',
    'Bardo Thodol|Aquilo que assusta a mente pode ser uma criação da própria mente, não uma ameaça presente.',
    'Bardo Thodol|Não se prenda ao que parece agradável nem fuja imediatamente do que parece assustador.',
    'Bhagavad Gita|O gesto correto pertence a você; a reação pertence ao outro.',
    'Bhagavad Gita|Quem age por consciência não precisa cobrar gratidão como recibo.',
    'Michel de Montaigne|Quem ensina alguém a morrer também o ensina a viver com mais liberdade.',
    'Dostoiévski|O sofrimento pode revelar necessidades esquecidas e conduzir você de volta ao que realmente importa.',
    'Dostoiévski|Quem enfrenta um período difícil pode desenvolver mais sensibilidade para reconhecer e acolher o sofrimento dos outros.',
    'Jiddu Krishnamurti|A liberdade começa quando a mente observa o medo sem fugir dele.',
    'Milarepa|Quando a mente deixa de perseguir cada pensamento, até a solidão pode se tornar clareza.',
    'Milarepa|Buscar respostas em toda parte pode impedir você de escutar o que o silêncio já está mostrando.',
    'Milarepa|A disciplina interior transforma dificuldades em prática, não em condenação.',
    'Milarepa|Ter pouco pode ser suficiente quando a mente deixa de medir a vida apenas pelo que possui.',
    'Milarepa|A tradição ligada a Milarepa apresenta a solidão como espaço de treinamento, não como abandono. Quando a pessoa deixa de correr atrás de cada pensamento, começa a distinguir necessidade de impulso. O silêncio não resolve tudo, mas permite enxergar com menos interferência.',
    'Nisargadatta Maharaj|Antes de buscar uma saída no mundo, veja quem é aquele que se sente preso.',
    'Rumi|Aquilo que dói também pode abrir passagem para uma atenção mais delicada. A ferida não precisa se tornar identidade, mas pode ensinar onde faltou cuidado. Quando o coração deixa de esconder sua fragilidade, encontra uma coragem que a dureza nunca conseguiu oferecer.',
    'Viktor Frankl|Mesmo quando tudo pesa, ainda resta escolher uma atitude.',
    'Viktor Frankl|O sentido não elimina a dor, mas muda o lugar dela em nós.',
    'Viktor Frankl|O sentido nem sempre chega como uma grande missão. Pode aparecer numa pessoa a cuidar, numa tarefa a concluir ou na postura escolhida diante de uma dor inevitável. A vida continua fazendo perguntas; responder é transformar o próximo gesto em responsabilidade.',
    'Frank Herbert|Quando o medo ocupa toda a mente, ele transforma possibilidade em sentença. Enfrentá-lo não exige fingir que ele desapareceu; exige permitir que atravesse o corpo sem receber autoridade sobre todas as escolhas. Depois da passagem, ainda existe alguém capaz de observar, respirar e decidir o próximo passo.',
    'Marco Aurélio|Você não pode controlar o mundo. Mas pode controlar sua resposta.',
    'Marco Aurélio|As dificuldades oferecem uma oportunidade concreta para praticar coragem, paciência e disciplina.',
    'Chögyam Trungpa|Até a busca por paz pode virar uma maneira elegante de proteger o ego.',
    'Chögyam Trungpa|A prática começa quando você para de transformar lucidez em decoração da autoimagem.',
    'Chögyam Trungpa|O ego sabe usar até a espiritualidade para continuar no centro da sala.',
    'Chögyam Trungpa|A presença real não melhora a máscara; ela mostra que a máscara estava trabalhando.',
    'Sócrates|Uma vida sem exame perde a chance de se tornar consciente.',
    'Marco Aurélio|Ao despertar, lembre-se de que encontrará pessoas difíceis, ingratas ou impacientes. Elas agem assim porque ainda confundem o bem e o mal. Você, porém, pode escolher não se tornar semelhante ao que o fere. A natureza humana é feita para cooperar; responder ao erro com outro erro apenas prolonga o conflito.',
    'Nietzsche|Uma dificuldade pode fortalecer você quando é compreendida e transformada em aprendizado, sem negar a dor que causou.',
    'Nietzsche|É preciso coragem para transformar a dor em criação.',
    'Nietzsche|Quem encontra uma razão verdadeira para seguir consegue atravessar muitas recusas.',
    'Nietzsche|Existe em nós uma coragem capaz de enfrentar aquilo que tenta nos reduzir. Ela não elimina o abismo nem promete uma vida sem dor; ensina a olhar para a dificuldade e ainda afirmar a existência. Crescer não é evitar toda queda, mas descobrir uma força que antes permanecia escondida.',
    'Fernando Pessoa|Em alguns dias, simplesmente continuar presente já é um gesto de sensibilidade e coragem.',
    'Fernando Pessoa|Não é numa ilha distante ou numa vida imaginária que a alma encontra cura definitiva. Mesmo o lugar sonhado perde sua perfeição quando chega perto. A transformação que procuramos fora também precisa acontecer dentro: é em nós que a paisagem ganha juventude, sentido e possibilidade de amor.',
    'Sêneca|Sofremos mais na imaginação do que na realidade.',
    'Sêneca|Não é pouco tempo que temos, mas muito tempo que desperdiçamos.',
    'Sêneca|Não recebemos uma vida necessariamente curta; muitas vezes somos nós que a tornamos pequena ao entregá-la à distração, à espera e às preocupações sem fim. O tempo é suficiente quando é habitado com presença. Quem protege as próprias horas deixa de adiar a vida para um amanhã que nunca chega inteiro.',
    'Hannah Arendt|A liberdade se torna concreta quando uma pessoa transforma intenção em uma ação responsável.',
    'Hannah Arendt|Agir significa assumir responsabilidade e participar do mundo, mesmo sem garantia de controlar o resultado.',
    'Hannah Arendt|Toda responsabilidade começa quando deixamos de ser espectadores.',
    'Schopenhauer|Reconhecer o sofrimento próprio e alheio pode ampliar o cuidado com as escolhas e com a vida das pessoas.',
    'Osho|A raiva observada perde o veneno e revela onde você precisa de liberdade.',
    'Osho|Não faça da sua ajuda uma prisão; amor com cobrança vira comércio.',
    'Osho|Quando você para de reagir, certas pessoas perdem o controle que tinham.',
    'Steve Jobs|Seu tempo é limitado; não gaste sua vida representando o roteiro de outra pessoa.',
    'Steve Jobs|Quem sabe o que quer não negocia a própria direção por aprovação.',
    'Carl Jung|Aquilo que você evita compreender dentro de si acaba influenciando suas escolhas sem que você perceba.',
    'Carl Jung|A parte de nós que evitamos não desaparece; aprende a agir fora do nosso campo de visão. Reconhecer a sombra não significa obedecê-la. Significa retirar dela o poder de escolher escondida e transformar sua energia em limite, consciência e responsabilidade.',
    'Maya Angelou|Dignidade é sair antes que a alma precise implorar respeito.',
    'Machado de Assis|Há silêncios que dizem mais sobre uma pessoa do que suas melhores justificativas.',
    'Machado de Assis|Se um dia eu ajudei, não fiz reféns: minha ação fala de mim; sua reação fala de você.',
    'Machado de Assis|Algumas atitudes de ingratidão esclarecem quem a outra pessoa é e ajudam você a rever essa relação.',
    'Machado de Assis|A elegância de uma indireta está em deixar a verdade trabalhar sozinha.',
    'Machado de Assis|Machado desconfiava das versões muito elegantes que contamos sobre nós mesmos. Por trás de uma boa justificativa podem existir vaidade, interesse ou medo de admitir a verdade. Ler seus personagens é aprender a observar o narrador dentro de nós: aquele que reorganiza os fatos para sempre parecer inocente.',
    'Ptahhotep|Responder com calma a uma provocação protege sua dignidade e evita ampliar o conflito.',
    'Heráclito|Heráclito observou que a realidade está sempre em movimento. Tentar conservar tudo exatamente como era produz sofrimento porque nós também participamos da mudança. Sabedoria não é controlar o fluxo, mas perceber o que está mudando e escolher uma resposta adequada ao momento presente.',
  ]);
  const editorialFeelingOverrides = new Map([
    ['Heráclito|Tudo muda; compreender a vida exige aprender a mudar com ela.', ['ansiedade', 'confusão']],
    ['Heráclito|Você não encontra a mesma experiência duas vezes, porque o mundo e você já mudaram.', ['saudade', 'luto']],
    ['Heráclito|Os opostos podem fazer parte do mesmo movimento, como tensão e harmonia numa corda.', ['confusão']],
    ['Heráclito|O caráter que você cultiva influencia o caminho que sua vida toma.', ['autoconhecimento']],
    ['Michel de Montaigne|Aprender a viver é também aprender a não ser governado pelo medo do que ainda não aconteceu.', ['ansiedade', 'medo']],
    ['Michel de Montaigne|Minha vida foi cheia de dificuldades, e muitas delas nunca chegaram a acontecer.', ['ansiedade', 'medo']],
    ['Michel de Montaigne|A sabedoria começa quando aceitamos estudar a nós mesmos sem fingir perfeição.', ['autoconhecimento', 'culpa']],
    ['Michel de Montaigne|Montaigne observava a si mesmo sem posar como exemplo de perfeição. Mudava de ideia, reconhecia contradições e transformava a dúvida em método. Conhecer-se, nessa perspectiva, não é encontrar uma definição definitiva, mas aprender a conviver honestamente com uma natureza humana móvel, imperfeita e ainda capaz de sabedoria.', ['autoconhecimento', 'confusão']],
    ['Dhammapada|Aquilo que somos toma forma nos pensamentos que alimentamos e nas ações que escolhemos repetir.', ['autoconhecimento', 'culpa']],
    ['Dhammapada|A mente precede nossas ações; quando ela se torna clara, a paz acompanha nossos passos.', ['ansiedade']],
    ['Dhammapada|O ódio não termina com mais ódio: ele se desfaz quando deixa de ser alimentado.', ['raiva']],
    ['Dhammapada|Mais valiosa que mil palavras vazias é uma palavra que devolve paz.', ['tristeza', 'confusão']],
    ['Dhammapada|A mente vem antes da palavra e da ação. Quando alguém fala ou age alimentando hostilidade, o sofrimento o acompanha; quando age com uma mente clara, a paz segue seus passos. O ensinamento não pede pensamentos perfeitos, mas atenção ao instante em que um pensamento começa a se transformar em caminho.', ['raiva', 'autoconhecimento']],
    ['Dostoiévski|A pessoa pode carregar dores profundas e, ao mesmo tempo, continuar procurando esperança e sentido.', ['luto', 'tristeza', 'esperança']],
    ['Dostoiévski|Quando existe dor, buscar compreensão costuma ajudar mais do que culpar a si mesmo ou condenar o que sente.', ['culpa', 'tristeza']],
    ['Katha Upanishad|O agradável e o que realmente faz bem nem sempre conduzem ao mesmo caminho.', ['autoconhecimento', 'confusão']],
    ['Katha Upanishad|A pessoa sábia distingue o benefício duradouro do prazer que desaparece rapidamente.', ['autoconhecimento']],
    ['Katha Upanishad|O corpo é como uma carruagem; a inteligência orienta e a mente segura as rédeas.', ['confusão']],
    ['Katha Upanishad|Quem procura estabilidade apenas nas coisas passageiras continuará encontrando insegurança.', ['ansiedade', 'medo']],
    ['Katha Upanishad|A Katha Upanishad diferencia o agradável do que realmente faz bem. O agradável oferece satisfação imediata; o bem pode exigir paciência, disciplina e renúncia. A escolha sábia não rejeita toda alegria, mas pergunta quais consequências cada caminho produzirá depois que o impulso passar.', ['autoconhecimento', 'confusão']],
    ['Krishnamurti|A mente encontra calma quando reconhece a realidade antes de tentar mudá-la.', ['ansiedade', 'confusão']],
    ['Krishnamurti|O silêncio pode diminuir as defesas da mente e permitir que você perceba o que estava evitando.', ['autoconhecimento', 'confusão']],
    ['Krishnamurti|Compreender a si mesmo é mais profundo do que controlar a si mesmo.', ['autoconhecimento', 'confusão']],
    ['Krishnamurti|A paz começa quando você deixa de reagir com pressa ao que sente.', ['ansiedade', 'raiva']],
    ['Lao-Tsé|A flexibilidade permite atravessar obstáculos que a rigidez não consegue superar.', ['ansiedade', 'confusão']],
    ['Lao-Tsé|A pressa pode fazer você ignorar informações e etapas importantes para tomar uma boa decisão.', ['ansiedade', 'confusão']],
    ['Lao-Tsé|Simplificar ajuda a perceber o essencial quando o excesso de opções produz confusão.', ['confusão']],
    ['Lao-Tsé|Diminuir a pressão por uma resposta imediata permite perceber sentimentos e possibilidades com mais honestidade.', ['ansiedade', 'confusão']],
    ['Lao-Tsé|A água não discute com a pedra e, ainda assim, encontra passagem. Sua força está em não abandonar o movimento. Flexibilidade não é submissão: é conservar a direção sem gastar toda a energia tentando obrigar o mundo a assumir uma única forma.', ['ansiedade', 'medo', 'confusão']],
    ['Confúcio|O caminho se constrói no cuidado com os pequenos gestos.', ['esperança', 'falta_de_proposito']],
    ['Confúcio|Repetir pequenas atitudes conscientes transforma experiências comuns em aprendizado duradouro.', ['autoconhecimento', 'esperança']],
    ['Confúcio|O respeito se demonstra nas decisões cotidianas, especialmente quando ninguém está observando.', ['autoconhecimento']],
    ['Confúcio|Aprender sem refletir é perder-se; refletir sem agir é parar.', ['confusão', 'falta_de_proposito']],
    ['Henry David Thoreau|Viver deliberadamente é separar o essencial do ruído antes que o tempo passe sem ter sido realmente vivido.', ['falta_de_proposito', 'autoconhecimento']],
    ['Henry David Thoreau|Uma vida simples cria espaço para perceber aquilo que a pressa esconde.', ['ansiedade', 'confusão']],
    ['Henry David Thoreau|Nunca é tarde para abandonar uma forma de pensar que já não resiste à experiência.', ['confusão', 'autoconhecimento']],
    ['Henry David Thoreau|Melhorar a qualidade do dia é uma das artes mais importantes que podemos praticar.', ['esperança', 'falta_de_proposito']],
    ['Henry David Thoreau|Thoreau foi para os bosques porque desejava viver deliberadamente: queria encarar apenas os fatos essenciais e aprender o que a vida tinha a ensinar. Seu gesto não era uma fuga do mundo, mas uma pergunta. Quanto de nossa rotina foi realmente escolhido, e quanto apenas se acumulou sem que percebêssemos?', ['falta_de_proposito', 'autoconhecimento']],
    ['Simone Weil|Oferecer atenção verdadeira, sem pressa para responder, é uma maneira profunda de cuidar de alguém.', ['amor', 'solidão']],
    ['Simone Weil|Olhar de verdade já é começar a amar.', ['amor']],
    ['Simone Weil|O silêncio ajuda você a perceber necessidades profundas que o ruído cotidiano costuma esconder.', ['solidão', 'confusão']],
    ['Simone Weil|Compaixão é acolher o sofrimento de alguém sem transformá-lo em vantagem, espetáculo ou julgamento.', ['amor', 'culpa']],
    ['Buda — Sutta Nipata|Trate cada ser com o cuidado de quem deseja que ninguém viva dominado pelo medo.', ['medo', 'raiva']],
    ['Buda — Sutta Nipata|Nos ensinamentos budistas antigos, a hostilidade não termina quando recebe mais hostilidade. Ela perde força quando alguém interrompe o ciclo com atenção e compaixão. Isso não significa aceitar injustiça; significa agir sem permitir que o ressentimento transforme você naquilo que deseja combater.', ['raiva']],
    ['Ralph Waldo Emerson|Respeitar a si mesmo é o primeiro modo pelo qual a grandeza aparece.', ['autoconhecimento']],
    ['Ralph Waldo Emerson|Confiar em si não significa acreditar que nunca se engana. Significa escutar a própria consciência antes de se curvar automaticamente ao costume e à opinião. Emerson via a imitação como perda de potência: uma vida autêntica começa quando a pessoa aceita o risco de pensar e responder com a própria voz.', ['autoconhecimento', 'esperança']],
    ['Rumi|O cuidado que você procura também precisa começar na maneira como acolhe a si mesmo.', ['amor', 'autoconhecimento']],
    ['Rumi|Uma ferida reconhecida pode mostrar onde você precisa de cuidado, mudança e compreensão.', ['tristeza', 'autoconhecimento']],
    ['Rumi|Quando você age de acordo com aquilo que valoriza, torna-se mais capaz de reconhecer oportunidades compatíveis com sua busca.', ['falta_de_proposito', 'esperança']],
    ['Rumi|Quando você reconhece honestamente o que sente e valoriza, suas escolhas podem ganhar uma direção mais clara.', ['autoconhecimento', 'confusão']],
    ['Sabedoria suméria|Uma palavra dita sem cuidado pode causar um conflito que muitas palavras não conseguem desfazer.', ['culpa', 'raiva']],
    ['Sabedoria suméria|Quem promete sem pensar cria para si uma obrigação que talvez não consiga cumprir.', ['culpa', 'ansiedade']],
    ['Sabedoria suméria|A riqueza pode desaparecer; o resultado de uma ação justa permanece na memória das pessoas.', ['esperança', 'autoconhecimento']],
    ['Sabedoria suméria|Ouvir um conselho antes de agir custa menos do que reparar uma decisão tomada com orgulho.', ['culpa', 'autoconhecimento']],
    ['Sabedoria suméria|Os provérbios mesopotâmicos tratavam a palavra como uma ação com consequências. Uma frase impensada podia destruir acordos e relações construídos lentamente. A lição continua atual: antes de falar, considere se suas palavras esclarecem, protegem ou apenas descarregam um impulso momentâneo.', ['raiva', 'culpa']],
    ['Viktor Frankl|A esperança pode surgir quando encontramos uma pessoa, responsabilidade ou tarefa que dê direção ao próximo passo.', ['esperança', 'falta_de_proposito']],
    ['Bardo Thodol|O Bardo Thodol ensina a reconhecer experiências assustadoras como manifestações passageiras da mente. Em linguagem cotidiana, isso significa observar pensamentos intensos sem concluir imediatamente que eles descrevem a realidade. A mente pode produzir imagens convincentes; conferir os fatos devolve clareza.', ['medo', 'confusão']],
    ['Marco Aurélio|A calma cresce quando você concentra sua energia naquilo que realmente pode escolher ou modificar.', ['ansiedade']],
    ['Marco Aurélio|Volte ao presente: é nele que sua força pode agir.', ['ansiedade', 'esperança']],
    ['Platão|O conhecimento que não transforma o coração é apenas informação.', ['autoconhecimento']],
    ['Platão|A vida ganha direção quando suas escolhas se aproximam daquilo que você reconhece como verdadeiro.', ['falta_de_proposito', 'autoconhecimento']],
    ['Platão|A atenção à beleza pode ensinar você a perceber valor e significado além da utilidade imediata.', ['autoconhecimento', 'falta_de_proposito']],
    ['Platão|Buscar a verdade exige examinar não apenas os fatos, mas também os desejos que influenciam seu julgamento.', ['confusão', 'autoconhecimento']],
    ['Platão|Sair da aparência não significa desprezar o mundo, mas aprender a perguntar o que há por trás da primeira impressão. Uma opinião pode parecer luminosa e ainda assim nos manter presos. Filosofar começa quando os olhos se acostumam lentamente a uma verdade que antes incomodava.', ['confusão', 'autoconhecimento']],
    ['Sócrates|Conhece-te a ti mesmo: é aí que a vida começa a responder.', ['autoconhecimento']],
    ['Sócrates|A pergunta certa abre mais caminho que uma resposta apressada.', ['confusão', 'autoconhecimento']],
    ['Sócrates|A sabedoria começa quando reconhecemos o que ainda não sabemos.', ['autoconhecimento', 'confusão']],
    ['Sócrates|Uma pergunta honesta pode desmontar certezas que pareciam antigas demais para serem tocadas. Sócrates não oferecia conforto rápido: convidava cada pessoa a examinar as razões de sua vida. Às vezes, descobrir que não sabemos é justamente o espaço de que uma escolha mais sábia precisava.', ['confusão', 'autoconhecimento']],
    ['Nietzsche|Torne-se quem você é, passo por passo.', ['autoconhecimento', 'falta_de_proposito']],
    ['Fernando Pessoa|Aquilo que mais importa nem sempre é visível de imediato; a quietude ajuda a perceber valores, vínculos e necessidades profundas.', ['autoconhecimento', 'confusão']],
    ['Fernando Pessoa|A saudade é uma presença que aprendeu a ficar longe.', ['saudade', 'luto']],
    ['Fernando Pessoa|O silêncio pode expressar sentimentos que você ainda não conseguiu organizar em palavras.', ['confusão', 'saudade']],
    ['Sêneca|A vida parece mais inteira quando damos atenção ao momento que realmente estamos vivendo.', ['ansiedade', 'esperança']],
    ['Sêneca|A serenidade aumenta quando deixamos de exigir controle sobre acontecimentos e decisões que não dependem de nós.', ['ansiedade']],
    ['Hannah Arendt|Pensar é conversar honestamente consigo mesmo.', ['autoconhecimento']],
    ['Hannah Arendt|Começar algo novo é sempre entrar num mundo que já existia antes de nós. Não controlamos inteiramente o resultado, mas ainda respondemos pelo gesto inicial. A liberdade aparece nesse risco: interromper a repetição e oferecer uma possibilidade que antes não estava presente.', ['esperança', 'falta_de_proposito']],
    ['Schopenhauer|A compaixão não elimina uma dificuldade, mas torna seu peso menos solitário e mais humano.', ['tristeza', 'solidão']],
    ['Schopenhauer|Compreender a realidade sem compaixão pode nos tornar frios; lucidez e humanidade precisam caminhar juntas.', ['autoconhecimento', 'amor']],
    ['Schopenhauer|Há dores que pedem menos explicação e mais humanidade.', ['tristeza', 'amor']],
    ['Osho|Maturidade é proteger sua paz por meio de limites responsáveis, mesmo quando outras pessoas não aprovam sua decisão.', ['inseguranca', 'autoconhecimento']],
    ['Steve Jobs|Foco é dizer não ao que tenta comprar sua energia.', ['falta_de_proposito', 'autoconhecimento']],
    ['Steve Jobs|A opinião dos outros não deve ter a chave da sua vida.', ['inseguranca', 'autoconhecimento']],
    ['Carl Jung|A raiva pode indicar que um limite importante foi ignorado ou ultrapassado.', ['raiva', 'autoconhecimento']],
    ['Carl Jung|Uma irritação intensa pode revelar valores, feridas ou limites que ainda precisam ser compreendidos.', ['raiva', 'autoconhecimento']],
    ['Carl Jung|Reconhecer suas qualidades é importante, mas perceber onde você precisa estabelecer limites também é parte do autoconhecimento.', ['autoconhecimento']],
    ['Maya Angelou|Quando alguém mostra quem é, acredite no gesto e cuide de você.', ['medo', 'raiva']],
    ['Maya Angelou|Você pode perdoar sem devolver o mesmo lugar a alguém.', ['raiva', 'culpa']],
    ['Maya Angelou|Não transforme sua generosidade em dívida para ninguém pagar.', ['culpa', 'autoconhecimento']],
    ['Ptahhotep|Ninguém nasce sábio; aprender a ouvir é o começo de toda sabedoria.', ['autoconhecimento', 'confusão']],
    ['Ptahhotep|Se você ocupa uma posição de autoridade, use o conhecimento para servir, não para humilhar.', ['autoconhecimento', 'culpa']],
    ['Ptahhotep|A pessoa que realmente sabe continua disposta a aprender com quem sabe menos.', ['autoconhecimento']],
    ['Ptahhotep|As instruções de Ptahhotep colocam a escuta no centro da sabedoria. Uma pessoa pode ter experiência e ainda não possuir toda a compreensão. Por isso, ouvir alguém com atenção não diminui sua autoridade; amplia sua capacidade de julgar com justiça e responder sem arrogância.', ['autoconhecimento', 'confusão']],
    ['Clarice Lispector|Nem toda compreensão nasce do raciocínio; sentimentos também revelam o que importa para você.', ['amor', 'autoconhecimento']],
    ['Clarice Lispector|Há verdades que só aparecem quando a gente aceita sentir.', ['amor', 'autoconhecimento']],
    ['Clarice Lispector|Uma pausa consciente pode abrir espaço para uma maneira nova de viver e escolher.', ['esperança', 'confusão']],
    ['Clarice Lispector|Há momentos em que compreender não é organizar tudo em palavras. É perceber uma mudança silenciosa acontecendo por dentro e suportar o instante em que a antiga forma de viver já não serve, enquanto a nova ainda não recebeu nome.', ['confusão', 'autoconhecimento']],
    ['Epicteto|Separe o que depende de você do que pertence ao mundo.', ['ansiedade']],
    ['Epicteto|A liberdade cresce quando a mente deixa de obedecer ao impulso.', ['ansiedade', 'raiva']],
    ['Epicteto|Dignidade é escolher uma resposta coerente mesmo diante de acontecimentos que você não pôde evitar.', ['culpa', 'autoconhecimento']],
    ['Epicteto|Há coisas que dependem de nós e coisas que não dependem. Nossos julgamentos, desejos e escolhas nos pertencem; a reputação, o corpo dos outros e os acontecimentos externos não obedecem inteiramente à nossa vontade. Confundir esses dois campos produz ansiedade. Separá-los devolve liberdade para agir onde uma ação ainda é possível.', ['ansiedade']],
    ['Jiddu Krishnamurti|A verdade sobre você se torna mais clara quando sua mente reconhece os próprios medos, desejos e contradições.', ['autoconhecimento', 'confusão']],
    ['Jiddu Krishnamurti|Olhar para dentro sem julgamento já é o começo da transformação.', ['autoconhecimento']],
    ['Jiddu Krishnamurti|A clareza nasce quando você para de lutar contra o que sente.', ['ansiedade', 'confusão']],
    ['Jiddu Krishnamurti|Observar a própria mente sem tentar corrigi-la imediatamente é um gesto raro. Quando nomeamos depressa cada emoção, enxergamos apenas a palavra. Permanecer alguns instantes com aquilo que sentimos permite perceber movimentos mais profundos: medo, defesa, desejo e memória deixando de agir escondidos.', ['autoconhecimento', 'confusão']],
    ['Kierkegaard|Você constrói sua identidade quando assume responsabilidade pelas próprias escolhas.', ['autoconhecimento', 'falta_de_proposito']],
    ['Kierkegaard|A fé começa onde a certeza já não consegue carregar tudo.', ['medo', 'falta_de_proposito']],
    ['Kierkegaard|A vida só se entende olhando para trás, mas se vive para frente.', ['saudade', 'falta_de_proposito']],
    ['Nisargadatta Maharaj|Aquilo que observa a mente não precisa obedecer a cada movimento da mente.', ['ansiedade', 'confusão']],
    ['Nisargadatta Maharaj|A ansiedade perde parte do domínio quando deixa de ser confundida com identidade.', ['ansiedade']],
    ['Nisargadatta Maharaj|O silêncio não precisa ser produzido; ele aparece quando a busca descansa por um instante.', ['ansiedade', 'confusão']],
    ['Ralph Waldo Emerson|Confie em si: toda voz verdadeira começa quando você deixa de viver apenas pelo olhar dos outros.', ['autoconhecimento', 'esperança']],
    ['Ralph Waldo Emerson|Aquilo que você pensa com honestidade pode encontrar eco em outros corações.', ['esperança']],
    ['Ralph Waldo Emerson|A imitação enfraquece; a autenticidade dá forma à própria vida.', ['autoconhecimento', 'falta_de_proposito']],
  ]);
  return authorsDb.flatMap((a) => {
    const quoteVariants = (authorQuoteVariants[a.author] || [a.quote]).map((entry) => {
      const quote = typeof entry === 'string' ? entry : entry.text;
      return {
      text: clarityRewrites[quote] || quote,
      contentType: 'quote',
      source: typeof entry === 'string' ? '' : entry.source,
    };
    });
    const textVariants = [
      ...(authorTextVariants[a.author] || []),
      ...(supplementalTextVariants[a.author] || []),
    ].map((entry) => ({
      ...entry,
      contentType: 'text',
    }));

    return [...quoteVariants, ...textVariants].map((entry, variantIndex) => {
      const quote = entry.text;
      const verified = verifiedQuoteMetadata[quote];
      const tone = inferTone(a.author);
      const depth = entry.contentType === 'text' ? 5 : Math.min(5, 3 + Math.floor(quote.length / 90));
      const themes = inferTextThemes(quote, a.tags);
      return {
        ...a,
        quote,
        variantIndex,
        contentType: entry.contentType,
        quoteType: verified?.type || (verified ? 'exact' : 'inspired'),
        editorialStatus: verified?.editorialStatus || entry.editorialStatus || (editorialVariantQuarantine.has(`${a.author}|${quote}`) ? 'quarantine' : ''),
        displayAuthor: verified?.author || a.author,
        source: verified?.source || entry.source || `Leitura editorial inspirada em ${a.author}`,
        _tagsN: a.tags.map(normalizeTheme),
        sentimentos: editorialFeelingOverrides.get(`${a.author}|${quote}`) || inferContentFeelings(a.tags),
        intensidade: inferIntensities(tone, depth),
        temas: themes,
        tom: tone,
        profundidade: depth,
        incompativeis: inferIncompatibleStates(tone),
        riskTags: (entry.riskTags || a.riskTags || []).map(normalizeTheme),
      };
    });
  }).filter((item) => !['quarantine', 'removed'].includes(item.editorialStatus));
}

function normalizeContentKey(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

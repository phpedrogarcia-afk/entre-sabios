// Dados extraídos de script.js durante a Fase 2 da refatoração segura.
// Não alterar conteúdo editorial nesta fase.
(function initEntreSabiosData(root) {
  const data = root.EntreSabiosData = root.EntreSabiosData || {};

data.authorsDb = [
  {
    author: 'Jiddu Krishnamurti',
    tags: ['observação', 'verdade', 'ansiedade', 'silêncio'],
    quote: 'A verdade não é algo que possa ser alcançada. Ela surge quando a mente compreende a si mesma.',
    reflectionTemplate: (t) =>
      `Quando você sente ${t.join(', ')}, há um ponto de observação: perceber sem se defender. A sabedoria não vem de fugir — vem de enxergar. É nesse olhar silencioso que a clareza aparece.`,
    adviceTemplate: (t) =>
      `Observe ${t.join(', ')} sem pressa.
Respire.
Deixe a compreensão nascer.`,
  },
  {
    author: 'Krishnamurti',
    tags: ['silêncio', 'aceitação', 'ansiedade', 'observação'],
    quote: 'A mente aquieta quando deixa de lutar contra o que já é.',
    reflectionTemplate: (t) =>
      `Se ${t.join(', ')} aparecem, não é para te quebrar — é para te ensinar a ficar com o que é. Aceitar sem concordar é diferente de resistir sem ver. A calma começa no instante em que você observa.` ,
    adviceTemplate: (t) =>
      `Escolha uma pausa verdadeira.
Olhe com honestidade.
Então aja.` ,
  },
  {
    author: 'Nisargadatta Maharaj',
    tags: ['ansiedade', 'confusão', 'autoconhecimento', 'consciência', 'identificação', 'observação', 'não-dualidade', 'mente', 'silêncio', 'busca externa'],
    quote: 'Aquilo que observa a mente não precisa obedecer a cada movimento da mente.',
    reflectionTemplate: (t) =>
      `Quando ${t.join(', ')} aparecem, Nisargadatta convidaria você a olhar para quem percebe tudo isso. O pensamento muda, a emoção muda, a história muda; mas há uma presença capaz de observar a mudança sem ser reduzida por ela.`,
    adviceTemplate: () =>
      `Observe o pensamento surgir.
Pergunte quem percebe.
Descanse antes de responder.`,
  },
  {
    author: 'Chögyam Trungpa',
    tags: ['confusão', 'autoconhecimento', 'culpa', 'ansiedade', 'medo', 'ego espiritual', 'autoengano', 'identificação', 'presença', 'desconstrução', 'observação'],
    quote: 'Até a busca por paz pode virar uma maneira elegante de proteger o ego.',
    reflectionTemplate: (t) =>
      `Diante de ${t.join(', ')}, Trungpa não ofereceria consolo decorativo. Ele perguntaria onde a tentativa de melhorar a si mesmo virou imagem, defesa ou controle. A prática começa quando a espiritualidade deixa de ser fantasia sobre quem queremos parecer.`,
    adviceTemplate: () =>
      `Note a máscara.
Volte ao corpo.
Pratique sem pose.`,
  },
  {
    author: 'Platão',
    tags: ['verdade', 'amor', 'conhecimento', 'silêncio'],
    quote: 'O conhecimento que não transforma o coração é apenas informação.',
    reflectionTemplate: (t) =>
      `Você vive ${t.join(', ')}, e isso pede transformação, não explicações rápidas. Quando o coração aprende, o pensamento ganha direção. O que você sente se torna caminho para entender melhor a vida.` ,
    adviceTemplate: (t) =>
      `Troque urgência por presença.
Pergunte: o que isso ensina?
Siga o que for essencial.` ,
  },
  {
    author: 'Sócrates',
    tags: ['autoconhecimento', 'sabedoria', 'verdade', 'observação'],
    quote: 'Conhece-te a ti mesmo: é aí que a vida começa a responder.',
    reflectionTemplate: (t) =>
      `Se ${t.join(', ')} te visitam, use-as como pergunta. O autoexame não é culpa — é clareza. Ao compreender o que acontece em você, você para de ser arrastado e passa a escolher.` ,
    adviceTemplate: (t) =>
      `Faça uma pergunta simples.
Ouça a resposta com calma.
Decida com base no que é real.` ,
  },
  {
    author: 'Marco Aurélio',
    tags: ['ansiedade', 'disciplina', 'aceitação', 'controle emocional'],
    quote: 'Você não pode controlar o mundo. Mas pode controlar sua resposta.',
    reflectionTemplate: (t) =>
      `Quando surge ${t.join(', ')}, lembre-se: a emoção chega — mas a resposta depende de você. Disciplina não é rigidez; é escolher como agir diante do que não está sob seu alcance.` ,
    adviceTemplate: (t) =>
      `Diga: “o que depende de mim?”
Então faça apenas isso.
O resto pertence ao tempo.` ,
  },
  {
    author: 'Epicteto',
    tags: ['sofrimento', 'controle emocional', 'aceitação', 'disciplina'],
    quote: 'A liberdade começa quando distinguimos o acontecimento do julgamento que fazemos dele.',
    reflectionTemplate: (t) =>
      `Se ${t.join(', ')}, cuidado com a interpretação automática. A sabedoria começa quando você nota a história que a mente inventa. A partir daí, você escolhe uma leitura mais humana.` ,
    adviceTemplate: (t) =>
      `Nomeie o pensamento.
Separe fato de interpretação.
Escolha uma ação digna.` ,
  },
  {
    author: 'Nietzsche',
    tags: ['coragem', 'propósito', 'superação', 'medo'],
    quote: 'Aquilo que não te destrói te torna mais forte — se você olhar por dentro.',
    reflectionTemplate: (t) =>
      `Mesmo com ${t.join(', ')}, existe uma força que cresce quando você enfrenta com coragem. Não é romantizar a dor; é transformar o olhar. A superação nasce do compromisso com a vida.` ,
    adviceTemplate: (t) =>
      `Assuma uma pequena coragem hoje.
Faça o próximo passo.
Recomece sem violência.` ,
  },
  {
    author: 'Clarice Lispector',
    tags: ['amor', 'solidão', 'introspecção', 'esperança'],
    quote: 'Não se preocupe em entender tudo; viver ultrapassa qualquer explicação completa.',
    reflectionTemplate: (t) =>
      `Se você sente ${t.join(', ')}, há um convite à intimidade. Introspecção não é ficar preso; é encontrar verdade. Ao olhar para dentro com gentileza, você devolve ao coração um rumo possível.` ,
    adviceTemplate: (t) =>
      `Escreva o que é real.
Depois respire.
Escolha o gesto certo agora.` ,
  },
  {
    author: 'Fernando Pessoa',
    tags: ['saudade', 'existência', 'melancolia', 'silêncio'],
    quote: 'O essencial é invisível aos olhos: mora na quietude.',
    reflectionTemplate: (t) =>
      `Você carrega ${t.join(', ')}. Talvez não precise resolver tudo — talvez precise apenas ficar um pouco com o que sente, até que o essencial se revele. A melancolia também ensina ritmo.` ,
    adviceTemplate: (t) =>
      `Não apresse a compreensão.
Escute a saudade.
Deixe o sentido chegar.` ,
  },
  {
    author: 'Dostoiévski',
    tags: ['sofrimento', 'fé', 'condição humana', 'amor', 'culpa', 'responsabilidade', 'reparação'],
    quote: 'Há um ponto em que o sofrimento se torna caminho de retorno.',
    reflectionTemplate: (t) =>
      `Quando ${t.join(', ')} aparecem, pode existir dor — e também um chamado. O coração reconhece a condição humana quando para de se culpar e começa a buscar um amor mais honesto.` ,
    adviceTemplate: (t) =>
      `Procure um sentido humano.
Seja gentil com o processo.
O que vem, você atravessa.` ,
  },
  {
    author: 'Viktor Frankl',
    tags: ['propósito', 'significado', 'sofrimento', 'esperança', 'responsabilidade', 'autocompaixão'],
    quote: 'Quando não podemos mudar uma situação, somos desafiados a mudar nossa maneira de responder a ela.',
    reflectionTemplate: (t) =>
      `Se ${t.join(', ')}, não é só peso — pode virar direção. Quando você encontra significado, o sofrimento muda de lugar dentro de você. O propósito não é grandioso: é decidido.` ,
    adviceTemplate: (t) =>
      `Escolha um porquê pequeno.
Faça hoje um gesto.
A direção nasce na prática.` ,
  },
  {
    author: 'Rumi',
    tags: ['amor', 'espiritualidade', 'coragem', 'silêncio'],
    quote: 'Você é o amor que procura. Comece por sentir com verdade.',
    reflectionTemplate: (t) =>
      `Com ${t.join(', ')}, o caminho é espiritual: não fugir do que existe. Quando você acolhe com verdade, o amor aparece como presença e coragem. A meditação é apenas viver atento.` ,
    adviceTemplate: (t) =>
      `Sente sem se defender.
Perceba onde há amor.
Então siga.` ,
  },
  {
    author: 'Sêneca',
    tags: ['ansiedade', 'tempo', 'disciplina', 'aceitação', 'gratidão'],
    quote: 'A vida se amplia quando aprendemos a habitar o tempo presente.',
    reflectionTemplate: (t) =>
      `Quando ${t.join(', ')} ocupam espaço, Sêneca lembraria que a mente sofre mais no excesso de antecipação do que no instante real. Voltar ao que pode ser vivido hoje devolve medida ao coração.`,
    adviceTemplate: (t) =>
      `Volte ao dia de hoje.
Escolha uma ação simples.
Não entregue sua paz ao amanhã.`,
  },
  {
    author: 'Lao-Tsé',
    tags: ['aceitação', 'confusão', 'silêncio', 'simplicidade', 'observação'],
    quote: 'A água vence porque não endurece.',
    reflectionTemplate: (t) =>
      `Se ${t.join(', ')} surgem, talvez o caminho não seja forçar uma resposta, mas simplificar. Lao-Tsé aponta para a sabedoria que se move com a vida sem perder o centro.`,
    adviceTemplate: (t) =>
      `Solte uma resistência.
Faça menos, com presença.
Deixe a clareza se aproximar.`,
  },
  {
    author: 'Confúcio',
    tags: ['disciplina', 'gratidão', 'sabedoria', 'propósito', 'ação'],
    quote: 'O caminho se constrói no cuidado com os pequenos gestos.',
    reflectionTemplate: (t) =>
      `Com ${t.join(', ')}, a resposta pode estar na prática diária. Confúcio ensina que a vida ganha forma quando pequenas atitudes repetidas educam o caráter.`,
    adviceTemplate: (t) =>
      `Escolha um gesto correto.
Repita com humildade.
Deixe o caráter conduzir.`,
  },
  {
    author: 'Aristóteles',
    tags: ['propósito', 'coragem', 'virtude', 'equilíbrio', 'sabedoria'],
    quote: 'A virtude nasce do hábito de escolher o meio justo.',
    reflectionTemplate: (t) =>
      `Quando ${t.join(', ')} aparecem, Aristóteles convidaria você a buscar equilíbrio: nem fugir do sentimento, nem ser dominado por ele. A maturidade cresce no exercício da escolha.`,
    adviceTemplate: (t) =>
      `Procure o meio justo.
Faça o bem possível.
Fortaleça o hábito certo.`,
  },
  {
    author: 'Kierkegaard',
    tags: ['ansiedade', 'fé', 'escolha', 'medo', 'existência'],
    quote: 'A ansiedade é a vertigem da liberdade.',
    reflectionTemplate: (t) =>
      `Se ${t.join(', ')} pesam, Kierkegaard veria nisso uma fronteira: algo em você está diante de uma escolha. A angústia pode virar responsabilidade quando encontra coragem e fé.`,
    adviceTemplate: (t) =>
      `Nomeie sua escolha.
Aceite o tremor.
Dê um passo verdadeiro.`,
  },
  {
    author: 'Simone Weil',
    tags: ['atenção', 'sofrimento', 'amor', 'silêncio', 'espiritualidade', 'autocompaixão'],
    quote: 'A atenção pura é uma forma rara de generosidade.',
    reflectionTemplate: (t) =>
      `Diante de ${t.join(', ')}, Simone Weil lembraria que atenção é cuidado. Olhar para a dor sem pressa e sem uso é uma forma de devolver dignidade ao que você sente.`,
    adviceTemplate: (t) =>
      `Dê atenção ao que dói.
Não transforme tudo em pressa.
Permaneça com delicadeza.`,
  },
  {
    author: 'Hannah Arendt',
    tags: ['ação', 'coragem', 'responsabilidade', 'verdade', 'liberdade'],
    quote: 'A liberdade aparece quando alguém começa algo no mundo.',
    reflectionTemplate: (t) =>
      `Com ${t.join(', ')}, Hannah Arendt lembraria que pensar precisa encontrar ação. A liberdade não é só sentir-se pronto; às vezes é começar com responsabilidade.`,
    adviceTemplate: (t) =>
      `Pense com honestidade.
Escolha uma ação responsável.
Comece pequeno, mas comece.`,
  },
  {
    author: 'Schopenhauer',
    tags: ['tristeza', 'sofrimento', 'melancolia', 'existência', 'compaixão'],
    quote: 'A compaixão suaviza aquilo que a vida torna pesado.',
    reflectionTemplate: (t) =>
      `Quando ${t.join(', ')} atravessam você, Schopenhauer pode ajudar a reconhecer o peso da existência sem cinismo. A compaixão torna a lucidez menos fria.`,
    adviceTemplate: (t) =>
      `Não negue o peso.
Procure compaixão.
Deixe a lucidez ficar humana.`,
  },
  {
    author: 'Bhagavad Gita',
    tags: ['ação', 'desapego', 'propósito', 'coragem', 'raiva', 'dignidade'],
    quote: 'Aja com inteireza, mas não entregue sua paz ao resultado.',
    reflectionTemplate: (t) =>
      `Quando ${t.join(', ')} surgem, a sabedoria do Bhagavad Gita lembra que agir bem não significa controlar a reação do outro. Seu gesto fala sobre você; a resposta alheia fala sobre quem a oferece.`,
    adviceTemplate: (t) =>
      `Faça sua parte sem se prender.
Não cobre alma de ninguém.
Proteja sua dignidade.`,
  },
  {
    author: 'Osho',
    tags: ['raiva', 'consciência', 'liberdade', 'desapego', 'amor', 'limites'],
    quote: 'A raiva observada perde o veneno e revela onde você precisa de liberdade.',
    reflectionTemplate: (t) =>
      `Se ${t.join(', ')} aparecem, Osho apontaria para a consciência: não reprima, mas também não entregue seu centro. Às vezes a melhor resposta é retirar a energia de quem só entende presença como obrigação.`,
    adviceTemplate: (t) =>
      `Observe antes de reagir.
Retire sua energia do desgaste.
Escolha liberdade, não vingança.`,
  },
  {
    author: 'Steve Jobs',
    tags: ['propósito', 'coragem', 'ação', 'foco', 'autenticidade', 'limites'],
    quote: 'Seu tempo é limitado; não gaste sua vida representando o roteiro de outra pessoa.',
    reflectionTemplate: (t) =>
      `Com ${t.join(', ')}, Steve Jobs lembraria que foco também é saber dizer não. Nem todo pedido merece sua energia, e nem toda opinião precisa virar direção para sua vida.`,
    adviceTemplate: (t) =>
      `Corte o ruído.
Escolha o que importa.
Faça algo que tenha sua assinatura.`,
  },
  {
    author: 'Carl Jung',
    tags: ['raiva', 'sombra', 'autoconhecimento', 'inconsciente', 'limites'],
    quote: 'Aquilo que você evita compreender dentro de si acaba influenciando suas escolhas sem que você perceba.',
    reflectionTemplate: (t) =>
      `Quando ${t.join(', ')} se levantam, Jung lembraria que a sombra também pede escuta. A raiva pode mostrar um limite violado, uma verdade engolida ou uma força que precisa amadurecer.`,
    adviceTemplate: (t) =>
      `Pergunte o que foi ferido.
Não negue sua sombra.
Transforme reação em limite.`,
  },
  {
    author: 'Maya Angelou',
    tags: ['dignidade', 'limites', 'coragem', 'raiva', 'superação'],
    quote: 'Quando alguém mostra quem é, acredite no gesto e cuide de você.',
    reflectionTemplate: (t) =>
      `Diante de ${t.join(', ')}, Maya Angelou inspira um tipo de firmeza elegante: não é preciso humilhar ninguém para sair inteiro. Às vezes a resposta mais forte é não negociar mais sua dignidade.`,
    adviceTemplate: (t) =>
      `Acredite nos sinais.
Pare de se explicar demais.
Escolha sua dignidade.`,
  },
  {
    author: 'Machado de Assis',
    tags: ['indiretas', 'ironia', 'desapego', 'raiva', 'verdade'],
    quote: 'Há silêncios que dizem mais sobre uma pessoa do que suas melhores justificativas.',
    reflectionTemplate: (t) =>
      `Se ${t.join(', ')} pedem uma indireta, Machado lembraria que ironia boa não precisa gritar. A frase certa deixa a porta aberta para a consciência do outro, sem prender você no ressentimento.`,
    adviceTemplate: (t) =>
      `Seja fino, não cruel.
Diga pouco e diga bem.
Depois siga leve.`,
  },
  {
    author: 'Frank Herbert',
    tags: ['medo', 'coragem', 'mente', 'autoconhecimento', 'superação'],
    quote: 'Eu não devo ter medo. O medo é o assassino da mente.',
    reflectionTemplate: (t) =>
      `Diante de ${t.join(', ')}, Herbert transforma o medo em algo que pode ser observado e atravessado. Sentir medo não precisa significar entregar a ele o comando da mente.`,
    adviceTemplate: () =>
      `Reconheça o medo.
Deixe-o atravessar sem comandar.
Volte ao que permanece em você.`,
  },
  {
    author: 'Henry David Thoreau',
    tags: ['simplicidade', 'propósito', 'autenticidade', 'coragem', 'observação'],
    quote: 'Viver deliberadamente é separar o essencial do ruído antes que o tempo passe sem ter sido realmente vivido.',
    reflectionTemplate: (t) =>
      `Diante de ${t.join(', ')}, Thoreau convida você a diminuir o ruído e perceber o que é realmente necessário. Uma vida consciente começa em escolhas simples e próprias.`,
    adviceTemplate: () =>
      `Simplifique uma coisa.
Proteja o que é essencial.
Viva o dia com intenção.`,
  },
  {
    author: 'Ralph Waldo Emerson',
    tags: ['autoconhecimento', 'coragem', 'autenticidade', 'liberdade', 'propósito'],
    quote: 'Confie em si: toda voz verdadeira começa quando você deixa de viver apenas pelo olhar dos outros.',
    reflectionTemplate: (t) =>
      `Com ${t.join(', ')}, Emerson lembraria que confiar em si não é saber tudo, mas respeitar a própria consciência o bastante para não entregar sua direção à aprovação alheia.`,
    adviceTemplate: () =>
      `Escute sua convicção.
Dispense uma aprovação.
Escolha com autenticidade.`,
  },
  {
    author: 'Michel de Montaigne',
    tags: ['autoconhecimento', 'sabedoria', 'medo', 'existência', 'aceitação'],
    quote: 'Aprender a viver é também aprender a não ser governado pelo medo do que ainda não aconteceu.',
    reflectionTemplate: (t) =>
      `Se ${t.join(', ')} aparecem, Montaigne propõe voltar à experiência concreta. Conhecer a própria condição humana reduz o poder das fantasias que a mente cria.`,
    adviceTemplate: () =>
      `Volte ao que é concreto.
Aceite sua humanidade.
Não sofra antes da hora.`,
  },
  {
    author: 'Dhammapada',
    tags: ['mente', 'disciplina', 'raiva', 'sofrimento', 'sabedoria', 'observação'],
    quote: 'Aquilo que somos toma forma nos pensamentos que alimentamos e nas ações que escolhemos repetir.',
    reflectionTemplate: (t) =>
      `Quando ${t.join(', ')} ocupam a mente, o Dhammapada recorda que pensamentos cultivados se transformam em palavras, hábitos e consequências. Observar o início desse ciclo permite mudá-lo.`,
    adviceTemplate: () =>
      `Observe o pensamento inicial.
Não alimente o que fere.
Repita uma ação consciente.`,
  },
  {
    author: 'Ptahhotep',
    tags: ['sabedoria', 'silêncio', 'humildade', 'disciplina', 'justiça'],
    quote: 'Ninguém nasce sábio; aprender a ouvir é o começo de toda sabedoria.',
    reflectionTemplate: (t) => `Diante de ${t.join(', ')}, a antiga sabedoria egípcia de Ptahhotep recomenda humildade, escuta e domínio das próprias palavras.`,
    adviceTemplate: () => `Escute antes de responder.
Não confunda posição com sabedoria.
Fale apenas o que melhora a situação.`,
  },
  {
    author: 'Heráclito',
    tags: ['mudança', 'aceitação', 'existência', 'sabedoria', 'coragem'],
    quote: 'Tudo muda; compreender a vida exige aprender a mudar com ela.',
    reflectionTemplate: (t) => `Quando ${t.join(', ')} surgem, Heráclito lembra que nada permanece imóvel. Aceitar a mudança permite responder ao presente em vez de lutar por um mundo que já passou.`,
    adviceTemplate: () => `Reconheça o que mudou.
Solte a antiga forma.
Responda ao presente.`,
  },
  {
    author: 'Katha Upanishad',
    tags: ['autoconhecimento', 'sabedoria', 'medo', 'disciplina', 'propósito'],
    quote: 'O agradável e o que realmente faz bem nem sempre conduzem ao mesmo caminho.',
    reflectionTemplate: (t) => `Com ${t.join(', ')}, a Katha Upanishad convida a distinguir alívio imediato de uma escolha que produz bem duradouro.`,
    adviceTemplate: () => `Diferencie prazer de benefício.
Escolha com consciência.
Proteja sua direção.`,
  },
  {
    author: 'Buda — Sutta Nipata',
    tags: ['mente', 'compaixão', 'raiva', 'sofrimento', 'silêncio', 'sabedoria'],
    quote: 'Assim como a água não se prende à folha de lótus, a mente treinada não precisa se prender ao ressentimento.',
    reflectionTemplate: (t) => `Diante de ${t.join(', ')}, os ensinamentos antigos atribuídos ao Buda propõem perceber o apego sem alimentá-lo. Soltar não apaga o acontecimento; impede que ele continue governando a mente.`,
    adviceTemplate: () => `Perceba o apego.
Não alimente o ressentimento.
Volte à compaixão lúcida.`,
  },
  {
    author: 'Bardo Thodol',
    tags: ['medo', 'mente', 'mudança', 'desapego', 'espiritualidade'],
    quote: 'Aquilo que assusta a mente pode ser uma criação da própria mente, não uma ameaça presente.',
    reflectionTemplate: (t) => `Quando ${t.join(', ')} aparecem, a tradição tibetana do Bardo Thodol convida a reconhecer imagens mentais como imagens, sem fugir delas nem tratá-las imediatamente como realidade.`,
    adviceTemplate: () => `Observe a imagem mental.
Confira o que é real agora.
Não se prenda nem fuja.`,
  },
  {
    author: 'Milarepa',
    tags: ['meditação', 'coragem', 'solidão', 'simplicidade', 'autoconhecimento'],
    quote: 'Quando a mente deixa de perseguir cada pensamento, até a solidão pode se tornar clareza.',
    reflectionTemplate: (t) => `Se ${t.join(', ')} pesam, Milarepa representa uma tradição de disciplina interior: permanecer consigo mesmo até que o ruído perca força e a experiência se torne mais clara.`,
    adviceTemplate: () => `Sente-se com o silêncio.
Não persiga cada pensamento.
Deixe a clareza amadurecer.`,
  },
  {
    author: 'Sabedoria suméria',
    tags: ['humildade', 'palavra', 'disciplina', 'sabedoria', 'responsabilidade'],
    quote: 'Uma palavra dita sem cuidado pode causar um conflito que muitas palavras não conseguem desfazer.',
    reflectionTemplate: (t) => `Com ${t.join(', ')}, antigos provérbios mesopotâmicos recordam que a palavra possui consequências. Prudência não é silêncio por medo, mas responsabilidade pelo que será colocado no mundo.`,
    adviceTemplate: () => `Pense antes de falar.
Escolha palavras proporcionais.
Não alimente conflitos desnecessários.`,
  },
  {
    author: 'Reflexão contemporânea',
    tags: ['autoconhecimento', 'identidade', 'contradição', 'sombra', 'coragem'],
    quote: 'Eu sou vários. Há multidões em mim, e à mesa da minha alma sentam-se um velho, uma criança, um sábio e um tolo.',
    reflectionTemplate: (t) =>
      `Diante de ${t.join(', ')}, reconheça que você não é uma peça única e imóvel. Conhecer-se também é perceber suas contradições, acolher o que muda e assumir responsabilidade pelo lado que escolhe colocar no mundo.`,
    adviceTemplate: () =>
      `Observe quem fala dentro de você.
Não finja ser perfeito.
Ouse conquistar a si mesmo.`,
  },
];

data.authorQuoteVariants = {
  'Jiddu Krishnamurti': [
    'A verdade não é algo que possa ser alcançada. Ela surge quando a mente compreende a si mesma.',
    'A liberdade começa quando a mente observa o medo sem fugir dele.',
    'Olhar para dentro sem julgamento já é o começo da transformação.',
    'A clareza nasce quando você para de lutar contra o que sente.',
  ],
  Krishnamurti: [
    'A mente aquieta quando deixa de lutar contra o que já é.',
    'O silêncio não é vazio: é a mente deixando de se defender.',
    'Compreender a si mesmo é mais profundo do que controlar a si mesmo.',
    'A paz aparece quando a resistência perde a pressa.',
  ],
  'Nisargadatta Maharaj': [
    { text: 'Aquilo que observa a mente não precisa obedecer a cada movimento da mente.', source: 'Leitura editorial inspirada em Eu Sou Aquilo' },
    { text: 'Antes de buscar uma saída no mundo, veja quem é aquele que se sente preso.', source: 'Leitura editorial inspirada em Eu Sou Aquilo' },
    { text: 'A ansiedade perde parte do domínio quando deixa de ser confundida com identidade.', source: 'Leitura editorial inspirada em Eu Sou Aquilo' },
    { text: 'O silêncio não precisa ser produzido; ele aparece quando a busca descansa por um instante.', source: 'Leitura editorial inspirada em Eu Sou Aquilo' },
  ],
  'Chögyam Trungpa': [
    { text: 'Até a busca por paz pode virar uma maneira elegante de proteger o ego.', source: 'Leitura editorial inspirada em Além do Materialismo Espiritual' },
    { text: 'A prática começa quando você para de transformar lucidez em decoração da autoimagem.', source: 'Leitura editorial inspirada em Além do Materialismo Espiritual' },
    { text: 'O ego sabe usar até a espiritualidade para continuar no centro da sala.', source: 'Leitura editorial inspirada em Além do Materialismo Espiritual' },
    { text: 'A presença real não melhora a máscara; ela mostra que a máscara estava trabalhando.', source: 'Leitura editorial inspirada em Além do Materialismo Espiritual' },
  ],
  Platão: [
    'O conhecimento que não transforma o coração é apenas informação.',
    'A alma encontra direção quando aprende a amar o que é verdadeiro.',
    'A beleza educa o olhar para reconhecer o essencial.',
    'Quem busca a verdade precisa também ordenar o próprio coração.',
  ],
  Sócrates: [
    'Conhece-te a ti mesmo: é aí que a vida começa a responder.',
    'Uma vida sem exame perde a chance de se tornar consciente.',
    'A pergunta certa abre mais caminho que uma resposta apressada.',
    'A sabedoria começa quando reconhecemos o que ainda não sabemos.',
  ],
  'Marco Aurélio': [
    'Você não pode controlar o mundo. Mas pode controlar sua resposta.',
    'A calma é escolher a parte da vida que depende de você.',
    'O obstáculo também é matéria para a virtude.',
    'Volte ao presente: é nele que sua força pode agir.',
  ],
  Epicteto: [
    'Não são as coisas que perturbam, mas as ideias que fazemos delas.',
    'Separe o que depende de você do que pertence ao mundo.',
    'A liberdade cresce quando a mente deixa de obedecer ao impulso.',
    'A dignidade está em responder bem ao que não escolhemos.',
  ],
  Nietzsche: [
    'Aquilo que não te destrói te torna mais forte — se você olhar por dentro.',
    'É preciso coragem para transformar a dor em criação.',
    'Quem tem um sim profundo atravessa muitos nãos.',
    'Torne-se quem você é, passo por passo.',
  ],
  'Clarice Lispector': [
    'A vida só pode ser compreendida olhando-se para trás; mas só pode ser vivida olhando-se para frente.',
    'O coração também pensa, só que em silêncio.',
    'Há verdades que só aparecem quando a gente aceita sentir.',
    'Dentro de cada pausa existe uma forma nova de nascer.',
  ],
  'Fernando Pessoa': [
    'O essencial é invisível aos olhos: mora na quietude.',
    'A saudade é uma presença que aprendeu a ficar longe.',
    'Há dias em que existir já é uma forma de poesia.',
    'O silêncio às vezes diz o que a alma ainda não consegue escrever.',
  ],
  Dostoiévski: [
    'Há um ponto em que o sofrimento se torna caminho de retorno.',
    'O coração humano carrega abismos, mas também uma sede de luz.',
    'A dor pede sentido, não condenação.',
    'Quem atravessa a noite aprende a reconhecer a compaixão.',
  ],
  'Viktor Frankl': [
    'Quem tem um porquê enfrenta qualquer como.',
    'Mesmo quando tudo pesa, ainda resta escolher uma atitude.',
    'O sentido não elimina a dor, mas muda o lugar dela em nós.',
    'A esperança começa quando encontramos uma tarefa para amar.',
  ],
  Rumi: [
    'Você é o amor que procura. Comece por sentir com verdade.',
    'A ferida é também uma porta para a luz.',
    'O que você procura também está procurando por você.',
    'Quando o coração se abre, o caminho aparece por dentro.',
  ],
  Sêneca: [
    'A vida se amplia quando aprendemos a habitar o tempo presente.',
    'Sofremos mais na imaginação do que na realidade.',
    'Não é pouco tempo que temos, mas muito tempo que desperdiçamos.',
    'A serenidade nasce quando desejamos menos do que não depende de nós.',
  ],
  'Lao-Tsé': [
    'A água vence porque não endurece.',
    'Quem se apressa perde o ritmo do caminho.',
    'O simples sustenta aquilo que o excesso confunde.',
    'Quando nada é forçado, algo verdadeiro pode aparecer.',
  ],
  Confúcio: [
    'O caminho se constrói no cuidado com os pequenos gestos.',
    'A constância transforma o comum em sabedoria.',
    'O respeito começa dentro das pequenas escolhas.',
    'Aprender sem refletir é perder-se; refletir sem agir é parar.',
  ],
  Aristóteles: [
    'A virtude nasce do hábito de escolher o meio justo.',
    'Somos aquilo que fazemos repetidamente.',
    'A coragem é medida entre o medo e a imprudência.',
    'A felicidade floresce quando a alma age com propósito.',
  ],
  Kierkegaard: [
    'A ansiedade é a vertigem da liberdade.',
    'O eu se torna real quando escolhe com responsabilidade.',
    'A fé começa onde a certeza já não consegue carregar tudo.',
    'A vida só se entende olhando para trás, mas se vive para frente.',
  ],
  'Simone Weil': [
    'A atenção pura é uma forma rara de generosidade.',
    'Olhar de verdade já é começar a amar.',
    'A alma precisa de silêncio para reconhecer sua fome.',
    'A compaixão começa quando paramos de usar a dor do outro.',
  ],
  'Hannah Arendt': [
    'A liberdade aparece quando alguém começa algo no mundo.',
    'Pensar é conversar honestamente consigo mesmo.',
    'Agir é aceitar que a vida pede presença pública e coragem.',
    'Toda responsabilidade começa quando deixamos de ser espectadores.',
  ],
  Schopenhauer: [
    'A compaixão suaviza aquilo que a vida torna pesado.',
    'A lucidez precisa de ternura para não virar dureza.',
    'Há dores que pedem menos explicação e mais humanidade.',
    'Quem reconhece o sofrimento aprende a respeitar a vida.',
  ],
  'Bhagavad Gita': [
    'Aja com inteireza, mas não entregue sua paz ao resultado.',
    'O gesto correto pertence a você; a reação pertence ao outro.',
    'Faça o que deve ser feito sem transformar ninguém em devedor.',
    'Quem age por consciência não precisa cobrar gratidão como recibo.',
  ],
  Osho: [
    'A raiva observada perde o veneno e revela onde você precisa de liberdade.',
    'Não faça da sua ajuda uma prisão; amor com cobrança vira comércio.',
    'Quando você para de reagir, certas pessoas perdem o controle que tinham.',
    'A maturidade começa quando você escolhe paz sem pedir permissão.',
  ],
  'Steve Jobs': [
    'Seu tempo é limitado; não gaste sua vida representando o roteiro de outra pessoa.',
    'Foco é dizer não ao que tenta comprar sua energia.',
    'A opinião dos outros não deve ter a chave da sua vida.',
    'Quem sabe o que quer não negocia a própria direção por aprovação.',
  ],
  'Carl Jung': [
    'Aquilo que você evita compreender dentro de si acaba influenciando suas escolhas sem que você perceba.',
    'A raiva revela uma fronteira que talvez você tenha abandonado.',
    'O que irrita profundamente também pode ensinar profundamente.',
    'Não ilumine só sua bondade; reconheça também onde você precisa de limite.',
  ],
  'Maya Angelou': [
    'Quando alguém mostra quem é, acredite no gesto e cuide de você.',
    'Dignidade é sair antes que a alma precise implorar respeito.',
    'Você pode perdoar sem devolver o mesmo lugar a alguém.',
    'Não transforme sua generosidade em dívida para ninguém pagar.',
  ],
  'Machado de Assis': [
    'Há silêncios que dizem mais sobre uma pessoa do que suas melhores justificativas.',
    'Se um dia eu ajudei, não fiz reféns: minha ação fala de mim; sua reação fala de você.',
    'Certas ingratidões não ferem; apenas explicam.',
    'A elegância de uma indireta está em deixar a verdade trabalhar sozinha.',
  ],
  'Frank Herbert': [
    'Eu não devo ter medo. O medo é o assassino da mente.',
  ],
  'Henry David Thoreau': [
    'Viver deliberadamente é separar o essencial do ruído antes que o tempo passe sem ter sido realmente vivido.',
    'Uma vida simples cria espaço para perceber aquilo que a pressa esconde.',
    'Nunca é tarde para abandonar uma forma de pensar que já não resiste à experiência.',
    'Melhorar a qualidade do dia é uma das artes mais importantes que podemos praticar.',
  ],
  'Ralph Waldo Emerson': [
    'Confie em si: toda voz verdadeira começa quando você deixa de viver apenas pelo olhar dos outros.',
    'Aquilo que você pensa com honestidade pode encontrar eco em outros corações.',
    'A imitação enfraquece; a autenticidade dá forma à própria vida.',
    'Respeitar a si mesmo é o primeiro modo pelo qual a grandeza aparece.',
  ],
  'Michel de Montaigne': [
    'Aprender a viver é também aprender a não ser governado pelo medo do que ainda não aconteceu.',
    'Minha vida foi cheia de dificuldades, e muitas delas nunca chegaram a acontecer.',
    'A sabedoria começa quando aceitamos estudar a nós mesmos sem fingir perfeição.',
    'Quem ensina alguém a morrer também o ensina a viver com mais liberdade.',
  ],
  Dhammapada: [
    'Aquilo que somos toma forma nos pensamentos que alimentamos e nas ações que escolhemos repetir.',
    'A mente precede nossas ações; quando ela se torna clara, a paz acompanha nossos passos.',
    'O ódio não termina com mais ódio: ele se desfaz quando deixa de ser alimentado.',
    'Mais valiosa que mil palavras vazias é uma palavra que devolve paz.',
  ],
  Ptahhotep: [
    'Ninguém nasce sábio; aprender a ouvir é o começo de toda sabedoria.',
    'Se você ocupa uma posição de autoridade, use o conhecimento para servir, não para humilhar.',
    'Responder com calma a uma provocação protege sua dignidade e evita ampliar o conflito.',
    'A pessoa que realmente sabe continua disposta a aprender com quem sabe menos.',
  ],
  Heráclito: [
    'Tudo muda; compreender a vida exige aprender a mudar com ela.',
    'Você não encontra a mesma experiência duas vezes, porque o mundo e você já mudaram.',
    'Os opostos podem fazer parte do mesmo movimento, como tensão e harmonia numa corda.',
    'O caráter que você cultiva influencia o caminho que sua vida toma.',
  ],
  'Katha Upanishad': [
    'O agradável e o que realmente faz bem nem sempre conduzem ao mesmo caminho.',
    'A pessoa sábia distingue o benefício duradouro do prazer que desaparece rapidamente.',
    'O corpo é como uma carruagem; a inteligência orienta e a mente segura as rédeas.',
    'Quem procura estabilidade apenas nas coisas passageiras continuará encontrando insegurança.',
  ],
  'Buda — Sutta Nipata': [
    'Assim como a água não se prende à folha de lótus, a mente treinada não precisa se prender ao ressentimento.',
    'A paz não exige vencer todas as discussões; muitas vezes começa quando a hostilidade deixa de ser alimentada.',
    'Cuidar da própria mente é importante porque palavras e ações crescem a partir dela.',
    'Trate cada ser com o cuidado de quem deseja que ninguém viva dominado pelo medo.',
  ],
  'Bardo Thodol': [
    'Aquilo que assusta a mente pode ser uma criação da própria mente, não uma ameaça presente.',
    'Reconhecer uma experiência como passageira reduz o poder que ela exerce sobre você.',
    'Não se prenda ao que parece agradável nem fuja imediatamente do que parece assustador.',
    'A clareza começa quando você observa uma imagem mental sem confundi-la com toda a realidade.',
  ],
  Milarepa: [
    'Quando a mente deixa de perseguir cada pensamento, até a solidão pode se tornar clareza.',
    'Buscar respostas em toda parte pode impedir você de escutar o que o silêncio já está mostrando.',
    'A disciplina interior transforma dificuldades em prática, não em condenação.',
    'Ter pouco pode ser suficiente quando a mente deixa de medir a vida apenas pelo que possui.',
  ],
  'Sabedoria suméria': [
    'Uma palavra dita sem cuidado pode causar um conflito que muitas palavras não conseguem desfazer.',
    'Quem promete sem pensar cria para si uma obrigação que talvez não consiga cumprir.',
    'A riqueza pode desaparecer; o resultado de uma ação justa permanece na memória das pessoas.',
    'Ouvir um conselho antes de agir custa menos do que reparar uma decisão tomada com orgulho.',
  ],
  'Reflexão contemporânea': [
    'Eu sou vários! Há multidões em mim. Na mesa de minha alma sentam-se muitos, e eu sou todos eles. Há um velho, uma criança, um sábio, um tolo. Você nunca saberá com quem está sentado ou quanto tempo permanecerá com cada um de mim. Mas prometo que, se nos sentarmos à mesa, nesse ritual sagrado eu lhe entregarei ao menos um dos tantos que sou, e correrei os riscos de estarmos juntos no mesmo plano. Desde logo, evite ilusões: também tenho um lado mau, ruim, que tento manter preso e que, quando se solta, me envergonha. Não sou santo, nem exemplo, infelizmente. Entre tantos, um dia me descubro, um dia serei eu mesmo, definitivamente. Como já foi dito: ouse conquistar a ti mesmo.',
    'Eu sou vários. Há multidões em mim, e à mesa da minha alma sentam-se um velho, uma criança, um sábio e um tolo.',
    'Você nunca saberá com qual dos meus muitos lados está sentado, mas receberá ao menos um deles quando estivermos juntos.',
    'Também tenho um lado que tento manter preso e que, quando se solta, me envergonha. Não sou santo nem exemplo.',
    'Entre tantos que habitam em mim, um dia talvez eu me descubra. Até lá, ouso conquistar a mim mesmo.',
  ],
};

data.clarityRewrites = {
  'A mente aquieta quando deixa de lutar contra o que já é.': 'A mente encontra calma quando reconhece a realidade antes de tentar mudá-la.',
  'A paz aparece quando a resistência perde a pressa.': 'A paz começa quando você deixa de reagir com pressa ao que sente.',
  'A alma encontra direção quando aprende a amar o que é verdadeiro.': 'A vida ganha direção quando suas escolhas se aproximam daquilo que você reconhece como verdadeiro.',
  'O obstáculo também é matéria para a virtude.': 'As dificuldades oferecem uma oportunidade concreta para praticar coragem, paciência e disciplina.',
  'Quem tem um sim profundo atravessa muitos nãos.': 'Quem encontra uma razão verdadeira para seguir consegue atravessar muitas recusas.',
  'O coração também pensa, só que em silêncio.': 'Nem toda compreensão nasce do raciocínio; sentimentos também revelam o que importa para você.',
  'Dentro de cada pausa existe uma forma nova de nascer.': 'Uma pausa consciente pode abrir espaço para uma maneira nova de viver e escolher.',
  'Há dias em que existir já é uma forma de poesia.': 'Em alguns dias, simplesmente continuar presente já é um gesto de sensibilidade e coragem.',
  'Há um ponto em que o sofrimento se torna caminho de retorno.': 'O sofrimento pode revelar necessidades esquecidas e conduzir você de volta ao que realmente importa.',
  'O coração humano carrega abismos, mas também uma sede de luz.': 'A pessoa pode carregar dores profundas e, ao mesmo tempo, continuar procurando esperança e sentido.',
  'Você é o amor que procura. Comece por sentir com verdade.': 'O cuidado que você procura também precisa começar na maneira como acolhe a si mesmo.',
  'A ferida é também uma porta para a luz.': 'Uma ferida reconhecida pode mostrar onde você precisa de cuidado, mudança e compreensão.',
  'O que você procura também está procurando por você.': 'Quando você age de acordo com aquilo que valoriza, torna-se mais capaz de reconhecer oportunidades compatíveis com sua busca.',
  'A vida se amplia quando aprendemos a habitar o tempo presente.': 'A vida parece mais inteira quando damos atenção ao momento que realmente estamos vivendo.',
  'A água vence porque não endurece.': 'A flexibilidade permite atravessar obstáculos que a rigidez não consegue superar.',
  'O simples sustenta aquilo que o excesso confunde.': 'Simplificar ajuda a perceber o essencial quando o excesso de opções produz confusão.',
  'O eu se torna real quando escolhe com responsabilidade.': 'Você constrói sua identidade quando assume responsabilidade pelas próprias escolhas.',
  'A alma precisa de silêncio para reconhecer sua fome.': 'O silêncio ajuda você a perceber necessidades profundas que o ruído cotidiano costuma esconder.',
  'A liberdade aparece quando alguém começa algo no mundo.': 'A liberdade se torna concreta quando uma pessoa transforma intenção em uma ação responsável.',
  'A lucidez precisa de ternura para não virar dureza.': 'Compreender a realidade sem compaixão pode nos tornar frios; lucidez e humanidade precisam caminhar juntas.',
  'A raiva revela uma fronteira que talvez você tenha abandonado.': 'A raiva pode indicar que um limite importante foi ignorado ou ultrapassado.',
  'O que irrita profundamente também pode ensinar profundamente.': 'Uma irritação intensa pode revelar valores, feridas ou limites que ainda precisam ser compreendidos.',
  'Não ilumine só sua bondade; reconheça também onde você precisa de limite.': 'Reconhecer suas qualidades é importante, mas perceber onde você precisa estabelecer limites também é parte do autoconhecimento.',
  'Certas ingratidões não ferem; apenas explicam.': 'Algumas atitudes de ingratidão esclarecem quem a outra pessoa é e ajudam você a rever essa relação.',
  'A verdade não é algo que possa ser alcançada. Ela surge quando a mente compreende a si mesma.': 'A verdade sobre você se torna mais clara quando sua mente reconhece os próprios medos, desejos e contradições.',
  'O silêncio não é vazio: é a mente deixando de se defender.': 'O silêncio pode diminuir as defesas da mente e permitir que você perceba o que estava evitando.',
  'A beleza educa o olhar para reconhecer o essencial.': 'A atenção à beleza pode ensinar você a perceber valor e significado além da utilidade imediata.',
  'Quem busca a verdade precisa também ordenar o próprio coração.': 'Buscar a verdade exige examinar não apenas os fatos, mas também os desejos que influenciam seu julgamento.',
  'A calma é escolher a parte da vida que depende de você.': 'A calma cresce quando você concentra sua energia naquilo que realmente pode escolher ou modificar.',
  'A dignidade está em responder bem ao que não escolhemos.': 'Dignidade é escolher uma resposta coerente mesmo diante de acontecimentos que você não pôde evitar.',
  'Aquilo que não te destrói te torna mais forte — se você olhar por dentro.': 'Uma dificuldade pode fortalecer você quando é compreendida e transformada em aprendizado, sem negar a dor que causou.',
  'O essencial é invisível aos olhos: mora na quietude.': 'Aquilo que mais importa nem sempre é visível de imediato; a quietude ajuda a perceber valores, vínculos e necessidades profundas.',
  'O silêncio às vezes diz o que a alma ainda não consegue escrever.': 'O silêncio pode expressar sentimentos que você ainda não conseguiu organizar em palavras.',
  'A dor pede sentido, não condenação.': 'Quando existe dor, buscar compreensão costuma ajudar mais do que culpar a si mesmo ou condenar o que sente.',
  'Quem atravessa a noite aprende a reconhecer a compaixão.': 'Quem enfrenta um período difícil pode desenvolver mais sensibilidade para reconhecer e acolher o sofrimento dos outros.',
  'A esperança começa quando encontramos uma tarefa para amar.': 'A esperança pode surgir quando encontramos uma pessoa, responsabilidade ou tarefa que dê direção ao próximo passo.',
  'Quando o coração se abre, o caminho aparece por dentro.': 'Quando você reconhece honestamente o que sente e valoriza, suas escolhas podem ganhar uma direção mais clara.',
  'A serenidade nasce quando desejamos menos do que não depende de nós.': 'A serenidade aumenta quando deixamos de exigir controle sobre acontecimentos e decisões que não dependem de nós.',
  'Quem se apressa perde o ritmo do caminho.': 'A pressa pode fazer você ignorar informações e etapas importantes para tomar uma boa decisão.',
  'Quando nada é forçado, algo verdadeiro pode aparecer.': 'Diminuir a pressão por uma resposta imediata permite perceber sentimentos e possibilidades com mais honestidade.',
  'A constância transforma o comum em sabedoria.': 'Repetir pequenas atitudes conscientes transforma experiências comuns em aprendizado duradouro.',
  'O respeito começa dentro das pequenas escolhas.': 'O respeito se demonstra nas decisões cotidianas, especialmente quando ninguém está observando.',
  'A felicidade floresce quando a alma age com propósito.': 'Uma felicidade mais estável pode surgir quando suas ações estão alinhadas com um propósito que você considera valioso.',
  'A atenção pura é uma forma rara de generosidade.': 'Oferecer atenção verdadeira, sem pressa para responder, é uma maneira profunda de cuidar de alguém.',
  'A compaixão começa quando paramos de usar a dor do outro.': 'Compaixão é acolher o sofrimento de alguém sem transformá-lo em vantagem, espetáculo ou julgamento.',
  'Agir é aceitar que a vida pede presença pública e coragem.': 'Agir significa assumir responsabilidade e participar do mundo, mesmo sem garantia de controlar o resultado.',
  'A compaixão suaviza aquilo que a vida torna pesado.': 'A compaixão não elimina uma dificuldade, mas torna seu peso menos solitário e mais humano.',
  'Quem reconhece o sofrimento aprende a respeitar a vida.': 'Reconhecer o sofrimento próprio e alheio pode ampliar o cuidado com as escolhas e com a vida das pessoas.',
  'A maturidade começa quando você escolhe paz sem pedir permissão.': 'Maturidade é proteger sua paz por meio de limites responsáveis, mesmo quando outras pessoas não aprovam sua decisão.',
};

// Textos editoriais mais longos. Quando não são transcrições literais de uma obra,
// permanecem identificados como ideias inspiradas para não criar falsas citações.

data.authorTextVariants = {
  'Marco Aurélio': [
    {
      text: 'Ao despertar, lembre-se de que encontrará pessoas difíceis, ingratas ou impacientes. Elas agem assim porque ainda confundem o bem e o mal. Você, porém, pode escolher não se tornar semelhante ao que o fere. A natureza humana é feita para cooperar; responder ao erro com outro erro apenas prolonga o conflito.',
      source: 'Texto inspirado em Meditações, livro II',
    },
  ],
  Epicteto: [
    {
      text: 'Há coisas que dependem de nós e coisas que não dependem. Nossos julgamentos, desejos e escolhas nos pertencem; a reputação, o corpo dos outros e os acontecimentos externos não obedecem inteiramente à nossa vontade. Confundir esses dois campos produz ansiedade. Separá-los devolve liberdade para agir onde uma ação ainda é possível.',
      source: 'Texto inspirado no Manual, capítulo 1',
    },
  ],
  'Nisargadatta Maharaj': [
    {
      text: 'A mente produz perguntas, medos, imagens e urgências. Nisargadatta desloca a atenção: antes de seguir cada movimento mental, investigue aquilo que percebe o movimento. O pensamento aparece e desaparece; a emoção cresce e diminui. Se algo em você consegue notar essa mudança, talvez sua identidade não precise ficar presa ao conteúdo que passa.',
      source: 'Leitura editorial inspirada em Eu Sou Aquilo',
    },
    {
      text: 'Buscar fora pode se tornar um hábito refinado de fuga. A pessoa procura sentido, mestre, resposta, método e confirmação, mas raramente pergunta quem é o buscador. A investigação direta não oferece uma nova imagem para defender. Ela retira peso da imagem antiga e convida a repousar na consciência que já estava presente antes da explicação.',
      source: 'Leitura editorial inspirada em Eu Sou Aquilo',
    },
  ],
  'Chögyam Trungpa': [
    {
      text: 'Trungpa chamou atenção para uma armadilha sutil: transformar o caminho espiritual em projeto de autoaperfeiçoamento do ego. A pessoa aprende palavras profundas, pratica gestos calmos e constrói uma imagem mais elevada de si mesma, mas continua defendendo o mesmo centro. A prática verdadeira começa quando essa encenação é percebida sem enfeite.',
      source: 'Leitura editorial inspirada em Além do Materialismo Espiritual',
    },
    {
      text: 'A lucidez de Trungpa não é agressiva por espetáculo; ela corta a fantasia de que consciência é uma decoração. Estar presente inclui perceber vaidade, medo, ambição espiritual e necessidade de aprovação. Não para condenar a pessoa, mas para impedir que a busca por liberdade vire outra forma de prisão cuidadosamente perfumada.',
      source: 'Leitura editorial inspirada em Além do Materialismo Espiritual',
    },
  ],
  Sêneca: [
    {
      text: 'Não recebemos uma vida necessariamente curta; muitas vezes somos nós que a tornamos pequena ao entregá-la à distração, à espera e às preocupações sem fim. O tempo é suficiente quando é habitado com presença. Quem protege as próprias horas deixa de adiar a vida para um amanhã que nunca chega inteiro.',
      source: 'Texto inspirado em Sobre a Brevidade da Vida',
    },
  ],
  Nietzsche: [
    {
      text: 'Existe em nós uma coragem capaz de enfrentar aquilo que tenta nos reduzir. Ela não elimina o abismo nem promete uma vida sem dor; ensina a olhar para a dificuldade e ainda afirmar a existência. Crescer não é evitar toda queda, mas descobrir uma força que antes permanecia escondida.',
      source: 'Texto inspirado em Assim Falou Zaratustra',
    },
  ],
  'Henry David Thoreau': [
    {
      text: 'Thoreau foi para os bosques porque desejava viver deliberadamente: queria encarar apenas os fatos essenciais e aprender o que a vida tinha a ensinar. Seu gesto não era uma fuga do mundo, mas uma pergunta. Quanto de nossa rotina foi realmente escolhido, e quanto apenas se acumulou sem que percebêssemos?',
      source: 'Texto inspirado em Walden',
    },
  ],
  'Ralph Waldo Emerson': [
    {
      text: 'Confiar em si não significa acreditar que nunca se engana. Significa escutar a própria consciência antes de se curvar automaticamente ao costume e à opinião. Emerson via a imitação como perda de potência: uma vida autêntica começa quando a pessoa aceita o risco de pensar e responder com a própria voz.',
      source: 'Texto inspirado em Autoconfiança',
    },
  ],
  'Michel de Montaigne': [
    {
      text: 'Montaigne observava a si mesmo sem posar como exemplo de perfeição. Mudava de ideia, reconhecia contradições e transformava a dúvida em método. Conhecer-se, nessa perspectiva, não é encontrar uma definição definitiva, mas aprender a conviver honestamente com uma natureza humana móvel, imperfeita e ainda capaz de sabedoria.',
      source: 'Texto inspirado nos Ensaios',
    },
  ],
  Dhammapada: [
    {
      text: 'A mente vem antes da palavra e da ação. Quando alguém fala ou age alimentando hostilidade, o sofrimento o acompanha; quando age com uma mente clara, a paz segue seus passos. O ensinamento não pede pensamentos perfeitos, mas atenção ao instante em que um pensamento começa a se transformar em caminho.',
      source: 'Texto inspirado no Dhammapada, versos 1–2',
    },
  ],
  'Fernando Pessoa': [
    {
      text: 'Não é numa ilha distante ou numa vida imaginária que a alma encontra cura definitiva. Mesmo o lugar sonhado perde sua perfeição quando chega perto. A transformação que procuramos fora também precisa acontecer dentro: é em nós que a paisagem ganha juventude, sentido e possibilidade de amor.',
      source: 'Texto inspirado no poema Não sei se é sonho',
    },
  ],
  'Machado de Assis': [
    {
      text: 'Machado desconfiava das versões muito elegantes que contamos sobre nós mesmos. Por trás de uma boa justificativa podem existir vaidade, interesse ou medo de admitir a verdade. Ler seus personagens é aprender a observar o narrador dentro de nós: aquele que reorganiza os fatos para sempre parecer inocente.',
      source: 'Texto inspirado na obra de Machado de Assis',
    },
  ],
};

data.supplementalTextVariants = {
  'Frank Herbert': [
    {
      text: 'Quando o medo ocupa toda a mente, ele transforma possibilidade em sentença. Enfrentá-lo não exige fingir que ele desapareceu; exige permitir que atravesse o corpo sem receber autoridade sobre todas as escolhas. Depois da passagem, ainda existe alguém capaz de observar, respirar e decidir o próximo passo.',
      source: 'Leitura editorial inspirada em Duna',
    },
  ],
  'Jiddu Krishnamurti': [
    {
      text: 'Observar a própria mente sem tentar corrigi-la imediatamente é um gesto raro. Quando nomeamos depressa cada emoção, enxergamos apenas a palavra. Permanecer alguns instantes com aquilo que sentimos permite perceber movimentos mais profundos: medo, defesa, desejo e memória deixando de agir escondidos.',
      source: 'Leitura editorial inspirada em Krishnamurti',
    },
  ],
  Platão: [
    {
      text: 'Sair da aparência não significa desprezar o mundo, mas aprender a perguntar o que há por trás da primeira impressão. Uma opinião pode parecer luminosa e ainda assim nos manter presos. Filosofar começa quando os olhos se acostumam lentamente a uma verdade que antes incomodava.',
      source: 'Leitura editorial inspirada em A República',
    },
  ],
  Sócrates: [
    {
      text: 'Uma pergunta honesta pode desmontar certezas que pareciam antigas demais para serem tocadas. Sócrates não oferecia conforto rápido: convidava cada pessoa a examinar as razões de sua vida. Às vezes, descobrir que não sabemos é justamente o espaço de que uma escolha mais sábia precisava.',
      source: 'Leitura editorial inspirada nos diálogos socráticos',
    },
  ],
  'Clarice Lispector': [
    {
      text: 'Há momentos em que compreender não é organizar tudo em palavras. É perceber uma mudança silenciosa acontecendo por dentro e suportar o instante em que a antiga forma de viver já não serve, enquanto a nova ainda não recebeu nome.',
      source: 'Leitura editorial inspirada na obra de Clarice Lispector',
    },
  ],
  'Viktor Frankl': [
    {
      text: 'O sentido nem sempre chega como uma grande missão. Pode aparecer numa pessoa a cuidar, numa tarefa a concluir ou na postura escolhida diante de uma dor inevitável. A vida continua fazendo perguntas; responder é transformar o próximo gesto em responsabilidade.',
      source: 'Leitura editorial inspirada na logoterapia',
    },
  ],
  Rumi: [
    {
      text: 'Aquilo que dói também pode abrir passagem para uma atenção mais delicada. A ferida não precisa se tornar identidade, mas pode ensinar onde faltou cuidado. Quando o coração deixa de esconder sua fragilidade, encontra uma coragem que a dureza nunca conseguiu oferecer.',
      source: 'Leitura editorial inspirada na poesia de Rumi',
    },
  ],
  'Lao-Tsé': [
    {
      text: 'A água não discute com a pedra e, ainda assim, encontra passagem. Sua força está em não abandonar o movimento. Flexibilidade não é submissão: é conservar a direção sem gastar toda a energia tentando obrigar o mundo a assumir uma única forma.',
      source: 'Leitura editorial inspirada no Tao Te Ching',
    },
  ],
  'Hannah Arendt': [
    {
      text: 'Começar algo novo é sempre entrar num mundo que já existia antes de nós. Não controlamos inteiramente o resultado, mas ainda respondemos pelo gesto inicial. A liberdade aparece nesse risco: interromper a repetição e oferecer uma possibilidade que antes não estava presente.',
      source: 'Leitura editorial inspirada em A Condição Humana',
    },
  ],
  'Carl Jung': [
    {
      text: 'A parte de nós que evitamos não desaparece; aprende a agir fora do nosso campo de visão. Reconhecer a sombra não significa obedecê-la. Significa retirar dela o poder de escolher escondida e transformar sua energia em limite, consciência e responsabilidade.',
      source: 'Leitura editorial inspirada na psicologia analítica',
    },
  ],
  Ptahhotep: [
    {
      text: 'As instruções de Ptahhotep colocam a escuta no centro da sabedoria. Uma pessoa pode ter experiência e ainda não possuir toda a compreensão. Por isso, ouvir alguém com atenção não diminui sua autoridade; amplia sua capacidade de julgar com justiça e responder sem arrogância.',
      source: 'Leitura editorial baseada nas Instruções de Ptahhotep · Egito antigo',
    },
  ],
  Heráclito: [
    {
      text: 'Heráclito observou que a realidade está sempre em movimento. Tentar conservar tudo exatamente como era produz sofrimento porque nós também participamos da mudança. Sabedoria não é controlar o fluxo, mas perceber o que está mudando e escolher uma resposta adequada ao momento presente.',
      source: 'Leitura editorial baseada nos fragmentos de Heráclito · século VI–V a.C.',
    },
  ],
  'Katha Upanishad': [
    {
      text: 'A Katha Upanishad diferencia o agradável do que realmente faz bem. O agradável oferece satisfação imediata; o bem pode exigir paciência, disciplina e renúncia. A escolha sábia não rejeita toda alegria, mas pergunta quais consequências cada caminho produzirá depois que o impulso passar.',
      source: 'Leitura editorial baseada na Katha Upanishad · tradição indiana antiga',
    },
  ],
  'Buda — Sutta Nipata': [
    {
      text: 'Nos ensinamentos budistas antigos, a hostilidade não termina quando recebe mais hostilidade. Ela perde força quando alguém interrompe o ciclo com atenção e compaixão. Isso não significa aceitar injustiça; significa agir sem permitir que o ressentimento transforme você naquilo que deseja combater.',
      source: 'Leitura editorial baseada em ensinamentos budistas antigos',
    },
  ],
  'Bardo Thodol': [
    {
      text: 'O Bardo Thodol ensina a reconhecer experiências assustadoras como manifestações passageiras da mente. Em linguagem cotidiana, isso significa observar pensamentos intensos sem concluir imediatamente que eles descrevem a realidade. A mente pode produzir imagens convincentes; conferir os fatos devolve clareza.',
      source: 'Leitura editorial inspirada no Bardo Thodol · tradição tibetana',
    },
  ],
  Milarepa: [
    {
      text: 'A tradição ligada a Milarepa apresenta a solidão como espaço de treinamento, não como abandono. Quando a pessoa deixa de correr atrás de cada pensamento, começa a distinguir necessidade de impulso. O silêncio não resolve tudo, mas permite enxergar com menos interferência.',
      source: 'Leitura editorial inspirada nos ensinamentos de Milarepa · Tibete medieval',
    },
  ],
  'Sabedoria suméria': [
    {
      text: 'Os provérbios mesopotâmicos tratavam a palavra como uma ação com consequências. Uma frase impensada podia destruir acordos e relações construídos lentamente. A lição continua atual: antes de falar, considere se suas palavras esclarecem, protegem ou apenas descarregam um impulso momentâneo.',
      source: 'Leitura editorial inspirada na literatura sapiencial da Mesopotâmia antiga',
    },
  ],
};
})(typeof window !== 'undefined' ? window : globalThis);

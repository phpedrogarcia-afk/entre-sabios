// =========================
// Entre Sábios
// Implementação baseada na especificação (layout minimalista)
// =========================

const feelingsCatalog = [
  { id: 'ansiedade', label: 'Ansiedade', themes: ['ansiedade', 'disciplina', 'aceitação', 'controle emocional'] },
  { id: 'medo', label: 'Medo', themes: ['medo', 'observação', 'liberdade', 'coragem'] },
  { id: 'amor', label: 'Amor', themes: ['amor', 'solidão', 'introspecção', 'espiritualidade'] },
  { id: 'saudade', label: 'Saudade', themes: ['saudade', 'existência', 'melancolia'] },
  { id: 'esperança', label: 'Esperança', themes: ['esperança', 'propósito', 'significado', 'superação'] },
  { id: 'solidão', label: 'Solidão', themes: ['solidão', 'introspecção', 'amor'] },
  { id: 'confusão', label: 'Confusão', themes: ['confusão', 'observação', 'sabedoria'] },
  { id: 'autoconhecimento', label: 'Autoconhecimento', themes: ['autoconhecimento', 'sabedoria', 'observação'] },
  { id: 'coragem', label: 'Coragem', themes: ['coragem', 'superação', 'propósito'] },
  { id: 'raiva', label: 'Raiva', themes: ['raiva', 'limites', 'desapego', 'dignidade', 'indiretas'] },
  { id: 'culpa', label: 'Culpa', themes: ['culpa', 'responsabilidade', 'autocompaixão', 'reparação', 'aceitação'] },
  { id: 'luto', label: 'Luto', themes: ['luto', 'saudade', 'perda', 'aceitação', 'memória', 'amor'] },
  { id: 'tristeza', label: 'Tristeza', themes: ['tristeza', 'sofrimento', 'condição humana'] },
  { id: 'falta_de_proposito', label: 'Falta de propósito', themes: ['propósito', 'significado', 'fé'] },
];

const intensityProfiles = {
  fraca: {
    themes: ['observação', 'curiosidade', 'prevenção'],
    suitableTones: ['contemplativo', 'analítico', 'acolhedor', 'poético'],
  },
  moderada: {
    themes: ['compreensão', 'equilíbrio', 'ação consciente'],
    suitableTones: ['contemplativo', 'analítico', 'acolhedor', 'direto', 'poético'],
  },
  intensa: {
    themes: ['acolhimento', 'regulação emocional', 'passo imediato'],
    suitableTones: ['acolhedor', 'contemplativo', 'direto', 'poético'],
  },
};

const combinationRules = [
  { feelings: ['medo', 'ansiedade'], themes: ['futuro', 'controle', 'pensamento acelerado', 'acolhimento'] },
  { feelings: ['raiva', 'culpa'], themes: ['responsabilidade', 'reparação', 'limites', 'autocompaixão'] },
  { feelings: ['solidão', 'tristeza'], themes: ['pertencimento', 'acolhimento', 'conexão'] },
  { feelings: ['amor', 'saudade'], themes: ['vínculo', 'memória', 'desapego'] },
  { feelings: ['confusão', 'ansiedade'], themes: ['clareza', 'observação', 'pensamento acelerado'] },
  { feelings: ['medo', 'coragem'], themes: ['ação consciente', 'superação', 'liberdade'] },
  { feelings: ['culpa'], themes: ['responsabilidade', 'reparação', 'autocompaixão'] },
  { feelings: ['luto'], themes: ['perda', 'memória', 'acolhimento', 'aceitação'] },
  { feelings: ['luto', 'saudade'], themes: ['memória', 'vínculo', 'despedida', 'continuidade'] },
  { feelings: ['luto', 'amor'], themes: ['vínculo', 'perda', 'gratidão', 'continuidade'] },
  { feelings: ['falta_de_proposito'], themes: ['sentido', 'direção', 'ação consciente'] },
];

const authorsDb = [
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
    quote: 'Não são as coisas que perturbam, mas as ideias que fazemos delas.',
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
    quote: 'A vida só pode ser compreendida olhando-se para trás; mas só pode ser vivida olhando-se para frente.',
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
    quote: 'Quem tem um porquê enfrenta qualquer como.',
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

const authorQuoteVariants = {
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

const clarityRewrites = {
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
const authorTextVariants = {
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

const supplementalTextVariants = {
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

const thinkerProfiles = {
  'Jiddu Krishnamurti': 'Krishnamurti investigou a liberdade interior. Para ele, observar pensamentos e medos sem julgamento permite compreender como a mente cria seus próprios conflitos.',
  Krishnamurti: 'Krishnamurti ensinava que a verdade não cabe em autoridades ou fórmulas. Sua filosofia convida à atenção direta e ao autoconhecimento.',
  Platão: 'Platão pensava que filosofar é sair das aparências em direção ao verdadeiro, ao justo e ao belo. O diálogo é uma ferramenta dessa busca.',
  Sócrates: 'Sócrates transformou perguntas em método filosófico. Reconhecer a própria ignorância é o começo de uma vida examinada.',
  'Marco Aurélio': 'Marco Aurélio foi um imperador estoico. Seus escritos ensinam a distinguir o que depende de nós e a agir com justiça mesmo em tempos difíceis.',
  Epicteto: 'Epicteto nasceu escravizado e tornou-se mestre estoico. Ele defendia que nossa liberdade começa na maneira como julgamos e respondemos aos acontecimentos.',
  Nietzsche: 'Nietzsche questionou valores herdados e convidou cada pessoa a criar uma vida afirmativa. Conquistar a si mesmo exige coragem para mudar.',
  'Clarice Lispector': 'Clarice explorou a existência por dentro. Seus textos aproximam literatura e filosofia ao revelar estranhamento, identidade e transformação.',
  'Fernando Pessoa': 'Pessoa fez da multiplicidade do eu uma experiência literária e filosófica. Seus heterônimos mostram que uma identidade pode conter muitas vozes.',
  Dostoiévski: 'Dostoiévski investigou culpa, liberdade, fé e sofrimento por meio de personagens em conflito. Sua literatura pergunta o que fazemos com nossa liberdade.',
  'Viktor Frankl': 'Frankl criou a logoterapia, centrada na busca de sentido. Mesmo quando não controlamos uma situação, ainda podemos escolher nossa atitude diante dela.',
  Rumi: 'Rumi foi poeta e mestre sufista. Sua obra apresenta o amor como caminho de transformação, união e conhecimento interior.',
  Sêneca: 'Sêneca pensava a filosofia como prática diária. Refletir sobre o tempo, a raiva e a morte deveria nos ajudar a viver com mais lucidez.',
  'Lao-Tsé': 'Ligado ao taoismo, Lao-Tsé ensina o valor da simplicidade e da ação sem força excessiva. A água simboliza uma flexibilidade que não perde potência.',
  Confúcio: 'Confúcio relacionou caráter pessoal e vida coletiva. Para ele, respeito, estudo e bons hábitos sustentam relações mais humanas.',
  Aristóteles: 'Aristóteles entendia a virtude como hábito. Uma vida boa se constrói escolhendo com prudência e buscando equilíbrio nas ações.',
  Kierkegaard: 'Kierkegaard estudou angústia, escolha e fé. Tornar-se si mesmo envolve assumir decisões que ninguém pode tomar em nosso lugar.',
  'Simone Weil': 'Simone Weil colocou a atenção no centro da ética. Olhar verdadeiramente para o outro é interromper o ego e reconhecer sua realidade.',
  'Hannah Arendt': 'Arendt refletiu sobre liberdade, responsabilidade e vida pública. Agir é iniciar algo novo em um mundo compartilhado.',
  Schopenhauer: 'Schopenhauer viu o desejo como fonte constante de inquietação. A arte e a compaixão podem suspender, ainda que por instantes, esse sofrimento.',
  'Bhagavad Gita': 'O Bhagavad Gita é um diálogo filosófico da tradição hindu. Ele ensina a agir conforme o dever sem se tornar prisioneiro dos resultados.',
  Osho: 'Osho foi um líder espiritual contemporâneo e controverso. Seus textos enfatizam consciência, liberdade individual e observação das emoções.',
  'Steve Jobs': 'Jobs não foi filósofo acadêmico, mas suas falas abordam propósito, finitude e foco. Sua presença aqui funciona como pensamento prático contemporâneo.',
  'Carl Jung': 'Jung criou a psicologia analítica. A individuação integra partes conscientes e inconscientes, inclusive a sombra que preferimos negar.',
  'Maya Angelou': 'Angelou foi escritora e ativista. Sua obra pensa dignidade, resistência e a possibilidade de reconstruir a própria voz.',
  'Machado de Assis': 'Machado observou vaidade, autoengano e relações sociais com ironia. Seus narradores nos ensinam a desconfiar até de quem conta a história.',
  'Frank Herbert': 'Frank Herbert foi um escritor de ficção científica. Em Duna, explorou medo, poder, ecologia, religião e a maneira como pessoas e sociedades reagem diante de forças maiores que elas.',
  'Henry David Thoreau': 'Thoreau associou liberdade, simplicidade e atenção à vida concreta. Em Walden, defendeu uma existência deliberada, menos dominada pelo excesso e pelo costume.',
  'Ralph Waldo Emerson': 'Emerson valorizou autonomia, autenticidade e confiança na própria consciência. Para ele, uma vida verdadeira não deve ser governada apenas pela conformidade.',
  'Michel de Montaigne': 'Montaigne fez de si mesmo um campo de investigação. Seus ensaios tratam dúvida, medo e imperfeição com curiosidade e humanidade.',
  Dhammapada: 'O Dhammapada reúne ensinamentos budistas sobre mente, ação e sofrimento. Seus versos mostram como pensamentos cultivados influenciam nossa maneira de viver.',
  Ptahhotep: 'As Instruções de Ptahhotep pertencem à literatura sapiencial do Egito antigo. O texto discute escuta, autocontrole, justiça, humildade e responsabilidade no uso da palavra.',
  Heráclito: 'Heráclito foi um pensador grego anterior a Sócrates. Seus fragmentos observam mudança, tensão entre opostos e a necessidade de compreender a ordem presente no movimento da vida.',
  'Katha Upanishad': 'A Katha Upanishad é um diálogo indiano antigo sobre morte, escolha e autoconhecimento. Ela distingue o prazer imediato daquilo que conduz a um bem duradouro.',
  'Buda — Sutta Nipata': 'O Sutta Nipata preserva uma camada antiga de ensinamentos budistas. Seus poemas tratam desapego, compaixão, hostilidade e treinamento da mente.',
  'Bardo Thodol': 'O Bardo Thodol pertence à tradição budista tibetana. Sua linguagem simbólica ensina a reconhecer experiências mentais sem apego e sem fuga.',
  Milarepa: 'Milarepa foi um mestre e poeta do Tibete medieval. Sua tradição associa meditação, simplicidade e disciplina à transformação do sofrimento.',
  'Sabedoria suméria': 'A literatura sapiencial da antiga Mesopotâmia reuniu provérbios sobre prudência, palavra, trabalho, promessa e responsabilidade comunitária.',
  'Pema Chödrön': 'Pema Chödrön é uma monja budista conhecida por ensinar como permanecer presente diante do medo, da incerteza e da vulnerabilidade.',
  'Alan Watts': 'Alan Watts aproximou filosofias asiáticas do público ocidental. Seus textos discutem mudança, insegurança e a ilusão de controlar completamente a vida.',
  'Rainer Maria Rilke': 'Rilke foi um poeta de língua alemã. Suas cartas e poemas tratam solidão, criação, amadurecimento e a coragem de viver perguntas sem resposta imediata.',
  'Milan Kundera': 'Kundera investigou amor, identidade, memória e liberdade por meio do romance. Sua literatura observa as ambiguidades da intimidade humana.',
  'John Keats': 'Keats foi um poeta romântico inglês. Em suas cartas, formulou a capacidade negativa: permanecer no mistério sem exigir conclusões apressadas.',
  'Nelson Mandela': 'Mandela foi um líder sul-africano contra o apartheid. Sua trajetória relaciona coragem, responsabilidade, resistência e reconciliação.',
  'Thich Nhat Hanh': 'Thich Nhat Hanh foi um monge zen vietnamita. Seus ensinamentos apresentam atenção plena, compaixão e presença como práticas cotidianas.',
  'Blaise Pascal': 'Pascal foi filósofo, matemático e escritor francês. Seus Pensamentos analisam inquietação, distração, fé e os limites da razão humana.',
  'Jean-Paul Sartre': 'Sartre foi um filósofo existencialista. Para ele, liberdade e responsabilidade são inseparáveis: escolhas ajudam a construir quem nos tornamos.',
  'Audre Lorde': 'Audre Lorde foi poeta e ensaísta. Sua obra transforma silêncio, diferença e raiva diante da injustiça em consciência e ação.',
  'Erich Fromm': 'Fromm foi psicólogo social e humanista. Ele estudou amor, liberdade e relações maduras como capacidades que exigem prática e responsabilidade.',
  'Reflexão contemporânea': 'Este texto dialoga com temas presentes em Pessoa, Jung e Nietzsche: multiplicidade do eu, sombra e conquista de si. É apresentado sem atribuição histórica para evitar uma autoria falsa.',
};

const feelingAuthorAffinity = {
  ansiedade: {
    'Marco Aurélio': 8,
    Epicteto: 8,
    Krishnamurti: 7,
    'Jiddu Krishnamurti': 7,
    Kierkegaard: 6,
    Sêneca: 8,
    'Michel de Montaigne': 7,
    Dhammapada: 6,
  },
  medo: {
    Nietzsche: 8,
    Epicteto: 7,
    'Marco Aurélio': 6,
    'Bhagavad Gita': 7,
    Osho: 7,
    Rumi: 5,
    'Jiddu Krishnamurti': 5,
    Kierkegaard: 8,
    'Hannah Arendt': 5,
    'Michel de Montaigne': 8,
    'Ralph Waldo Emerson': 6,
    'Frank Herbert': 10,
  },
  amor: {
    Rumi: 9,
    Platão: 8,
    'Clarice Lispector': 7,
    Dostoiévski: 6,
    'Simone Weil': 7,
    Osho: 7,
  },
  saudade: {
    'Fernando Pessoa': 9,
    'Clarice Lispector': 7,
    Rumi: 5,
    Dostoiévski: 5,
    Schopenhauer: 5,
  },
  esperança: {
    'Viktor Frankl': 9,
    Nietzsche: 6,
    Rumi: 6,
    'Clarice Lispector': 5,
    Aristóteles: 5,
    'Henry David Thoreau': 7,
    'Ralph Waldo Emerson': 6,
  },
  solidão: {
    'Clarice Lispector': 8,
    'Fernando Pessoa': 7,
    Rumi: 6,
    Platão: 5,
    'Simone Weil': 6,
  },
  confusão: {
    Sócrates: 9,
    'Jiddu Krishnamurti': 8,
    Krishnamurti: 7,
    Platão: 6,
    'Lao-Tsé': 8,
    'Carl Jung': 9,
    Osho: 6,
    'Henry David Thoreau': 7,
    'Michel de Montaigne': 7,
  },
  autoconhecimento: {
    Sócrates: 10,
    'Jiddu Krishnamurti': 8,
    Krishnamurti: 7,
    Platão: 6,
    'Hannah Arendt': 5,
    'Carl Jung': 10,
    Osho: 7,
    'Reflexão contemporânea': 9,
    'Ralph Waldo Emerson': 9,
    'Michel de Montaigne': 9,
    'Henry David Thoreau': 7,
  },
  coragem: {
    Nietzsche: 9,
    'Marco Aurélio': 7,
    Rumi: 6,
    'Viktor Frankl': 6,
    Aristóteles: 8,
    'Hannah Arendt': 7,
    'Bhagavad Gita': 9,
    'Steve Jobs': 8,
    'Maya Angelou': 9,
    'Ralph Waldo Emerson': 7,
    'Henry David Thoreau': 7,
  },
  raiva: {
    'Bhagavad Gita': 10,
    Osho: 9,
    'Carl Jung': 9,
    'Maya Angelou': 9,
    'Machado de Assis': 10,
    'Marco Aurélio': 7,
    Epicteto: 6,
    'Steve Jobs': 6,
    Dhammapada: 9,
    'Michel de Montaigne': 6,
  },
  tristeza: {
    Dostoiévski: 9,
    'Fernando Pessoa': 7,
    'Viktor Frankl': 7,
    'Clarice Lispector': 6,
    Schopenhauer: 9,
    'Simone Weil': 7,
    'Carl Jung': 7,
    'Maya Angelou': 7,
    Dhammapada: 7,
    'Michel de Montaigne': 7,
  },
  falta_de_proposito: {
    'Viktor Frankl': 10,
    Nietzsche: 7,
    'Marco Aurélio': 5,
    Sócrates: 5,
    Aristóteles: 7,
    Confúcio: 5,
    'Bhagavad Gita': 9,
    'Steve Jobs': 10,
    'Henry David Thoreau': 9,
    'Ralph Waldo Emerson': 8,
  },
};

const bookCatalog = [
  {
    title: 'Meditações',
    author: 'Marco Aurélio',
    tags: ['ansiedade', 'disciplina', 'aceitação', 'controle emocional', 'coragem', 'gratidão'],
    authors: ['Marco Aurélio', 'Epicteto', 'Sêneca'],
  },
  {
    title: 'Manual de Epicteto',
    author: 'Epicteto',
    tags: ['ansiedade', 'aceitação', 'disciplina', 'liberdade', 'controle emocional'],
    authors: ['Epicteto', 'Marco Aurélio', 'Sêneca'],
  },
  {
    title: 'Sobre a Brevidade da Vida',
    author: 'Sêneca',
    tags: ['tempo', 'ansiedade', 'disciplina', 'gratidão', 'aceitação'],
    authors: ['Sêneca', 'Marco Aurélio'],
  },
  {
    title: 'Em Busca de Sentido',
    author: 'Viktor Frankl',
    tags: ['propósito', 'significado', 'sofrimento', 'esperança', 'fé'],
    authors: ['Viktor Frankl'],
  },
  {
    title: 'O Banquete',
    author: 'Platão',
    tags: ['amor', 'verdade', 'conhecimento', 'beleza', 'espiritualidade'],
    authors: ['Platão', 'Rumi'],
  },
  {
    title: 'O Livro do Desassossego',
    author: 'Fernando Pessoa',
    tags: ['saudade', 'melancolia', 'solidão', 'existência', 'silêncio'],
    authors: ['Fernando Pessoa', 'Clarice Lispector'],
  },
  {
    title: 'A Paixão Segundo G.H.',
    author: 'Clarice Lispector',
    tags: ['introspecção', 'solidão', 'amor', 'existência', 'autoconhecimento'],
    authors: ['Clarice Lispector'],
  },
  {
    title: 'Assim Falou Zaratustra',
    author: 'Nietzsche',
    tags: ['coragem', 'superação', 'propósito', 'medo', 'existência'],
    authors: ['Nietzsche'],
  },
  {
    title: 'Tao Te Ching',
    author: 'Lao-Tsé',
    tags: ['simplicidade', 'aceitação', 'silêncio', 'confusão', 'observação'],
    authors: ['Lao-Tsé', 'Jiddu Krishnamurti', 'Krishnamurti'],
  },
  {
    title: 'A Condição Humana',
    author: 'Hannah Arendt',
    tags: ['ação', 'responsabilidade', 'liberdade', 'coragem', 'verdade'],
    authors: ['Hannah Arendt'],
  },
  {
    title: 'A Gravidade e a Graça',
    author: 'Simone Weil',
    tags: ['atenção', 'sofrimento', 'amor', 'silêncio', 'espiritualidade'],
    authors: ['Simone Weil', 'Dostoiévski'],
  },
  {
    title: 'O Mundo como Vontade e Representação',
    author: 'Schopenhauer',
    tags: ['tristeza', 'sofrimento', 'melancolia', 'existência', 'compaixão'],
    authors: ['Schopenhauer'],
  },
  {
    title: 'Temor e Tremor',
    author: 'Kierkegaard',
    tags: ['ansiedade', 'fé', 'escolha', 'medo', 'existência'],
    authors: ['Kierkegaard'],
  },
  {
    title: 'O Profeta',
    author: 'Kahlil Gibran',
    tags: ['amor', 'espiritualidade', 'esperança', 'silêncio', 'coragem'],
    authors: ['Rumi'],
  },
  {
    title: 'Bhagavad Gita',
    author: 'Tradição hindu',
    tags: ['ação', 'desapego', 'propósito', 'coragem', 'raiva', 'dignidade'],
    authors: ['Bhagavad Gita'],
  },
  {
    title: 'Coragem: O Prazer de Viver Perigosamente',
    author: 'Osho',
    tags: ['coragem', 'medo', 'liberdade', 'autenticidade', 'consciência', 'raiva'],
    authors: ['Osho'],
  },
  {
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    tags: ['propósito', 'foco', 'ação', 'coragem', 'autenticidade'],
    authors: ['Steve Jobs'],
  },
  {
    title: 'O Homem e Seus Símbolos',
    author: 'Carl Jung',
    tags: ['autoconhecimento', 'sombra', 'inconsciente', 'confusão', 'raiva'],
    authors: ['Carl Jung'],
  },
  {
    title: 'Carta a Minha Filha',
    author: 'Maya Angelou',
    tags: ['dignidade', 'coragem', 'superação', 'limites', 'raiva'],
    authors: ['Maya Angelou'],
  },
  {
    title: 'Memórias Póstumas de Brás Cubas',
    author: 'Machado de Assis',
    tags: ['ironia', 'verdade', 'desapego', 'indiretas', 'raiva'],
    authors: ['Machado de Assis'],
  },
  {
    title: 'Duna',
    author: 'Frank Herbert',
    tags: ['medo', 'coragem', 'mente', 'propósito', 'superação'],
    authors: ['Frank Herbert'],
  },
  {
    title: 'Instruções de Ptahhotep',
    author: 'Tradição egípcia antiga',
    tags: ['sabedoria', 'humildade', 'silêncio', 'justiça'],
    authors: ['Ptahhotep'],
  },
  {
    title: 'Fragmentos',
    author: 'Heráclito',
    tags: ['mudança', 'existência', 'aceitação', 'sabedoria'],
    authors: ['Heráclito'],
  },
  {
    title: 'Katha Upanishad',
    author: 'Tradição indiana antiga',
    tags: ['autoconhecimento', 'medo', 'disciplina', 'propósito'],
    authors: ['Katha Upanishad'],
  },
  {
    title: 'Sutta Nipata',
    author: 'Tradição budista antiga',
    tags: ['mente', 'compaixão', 'sofrimento', 'silêncio'],
    authors: ['Buda — Sutta Nipata'],
  },
  {
    title: 'Bardo Thodol',
    author: 'Tradição budista tibetana',
    tags: ['medo', 'mente', 'desapego', 'espiritualidade'],
    authors: ['Bardo Thodol'],
  },
  {
    title: 'Cem Mil Canções de Milarepa',
    author: 'Tradição tibetana',
    tags: ['meditação', 'solidão', 'simplicidade', 'coragem'],
    authors: ['Milarepa'],
  },
];

const additionalBookCatalog = [
  { title: 'A Liberdade Primeira e Última', author: 'Jiddu Krishnamurti', tags: ['medo', 'ansiedade', 'liberdade', 'condicionamento', 'autoconhecimento', 'consciência'], feelings: ['medo', 'ansiedade', 'confusão'], intensities: ['moderada', 'intensa'], level: 'iniciante', depth: 5, description: 'Investiga o medo, o condicionamento e a possibilidade de liberdade psicológica.' },
  { title: 'O Livro da Vida', author: 'Jiddu Krishnamurti', tags: ['observação', 'medo', 'relações', 'mente', 'consciência'], feelings: ['ansiedade', 'medo', 'amor'], intensities: ['fraca', 'moderada'], level: 'iniciante', depth: 3, description: 'Reúne reflexões breves para observar pensamentos, relações e emoções no cotidiano.' },
  { title: 'Comentários sobre o Viver', author: 'Jiddu Krishnamurti', tags: ['autoconhecimento', 'apego', 'solidão', 'medo', 'conflito'], feelings: ['medo', 'solidão', 'confusão'], intensities: ['moderada', 'intensa'], level: 'intermediário', depth: 5, description: 'Aprofunda conflitos humanos concretos por meio da observação sem julgamento.' },
  { title: 'Além do Bem e do Mal', author: 'Nietzsche', tags: ['moral', 'liberdade', 'verdade', 'coragem', 'autenticidade'], feelings: ['confusão', 'coragem', 'raiva'], intensities: ['moderada', 'intensa'], level: 'avançado', depth: 5, description: 'Questiona valores herdados e convida à criação consciente de uma vida própria.' },
  { title: 'A Gaia Ciência', author: 'Nietzsche', tags: ['afirmação', 'criação', 'coragem', 'existência', 'superação'], feelings: ['tristeza', 'coragem', 'falta_de_proposito'], intensities: ['moderada', 'intensa'], level: 'intermediário', depth: 4, description: 'Explora como afirmar a vida e criar sentido mesmo diante da incerteza.' },
  { title: 'Cartas a Lucílio', author: 'Sêneca', tags: ['ansiedade', 'tempo', 'amizade', 'morte', 'virtude', 'autodomínio'], feelings: ['ansiedade', 'medo', 'luto'], intensities: ['fraca', 'moderada', 'intensa'], level: 'iniciante', depth: 4, description: 'Aplica a filosofia estoica ao medo, ao tempo, à perda e à vida cotidiana.' },
  { title: 'Sobre a Ira', author: 'Sêneca', tags: ['raiva', 'autodomínio', 'consequências', 'justiça'], feelings: ['raiva', 'culpa'], intensities: ['moderada', 'intensa'], level: 'intermediário', depth: 4, description: 'Examina as causas da raiva e caminhos para não ser governado por ela.' },
  { title: 'Discursos', author: 'Epicteto', tags: ['liberdade', 'controle', 'responsabilidade', 'medo', 'disciplina'], feelings: ['medo', 'ansiedade', 'confusão'], intensities: ['moderada', 'intensa'], level: 'intermediário', depth: 5, description: 'Desenvolve a distinção entre aquilo que depende de nós e aquilo que não depende.' },
  { title: 'Memórias, Sonhos, Reflexões', author: 'Carl Jung', tags: ['sombra', 'sonhos', 'individuação', 'autoconhecimento', 'inconsciente'], feelings: ['confusão', 'solidão', 'medo'], intensities: ['moderada', 'intensa'], level: 'iniciante', depth: 4, description: 'Apresenta a formação do pensamento de Jung por experiências, sonhos e símbolos.' },
  { title: 'Em Busca de Nós Mesmos', author: 'Carl Jung', tags: ['individuação', 'identidade', 'sombra', 'autoconhecimento'], feelings: ['confusão', 'solidão'], intensities: ['moderada'], level: 'intermediário', depth: 5, description: 'Aprofunda o encontro com a sombra e o processo de tornar-se uma pessoa mais inteira.' },
  { title: 'O Homem em Busca de Sentido', author: 'Viktor Frankl', tags: ['sentido', 'sofrimento', 'liberdade interior', 'esperança', 'responsabilidade'], feelings: ['luto', 'tristeza', 'falta_de_proposito'], intensities: ['moderada', 'intensa'], level: 'iniciante', depth: 4, description: 'Mostra como propósito e responsabilidade podem sustentar a vida em condições difíceis.' },
  { title: 'A Presença Ignorada de Deus', author: 'Viktor Frankl', tags: ['sentido', 'espiritualidade', 'consciência', 'responsabilidade'], feelings: ['culpa', 'confusão', 'falta_de_proposito'], intensities: ['moderada', 'intensa'], level: 'intermediário', depth: 5, description: 'Investiga consciência, transcendência e busca de sentido pela logoterapia.' },
  { title: 'Uma Aprendizagem ou O Livro dos Prazeres', author: 'Clarice Lispector', tags: ['amor', 'entrega', 'autoconhecimento', 'intimidade', 'mistério'], feelings: ['amor', 'confusão', 'solidão'], intensities: ['fraca', 'moderada'], level: 'iniciante', depth: 4, description: 'Acompanha uma aprendizagem afetiva marcada por intimidade, espera e descoberta de si.' },
  { title: 'Água Viva', author: 'Clarice Lispector', tags: ['presente', 'consciência', 'criação', 'mistério', 'identidade'], feelings: ['confusão', 'autoconhecimento'], intensities: ['moderada', 'intensa'], level: 'avançado', depth: 5, description: 'Explora o instante, a identidade e aquilo que escapa às explicações lineares.' },
  { title: 'O Conceito de Angústia', author: 'Kierkegaard', tags: ['ansiedade', 'escolha', 'liberdade', 'culpa', 'existência'], feelings: ['ansiedade', 'medo', 'culpa'], intensities: ['moderada', 'intensa'], level: 'avançado', depth: 5, description: 'Relaciona angústia, possibilidade, liberdade e responsabilidade individual.' },
  { title: 'Crime e Castigo', author: 'Dostoiévski', tags: ['culpa', 'reparação', 'sofrimento', 'consciência', 'redenção'], feelings: ['culpa', 'medo', 'solidão'], intensities: ['intensa'], level: 'intermediário', depth: 5, description: 'Investiga culpa, autoengano, responsabilidade e a difícil possibilidade de reparação.' },
  { title: 'Os Irmãos Karamázov', author: 'Dostoiévski', tags: ['fé', 'dúvida', 'liberdade', 'culpa', 'amor', 'sentido'], feelings: ['culpa', 'confusão', 'falta_de_proposito'], intensities: ['moderada', 'intensa'], level: 'avançado', depth: 5, description: 'Confronta liberdade, fé, responsabilidade e sentido através de conflitos familiares.' },
  { title: 'Aforismos para a Sabedoria de Vida', author: 'Schopenhauer', tags: ['sofrimento', 'prudência', 'solidão', 'desejo', 'compaixão'], feelings: ['tristeza', 'solidão', 'confusão'], intensities: ['fraca', 'moderada'], level: 'iniciante', depth: 3, description: 'Oferece uma via mais prática para pensar desejos, relações e serenidade possível.' },
  { title: 'Dhammapada', author: 'Buda', tags: ['mente', 'apego', 'sofrimento', 'compaixão', 'consciência'], feelings: ['ansiedade', 'raiva', 'tristeza'], intensities: ['fraca', 'moderada', 'intensa'], level: 'iniciante', depth: 4, description: 'Reúne ensinamentos antigos sobre mente, ação, apego e cessação do sofrimento.', relatedAuthors: ['Buda — Sutta Nipata'] },
  { title: 'Tao Te Ching', author: 'Lao-Tsé', tags: ['fluxo', 'simplicidade', 'desapego', 'silêncio', 'equilíbrio'], feelings: ['ansiedade', 'confusão', 'medo'], intensities: ['fraca', 'moderada'], level: 'iniciante', depth: 4, description: 'Propõe simplicidade, flexibilidade e ação sem esforço excessivo.' },
  { title: 'O Mundo como Vontade e Representação', author: 'Schopenhauer', tags: ['desejo', 'sofrimento', 'representação', 'compaixão', 'existência'], feelings: ['tristeza', 'solidão', 'falta_de_proposito'], intensities: ['intensa'], level: 'avançado', depth: 5, description: 'Desenvolve sua filosofia do desejo, do sofrimento e da representação.' },
];

function enrichBookMetadata(book, index) {
  const tags = Array.from(new Set((book.tags || []).map(normalizeTheme)));
  const inferredFeelings = feelingsCatalog
    .map((feeling) => feeling.id)
    .filter((feeling) => tags.includes(normalizeTheme(feeling)));
  const relatedAuthors = Array.from(new Set([...(book.relatedAuthors || []), ...(book.authors || [])]));
  return {
    id: `book-${index + 1}`,
    title: book.title,
    author: book.author,
    themes: tags,
    feelings: book.feelings || inferredFeelings,
    intensities: book.intensities || ['fraca', 'moderada', 'intensa'],
    level: book.level || 'intermediário',
    depth: book.depth || 4,
    subjects: book.subjects || tags.slice(0, 3),
    description: book.description || `A obra desenvolve temas como ${tags.slice(0, 3).join(', ')} e amplia a reflexão para além da frase inicial.`,
    link: book.link || `https://www.google.com/search?q=${encodeURIComponent(`${book.title} ${book.author} livro`)}`,
    isbn: book.isbn || '',
    relatedAuthors,
  };
}

const normalizedBookCatalog = [...bookCatalog, ...additionalBookCatalog]
  .map(enrichBookMetadata)
  .filter((book, index, catalog) => catalog.findIndex((candidate) => normalizeTheme(candidate.title) === normalizeTheme(book.title) && normalizeTheme(candidate.author) === normalizeTheme(book.author)) === index);

// =========================
// Estado
// =========================

let history = []; // lista de { quote, author, reflection, advice, tags }
let historyIndex = -1;
let currentShareText = '';
let currentStory = null;
let currentShareStyle = 'sage';

let selectedFeelingIds = new Set();
let currentIntensity = 'moderada';
const usedStoryKeysBySelection = new Map();

const preferenceProfile = loadPreferenceProfile();
const favoriteStories = loadFavoriteStories();
const viewedStoryKeys = new Set(loadViewedStoryKeys());
let recentAuthorNames = loadRecentAuthorNames();
let generatedContentCount = loadGeneratedContentCount();

// =========================
// UI refs
// =========================

const feelingsGridEl = document.getElementById('feelingsGrid');
const generateBtn = document.getElementById('generateBtn');
const backBtn = document.getElementById('backBtn');
const newBtn = document.getElementById('newBtn');
const whatsShareBtn = document.getElementById('whatsShareBtn');
const sendWithLinkBtn = document.getElementById('sendWithLinkBtn');
const copyShareBtn = document.getElementById('copyShareBtn');
const shareStatusEl = document.getElementById('shareStatus');
const shareStyleButtons = Array.from(document.querySelectorAll('[data-share-style]'));

const quoteTextEl = document.getElementById('quoteText');
const quoteAuthorEl = document.getElementById('quoteAuthor');
const reflectionTextEl = document.getElementById('reflectionText');
const philosophyTextEl = document.getElementById('philosophyText');
const adviceTextEl = document.getElementById('adviceText');
const bookTextEl = document.getElementById('bookText');
const bookReasonEl = document.getElementById('bookReason');
const tagsRowEl = document.getElementById('tagsRow');
const likeBtn = document.getElementById('likeBtn');
const dislikeBtn = document.getElementById('dislikeBtn');
const favoriteBtn = document.getElementById('favoriteBtn');
const favoritesBtn = document.getElementById('favoritesBtn');
const favoritesCountEl = document.getElementById('favoritesCount');
const favoritesDialog = document.getElementById('favoritesDialog');
const favoritesListEl = document.getElementById('favoritesList');
const closeFavoritesBtn = document.getElementById('closeFavoritesBtn');
const preferenceNoteEl = document.getElementById('preferenceNote');
const explanationTitleEl = document.getElementById('explanationTitle');
const selectionHintEl = document.getElementById('selectionHint');
const aboutBtn = document.getElementById('aboutBtn');
const aboutDialog = document.getElementById('aboutDialog');
const closeAboutBtn = document.getElementById('closeAboutBtn');
const dailyQuoteTextEl = document.getElementById('dailyQuoteText');
const dailyQuoteTextCloneEl = document.getElementById('dailyQuoteTextClone');
const visitorCountEl = document.getElementById('visitorCount');

const intensityRadioEls = Array.from(document.querySelectorAll('input[name="intensity"]'));

const decorCanvas = document.getElementById('decorCanvas');

const shareCardThemes = {
  cream: {
    name: 'Creme',
    page: '#fbf8ef',
    top: '#f8efd7',
    bottom: '#e9dfbd',
    glow: 'rgba(255, 255, 235, 0.7)',
    leaf: 'rgba(125, 150, 91, 0.26)',
    leafDark: 'rgba(88, 119, 74, 0.2)',
    ink: '#282217',
    muted: 'rgba(40, 34, 23, 0.68)',
    stroke: 'rgba(68, 57, 37, 0.15)',
  },
  sage: {
    name: 'Verde',
    page: '#f5f7ec',
    top: '#e3ebcb',
    bottom: '#adbd7c',
    glow: 'rgba(255, 255, 227, 0.72)',
    leaf: 'rgba(75, 112, 68, 0.28)',
    leafDark: 'rgba(54, 84, 52, 0.22)',
    ink: '#292219',
    muted: 'rgba(41, 34, 25, 0.66)',
    stroke: 'rgba(54, 75, 42, 0.17)',
  },
  blue: {
    name: 'Azul',
    page: '#f3f7f4',
    top: '#dce9df',
    bottom: '#a5bec1',
    glow: 'rgba(245, 252, 237, 0.64)',
    leaf: 'rgba(70, 103, 99, 0.24)',
    leafDark: 'rgba(45, 76, 76, 0.2)',
    ink: '#25231d',
    muted: 'rgba(37, 35, 29, 0.65)',
    stroke: 'rgba(45, 76, 76, 0.17)',
  },
};

// =========================
// Init
// =========================

function initFeelings() {
  feelingsGridEl.innerHTML = '';

  for (const f of feelingsCatalog) {
    const card = document.createElement('label');
    card.className = 'feeling';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = f.id;

    const text = document.createElement('span');
    text.textContent = f.label;

    card.appendChild(input);
    card.appendChild(text);

    card.addEventListener('click', (e) => {
      e.preventDefault();
      const checked = !input.checked;
      input.checked = checked;
      if (checked) selectedFeelingIds.add(f.id);
      else selectedFeelingIds.delete(f.id);
      syncSelectedCards();
    });

    feelingsGridEl.appendChild(card);
  }

  syncSelectedCards();
}

function syncSelectedCards() {
  const cards = Array.from(feelingsGridEl.querySelectorAll('.feeling'));
  const primaryFeeling = getSelectedFeelingIds()[0];
  cards.forEach((card) => {
    const input = card.querySelector('input');
    const id = input.value;
    if (selectedFeelingIds.has(id)) card.classList.add('selected');
    else card.classList.remove('selected');
    card.classList.toggle('primary-feeling', id === primaryFeeling);
  });

  generateBtn.classList.toggle('has-selection', selectedFeelingIds.size > 0);
  if (selectedFeelingIds.size > 0) selectionHintEl.textContent = '';
}

function showSelectionHint() {
  selectionHintEl.textContent = 'Escolha pelo menos um sentimento antes de gerar sua reflexão.';
  feelingsGridEl.classList.remove('needs-selection');
  void feelingsGridEl.offsetWidth;
  feelingsGridEl.classList.add('needs-selection');
  window.setTimeout(() => feelingsGridEl.classList.remove('needs-selection'), 420);
}

function initIntensity() {
  intensityRadioEls.forEach((r) => {
    r.addEventListener('change', () => {
      currentIntensity = r.value;
    });
  });
}

function loadPreferenceProfile() {
  const fallback = {
    authors: {},
    tags: {},
    books: {},
    storyFeedback: {},
  };

  try {
    const saved = localStorage.getItem('caixaSabedoriaPreferencias');
    if (!saved) return fallback;
    return { ...fallback, ...JSON.parse(saved) };
  } catch {
    return fallback;
  }
}

function savePreferenceProfile() {
  try {
    localStorage.setItem('caixaSabedoriaPreferencias', JSON.stringify(preferenceProfile));
  } catch {
    // Se o navegador bloquear localStorage, o site continua funcionando sem aprendizado persistente.
  }
}

function loadViewedStoryKeys() {
  try {
    const saved = JSON.parse(localStorage.getItem('caixaSabedoriaHistoricoVisto') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveViewedStoryKeys() {
  try {
    localStorage.setItem('caixaSabedoriaHistoricoVisto', JSON.stringify(Array.from(viewedStoryKeys).slice(-600)));
    localStorage.setItem('caixaSabedoriaAutoresRecentes', JSON.stringify(recentAuthorNames.slice(-4)));
  } catch {
    // A rotação continua funcionando durante a sessão quando o armazenamento não está disponível.
  }
}

function loadRecentAuthorNames() {
  try {
    const saved = JSON.parse(localStorage.getItem('caixaSabedoriaAutoresRecentes') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function loadGeneratedContentCount() {
  try {
    const value = Number.parseInt(localStorage.getItem('caixaSabedoriaConteudosGerados') || '0', 10);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function saveGeneratedContentCount() {
  try {
    localStorage.setItem('caixaSabedoriaConteudosGerados', String(generatedContentCount));
  } catch {
    // A cadência continua válida durante a sessão.
  }
}

function loadFavoriteStories() {
  try {
    const saved = JSON.parse(localStorage.getItem('caixaSabedoriaFavoritas') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveFavoriteStories() {
  try {
    localStorage.setItem('caixaSabedoriaFavoritas', JSON.stringify(favoriteStories));
  } catch {
    // Favoritar continua sendo opcional quando o armazenamento do navegador estiver indisponível.
  }
}

function adjustPreference(bucket, key, delta) {
  if (!key) return;
  bucket[key] = (bucket[key] || 0) + delta;
  if (bucket[key] === 0) delete bucket[key];
}

function applyStoryPreference(story, delta) {
  adjustPreference(preferenceProfile.authors, story.author, delta * 3);
  (story.rawTags || []).forEach((tag) => adjustPreference(preferenceProfile.tags, tag, delta));
  if (story.book) adjustPreference(preferenceProfile.books, story.book.title, delta * 2);
}

function setStoryFeedback(value) {
  if (!currentStory) {
    preferenceNoteEl.textContent = 'Gere uma reflexão primeiro para marcar gostei ou não gostei.';
    return;
  }

  const key = currentStory.key;
  const previous = preferenceProfile.storyFeedback[key] || 0;
  const next = previous === value ? 0 : value;
  const delta = next - previous;

  if (delta !== 0) applyStoryPreference(currentStory, delta);

  if (next === 0) delete preferenceProfile.storyFeedback[key];
  else preferenceProfile.storyFeedback[key] = next;

  savePreferenceProfile();
  updateFeedbackButtons();
  updateBookRecommendation(currentStory);
  preferenceNoteEl.textContent = next === 0
    ? ''
    : next > 0
      ? 'Entendido. Suas próximas reflexões considerarão este estilo.'
      : 'Entendido. Vamos reduzir recomendações parecidas com esta.';
}

function isCurrentStoryFavorite() {
  return Boolean(currentStory && favoriteStories.some((story) => story.key === currentStory.key));
}

function updateFavoriteUi() {
  const active = isCurrentStoryFavorite();
  favoriteBtn.classList.toggle('active-favorite', active);
  favoriteBtn.setAttribute('aria-pressed', String(active));
  favoriteBtn.setAttribute('aria-label', active ? 'Remover das favoritas' : 'Adicionar às favoritas');
  favoriteBtn.title = active ? 'Remover das favoritas' : 'Favoritar';
  favoriteBtn.textContent = active ? '★' : '☆';
  favoritesCountEl.textContent = String(favoriteStories.length);
}

function toggleFavorite() {
  if (!currentStory) {
    preferenceNoteEl.textContent = 'Gere uma reflexão primeiro para favoritar.';
    return;
  }
  const index = favoriteStories.findIndex((story) => story.key === currentStory.key);

  if (index >= 0) {
    favoriteStories.splice(index, 1);
    preferenceNoteEl.textContent = 'Frase removida das favoritas.';
  } else {
    favoriteStories.unshift({
      key: currentStory.key,
      quote: currentStory.quote,
      attribution: currentStory.attribution,
      source: currentStory.source || '',
      savedAt: new Date().toISOString(),
    });
    preferenceNoteEl.textContent = 'Frase guardada discretamente nas suas favoritas.';
  }

  saveFavoriteStories();
  updateFavoriteUi();
}

function renderFavorites() {
  favoritesListEl.innerHTML = '';
  if (!favoriteStories.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-favorites';
    empty.textContent = 'As frases que tocarem você poderão morar aqui.';
    favoritesListEl.appendChild(empty);
    return;
  }

  favoriteStories.forEach((story) => {
    const item = document.createElement('article');
    item.className = 'favorite-item';

    const quote = document.createElement('div');
    quote.className = 'favorite-item-quote';
    quote.textContent = `“${story.quote}”`;

    const meta = document.createElement('div');
    meta.className = 'favorite-item-meta';
    meta.textContent = story.source ? `${story.attribution} · ${story.source}` : story.attribution;

    const actions = document.createElement('div');
    actions.className = 'favorite-item-actions';
    const remove = document.createElement('button');
    remove.className = 'ghost';
    remove.type = 'button';
    remove.textContent = 'Remover';
    remove.addEventListener('click', () => {
      const index = favoriteStories.findIndex((favorite) => favorite.key === story.key);
      if (index >= 0) favoriteStories.splice(index, 1);
      saveFavoriteStories();
      updateFavoriteUi();
      renderFavorites();
    });

    actions.appendChild(remove);
    item.append(quote, meta, actions);
    favoritesListEl.appendChild(item);
  });
}

function updateFeedbackButtons() {
  const value = currentStory ? (preferenceProfile.storyFeedback[currentStory.key] || 0) : 0;
  likeBtn.classList.toggle('active-like', value > 0);
  dislikeBtn.classList.toggle('active-dislike', value < 0);
  likeBtn.setAttribute('aria-pressed', String(value > 0));
  dislikeBtn.setAttribute('aria-pressed', String(value < 0));
}

function computeCurrentTimeString() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

const dailyQuotes = [
  ['Não são as coisas que perturbam, mas as ideias que fazemos delas.', 'Epicteto · Manual, capítulo 5'],
  ['A ansiedade é a vertigem da liberdade.', 'Kierkegaard · O Conceito de Angústia'],
  ['Quem tem um porquê enfrenta quase qualquer como.', 'Nietzsche · Crepúsculo dos Ídolos'],
  ['Confie em si: todo coração vibra com essa corda de ferro.', 'Emerson · Autoconfiança'],
  ['Fui para os bosques porque desejava viver deliberadamente.', 'Thoreau · Walden'],
  ['Sofremos mais na imaginação do que na realidade.', 'Sêneca · Cartas a Lucílio'],
  ['A mente precede nossas ações; aquilo que alimentamos ganha forma em nossa vida.', 'Ideia inspirada no Dhammapada'],
  ['A vida só se entende olhando para trás, mas precisa ser vivida olhando para frente.', 'Kierkegaard · Diários, 1843'],
];

function initDailyQuote() {
  const now = new Date();
  const dayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  const [quote, attribution] = dailyQuotes[dayNumber % dailyQuotes.length];
  const text = `“${quote}” — ${attribution}`;
  dailyQuoteTextEl.textContent = text;
  dailyQuoteTextCloneEl.textContent = text;
}

// =========================
// Seleção da frase (sem aleatoriedade)
// Compatibilidade por tags
// =========================

function getSelectedThemes() {
  const themes = new Set();
  for (const f of feelingsCatalog) {
    if (selectedFeelingIds.has(f.id)) {
      (f.themes || []).forEach((t) => themes.add(normalizeTheme(t)));
    }
  }
  return Array.from(themes);
}

function interpretEmotionalState() {
  const feelings = getSelectedFeelingIds();
  const primaryFeeling = feelings[0] || null;
  const secondaryFeelings = feelings.slice(1);
  const themes = new Set(getSelectedThemes().map(normalizeTheme));

  combinationRules.forEach((rule) => {
    if (rule.feelings.every((feeling) => feelings.includes(feeling))) {
      rule.themes.forEach((theme) => themes.add(normalizeTheme(theme)));
    }
  });

  const intensity = intensityProfiles[currentIntensity] || intensityProfiles.moderada;
  intensity.themes.forEach((theme) => themes.add(normalizeTheme(theme)));

  return {
    feelings,
    primaryFeeling,
    secondaryFeelings,
    intensity: currentIntensity,
    psychologicalThemes: Array.from(themes),
    suitableTones: intensity.suitableTones,
  };
}

function normalizeTheme(t) {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

// Apenas textos com referência editorial conhecida aparecem como citação direta.
// Todo o restante do banco é apresentado honestamente como uma ideia inspirada no pensador.
const verifiedQuoteMetadata = {
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

const authorToneProfiles = {
  acolhedor: ['Clarice Lispector', 'Rumi', 'Simone Weil', 'Maya Angelou', 'Viktor Frankl', 'Buda — Sutta Nipata'],
  direto: ['Marco Aurélio', 'Epicteto', 'Sêneca', 'Frank Herbert', 'Bhagavad Gita', 'Confúcio', 'Ptahhotep'],
  confrontador: ['Nietzsche', 'Osho', 'Steve Jobs'],
  analítico: ['Platão', 'Sócrates', 'Aristóteles', 'Carl Jung', 'Hannah Arendt', 'Heráclito'],
};

const toneFamilies = {
  acolhedor_dissolvente: 'acolhedor',
  poetico_melancolico: 'poético',
  cruel_lucido: 'confrontador',
  xamanico_ancestral: 'contemplativo',
  erotico_devocional: 'poético',
  clinico_compassivo: 'acolhedor',
};

function getToneFamily(tone) {
  return toneFamilies[tone] || tone;
}

const textThemeKeywords = {
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
};

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

const curatedContentDb = [
  {
    id: 'curated-01', autor: 'Pema Chödrön', frase: 'Você é o céu. Todo o resto é apenas o clima.',
    sentimentos: ['medo', 'ansiedade'], intensidade: ['moderada', 'intensa'], temas: ['observação', 'impermanência', 'essência'], tom: 'acolhedor', profundidade: 3,
    conselho: 'Observe a tempestade interna sem confundir esse estado passageiro com quem você é.',
    explicacao: 'Os pensamentos acelerados mudam como o clima. A consciência é o espaço que permite observá-los sem ser totalmente dominado por eles.',
    livro: 'Quando Tudo se Desfaz', quoteType: 'exact', source: 'Pema Chödrön',
  },
  {
    id: 'curated-02', autor: 'Sêneca', frase: 'Sofremos mais na imaginação do que na realidade.',
    sentimentos: ['medo', 'ansiedade'], intensidade: ['fraca', 'moderada'], temas: ['controle', 'futuro', 'pensamento acelerado'], tom: 'direto', profundidade: 4,
    conselho: 'Separe o que está acontecendo agora dos cenários que sua mente está antecipando.',
    explicacao: 'A ansiedade pode produzir sofrimento antes que algo realmente aconteça. Sêneca propõe voltar aos fatos presentes.',
    livro: 'Cartas a Lucílio', quoteType: 'exact', source: 'Cartas a Lucílio',
  },
  {
    id: 'curated-03', autor: 'Alan Watts', frase: 'A única maneira de compreender a mudança é entrar nela, mover-se com ela e participar da dança.',
    sentimentos: ['medo', 'ansiedade'], intensidade: ['intensa'], temas: ['incerteza', 'mudança', 'desapego'], tom: 'contemplativo', profundidade: 4,
    conselho: 'Troque a tentativa de controlar toda mudança por uma ação possível dentro dela.',
    explicacao: 'Watts sugere que segurança não é imobilidade. Adaptar-se conscientemente pode ser mais eficaz do que resistir ao que já está mudando.',
    livro: 'A Sabedoria da Insegurança', quoteType: 'exact', source: 'A Sabedoria da Insegurança',
  },
  {
    id: 'curated-04', autor: 'Rainer Maria Rilke', frase: 'A jornada mais importante é aquela que conduz ao seu próprio interior.',
    sentimentos: ['solidão', 'tristeza'], intensidade: ['moderada', 'intensa'], temas: ['autoconhecimento', 'isolamento', 'crescimento'], tom: 'poético', profundidade: 5,
    conselho: 'Use parte desse silêncio para reconhecer necessidades que vinham sendo evitadas.',
    explicacao: 'A solidão pode se tornar um espaço de autoconhecimento quando não é tratada apenas como ausência de outras pessoas.',
    livro: 'Cartas a um Jovem Poeta', quoteType: 'inspired', source: 'Ideia inspirada em Rilke',
  },
  {
    id: 'curated-05', autor: 'Nietzsche', frase: 'É preciso ter caos dentro de si para dar à luz uma estrela dançante.',
    sentimentos: ['solidão', 'confusão'], intensidade: ['intensa'], temas: ['criação', 'dor', 'potência'], tom: 'confrontador', profundidade: 5,
    conselho: 'Organize uma pequena parte do caos e transforme-a em ação criativa.',
    explicacao: 'Nietzsche apresenta a confusão como matéria que pode ser transformada. Isso não glorifica a dor; indica que algo novo pode nascer do trabalho realizado sobre ela.',
    livro: 'Assim Falou Zaratustra', quoteType: 'exact', source: 'Assim Falou Zaratustra',
  },
  {
    id: 'curated-06', autor: 'Epicteto', frase: 'A solidão pode ser prisão ou espaço de liberdade; a diferença está no uso que fazemos dela.',
    sentimentos: ['solidão'], intensidade: ['fraca', 'moderada'], temas: ['perspectiva', 'liberdade', 'virtude'], tom: 'direto', profundidade: 4,
    conselho: 'Escolha uma prática que transforme o silêncio em cuidado, estudo ou descanso.',
    explicacao: 'Estar só é uma circunstância. A maneira de interpretar e utilizar esse tempo influencia se ele será vivido como abandono ou fortalecimento.',
    livro: 'Encheirídion', quoteType: 'inspired', source: 'Ideia inspirada no estoicismo de Epicteto',
  },
  {
    id: 'curated-07', autor: 'Milan Kundera', frase: 'O amor não se manifesta apenas no desejo, mas também na vontade de compartilhar o descanso.',
    sentimentos: ['amor', 'medo'], intensidade: ['moderada'], temas: ['intimidade', 'confiança', 'entrega'], tom: 'poético', profundidade: 4,
    conselho: 'Observe se existe segurança suficiente para você baixar a guarda sem abandonar seus limites.',
    explicacao: 'Kundera desloca o amor da intensidade da paixão para a intimidade tranquila, onde duas pessoas conseguem permanecer vulneráveis.',
    livro: 'A Insustentável Leveza do Ser', quoteType: 'inspired', source: 'Ideia inspirada em Milan Kundera',
  },
  {
    id: 'curated-08', autor: 'Simone Weil', frase: 'A atenção é a forma mais rara e pura de generosidade.',
    sentimentos: ['amor', 'culpa'], intensidade: ['fraca', 'moderada'], temas: ['presença', 'doação', 'escuta', 'reparação'], tom: 'acolhedor', profundidade: 5,
    conselho: 'Repare oferecendo presença verdadeira, escuta e uma mudança concreta de atitude.',
    explicacao: 'Para Weil, atenção significa suspender a pressa e o próprio interesse para reconhecer plenamente a realidade do outro.',
    livro: 'A Gravidade e a Graça', quoteType: 'exact', source: 'Simone Weil',
  },
  {
    id: 'curated-09', autor: 'Aristóteles', frase: 'Qualquer pessoa pode sentir raiva. Difícil é senti-la pela razão certa, na medida certa e expressá-la da maneira certa.',
    sentimentos: ['raiva', 'confusão'], intensidade: ['moderada', 'intensa'], temas: ['virtude', 'temperança', 'justiça'], tom: 'direto', profundidade: 4,
    conselho: 'Descubra o que sua raiva está protegendo antes de escolher como agir.',
    explicacao: 'Aristóteles não condena a raiva em si. A virtude está em compreender seu motivo e expressá-la com proporção e responsabilidade.',
    livro: 'Ética a Nicômaco', quoteType: 'inspired', source: 'Síntese de Ética a Nicômaco',
  },
  {
    id: 'curated-10', autor: 'Carl Jung', frase: 'Aquilo que nos irrita nos outros pode ajudar a compreender melhor a nós mesmos.',
    sentimentos: ['raiva', 'culpa'], intensidade: ['moderada'], temas: ['sombra', 'projeção', 'autoconhecimento'], tom: 'confrontador', profundidade: 5,
    conselho: 'Pergunte o que essa irritação revela sobre seus valores, feridas ou limites.',
    explicacao: 'Jung sugere que algumas reações intensas podem revelar aspectos internos ainda pouco compreendidos. Isso não elimina a responsabilidade da outra pessoa.',
    livro: 'Memórias, Sonhos, Reflexões', quoteType: 'inspired', source: 'Ideia inspirada em Carl Jung',
  },
  {
    id: 'curated-11', autor: 'Hannah Arendt', frase: 'O perdão interrompe consequências que, sem ele, continuariam se repetindo indefinidamente.',
    sentimentos: ['culpa'], intensidade: ['moderada', 'intensa'], temas: ['perdão', 'ação', 'liberdade', 'reparação'], tom: 'contemplativo', profundidade: 5,
    conselho: 'Assuma a responsabilidade, repare o possível e permita que o presente volte a ter escolhas.',
    explicacao: 'Arendt entende o perdão como uma ação que não apaga o passado, mas impede que ele determine sozinho todo o futuro.',
    livro: 'A Condição Humana', quoteType: 'inspired', source: 'Ideia de A Condição Humana',
  },
  {
    id: 'curated-12', autor: 'Marco Aurélio', frase: 'A qualidade dos pensamentos que você alimenta influencia a qualidade da vida que percebe e constrói.',
    sentimentos: ['confusão', 'ansiedade'], intensidade: ['fraca', 'moderada'], temas: ['mente', 'clareza', 'responsabilidade'], tom: 'direto', profundidade: 3,
    conselho: 'Examine um pensamento de cada vez e diferencie fato, interpretação e escolha.',
    explicacao: 'O estoicismo lembra que pensamentos não são neutros: eles orientam atenção, julgamento e comportamento. Organizá-los ajuda a agir com clareza.',
    livro: 'Meditações', quoteType: 'inspired', source: 'Ideia inspirada em Meditações',
  },
  {
    id: 'curated-13', autor: 'John Keats', frase: 'Maturidade também é conseguir permanecer entre incertezas e dúvidas sem exigir uma resposta imediata.',
    sentimentos: ['confusão', 'medo'], intensidade: ['intensa'], temas: ['incerteza', 'paciência', 'criação'], tom: 'poético', profundidade: 5,
    conselho: 'Dê um prazo à dúvida e evite transformar a falta de resposta em uma resposta negativa.',
    explicacao: 'Keats chamou essa capacidade de permanecer no mistério de capacidade negativa. Ela permite observar antes de fechar uma conclusão.',
    livro: 'Cartas de John Keats', quoteType: 'inspired', source: 'Conceito de capacidade negativa',
  },
  {
    id: 'curated-14', autor: 'Nelson Mandela', frase: 'Coragem não é ausência de medo, mas a decisão de agir apesar dele.',
    sentimentos: ['medo'], intensidade: ['moderada', 'intensa'], temas: ['coragem', 'superação', 'ação consciente'], tom: 'direto', profundidade: 3,
    conselho: 'Escolha uma ação pequena que o medo não possa decidir por você.',
    explicacao: 'Mandela redefine coragem como uma relação ativa com o medo. A emoção permanece, mas deixa de possuir a palavra final.',
    livro: 'Longo Caminho para a Liberdade', quoteType: 'inspired', source: 'Ideia expressa por Nelson Mandela',
  },
  {
    id: 'curated-15', autor: 'Rumi', frase: 'Uma ferida reconhecida pode se tornar o lugar por onde começa a cura.',
    sentimentos: ['amor', 'solidão', 'luto'], intensidade: ['intensa'], temas: ['dor', 'cura', 'abertura', 'perda'], tom: 'poético', profundidade: 4,
    conselho: 'Não trate a dor como castigo; observe qual cuidado ela está pedindo.',
    explicacao: 'A imagem da ferida mostra que a vulnerabilidade pode revelar necessidades profundas e abrir espaço para transformação.',
    livro: 'Poemas de Rumi', quoteType: 'inspired', source: 'Ideia inspirada na poesia de Rumi',
  },
  {
    id: 'curated-16', autor: 'Lao-Tsé', frase: 'A ansiedade cresce quando a mente abandona o presente para tentar controlar o futuro.',
    sentimentos: ['ansiedade'], intensidade: ['fraca', 'moderada'], temas: ['presente', 'futuro', 'paz', 'controle'], tom: 'contemplativo', profundidade: 3,
    conselho: 'Volte a atenção ao que pode ser percebido e realizado agora.',
    explicacao: 'Esta é uma formulação contemporânea coerente com a atenção taoista ao fluxo, não uma citação literal do Tao Te Ching.',
    livro: 'Tao Te Ching', quoteType: 'inspired', source: 'Ideia contemporânea inspirada no taoismo',
  },
  {
    id: 'curated-17', autor: 'Dostoiévski', frase: 'O mistério da existência humana não está apenas em permanecer vivo, mas em encontrar algo pelo que viver.',
    sentimentos: ['culpa', 'medo'], intensidade: ['intensa'], temas: ['sentido', 'reparação', 'propósito'], tom: 'confrontador', profundidade: 5,
    conselho: 'Transforme a culpa em responsabilidade e procure uma ação que devolva sentido ao presente.',
    explicacao: 'A frase desloca a existência da simples sobrevivência para a busca de significado, responsabilidade e direção.',
    livro: 'Os Irmãos Karamázov', quoteType: 'exact', source: 'Os Irmãos Karamázov',
  },
  {
    id: 'curated-18', autor: 'Sêneca', frase: 'A raiva prolongada costuma ferir primeiro a pessoa que continua alimentando-a.',
    sentimentos: ['raiva'], intensidade: ['moderada', 'intensa'], temas: ['controle', 'autodomínio', 'consequências'], tom: 'direto', profundidade: 3,
    conselho: 'Antes de agir, reduza a intensidade e escolha qual resultado você realmente deseja.',
    explicacao: 'A metáfora popular do ácido não foi preservada como citação de Sêneca. Esta formulação resume sua reflexão sobre os danos da raiva sem criar uma autoria falsa.',
    livro: 'Sobre a Ira', quoteType: 'inspired', source: 'Síntese de Sobre a Ira',
  },
  {
    id: 'curated-19', autor: 'Viktor Frankl', frase: 'Quando não podemos mudar uma situação, somos desafiados a mudar nossa maneira de responder a ela.',
    sentimentos: ['confusão', 'solidão'], intensidade: ['intensa'], temas: ['adaptação', 'sentido', 'liberdade interior'], tom: 'acolhedor', profundidade: 4,
    conselho: 'Se a situação não pode mudar agora, escolha a atitude que melhor protege seus valores.',
    explicacao: 'Frankl localiza uma liberdade possível na resposta humana, mesmo quando as circunstâncias externas permanecem difíceis.',
    livro: 'Em Busca de Sentido', quoteType: 'inspired', source: 'Ideia de Viktor Frankl',
  },
  {
    id: 'curated-20', autor: 'Clarice Lispector', frase: 'Não se preocupe em entender tudo; viver ultrapassa qualquer explicação completa.',
    sentimentos: ['amor', 'confusão'], intensidade: ['moderada'], temas: ['mistério', 'entrega', 'experiência'], tom: 'poético', profundidade: 4,
    conselho: 'Aceite o que ainda não possui resposta sem abandonar seus limites e sua atenção.',
    explicacao: 'Clarice lembra que algumas experiências precisam ser vividas antes de serem organizadas intelectualmente.',
    livro: 'Uma Aprendizagem ou O Livro dos Prazeres', quoteType: 'inspired', source: 'Ideia inspirada em Clarice Lispector',
  },
  {
    id: 'curated-21', autor: 'Thich Nhat Hanh', frase: 'O medo pode proteger você de um perigo, mas não deve impedir toda experiência de vida.',
    sentimentos: ['medo'], intensidade: ['fraca', 'moderada'], temas: ['consciência', 'limite', 'plenitude'], tom: 'acolhedor', profundidade: 3,
    conselho: 'Reconheça o aviso do medo e depois verifique se o perigo ainda está realmente presente.',
    explicacao: 'A função protetora do medo é importante, mas pode continuar ativa mesmo quando já não existe uma ameaça imediata.',
    livro: 'A Arte de Viver', quoteType: 'inspired', source: 'Leitura inspirada em Thich Nhat Hanh',
  },
  {
    id: 'curated-22', autor: 'Blaise Pascal', frase: 'Grande parte da inquietação humana nasce da dificuldade de permanecer em silêncio consigo mesmo.',
    sentimentos: ['ansiedade', 'solidão'], intensidade: ['moderada'], temas: ['quietude', 'fuga', 'presença'], tom: 'confrontador', profundidade: 4,
    conselho: 'Experimente alguns minutos de quietude sem preencher imediatamente o espaço com distrações.',
    explicacao: 'Pascal observa que a agitação constante pode funcionar como fuga da própria condição e das perguntas que evitamos.',
    livro: 'Pensamentos', quoteType: 'inspired', source: 'Ideia de Pensamentos',
  },
  {
    id: 'curated-23', autor: 'Jean-Paul Sartre', frase: 'Somos responsáveis por nossas escolhas mesmo quando não escolhemos as circunstâncias em que precisamos agir.',
    sentimentos: ['culpa'], intensidade: ['intensa'], temas: ['liberdade', 'responsabilidade', 'angústia'], tom: 'confrontador', profundidade: 5,
    conselho: 'Reconheça sua responsabilidade sem transformar culpa em paralisia; escolha novamente por meio de uma ação concreta.',
    explicacao: 'Sartre relaciona liberdade e responsabilidade. Não controlamos o início de todas as situações, mas respondemos pelo que fazemos dentro delas.',
    livro: 'O Existencialismo é um Humanismo', quoteType: 'inspired', source: 'Síntese do existencialismo de Sartre',
  },
  {
    id: 'curated-24', autor: 'Audre Lorde', frase: 'A raiva contém informação e energia; compreendê-la pode transformá-la em ação contra a injustiça.',
    sentimentos: ['raiva', 'solidão'], intensidade: ['intensa'], temas: ['potência', 'justiça', 'transformação'], tom: 'confrontador', profundidade: 4,
    conselho: 'Pergunte qual injustiça ou limite sua raiva está tentando revelar.',
    explicacao: 'Lorde não trata a raiva como defeito. Ela pode revelar opressões e oferecer energia para uma ação consciente, desde que não seja usada de modo destrutivo.',
    livro: 'A Irmã Exterior', quoteType: 'inspired', source: 'Síntese de ideias de Audre Lorde',
  },
  {
    id: 'curated-25', autor: 'Erich Fromm', frase: 'O amor maduro cria união sem destruir a integridade e a individualidade de quem ama.',
    sentimentos: ['amor'], intensidade: ['fraca', 'moderada'], temas: ['individualidade', 'união', 'maturidade'], tom: 'acolhedor', profundidade: 4,
    conselho: 'Aproxime-se sem abandonar sua identidade, seus limites e sua capacidade de escolher.',
    explicacao: 'Fromm distingue amor de dependência. Uma relação madura aproxima duas pessoas inteiras, em vez de exigir que uma desapareça dentro da outra.',
    livro: 'A Arte de Amar', quoteType: 'inspired', source: 'Ideia de A Arte de Amar',
  },
  {
    id: 'curated-101', autor: 'Rainer Maria Rilke', frase: 'Que a saudade não seja um fardo, mas uma forma de presença. Aqueles que amamos nunca vão embora, eles caminham ao nosso lado todos os dias.',
    sentimentos: ['luto', 'solidão'], intensidade: ['moderada', 'intensa'], temas: ['saudade', 'presença', 'amor eterno'], tom: 'poético', profundidade: 4,
    conselho: 'Não lute contra a saudade. Deixe-a ser um novo modo de estar junto.',
    explicacao: 'A ausência física pode se tornar uma forma sutil de presença. A saudade é ressignificada como companhia interior, não apenas como vazio.',
    livro: 'Cartas a um Jovem Poeta', quoteType: 'inspired', source: 'Leitura editorial inspirada em Rainer Maria Rilke',
  },
  {
    id: 'curated-102', autor: 'Pema Chödrön', frase: 'Quando o coração está partido, é o momento perfeito para deixar o amor fluir. A rachadura é por onde a luz entra, mas também por onde o amor que ficou pode sair e tocar o mundo.',
    sentimentos: ['luto', 'amor'], intensidade: ['intensa'], temas: ['coração partido', 'cura', 'amor'], tom: 'acolhedor', profundidade: 3,
    conselho: 'Permita-se sentir o amor que ainda existe, mesmo na dor. Ele não é um vazio, é uma força.',
    explicacao: 'A metáfora da rachadura mostra que a vulnerabilidade do luto também pode ser uma abertura para o amor que sobrevive à perda.',
    livro: 'Quando Tudo se Desfaz', quoteType: 'inspired', source: 'Leitura editorial inspirada em Pema Chödrön',
  },
  {
    id: 'curated-103', autor: 'Thich Nhat Hanh', frase: 'A nuvem nunca morre. Ela se transforma em chuva, neve ou vapor, mas nunca deixa de ser. A pessoa que você ama também não morreu; ela apenas mudou de forma.',
    sentimentos: ['luto'], intensidade: ['intensa', 'moderada'], temas: ['transformação', 'impermanência', 'continuidade'], tom: 'acolhedor', profundidade: 4,
    conselho: 'Olhe para o mundo e reconheça a pessoa amada naquilo que ela deixou de belo e verdadeiro.',
    explicacao: 'A imagem da nuvem ensina que nada simplesmente desaparece: tudo se transforma. O vínculo pode continuar sob uma nova forma.',
    livro: 'O Coração da Compreensão', quoteType: 'inspired', source: 'Leitura editorial inspirada em Thich Nhat Hanh',
  },
  {
    id: 'curated-104', autor: 'Khalil Gibran', frase: 'Quando estiveres triste, olha de novo em teu coração, e verás que na verdade estás chorando por aquilo que foi o teu deleite. A dor é a taça que contém o vinho da alegria passada.',
    sentimentos: ['luto', 'tristeza'], intensidade: ['moderada'], temas: ['dor', 'alegria', 'memória'], tom: 'poético', profundidade: 4,
    conselho: 'Honre a dor como guardiã do amor que você sentiu. Ela também testemunha o que foi belo.',
    explicacao: 'Tristeza e alegria aparecem como duas faces da mesma experiência. A intensidade do luto reflete a profundidade do vínculo vivido.',
    livro: 'O Profeta', quoteType: 'inspired', source: 'Leitura editorial inspirada em Khalil Gibran',
  },
  {
    id: 'curated-105', autor: 'C. S. Lewis', frase: 'A perda de um ente querido é uma amputação. A ferida cicatriza, mas a parte que falta nunca é esquecida. Aprende-se a viver sem ela, e isso já é uma forma de cura.',
    sentimentos: ['luto'], intensidade: ['moderada'], temas: ['perda', 'cicatrização', 'adaptação'], tom: 'acolhedor', profundidade: 3,
    conselho: 'Não se cobre para superar. A cura pode ser aprender a caminhar com a ausência, não apagá-la.',
    explicacao: 'A imagem da amputação reconhece que a dor aguda muda, mas a falta se integra à nova forma de viver.',
    livro: 'A Anatomia de uma Dor', quoteType: 'inspired', source: 'Leitura editorial inspirada em C. S. Lewis',
  },
  {
    id: 'curated-106', autor: 'Epicuro', frase: 'A morte não é nada para nós. Enquanto existimos, a morte não está presente. Quando a morte chega, somos nós que não estamos mais aqui. Por que temer o que nunca encontraremos?',
    sentimentos: ['luto', 'medo'], intensidade: ['moderada', 'intensa'], temas: ['morte', 'ausência', 'serenidade'], tom: 'contemplativo', profundidade: 4,
    conselho: 'Lembre-se de que o sofrimento da perda pertence a quem ficou; quem partiu já não atravessa essa dor.',
    explicacao: 'O argumento epicurista oferece um consolo racional: a morte não é uma experiência sofrida por quem morreu.',
    livro: 'Carta a Meneceu', quoteType: 'inspired', source: 'Síntese do argumento de Epicuro em Carta a Meneceu',
  },
  {
    id: 'curated-107', autor: 'Clarice Lispector', frase: 'Saudade é um pouco como fome. Só passa quando se come a presença. Mas às vezes a saudade é tão profunda que a presença é pouca: queremos absorver a outra pessoa toda. Essa vontade de um ser o outro é o amor.',
    sentimentos: ['luto', 'amor'], intensidade: ['intensa'], temas: ['saudade', 'amor', 'fusão'], tom: 'poético', profundidade: 5,
    conselho: 'Reconheça na saudade a dimensão do vínculo, sem exigir que ela desapareça antes do seu tempo.',
    explicacao: 'A saudade é traduzida como fome de presença e como manifestação de um amor que não se contenta com a distância.',
    livro: 'A Descoberta do Mundo', quoteType: 'inspired', source: 'Leitura editorial inspirada em Clarice Lispector',
  },
  {
    id: 'curated-108', autor: 'Viktor Frankl', frase: 'O amor é a única maneira de capturar outro ser humano no mais íntimo de sua personalidade. Por seu amor, a pessoa que ama torna possível ao amado manifestar suas potencialidades. E, ao fazê-lo, o amor sobrevive até mesmo à morte.',
    sentimentos: ['luto', 'amor'], intensidade: ['moderada', 'intensa'], temas: ['amor', 'transcendência', 'sentido'], tom: 'acolhedor', profundidade: 5,
    conselho: 'O amor que você deu e recebeu criou uma realidade que a morte não pode apagar. Ele ainda está ativo em você.',
    explicacao: 'O amor transcende a morte porque revelou algo essencial do outro, e essa experiência permanece viva em quem ama.',
    livro: 'Em Busca de Sentido', quoteType: 'inspired', source: 'Leitura editorial inspirada em Viktor Frankl',
  },
  {
    id: 'curated-109', autor: 'Sêneca', frase: 'Aquele a quem amas não está mais aqui? Mas ele está onde está. E se está em algum lugar, não está perdido. A morte é apenas o fim da jornada visível.',
    sentimentos: ['luto'], intensidade: ['moderada'], temas: ['morte', 'jornada', 'consolo'], tom: 'contemplativo', profundidade: 3,
    conselho: 'Se isso fizer sentido para você, imagine a morte como uma viagem para além do que podemos enxergar.',
    explicacao: 'Esta leitura estoica trata a morte como mudança de condição, oferecendo uma imagem de continuidade para quem encontra consolo nela.',
    livro: 'Cartas a Lucílio', quoteType: 'inspired', source: 'Leitura editorial inspirada em Sêneca',
  },
  {
    id: 'curated-110', autor: 'Ramana Maharshi', frase: 'O que nasceu morrerá. O que nunca nasceu nunca morrerá. Você não é o corpo, você é a consciência que o testemunha. A pessoa que você ama é essa mesma consciência. Ela nunca morreu.',
    sentimentos: ['luto', 'confusão'], intensidade: ['intensa'], temas: ['consciência', 'imortalidade', 'essência'], tom: 'acolhedor', profundidade: 5,
    conselho: 'Se essa perspectiva espiritual acolher você, procure reconhecer o que permanece além da forma que se foi.',
    explicacao: 'Na não-dualidade, o corpo é transitório e a consciência é entendida como fundamento compartilhado que a morte não rompe.',
    livro: 'Ensinamentos Espirituais', quoteType: 'inspired', source: 'Leitura editorial inspirada em Ramana Maharshi',
  },
  {
    id: 'curated-111', autor: 'Mia Couto', frase: 'A morte, quando chega, não avisa. Mas a vida, quando fica, também não. Ficamos nós, com o silêncio da ausência. E é nesse silêncio que aprendemos a escutar o que a pessoa amada ainda diz, dentro de nós.',
    sentimentos: ['luto', 'solidão'], intensidade: ['intensa'], temas: ['silêncio', 'escuta interior', 'memória'], tom: 'poético', profundidade: 4,
    conselho: 'No silêncio do luto, escute o que a pessoa amada deixou vivo em você.',
    explicacao: 'O silêncio da ausência se transforma em espaço de escuta interior, no qual memórias e aprendizados continuam presentes.',
    livro: 'Obra poética de Mia Couto', quoteType: 'inspired', source: 'Leitura editorial inspirada na obra de Mia Couto',
  },
  {
    id: 'curated-112', autor: 'Khalil Gibran', frase: 'Vosso amigo é a resposta a vossas necessidades. Ele é o campo que semeais com amor e colheis com gratidão. Quando ele se vai, o campo não se torna estéril; as sementes que ele plantou em vós continuam a dar frutos.',
    sentimentos: ['luto', 'amor'], intensidade: ['moderada'], temas: ['amizade', 'legado', 'gratidão'], tom: 'poético', profundidade: 4,
    conselho: 'Olhe para o que a pessoa amada deixou plantado em você: valores, memórias e força.',
    explicacao: 'A metáfora do campo mostra que a partida não apaga o legado afetivo; aquilo que foi plantado continua produzindo vida interior.',
    livro: 'O Profeta', quoteType: 'inspired', source: 'Leitura editorial inspirada em Khalil Gibran',
  },
  {
    id: 'curated-113', autor: 'Emily Dickinson', frase: 'Dizer adeus é tudo o que sabemos do céu, e tudo o que precisamos do inferno. Mas entre os dois, há o amor que não termina.',
    sentimentos: ['luto'], intensidade: ['moderada'], temas: ['adeus', 'céu', 'inferno', 'amor eterno'], tom: 'poético', profundidade: 4,
    conselho: 'O adeus dói profundamente, mas o amor que o tornou necessário pode continuar com você.',
    explicacao: 'A imagem reúne o sofrimento da separação e a permanência do amor que existiu antes dela.',
    livro: 'Poemas', quoteType: 'inspired', source: 'Leitura editorial inspirada em Emily Dickinson',
  },
  {
    id: 'curated-114', autor: 'Henry Scott Holland', frase: 'A morte não é nada. Eu apenas passei para o outro lado. Eu sou eu, vocês são vocês. O que éramos uns para os outros, continuamos a ser. A vida continua significando o que sempre significou. O fio não foi cortado.',
    sentimentos: ['luto'], intensidade: ['intensa', 'moderada'], temas: ['continuidade', 'presença', 'normalidade'], tom: 'acolhedor', profundidade: 4,
    conselho: 'Permita que o vínculo continue existindo nas lembranças, nos nomes e nos gestos cotidianos.',
    explicacao: 'O consolo pastoral apresenta a morte como mudança de estado, e não como rompimento completo dos laços afetivos.',
    livro: 'Sermão “A Morte Não é Nada”', quoteType: 'inspired', source: 'Trecho adaptado do sermão de Henry Scott Holland',
  },
  {
    id: 'curated-115', autor: 'Anandamayi Ma', frase: 'Assim como uma pessoa que sonha não morre quando o sonho termina, aquele que parte deste mundo não morre, apenas desperta para outra realidade. A chama da vida nunca se apaga; ela muda de lamparina.',
    sentimentos: ['luto', 'medo'], intensidade: ['intensa'], temas: ['despertar', 'sonho', 'eternidade'], tom: 'contemplativo', profundidade: 5,
    conselho: 'Se essa imagem espiritual acolher você, veja a morte como passagem, não como aniquilação.',
    explicacao: 'A analogia do sonho apresenta a morte como transição entre estados de consciência e preserva uma imagem de continuidade da vida.',
    livro: 'Ensinamentos de Anandamayi Ma', quoteType: 'inspired', source: 'Leitura editorial inspirada em Anandamayi Ma',
  },
];

function makePerspective(id, autor, tradicao, frase, sentimentos, intensidade, temas, tom, conselho, explicacao, livro) {
  return { id, autor, tradicao, frase, sentimentos, intensidade, temas, tom, profundidade: 5, conselho, explicacao, livro };
}

const perspectiveContentDb = [
  makePerspective('persp-01', 'Nisargadatta Maharaj', 'a não-dualidade indiana', 'Você percebe a mente; por isso, não pode ser apenas aquilo que a mente produz.', ['ansiedade', 'confusão'], ['moderada', 'intensa'], ['consciência', 'identificação', 'observação'], 'acolhedor_dissolvente', 'Observe o pensamento como um acontecimento, não como uma definição de quem você é.', 'A perspectiva não-dual separa consciência e conteúdo mental. Pensamentos existem, mas não precisam ocupar toda a identidade.', 'Eu Sou Aquilo'),
  makePerspective('persp-02', 'Ramana Maharshi', 'a investigação do eu', 'Antes de procurar uma resposta para tudo, pergunte quem é a pessoa que precisa dessa resposta.', ['confusão', 'ansiedade', 'falta_de_proposito'], ['moderada', 'intensa'], ['identidade', 'autoconhecimento', 'silêncio'], 'acolhedor_dissolvente', 'Pergunte “quem está sentindo isso?” e permaneça alguns instantes sem completar a resposta.', 'A auto-investigação desloca a atenção do problema para a experiência de quem o percebe, reduzindo identificações automáticas.', 'Quem Sou Eu?'),
  makePerspective('persp-03', 'Anandamayi Ma', 'a mística devocional indiana', 'A alegria profunda não depende de negar a dor, mas de descobrir um espaço interior maior que ela.', ['tristeza', 'luto', 'solidão'], ['moderada', 'intensa'], ['alegria interior', 'presença', 'aceitação'], 'acolhedor_dissolvente', 'Não force alegria; apenas procure o espaço que consegue acolher também a tristeza.', 'Essa voz mística não pede fuga da dor. Ela aponta para uma consciência capaz de conter sofrimento sem ser reduzida a ele.', 'Ensinamentos de Anandamayi Ma'),
  makePerspective('persp-04', 'Papaji', 'a não-dualidade direta', 'Por um instante, pare de tentar se tornar livre e observe o que permanece quando a busca descansa.', ['ansiedade', 'confusão'], ['fraca', 'moderada'], ['liberdade', 'silêncio', 'busca'], 'acolhedor_dissolvente', 'Suspenda a procura por alguns minutos e perceba o que já está presente.', 'Papaji enfatiza uma liberdade reconhecida no presente, antes da construção de uma versão ideal de si.', 'Wake Up and Roar'),
  makePerspective('persp-05', 'Jiddu Krishnamurti', 'a observação sem escolha', 'Observar sem escolher o que deveria estar sentindo permite compreender o que realmente está acontecendo.', ['medo', 'ansiedade', 'confusão'], ['moderada', 'intensa'], ['observação', 'liberdade', 'condicionamento'], 'acolhedor_dissolvente', 'Descreva a emoção sem justificá-la, condená-la ou tentar corrigi-la imediatamente.', 'A observação sem escolha procura enxergar o movimento da mente antes que julgamento e fuga deformem a experiência.', 'A Primeira e Última Liberdade'),
  makePerspective('persp-06', 'Emily Dickinson', 'a poesia norte-americana do século XIX', 'A ausência também ocupa espaço: ela muda a forma da casa, do tempo e de quem continua.', ['luto', 'solidão', 'saudade'], ['moderada', 'intensa'], ['ausência', 'morte', 'memória'], 'poetico_melancolico', 'Permita que a ausência tenha nome, ritmo e memória, sem exigir que desapareça depressa.', 'A perspectiva poética dá forma ao vazio do luto e reconhece que continuar vivendo também transforma quem permanece.', 'Poemas de Emily Dickinson'),
  makePerspective('persp-07', 'Rainer Maria Rilke', 'a poesia existencial de língua alemã', 'Algumas dores não pedem uma saída imediata; pedem espaço suficiente para amadurecer uma nova forma de vida.', ['luto', 'solidão', 'tristeza'], ['intensa'], ['dor', 'transformação', 'paciência'], 'poetico_melancolico', 'Não apresse uma conclusão. Cuide do processo que ainda não ganhou forma.', 'Rilke trata a dor como experiência que pode amadurecer lentamente, sem romantizá-la nem exigir solução instantânea.', 'Elegias de Duíno'),
  makePerspective('persp-08', 'Fernando Pessoa', 'a literatura portuguesa do desassossego', 'Não pertencer completamente também pode ser uma maneira de enxergar aquilo que a pressa coletiva não percebe.', ['solidão', 'confusão', 'falta_de_proposito'], ['moderada', 'intensa'], ['não pertencimento', 'desassossego', 'observação'], 'poetico_melancolico', 'Registre o que sua sensação de não pertencer permite perceber com mais nitidez.', 'Pessoa transforma deslocamento e inquietação em observação da vida interior, sem fingir que o desconforto é simples.', 'Livro do Desassossego'),
  makePerspective('persp-09', 'Mirabai', 'a poesia devocional indiana', 'Um amor profundo pode atravessar distância e perda sem transformar presença em posse.', ['amor', 'solidão', 'luto'], ['moderada', 'intensa'], ['devoção', 'entrega', 'vínculo'], 'erotico_devocional', 'Honre o vínculo sem tentar controlar aquilo que o amor não pode possuir.', 'A devoção de Mirabai oferece uma linguagem para o amor que permanece intenso sem exigir domínio sobre o outro.', 'Poemas de Mirabai'),
  makePerspective('persp-10', 'Hafiz', 'a poesia sufi persa', 'O coração não precisa compreender todo o mistério para aceitar o convite de viver com mais abertura.', ['amor', 'ansiedade', 'esperança'], ['fraca', 'moderada'], ['mistério', 'leveza', 'entrega'], 'erotico_devocional', 'Abra espaço para uma experiência boa sem exigir garantias sobre todo o futuro.', 'Hafiz combina devoção, humor e mistério para aliviar o excesso de controle sem negar a realidade.', 'Divã de Hafez'),
  makePerspective('persp-11', 'Emil Cioran', 'o pessimismo filosófico do século XX', 'A lucidez não cura automaticamente a vida; às vezes ela apenas impede que uma mentira continue servindo de consolo.', ['raiva', 'confusão', 'falta_de_proposito'], ['fraca', 'moderada'], ['lucidez', 'desilusão', 'absurdo'], 'cruel_lucido', 'Retire uma ilusão, mas não transforme a lucidez em violência contra você.', 'A perspectiva de Cioran confronta consolos fáceis. Ela é oferecida apenas quando a intensidade permite um olhar duro sem aumentar a crise.', 'Breviário de Decomposição'),
  makePerspective('persp-12', 'Lev Shestov', 'o existencialismo religioso russo', 'Quando a razão chega ao próprio limite, a vida ainda pode exigir uma escolha que nenhuma prova consegue garantir.', ['confusão', 'medo', 'falta_de_proposito'], ['fraca', 'moderada'], ['razão', 'fé', 'incerteza'], 'cruel_lucido', 'Reconheça o limite da explicação e escolha qual valor merece sua confiança.', 'Shestov questiona a ideia de que apenas a razão pode orientar a existência, sobretudo diante do sofrimento e do impossível.', 'Atenas e Jerusalém'),
  makePerspective('persp-13', 'Miguel de Unamuno', 'o existencialismo trágico espanhol', 'A razão pede certeza, mas o coração continua desejando uma vida que tenha sentido além das provas.', ['luto', 'medo', 'falta_de_proposito'], ['moderada'], ['tragédia', 'sentido', 'finitude'], 'cruel_lucido', 'Não esconda o conflito entre aquilo que você sabe e aquilo que ainda espera.', 'Unamuno mantém aberta a tensão entre razão, desejo de permanência e consciência da morte.', 'Do Sentimento Trágico da Vida'),
  makePerspective('persp-14', 'Simone Weil', 'a filosofia da atenção e da aflição', 'A dor precisa ser vista com precisão para não ser reduzida a culpa, fraqueza ou espetáculo.', ['culpa', 'tristeza', 'luto'], ['moderada', 'intensa'], ['atenção', 'aflição', 'dignidade'], 'clinico_compassivo', 'Descreva o sofrimento com precisão e sem usar palavras que diminuam sua dignidade.', 'Weil oferece uma atenção rigorosa: olhar a aflição sem desviar, explorar ou apressar uma explicação.', 'A Gravidade e a Graça'),
  makePerspective('persp-15', 'Carl Jung', 'a psicologia analítica', 'Tornar-se inteiro exige reconhecer partes de si que não combinam com a imagem que você gostaria de mostrar.', ['culpa', 'raiva', 'confusão'], ['moderada'], ['sombra', 'individuação', 'integração'], 'clinico_compassivo', 'Nomeie uma parte rejeitada sem justificá-la nem condená-la; depois escolha como integrá-la com responsabilidade.', 'A individuação não elimina contradições. Ela amplia a consciência para que partes ocultas deixem de agir sem escolha.', 'O Homem e Seus Símbolos'),
  makePerspective('persp-16', 'James Hillman', 'a psicologia arquetípica', 'Nem todo sintoma é apenas um defeito a remover; às vezes ele tenta contar uma história que a vida consciente ignorou.', ['confusão', 'tristeza', 'falta_de_proposito'], ['fraca', 'moderada'], ['alma', 'imagem', 'sintoma'], 'poetico_melancolico', 'Pergunte que imagem ou necessidade seu sintoma tenta manter visível.', 'Hillman convida a escutar a dimensão simbólica da experiência sem substituir cuidado clínico quando ele é necessário.', 'O Código do Ser'),
  makePerspective('persp-17', 'Clarissa Pinkola Estés', 'a psicologia narrativa e os contos tradicionais', 'O luto também pode guardar a trilha de volta para uma parte viva de você que foi esquecida.', ['luto', 'raiva', 'solidão'], ['moderada', 'intensa'], ['intuição', 'luto', 'resgate'], 'xamanico_ancestral', 'Pergunte o que precisa ser chorado e o que precisa ser recuperado.', 'Estés usa histórias tradicionais para falar de perda, instinto e reconstrução da vida psíquica.', 'Mulheres que Correm com os Lobos'),
  makePerspective('persp-18', 'Gabor Maté', 'a abordagem clínica informada pelo trauma', 'Muitos comportamentos que hoje causam culpa começaram como tentativas de suportar uma dor antiga.', ['culpa', 'ansiedade', 'tristeza'], ['moderada', 'intensa'], ['trauma', 'compaixão', 'adaptação'], 'clinico_compassivo', 'Pergunte qual dor o comportamento tentou aliviar e qual cuidado mais seguro pode substituí-lo.', 'A perspectiva informada pelo trauma procura compreender a função de um comportamento sem retirar a responsabilidade por transformá-lo.', 'O Mito do Normal'),
  makePerspective('persp-19', 'Ailton Krenak', 'o pensamento indígena brasileiro contemporâneo', 'Pertencer à vida é lembrar que corpo, rio, floresta e comunidade não existem como mundos separados.', ['solidão', 'confusão', 'luto'], ['moderada', 'intensa'], ['pertencimento', 'natureza', 'comunidade'], 'xamanico_ancestral', 'Procure uma forma concreta de restabelecer vínculo com pessoas, território ou natureza.', 'Krenak questiona a separação entre humanidade e natureza e oferece pertencimento como resposta ao desenraizamento.', 'Ideias para Adiar o Fim do Mundo'),
  makePerspective('persp-20', 'Bayo Akomolafe', 'o pensamento iorubá e pós-humanista', 'Quando tudo parece urgente, desacelerar pode revelar saídas que a pressa tornou invisíveis.', ['ansiedade', 'confusão'], ['moderada', 'intensa'], ['desacelerar', 'incerteza', 'relação'], 'xamanico_ancestral', 'Reduza a velocidade antes de aumentar o esforço; observe o que muda na paisagem do problema.', 'Akomolafe apresenta desaceleração e relação como alternativas ao impulso de resolver crises repetindo as mesmas ferramentas.', 'These Wilds Beyond Our Fences'),
  makePerspective('persp-21', 'Malidoma Somé', 'a tradição Dagara e o pensamento comunitário', 'Uma dor carregada sem comunidade pode parecer apenas pessoal, mesmo quando também fala de vínculos rompidos.', ['solidão', 'luto', 'falta_de_proposito'], ['moderada', 'intensa'], ['ancestralidade', 'comunidade', 'propósito'], 'xamanico_ancestral', 'Procure uma pessoa, rito ou comunidade segura com quem essa dor possa ser reconhecida.', 'Somé enfatiza que cura e propósito não são apenas individuais; pertencimento e ritual ajudam a reorganizar a experiência.', 'O Espírito da Intimidade'),
  makePerspective('persp-22', 'bell hooks', 'a ética do amor e da comunidade', 'Amar é uma prática feita de cuidado, respeito, responsabilidade e compromisso com o crescimento.', ['amor', 'raiva', 'solidão'], ['moderada', 'intensa'], ['amor', 'comunidade', 'responsabilidade'], 'clinico_compassivo', 'Avalie o vínculo por suas práticas concretas, não apenas pela intensidade declarada.', 'bell hooks trata o amor como ação ética e comunitária, não apenas como sentimento ou dependência.', 'Tudo Sobre o Amor'),
  makePerspective('persp-23', 'Hélène Cixous', 'a escrita feminista do corpo', 'Escrever pode devolver voz a partes do corpo e da experiência que aprenderam a permanecer caladas.', ['culpa', 'confusão', 'raiva'], ['fraca', 'moderada'], ['escrita', 'corpo', 'libertação'], 'erotico_devocional', 'Escreva sem censura por alguns minutos e depois observe qual voz estava tentando aparecer.', 'Cixous entende a escrita como abertura para experiências silenciadas e novas formas de existência.', 'O Riso da Medusa'),
  makePerspective('persp-24', 'Luce Irigaray', 'a filosofia da diferença e da relação', 'Amar não exige transformar o outro numa cópia de si nem desaparecer para caber no desejo dele.', ['amor', 'culpa'], ['fraca', 'moderada'], ['diferença', 'relação', 'alteridade'], 'erotico_devocional', 'Proteja a diferença entre vocês sem transformá-la em distância ou domínio.', 'Irigaray propõe uma relação em que proximidade e diferença possam coexistir sem posse.', 'Amo a Ti'),
  makePerspective('persp-25', 'Zhuangzi', 'o taoismo antigo do paradoxo', 'Talvez o fracasso de um plano seja apenas a liberdade de um caminho que ainda não recebeu nome.', ['ansiedade', 'medo', 'confusão'], ['fraca', 'moderada'], ['paradoxo', 'liberdade', 'mudança'], 'acolhedor_dissolvente', 'Considere uma interpretação alternativa antes de chamar o acontecimento de fracasso.', 'Zhuangzi usa humor e paradoxo para desfazer certezas rígidas e ampliar possibilidades.', 'Zhuangzi'),
  makePerspective('persp-26', 'Dogen', 'o zen japonês', 'A prática não prepara você para o presente; a própria prática já é uma forma de habitar o presente.', ['ansiedade', 'falta_de_proposito'], ['moderada', 'intensa'], ['tempo', 'prática', 'presença'], 'acolhedor_dissolvente', 'Faça o próximo gesto com atenção completa, sem tratá-lo apenas como ponte para outra coisa.', 'Dogen aproxima prática e realização: atenção não é apenas um meio futuro, mas uma maneira atual de viver.', 'Shobogenzo'),
  makePerspective('persp-27', 'Ikkyu Sojun', 'o zen irreverente japonês', 'Desejo e espiritualidade não precisam fingir que vivem em mundos separados; ambos pedem honestidade.', ['amor', 'culpa', 'confusão'], ['fraca', 'moderada'], ['desejo', 'corpo', 'honestidade'], 'erotico_devocional', 'Reconheça o desejo sem transformá-lo em vergonha nem em ordem automática.', 'Ikkyu confronta a hipocrisia espiritual e aproxima corpo, desejo e consciência sem dispensar responsabilidade.', 'Poemas de Ikkyu'),
];

function normalizePerspectiveContent() {
  return perspectiveContentDb.map((item, index) => ({
    author: item.autor, displayAuthor: item.autor, quote: item.frase, contentType: 'quote', variantIndex: 2000 + index,
    quoteType: 'inspired', source: `Leitura editorial inspirada em ${item.autor}`, tags: item.temas,
    _tagsN: item.temas.map(normalizeTheme), sentimentos: item.sentimentos, intensidade: item.intensidade,
    temas: item.temas.map(normalizeTheme), tom: item.tom, profundidade: item.profundidade,
    incompativeis: inferIncompatibleStates(item.tom), adviceTemplate: () => item.conselho,
    reflectionTemplate: () => item.explicacao, curatedExplanation: item.explicacao,
    curatedAdvice: item.conselho, curatedBook: item.livro, curatedId: item.id,
    philosophy: `${item.autor} oferece aqui uma perspectiva ligada a ${item.tradicao}, com tom ${item.tom.replace(/_/g, ' e ')}.`,
  }));
}

function normalizeCuratedContent() {
  return curatedContentDb.map((item, index) => ({
    author: item.autor,
    displayAuthor: item.autor,
    quote: item.frase,
    contentType: 'quote',
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
  return authorsDb.flatMap((a) => {
    const quoteVariants = (authorQuoteVariants[a.author] || [a.quote]).map((quote) => ({
      text: clarityRewrites[quote] || quote,
      contentType: 'quote',
    }));
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
        displayAuthor: verified?.author || a.author,
        source: verified?.source || entry.source || '',
        _tagsN: a.tags.map(normalizeTheme),
        sentimentos: inferContentFeelings(a.tags),
        intensidade: inferIntensities(tone, depth),
        temas: themes,
        tom: tone,
        profundidade: depth,
        incompativeis: inferIncompatibleStates(tone),
      };
    });
  });
}

function normalizeContentKey(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const curatedNormalized = normalizeCuratedContent();
const perspectiveNormalized = normalizePerspectiveContent();
const curatedKeys = new Set([...curatedNormalized, ...perspectiveNormalized].map((item) => normalizeContentKey(item.quote)));
const authorsDbNormalized = [
  ...curatedNormalized,
  ...perspectiveNormalized,
  ...normalizeAuthorTagsDb().filter((item) => !curatedKeys.has(normalizeContentKey(item.quote))),
];

function getSelectedFeelingIds() {
  return Array.from(selectedFeelingIds);
}

function getSelectionKey() {
  return getSelectedFeelingIds().sort().join('|') || 'sem_sentimento';
}

function getStoryKey(author) {
  return `${author.author}::${author.quote}`;
}

function getAuthorAffinity(authorName, feelingIds) {
  return feelingIds.reduce((total, feelingId) => {
    const table = feelingAuthorAffinity[feelingId] || {};
    return total + (table[authorName] || 0);
  }, 0);
}

function scoreContentForState(author, state) {
  let score = 0;
  const reasons = [];

  if (state.primaryFeeling && author.sentimentos.includes(state.primaryFeeling)) {
    score += 3;
    reasons.push('sentimento principal');
  }
  if (state.secondaryFeelings.some((feeling) => author.sentimentos.includes(feeling))) {
    score += 2;
    reasons.push('sentimento secundário');
  }
  if (author.intensidade.includes(state.intensity)) {
    score += 2;
    reasons.push('intensidade');
  }
  if (state.psychologicalThemes.some((theme) => author.temas.includes(theme))) {
    score += 2;
    reasons.push('tema psicológico');
  }
  if (state.suitableTones.includes(getToneFamily(author.tom))) {
    score += 1;
    reasons.push('tom adequado');
  }

  const hasIncompatibility = state.feelings.some((feeling) => author.incompativeis.includes(`${feeling}:${state.intensity}`));
  if (hasIncompatibility) {
    score -= 3;
    reasons.push('penalidade emocional');
  }

  const affinity = getAuthorAffinity(author.author, state.feelings);
  const preference = (preferenceProfile.authors[author.author] || 0)
    + author._tagsN.reduce((total, tag) => total + (preferenceProfile.tags[tag] || 0), 0);

  return {
    score,
    reasons,
    tieBreaker: affinity + preference * 0.1,
  };
}

function getRankedCandidates(state) {
  return authorsDbNormalized
    .map((author) => ({ author, ...scoreContentForState(author, state) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.tieBreaker !== a.tieBreaker) return b.tieBreaker - a.tieBreaker;
      if (a.author.author !== b.author.author) return a.author.author.localeCompare(b.author.author);
      return a.author.variantIndex - b.author.variantIndex;
    });
}

function pickBestAuthorByThemes(selectedThemes, feelingIds = getSelectedFeelingIds(), { excludeAuthors = [] } = {}) {
  if (selectedThemes.length === 0) return null;

  const state = interpretEmotionalState();
  const rankedCandidates = getRankedCandidates(state);
  const desiredContentType = generatedContentCount % 4 === 3 ? 'text' : 'quote';

  let globallyUnseen = rankedCandidates.filter((candidate) => !viewedStoryKeys.has(getStoryKey(candidate.author)));
  if (!globallyUnseen.length) {
    // Um novo ciclo só começa quando todas as frases e todos os textos foram vistos.
    viewedStoryKeys.clear();
    recentAuthorNames = [];
    globallyUnseen = rankedCandidates;
  }

  const unseenWithoutExcluded = globallyUnseen.filter((candidate) => !excludeAuthors.includes(candidate.author.author));
  const unseen = unseenWithoutExcluded.length ? unseenWithoutExcluded : globallyUnseen;

  const desiredUnseen = unseen.filter((candidate) => candidate.author.contentType === desiredContentType);
  const activePool = desiredUnseen.length ? desiredUnseen : unseen;
  const relevantPool = activePool.filter((candidate) => candidate.score > 0);
  const rankedPool = relevantPool.length ? relevantPool : activePool;

  // Evita repetir autor em sequência, mas nunca repete conteúdo dentro do ciclo.
  const pick = rankedPool.find((candidate) => !recentAuthorNames.includes(candidate.author.author))
    || rankedPool[0];

  if (!pick) return authorsDbNormalized[0];
  const pickedKey = getStoryKey(pick.author);
  viewedStoryKeys.add(pickedKey);
  recentAuthorNames = [...recentAuthorNames.filter((name) => name !== pick.author.author), pick.author.author].slice(-4);
  generatedContentCount += 1;
  saveViewedStoryKeys();
  saveGeneratedContentCount();
  return {
    ...pick.author,
    _selectionScore: pick.score,
    _selectionReasons: pick.reasons,
    _emotionalState: state,
  };
}

const authorBookAliases = {
  'krishnamurti': 'jiddu krishnamurti',
  'buda sutta nipata': 'buda',
  'buda': 'buda',
  'lao tse': 'lao tse',
};

function normalizeAuthorName(name) {
  const normalized = normalizeTheme(name).replace(/_/g, ' ');
  return authorBookAliases[normalized] || normalized;
}

function getAdviceThemes(advice) {
  const normalizedAdvice = normalizeTheme(advice).replace(/_/g, ' ');
  return Array.from(new Set(normalizedAdvice.split(/\s+/).filter((word) => word.length >= 5)));
}

function scoreBookForStory(book, story) {
  let score = 0;
  const reasons = [];
  const storyAuthor = normalizeAuthorName(story.displayAuthor || story.author);
  const bookAuthor = normalizeAuthorName(book.author);
  const relatedAuthors = book.relatedAuthors.map(normalizeAuthorName);
  const sameAuthor = storyAuthor === bookAuthor;
  const authorRelation = sameAuthor || relatedAuthors.includes(storyAuthor);

  if (sameAuthor) {
    score += 12;
    reasons.push('mesmo autor');
  } else if (authorRelation) {
    score += 5;
    reasons.push('mesma tradição ou autoria relacionada');
  }

  const storyThemes = new Set([
    ...(story.rawTags || []),
    ...(story.selectedThemes || []),
    ...(story.temas || []),
  ].map(normalizeTheme));
  const commonThemes = book.themes.filter((theme) => storyThemes.has(theme));
  score += commonThemes.length * 3;
  if (commonThemes.length) reasons.push(`${commonThemes.length} tema${commonThemes.length > 1 ? 's' : ''} em comum`);

  const feelings = story.selectedFeelingIds || [];
  const primaryFeeling = feelings[0];
  if (primaryFeeling && book.feelings.includes(primaryFeeling)) {
    score += 2;
    reasons.push('sentimento principal');
  }
  const secondaryMatches = feelings.slice(1).filter((feeling) => book.feelings.includes(feeling));
  score += secondaryMatches.length;

  if (book.intensities.includes(currentIntensity)) {
    score += 2;
    reasons.push('intensidade emocional');
  }

  const depthDifference = Math.abs((story.profundidade || 3) - book.depth);
  if (depthDifference === 0) score += 2;
  else if (depthDifference === 1) score += 1;

  const adviceWords = new Set(getAdviceThemes(story.advice || story.conselho || ''));
  const subjectMatches = book.subjects.filter((subject) => {
    const words = normalizeTheme(subject).replace(/_/g, ' ').split(/\s+/);
    return words.some((word) => adviceWords.has(word));
  });
  score += Math.min(3, subjectMatches.length);
  if (subjectMatches.length) reasons.push('continua o conselho apresentado');

  if (story.curatedBook && normalizeTheme(story.curatedBook) === normalizeTheme(book.title)) {
    score += 4;
    reasons.push('obra ligada diretamente à reflexão');
  }

  const hasDirectRelation = authorRelation || commonThemes.length > 0 || (primaryFeeling && book.feelings.includes(primaryFeeling));
  if (!hasDirectRelation) score -= 5;

  score += Math.max(-2, Math.min(2, preferenceProfile.books[book.title] || 0));

  return { book, score, reasons, sameAuthor, commonThemes };
}

function recommendBookForStory(story) {
  const ranked = normalizedBookCatalog
    .map((book) => scoreBookForStory(book, story))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (Number(b.sameAuthor) !== Number(a.sameAuthor)) return Number(b.sameAuthor) - Number(a.sameAuthor);
      const depthA = Math.abs((story.profundidade || 3) - a.book.depth);
      const depthB = Math.abs((story.profundidade || 3) - b.book.depth);
      if (depthA !== depthB) return depthA - depthB;
      return a.book.title.localeCompare(b.book.title);
    });
  return ranked[0] || { book: normalizedBookCatalog[0], score: 0, reasons: [] };
}

function updateBookRecommendation(story) {
  const recommendation = recommendBookForStory(story);
  const { book, score, reasons, commonThemes = [] } = recommendation;
  story.book = book;
  story.livro = book.title;
  story.bookCompatibilityScore = score;
  story.bookSelectionReasons = reasons;

  bookTextEl.textContent = `${book.title}, de ${book.author}`;
  const authorContext = recommendation.sameAuthor
    ? `A reflexão segue o pensamento de ${story.displayAuthor || story.author}, e esta obra aprofunda essa mesma perspectiva.`
    : `Esta obra dialoga diretamente com o estado emocional e o tema da reflexão.`;
  const themeContext = commonThemes.length
    ? ` Ela desenvolve especialmente ${commonThemes.slice(0, 3).map((theme) => theme.replace(/_/g, ' ')).join(', ')}.`
    : ` Ela amplia o assunto predominante e oferece continuidade ao conselho apresentado.`;
  bookReasonEl.textContent = `${authorContext}${themeContext}`;
}

const quoteExplanationRules = [
  { terms: ['verdade', 'mente'], meaning: 'A verdade aqui não é tratada como um prêmio externo, mas como algo que aparece quando você reconhece com honestidade o funcionamento da própria mente.' },
  { terms: ['medo', 'fugir'], meaning: 'O medo perde parte do domínio quando é observado sem fuga. Encará-lo não significa obedecê-lo, e sim compreendê-lo antes de decidir.' },
  { terms: ['julgamento'], meaning: 'Olhar sem julgamento permite perceber o sentimento antes de classificá-lo como fraqueza ou erro; essa compreensão abre espaço para uma mudança real.' },
  { terms: ['lutar', 'sente'], meaning: 'Combater um sentimento costuma aumentar sua força. A frase sugere reconhecê-lo primeiro, para então responder com mais clareza.' },
  { terms: ['silêncio', 'vazio'], meaning: 'Silêncio não é ausência: é o espaço em que as defesas diminuem e aquilo que estava encoberto pode finalmente ser percebido.' },
  { terms: ['controlar a si'], meaning: 'Compreender as causas de uma reação transforma mais profundamente do que apenas reprimi-la ou tentar controlá-la pela força.' },
  { terms: ['conhecimento', 'coração'], meaning: 'Saber alguma coisa intelectualmente não basta; o conhecimento só ganha valor quando muda a maneira de sentir, escolher e agir.' },
  { terms: ['beleza', 'essencial'], meaning: 'A beleza é apresentada como educação da sensibilidade: ela nos ajuda a distinguir o que possui valor profundo do que apenas chama atenção.' },
  { terms: ['conhece-te'], meaning: 'A frase convida ao autoconhecimento. Entender desejos, limites e contradições torna suas escolhas menos automáticas e mais conscientes.' },
  { terms: ['vida sem exame'], meaning: 'Examinar a própria vida é questionar hábitos e motivos. Sem essa pausa, podemos repetir caminhos que nunca escolhemos de verdade.' },
  { terms: ['pergunta certa'], meaning: 'Uma boa pergunta não encerra o assunto depressa; ela organiza o pensamento e permite encontrar uma resposta mais honesta.' },
  { terms: ['não sabemos'], meaning: 'Reconhecer os limites do próprio saber não é fraqueza. É a abertura necessária para aprender e corrigir a direção.' },
  { terms: ['controlar o mundo'], meaning: 'Nem tudo está sob seu controle, mas sua resposta ainda pode ser escolhida. A frase desloca a energia do impossível para a atitude possível.' },
  { terms: ['depende de você'], meaning: 'Serenidade começa ao separar aquilo em que você pode agir daquilo que pertence às decisões alheias, ao acaso ou ao tempo.' },
  { terms: ['obstáculo'], meaning: 'A dificuldade pode se tornar matéria de crescimento: é diante dela que paciência, coragem e disciplina deixam de ser apenas ideias.' },
  { terms: ['presente'], meaning: 'O presente é o único momento em que uma ação pode realmente acontecer. Voltar a ele reduz o peso de antecipações e lembranças.' },
  { terms: ['ideias que fazemos'], meaning: 'O acontecimento e a interpretação sobre ele não são a mesma coisa. Rever essa interpretação pode diminuir um sofrimento desnecessário.' },
  { terms: ['impulso'], meaning: 'Liberdade não é fazer tudo o que surge imediatamente, mas criar um intervalo entre o impulso e a escolha.' },
  { terms: ['não escolhemos'], meaning: 'A dignidade não depende de controlar tudo o que acontece, mas de escolher uma resposta coerente diante do que não foi escolhido.' },
  { terms: ['dor', 'criação'], meaning: 'A frase não glorifica a dor; ela propõe transformá-la em aprendizado, expressão ou ação, impedindo que o sofrimento seja apenas destrutivo.' },
  { terms: ['sim profundo'], meaning: 'Um propósito verdadeiro ajuda a atravessar recusas e dificuldades, porque a direção interior se torna maior do que os obstáculos momentâneos.' },
  { terms: ['torne-se'], meaning: 'Tornar-se quem você é exige descobrir valores próprios e expressá-los gradualmente nas escolhas do cotidiano.' },
  { terms: ['olhando-se para trás'], meaning: 'O passado ajuda a compreender como você chegou até aqui, mas a vida continua exigindo decisões voltadas ao que ainda pode ser vivido.' },
  { terms: ['saudade'], meaning: 'A saudade é descrita como uma presença interior: algo ou alguém está distante, mas continua ocupando um lugar afetivo em você.' },
  { terms: ['sofrimento', 'retorno'], meaning: 'Em certo ponto, a dor pode conduzir de volta ao que é essencial, revelando necessidades, vínculos e partes de si que estavam esquecidas.' },
  { terms: ['porquê'], meaning: 'Ter uma razão significativa para continuar não elimina a dificuldade, mas oferece direção e força para suportar o caminho.' },
  { terms: ['escolher uma atitude'], meaning: 'Mesmo quando as circunstâncias não podem ser mudadas, ainda existe liberdade na maneira de se posicionar diante delas.' },
  { terms: ['sentido', 'dor'], meaning: 'Encontrar sentido não apaga o sofrimento; muda a relação com ele, colocando-o dentro de uma história que ainda pode seguir adiante.' },
  { terms: ['ferida', 'luz'], meaning: 'Uma ferida também pode revelar o que precisa de cuidado. Ao ser reconhecida, ela deixa de ser apenas dor e pode produzir compreensão.' },
  { terms: ['imaginação', 'realidade'], meaning: 'A mente frequentemente sofre por cenários que ainda não aconteceram. A frase convida a conferir o que é fato antes de alimentar a antecipação.' },
  { terms: ['tempo', 'desperdiçamos'], meaning: 'O problema nem sempre é a falta de tempo, mas a forma distraída ou automática com que ele é utilizado.' },
  { terms: ['água', 'endurece'], meaning: 'A água representa flexibilidade: adaptar-se sem perder a direção pode vencer resistências que a força rígida não consegue atravessar.' },
  { terms: ['pequenos gestos'], meaning: 'A direção de uma vida é construída menos por grandes declarações e mais pela repetição cuidadosa de pequenas atitudes.' },
  { terms: ['repetidamente'], meaning: 'Hábitos repetidos formam o caráter. A frase lembra que identidade também é aquilo que você pratica todos os dias.' },
  { terms: ['meio justo'], meaning: 'Virtude é buscar equilíbrio entre extremos, escolhendo uma medida adequada à situação em vez de agir por excesso ou omissão.' },
  { terms: ['vertigem da liberdade'], meaning: 'A ansiedade surge diante das possibilidades e da responsabilidade de escolher. A vertigem é o desconforto de perceber que mais de um caminho é possível.' },
  { terms: ['fé', 'certeza'], meaning: 'A fé aparece como confiança quando já não existem garantias suficientes; não elimina a dúvida, mas permite caminhar com ela.' },
  { terms: ['atenção'], meaning: 'Oferecer atenção verdadeira é suspender a pressa e o interesse próprio para acolher com dignidade aquilo que está diante de você.' },
  { terms: ['espectadores'], meaning: 'Responsabilidade começa quando deixamos apenas de observar e reconhecemos que nossas escolhas também interferem no mundo.' },
  { terms: ['compaixão'], meaning: 'Compaixão é reconhecer o sofrimento sem reduzir a pessoa à sua dor. Ela torna a lucidez mais humana e menos solitária.' },
  { terms: ['resultado'], meaning: 'Você pode cuidar da qualidade da ação, mas não controlar todas as consequências. Desapegar do resultado preserva a paz sem abandonar a responsabilidade.' },
  { terms: ['reação pertence'], meaning: 'Seu dever está na integridade do próprio gesto; a reação de outra pessoa pertence à liberdade e à história dela.' },
  { terms: ['raiva'], meaning: 'A raiva pode sinalizar um limite ferido. Observá-la antes de agir ajuda a transformar energia reativa em proteção consciente.' },
  { terms: ['tempo é limitado'], meaning: 'Como o tempo é finito, viver apenas segundo expectativas alheias significa abandonar escolhas que poderiam expressar quem você realmente é.' },
  { terms: ['foco'], meaning: 'Foco também é recusa: proteger sua energia exige dizer não ao que distrai ou afasta você daquilo que considera importante.' },
  { terms: ['dignidade'], meaning: 'Dignidade é preservar o próprio valor sem depender de aprovação, gratidão ou respeito concedido por outra pessoa.' },
  { terms: ['perdoar'], meaning: 'Perdoar pode encerrar o peso do ressentimento sem obrigar você a restaurar a mesma intimidade ou ignorar os limites necessários.' },
  { terms: ['ingratid'], meaning: 'A ingratidão revela o modo de agir de quem a pratica. Percebê-la pode esclarecer uma relação sem exigir que você permaneça preso à mágoa.' },
  { terms: ['multidões', 'mim'], meaning: 'A identidade possui partes diferentes e até contraditórias. Conhecer-se é reconhecer essa pluralidade e escolher conscientemente qual lado conduzirá suas ações.' },
];

function buildQuoteExplanation(author, selectedFeelingLabels) {
  const normalizedQuote = normalizeTheme(author.quote).replace(/_/g, ' ');
  const rule = quoteExplanationRules.find(({ terms }) => terms.every((term) => normalizedQuote.includes(normalizeTheme(term).replace(/_/g, ' '))));
  const meaning = rule?.meaning || `A frase usa a imagem de “${author.quote.split(/[.;:!?]/)[0].toLowerCase()}” para convidar você a observar sua experiência com mais consciência, antes de reagir automaticamente.`;
  const feelingContext = selectedFeelingLabels.length
    ? ` Diante de ${selectedFeelingLabels.join(', ').toLowerCase()}, isso significa criar uma pausa e perceber qual escolha respeita melhor o que você está vivendo.`
    : '';
  return `${meaning}${feelingContext}`;
}

function buildReflectionFromAuthor(author, selectedThemes, selectedFeelingLabels) {
  // As templates pedem os sentimentos (labels) do usuário.
  const feelingsLabels = selectedFeelingLabels;

  // Conselho curto: 3 linhas.
  const reflection = author.curatedExplanation || buildQuoteExplanation(author, feelingsLabels);
  const advice = author.curatedAdvice || author.adviceTemplate(feelingsLabels);

  const rawTags = Array.from(new Set([
    ...author._tagsN,
    ...selectedThemes,
  ]));
  const tags = rawTags.map((t) => t.replace(/_/g, ' '));
  return {
    key: getStoryKey(author),
    quote: author.quote,
    author: author.author,
    contentType: author.contentType || 'quote',
    displayAuthor: author.displayAuthor || author.author,
    quoteType: author.quoteType || 'inspired',
    source: author.source || '',
    curatedBook: author.curatedBook || '',
    philosophy: author.philosophy || thinkerProfiles[author.displayAuthor] || thinkerProfiles[author.author] || 'Este pensador convida você a transformar sentimentos em perguntas e escolhas mais conscientes.',
    reflection,
    advice,
    sentimentos: author.sentimentos,
    intensidade: author.intensidade,
    temas: author.temas,
    tom: author.tom,
    profundidade: author.profundidade,
    conselho: advice,
    explicacao: reflection,
    livro: '',
    compatibilityScore: author._selectionScore ?? 0,
    selectionReasons: author._selectionReasons || [],
    emotionalState: author._emotionalState || interpretEmotionalState(),
    rawTags,
    selectedThemes,
    selectedFeelingIds: getSelectedFeelingIds(),
    book: null,
    tags: [currentIntensity, author.tom, ...tags].slice(0, 8).map((x) => prettifyTag(x)),
  };
}

function prettifyTag(s) {
  return String(s)
    .replace(/_/g, ' ')
    .trim();
}

function getSelectedFeelingLabels() {
  return feelingsCatalog.filter((f) => selectedFeelingIds.has(f.id)).map((f) => f.label);
}

function ensureSelectionMin() {
  // A especificação diz “seleciona um ou mais”.
  // Mantemos o mínimo de 1 para permitir.
  return selectedFeelingIds.size >= 1;
}

function renderStory(story) {
  currentStory = story;
  quoteTextEl.classList.remove('invitation');
  likeBtn.disabled = false;
  dislikeBtn.disabled = false;
  favoriteBtn.disabled = false;
  const isLongText = story.contentType === 'text';
  quoteTextEl.textContent = isLongText ? story.quote : `“${story.quote}”`;
  quoteTextEl.classList.toggle('long-quote', story.quote.length > 180);
  explanationTitleEl.textContent = isLongText
    ? 'O QUE ESTE TEXTO QUER DIZER'
    : 'O QUE ESSA FRASE QUER DIZER';
  const isExactQuote = story.quoteType === 'exact';
  const displayAuthor = story.displayAuthor || story.author;
  story.attribution = story.author === 'Reflexão contemporânea'
    ? 'Reflexão contemporânea'
    : isExactQuote
      ? displayAuthor
      : `Ideia inspirada em ${displayAuthor}`;
  quoteAuthorEl.textContent = `— ${story.attribution}${story.source ? ` · ${story.source}` : ''}`;
  reflectionTextEl.textContent = story.reflection;
  philosophyTextEl.textContent = story.philosophy;
  adviceTextEl.textContent = story.advice;
  updateBookRecommendation(story);

  tagsRowEl.innerHTML = '';
  story.tags.forEach((t) => {
    const el = document.createElement('div');
    el.className = 'tag';
    el.textContent = t;
    tagsRowEl.appendChild(el);
  });

  currentShareText = `${story.quote}\n— ${story.attribution}${story.source ? ` · ${story.source}` : ''}`;
  updateFeedbackButtons();
  preferenceNoteEl.textContent = '';
  updateFavoriteUi();
  updateShareCardPreview();
}

function generateReflection({ keepHistory = true } = {}) {
  if (!ensureSelectionMin()) {
    reflectionTextEl.textContent = 'Selecione pelo menos 1 sentimento.';
    showSelectionHint();
    return false;
  }

  const selectedThemes = getSelectedThemes();
  const selectedFeelingLabels = getSelectedFeelingLabels();

  const best = pickBestAuthorByThemes(selectedThemes);
  const story = buildReflectionFromAuthor(best, selectedThemes, selectedFeelingLabels);

  if (!keepHistory) {
    history = [];
    historyIndex = -1;
  }

  // Guardar histórico
  if (keepHistory) {
    // evitar duplicata consecutiva
    const last = history[historyIndex];
    if (!last || last.quote !== story.quote || last.author !== story.author) {
      history = history.slice(0, historyIndex + 1);
      history.push(story);
      historyIndex = history.length - 1;
    }
  } else {
    history = [story];
    historyIndex = 0;
  }

  renderStory(history[historyIndex]);
  return true;
}

function goBack() {
  if (historyIndex <= 0) return;
  historyIndex -= 1;
  renderStory(history[historyIndex]);
}

function newPhrase() {
  if (!ensureSelectionMin()) {
    reflectionTextEl.textContent = 'Selecione pelo menos 1 sentimento.';
    showSelectionHint();
    return false;
  }

  const selectedThemes = getSelectedThemes();
  const selectedFeelingLabels = getSelectedFeelingLabels();

  const excludeAuthors = currentStory ? [currentStory.author] : [];
  const best = pickBestAuthorByThemes(selectedThemes, getSelectedFeelingIds(), { excludeAuthors });
  if (!best) return false;

  const story = buildReflectionFromAuthor(best, selectedThemes, selectedFeelingLabels);

  history = history.slice(0, historyIndex + 1);
  history.push(story);
  historyIndex = history.length - 1;
  renderStory(story);
  return true;
}

function playSoftBell() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const audioCtx = new AudioContext();
  const now = audioCtx.currentTime;
  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.18, now + 0.018);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);
  master.connect(audioCtx.destination);

  [
    { freq: 660, gain: 0.55, decay: 1.2 },
    { freq: 990, gain: 0.28, decay: 0.9 },
    { freq: 1320, gain: 0.12, decay: 0.6 },
  ].forEach(({ freq, gain, decay }) => {
    const osc = audioCtx.createOscillator();
    const toneGain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    toneGain.gain.setValueAtTime(gain, now);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(toneGain);
    toneGain.connect(master);
    osc.start(now);
    osc.stop(now + decay + 0.04);
  });

  window.setTimeout(() => audioCtx.close(), 1500);
}

// =========================
// Compartilhamento como imagem
// =========================

function getSharePayload() {
  if (currentStory) {
    return {
      quote: currentStory.quote,
      attribution: currentStory.attribution || currentStory.displayAuthor || currentStory.author,
      source: currentStory.source || '',
    };
  }

  return {
    quote: quoteTextEl.textContent.replace(/[“”]/g, '').trim() || 'A sabedoria começa quando prestamos atenção ao momento presente.',
    attribution: quoteAuthorEl.textContent.replace(/^—\s*/, '').trim() || 'Entre Sábios',
    source: '',
  };
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function wrapCanvasText(ctx, text, maxWidth) {
  const words = String(text).replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth || !currentLine) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawLeaf(ctx, x, y, size, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.55, -size * 0.5, size * 1.15, -size * 0.2, size * 1.45, 0);
  ctx.bezierCurveTo(size * 1.08, size * 0.28, size * 0.5, size * 0.48, 0, 0);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.035);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 1.25, 0);
  ctx.stroke();
  ctx.restore();
}

function drawBranch(ctx, x, y, scale, angle, theme, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(flip ? -scale : scale, scale);
  ctx.strokeStyle = theme.leafDark;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(24, -70, 56, -132, 98, -198);
  ctx.stroke();

  [
    [24, -46, 42, -0.95],
    [42, -88, 50, 0.28],
    [66, -128, 48, -0.84],
    [84, -170, 42, 0.18],
  ].forEach(([lx, ly, size, leafAngle]) => {
    drawLeaf(ctx, lx, ly, size, leafAngle, theme.leaf);
  });
  ctx.restore();
}

function drawShareIcon(ctx, x, y, size, theme) {
  ctx.save();
  ctx.strokeStyle = theme.muted;
  ctx.lineWidth = Math.max(2, size * 0.08);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.68;

  ctx.beginPath();
  ctx.rect(x, y + size * 0.34, size * 0.7, size * 0.58);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y + size * 0.58);
  ctx.lineTo(x + size * 0.35, y);
  ctx.moveTo(x + size * 0.14, y + size * 0.22);
  ctx.lineTo(x + size * 0.35, y);
  ctx.lineTo(x + size * 0.56, y + size * 0.22);
  ctx.stroke();

  ctx.restore();
}

function drawPaperNoise(ctx, width, height, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < 900; i++) {
    const shade = 210 + Math.floor(Math.random() * 40);
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade - 8})`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 1.2, 1.2);
  }
  ctx.restore();
}

function drawShareCard({ width = 1080, height = 1350 } = {}) {
  const payload = getSharePayload();
  const theme = shareCardThemes[currentShareStyle] || shareCardThemes.sage;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const scale = width / 1080;

  ctx.fillStyle = theme.page;
  ctx.fillRect(0, 0, width, height);

  const margin = 0;
  const cardX = margin;
  const cardY = margin;
  const cardW = width - margin * 2;
  const cardH = height - margin * 2;
  const radius = 0;

  ctx.save();
  ctx.shadowColor = 'rgba(42, 35, 26, 0.18)';
  ctx.shadowBlur = 34 * scale;
  ctx.shadowOffsetY = 18 * scale;
  roundedRectPath(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = theme.bottom;
  ctx.fill();
  ctx.restore();

  roundedRectPath(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.clip();

  const bg = ctx.createLinearGradient(0, cardY, width, cardY + cardH);
  bg.addColorStop(0, theme.top);
  bg.addColorStop(0.55, theme.glow);
  bg.addColorStop(1, theme.bottom);
  ctx.fillStyle = bg;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  const glow = ctx.createRadialGradient(width * 0.58, height * 0.26, 20 * scale, width * 0.58, height * 0.26, 460 * scale);
  glow.addColorStop(0, 'rgba(255,255,240,0.58)');
  glow.addColorStop(1, 'rgba(255,255,240,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  drawPaperNoise(ctx, width, height, 0.055);
  drawBranch(ctx, cardX + 60 * scale, cardY + 305 * scale, 1.18 * scale, -0.08, theme, false);
  drawBranch(ctx, cardX + 80 * scale, cardY + cardH - 70 * scale, 1.08 * scale, Math.PI + 0.16, theme, true);

  ctx.strokeStyle = theme.stroke;
  ctx.lineWidth = 2 * scale;
  roundedRectPath(ctx, cardX + 1 * scale, cardY + 1 * scale, cardW - 2 * scale, cardH - 2 * scale, radius);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.ink;

  const quote = `“${payload.quote.replace(/[“”]/g, '').trim()}”`;
  let quoteFont = 62 * scale;
  if (quote.length > 150) quoteFont = 48 * scale;
  else if (quote.length > 105) quoteFont = 54 * scale;

  ctx.font = `500 ${quoteFont}px Georgia, "Times New Roman", serif`;
  const quoteLines = wrapCanvasText(ctx, quote, cardW * 0.72);
  const lineHeight = quoteFont * 1.33;
  const quoteBlockH = quoteLines.length * lineHeight;
  const quoteStartY = height * 0.49 - quoteBlockH / 2 + lineHeight / 2;

  quoteLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, quoteStartY + index * lineHeight);
  });

  ctx.fillStyle = theme.muted;
  const author = `— ${payload.attribution}${payload.source ? ` · ${payload.source}` : ''}`;
  ctx.font = `400 ${Math.max(25 * scale, quoteFont * 0.38)}px Georgia, "Times New Roman", serif`;
  wrapCanvasText(ctx, author, cardW * 0.7).slice(0, 2).forEach((line, index) => {
    ctx.fillText(line, width / 2, quoteStartY + quoteBlockH + 74 * scale + index * 34 * scale);
  });

  ctx.font = `700 ${18 * scale}px Arial, sans-serif`;
  ctx.globalAlpha = 0.52;
  ctx.fillText('ENTRE SÁBIOS', width / 2, cardY + cardH - 80 * scale);
  ctx.globalAlpha = 1;

  drawShareIcon(ctx, cardX + cardW - 92 * scale, cardY + cardH - 110 * scale, 42 * scale, theme);

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.96);
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

async function createShareImage() {
  const imageCanvas = drawShareCard();
  const imageBlob = await canvasToBlob(imageCanvas);
  if (!imageBlob) throw new Error('Não foi possível gerar a imagem.');
  return {
    blob: imageBlob,
    file: new File([imageBlob], `entre-sabios-${currentShareStyle}.png`, { type: 'image/png' }),
    filename: `entre-sabios-${currentShareStyle}.png`,
  };
}

function setShareStatus(message = '') {
  if (shareStatusEl) shareStatusEl.textContent = message;
}

function buildShareTextWithLink() {
  const text = currentShareText || `${quoteTextEl.textContent}\n${quoteAuthorEl.textContent}`;
  const pageUrl = location.protocol === 'http:' || location.protocol === 'https:' ? location.origin + location.pathname : '';
  return pageUrl
    ? `${text}\n\nEntre Sábios\n${pageUrl}`
    : `${text}\n\nEntre Sábios`;
}

function updateShareStyleButtons() {
  shareStyleButtons.forEach((button) => {
    const active = button.dataset.shareStyle === currentShareStyle;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function updateShareCardPreview() {
  // A prévia foi removida para manter o painel de compartilhamento mais limpo.
}

// =========================
// Eventos
// =========================

generateBtn.addEventListener('click', () => {
  if (generateReflection({ keepHistory: true })) {
    playSoftBell();
    if (window.matchMedia('(max-width: 720px)').matches) {
      document.querySelector('.col-center')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

backBtn.addEventListener('click', goBack);
newBtn.addEventListener('click', () => {
  if (newPhrase()) playSoftBell();
});

likeBtn.addEventListener('click', () => setStoryFeedback(1));
dislikeBtn.addEventListener('click', () => setStoryFeedback(-1));
favoriteBtn.addEventListener('click', toggleFavorite);
favoritesBtn.addEventListener('click', () => {
  renderFavorites();
  if (typeof favoritesDialog.showModal === 'function') favoritesDialog.showModal();
  else favoritesDialog.setAttribute('open', '');
});
closeFavoritesBtn.addEventListener('click', () => favoritesDialog.close());
favoritesDialog.addEventListener('click', (event) => {
  if (event.target === favoritesDialog) favoritesDialog.close();
});
aboutBtn.addEventListener('click', () => {
  if (typeof aboutDialog.showModal === 'function') aboutDialog.showModal();
  else aboutDialog.setAttribute('open', '');
});
closeAboutBtn.addEventListener('click', () => aboutDialog.close());
aboutDialog.addEventListener('click', (event) => {
  if (event.target === aboutDialog) aboutDialog.close();
});

copyShareBtn.addEventListener('click', async () => {
  const text = currentShareText || `${quoteTextEl.textContent}\n${quoteAuthorEl.textContent}`;
  if (!text || !navigator.clipboard) return;
  await navigator.clipboard.writeText(text);
  setShareStatus('Mensagem copiada.');
});

shareStyleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentShareStyle = button.dataset.shareStyle || 'sage';
    updateShareStyleButtons();
    updateShareCardPreview();
    setShareStatus('');
  });
});

whatsShareBtn.addEventListener('click', async () => {
  whatsShareBtn.disabled = true;
  whatsShareBtn.textContent = 'Gerando...';

  try {
    const image = await createShareImage();

    if (navigator.share && navigator.canShare?.({ files: [image.file] })) {
      await navigator.share({
        title: 'Entre Sábios',
        files: [image.file],
      });
      setShareStatus('Imagem enviada para o compartilhamento do celular.');
      return;
    }

    downloadBlob(image.blob, image.filename);
    setShareStatus('Este navegador não envia imagem direto. Baixei a imagem para publicar no Status ou Stories.');
  } catch (error) {
    if (error?.name !== 'AbortError') setShareStatus('Não consegui compartilhar a imagem neste navegador.');
  } finally {
    whatsShareBtn.disabled = false;
    whatsShareBtn.textContent = 'Status / Stories';
  }
});

sendWithLinkBtn.addEventListener('click', async () => {
  sendWithLinkBtn.disabled = true;
  sendWithLinkBtn.textContent = 'Gerando...';

  try {
    const image = await createShareImage();
    const shareText = buildShareTextWithLink();

    if (navigator.share && navigator.canShare?.({ files: [image.file] })) {
      await navigator.share({
        title: 'Entre Sábios',
        text: shareText,
        files: [image.file],
      });
      setShareStatus('Imagem, frase e link enviados para o compartilhamento.');
      return;
    }

    if (navigator.share) {
      await navigator.share({
        title: 'Entre Sábios',
        text: shareText,
        url: location.protocol === 'http:' || location.protocol === 'https:' ? location.origin + location.pathname : undefined,
      });
      setShareStatus('Frase e link enviados. A imagem foi baixada para anexar se quiser.');
      downloadBlob(image.blob, image.filename);
      return;
    }

    downloadBlob(image.blob, image.filename);
    if (navigator.clipboard) await navigator.clipboard.writeText(shareText);
    setShareStatus('Imagem baixada e texto com link copiado.');
  } catch (error) {
    if (error?.name !== 'AbortError') setShareStatus('Não consegui enviar com link neste navegador.');
  } finally {
    sendWithLinkBtn.disabled = false;
    sendWithLinkBtn.textContent = '↗ Enviar com link';
  }
});

function makeTag(t) {
  const el = document.createElement('div');
  el.className = 'tag';
  el.textContent = t;
  return el;
}

// =========================
// Decor (imagem decorativa discreta no canvas central)
// =========================

function drawDecor() {
  const c = decorCanvas;
  const ctx = c.getContext('2d');
  const w = c.width;
  const h = c.height;

  ctx.clearRect(0, 0, w, h);

  // Fundo super sutil
  ctx.globalAlpha = 1;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(42,35,26,0.12)');
  grad.addColorStop(1, 'rgba(42,35,26,0.00)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // linhas orgânicas
  ctx.strokeStyle = 'rgba(42,35,26,0.18)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    const y = h * (0.35 + i * 0.08);
    ctx.moveTo(-30, y);
    for (let x = -10; x <= w + 20; x += 20) {
      const yy = y + Math.sin((x + i * 10) / 60) * (8 + i);
      ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
}

async function updateVisitorCount() {
  const namespace = 'caixa-de-sabedoria-phped';
  const counter = 'visitas';
  const sessionKey = 'caixaSabedoriaVisitCounted';
  const shouldIncrement = !sessionStorage.getItem(sessionKey);
  const action = shouldIncrement ? 'up' : '';
  const url = `https://api.counterapi.dev/v1/${namespace}/${counter}/${action}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Contador indisponível');
    const data = await response.json();
    const count = Number(data.count ?? data.value ?? data.data?.count);
    if (!Number.isFinite(count)) throw new Error('Resposta inválida');
    visitorCountEl.textContent = new Intl.NumberFormat('pt-BR').format(count);
    if (shouldIncrement) sessionStorage.setItem(sessionKey, '1');
  } catch {
    visitorCountEl.textContent = '—';
    visitorCountEl.title = 'Contador temporariamente indisponível';
  }
}

// =========================
// Bootstrap
// =========================

(function init() {
  initFeelings();
  initIntensity();
  initDailyQuote();
  drawDecor();
  updateVisitorCount();

  // Placeholder de conteúdo
  reflectionTextEl.textContent = 'Selecione seus sentimentos, escolha a intensidade e clique em “ENCONTRAR UMA REFLEXÃO”.';
  philosophyTextEl.textContent = 'A cada reflexão, você conhecerá uma ideia do autor escolhido.';
  adviceTextEl.textContent = '—';
  bookTextEl.textContent = '—';
  bookReasonEl.textContent = 'A recomendação aparecerá junto da reflexão.';
  updateFeedbackButtons();
  updateFavoriteUi();
  updateShareStyleButtons();
  updateShareCardPreview();

})();

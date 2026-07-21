# Documentação mestre — Entre Sábios

> Estado documentado em 16 de julho de 2026, com base no código presente em `public_html_pronto`, na regressão automatizada de 249 testes e na validação em navegador real já registrada.
> Este documento descreve o comportamento efetivamente implementado. Ideias planejadas são identificadas como futuras ou como limitações, e não como funcionalidades existentes.
> Para saber o estado de cada funcionalidade e as decisões que não devem ser reimplementadas, consulte `PROJECT_STATUS.md` e `DECISIONS.md`.

## 1. Propósito e identidade

Entre Sábios é uma experiência editorial e contemplativa que aproxima sentimentos atuais de frases, microtextos, reflexões, autores, livros e contos filosóficos. A proposta da página inicial não é oferecer diagnóstico, tratamento ou resposta definitiva, mas criar uma pausa de leitura orientada pelo estado emocional declarado pela própria pessoa.

A identidade visual e verbal é minimalista, silenciosa e humana. A interface usa cores naturais, tipografia de leitura, movimentos discretos e linguagem que procura acolher sem infantilizar. O modo claro, chamado **Luz do Dia**, é o padrão. O modo escuro, chamado **Floresta Noturna**, é opcional e persistido no navegador.

O acervo publicado combina conteúdo original do Entre Sábios, ideias inspiradas em pensadores, traduções editoriais, citações e material tradicional. A classificação editorial armazenada no acervo determina como cada item deve ser apresentado e atribuído.

## 2. Experiência principal do usuário

O fluxo atual da página inicial é:

1. A pessoa escolhe um ou mais sentimentos.
2. O primeiro sentimento selecionado torna-se o sentimento principal; outro sentimento selecionado pode ser promovido manualmente a principal.
3. A pessoa escolhe uma intensidade: fraca, moderada ou intensa.
4. Ao acionar **Encontrar uma reflexão**, o sistema consulta o acervo runtime e escolhe um conteúdo elegível.
5. A interface apresenta o texto principal, a autoria exibida, uma explicação editorial, um conselho, uma indicação de livro e etiquetas temáticas.
6. A pessoa pode gostar, não gostar, favoritar, voltar no histórico da sessão, pedir outra frase, gerar uma imagem para compartilhar ou abrir um conto relacionado.

No smartphone, depois da geração, a coluna da reflexão é trazida para a área visível. A página também contém uma frase do dia, calculada localmente pela data, e elementos decorativos discretos.

Os 14 sentimentos são montados a partir do catálogo local antes da validação do acervo runtime. O mesmo runtime é entregue como JavaScript incorporável, permitindo que a seleção e a geração funcionem tanto no servidor quanto ao abrir `index.html` diretamente no navegador.

## 3. Páginas e seções

### 3.1 Página inicial

O arquivo `index.html` reúne:

- cabeçalho com marca, contador de presença, alternância de tema, acesso às favoritas e seção Sobre;
- seletor de sentimentos;
- seletor de intensidade;
- botão de geração;
- área central com frase ou texto, autoria e ações de feedback;
- explicação da reflexão;
- conselho;
- recomendação de livro;
- etiquetas editoriais;
- painel de compartilhamento;
- entrada para contos filosóficos;
- diálogos de favoritas, Sobre e leitura de contos.

O contador utiliza Firebase Realtime Database. Cada sessão conectada cria uma presença temporária; `onDisconnect` remove o registro e a contagem exibida corresponde à quantidade de chaves presentes. Se a integração falhar, a experiência editorial principal continua disponível.

### 3.2 Contos

Existem 33 páginas públicas em `contos/<slug>/index.html`. A página inicial também oferece os contos dentro de um diálogo, com seleção relacionada ao estado emocional atual.

### 3.3 Ensaios

`ensaios/index.html` funciona como índice. Existem 12 páginas de ensaio em `ensaios/<slug>/index.html`, acompanhadas por ilustrações SVG em `assets/ensaios/`.

### 3.4 Pensadores

Existem 16 páginas públicas em `pensadores/<slug>/index.html`.

### 3.5 Sentimentos

Existem 14 páginas públicas em `sentimentos/<slug>/index.html`, correspondentes ao catálogo selecionável do runtime.

## 4. Estrutura de arquivos

### 4.1 Entrada e apresentação

- `index.html`: estrutura da página inicial, metadados, dados estruturados, integração de presença e ordem de carregamento dos scripts.
- `style.css`: agregador e regras visuais ainda mantidas no arquivo principal.
- `css/base.css`: fundamentos visuais e variáveis.
- `css/layout.css`: estrutura de colunas e distribuição da página.
- `css/components.css`: componentes da interface.
- `css/modals.css`: diálogos, favoritas e contos.
- `css/responsive.css`: comportamento em telas menores.
- `css/tablet.css`: ajustes específicos para tablets.
- `css/landscape-scroll-fix.css`: correções de rolagem em smartphone horizontal.
- `seo.css`: estilo compartilhado pelas páginas internas.

### 4.2 Orquestração JavaScript

- `script.js`: estado global da interface, referências ao DOM, inicialização, histórico da sessão e ligação dos eventos.
- `js/core/runtime-loader.js`: carrega e valida o acervo runtime.
- `js/core/runtime-engine.js`: filtra, ordena e rotaciona os conteúdos elegíveis.
- `js/core/emotional-state.js`: transforma as escolhas da interface em estado emocional normalizado.
- `js/core/emotional-synthesis.js`: resolve o perfil direcional aplicável sem selecionar conteúdos.
- `js/core/synthesis-ranking-adapter.js`: traduz a síntese em sinais limitados para o ranking.
- `js/core/motivation-ranking-adapter.js`: aplica a direção motivacional opcional sem alterar elegibilidade.
- `js/core/matching.js`: conecta o estado emocional ao seletor runtime.
- `js/core/book-matching.js`: seleciona a recomendação de livro.
- `js/core/normalization.js`: normaliza temas e nomes.
- `js/core/content-normalizer.js`: contém normalizadores do acervo anterior; não participa do fluxo runtime principal carregado por `index.html`.

### 4.3 Dados

- `entre_sabios_acervo_mestre_final.json`: acervo-mestre editorial.
- `data/entre_sabios_runtime.json`: projeção JSON reproduzível do acervo ativo.
- `data/entre_sabios_runtime.js`: projeção equivalente carregável pelo navegador, inclusive sob protocolo `file:`.
- `js/data/emotional-taxonomy.js`: famílias e temas emocionais usados para interpretar o estado.
- `js/data/emotional-syntheses.js`: catálogo canônico de sínteses primárias, direcionais e fallbacks.
- `js/data/motivation-profiles.js`: catálogo canônico da direção opcional de motivação.
- `js/data/catalogs.js`: perfis de intensidade, combinações, autores e metadados auxiliares.
- `js/data/books.js`: catálogo de livros.
- `js/data/tales.js`: catálogo de contos usado pelo diálogo da página inicial.
- `js/data/share-themes.js`: três temas visuais da imagem compartilhável.
- `js/data/matching-rules.js`: regras antigas de trajetória e explicação; o arquivo não é carregado atualmente por `index.html`.
- `js/data/quotes/`, `js/data/authors.js`, `js/data/perspectives.js` e arquivos correlatos: bases legadas ou editoriais que não são carregadas no fluxo runtime atual da página inicial.

### 4.4 Funcionalidades e interface

- `js/features/feedback.js`: gostei, não gostei e preferências locais.
- `js/features/favorites.js`: persistência e diálogo de favoritas.
- `js/features/sharing.js`: desenho da imagem, criação do PNG, Web Share e download.
- `js/features/tales.js`: pontuação, rotação, renderização e diálogo dos contos.
- `js/ui/feelings-ui.js`: sentimentos, foco principal e intensidade.
- `js/ui/reflection-ui.js`: renderização da reflexão e recomendação.
- `js/ui/daily-ui.js`: frase diária.
- `js/ui/theme-ui.js`: tema claro/escuro.
- `js/ui/effects-ui.js`: efeitos visuais e sonoros discretos.

### 4.5 Construção, testes e SEO

- `scripts/build-content.mjs` e `scripts/content-build-lib.mjs`: geram e validam o runtime a partir do acervo-mestre.
- `scripts/serve.mjs`: servidor local.
- `tests/content-runtime.test.mjs`: integridade editorial e estrutural do runtime.
- `tests/runtime-selection.test.mjs`: hierarquia e cenários do seletor.
- `tests/behavioral-selection.test.mjs`: prioridade principal, combinações secundárias, luto, efeito, trajetória, cadência, diversidade e persistência.
- `tests/interface-wiring.test.mjs`: carregamento dos dados e salvaguardas de interface/responsividade.
- `tests/seo.test.mjs`: metadados, breadcrumbs, sitemap e referências internas.
- `tests/tale-image.test.mjs`: limites e integração da imagem-piloto dos contos.
- `scripts/audit-repetition.mjs`: simulação de rotação entre sentimentos e intensidades.
- `scripts/audit-behavior.mjs`: baseline e métricas reproduzíveis de 100 gerações por sentimento.
- `scripts/generate-behavioral-report.mjs`: consolida ciclos, regressões, notas e pendências no relatório final.
- `scripts/update-seo.mjs`: manutenção reproduzível dos metadados e breadcrumbs das páginas públicas.
- `sitemap.xml`: URLs públicas declaradas ao buscador.
- `robots.txt`: permissão de rastreamento e referência ao sitemap.
- `PADRAO_EDITORIAL_ENTRE_SABIOS.md`: estrutura provisória da curadoria futura, sem definição editorial congelada.
- `auditoria_comportamental_entre_sabios.json`: relatório final reproduzível da auditoria comportamental.

### 4.6 Fontes canônicas e classificação de arquivos

Uma informação importante deve possuir uma fonte canônica identificável. No estado atual:

| Domínio | Fonte canônica | Derivados ou consumidores |
| --- | --- | --- |
| Conteúdo, autoria e associações publicadas | `entre_sabios_acervo_mestre_final.json` | `data/entre_sabios_runtime.*` e seletores |
| Runtime | gerado por `scripts/content-build-lib.mjs` | loader e navegador; nunca editar manualmente |
| Estado emocional selecionado | variáveis de estado em `script.js` | projeção normalizada de `js/core/emotional-state.js` |
| Sínteses | `js/data/emotional-syntheses.js` | resolvedor, adaptador, interface e testes |
| Motivação | `js/data/motivation-profiles.js` | adaptador, interface e testes |
| Antirrepetição, filas e histórico decisório | `js/core/runtime-engine.js` | `matching.js` apenas orquestra a escolha |
| Livros | `js/data/books.js` | enriquecimento em `script.js` e `book-matching.js` |
| Explicações específicas | `js/data/editorial-explanations.js` | lookup por ID e texto final |
| Orientações específicas | `js/data/editorial-guidance.js` | lookup por ID, texto e contexto |
| Temas visuais de compartilhamento | `js/data/share-themes.js` | `sharing.js` e interface |
| Contos do diálogo | `js/data/tales.js` | `js/features/tales.js`; a relação com páginas SEO ainda precisa ser formalizada |

Classificações obrigatórias:

- **fonte canônica**: pode ser editada manualmente conforme as regras do domínio;
- **derivado**: deve ser gerado e não editado diretamente;
- **ativo**: carregado por `index.html` ou utilizado por build/testes vigentes;
- **legado**: preservado apenas para histórico ou migração; não recebe recursos novos;
- **paralelo**: versão em avaliação, como arquivos `-PEDRO`; não é carregado sem autorização;
- **relatório histórico**: evidência de uma tarefa, não definição automática do comportamento atual.

O catálogo de bootstrap repete os sentimentos para que a interface possa ser montada antes do runtime, mas seus IDs e rótulos são obrigatoriamente equivalentes aos do mestre por `tests/canonical-contracts.test.mjs`. Versões ainda aparecem no build, loader e HTML, porém o mesmo contrato impede divergência entre esses pontos. A segurança editorial continua composta por exclusões do mestre, taxonomia e invariantes do motor; essa área não deve ser centralizada sem teste de regressão específico.

## 5. Acervo runtime

O navegador usa primeiro `data/entre_sabios_runtime.js`, gerado automaticamente a partir do mesmo mestre e equivalente ao JSON. Se a projeção incorporada não estiver presente, o carregador tenta `data/entre_sabios_runtime.json` com cache desativado. Em ambos os caminhos, o conteúdo é rejeitado se não respeitar estes contratos atuais:

- `schemaVersion` igual a `1.1.0`;
- `contentVersion` igual a `definitiva-2.1`;
- exatamente 283 conteúdos ativos;
- exatamente 14 sentimentos;
- ausência de `coragem` como sentimento selecionável.

O resumo congelado do runtime contém 64 itens de núcleo, 151 contextuais e 68 gerais. Vinte itens ativos estão marcados como referência pendente. Os conteúdos publicáveis possuem identificação, texto final, tipo de exibição, tipo de atribuição, autoria, associações emocionais, posição editorial, funções, intensidades adequadas, tom, temas, exclusões, estado de publicação e filtro de gênero.

## 6. Sentimentos e intensidades

Os 14 sentimentos selecionáveis são:

- ansiedade;
- medo;
- amor;
- saudade;
- esperança;
- solidão;
- autoconhecimento;
- confusão;
- insegurança;
- raiva;
- culpa;
- luto;
- tristeza;
- falta de propósito.

É necessário escolher pelo menos um. O sentimento principal tem prioridade na seleção; os demais são secundários. Trocar sentimentos, foco principal ou intensidade recalcula o contexto, mas não apaga o histórico recente global nem libera conteúdos recém-exibidos.

As intensidades são `fraca`, `moderada` e `intensa`. Cada conteúdo declara explicitamente em quais intensidades pode aparecer. O estado intenso também gera sinais de contexto específicos para ansiedade, medo, raiva, tristeza e luto. Esses sinais podem bloquear conteúdos por meio de `hardExclusions`.

A taxonomia emocional também produz:

- temas raiz do sentimento principal, organizados por famílias;
- temas derivados dos sentimentos secundários;
- temas de combinações reconhecidas;
- temas e tons adequados ao perfil de intensidade.

### 6.1 Contrato da analogia das cores

O contrato técnico mantém responsabilidades separadas: o sentimento principal é a cor dominante e define o território; até dois secundários refinam essa direção; a intensidade regula profundidade e segurança; a síntese interpreta somente combinações existentes; e a motivação permanece uma direção opcional, nunca uma nova emoção.

Os 29 pares direcionais e a única tríade já aprovados possuem um `relationType` interno. Os valores permitidos são `reinforcement`, `tension`, `ambivalence`, `masking`, `transition` e `context`. A classificação não aparece ao usuário e não é inferida a partir de `humanSummary` ou `editorialRationale`. O adaptador consulta apenas sinais estruturados de tema, função editorial e tom, sempre depois da elegibilidade, do sentimento principal, da intensidade e da segurança. Combinações sem perfil específico usam `context` como fallback cauteloso; nenhum novo par ou tríade é criado automaticamente.

No seletor runtime atual, a elegibilidade é decidida principalmente pelas associações, posição editorial, intensidade e exclusões. Os temas calculados enriquecem a história renderizada e ajudam na escolha de livros e contos, mas não substituem a hierarquia de associações do runtime.

## 7. Seleção e hierarquia das reflexões

O sistema atual não escolhe uma frase por pontuação numérica acumulada. Ele usa uma ordenação lexicográfica e determinística, nesta hierarquia:

1. associação de núcleo com o sentimento principal;
2. associação contextual com o sentimento principal;
3. associação de núcleo com um sentimento secundário;
4. associação contextual com um sentimento secundário;
5. conteúdo geral de fallback.

Antes da ordenação, o motor mantém somente conteúdos que:

- possuem `publicationEnabled: true`;
- têm um status ativo reconhecido;
- aceitam a intensidade escolhida;
- não violam exclusões rígidas do contexto;
- pertencem a um dos cinco níveis de seleção.

O melhor nível editorial disponível é obrigatório durante todo o ciclo. Nenhum critério de diversidade, trajetória, formato, autoria ou recência pode promover um nível inferior. Um hash estável do sentimento, intensidade e ID mantém uma ordem reproduzível dentro do nível, enquanto a rotação consulta o histórico global recente. IDs e textos normalizados presentes nas últimas 12 escolhas ficam fora da seleção quando existe alternativa ainda não percorrida no mesmo nível. Depois que o conjunto do nível é integralmente percorrido, a repetição inevitável é liberada pela ordem de maior distância desde a última exibição, sem descer para outro nível.

Dentro do nível escolhido, associações dos sentimentos secundários, temas combinados e tom adequado refinam a ordem sem substituir o sentimento principal. A trajetória provável do contexto vem em seguida; formato e autoria atuam somente como diversidade. O motor evita mais de duas aparições do mesmo autor em cinco recomendações quando existem alternativas equivalentes. Preferências pessoais de autoria não participam da ordenação. O metadado editorial `filterGender` permanece no acervo, sem interferir na seleção.

Uma mudança na assinatura formada por sentimento principal, secundários e intensidade marca a próxima escolha como primeira resposta. Esse estado acrescenta os sinais `primeira_resposta` e `reconhecimento_inicial`, usados pelas exclusões editoriais, sem limpar o histórico recente.

## 8. Trajetória e efeito emocional

A implementação atual possui uma trajetória curta e funcional por contexto, não um roteiro terapêutico completo:

- a primeira resposta prioriza reconhecimento, presença ou contemplação;
- intensidade alta permanece mais tempo em funções de reconhecimento e esclarecimento;
- reframing, ação e confronto só entram depois de algum reconhecimento e quando são seguros para o contexto;
- novas gerações percorrem a fila do melhor nível elegível sem promover níveis inferiores;
- a trajetória é retomada quando a pessoa volta a uma combinação já usada.

As funções editoriais reconhecidas são: reconhecimento, esclarecimento, investigação, grounding, reformulação, confronto, ação e contemplação. Elas determinam os textos auxiliares apresentados como explicação e conselho.

Uma camada derivada de efeito editorial reconhece presença, esclarecimento, ampliação, investigação, grounding e confronto seguro. Ela também bloqueia padrões que confirmam crenças prejudiciais, transformam emoção em identidade, incentivam isolamento, ressentimento ou impulsividade, aumentam culpa, invalidam a emoção, romantizam sofrimento ou impõem sentido ao luto. Os casos negativos usados nos testes são artificiais e não entram no acervo. Em luto, confronto e ironia são bloqueados; ação é bloqueada na primeira resposta e em intensidade alta. Nos oito sentimentos revisados, a primeira resposta intensa não usa confronto nem ação.

As antigas regras numéricas de catarse e transcendência continuam desconectadas porque misturavam autoria, tom e pontuação de modo capaz de superar a precisão emocional. A arquitetura atual preserva a intenção útil: reconhecimento antes de ampliação e transcendência sem apagar a emoção, sempre como critério secundário dentro do mesmo nível.

## 9. Rotação e histórico

A classificação completa de autoridade, produtores, consumidores, persistência e destino recomendado está em `MATRIZ_AUTORIDADE_HISTORICOS.md`. Essa matriz distingue o histórico decisório runtime dos registros passivos, da navegação, dos favoritos, das avaliações e da rotação independente dos contos.

Cada contexto runtime mantém filas persistidas com a chave `entreSabiosRuntimeQueues:<versão>`. Elas são separadas por versão, sentimento principal, sentimentos secundários, intensidade e nível editorial. Em paralelo, `entreSabiosRecentContent:<versão>` mantém até 120 escolhas recentes entre todos os contextos, com ID, texto normalizado, autor e formato. `entreSabiosContextHistory:<versão>` preserva função editorial, formato e autoria por contexto para retomar cadência e trajetória após uma recarga.

Além da fila runtime:

- a interface mantém em memória o histórico navegável da sessão;
- o botão de voltar mostra reflexões anteriores desse histórico;
- pedir uma nova frase em menos de cinco segundos registra um sinal editorial e ajusta preferências locais de tema/livro, sem priorizar ou penalizar autores e sem alterar a seleção runtime das reflexões;
- IDs vistos são armazenados em `caixaSabedoriaHistoricoVisto`, embora o seletor runtime atual faça sua rotação pelas filas versionadas;
- contadores e históricos contextuais legados ainda são carregados, mas não participam da decisão principal atual.

## 10. Preferências locais e privacidade funcional

As preferências são armazenadas em `localStorage`; não há conta de usuário ou sincronização entre dispositivos. Quando o armazenamento é bloqueado, as funções principais continuam e a persistência simplesmente deixa de ocorrer.

Chaves atualmente utilizadas ou mantidas pelo código:

- `entreSabiosTheme`: tema visual;
- `caixaSabedoriaPreferencias`: gostei/não gostei e pesos locais;
- `caixaSabedoriaFavoritas`: frases favoritas;
- `entreSabiosRuntimeQueues:definitiva-2.1`: filas do seletor;
- `entreSabiosRecentContent:definitiva-2.1`: histórico global recente usado contra repetições;
- `entreSabiosContextHistory:definitiva-2.1`: trajetória, autoria e formato recentes por contexto;
- `caixaSabedoriaHistoricoVisto`: conteúdos vistos;
- `caixaSabedoriaConteudosGerados`: quantidade gerada;
- `entreSabiosHistoricoContextual`: histórico contextual;
- `entreSabiosContosVistos`: contos vistos por contexto;
- `entreSabiosContosRecentes`: últimos contos;
- `entreSabiosSinaisEditoriais`: sinais editoriais agregados.

O gostei/não gostei preserva a avaliação por conteúdo e ajusta pesos locais de temas e livros. O peso de livros influencia a recomendação de leitura; esses sinais não alteram a seleção runtime das reflexões. Preferências de autor ou gênero não são carregadas, atualizadas nem salvas novamente, inclusive quando uma instalação possui campos antigos como `authors`, `gender` ou `genderPreference` no armazenamento local. O gênero permanece somente como metadado editorial do acervo e não participa de filtros, pesos, filas, cache, analytics ou ordenação.

## 11. Favoritos

Uma reflexão pode ser adicionada ou removida das favoritas. O registro salvo contém ID, texto, atribuição, fonte e data. A biblioteca é exibida em um diálogo e permite remoção individual.

As favoritas existem somente no navegador atual. Limpar os dados do site, usar navegação privada ou trocar de dispositivo pode apagar ou tornar indisponível essa coleção.

## 12. Recomendação de livros

A recomendação é hierárquica. O sistema compara cada livro com:

- autor ou tradição relacionada à reflexão;
- sentimento principal;
- temas raiz do estado emocional;
- temas do conteúdo apresentado;
- função desejada do livro para o sentimento e a intensidade;
- compatibilidade de intensidade;
- preferência local acumulada para o livro;
- regras de exclusão clínica/editorial.

As funções de livro são validação, dissolução, ação e choque. Estados intensos de luto, tristeza, saudade e medo priorizam validação e dissolução. Ansiedade, confusão, medo e insegurança priorizam dissolução. Falta de propósito prioriza ação; raiva prioriza dissolução, ação e choque; culpa prioriza ação, dissolução e choque.

A ordenação favorece primeiro mesma autoria, relação autoral, sentimento, temas e função editorial; a preferência local por livro é um critério posterior. O resultado mostra título, autor e uma justificativa de continuidade editorial. Os links não são afiliados; quando um link específico não existe, o catálogo enriquecido pode gerar uma busca no Google pelo título e autor.

## 13. Autoria e classificação editorial

O runtime contém estes tipos de atribuição:

- `original`: conteúdo autoral do Entre Sábios;
- `inspired`: ideia editorial inspirada em um pensador;
- `exact_quote`: citação direta classificada;
- `translated_quote`: citação apresentada por tradução;
- `traditional`: conteúdo de tradição.

O campo `displayedAuthor` é a fonte efetivamente exibida. O sistema não transforma automaticamente toda ideia inspirada em citação direta. A origem editorial e o tipo de atribuição permanecem no acervo mesmo quando a interface principal mostra apenas a autoria de exibição.

Os tipos visuais do runtime incluem frases, citações curtas, citação longa, microtextos e reflexões curtas. Citação longa, microtexto e reflexão curta são renderizados como texto sem aspas automáticas; os demais aparecem como frase entre aspas.

## 14. Compartilhamento

O painel atual possui escolha manual entre três estilos existentes:

- `cream`;
- `sage`;
- `blue`.

O estilo inicial é `sage`. O botão **Status / Stories** gera uma imagem PNG usando o estilo manual ativo. Se `navigator.share` e `navigator.canShare` aceitarem o arquivo, o navegador abre o compartilhamento nativo com a imagem. Caso contrário, a imagem é baixada e, quando o navegador oferece Web Share para texto, a mensagem também é aberta na folha de compartilhamento.

O botão SVG no canto superior esquerdo da frase funciona como compartilhamento rápido. A cada acionamento ele sorteia `cream`, `sage` ou `blue` sem mudar o estilo selecionado no painel manual. Um mesmo estilo pode ser sorteado em acionamentos consecutivos, pois cada geração é uma nova escolha aleatória.

Não existe botão de copiar mensagem na interface. Cancelamentos, falhas de geração e falhas de envio recebem mensagens discretas em uma região `aria-live`.

Os símbolos de WhatsApp, Instagram e Facebook continuam informativos. O site usa a folha de compartilhamento oferecida pelo dispositivo e não afirma possuir integração direta universal com esses aplicativos.

## 15. Geração da imagem compartilhável

`js/features/sharing.js` cria um `canvas` de 1080 × 1920 pixels, proporção 9:16, desenha fundo em gradiente, brilho, textura de papel, ramos, folhas, frase, autoria, assinatura `entresabios.com` e ícone de compartilhamento. Em seguida, converte o canvas para PNG com `toBlob` e qualidade declarada de 0,96.

A imagem usa a reflexão atual; os controles orientam a pessoa a gerar uma reflexão antes de compartilhar. O tamanho da fonte é reduzido progressivamente até o bloco caber em metade da altura útil, respeitando um tamanho mínimo. A autoria pode ocupar até duas linhas.

Limitações atuais:

- a disponibilidade de compartilhamento de arquivo depende do navegador, sistema e aplicativos instalados;
- quando o arquivo não pode ser enviado diretamente, o usuário precisa anexar manualmente a imagem baixada;
- textos editoriais extremos ainda dependem do tamanho mínimo definido pelo ajustador tipográfico.

## 16. Contos filosóficos

O diálogo de contos exige ao menos um sentimento selecionado. A pontuação de cada conto soma:

- 8 pontos por correspondência com o sentimento principal;
- 4 pontos por sentimento secundário correspondente;
- 2 pontos por tema editorial correspondente;
- 1,5 ponto por palavra-chave correspondente;
- 1,2 ponto por tema compartilhado com a reflexão atual.

A rotação desconta 5 pontos quando o conto já apareceu para a mesma seleção e 4 pontos quando está entre os seis mais recentes. O sistema prefere contos compatíveis ainda não vistos na sessão; ao pedir outro conto, aceita variedade temática gradual. Depois que todos forem percorridos, reinicia a jornada e informa isso na interface.

O diálogo mostra título, origem, tempo aproximado, narrativa, explicação filosófica, relação com o sentimento e pergunta de reflexão. Valores editoriais são escapados antes de serem inseridos como parágrafos. O histórico contextual dos contos mantém até 120 combinações e seis IDs recentes no navegador.

### 16.1 Padrão visual das imagens dos contos

O padrão piloto usa ilustração editorial contemplativa, poética e minimalista, com textura suave de papel, contraste baixo a moderado, figuras humanas discretas e paleta terrosa combinada a verde-sálvia e dourado pálido. As imagens não contêm texto, logotipo ou marca d'água e devem acompanhar a leitura sem funcionar como capa dominante.

O arquivo de publicação usa proporção 16:9, resolução de 1536 × 864 pixels e formato WebP comprimido. No modal, a figura ocupa no máximo 520 pixels de largura, preserva a proporção, adapta-se a telas menores e é carregada com `loading="lazy"` e `decoding="async"`. Cada imagem deve declarar dimensões intrínsecas e um texto alternativo que descreva a cena sem repetir o título do conto.

Somente `mito-da-caverna` possui imagem nesta etapa. O piloto está em `assets/contos/alegoria-da-caverna-piloto.webp` e aparece tanto no diálogo da página inicial quanto na página canônica do conto; os demais contos mantêm o fluxo anterior, sem espaço vazio ou imagem genérica. Novas imagens dependem de revisão e autorização em outro lote.

As 33 páginas estáticas de contos são independentes do diálogo e permitem descoberta direta por URL e buscadores.

## 17. SEO e dados estruturados

O conjunto atual possui 77 documentos HTML públicos:

- uma página inicial;
- 33 contos;
- um índice e 12 ensaios;
- 16 pensadores;
- 14 sentimentos.

Todos os 77 documentos auditados possuem título, meta description, URL canônica, `og:url`, `og:image` e um bloco JSON-LD válido. Os tipos atuais são:

- `WebSite` na página inicial;
- `Article` nos 33 contos e 12 ensaios;
- `CollectionPage` no índice de ensaios;
- `WebPage` nas páginas de pensadores e sentimentos.

As 76 páginas internas possuem breadcrumbs visuais e um `BreadcrumbList` correspondente em JSON-LD. Os ensaios usam o índice real de ensaios como nível intermediário. Contos e sentimentos usam âncoras reais da página inicial; páginas de pensadores não inventam uma página de índice inexistente. A posição atual é marcada visualmente com `aria-current="page"`.

O sitemap contém 77 URLs, sem duplicatas e com correspondência integral às URLs canônicas atuais. Todo o conjunto usa `https://entresabios.com`. A extensão de imagens foi habilitada somente para a página canônica de `mito-da-caverna`, apontando para a imagem-piloto; nenhuma imagem genérica foi cadastrada para os demais contos. `robots.txt` permite rastreamento geral e aponta para `https://entresabios.com/sitemap.xml`.

O sitemap não usa `changefreq` nem `priority`. O `lastmod` geral registra 13 de julho de 2026, data da alteração em canonical, breadcrumbs e dados estruturados; a página do conto da caverna registra 14 de julho de 2026 pela inclusão real da imagem-piloto. Canonical, Open Graph, JSON-LD, compartilhamento e sitemap usam o host sem `www`. O arquivo `.htaccess` redireciona requisições `www` para o host canônico com status 301 em servidores Apache compatíveis.

## 18. Acessibilidade e responsividade existentes

A página usa botões reais para as principais ações, `aria-label` em controles iconográficos, `aria-pressed` nos estados selecionáveis, regiões de status com `aria-live` e elementos `dialog` para conteúdos sobrepostos. Há fallbacks de atributo `open` quando `showModal` não está disponível.

O layout possui regras dedicadas para smartphone, smartphone horizontal e tablet. A rolagem horizontal do smartphone e a coluna única do tablet estão cobertas por testes estruturais. O diálogo de contos possui rolagem própria e restaura a posição da página ao fechar.

A faixa animada da frase diária respeita `prefers-reduced-motion: reduce`: a animação é interrompida, a transformação é removida e o conteúdo permanece visível. Essa proteção também está coberta pela suíte automatizada.

## 19. Limitações e débitos atuais

- Em conjuntos compatíveis pequenos ou concentrados em uma única autoria, o mesmo autor pode aparecer em sequência para preservar a hierarquia editorial; a repetição exata continua bloqueada até o esgotamento das alternativas elegíveis.
- Contadores e históricos contextuais legados ainda permanecem no código sem efeito na decisão principal atual.
- `js/data/matching-rules.js` e bases editoriais antigas existem, mas não são carregados pela página principal.
- Catarse e transcendência não são fases obrigatórias nem restauram a antiga pontuação; funcionam apenas como intenções editoriais subordinadas à trajetória e à hierarquia.
- O melhor nível de nenhum sentimento possui três textos desenvolvidos elegíveis. Por isso, a meta real de 20% a 30% de microtextos/reflexões não pode ser aplicada sem mudar o acervo, seus placements ou a hierarquia; a cadência está validada com dados artificiais equivalentes.
- Não existe integração universal direta com Instagram; o comportamento depende da folha de compartilhamento do sistema.
- O redirecionamento canônico depende de o servidor publicado processar `.htaccess`; deve ser validado após o upload.
- As regras de rolagem dos contos estão distribuídas entre CSS modular e um bloco crítico inline, aumentando o custo de manutenção.
- Favoritos e preferências não sincronizam entre dispositivos.
- A presença online depende de serviço externo.
- A suíte automatizada valida dados, algoritmo e ligações estruturais, mas não substitui testes visuais e de interação em navegadores reais.
- Console, compartilhamento nativo de arquivo e comportamento final da folha de compartilhamento ainda precisam ser confirmados em navegadores e dispositivos reais após a publicação.

## 20. Estado da revisão final

A revisão consolidada de 15 de julho de 2026 confirmou:

- 77 documentos HTML com idioma, viewport, região principal, IDs não duplicados e textos alternativos nas imagens;
- 153 blocos JSON-LD sintaticamente válidos;
- 76 páginas internas com breadcrumb visual e `BreadcrumbList` equivalente;
- sitemap XML válido com as mesmas 77 URLs canônicas, sem `priority` ou `changefreq`;
- referências internas de `href` e `src` apontando para destinos existentes;
- 249 testes automatizados aprovados, incluindo contratos canônicos, análise estática, integração, regressão e estresse;
- oito sequências de 100 seleções sem repetição exata, normalizada ou canônica evitável e com 100% de cobertura dos elegíveis antes do reinício;
- sintaxe válida nos arquivos JavaScript e módulos testados;
- compartilhamento progressivo preservando escolha manual, sorteio no atalho, Web Share quando disponível e download como fallback;
- estrutura editorial futura criada em `PADRAO_EDITORIAL_ENTRE_SABIOS.md`, ainda aberta à curadoria.

A validação em navegador real confirmou 21 perspectivas únicas no cenário principal, persistência após recarga, proteção contra clique duplo, rolagem em smartphone retrato e paisagem e ausência de overflow horizontal. Compartilhamento nativo de arquivos e a folha final oferecida por cada sistema operacional continuam dependendo do dispositivo. A publicação também deve ser validada separadamente: o GitHub Pages e o domínio principal não usam atualmente o mesmo processo operacional.

A imagem-piloto da caverna continua sendo o único exemplo autorizado. Novas imagens e a consolidação da identidade editorial dependem de revisão humana futura.

## 21. Execução local e verificações

Com Node.js disponível:

```sh
npm run serve
```

O servidor local evita limitações de `fetch` que podem ocorrer ao abrir `index.html` diretamente pelo protocolo `file:`.

Para reconstruir e validar o runtime editorial:

```sh
npm run build:content
```

Para apenas verificar se o runtime versionado corresponde ao mestre, sem escrever arquivos:

```sh
npm run check:content
```

Os testes podem ser executados por domínio com `test:state`, `test:synthesis`, `test:motivation`, `test:ranking`, `test:rotation`, `test:editorial`, `test:ui`, `test:seo` e `test:lab`. `npm run test:fast` omite os cenários mais caros; `npm run test:stress` executa a auditoria comportamental, as sequências extensas e a atomicidade da seleção; `npm run test:all` executa os 249 testes sem reconstruir o runtime.

A análise estática leve pode ser executada isoladamente com:

```sh
npm run check:static
```

Ela usa o próprio Node, sem dependências adicionais, para verificar a sintaxe dos arquivos `.js` e `.mjs`, o parsing dos JSON e os destinos dos imports relativos. Arquivos paralelos com sufixo `-PEDRO` estão explicitamente excluídos enquanto permanecerem protegidos e fora da aplicação ativa. Essa verificação não substitui testes comportamentais, análise visual ou validação em navegador.

Uma sessão baixada por `window.EntreSabiosSelectionDiagnostics.downloadJson()` no modo `?debugEmotional=1` pode ser reproduzida localmente com:

```sh
npm run replay:diagnostic -- caminho/entre-sabios-diagnostico.json
```

O relatório compara, seleção por seleção, o conteúdo registrado com o conteúdo escolhido ao restaurar a fila, sua direção e os históricos anteriores. Código de saída `0` indica correspondência integral, `1` indica escolha divergente e `2` indica arquivo ou esquema inválido. A ferramenta é somente de observabilidade: ela não escreve no acervo, no runtime nem no armazenamento do navegador e não participa do caminho de produção.

O laboratório da mistura emocional também é exclusivamente local e pode executar cenários novos ou uma configuração JSON:

```sh
npm run lab:emotional
npm run lab:emotional -- --input cenarios.json --output relatorio.json
```

Cada cenário aceita sentimento principal, até dois secundários, intensidade, motivação, quantidade de seleções, fallback forçado para auditoria e mudanças programadas com recarga opcional. A saída registra escolhas, candidatos, progressão, remoções, repetição, autoria, conceitos, formatos e as métricas `primaryRetention`, `secondaryInfluence`, `secondaryDominanceRisk`, `synthesisSpecificity`, `motivationInfluence`, `candidateConcentration`, `coverageBeforeRepeat`, `fallbackRate`, `authorConcentration`, `conceptConcentration` e `formatCoverage`. Essas medidas são diagnóstico, não pesos do ranking. Limites de concentração e influência só podem ser calibrados depois da distribuição sistemática da Fase 10.

A matriz sistemática reproduzível usa:

```sh
npm run audit:systematic
npm run audit:systematic -- --output relatorio.json
```

Ela cobre os 14 sentimentos, três intensidades, todos os pares ordenados, perfis prioritários, inversões, retornos, fallbacks e recargas sem criar tríades. O resultado vigente está em `RELATORIO_FASE_10_AUDITORIA_SISTEMATICA.md`.

A bateria específica de estresse executa oito sequências de 100 seleções, além de conjuntos reduzidos, persistência, equivalência canônica, rotação e atomicidade da interface. A métrica de cobertura compara os candidatos elegíveis distintos com os conteúdos distintos percorridos antes da primeira repetição. O resultado vigente está em `RELATORIO_FASE_11_TESTES_ESTRESSE.md`.

A validação da Fase 12 exercitou a interface em uma instância real do Chrome com viewports de desktop, smartphone em ambas as orientações e tablet em ambas as orientações. Não houve overflow horizontal, o smartphone horizontal rolou até o final, o duplo clique gerou somente uma nova seleção, o histórico sobreviveu à recarga, motor e interface exibiram o mesmo conteúdo e o console permaneceu limpo. Viewport responsivo não equivale a dispositivo físico; tablet e toque físicos continuam como conferência manual pendente. Os detalhes estão em `RELATORIO_FASE_12_NAVEGADOR_E_DISPOSITIVOS.md`.

A Fase 13 executou a regressão editorial completa e confirmou, sem novas alterações funcionais, acervo, autoria, status, formatos, pensador, orientação, explicação, livros, compartilhamento, modo claro, contos, ensaios, segurança, motivação, síntese, principal, secundários e intensidade. O runtime permaneceu em `definitiva-2.1` com 283 ativos e os 249 testes passaram. A matriz de evidências está em `RELATORIO_FASE_13_REGRESSAO_EDITORIAL.md`.

A consolidação das Fases 0 a 14 está em `RELATORIO_FINAL_LOOP_ALGORITMO_MAPA_EMOCIONAL.md`. Esse documento reúne causa original, arquitetura preservada, progressão, barreira global, ciclo, atomicidade, migração, reconciliação, métricas, alertas, testes, navegador, antes/depois, riscos e lacunas editoriais. A conclusão local não autoriza automaticamente commit, merge, publicação ou revisão do acervo.

Para reconstruir o runtime e executar toda a suíte:

```sh
npm test
```

Como `npm test` começa pela reconstrução do conteúdo, ele pode alterar o arquivo runtime se o acervo-mestre tiver mudado. Quando a intenção for apenas executar os testes contra o estado existente, os arquivos `tests/*.test.mjs` podem ser passados diretamente ao executor de testes do Node.

Antes de integrar ao Git, o comando recomendado é:

```sh
npm run verify
```

O mesmo comando é executado pelo workflow `.github/workflows/verify.yml` em pull requests e em atualizações de `main`.

## 22. Regra de manutenção desta documentação

Este documento deve ser atualizado quando mudar qualquer contrato importante: versão ou formato do runtime, hierarquia de seleção, catálogo de sentimentos, persistência local, fluxo de compartilhamento, estrutura de páginas, SEO, contos, recomendação de livros ou integrações externas.

Comportamentos planejados devem permanecer separados dos comportamentos ativos. Se um arquivo legado não for carregado pela página, suas regras não devem ser descritas como parte do algoritmo em produção.

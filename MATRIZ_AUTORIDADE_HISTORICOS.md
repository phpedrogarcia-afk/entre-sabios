# Matriz de autoridade dos históricos — Entre Sábios

> Estado verificado em 16 de julho de 2026. Esta matriz descreve o comportamento ativo; não remove, migra nem restaura estruturas.

## Conclusão executiva

O histórico que impede a repetição de reflexões é `entreSabiosRecentContent:<versão>`, mantido por `js/core/runtime-engine.js`. Ele é global entre combinações emocionais e persiste no `localStorage`. A fila `entreSabiosRuntimeQueues:<versão>` complementa esse controle ao registrar o que ainda resta em cada contexto e nível.

`caixaSabedoriaHistoricoVisto` não decide a próxima reflexão: recebe o ID somente depois que o seletor runtime já escolheu e persistiu o resultado. `entreSabiosHistoricoContextual` e `caixaSabedoriaConteudosGerados` são estruturas legadas/passivas sem consumidor decisório atual.

## Matriz principal

| Estrutura / chave | Arquivo e estado em memória | Produtor | Consumidor | Persistência e limite | Influência atual | Autoridade | Destino recomendado |
|---|---|---|---|---|---|---|---|
| `entreSabiosRecentContent:<versão>` | `js/core/runtime-engine.js`; `recentSelections` | `createSelector().select()` registra cada escolha antes de retorná-la | O próprio seletor: exclusão por ID, texto normalizado e chave canônica; proximidade textual/conceitual; diversidade de autoria; reinício pela menor recência | `localStorage`; até 120 escolhas | Seleção de reflexões e antirrepetição global, inclusive após troca de sentimento/intensidade e recarga | **Autoridade global de repetição** | Manter. Migrar de forma compatível quando o esquema das entradas mudar; não limpar em simples mudança de contexto |
| `entreSabiosRuntimeQueues:<versão>` | `js/core/runtime-engine.js`; `queues` | `select()` reconcilia e consome a fila do contexto + nível | `select()` determina a ordem dos candidatos ainda disponíveis | `localStorage`; mapa por contexto e nível | Rotação determinística dentro do território elegível | **Autoridade de ciclo por contexto/nível** | Manter. Invalidar seletivamente quando versão do seletor/rotação for incompatível |
| `entreSabiosRuntimeQueueDirections:<versão>` | `js/core/runtime-engine.js`; `queueDirections` | `select()` registra `standard` ou `motivated` | `select()` reordena apenas o restante da fila quando o modo muda | `localStorage`; uma direção por fila | Ordem da fila; não define elegibilidade nem repetição sozinho | Auxiliar da fila | Manter junto da fila e compartilhar sua política de invalidação |
| `entreSabiosContextHistory:<versão>` | `js/core/runtime-engine.js`; `contextHistories` | `select()` acrescenta ID, função editorial, formato e autor | `select()` calcula primeira resposta real, trajetória editorial e cadência entre formatos curtos/desenvolvidos | `localStorage`; até 120 entradas por contexto | Seleção editorial por contexto; não é a autoridade de repetição exata global | Autoridade contextual de trajetória/cadência | Manter. Invalidar com fila quando a política contextual se tornar incompatível |
| `entreSabiosRuntimeQueueMeta:<versão>` | `js/core/runtime-engine.js`; metadados de restauração | `persist()` grava versões de conteúdo, esquema e rotação | Inicialização do seletor valida compatibilidade das filas | `localStorage`; um objeto por versão | Migração e restauração; não escolhe conteúdo | Autoridade de compatibilidade | Manter e versionar quando o formato ou a semântica da fila mudar |
| `history` + `historyIndex` | `script.js`; memória da página | `generateReflection()` e `newPhrase()` | `goBack()`, renderização e diversidade das últimas recomendações de livro | Somente memória; dura até recarregar a página | Navegação da sessão e até 4 títulos recentes de livros; não entra no seletor de reflexões | Autoridade da navegação local | Manter. Se futuramente persistir, separar navegação de antirrepetição |
| `caixaSabedoriaHistoricoVisto` | `script.js`; `viewedStoryKeys` | `pickRuntimeContent()` grava o ID **depois** de `runtimeSelector.select()` | Apenas carga e nova gravação do próprio conjunto | `localStorage`; até 600 IDs | Nenhuma decisão atual | Legado/passivo | Candidato a migração/remoção futura somente após período de compatibilidade e teste de dados antigos |
| `caixaSabedoriaConteudosGerados` | `script.js`; `generatedContentCount` | Incrementado após uma escolha runtime bem-sucedida | Apenas carga e persistência do contador | `localStorage`; número sem limite funcional relevante | Nenhuma decisão atual | Legado/passivo | Candidato a remoção futura se nenhum consumidor externo for comprovado |
| `entreSabiosHistoricoContextual` | `script.js`; `contextualContentHistory` | Nenhum produtor ativo encontrado | Apenas funções de carga/gravação; a gravação não é chamada | `localStorage`; leitura limitada às últimas 120 entradas | Nenhuma decisão atual | Legado dormente | Não confundir com `entreSabiosContextHistory:<versão>`. Candidato a remoção/migração futura após teste de compatibilidade |
| `entreSabiosContosVistos` | `script.js` e `js/features/tales.js`; `viewedTaleKeys` | `markTaleAsViewed()` registra `contexto::id` | `getRankedTalesForState()` aplica penalidade ao conto já visto na mesma seleção | `localStorage`; até 120 combinações | Seleção de contos somente | Autoridade contextual dos contos | Manter; não integrar ao histórico das reflexões |
| `entreSabiosContosRecentes` | `script.js` e `js/features/tales.js`; `recentTaleKeys` | `markTaleAsViewed()` | `getRankedTalesForState()` aplica penalidade aos IDs recentes | `localStorage`; 6 IDs | Diversidade recente de contos somente | Autoridade recente dos contos | Manter; não integrar ao histórico das reflexões |
| `contosJaVistos` | `script.js` e `js/features/tales.js`; array em memória | `markTaleAsViewed()` | `pickBestTale()` evita repetir na sessão e reinicia após percorrer o acervo | Somente memória; até o tamanho do catálogo | Ciclo de contos na sessão | Autoridade do ciclo de contos da sessão | Manter; sua perda ao recarregar é compensada pelas penalidades persistentes |
| `caixaSabedoriaFavoritas` | `js/features/favorites.js`; `favoriteStories` | Ação explícita de favoritar/remover | Diálogo e estado visual de favoritas | `localStorage`; coleção do usuário | Favoritos somente | Autoridade da biblioteca pessoal | Manter independente do ranking e da antirrepetição |
| `caixaSabedoriaPreferencias` | `js/features/feedback.js`; `preferenceProfile` | Gostei/não gostei atualiza tags, livros e avaliação da história | Estado dos botões; preferência de livro participa tardiamente do desempate de livros | `localStorage`; objeto local | Não altera o seletor de reflexões; influência limitada à recomendação de livro | Autoridade de feedback e preferência de livro | Manter sem reintroduzir preferência de autoria |
| `entreSabiosSelectionDiagnosticSession:v1` | `js/core/matching.js`; `activeSelectionDiagnosticSession` | Modo de depuração registra diagnósticos após cada escolha | Exportador, snapshot no DOM e replay manual | `sessionStorage`; duração da aba, sem limite explícito | Observabilidade somente | Evidência diagnóstica, sem autoridade decisória | Manter fora do caminho de decisão; versionar o contrato do diagnóstico |
| `entreSabiosSinaisEditoriais` | `js/core/matching.js`; agregado por evento/sentimento/intensidade | `recordEditorialSignal()` | Nenhum consumidor de seleção | `localStorage`; contagens limitadas a 999 por chave | Telemetria local/passiva | Sem autoridade decisória | Manter somente se houver uso analítico explícito; não promovê-lo a ranking implicitamente |

## Ordem real de uma escolha

1. `runtimeSelector.select()` consulta filas, histórico global recente e histórico contextual.
2. O seletor escolhe um conteúdo, atualiza essas estruturas e tenta persistir o estado de forma atômica.
3. `pickRuntimeContent()` recebe o resultado já decidido.
4. Só então o ID entra em `caixaSabedoriaHistoricoVisto` e o contador legado é incrementado.
5. A interface transforma o conteúdo em história, acrescenta-o ao histórico navegável da sessão e renderiza.

Essa ordem prova que `caixaSabedoriaHistoricoVisto` não pode ser a causa ativa nem a solução ativa da repetição no fluxo atual.

## Regras de independência

- Trocar sentimento principal, secundários ou intensidade cria outra chave de contexto, mas não limpa `entreSabiosRecentContent:<versão>`.
- Voltar no histórico da interface não executa uma nova seleção e não altera as filas.
- Favoritar não modifica filas, histórico recente ou ranking de reflexões.
- Gostei/não gostei não modifica o ranking de reflexões; a preferência por livro só atua depois dos critérios editoriais principais da recomendação bibliográfica.
- Contos têm rotação própria e não contaminam o ciclo das reflexões.
- Diagnósticos e sinais editoriais observam escolhas, mas não são entradas do seletor.
- O tema visual (`entreSabiosTheme`) é uma preferência de interface, não um histórico editorial.

## Política segura para uma fase futura

Nenhuma remoção é autorizada por esta matriz. Uma limpeza futura deve, para cada estrutura legada:

1. provar por teste que não existe consumidor de seleção, navegação, favoritos ou integração externa;
2. decidir se dados antigos precisam de migração ou apenas expiração;
3. preservar `entreSabiosRecentContent:<versão>` durante mudanças simples de contexto e durante invalidação seletiva de filas;
4. evitar criar uma segunda autoridade paralela de repetição;
5. comparar o comportamento antes/depois com testes de ciclo completo, recarga e troca de contexto.


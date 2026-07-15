# Entre Sábios — Fase 6: testes de estresse da antirrepetição

Data: 15 de julho de 2026
Escopo: rotação, histórico, equivalência, síntese, motivação, fallbacks e persistência
Acervo preservado: `definitiva-2.1`, 283 conteúdos ativos

## Resumo executivo

A correção da Fase 5 foi submetida a oito sessões de 100 seleções e a casos sintéticos de borda. Nas 800 escolhas do acervo real ocorreram zero repetições exatas, normalizadas ou canônicas evitáveis. Motivação, intensidade, secundários, troca e retorno do principal, níveis de síntese e recarregamentos simulados não reiniciaram indevidamente o histórico.

O estresse encontrou uma lacuna concreta que ainda não era coberta: conteúdos com IDs e textos diferentes, mas provenientes da mesma passagem-base, podiam aparecer em sequência. A barreira existente foi estendida, sem mudar sua arquitetura, para consultar `canonicalContentId`, `duplicateOf`, `derivedFromId` e `sourceFragmentId`.

## Classificação do trabalho

- Antirrepetição por ID e texto normalizado: concluída na Fase 5; somente conferida.
- Histórico global, filas contextuais e persistência: concluídos; submetidos a regressão e estresse.
- Motivação, síntese e trajetória: herdadas; somente verificadas.
- Equivalência canônica: metadados apenas diagnosticados anteriormente; lacuna funcional encontrada e corrigida.
- Navegador real pós-correção: não iniciado nesta fase; pertence à Fase 7.

## Matriz de 800 seleções

| Cenário | Exatas evitáveis | Normalizadas evitáveis | Canônicas evitáveis | Inevitáveis | Primeira inevitável | Maior sequência de autor | Formatos | Fila média | Reconstruções |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Contínua | 0 | 0 | 0 | 0 | — | 2 | 3 | 19,63 | 20 |
| Motivação ligada | 0 | 0 | 0 | 0 | — | 1 | 3 | 19,63 | 20 |
| Motivação alternada | 0 | 0 | 0 | 0 | — | 1 | 3 | 19,63 | 20 |
| Intensidade alternada | 0 | 0 | 0 | 4 | 81 | 1 | 3 | 11,93 | 31 |
| Secundários alternados | 0 | 0 | 0 | 0 | — | 2 | 3 | 19,63 | 22 |
| Troca e retorno do principal | 0 | 0 | 0 | 0 | — | 1 | 3 | 15,52 | 21 |
| Fallbacks de síntese | 0 | 0 | 0 | 0 | — | 2 | 3 | 19,63 | 23 |
| Recarregamentos simulados | 0 | 0 | 0 | 0 | — | 1 | 3 | 19,63 | 20 |

Totais:

- 800 seleções do acervo real;
- 0 repetições exatas evitáveis;
- 0 repetições normalizadas evitáveis;
- 0 repetições canônicas evitáveis;
- 4 repetições inevitáveis, todas após a posição 80 na alternância entre três intensidades;
- 0 sequências excessivas de autor quando havia autor alternativo;
- três formatos circularam em todos os cenários: frase, citação curta e reflexão curta;
- maior sequência de conceito observada: 3;
- níveis emocionais usados: somente 1 e 2, preservando o sentimento principal.

As quatro repetições classificadas como inevitáveis aconteceram quando a intensidade ativa já não possuía alternativa segura fora da janela recente. Não foram provocadas apenas pela troca de intensidade e não existia candidato seguro permitido que evitasse a repetição naquele passo.

## Fallbacks

Foram percorridos durante a sessão:

- nível 1: tríade exata;
- nível 2: par direcional;
- nível 3: perfil principal com modificador;
- ausência de síntese: somente o sentimento principal;
- nível 4: fallback cauteloso, validado com catálogo controlado sem perfil principal;
- nível 5: algoritmo atual sem síntese, validado com catálogo controlado inválido.

Nos níveis 4 e 5, 30 escolhas consecutivas em cada caminho permaneceram distintas, seguras e nos níveis emocionais 1 ou 2.

## Casos de borda

- Conjunto com três conteúdos: os três aparecem antes da primeira repetição.
- Conjunto com um conteúdo: a segunda escolha é registrada como repetição inevitável.
- IDs diferentes e texto literal igual: bloqueio confirmado.
- Texto com pontuação, caixa e acentuação diferentes: bloqueio normalizado confirmado.
- Mesma passagem-base com textos diferentes: teste falhou antes da extensão canônica e passou depois.
- Autores equivalentes: nenhuma terceira aparição consecutiva quando havia alternativa.
- Formatos variados: todos os formatos disponíveis circularam no ciclo.
- Duplo clique: continua produzindo somente uma seleção.

## Correção canônica mínima

Arquivo: `js/core/runtime-engine.js`

Alterações:

1. criação determinística das chaves canônicas existentes;
2. gravação das chaves no histórico recente;
3. enriquecimento, durante a leitura, de históricos antigos que ainda não continham o campo;
4. consulta canônica no ciclo completo, janela recente, reconstrução da fila e escolha final;
5. remoção da mesma passagem-base da fila após a escolha;
6. repetição canônica registrada como relaxamento somente depois do esgotamento seguro.

Não houve limpeza geral nem troca da chave do `localStorage`. Entradas antigas são enriquecidas a partir do ID existente. Favoritos e dados sem relação com a rotação não são tocados.

## Segurança e preservação

- Acervo e autorias: não alterados.
- Versão e totais: `definitiva-2.1`, 283 ativos, 64 núcleos, 151 contextuais e 68 gerais.
- Principal: nunca relaxado além dos níveis 1 e 2.
- Segurança editorial: confirmada antes de contabilizar cada escolha.
- Síntese e motivação: continuam desempates, não filtros de elegibilidade.
- Dependências externas: nenhuma adicionada.
- Arquitetura: preservada.
- Commit, push ou merge: não realizados.

## Arquivos da Fase 6

- `js/core/runtime-engine.js`: extensão canônica da barreira existente.
- `tests/repetition-stress.test.mjs`: matriz permanente de estresse e casos de borda.
- `RELATORIO_FASE_6_ESTRESSE_ANTIRREPETICAO.md`: este relatório.

## Próxima fase

A Fase 7 deve repetir no navegador real a sequência que falhava e as cinco sequências da Fase 2, verificando desktop, mobile, cliques rápidos, console e `localStorage`. O aceite final da correção continua pendente dessa validação real.

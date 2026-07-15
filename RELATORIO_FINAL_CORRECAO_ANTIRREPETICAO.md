# Relatório final — correção de antirrepetição do Entre Sábios

Data: 15 de julho de 2026
Acervo: `definitiva-2.1`
Conteúdos ativos preservados: 283

## 1. Resumo executivo

A repetição percebida na interface foi reproduzida, diagnosticada e corrigida na menor unidade do motor. O núcleo emocional não reinicia enquanto existe conteúdo contextual seguro e inédito do mesmo sentimento principal. A janela recente é global, sobrevive a mudanças de contexto e recargas, e bloqueia ID, texto normalizado e passagem canônica. Duplos cliques produzem uma única seleção.

## 2. Sequência que reproduzia o problema

Autoconhecimento principal, Confusão e Insegurança secundários, intensidade Moderada e sucessivos cliques em “Outra perspectiva”. O núcleo tinha quatro conteúdos e reiniciava no quinto clique.

## 3. Conteúdo repetido

`curated-44`, texto inspirado em Virginia Woolf.

## 4. Posição da repetição

Quinta seleção no caso original automatizado. No navegador com arquivo antigo em cache, reapareceu também nas posições 2 e 15 de uma sessão mais longa.

## 5. Alternativas seguras existentes

Havia 39 conteúdos contextuais seguros e ainda não apresentados para o mesmo sentimento principal.

## 6. Causa concreta

`js/core/runtime-engine.js`, função `select()`: a seleção permanecia presa ao melhor nível e reconstruía a fila desse mesmo nível depois do esgotamento. Uma fila parcial antiga também podia sobreviver à mudança de contexto. No navegador, identificadores antigos de cache mantinham a implementação anterior mesmo depois da correção local.

## 7. Por que os testes anteriores não perceberam

Os testes antigos exigiam explicitamente permanência eterna no melhor nível, chamavam o motor diretamente, não percorriam o evento real da interface e não verificavam alternativas seguras fora da fila ativa. O duplo clique também não fazia parte da suíte.

## 8. Arquivos funcionais modificados

- `js/core/runtime-engine.js`;
- `js/core/matching.js`;
- `script.js`;
- `index.html`.

Arquivos herdados da síntese e motivação foram preservados e apenas integrados aos testes de regressão.

## 9. Funções modificadas

- `createSelector()` e `select()` no motor;
- instrumentação de diagnóstico em `matching.js`;
- proteção `runReflectionSelectionAction()` em `script.js`;
- referências versionadas dos scripts em `index.html`.

## 10. Diff resumido

- progressão do nível 1 para o nível 2 do mesmo principal;
- reconciliação da fila com histórico global e janela recente;
- equivalência canônica por metadados existentes;
- migração não destrutiva de históricos antigos;
- trava de 350 ms contra dupla execução;
- marcadores novos para invalidar cache do navegador;
- testes permanentes de reprodução e estresse.

## 11. Teste que falhava antes

`tests/repetition-real-path-regression.test.mjs` reproduzia a repetição no quinto clique e demonstrava as 39 alternativas seguras restantes. O mesmo arquivo reproduzia duas seleções em duplo clique.

## 12. Resultado depois

Os dois testes de reprodução passaram. O teste canônico da Fase 6 também falhou antes da extensão por passagem-base e passou depois.

## 13. Suíte completa

196 testes aprovados, 0 falhas.

## 14. Estresse

Oito sessões de 100 escolhas: 800 seleções reais do acervo, zero repetição exata, normalizada ou canônica evitável. Fallbacks 1 a 5, motivação, intensidade, secundários, principal e recarga foram cobertos.

## 15. Navegador real

Chrome real, eventos da interface e servidor HTTP local. A sequência principal produziu 21 IDs distintos em 21 escolhas. Luto intenso com armazenamento limpo mostrou 10 conteúdos distintos e primeira repetição inevitável na posição 11. Console sem erros.

## 16. Métricas antes e depois

| Métrica | Antes | Depois |
|---|---:|---:|
| Repetição original | posição 5 | ausente enquanto havia alternativa |
| Alternativas ignoradas | 39 | 0 |
| Repetições evitáveis em 800 escolhas | não medidas | 0 |
| Testes | 188 | 196 |
| Duplo clique | 2 seleções | 1 seleção |

## 17. Impacto na síntese

A síntese continua desempate lexicográfico. Não cria fila paralela, não reduz a elegibilidade e não supera a barreira recente.

## 18. Impacto na motivação

Ligar ou desligar motivação apenas reordena candidatos restantes. Histórico e ciclo não são apagados.

## 19. Impacto na trajetória

Reconhecimento, contemplação, esclarecimento e desenvolvimento continuam ordenados depois da barreira de repetição.

## 20. Impacto nos formatos

Frase, citação curta e reflexão curta circularam em todos os oito cenários de estresse. Testes específicos preservam microtextos e formatos desenvolvidos.

## 21. Impacto nos autores

Maior sequência observada: duas aparições. Não houve terceira aparição quando existia autor alternativo equivalente.

## 22. Impacto nos fallbacks

Tríade, par, perfil principal, fallback cauteloso e algoritmo sem síntese preservaram segurança, principal e rotação.

## 23. Persistência e migração

O `localStorage` não é limpo. Entradas antigas recebem chaves canônicas a partir do ID conhecido durante a leitura. Favoritos e preferências não relacionadas permanecem intactos.

## 24. Status `reviewed`

Auditoria em `AUDITORIA_STATUS_REVIEWED_SINTESES.md`:

- 8 objetos com evidência completa;
- 23 com evidência documental parcial;
- 14 perfis principais sem comprovação individual.

Nenhum status foi mudado em massa. Os 14 perfis aguardam aprovação específica para permanecerem `reviewed` ou passarem a `proposed`, pois a mudança altera fallbacks ativos.

## 25. Regressões editoriais verificadas

“Conheça o pensador”, orientação específica, livros, autoria, compartilhamento, Falta de propósito, modo claro, tablet e rolagem horizontal continuam protegidos pelos testes.

## 26. Riscos restantes

- 14 perfis principais ainda possuem trilha editorial incompleta;
- a versão hospedada depende da integração e do ciclo de publicação do repositório;
- conceitos sem metadado específico continuam dependendo dos temas existentes e da comparação determinística de texto.

## 27. Repetição inevitável

Pode ocorrer depois que todo o conjunto seguro compatível foi percorrido. No cenário automatizado de intensidade alternada houve quatro casos depois da posição 80. Em Luto intenso limpo, a primeira ocorreu na posição 11, após 10 conteúdos distintos.

## 28. Acervo

O mestre, runtime e totais permaneceram inalterados: 283 ativos, 64 núcleos, 151 contextuais e 68 gerais.

## 29. Autorias

Nenhuma autoria, fonte ou classificação editorial foi modificada.

## 30. Não duplicação

Síntese, motivação, segurança, livros, autoria e interface não foram reimplementados. Mecanismos concluídos foram apenas submetidos a integração e regressão.

## 31. Git

As fases técnicas foram executadas sem commit, push ou merge. Depois da validação final, o usuário autorizou expressamente a integração Git em 15 de julho de 2026. Os identificadores operacionais do commit e da revisão são informados no retorno final da integração.

## 32. Aprovação e publicação

A correção funcional, o estresse e o navegador real estão concluídos. A integração deve incluir somente os arquivos aprovados, preservando `.gitignore`, `README.md`, `AGENTS.md`, `css/modals-PEDRO.css`, `js/data/tales-PEDRO.js` e `js/features/tales-PEDRO.js` fora do commit.

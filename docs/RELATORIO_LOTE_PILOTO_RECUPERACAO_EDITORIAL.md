# Lote piloto — triagem de recuperação de possíveis perdas editoriais

**Data:** 22/07/2026  
**Estado:** triagem documental; não constitui restauração, publicação, correção de autoria nem decisão de qualidade.  
**Base:** mestre `definitiva-2.3`; inventário histórico `1.0.0`; `DEC-033` com preservação integral da `DEC-024`.

## 1. Objetivo e limites

Este lote recupera nove evidências históricas para decidir quais casos poderiam seguir, mediante aprovação humana, ao protocolo de verificação documental de autoria e proveniência. As transcrições exatas, inclusive pontuação, capitalização e caminhos de origem, estão em [`lote_piloto_recuperacao_editorial.json`](lote_piloto_recuperacao_editorial.json). Nenhum item foi restaurado, reativado, publicado, reescrito, movido ou reclassificado.

## 2. Estado inicial

- Branch: `agent/finaliza-loop-estabilizacao`.
- Commit: `7876aa46f264a327442aa01e6f169ea333ac6ddf`.
- O diretório já continha alterações locais e arquivos não rastreados de linhas de trabalho anteriores; eles foram preservados.
- Acervo-mestre: `definitiva-2.3`; runtime: 257 ativos.
- Inventário anterior: 350 IDs, 49 artefatos externos, 180 registros com pendências documentais.
- Constituição: `DEC-033`; proteção nominal: `NUCLEO_PRESERVACAO_EDITORIAL.md`.

## 3. Como o lote foi escolhido

Foram escolhidos nove casos, em vez de concentrar a triagem num único tipo: dois protegidos ausentes ou com versão histórica, um texto sem ID, dois textos exclusivos de patch, duas remoções cuja justificativa é completa, um conteúdo fornecido pelo editor-chefe e uma formulação com atribuição documental corrigida. `ANT-MICRO-TRI-001` e `ES-INS-VERGONHA-001` funcionam como contrapontos: não toda remoção é perda editorial.

## 4. Visão geral do lote

| Caso | ID | Estado atual | Saída histórica | Proteção | Recuperabilidade | Próxima etapa |
| --- | --- | --- | --- | --- | --- | --- |
| REC-01 | `TXT-LUT-003` | fora do mestre | arquivamento por direitos | sim | REC-A | direitos, segurança e decisão humana |
| REC-02 | sem ID | fora do mestre | desaparecimento sem explicação | candidato | REC-A | localizar linhagem/ID |
| REC-03 | `TXT-MED-004` | ativo local | fragmento desenvolvido em microtexto | sim | REC-B | direitos e duplicidade |
| REC-04 | `TXT-AMO-001` | só no patch | não integração individual localizada | não | REC-B | linhagem e avaliação editorial |
| REC-05 | `TXT-ANS-001` | só no patch | não integração individual localizada | não | REC-B | segurança e avaliação editorial |
| REC-06 | `ANT-MICRO-TRI-001` | removido | rejeição documentada | não | REC-D | nenhuma ação |
| REC-07 | `ES-INS-VERGONHA-001` | removido | correção de atribuição | não | REC-D | nenhuma ação |
| REC-08 | `TXT-CUL-001` | ativo | caso-controle de proteção | sim | REC-C | linhagem e decisão humana |
| REC-09 | `batch07-quote-011` | ativo | correção de atribuição | sim | REC-C | comparação de traduções |

## 5. Análise individual

### REC-01 — `TXT-LUT-003`, “Quando eu me for”

Texto completo preservado no Núcleo e no JSON. A revisão, fornecida pelo editor-chefe, permanece fora do mestre porque é uma adaptação relacionada ao poema “Quando eu morrer”, de Augusto Frederico Schmidt, sem autorização de direitos registrada. A saída é rastreável (`S7`), mas a ausência de publicação não equivale a descarte. O contexto da revisão está preservado; a versão original local não foi localizada. **REC-A**: investigar direitos, linhagem e segurança antes de qualquer decisão humana.

### REC-02 — texto sobre coragem, sem ID

Transcrição integral: “Existe em nós uma coragem capaz de enfrentar aquilo que tenta nos reduzir. Ela não elimina o abismo nem promete uma vida sem dor; ensina a olhar para a dificuldade e ainda afirmar a existência. Crescer não é evitar toda queda, mas descobrir uma força que antes permanecia escondida.”

Ele aparece no padrão editorial, mas não no mestre, no runtime, no patch ou sob um ID localizado. Não há autoria, fonte, data de entrada, remoção ou destino demonstrável. Isso é `S8`, não prova de erro, Nietzsche, autoria do projeto ou IA. **REC-A**: preservar a redação, localizar trajetória interna e submeter qualquer ID ou integração a decisão humana.

### REC-03 — `TXT-MED-004`, “Gaiola” / “A porta aberta”

A versão curta preservada é “Sonhamos o voo, mas tememos as alturas. Para voar é preciso amar o vazio.” A versão desenvolvida está ativa localmente como “A porta aberta”; ambas estão transcritas integralmente no JSON. A linhagem documentada associa o fragmento a Rubem Alves e registra bloqueio de publicação externa por direitos. A substituição é de formato e desenvolvimento (`S6` de linhagem), não uma autorização para duplicar ou restaurar a versão curta. **REC-B**: avaliar coexistência, direitos e duplicidade.

### REC-04 — `TXT-AMO-001`, “A presença que não invade”

Microtexto completo, de oito frases, recuperado apenas no patch `curadoria-rigida-3.1`; não há entrada atual no mestre. O patch o apresenta como “inspirado”, sem fonte textual preservada. Não foi localizada decisão individual de integração ou descarte. A evidência interna é suficiente para preservá-lo, não para atribuir autoria. **REC-B**: investigar linhagem, origem interna e valor editorial posteriormente.

### REC-05 — `TXT-ANS-001`, “A dramaturga incansável”

Microtexto completo preservado apenas no mesmo patch. Trata a antecipação ansiosa por meio da imagem de dramaturgia e ruínas; a fonte e a autoria não foram localizadas. Como trata estado vulnerável, qualquer investigação posterior também deve incluir segurança emocional. **REC-B**: investigar história de lote, autoria e segurança; não publicar.

### REC-06 — `ANT-MICRO-TRI-001`

Texto preservado: “Tem tristeza que não é profunda, é longa. Ela não afoga; umedece. Deixa tudo mais pesado, mais lento, mais cinza. Não é uma crise, é um clima.” Esteve em `ATIVO_NUCLEO` e foi retirado em 18/07/2026 junto com a Antologia do Silêncio, após confirmação humana de geração integral por IA (`DEC-029`). A retirada tem decisão, motivo, data e destino técnico. **REC-D**: conservar como evidência histórica; não avançar.

### REC-07 — `ES-INS-VERGONHA-001`

Texto preservado: “Há partes de mim que escondo por medo de que, ao serem vistas, mudem a maneira como os outros me reconhecem.” Foi retirado por `DEC-031`: o editor-chefe confirmou fabricação artificial sem base autoral; não foi encontrada passagem de Nietzsche que sustentasse a formulação. A linhagem parcial aponta para `Reflexão contemporânea-0` e uma versão intermediária não localizada. **REC-D**: conservar o histórico, sem recuperação.

### REC-08 — `TXT-CUL-001`, “O que eu não devolvi”

Caso-controle de conteúdo protegido e ainda ativo. O texto integral está no Núcleo e no mestre; foi fornecido pelo editor-chefe e revisto, mas a versão original separada não está disponível. A aprovação de preservação não prova autoria. **REC-C**: manter como evidência de proteção e investigar linhagem somente com decisão humana.

### REC-09 — `batch07-quote-011`

Texto preservado: “O medo não precisa desaparecer para perder autoridade; basta ser visto sem trono.” A frase segue ativa, ligada documentadamente à Litania contra o Medo, de *Duna*. A autoria pública foi corrigida sem reescrita em 17/07/2026. É caso de correção de atribuição (`S2`), não de perda. **REC-C**: manter como controle para o protocolo de comparação de traduções e de distinção entre inspiração e citação literal.

## 6. Comparação do lote

Há três padrões: (1) perda ou arquivamento de texto fora do mestre (`REC-01`, `REC-02`, `REC-04`, `REC-05`); (2) alterações de forma ou atribuição preservadas em linhagens (`REC-03`, `REC-09`); e (3) remoções que a evidência atual sustenta (`REC-06`, `REC-07`). O patch preserva textos completos, mas não comprova publicação nem autoria. O Núcleo preserva valor de proteção, não elegibilidade ou publicação.

## 7. Casos que não devem avançar

`REC-06` e `REC-07` têm remoções documentadas, confirmação humana e destino preservado. Eles devem permanecer rastreáveis, mas não são candidatos a recuperação nesta fase.

## 8. Casos prioritários para investigação

Prioridade de investigação, não de publicação: `REC-01` (proteção ausente e direitos), `REC-02` (texto sem ID ou trajetória), `REC-03` (linhagem e direitos), `REC-04` e `REC-05` (textos completos somente no patch).

## 9. Conteúdos que exigem decisão humana

`REC-01`, `REC-02`, `REC-03`, `REC-04`, `REC-05`, `REC-08` e `REC-09` exigem decisão humana antes de qualquer alteração. `REC-06` e `REC-07` não requerem ação adicional neste lote.

## 10. Limitações

- O Git disponível não contém todas as transições históricas individuais.
- Não foi realizada verificação externa extensa de autoria, obra ou direitos.
- Não houve OCR em massa; a análise usa evidência textual local.
- A falta de fonte não é prova de autoria, IA ou ausência de valor.

## 11. Próxima etapa

Se o editor-chefe aprovar o subconjunto, a etapa seguinte deve ser a **verificação documental de autoria e proveniência dos casos aprovados do lote piloto**, sem restauração automática.

## Garantias

- Nenhum conteúdo foi restaurado ou removido.
- Nenhuma autoria foi corrigida e nenhum texto foi reescrito.
- Nenhum ID ou runtime foi alterado ou regenerado.
- Nenhuma decisão final de publicação foi tomada.

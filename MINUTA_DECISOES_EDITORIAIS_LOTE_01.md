# Minuta humana de decisões editoriais — lote 01

## 1. Objetivo

Esta minuta transforma as evidências e recomendações dos relatórios anteriores em nove fichas revisáveis pelo editor-chefe. Ela separa **evidência**, **recomendação da IA** e **decisão humana**.

Esta minuta recebeu as decisões humanas do editor-chefe em 22/07/2026. Os mapeamentos técnicos de `MINUTA-LOT01-001` e `MINUTA-LOT01-003` foram aprovados na mesma data e convertidos no pacote `decisoes_editoriais_aprovadas_lote_01.json`.

O envio continha duas decisões para `MINUTA-LOT01-001`. A segunda, mais específica e posterior, com o título `ALTERAR A DECISÃO`, substitui a primeira para fins desta minuta. A primeira permanece preservada no histórico da conversa, mas não rege o estado final aqui registrado.

## 2. Estado inicial

| Campo | Estado conferido |
| --- | --- |
| Branch | `agent/finaliza-loop-estabilizacao` |
| Commit | `7876aa46f264a327442aa01e6f169ea333ac6ddf` |
| Data e hora do preflight | 22/07/2026, 20:21 |
| Árvore de trabalho | numerosas alterações rastreadas e não rastreadas preexistentes; todas preservadas |
| Acervo-mestre | `definitiva-2.3`; SHA-256 `a9b9688e677d2752d76dc1ccf8074490fbda1284ee14daa13f4bc38db82020d8` |
| Runtime JSON | `definitiva-2.3`; 257 ativos; SHA-256 `01a100c8e569e075a8d2008433078c121ea0f4935cf71b6d76151817be276e69` |
| Runtime JS | SHA-256 `c40a9744ad400d6176e290be4b59b6ea3213dc130cdc390f0c19d669c4274a57` |
| Casos do lote | 9 |
| Documentação suficiente para descrever o estado | 6 |
| Prontos com ressalvas | 2 |
| Bloqueados por documentação | 3 |
| Não requerem ação | 4 |
| Protegidos | 4 |
| Elegíveis agora para pacote de aplicação | 0 |

Classificação do pedido: **novo**, exclusivamente documental e sem contradição com `DEC-024` ou `DEC-033` porque nenhuma decisão é aplicada.

## 3. Fontes utilizadas

- Constituição Editorial Canônica em `PADRAO_EDITORIAL_ENTRE_SABIOS.md` e decisão `DEC-033`.
- `AGENTS.md`, `PROJECT_STATUS.md`, `DECISIONS.md` e `NUCLEO_PRESERVACAO_EDITORIAL.md`.
- `docs/INVENTARIO_HISTORICO_MAPA_PROVENIENCIA_2026-07-22.md` e `.json`.
- `docs/RELATORIO_LOTE_PILOTO_RECUPERACAO_EDITORIAL.md` e `docs/lote_piloto_recuperacao_editorial.json`.
- `docs/RELATORIO_VERIFICACAO_DOCUMENTAL_LOTE_01.md` e `docs/verificacao_documental_lote_01.json`.
- `docs/RELATORIO_PENEIRA_QUALIDADE_EDITORIAL_LOTE_01.md` e `docs/peneira_qualidade_editorial_lote_01.json`.
- Acervo-mestre e runtimes atuais, consultados somente para conferência.

Os nomes `RELATORIO_INVENTARIO_HISTORICO_E_PROVENIENCIA.md` e `inventario_historico_proveniencia.json`, citados no pedido, não existem. Foram usados os equivalentes canônicos datados, que cobrem integralmente os 350 IDs históricos.

## 4. Limitações

- Somente `REC-01`, `REC-02` e `REC-03` passaram pela verificação documental e pela peneira de qualidade completas.
- `REC-04` e `REC-05` existem apenas no patch histórico; autoria, fonte, classificação DOC/T/D/ART, qualidade e segurança ainda não foram verificadas.
- `REC-06` e `REC-07` têm fabricação artificial confirmada por decisões humanas anteriores, mas não receberam classes `ART-4` ou `DOC-K` nos relatórios. A minuta não cria essa equivalência.
- O histórico Git direto do mestre é raso.
- Direitos de `REC-01` e `REC-03` permanecem pendentes.
- Campos finais indefinidos continuam marcados como `BLOQUEADO — valor final não aprovado`.

## 5. Visão geral dos casos

| Minuta | ID | Situação | Recomendação da IA | Prontidão | Decisão humana |
| --- | --- | --- | --- | --- | --- |
| `MINUTA-LOT01-001` | `TXT-LUT-003` | integrado no mestre sob quarentena | integrar sob bloqueio público | APROVADA E APLICADA | `ALTERAR A DECISÃO` |
| `MINUTA-LOT01-002` | sem ID | fora do mestre, origem indeterminada | preservar como candidato protegido | BLOQUEADO POR ID E DESTINO | `ALTERAR A DECISÃO` |
| `MINUTA-LOT01-003` | `TXT-MED-004` | ativo contextual, protegido, direitos pendentes | manter texto; mudar posição e segurança | APROVADA E APLICADA | `APROVAR A RECOMENDAÇÃO` |
| `MINUTA-LOT01-004` | `TXT-AMO-001` | somente no patch | preservar e investigar | NOVA INVESTIGAÇÃO AUTORIZADA | `SOLICITAR NOVA INVESTIGAÇÃO` |
| `MINUTA-LOT01-005` | `TXT-ANS-001` | somente no patch | preservar e investigar segurança | NOVA INVESTIGAÇÃO AUTORIZADA | `SOLICITAR NOVA INVESTIGAÇÃO` |
| `MINUTA-LOT01-006` | `ANT-MICRO-TRI-001` | removido por `DEC-029` | manter removido | DECISÃO CONFIRMADA; SEM AÇÃO | `MANTER COMO ESTÁ` |
| `MINUTA-LOT01-007` | `ES-INS-VERGONHA-001` | removido por `DEC-031` | manter removido | DECISÃO CONFIRMADA; SEM AÇÃO | `MANTER COMO ESTÁ` |
| `MINUTA-LOT01-008` | `TXT-CUL-001` | ativo e protegido | manter sem alteração | DECISÃO CONFIRMADA; SEM AÇÃO | `MANTER COMO ESTÁ` |
| `MINUTA-LOT01-009` | `batch07-quote-011` | ativo e protegido | manter sem alteração | DECISÃO CONFIRMADA; SEM AÇÃO | `MANTER COMO ESTÁ` |

## 6. Casos prontos para decisão

Nenhum caso está inteiramente pronto para gerar pacote de aplicação. Os dois casos com documentação mais completa ainda possuem proteção, direitos ou valores técnicos finais pendentes.

## 7. Casos prontos com ressalvas

### MINUTA-LOT01-001 — `REC-01 / TXT-LUT-003`, “Quando eu me for”

#### Identificação

- Tipo atual: inexistente no mestre; formato histórico recomendado como microtexto ou reflexão contemplativa.
- Status atual: ausente do mestre e runtime; não publicado.
- Proteção: `NP-LUT-SCHMIDT-001`, Núcleo protegido para integração.
- Texto integral:

> Quando eu me for, o mundo não vai parar para se despedir — e talvez seja isso que torne tudo tão bonito. Os pássaros continuarão dizendo seus segredos ao vento. As árvores aceitarão a chuva. O sol surgirá no horizonte sem consultar a ausência que deixei. Para o universo, talvez quase nada tenha mudado. Mas eu terei estado aqui por um instante. Terei ouvido vozes, tocado rostos, atravessado manhãs comuns. Enquanto houver um sabiá cantando em algum quintal ou uma folha insistindo no galho, a vida continuará dizendo que nenhum de nós precisava sustentá-la sozinho. Um dia poderemos descansar. O mundo saberá continuar.

#### Evidência documental

- Autoria atualmente exibida: nenhuma, pois não está no mestre.
- Autoria histórica: candidata anterior “Entre Sábios”; lembrança anterior de Mário Quintana; fonte primária sustenta Augusto Frederico Schmidt como autor do poema-base.
- Obra: “Quando eu morrer”, *Revista de Antropofagia*, ano I, n. 10, p. 6.
- Classificação: `DOC-D`, `T4`, `D4`, `ART-0`.
- Comprovado: poema-base, autoria de Schmidt, publicação e relação de adaptação.
- Desconhecido: autoria da redação adaptada, versão interna anterior e autorização patrimonial.

#### Evidência editorial

- Força conceitual forte, alta especificidade, desenvolvimento completo, clareza boa e ressonância alta.
- Necessidade relevante e complementar; redundância apenas parcial.
- Risco principal: “Um dia poderemos descansar” pode aproximar morte e repouso em luto intenso.
- Adequação: Luto; Esperança contextual; somente fraca/moderada, depois de acolhimento; nunca primeira resposta.
- Q proposta: `Q-X`, com `Q-E` e `Q-H` secundárias.

#### Histórico

- Primeira localização: Núcleo, 17/07/2026.
- Última versão ativa: nenhuma localizada.
- Não houve integração; o bloqueio foi documentado por direitos e proteção.
- Recuperabilidade: `REC-A`.
- Linhagem: `NP-LUT-SCHMIDT-001` → “Quando eu morrer” → `TXT-LUT-003`.

#### Recomendação da IA

Manter protegido e fora do mestre; não integrar nem publicar enquanto direitos, segurança e decisão humana individual permanecerem pendentes.

#### Alterações exatas necessárias

Nenhuma alteração é proposta nesta minuta. Se houver futura integração, atribuição, status, associações e exclusões continuam `BLOQUEADO — valor final não aprovado`.

#### Riscos da decisão

Publicação sem direitos; falsa autoria da adaptação; alteração de protegido; romantização do descanso após a morte; quebra da linhagem.

#### Pergunta objetiva ao editor-chefe

Escolha uma opção para `MINUTA-LOT01-001`: `APROVAR A RECOMENDAÇÃO`, `REJEITAR A RECOMENDAÇÃO`, `MANTER COMO ESTÁ`, `MANTER SUSPENSO`, `SOLICITAR NOVA INVESTIGAÇÃO`, `ALTERAR A DECISÃO` ou `NÃO TENHO CERTEZA`.

### MINUTA-LOT01-003 — `REC-03 / TXT-MED-004`, “A porta aberta”

#### Identificação

- Tipo atual: `microtexto`.
- Status atual: `ATIVO_REFERENCIA_PENDENTE`; `publicationEnabled: true`; integrado localmente.
- Proteção: `NP-MED-GAIOLA-001`, linhagem protegida já integrada.
- Texto integral:

> Sonhamos com asas, mas trememos diante do céu aberto. Queremos o voo e, ao mesmo tempo, exigimos um chão que nos acompanhe até as nuvens. A liberdade assusta porque não oferece corrimão. Nada está escrito, ninguém garante o pouso, e cada escolha fecha caminhos que também poderiam ter sido nossos. Então construímos abrigos pequenos e chamamos de destino aquilo que nasceu de renúncias repetidas. As grades raramente chegam prontas; nós as forjamos em silêncio, com o metal dos adiamentos. Dizemos que desejamos a porta aberta. Quando ela finalmente se escancara, descobrimos que também era a prisão que nos protegia do desconhecido.

#### Evidência documental

- Atribuição atual: “Adaptação de trecho de Rubem Alves, em Religião e Repressão”.
- Atribuições históricas: candidata “Entre Sábios”; fragmento-base de Rubem Alves; variante de circulação atribuída a Dostoiévski sem sustentação.
- Fonte atual: *Religião e Repressão*, introdução, Loyola, 2005, p. 9.
- Classificação: `DOC-D`, `T4`, `D4`, `ART-0`.
- Comprovado: obra e autor do fragmento-base, página por fontes acadêmicas e transformação substancial.
- Desconhecido: autoria pública da adaptação, autorização patrimonial e fac-símile direto da edição-fonte.

#### Evidência editorial

- Força forte, alta especificidade, desenvolvimento progressivo, clareza boa e ressonância alta.
- Relevante e complementar; a linhagem “Gaiola” não é um segundo conteúdo.
- Risco: “nós as forjamos” pode culpar pessoas submetidas a trauma, coerção ou limites materiais.
- Adequação proposta: Medo, Insegurança e Falta de propósito contextuais; somente moderada e em posição posterior.
- Q proposta: `Q-X`, com `Q-A`, `Q-G` e `Q-H` secundárias.

#### Histórico

- Primeira localização: Núcleo, 16/07/2026.
- Última versão ativa: `definitiva-2.3`.
- O fragmento “Gaiola” foi preservado como origem da mesma linhagem; não virou conteúdo independente.
- Recuperabilidade: `REC-B`.

#### Recomendação da IA

Manter texto, formato, atribuição e proteção. Deliberar separadamente sobre posição contextual e exclusões de segurança. Manter publicação externa bloqueada.

#### Alterações exatas necessárias caso a revisão de posição seja aprovada

| Campo | Atual | Recomendação em análise | Valor aplicável |
| --- | --- | --- | --- |
| `placement` | `nucleo` | `contextual` | `BLOQUEADO — valor final não aprovado` |
| `associations[medo].placement` | `nucleo` | `contextual` | `BLOQUEADO — valor final não aprovado` |
| `hardExclusions` | `[]` | primeira resposta, crise aguda e contextos coercivos sem enquadramento | `BLOQUEADO — valor final não aprovado` |

Não existe enum técnico aprovado para todas as exclusões narrativas. A mudança de formato não é proposta e nenhuma reescrita é autorizada.

#### Riscos da decisão

Alterar conteúdo protegido; quebrar a linhagem única; culpar por restrições não escolhidas; publicar externamente sem direitos.

#### Pergunta objetiva ao editor-chefe

Escolha uma opção para `MINUTA-LOT01-003`: `APROVAR A RECOMENDAÇÃO`, `REJEITAR A RECOMENDAÇÃO`, `MANTER COMO ESTÁ`, `MANTER SUSPENSO`, `SOLICITAR NOVA INVESTIGAÇÃO`, `ALTERAR A DECISÃO` ou `NÃO TENHO CERTEZA`.

## 8. Casos bloqueados

### MINUTA-LOT01-002 — `REC-02`, texto sobre coragem sem ID

#### Identificação e texto integral

Não está no mestre, runtime ou patch; não possui ID, status, tipo, autoria ou fonte canônicos.

> Existe em nós uma coragem capaz de enfrentar aquilo que tenta nos reduzir. Ela não elimina o abismo nem promete uma vida sem dor; ensina a olhar para a dificuldade e ainda afirmar a existência. Crescer não é evitar toda queda, mas descobrir uma força que antes permanecia escondida.

#### Evidência documental

- Primeira aparição interna localizada: Constituição Editorial, 22/07/2026.
- ID histórico: não localizado.
- Atribuição anterior alegada: Nietzsche / *Assim falou Zaratustra*, sem registro sustentador.
- Classificação: `DOC-I`, `T1`, `D1`, `ART-0`.
- Há apenas afinidade temática com passagens de *Zaratustra*; não há vínculo textual ou de transformação.
- Não existe evidência de geração por IA.
- Origem, autoria, data, trajetória e unidade maior permanecem indeterminadas.

#### Evidência editorial

- Força moderada; especificidade baixa; desenvolvimento previsível; clareza alta; ressonância baixa.
- A peneira considerou o texto genérico, redundante e pressionador por associar dificuldade a crescimento e força escondida.
- Formato recomendado pela peneira: arquivo histórico, sem publicação.
- Q proposta: `Q-J`.

#### Recomendação da IA

Arquivar como evidência histórica sem atribuição ou publicação, preservando a possibilidade de nova investigação. Não apresentar como Nietzsche, inspiração em Nietzsche, texto do Entre Sábios ou conteúdo de IA.

#### Alterações exatas necessárias

| Campo | Atual | Proposto |
| --- | --- | --- |
| `contentId` | inexistente | `BLOQUEADO — valor final não aprovado` |
| destino canônico de arquivo | inexistente | `BLOQUEADO — valor final não aprovado` |

Sem esses valores, o caso não pode entrar em pacote de aplicação.

#### Riscos e prontidão

Riscos: inventar ID; falsa atribuição; transformar ausência de fonte em fabricação; publicar origem incerta. Prontidão: **BLOQUEADO POR DOCUMENTAÇÃO**.

#### Pergunta objetiva ao editor-chefe

Escolha uma opção para `MINUTA-LOT01-002`: `APROVAR A RECOMENDAÇÃO`, `REJEITAR A RECOMENDAÇÃO`, `MANTER COMO ESTÁ`, `MANTER SUSPENSO`, `SOLICITAR NOVA INVESTIGAÇÃO`, `ALTERAR A DECISÃO` ou `NÃO TENHO CERTEZA`.

### MINUTA-LOT01-004 — `REC-04 / TXT-AMO-001`, “A presença que não invade”

> A dor do outro costuma despertar duas tentações: fugir ou salvar depressa. As duas podem ser formas elegantes de não ver. Ver exige calar a frase pronta, suspender o conselho e suportar o desconforto de não ser o protagonista da cena. Há sofrimentos que não pedem solução imediata; pedem uma presença que não transforme a ferida alheia em palco para a própria bondade. Amar também é resistir à necessidade de consertar tudo. É permanecer perto sem invadir, oferecer atenção sem roubar da outra pessoa o direito de atravessar a própria noite.

- Estado real: somente no patch; ausente do mestre/runtime; não protegido.
- Histórico: não integração individual localizada; `REC-B`.
- Atribuição no patch: marcador “inspirado”, sem fonte textual.
- DOC/T/D/ART: não classificados; o piloto registra origem indeterminada.
- Qualidade, redundância e segurança: não avaliadas em peneira profunda.
- Recomendação: preservar como evidência e solicitar investigação documental/editorial; não restaurar.
- Alterações exatas: nenhuma; qualquer autoria, fonte, status ou integração está bloqueada.
- Riscos: falsa atribuição, restauração sem proveniência e proteção inventada.
- Prontidão: **BLOQUEADO POR DOCUMENTAÇÃO**.
- Pergunta: escolha `APROVAR A RECOMENDAÇÃO`, `REJEITAR A RECOMENDAÇÃO`, `MANTER COMO ESTÁ`, `MANTER SUSPENSO`, `SOLICITAR NOVA INVESTIGAÇÃO`, `ALTERAR A DECISÃO` ou `NÃO TENHO CERTEZA`.

### MINUTA-LOT01-005 — `REC-05 / TXT-ANS-001`, “A dramaturga incansável”

> A ansiedade é uma dramaturga que nunca encerra o expediente. Escreve diálogos que ninguém pronunciou, prepara despedidas para pessoas que ainda estão aqui e ensaia ruínas para acontecimentos que talvez nem cheguem. Enquanto ela ilumina o palco do futuro, o presente fica abandonado como uma casa onde ninguém acende as luzes. O corpo está sentado na sala, mas a mente já correu até o pior desfecho e voltou trazendo cinzas. Sofrer por antecipação é entregar horas reais a uma tragédia que ainda não apresentou provas de que existe.

- Estado real: somente no patch; ausente do mestre/runtime; não protegido.
- Histórico: não integração individual localizada; `REC-B`.
- Atribuição no patch: marcador “inspirado”, sem fonte textual.
- DOC/T/D/ART: não classificados; o piloto registra origem indeterminada.
- Qualidade e segurança: não avaliadas; o tema vulnerável exige revisão própria.
- Recomendação: preservar como evidência e solicitar investigação documental, editorial e de segurança; não restaurar.
- Alterações exatas: nenhuma; qualquer autoria, fonte, status, associação ou integração está bloqueada.
- Riscos: falsa atribuição, restauração sem proveniência e dano emocional em contexto de ansiedade.
- Prontidão: **BLOQUEADO POR DOCUMENTAÇÃO**.
- Pergunta: escolha `APROVAR A RECOMENDAÇÃO`, `REJEITAR A RECOMENDAÇÃO`, `MANTER COMO ESTÁ`, `MANTER SUSPENSO`, `SOLICITAR NOVA INVESTIGAÇÃO`, `ALTERAR A DECISÃO` ou `NÃO TENHO CERTEZA`.

## 9. Conteúdos protegidos

| Minuta | Linhagem/grupo | Estado atual | Ação proposta | Impacto na proteção | Autorização necessária |
| --- | --- | --- | --- | --- | --- |
| `001` | `NP-LUT-SCHMIDT-001` | protegido fora do mestre | manter protegido | nenhum | nominal individual; direitos antes de integração |
| `003` | `NP-MED-GAIOLA-001` | protegido e ativo local | manter proteção | nenhum nesta minuta | nominal individual para associações/publicação |
| `008` | `NP-CUL-001` | protegido e ativo | manter sem alteração | nenhum | nominal individual para qualquer mudança |
| `009` | `NP-MED-DUNA-001` | Núcleo ativo | manter sem alteração | nenhum | nominal individual para qualquer mudança |

Aprovação genérica do lote não autoriza alteração desses quatro casos.

## 10. Conteúdos valiosos com proveniência pendente

O texto de coragem possui proveniência pendente, mas a peneira não o considerou editorialmente necessário; por isso não foi rotulado automaticamente como “valioso”. `TXT-AMO-001` e `TXT-ANS-001` preservam textos integrais no patch, mas ainda não passaram pela avaliação necessária. Nenhum dos três recebe autoria, integração ou publicação nesta minuta.

## 11. Conteúdos artificiais comprovados

### MINUTA-LOT01-006 — `ANT-MICRO-TRI-001`

> Tem tristeza que não é profunda, é longa. Ela não afoga; umedece. Deixa tudo mais pesado, mais lento, mais cinza. Não é uma crise, é um clima.

- Estado atual conferido: `REMOVIDO`, `publicationEnabled: false`; presente somente como histórico no mestre.
- Estado anterior: `ATIVO_NUCLEO`, Tristeza/núcleo.
- Evidência: confirmação do editor-chefe de geração integral da Antologia por IA; `DEC-029`.
- Classificação do piloto: `IA-C`; os relatórios não atribuíram `ART-4` ou `DOC-K`.
- Qualidade permanece separada e não foi reavaliada.
- Recomendação: não realizar ação; preservar ID, texto, metadados, decisão e histórico.
- Alterações exatas: nenhuma.
- Prontidão: **NÃO REQUER AÇÃO**.
- Pergunta: escolha `MANTER COMO ESTÁ`, `SOLICITAR NOVA INVESTIGAÇÃO`, `ALTERAR A DECISÃO` ou `NÃO TENHO CERTEZA`; as demais opções permanecem disponíveis no formulário completo.

### MINUTA-LOT01-007 — `ES-INS-VERGONHA-001`

> Há partes de mim que escondo por medo de que, ao serem vistas, mudem a maneira como os outros me reconhecem.

- Estado atual conferido: `REMOVIDO`, `publicationEnabled: false`; presente somente como histórico no mestre.
- Estado anterior: `ATIVO_NUCLEO`, Insegurança/núcleo, crédito integral ao Entre Sábios.
- Evidência: fabricação artificial sem base autoral confirmada pelo editor-chefe; `DEC-031`.
- Linhagem: `Reflexão contemporânea-0` → `Reflexão contemporânea-3` → `ES-INS-VERGONHA-001`; versão intermediária incompleta.
- Classificação do piloto: `IA-C`; os relatórios não atribuíram `ART-4` ou `DOC-K`.
- Recomendação: não realizar ação; preservar histórico e não restaurar autoria institucional.
- Alterações exatas: nenhuma.
- Prontidão: **NÃO REQUER AÇÃO**.
- Pergunta: escolha `MANTER COMO ESTÁ`, `SOLICITAR NOVA INVESTIGAÇÃO`, `ALTERAR A DECISÃO` ou `NÃO TENHO CERTEZA`; as demais opções permanecem disponíveis no formulário completo.

## 12. Duplicatas

Nenhuma duplicata foi proposta para remoção. O inventário encontrou zero grupos de igualdade normalizada.

`TXT-MED-004` e o fragmento “Gaiola” são a mesma linhagem editorial: o fragmento permanece como origem histórica, não como segundo conteúdo. `batch07-quote-011` e `TXT-MED-002` coexistem por decisão anterior porque frase contextual e microtexto de núcleo têm desenvolvimento e função diferentes.

## 13. Mudanças de formato

- `TXT-LUT-003`: microtexto/reflexão é recomendação editorial; não existe mudança aplicável enquanto integração e texto final não estiverem aprovados.
- Texto de coragem: arquivo histórico recomendado; nenhum ID ou destino canônico aprovado.
- `TXT-MED-004`: manter microtexto; nenhuma reescrita.
- `TXT-AMO-001` e `TXT-ANS-001`: textos finais históricos existem, mas origem, qualidade e segurança ainda bloqueiam qualquer integração.
- Demais casos: nenhuma mudança de formato proposta.

## 14. Caso do texto sobre coragem

Resumo objetivo para decisão humana:

- Localizado apenas na Constituição e nos relatórios derivados.
- Nenhum ID localizado.
- Nenhuma atribuição canônica atual.
- Nenhum vínculo textual com Nietzsche ou *Assim falou Zaratustra*; apenas afinidade temática.
- Nenhuma evidência de IA (`ART-0`).
- Origem indeterminada (`DOC-I`, `T1`, `D1`).
- A peneira registrou força moderada, baixa especificidade, forte redundância e risco de pressão por crescimento.
- Formato recomendado: arquivo histórico, não publicação.
- Decisão necessária: arquivo histórico, preservação para investigação, manutenção suspensa ou nova pesquisa; qualquer aplicação permanece bloqueada por ausência de ID e destino.

## 15. Casos que não requerem ação adicional

### MINUTA-LOT01-008 — `TXT-CUL-001`, “O que eu não devolvi”

Texto integral:

> Eu sempre fui honesto do meu jeito. Deixava uma placa invisível pendurada em mim: não espere muito. Relacionamento sério, compromisso, casamento — eu fugia antes que essas palavras criassem raízes. Durante anos, chamei isso de liberdade. Ultimamente comecei a olhar para trás e vi o desequilíbrio: o tanto de cuidado, afeto e preocupação que recebi, e o quase nada que devolvi. Eu achava que estava ganhando. Tenho algumas coisas, espaço, autonomia, dias que não precisam dar satisfação. Mas a calma não veio junto. E sem calma interna, o resto vira maquiagem. Então uma pergunta continua me seguindo: do que exatamente eu me protegi — e quanto amor deixei do lado de fora junto com o perigo?

- Atual: `ATIVO_NUCLEO`, microtexto, publicado localmente, “Adaptação de texto de autoria preservada”.
- Proteção: `NP-CUL-001`.
- Histórico: integração individual sem reescrita; versão original separada não localizada.
- Documentação/qualidade do lote: caso-controle; não passou pelos protocolos completos dos três casos priorizados.
- Recomendação: manter sem alteração.
- Alterações exatas: nenhuma.
- Prontidão: **NÃO REQUER AÇÃO**.

### MINUTA-LOT01-009 — `batch07-quote-011`

> O medo não precisa desaparecer para perder autoridade; basta ser visto sem trono.

- Atual: `ATIVO_CONTEXTUAL`, frase, publicada localmente.
- Atribuição: “Autoria preservada — inspirado na Litania contra o Medo, de Frank Herbert”.
- Fonte: *Duna*, Aleph, 2010, tradução de Maria do Carmo Zanini, p. 14.
- Proteção: Núcleo ativo `NP-MED-DUNA-001`.
- Histórico: autoria corrigida sem reescrita; formulação local não é citação literal.
- Recomendação: manter sem alteração.
- Alterações exatas: nenhuma.
- Prontidão: **NÃO REQUER AÇÃO**.

Para `MINUTA-LOT01-008` e `009`, escolha `MANTER COMO ESTÁ`, `SOLICITAR NOVA INVESTIGAÇÃO`, `ALTERAR A DECISÃO` ou `NÃO TENHO CERTEZA`, ou use outra opção do formulário completo.

## 16. Decisões humanas registradas

Editor-chefe: Pedro  
Data: 22/07/2026

| Minuta | Decisão registrada | Efeito nesta etapa |
| --- | --- | --- |
| `001` | `ALTERAR A DECISÃO` | integração nominalmente autorizada; aplicação aguarda aprovação técnica final |
| `002` | `ALTERAR A DECISÃO` | texto preservado; Nietzsche/Zaratustra e autoria institucional vedados; ID e destino continuam bloqueados |
| `003` | `APROVAR A RECOMENDAÇÃO` | texto preservado; mudança técnica aguarda aprovação final |
| `004` | `SOLICITAR NOVA INVESTIGAÇÃO` | investigação autorizada; restauração vedada |
| `005` | `SOLICITAR NOVA INVESTIGAÇÃO` | investigação autorizada; restauração vedada |
| `006` | `MANTER COMO ESTÁ` | permanece removido e preservado |
| `007` | `MANTER COMO ESTÁ` | permanece removido e preservado |
| `008` | `MANTER COMO ESTÁ` | permanece ativo e protegido, sem alteração |
| `009` | `MANTER COMO ESTÁ` | permanece ativo, protegido e contextual, sem alteração |

As notas decisórias foram consolidadas em `cases[*].humanNotes` no JSON auditável, e o registro fiel é preservado abaixo. Nenhuma decisão foi convertida em pacote de aplicação.

### 16.1 Registro fiel das decisões

Para auditoria, prevalecem as decisões consolidadas abaixo.

- `MINUTA-LOT01-001` — `ALTERAR A DECISÃO`: integrar “Quando eu me for” como `TXT-LUT-003` no acervo canônico, sem reescrita, redução ou expansão; microtexto contemplativo; atribuição pública “Adaptação de ‘Quando eu morrer’, de Augusto Frederico Schmidt — autoria da adaptação não identificada.”; nunca atribuir a Mário Quintana, ao Entre Sábios ou como citação literal de Schmidt; curadoria separada; preservar poema-base, publicação, relação de adaptação, autoria desconhecida, atribuições anteriores, limitações e direitos; proteger, bloquear publicação externa e vedar remoção ou reescrita automática; Luto principal, Esperança contextual, placement contextual, fraca/moderada, nunca primeira resposta, luto intenso, crise aguda ou ideação suicida; registrar o risco morte/descanso; contemplação e reenquadramento; tom poético e contemplativo. A aplicação depende do mapeamento para valores já válidos e de aprovação técnica final.
- `MINUTA-LOT01-002` — `ALTERAR A DECISÃO`: preservar integralmente como conteúdo com proveniência pendente e candidato protegido; retirar e nunca reutilizar Nietzsche ou *Assim falou Zaratustra*; não atribuir ao Entre Sábios; não publicar; não inventar ID nem destino técnico.
- `MINUTA-LOT01-003` — `APROVAR A RECOMENDAÇÃO`: manter texto, microtexto, atribuição como adaptação e proteção; bloquear publicação externa enquanto direitos estiverem pendentes; aprovar futura mudança de núcleo para contextual e exclusões de primeira resposta, crise aguda e coerção depois da definição dos valores técnicos válidos; não reescrever.
- `MINUTA-LOT01-004` — `SOLICITAR NOVA INVESTIGAÇÃO`: forte candidato à recuperação; preservar exatamente o texto histórico; verificar documentação, qualidade, redundância e segurança; não atribuir nem restaurar sem evidência.
- `MINUTA-LOT01-005` — `SOLICITAR NOVA INVESTIGAÇÃO`: preservar exatamente o texto histórico; investigar origem, autoria, possível produção em lote, qualidade, redundância e segurança para ansiedade; eventual aprovação apenas contextual e moderada, nunca primeira resposta ou crise intensa; não restaurar agora.
- `MINUTA-LOT01-006` — `MANTER COMO ESTÁ`: manter removido; preservar integralmente ID, texto, metadados, decisão e histórico; não restaurar, atribuir ao Entre Sábios ou gerar substituto automático.
- `MINUTA-LOT01-007` — `MANTER COMO ESTÁ`: manter removido e preservar a linhagem; não restaurar autoria institucional nem reaproveitar automaticamente.
- `MINUTA-LOT01-008` — `MANTER COMO ESTÁ`: manter ativo, protegido, no formato atual e sem reescrita; preservar autoria protegida e linhagem.
- `MINUTA-LOT01-009` — `MANTER COMO ESTÁ`: manter ativo, protegido e contextual; preservar como formulação inspirada na Litania contra o Medo, não citação literal; não fundir com o microtexto relacionado.

Registro de precedência: a primeira formulação recebida para `001` (“MANTER ativo”, preservando fora da integração enquanto pendências permanecessem) foi substituída no mesmo envio pela decisão posterior e detalhada acima, que autoriza a integração sob bloqueio público e exige aprovação técnica final.

## 17. Mapeamento técnico para aprovação final

### 17.1 `MINUTA-LOT01-001 / TXT-LUT-003`

O ID `TXT-LUT-003` não aparece como `id` nem como `legacyId` de outro conteúdo no acervo-mestre atual. O estado proposto usa somente valores existentes no catálogo canônico.

| Campo exato | Valor proposto |
| --- | --- |
| `id` | `TXT-LUT-003` |
| `originalText` / `finalText` | texto histórico integral, idêntico ao registrado nesta minuta |
| `displayType` | `microtexto` |
| `attributionType` | `paraphrase` |
| `author` | `Autoria não identificada` |
| `displayedAuthor` | `Adaptação de ‘Quando eu morrer’, de Augusto Frederico Schmidt — autoria da adaptação não identificada.` |
| `inspirationSource` | `Augusto Frederico Schmidt` |
| `authorGender` | `unknown` |
| `primaryFeeling` | `luto` |
| `secondaryFeeling` | `esperanca` |
| `placement` | `contextual` |
| `associations` | `luto/contextual`; `esperanca/contextual` |
| `editorialFunction` | `contemplation` |
| `secondaryFunction` | `reframing` |
| `suitableIntensities` | `fraca`, `moderada` |
| `tone` | `poetico` — a função contemplativa fica registrada em `editorialFunction` |
| `themes` | `[]` — nenhum tema livre novo será inventado |
| `riskTags` | `romantizacao_do_sofrimento` |
| `hardExclusions` | `primeira_resposta`, `perda_recente`, `luto_intenso` |
| `status` | `QUARENTENA_DOCUMENTAL` |
| `publicationEnabled` | `false` |
| `derivedFromId` / `duplicateOf` | `null` / `null` |
| `changeType` | `integracao_individual_aprovada` |
| `humanReviewRequired` | `true` |
| `lastReviewedAt` | `2026-07-22` |
| `filterGender` / `inspirationGender` | `unknown` / `male` |

Fonte estruturada proposta:

| Subcampo | Valor |
| --- | --- |
| `source.title` | `Quando eu morrer` |
| `source.section` | string vazia |
| `source.edition` | `Revista de Antropofagia, ano I, número 10` |
| `source.publisher` | string vazia — não inventar editora |
| `source.year` | `1929` |
| `source.translator` | string vazia |
| `source.page` | `6` |
| `source.status` | `verified` |
| `source.notes` | registrar poema-base, relação documental de adaptação, autoria não identificada da adaptação, direitos pendentes, separação da curadoria e risco morte/descanso |

Proteção: manter `NP-LUT-SCHMIDT-001` no registro de preservação, vedando remoção ou reescrita automática. O contrato do item não possui campo individual de proteção; por isso essa garantia não será inventada dentro do registro do conteúdo.

Restrições ainda sem enum técnico:

- crise aguda;
- contexto relacionado a ideação suicida;
- distribuição em páginas de SEO ou materiais promocionais, que é uma regra de publicação externa, não um campo do item.

`publicationEnabled: false` e `QUARENTENA_DOCUMENTAL` impedem o item de entrar no runtime público atual. As restrições sem enum permanecem também como regra editorial textual; não foram substituídas por valores aproximados.

### 17.2 `MINUTA-LOT01-003 / TXT-MED-004`

Campos preservados integralmente: texto, formato `microtexto`, atribuição, fonte, autoria técnica e proteção `NP-MED-GAIOLA-001`.

| Campo exato | Atual | Valor proposto |
| --- | --- | --- |
| `placement` | `nucleo` | `contextual` |
| `associations[feeling=medo].placement` | `nucleo` | `contextual` |
| `hardExclusions` | `[]` | `primeira_resposta`, `medo_intenso` |

`medo_intenso` é o único sinal existente que cobre a situação aguda dentro do sentimento principal deste conteúdo. Não existem enums genéricos para “crise aguda” nem para “contextos de coerção”; essas duas restrições permanecem registradas como bloqueios narrativos e não são tratadas como tecnicamente resolvidas.

### 17.3 Formulário de aprovação técnica final

```text
APROVAÇÃO TÉCNICA FINAL — LOTE 01

Editor-chefe: Pedro
Data:

MINUTA-LOT01-001
Mapeamento técnico: APROVAR / ALTERAR / REJEITAR
Notas:

MINUTA-LOT01-003
Mapeamento técnico: APROVAR / ALTERAR / REJEITAR
Notas:
```

Mapeamentos aprovados por Pedro em 22/07/2026. O pacote foi criado e a aplicação controlada foi registrada em `RELATORIO_APLICACAO_DECISOES_EDITORIAIS_LOTE_01.md` e `aplicacao_decisoes_editoriais_lote_01.json`.

## 18. O que acontecerá depois

Somente decisões humanas individuais, inequívocas e compatíveis com o estado atual poderão ser convertidas, em tarefa separada, em `decisoes_editoriais_aprovadas_lote_01.json`.

Casos bloqueados não entrarão no pacote até que a documentação ou o valor final faltante seja resolvido. Conteúdo protegido exige autorização nominal específica; uma aprovação genérica do lote não basta. A criação do pacote não autoriza aplicação, commit ou publicação.

## 19. Matriz de conformidade

| Exigência | Ação realizada | Evidência | Estado | Limitação |
| --- | --- | --- | --- | --- |
| Nenhum conteúdo alterado | somente os dois arquivos de minuta foram criados | hashes do mestre e diff final | COMPROVADO | árvore já estava suja |
| Nenhum runtime alterado | runtimes consultados apenas para leitura; build não executado | hashes antes/depois | COMPROVADO | nenhuma |
| Decisões humanas registradas sem aplicação | nove decisões preenchidas; pacote continua não aprovado | JSON `humanReview`, `humanDecision` e `isApproved: false` | COMPROVADO | 001 e 003 aguardam aprovação técnica final |
| Nenhuma autoria inventada | desconhecidos e atribuições históricas foram distinguidos | fichas documentais | COMPROVADO | nenhuma |
| Todos os casos vieram dos relatórios | reproduzidos `REC-01` a `REC-09` | lote piloto e JSON | COMPROVADO | só três têm protocolos posteriores |
| Valores atuais conferidos no mestre | oito IDs consultados; ausências e texto sem ID verificados | seções 7, 8, 11 e 15 | COMPROVADO | três permanecem externos ao mestre |
| Bloqueios preservados | direitos, proteção, documentação e valores finais continuam explícitos | seções 7 a 10 | COMPROVADO | nenhuma |
| Protegidos sinalizados | quatro linhagens e autorizações necessárias registradas | seção 9 | COMPROVADO | nenhuma |
| Arquivos de saída corretos | somente Markdown e JSON da minuta | diff final | COMPROVADO | nenhuma |
| Condição de parada | nenhum pacote aprovado ou aplicação iniciado | seções 17 e 18 | COMPROVADO | aguarda aprovação técnica final de 001 e 003 |

## 20. Validações executadas

- Os nove textos integrais foram encontrados tanto no Markdown quanto no JSON.
- Os oito IDs conhecidos foram conferidos no mestre; `TXT-LUT-003`, `TXT-AMO-001` e `TXT-ANS-001` permanecem ausentes, e o texto de coragem não possui ocorrência integral no mestre.
- `npm run test:changed -- MINUTA_DECISOES_EDITORIAIS_LOTE_01.md minuta_decisoes_editoriais_lote_01.json` selecionou o grupo `governance`, mas o lançador interno não iniciou o subprocesso no Windows.
- `npm run test:governance`: 11 de 11 testes aprovados.
- Governança: 33 decisões e fontes vivas consistentes.
- Allowlist de publicação: 136 arquivos públicos válidos; mestre, testes e relatórios excluídos.
- Análise estática: 115 arquivos JS/MJS e 18 JSON válidos.
- Conteúdo: `definitiva-2.3`, 257 ativos, runtime sincronizado sem escrita.
- Verificação integral: 297 de 298 testes aprovados.
- Falha conhecida e preexistente: `tests/canonical-contracts.test.mjs` encontrou o marcador `definitiva-2.3-20260718-cache-fix-1` no HTML, enquanto o contrato espera `definitiva-2.3`. Nenhum arquivo relacionado foi alterado nesta tarefa.
- Os hashes do mestre e dos dois runtimes permaneceram idênticos aos do preflight.

## Garantias de encerramento

- Esta é apenas uma minuta.
- As nove decisões humanas foram registradas; nenhuma foi aplicada ao acervo.
- `approvedBy` e `approvedAt` permanecem vazios e `isApproved` permanece `false` porque o pacote integral ainda depende da aprovação técnica final de 001 e 003.
- Nenhum pacote de aplicação foi criado.
- Nenhum conteúdo, autoria, fonte, ID, status, associação, proteção ou texto foi alterado.
- Nenhum runtime foi gerado ou editado.
- Nenhuma aplicação, commit, merge, push ou publicação foi iniciada.
- O processo para aqui e aguarda a aprovação ou alteração dos mapeamentos técnicos de 001 e 003.

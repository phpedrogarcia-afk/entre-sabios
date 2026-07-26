# Inventário histórico e mapa de proveniência — Entre Sábios

**Data:** 22/07/2026  
**Estado:** concluído como inventário documental; nenhuma aplicação editorial autorizada  
**Base:** definitiva-2.4; 351 IDs históricos; 257 ativos e 94 inativos  
**Decisões preservadas:** `DEC-024`, `DEC-029`, `DEC-030`, `DEC-031` e `DEC-033`

## Escopo e limite

Este mapa reúne o mestre local, o dossiê A–J, o Núcleo de Preservação, o histórico Git disponível, bases legadas, lotes, relatórios de rejeição e o patch de curadoria localizado. Ele não altera nem interpreta novamente as decisões individuais: reproduz o que já está registrado e indica onde cada evidência pode ser encontrada.

Não houve peneira, recuperação, restauração, suspensão, remoção, publicação, reescrita, mudança de autoria, migração de metadados ou modificação do algoritmo. A ausência de evidência continua significando incerteza documentada.

## Fontes e autoridade

| Camada | Fonte | Papel |
| --- | --- | --- |
| comportamento executável | `entre_sabios_acervo_mestre_final.json` | fonte canônica do conteúdo e estado atuais |
| decisões duradouras | `DECISIONS.md` | autoridade para decisões já aprovadas |
| estado vivo | `PROJECT_STATUS.md` | estado e pendências atuais |
| proteção nominal | `NUCLEO_PRESERVACAO_EDITORIAL.md` | cadastro canônico dos protegidos |
| evidência individual A–J | `docs/AUDITORIA_PROVENIENCIA_COMPLETA_2026-07-18.json` | classificações e decisões registradas; não recalculadas aqui |
| histórico | `Git, bases legadas, lotes, relatórios e patch` | pistas e versões; não autorizam aplicação |

## Resultado de cobertura

| Medida | Total |
| --- | ---: |
| historicalRecords | 351 |
| activeRecords | 257 |
| inactiveRecords | 94 |
| baselineRecords | 344 |
| protectedMasterRecords | 5 |
| nonMasterArtifacts | 48 |
| withBaseline | 344 |
| withoutBaseline | 7 |
| withLegacyEvidence | 173 |
| withPatchEvidence | 290 |
| withExplicitLineageLink | 10 |
| unresolvedRecords | 181 |

O inventário individual completo está em `docs/INVENTARIO_HISTORICO_MAPA_PROVENIENCIA_2026-07-22.json`. Cada um dos 351 registros contém estado atual, hash do texto, atribuição e fonte atuais, vínculos de linhagem, presença no mestre Git original, categoria A–J já registrada, evidência de fabricação, passagem sustentadora, decisão anterior, confiança, proteção, camada mais antiga localizada, arquivos de evidência e pendências documentais.

## Camadas históricas localizadas

- O histórico Git disponível contém 1 commit(s) que tocaram diretamente o mestre. O mais antigo localizado é `573cbba6b6685391103e5e64a08a386d77a847f8`, de 2026-07-13, com 344 registros.
- 344 IDs atuais já estavam nesse mestre consolidado; 7 entraram ou foram formalizados depois na árvore de trabalho local.
- 173 IDs possuem ocorrência nas bases legadas de `js/data/quotes/`.
- 290 IDs aparecem no patch `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch`.
- 10 registros possuem `legacyIds`, `derivedFromId` ou `duplicateOf` explícito.
- O dossiê A–J cobre os 351 IDs e permanece a autoridade das categorias; este mapa não as recalcula.

## Proveniência por categoria já registrada

| Categoria | Total |
| --- | ---: |
| A | 3 |
| B | 15 |
| C | 1 |
| D | 4 |
| E | 76 |
| G | 160 |
| I | 32 |
| J | 60 |

Categorias B, C, D e G mantêm suas limitações documentais. Categoria G não significa IA. Categoria I continua restrita às confirmações humanas registradas; categoria J permanece rejeição histórica, não prova automática de fabricação.

## Artefatos fora do mestre atual

| Referência | Natureza | Evidência | Tratamento |
| --- | --- | --- | --- |
| NP-CUL-001 | conteúdo ou linhagem protegida fora do mestre atual | `NUCLEO_PRESERVACAO_EDITORIAL.md` | preservar; investigação e eventual integração exigem decisão individual |
| NP-ESP-DAWKINS-001 | conteúdo ou linhagem protegida fora do mestre atual | `NUCLEO_PRESERVACAO_EDITORIAL.md` | preservar; investigação e eventual integração exigem decisão individual |
| NP-LUT-SCHMIDT-001 | conteúdo ou linhagem protegida fora do mestre atual | `NUCLEO_PRESERVACAO_EDITORIAL.md` | preservar; investigação e eventual integração exigem decisão individual |
| NP-MED-DUNA-001 | conteúdo ou linhagem protegida fora do mestre atual | `NUCLEO_PRESERVACAO_EDITORIAL.md` | preservar; investigação e eventual integração exigem decisão individual |
| NP-MED-GAIOLA-001 | conteúdo ou linhagem protegida fora do mestre atual | `NUCLEO_PRESERVACAO_EDITORIAL.md` | preservar; investigação e eventual integração exigem decisão individual |
| TXT-AMO-001 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-AMO-002 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-AMO-003 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-AMO-004 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-ANS-001 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-ANS-002 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-ANS-003 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-ANS-004 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-AUT-001 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-AUT-002 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-AUT-003 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-CON-001 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-CON-002 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-CON-003 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-CON-004 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-CUL-002 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-CUL-003 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-ESP-001 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-ESP-003 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-INS-001 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-INS-003 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-INS-004 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-INS-005 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-LUT-001 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-LUT-002 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-LUT-004 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-PRO-001 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-PRO-002 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-PRO-003 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-RAI-001 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-RAI-002 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-RAI-003 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-SAU-001 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-SAU-002 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-SAU-003 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-SOL-001 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-SOL-002 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-SOL-003 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-TRI-001 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-TRI-002 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-TRI-003 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| TXT-TRI-004 | ID presente no patch histórico e ausente do mestre atual | `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | registrar como pista histórica; não restaurar automaticamente |
| microtexto “Existe em nós uma coragem...” (sem ID localizado) | conteúdo fornecido para a Constituição e ainda não localizado no repositório | `PADRAO_EDITORIAL_ENTRE_SABIOS.md` | proveniência pendente; não atribuir, publicar, remover ou criar ID automaticamente |

Esses artefatos não recebem ID novo, integração, restauração ou publicação por efeito deste inventário.

## Impressões digitais da versão inventariada

| Arquivo | SHA-256 |
| --- | --- |
| Mestre | `be72c04474e85ac27a26313bb23ba2dca10ab50f8fd6cf102d4e78599b46365e` |
| Runtime JSON | `570de4f538866d97b309e150050374374c4652c1dd95349d347dd169fe8ada73` |
| Runtime JS | `8c57eee32c3b8e7eab28132976800c6c988a0492e2a49a49a756a45761f73280` |
| Dossiê A–J | `f7c8db074cc403f422524a8cf08f9b7f750d78e9ff9cb0aeec02fdecec26623c` |
| Patch de curadoria | `f0281f8a7d090838805313286436518ffea9c99e8e1d8befb7e8e6a46e0e2c76` |

## Pendências reveladas, sem aplicação

- 181 registros mantêm ao menos uma pendência documental derivada da categoria A–J ou da proteção nominal.
- Conteúdos protegidos fora do mestre permanecem no Núcleo e exigem decisão individual.
- O microtexto “Existe em nós uma coragem...” continua sem ID e sem localização documental no repositório.
- O histórico Git do mestre é raso: somente 1 commit(s) direto(s) foi(ram) localizado(s); bases legadas e o patch complementam a evidência, sem substituí-la.
- A próxima etapa possível é escolher, mediante autorização separada, um lote limitado para investigação de proveniência. Este inventário não escolhe o lote nem inicia a investigação.

## 1. Estado da auditoria

- Branch: `agent/finaliza-loop-estabilizacao`; commit: `7876aa46f264a327442aa01e6f169ea333ac6ddf`.
- Constituição confirmada: seção canônica no padrão, `DEC-033`, referência operacional em `AGENTS.md`, `DEC-024` preservada e `NUCLEO_PRESERVACAO_EDITORIAL.md` presente.
- Escopo: preservação e auditoria interna. Nenhuma decisão individual foi tomada.

## 2. Fontes consultadas

- Canônicas: mestre, decisões, estado vivo, padrão, Núcleo e `AGENTS.md`.
- Geradas: runtime JSON e JS, usados somente para comparação por hash e contagem.
- Históricas: Git, patch, bases legadas, dossiê A–J, relatórios e arquivos de rejeição.
- Auxiliares: testes, documentos e arquivos paralelos referidos na lista de evidências do JSON. Não houve OCR em massa nem pesquisa externa nova.

## 3. Estado atual do acervo

| Indicador | Total |
| --- | ---: |
| Itens no mestre | 351 |
| Ativos | 257 |
| Inativos ou removidos | 94 |
| Protegidos presentes no mestre | 5 |
| Sem fonte documental verificada | 310 |

As distribuições por formato, status, atribuição e fonte estão no JSON em `distributions`; campos não existentes no mestre não foram preenchidos por inferência.

## 4. Linha temporal do acervo

| Commit | Data | Autor | Mensagem | Itens | Adicionados | Removidos |
| --- | --- | --- | --- | ---: | ---: | ---: |
| `573cbba` | 2026-07-13 | phpedrogarcia-afk | Integra acervo definitivo ao runtime do site | 344 | 344 | 0 |

## 5. Conteúdos historicamente removidos

Foram registrados 94 itens atualmente inativos ou removidos. Cada caso preserva status, decisão já existente, evidências e grau provisório de rastreabilidade no JSON. A data da primeira remoção e a última versão ativa permanecem indeterminadas quando não há transição correspondente no Git acessível.

## 6. IDs alterados ou reutilizados

55 IDs têm diferença em relação à linha de base Git localizada ou entrada posterior a ela. A comparação de texto, autoria, atribuição, fonte, tipo, status, publicação e sentimentos está em `changedIds`. Nenhuma reutilização é declarada sem evidência direta.

## 7. Linhagens editoriais

10 linhagens explícitas foram montadas somente a partir de `legacyIds`, `derivedFromId`, `duplicateOf`, proteção nominal ou outra relação declarada. Não foram agrupados textos por mera semelhança temática.

## 8. Lotes de integração

11 agrupamentos foram identificados por `originalCollection` ou ausência explícita desse campo. Cada lote informa IDs, formatos, atribuições, evidência e grau L provisório; repetição formal não é prova de geração automática.

## 9. Mudanças de autoria e fonte

44 casos apresentam diferença entre a linha de base acessível e o estado atual em autoria, atribuição ou fonte. O relatório apenas aponta os campos; não escolhe qual versão é correta.

## 10. Conteúdos protegidos

O Núcleo contém 10 referências ou linhagens; 5 correspondem a IDs presentes no mestre e 5 permanecem fora dele. Divergências, se houver, estão explicitadas em `protectedContents`.

## 11. Conteúdos encontrados fora do acervo ativo

48 evidências externas foram preservadas em `externalHistoricalContents`, incluindo o microtexto “Existe em nós uma coragem...”, sem ID localizado. Elas são pistas, não restaurações.

## 12. Duplicatas e proximidade textual

Foram encontrados 0 grupos de igualdade após normalização. Não foram produzidos grupos de proximidade semântica, porque isso exigiria julgamento ou investigação adicional.

## 13. Conflitos e inconsistências

176 casos permanecem abertos por proveniência documental incompleta ou indeterminada. A fonte de maior autoridade e as evidências foram registradas no JSON; nenhuma divergência foi resolvida silenciosamente.

## 14. Possíveis perdas editoriais

Os 94 itens inativos/removidos e os 48 artefatos externos formam o conjunto de candidatos à investigação futura. Prioridade, se necessária, deverá ser decidida pelo editor-chefe; este inventário não a converte em aprovação.

## 15. Casos sem justificativa de remoção

Casos sem motivo individual localizado estão assinalados como R3 provisório. Não foram classificados como erro editorial e não geram restauração automática.

## 16. Limitações da auditoria

- Histórico Git direto do mestre disponível é raso; transições individuais podem não estar acessíveis.
- Imagens foram somente registradas quando há caminho ou referência textual; não houve OCR em massa.
- Autoria e fonte externas não foram pesquisadas novamente.
- Relações sem campo ou evidência documental permanecem indeterminadas.

## 17. Próxima etapa recomendada

Após aprovação humana deste relatório, propor um lote-piloto de 8 a 12 casos para **recuperação de possíveis perdas editoriais**, ainda sem aplicar restaurações automaticamente. O lote deve combinar um protegido externo, uma remoção documentada, um caso R3, uma linhagem explícita, um lote parcialmente documentado, uma duplicata normalizada e o microtexto de coragem sem ID, se a localização interna for encontrada.

## 18. Mapa de arquivos e responsabilidades

| Caminho | Função | Autoridade | Estado | Risco |
| --- | --- | --- | --- | --- |
| `entre_sabios_acervo_mestre_final.json` | fonte canônica do acervo | canônica | ativo | não editar nesta auditoria |
| `data/entre_sabios_runtime.json` | runtime derivado | gerada | ativo | não é fonte histórica principal |
| `data/entre_sabios_runtime.js` | runtime derivado | gerada | ativo | não é fonte histórica principal |
| `NUCLEO_PRESERVACAO_EDITORIAL.md` | proteção nominal | canônica para proteção | ativo | proteção não implica publicação |
| `js/data/quotes/` | base legada de evidência | histórica | legado | pode conter conteúdo exclusivo |
| `js/data/tales-PEDRO.js` | versão paralela de contos | paralela | paralelo | não carregar nem escolher como ativa sem decisão |
| `js/features/tales-PEDRO.js` | versão paralela de interface de contos | paralela | paralelo | não carregar nem escolher como ativa sem decisão |
| `curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch` | patch histórico de curadoria | evidência histórica | histórico | não aplicar automaticamente |

## Garantias desta execução

- Nenhum conteúdo foi removido, restaurado, reativado ou suspenso.
- Nenhuma autoria, fonte, ID, texto, tipo, status ou metadado do mestre foi alterado.
- Nenhum runtime foi regenerado; os runtimes foram somente comparados por hash.
- Nenhum algoritmo, interface ou decisão editorial individual foi modificado.
- Os únicos artefatos desta etapa são o relatório, o JSON reproduzível, seu gerador, teste documental e o registro de estado vivo já existentes nesta linha de trabalho.

## Condição de encerramento

A etapa termina com cobertura verificável dos 351 IDs, registro dos artefatos históricos fora do mestre, hashes da versão examinada e separação explícita entre evidência, decisão e aplicação. Recuperação, peneira, metadados, alterações do acervo e publicação permanecem fora do escopo.

# Relatório de aplicação das decisões editoriais — lote 01

## 1. Objetivo e autorização

Aplicar exclusivamente `MINUTA-LOT01-001` e `MINUTA-LOT01-003`, cujas decisões editoriais e mapeamentos técnicos foram aprovados nominalmente por Pedro em 22/07/2026. A autorização não inclui commit, push, merge ou publicação externa.

Classificação inicial: **parcial**, com aplicação controlada de duas decisões e preservação dos demais sete casos.

## 2. Estado inicial

| Campo | Antes |
| --- | --- |
| Branch | `agent/finaliza-loop-estabilizacao` |
| Commit-base | `7876aa46f264a327442aa01e6f169ea333ac6ddf` |
| Mestre/runtime | `definitiva-2.3` |
| Históricos / ativos | 350 / 257 |
| Núcleo / contextual / geral | 42 / 149 / 66 |
| Quarentena | 0 |
| Árvore | numerosas alterações preexistentes, todas preservadas |

## 3. Pacote de decisões

Pacote: `decisoes_editoriais_aprovadas_lote_01.json`. A aprovação final confirmou os campos técnicos já apresentados na minuta. Não houve ampliação de escopo.

## 4. Plano de aplicação

| Decisão | ID | Estado anterior | Ação aprovada | Risco | Resultado |
| --- | --- | --- | --- | --- | --- |
| `001` | `TXT-LUT-003` | protegido fora do mestre | integrar sob quarentena documental | direitos e segurança em luto | aplicada |
| `003` | `TXT-MED-004` | ativo no núcleo | mover para contextual e adicionar exclusões | redução de elegibilidade | aplicada |

## 5. Decisões aplicadas

### `MINUTA-LOT01-001`

`TXT-LUT-003` foi integrado ao mestre com texto integral preservado, `QUARENTENA_DOCUMENTAL` e `publicationEnabled: false`. A atribuição pública aprovada, a fonte de Augusto Frederico Schmidt e a autoria não identificada da adaptação foram mantidas como dimensões separadas. O item não entrou no runtime.

### `MINUTA-LOT01-003`

`TXT-MED-004` passou de `nucleo` para `contextual` no campo principal e na associação de Medo. `hardExclusions` passou de vazio para `primeira_resposta` e `medo_intenso`. Texto, formato, atribuição, fonte, intensidades, funções e proteção não mudaram.

## 6. Decisões bloqueadas

Nenhuma das duas decisões aprovadas foi bloqueada. Os casos `002`, `004` e `005` continuam fora desta aplicação; `006` a `009` não requerem mudança.

## 7. Alterações por arquivo

- mestre canônico e contratos de build: integração, reclassificação e versão `definitiva-2.4`;
- runtimes: regenerados pelo build;
- Núcleo e estado vivo: decisão vigente e bloqueios atualizados;
- inventário/proveniência: cobertura atualizada de 350 para 351 IDs sem recalcular em massa as decisões existentes;
- pacote, minuta e relatórios: rastreabilidade da aprovação e aplicação.

## 8. Estado anterior e posterior

| Métrica | Antes | Depois |
| --- | ---: | ---: |
| Históricos | 350 | 351 |
| Ativos | 257 | 257 |
| Quarentena | 0 | 1 |
| Núcleo | 42 | 41 |
| Contextual | 149 | 150 |
| Geral | 66 | 66 |

## 9. Histórico preservado

O mestre recebeu entradas específicas no `changeLog`; o registro protegido preserva a linhagem `NP-LUT-SCHMIDT-001` e a versão histórica “Gaiola” de `TXT-MED-004`. Nenhum texto anterior foi apagado ou reescrito.

## 10. Build

`npm run build:content` gerou os dois runtimes a partir do mestre. Resultado: versão `definitiva-2.4`, 257 ativos, 41 núcleos, 150 contextuais e 66 gerais. `TXT-LUT-003` permaneceu ausente do runtime.

## 11. Testes

Validação final aprovada em 22/07/2026. Os testes focados de laboratório emocional e ligação da interface passaram em 26/26. `npm run verify` aprovou governança, allowlist de deploy, análise estática, sincronização do conteúdo e a regressão completa em 298/298 testes. Os contratos congelados de total, proveniência, versão e hash foram atualizados somente como consequência da integração aprovada.

## 12. Validação visual

Não exigida: `TXT-LUT-003` não é público; `TXT-MED-004` preservou texto, crédito, fonte e formato visual.

## 13. Impacto sobre sentimentos e formatos

Medo manteve 18 associações, passando de 7/11 para 6/12 entre núcleo/contextual. Formatos e total ativo permaneceram iguais. Luto e Esperança não receberam nova elegibilidade porque `TXT-LUT-003` está em quarentena.

## 14. Alterações inesperadas

Nenhuma alteração editorial inesperada localizada.

## 15. Limitações

- direitos de uso de `TXT-LUT-003` e `TXT-MED-004` permanecem pendentes para publicação externa;
- crise aguda, ideação suicida e coerção não possuem todos os enums narrativos necessários;
- a árvore já continha muitas alterações não relacionadas;
- nenhum estado seguro para commit ou publicação é declarado automaticamente.

## 16. Matriz de conformidade

| Exigência | Ação | Evidência | Estado | Limitação |
| --- | --- | --- | --- | --- |
| Pacote aprovado | criado após aprovação explícita | JSON de aprovação | COMPROVADO | nenhuma |
| Versão compatível | estados esperados conferidos antes da edição | pacote e mestre | COMPROVADO | nenhuma |
| Somente IDs aprovados | `TXT-LUT-003` e `TXT-MED-004` | diff e relatório JSON | COMPROVADO | nenhuma |
| Textos preservados | nenhuma reescrita | comparação integral | COMPROVADO | nenhuma |
| Proteção respeitada | Núcleo atualizado, sem publicação | `NUCLEO_PRESERVACAO_EDITORIAL.md` | COMPROVADO | direitos pendentes |
| Runtime gerado | build canônico | hashes e `check:content` | COMPROVADO | nenhuma |
| Git/publicação separados | nenhuma ação externa | estado final | COMPROVADO | revisão humana pendente |

## 17. Estado para revisão humana

Aplicação concluída localmente e preparada para revisão humana. `safeToCommit: false`; `safeToPublish: false`.

## 18. Próxima etapa

Parar após apresentar o diff e os resultados. Commit, push, merge e publicação dependem de autorizações separadas.

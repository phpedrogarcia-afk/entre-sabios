# Relatório da Fase 11 — regressão completa

## 1. Fase concluída

Fase 11 — regressão completa, concluída com suíte automatizada, build, auditoria comportamental temporária e reaproveitamento explícito da validação interativa aprovada que não precisava ser refeita.

## 2. Objetivo

Confirmar que a síntese emocional, a motivação opcional e o lote editorial 2 convivem com o comportamento anterior sem regressões de hierarquia, segurança, rotação, autoria, acessibilidade ou responsividade.

## 3. Estado anterior

- 283 conteúdos ativos no acervo `definitiva-2.1`.
- Catálogo de sínteses `1.1.0` com 29 pares e uma tríade.
- 186 testes aprovados ao final da Fase 10.
- Validação interativa anterior registrada em `tests/fixtures/auditoria_interface_publicada.json`, realizada no Google Chrome em 14 de julho de 2026.

## 4. Arquivos analisados

- `index.html`, `script.js`, `style.css` e CSS modular.
- `js/core/`, `js/ui/`, `js/data/` e módulos de funcionalidades ativos.
- `entre_sabios_acervo_mestre_final.json` e runtime gerado.
- Todas as suítes em `tests/` e relatórios das fases 6 a 10.

## 5. Arquivos modificados nesta fase

- Adicionado: `tests/phase11-final-acceptance.test.mjs`.
- Adicionado: `RELATORIO_FASE_11_REGRESSAO_COMPLETA.md`.

Nenhum arquivo funcional, CSS, HTML, acervo ou runtime recebeu alteração nesta fase.

## 6. Alterações realizadas

Foram adicionadas duas travas finais:

1. todas as 29 descrições ativas devem ser humanas, direcionais, revisadas, justificadas e livres de diagnóstico e jargão técnico visível;
2. a pilha de síntese e motivação não pode usar rede, endpoint, SDK ou serviço externo de IA.

## 7. Trabalho novo

- Consolidação das duas confirmações acima.
- Auditoria comportamental atual gerada em arquivo temporário fora do repositório.
- Matriz final de rastreabilidade dos 30 requisitos.

## 8. Trabalho apenas conferido

| Requisito | Resultado | Evidência principal |
| --- | --- | --- |
| 1. Cada principal | Aprovado | 14 sentimentos × 3 intensidades |
| 2. Um secundário | Aprovado | 546 pares ordenados com intensidade |
| 3. Dois secundários | Aprovado | 3.276 combinações |
| 4. Ordem invertida | Aprovado | 6.552 cenários ordenados |
| 5. Troca do principal | Aprovado | contrato, interface e ranking |
| 6. Cada intensidade | Aprovado | fraca, moderada e intensa |
| 7. Motivação desligada | Aprovado | neutralidade exata |
| 8. Motivação ativada | Aprovado | preferência limitada pós-filtros |
| 9. Reset | Aprovado | estado, botão e motivação |
| 10. Recarregamento | Aprovado | seletor recriado no meio do ciclo |
| 11. `localStorage` | Aprovado | filas, direção e histórico persistentes |
| 12. Outra perspectiva | Aprovado | ciclo completo e sequência mista |
| 13. Antirrepetição | Aprovado | conteúdo, texto normalizado, proximidade e conceito |
| 14. Autores | Aprovado | no máximo 2 em janela de 5 quando há alternativa |
| 15. Formatos | Aprovado | frase, microtexto, reflexão curta e citação longa |
| 16. Conteúdos bloqueados | Aprovado | exclusões rígidas e efeito editorial |
| 17. Autoria | Aprovado | hash do mestre e rastreabilidade congelados |
| 18. Vulnerabilidade | Aprovado | luto e oito estados sensíveis |
| 19. Descrição com síntese | Aprovado | 29 pares e uma tríade |
| 20. Descrição sem síntese | Aprovado | fallback cauteloso |
| 21. Ambiguidade alta | Aprovado | influência reduzida e apresentação discreta |
| 22. Fallback | Aprovado | níveis 3, 4 e 5 |
| 23. Mobile | Aprovado, herdado e estático | fixture Chrome e regressões CSS |
| 24. Desktop | Aprovado, herdado e estático | fixture Chrome e layout base |
| 25. Teclado | Aprovado por contrato | controles nativos, foco e testes de eventos |
| 26. Leitor de tela | Aprovado por semântica | nomes acessíveis, `aria-pressed`, regiões vivas e status |
| 27. Console | Aprovado na validação interativa herdada | 0 avisos e 0 erros na fixture publicada |
| 28. Testes | Aprovado | 188/188 |
| 29. Build | Aprovado | runtime reproduzível |
| 30. Ausência de chamadas externas | Aprovado para síntese/IA | pilha local sem rede ou serviço de IA |

## 9. Trabalho herdado

Foram reutilizados, sem reimplementação:

- contrato emocional e principal explícito;
- controle de motivação;
- resolvedor de sínteses;
- interface da síntese;
- adaptadores de ranking;
- segurança vulnerável;
- antirrepetição, trajetória, formatos e autoria;
- responsividade de smartphone, tablet e desktop;
- validação interativa publicada.

## 10. Testes executados

- `node --test tests/phase11-final-acceptance.test.mjs`.
- `node scripts/audit-behavior.mjs --output <arquivo temporário>`.
- `npm test`, que inclui build e todas as suítes.

## 11. Resultados

- 188 testes aprovados.
- 0 falhas, 0 cancelados e 0 ignorados.
- 283 conteúdos ativos.
- 64 núcleos, 151 contextuais e 68 gerais.
- Runtime com 221.765 bytes.
- Mestre preservado no SHA-256 `288652d619833b4081f616472241e37e8a2f30b165f3c36a214bea1e654fce5c`.

## 12. Comparação antes/depois

| Medida | Antes | Depois |
| --- | --- | --- |
| Testes | 186 | 188 |
| Conteúdos | 283 | 283 |
| Catálogo de sínteses | 29 pares + 1 tríade | 29 pares + 1 tríade |
| Código funcional | Estável | Sem alteração |
| Dependência de IA | Nenhuma | Nenhuma |

## 13. Regressões verificadas

Não houve regressão em principal, secundários, intensidade, segurança, motivação, antirrepetição, autoria, formatos, fallback, acessibilidade estrutural ou build.

## 14. Riscos restantes

- A tentativa de repetir a navegação interativa nesta sessão não prosseguiu porque o navegador interno não estava disponível. A evidência interativa anterior permanece válida porque nenhuma alteração de HTML, CSS ou interação ocorreu desde aquela validação; a Fase 10 modificou somente o catálogo local.
- O site possui integrações externas preexistentes de analytics, anúncios e Firebase. A confirmação de ausência de chamadas externas se refere à nova síntese/motivação e à ausência de IA em produção, não à remoção dessas integrações históricas.
- Os 153 pares sem descrição específica continuam, de forma intencional, no fallback cauteloso.

## 15. Combinações cobertas

- 14 sentimentos principais.
- 546 cenários de principal + um secundário + intensidade.
- 3.276 combinações de principal + dois secundários + intensidade.
- 6.552 ordens de secundários comparadas.
- 29 pares com síntese específica e uma tríade.
- Estados com e sem motivação, trocas, retorno e recarga.

## 16. Combinações pendentes

- 153 pares sem perfil específico.
- 1.091 tríades sem perfil exato.

Essas combinações continuam atendidas pelo perfil principal, modificadores e fallback cauteloso. Não bloqueiam o funcionamento.

## 17–19. Confirmações editoriais

- Não houve reclassificação do acervo.
- Não houve criação ou alteração de frase, microtexto, reflexão principal ou autoria.
- Não houve duplicação de mecanismo ou reimplementação do loop anterior.

## 20. Aprovação

A Fase 11 está pronta para aprovação final. Nenhuma fase posterior foi iniciada.

# Auditoria dos status `reviewed` — sínteses emocionais

Data da auditoria: 15 de julho de 2026
Catálogo auditado: `js/data/emotional-syntheses.js`, versão `1.1.0`
Total de objetos marcados como `reviewed`: 45

## Critério

Foram procurados quatro elementos para cada registro:

1. identidade do revisor humano;
2. data da aprovação;
3. documento de origem;
4. declaração explícita de aprovação humana.

Texto produzido por IA, relatório automático ou ausência de objeção não foram considerados revisão humana.

## Resultado consolidado

| Classificação | Quantidade | Situação |
|---|---:|---|
| Evidência completa | 8 | Revisor, data e documento registrados no catálogo e no documento editorial |
| Evidência documental parcial | 23 | Documento declara aprovação do usuário, mas não registra nome e data de maneira completa |
| Sem evidência individual localizada | 14 | Perfis internos principais estão `reviewed`, mas não possuem registro editorial individual |
| Total | 45 | — |

## Evidência completa — oito pares da Fase 10

Os oito registros abaixo possuem `editorialReview` com:

- revisor humano: Pedro;
- data: 14 de julho de 2026;
- documento: `PROPOSTAS_SINTESES_FASE_10_LOTE_2.md`;
- versão do catálogo: `1.1.0`.

Registros:

- `ansiedade__autoconhecimento`;
- `autoconhecimento__ansiedade`;
- `inseguranca__amor`;
- `amor__inseguranca`;
- `culpa__tristeza`;
- `tristeza__culpa`;
- `falta_de_proposito__esperanca`;
- `esperanca__falta_de_proposito`.

Conclusão: o status `reviewed` está comprovado.

## Evidência documental parcial — primeiro lote

O arquivo `PROPOSTAS_SINTESES_FASE_3.md` declara explicitamente que as propostas foram “aprovadas pelo usuário após a Fase 3”. O documento contém o texto exato das 21 combinações direcionais, da tríade e do fallback cauteloso.

Pares:

- `autoconhecimento__confusao`;
- `autoconhecimento__inseguranca`;
- `confusao__autoconhecimento`;
- `inseguranca__autoconhecimento`;
- `luto__saudade`;
- `saudade__luto`;
- `amor__medo`;
- `medo__amor`;
- `ansiedade__medo`;
- `medo__ansiedade`;
- `tristeza__solidao`;
- `solidao__tristeza`;
- `raiva__culpa`;
- `culpa__raiva`;
- `falta_de_proposito__confusao`;
- `confusao__falta_de_proposito`;
- `falta_de_proposito__inseguranca`;
- `esperanca__luto`;
- `luto__esperanca`;
- `amor__saudade`;
- `saudade__amor`.

Outros registros:

- tríade `autoconhecimento__confusao__inseguranca`;
- fallback `cautious`.

Lacuna: o documento não informa formalmente o nome do revisor e a data da decisão. A data de criação do arquivo no computador não foi tratada como prova editorial.

Conclusão: existe evidência humana real, porém a trilha de auditoria é incompleta. Não é correto declarar que esses 23 registros possuem a mesma documentação dos oito registros da Fase 10.

## Sem evidência individual — 14 perfis principais

Os perfis abaixo possuem `status: 'reviewed'`, mas não foram localizados em uma ata ou proposta editorial com aprovação individual:

- `ansiedade`;
- `medo`;
- `amor`;
- `saudade`;
- `esperanca`;
- `solidao`;
- `confusao`;
- `autoconhecimento`;
- `inseguranca`;
- `raiva`;
- `culpa`;
- `luto`;
- `tristeza`;
- `falta_de_proposito`.

Esses objetos contêm temas internos, não descrições exibidas diretamente. Mesmo assim, o status `reviewed` afirma um processo editorial que não está documentado individualmente.

## Decisão aplicada

Nenhum status foi alterado silenciosamente.

Recomendação:

1. manter os oito pares da Fase 10 como `reviewed`;
2. manter provisoriamente os 23 itens do primeiro lote e acrescentar revisor e data somente após confirmação humana explícita;
3. propor a mudança dos 14 perfis principais para `proposed`, ou registrar uma aprovação humana específica antes de mantê-los como `reviewed`.

A mudança em massa dos 14 perfis não foi executada porque afetaria a resolução de combinações sem par específico, fazendo-as passar do perfil principal para o fallback cauteloso. Essa alteração exige aprovação editorial específica e teste próprio.

## Preservação

- nenhuma descrição foi reescrita;
- nenhum perfil foi ativado ou desativado;
- nenhum conteúdo do acervo foi alterado;
- nenhuma autoria foi alterada;
- a auditoria não modificou o comportamento em produção.

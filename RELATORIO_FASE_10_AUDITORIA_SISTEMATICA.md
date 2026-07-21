# Relatório da Fase 10 — Auditoria sistemática

## Resultado executivo

A matriz executou 769 cenários e 1.468 seleções contra o runtime real.

- problemas objetivos: **0**;
- repetição prematura: **0**;
- secundário sem qualquer efeito: **0**;
- secundário dominante: **0**;
- principal ignorado: **0**;
- motivação alterando elegibilidade: **0**;
- colapso real de candidatos: **0**;
- contextos com menos de três candidatos seguros: **0**;
- novas tríades criadas: **0**.

Nenhuma alteração funcional no seletor foi necessária nesta fase.

## Cobertura da matriz

| Grupo | Cenários |
| --- | ---: |
| Principal sozinho, três intensidades, motivação ligada/desligada | 84 |
| Todos os pares ordenados, três intensidades | 546 |
| 29 pares aprovados com motivação | 87 |
| Inversão do principal e retorno com recarga | 29 |
| Tríade aprovada, três intensidades, motivação ligada/desligada | 6 |
| Sessões longas com recarga | 3 |
| Fallback deliberadamente ativado | 14 |
| **Total** | **769** |

A auditoria cobriu os 14 sentimentos, as três intensidades, os 182 pares direcionais possíveis e os 29 pares ativos. Nenhuma nova tríade foi inferida ou adicionada.

## Distribuições observadas

| Métrica | Mínimo | P10 | Mediana | P90 | Máximo | Média |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Influência secundária | 0,0289 | 0,0452 | 0,1075 | 0,2091 | 0,3077 | 0,1175 |
| Influência da motivação | 0 | 0 | 0,0265 | 0,0895 | 0,2198 | 0,0411 |
| Excesso normalizado de concentração de conteúdo | 0 | 0 | 0 | 0 | 0,0029 | 0,00003 |
| Concentração de autoria | 0,0394 | 0,1358 | 0,3333 | 1 | 1 | 0,3943 |
| Concentração conceitual | 0,1111 | 0,2200 | 0,3333 | 0,8519 | 1 | 0,4502 |
| Cobertura de formatos | 0,25 | 0,3333 | 0,6667 | 1 | 1 | 0,7247 |

O excesso de concentração de conteúdo desconta o mínimo teórico da amostra. O maior valor foi 0,0029, portanto não houve bolha prática de conteúdos nas sequências observáveis. Autoria e conceito permanecem como dimensões para estresse prolongado na Fase 11; cenários curtos não permitem transformar seus percentis em falha.

## Observações, riscos e limites

### Motivação

Em 26 dos 133 cenários inicialmente motivados, a motivação não alterou a ordem do ranking. Vinte e três ocorreram em intensidade intensa, dois em moderada e um em fraca.

Isso é uma observação, não uma regressão automática: nos estados intensos, segurança e adequação restringem deliberadamente movimento, confronto e pressão. A motivação nunca mudou elegibilidade, não reintroduziu conteúdo recente e não apagou o principal. Os casos devem permanecer visíveis no relatório da Fase 11, sem reduzir segurança para produzir diferença artificial.

### Secundários

Todos os 685 cenários com secundários alteraram o ranking. A menor influência foi 0,0289; 69 observações formam o decil inferior, mas nenhuma foi zero. Não existe evidência de que um secundário tenha substituído o principal.

### Combinações genéricas

Existem 153 pares direcionais sem perfil específico, equivalentes a 459 cenários nas três intensidades. Eles usam o fallback principal com modificador estruturado. Esse número é consequência direta do catálogo aprovado conter 29 dos 182 pares possíveis.

Esta é uma lacuna editorial conhecida. A Fase 10 não criou pares nem alterou descrições para escondê-la.

### Formatos e acervo

Foram encontradas 164 observações com apenas um formato disponível, concentradas em:

- Culpa: 52;
- Solidão: 49;
- Ansiedade: 17;
- Confusão: 17;
- Raiva: 16;
- Medo: 13.

Não houve cenário com menos de três candidatos seguros. Portanto, a lacuna é de variedade de formato, não de ausência total de conteúdo. Ela deve seguir para a revisão editorial futura; nenhum microtexto foi criado e nenhum formato foi reclassificado.

### Repetição e circulação

Não houve repetição antes de 100% do conjunto permitido, nem repetição do conteúdo atual, nem perda de histórico em inversões, retornos ou recargas. O excesso máximo normalizado de concentração foi 0,0029 nas sessões longas.

## Correção do instrumento durante a fase

A primeira leitura marcou cenários de uma única seleção como “concentrados”, embora uma amostra unitária não permita medir concentração. O laboratório foi corrigido para:

1. exigir uma sequência observável antes do alerta de colapso;
2. separar violações objetivas de observações diagnósticas;
3. descontar o mínimo teórico da concentração conforme o tamanho da amostra;
4. separar lacuna de quantidade de candidatos da lacuna de formatos.

Essa correção afetou somente a ferramenta de auditoria. O seletor de produção não foi alterado.

## Comando reproduzível

```sh
npm run audit:systematic
npm run audit:systematic -- --output relatorio.json
```

O JSON contém métricas compactas por cenário e evidências dos achados. A ferramenta é local, não usa rede e não é carregada pelo website.

## Encaminhamento

- Fase 11: confirmar autoria, conceitos, formatos, progressões e reconstruções em sequências de 100 escolhas;
- revisão editorial futura: avaliar os 153 pares genéricos e as lacunas de formato;
- não alterar segurança para fazer a motivação produzir movimento em intensidade intensa;
- não criar conteúdos, pares ou tríades durante este loop técnico.


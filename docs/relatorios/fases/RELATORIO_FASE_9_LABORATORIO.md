# Relatório da Fase 9 — Laboratório e métricas

## Escopo

A Fase 9 criou somente ferramentas de desenvolvimento. O laboratório reutiliza o runtime, o seletor, os adaptadores de síntese e motivação e os diagnósticos existentes. Nenhum arquivo do laboratório é carregado por `index.html`, e nenhuma métrica altera o ranking.

O acervo permaneceu congelado em 283 conteúdos ativos, versão `definitiva-2.1`.

## Trabalho novo

- biblioteca `scripts/emotional-lab-lib.mjs`;
- CLI `scripts/run-emotional-lab.mjs`;
- entrada por configuração JSON e três cenários-padrão;
- mudanças programadas de principal, secundários, intensidade e motivação;
- recarga simulada preservando o armazenamento;
- ativação deliberada dos fallbacks de síntese para auditoria;
- exportação JSON com escolhas, candidatos, progressão, remoções, repetição e justificativas;
- métricas da mistura emocional e alertas objetivos;
- modelo enxuto em `REGISTRO_PROBLEMAS_RECORRENTES.md`.

## Trabalho reutilizado

- replay de diagnóstico JSON v1;
- contrato de candidatos do seletor;
- histórico e filas persistentes;
- métricas de repetição, autoria, conceito e formato dos testes de estresse;
- adaptadores aprovados de síntese e motivação.

Nenhum segundo motor foi criado.

## Execução-padrão

Foram realizadas 90 seleções em três cenários, sem alertas objetivos.

| Cenário | Retenção principal | Influência secundária | Risco de dominância | Especificidade | Influência da motivação | Cobertura antes da repetição | Primeira repetição | Formatos |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Autoconhecimento + Confusão + Insegurança | 1,0000 | 0,1016 | 0 | 1,0000 | 0,0207 | 0,6977 | não ocorreu em 30 | 1,0000 |
| Luto + Saudade, intensa | 1,0000 | 0,2262 | 0 | 0,7500 | 0,0000 | 1,0000 | 11 | 1,0000 |
| Falta de propósito + Confusão, motivada | 1,0000 | 0,1393 | 0 | 0,7500 | 0,0181 | 1,0000 | 15 | 1,0000 |

Interpretação limitada aos fatos:

- o principal permaneceu reconhecível em 100% das escolhas;
- os secundários alteraram o ranking nos três cenários;
- nenhuma mudança de elegibilidade foi causada pela motivação;
- Luto e Falta de propósito só repetiram depois de percorrer 100% do conjunto permitido;
- Autoconhecimento apresentou 30 conteúdos distintos e ainda possuía alternativas, portanto não repetiu;
- motivação não foi solicitada no cenário de Luto; o valor zero não constitui falha;
- os valores de concentração foram registrados, mas não receberam limites arbitrários nesta fase.

## Fórmulas

- `primaryRetention`: escolhas com associação de núcleo/contextual ao principal ÷ escolhas realizadas;
- `secondaryInfluence`: deslocamento médio normalizado do ranking comum entre principal sozinho e principal com secundários;
- `secondaryDominanceRisk`: escolhas sem associação reconhecível ao principal ÷ escolhas realizadas;
- `synthesisSpecificity`: média ordinal documentada entre tríade, par, modificador, fallback cauteloso e algoritmo sem síntese;
- `motivationInfluence`: deslocamento médio normalizado entre o mesmo estado com motivação desligada e ligada;
- concentrações: índice de Herfindahl calculado sobre conteúdos, autores ou conceitos selecionados;
- `coverageBeforeRepeat`: conteúdos distintos anteriores à primeira repetição ÷ conjunto permitido observado até essa repetição;
- `formatCoverage`: formatos selecionados ÷ formatos disponíveis no conjunto permitido;
- `fallbackRate`: distribuição proporcional por tríade, par, modificador, fallback geral ou algoritmo sem síntese.

As fórmulas são de observabilidade. Elas não são scores de produção.

## Uso

```sh
npm run lab:emotional
npm run lab:emotional -- --input cenarios.json --output relatorio.json
npm run test:lab
```

## Pendência deliberada

A Fase 10 deve executar a matriz sistemática de sentimentos e intensidades antes de propor limites para influência ou concentração. Um alerta automático já é emitido para violações objetivas, como principal ignorado, repetição evitável, conteúdo atual repetido, motivação alterando elegibilidade ou colapso absoluto em um único candidato.


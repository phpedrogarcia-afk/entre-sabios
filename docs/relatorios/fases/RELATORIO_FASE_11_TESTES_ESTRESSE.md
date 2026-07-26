# Relatório da Fase 11 — Testes de estresse

Data: 16 de julho de 2026

## Escopo

Esta fase validou a seleção contínua, a persistência da rotação e a atomicidade da ação “Outra perspectiva”. Não houve alteração funcional no algoritmo, no acervo, nos perfis emocionais, nos pares ou nas tríades.

Foram executadas oito sequências de 100 seleções:

1. combinação ampla contínua;
2. motivação sempre ativa;
3. motivação alternada;
4. intensidade alternada;
5. sentimentos secundários alternados;
6. troca do principal e retorno;
7. diferentes níveis de fallback da síntese;
8. recarga simulada a cada dez seleções.

Também foram exercitados conjuntos com três candidatos, candidato seguro único, restauração do ciclo, inclusão de novo candidato, versão incompatível de fila, equivalência textual e canônica, circulação de autoria e formatos, fallbacks cautelosos e atomicidade por mouse, teclado e toque.

## Resultado consolidado

- 800 seleções nos oito cenários extensos;
- 0 repetições exatas evitáveis;
- 0 repetições por texto normalizado evitáveis;
- 0 repetições canônicas evitáveis;
- 0 repetições inevitáveis nos cenários amplos;
- nenhuma primeira repetição registrada nesses oito cenários;
- 100% dos conteúdos elegíveis encontrados foram percorridos antes de qualquer reinício de ciclo;
- 0 sequências excessivas de autor quando havia alternativa equivalente;
- três formatos circularam em todos os cenários: `frase`, `citacao_curta` e `reflexao_curta`;
- 39 testes do grupo de estresse aprovados, 0 falhas.

## Métricas por cenário

| Cenário | Elegíveis distintos | Distintos antes de repetir | Cobertura | Maior sequência de autor | Maior sequência conceitual | Reconstruções da fila |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| contínua | 43 | 43 | 100% | 2 | 4 | 5 |
| motivada | 43 | 43 | 100% | 1 | 4 | 5 |
| motivação alternada | 43 | 43 | 100% | 1 | 4 | 5 |
| intensidade alternada | 43 | 43 | 100% | 2 | 1 | 18 |
| secundários alternados | 43 | 43 | 100% | 2 | 4 | 9 |
| principal e retorno | 60 | 60 | 100% | 1 | 3 | 8 |
| fallbacks de síntese | 43 | 43 | 100% | 2 | 4 | 11 |
| recarregamentos | 43 | 43 | 100% | 1 | 4 | 5 |

As reconstruções são esperadas quando muda o contexto ou quando a fila termina. Elas não apagaram o histórico global nem anteciparam repetições.

## Casos de conjunto reduzido

O conjunto artificial de três candidatos apresentou os três conteúdos uma vez antes de repetir. Na quarta seleção, o motor registrou `repeatAllowed: true`, motivo `all_allowed_candidates_exhausted` e identificou o candidato menos recente.

O caso de candidato seguro único repetiu somente na segunda seleção, com a mesma prova explícita de esgotamento. Esta é uma repetição inevitável e correta: não existe alternativa editorialmente segura a escolher.

## Atomicidade da interface

O grupo `stress` passou a incluir `tests/selection-atomicity.test.mjs`. Os testes confirmaram:

- mouse, teclado e toque usam o mesmo listener e a mesma trava;
- a trava cobre toda a transação e sempre libera os controles;
- botões nativos não mantêm caminhos paralelos de seleção;
- a persistência do motor e dos históricos antecede a renderização.

## Alterações da fase

- `tests/repetition-stress.test.mjs`: medição explícita de elegíveis distintos, conteúdos distintos selecionados e cobertura antes da primeira repetição; prova reforçada para candidato único;
- `scripts/run-tests.mjs`: teste de atomicidade incluído no grupo `stress`;
- documentação e registro de estado atualizados.

Não foi necessário alterar o algoritmo. O comportamento existente já satisfazia o contrato; a fase acrescentou proteção de regressão e evidência mensurável.

## Limites conhecidos

- repetição é inevitável quando existe apenas um candidato seguro ou quando todo o conjunto seguro foi percorrido;
- variedade de formatos e deslocamento motivacional continuam limitados pelos metadados do acervo congelado;
- os testes automatizados não substituem validação visual em navegador real.

## Comando executado

```sh
npm run test:stress
```

Resultado: 39 aprovados, 0 falhas, 0 ignorados.

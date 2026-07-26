# Fase 6 — Integração limitada da síntese ao ranking

Data da auditoria: 14/07/2026.

## Classificação do trabalho anterior

- **Concluído e aprovado:** contrato normalizado de seleção, prioridade do sentimento principal, filtros de elegibilidade e segurança, intensidade, secundários, histórico, diversidade, catálogo de sínteses, resolvedor direcional e descrições humanas.
- **Não iniciado antes desta fase:** adaptador entre temas internos da síntese e os metadados existentes do acervo; uso limitado desse adaptador no ranking.
- **Congelado para fase futura:** motivação no ranking (Fase 7), reclassificação e alterações de autoria ou acervo.
- **Pendências locais anteriores:** preservadas, sem restauração, remoção, inclusão no Git ou modificação.

## Trabalho novo

Foi criado um adaptador puro entre a síntese já resolvida e os campos existentes `themes`, `editorialFunction` e `tone`. O resumo humano e a justificativa editorial nunca são lidos pelo ranking.

A ordem efetiva permanece:

1. sentimento principal e nível emocional;
2. publicação, status e exclusões obrigatórias;
3. segurança editorial;
4. intensidade;
5. compatibilidade dos sentimentos secundários;
6. preferência limitada da síntese;
7. desempate determinístico, trajetória, histórico, autoria e formato já existentes.

A síntese não cria elegibilidade, não muda o melhor nível, não remove conteúdo e não altera a fila de contexto. `needsMotivation` permanece neutro.

## Política de influência

O vetor de preferência é lexicográfico e transparente: `[tema, função editorial, tom]`.

- confiança baixa ou ambiguidade alta: no máximo um tema; função e tom ignorados;
- demais perfis intermediários: no máximo um tema e uma função; tom ignorado;
- confiança alta com ambiguidade baixa: no máximo dois temas, uma função e um tom.

Não existem pesos negativos, reduções, exclusões interpretativas ou leitura de texto livre. Temas ocultos só participam depois de passar pelo `themeAdapters` aprovado e ser comparados com metadados normalizados do acervo.

## Comparação obrigatória antes/depois

Auditoria executada com intensidade moderada. A coluna “primeiro” mostra o primeiro ID antes e depois; “favorecido” registra o primeiro movimento observável produzido pela síntese.

| Cenário | Perfil direcional | Primeiro antes → depois | Primeiro favorecido e motivo | Nível | Eliminados | Repetições no ciclo |
| --- | --- | --- | --- | --- | ---: | ---: |
| Autoconhecimento + Confusão + Insegurança | `autoconhecimento__confusao__inseguranca` | `batch02-quote-005` → `curated-44` | `curated-44`, 2º→1º, tema + função | 1→1 | 0 | 0→0 |
| Luto + Saudade | `luto__saudade` | `batch04-quote-021` → `curated-113` | `curated-113`, 3º→1º, temas + função + tom | 1→1 | 0 | 0→0 |
| Saudade + Luto | `saudade__luto` | `batch04-quote-025` → igual | `curated-113`, 10º→8º, tema + função | 1→1 | 0 | 0→0 |
| Amor + Medo | `amor__medo` | `batch01-quote-016` → igual | `batch04-quote-009`, 24º→9º, tema + função | 1→1 | 0 | 0→0 |
| Medo + Amor | `medo__amor` | `batch02-quote-010` → igual | `batch06-quote-014`, 5º→4º, tema + função | 1→1 | 0 | 0→0 |
| Ansiedade + Medo | `ansiedade__medo` | `Michel de Montaigne-1` → igual | `Katha Upanishad-3`, 13º→6º, tema + função | 1→1 | 0 | 0→0 |
| Tristeza + Solidão | `tristeza__solidao` | `ANT-MICRO-TRI-001` → igual | `ANT-TRI-001`, 8º→7º, tema + função | 1→1 | 0 | 0→0 |
| Raiva + Culpa | `raiva__culpa` | `batch03-quote-012` → igual | `curated-09`, 4º→3º, tema + função | 1→1 | 0 | 0→0 |
| Falta de propósito + Confusão | `falta_de_proposito__confusao` | `ANT-PRO-002` → igual | `batch01-quote-007`, 14º→6º, tema | 1→1 | 0 | 0→0 |
| Esperança + Luto | `esperanca__luto` | `batch04-quote-002` → igual | `batch02-quote-030`, 5º→4º, tema + função | 1→1 | 0 | 0→0 |

Em todos os dez cenários, o primeiro conteúdo após a integração possui associação de núcleo ou contextual com o sentimento principal. Nenhum secundário tornou um conteúdo alheio ao principal vencedor.

## Distribuição, autoria e formatos

- A elegibilidade é idêntica antes/depois; portanto, o conjunto total de autores e formatos também é idêntico.
- Nos ciclos comparados, houve zero repetição exata antes e zero depois.
- As sequências consecutivas de autor permaneceram idênticas em todos os cenários.
- Em `Tristeza + Solidão`, ocorreram 7 sequências consecutivas em 8 escolhas tanto antes quanto depois porque todos os candidatos auditados do melhor nível exibem `Entre Sábios`. É uma limitação do acervo, não criada pela síntese; autoria e reclassificação estão congeladas nesta fase.
- Em `Luto + Saudade`, o primeiro formato passou de frase para reflexão curta, mas o ciclo preservou os mesmos formatos (`frase` e `reflexao_curta`) e a mesma quantidade de autores.
- Nos demais cenários, os conjuntos de formatos do ciclo permaneceram iguais.

## Diagnóstico de desenvolvimento

O modo técnico pode ser ativado acrescentando `?debugEmotional=1` à URL ou definindo `localStorage.entreSabiosDebugEmotional = "1"`. Ele registra somente no console:

- principal, secundários, intensidade e `needsMotivation`;
- chave direcional, fallback, temas ocultos/mapeados, confiança e ambiguidade;
- candidatos antes e depois da síntese;
- exclusões e seus motivos objetivos;
- vetor de preferência da síntese e redução sempre igual a zero;
- preferência motivacional sempre igual a zero nesta fase;
- histórico recente de conteúdo, autor e formato;
- conteúdo escolhido e razão final do nível.

O modo fica desligado por padrão e não altera a seleção.

## Arquivos da Fase 6

- Novo: `js/core/synthesis-ranking-adapter.js`.
- Novo: `tests/synthesis-ranking.test.mjs`.
- Novo: `RELATORIO_FASE_6_INTEGRACAO_SINTESE.md`.
- Alterados nesta fase: `js/core/runtime-engine.js`, `js/core/matching.js`, `script.js`, `index.html` e uma asserção de isolamento em `tests/synthesis-interface.test.mjs`.
- Acervo e runtimes gerados: sem alteração funcional ou editorial.

## Resultado

A síntese passou a refinar candidatos equivalentes por metadados existentes, com influência limitada e observável. Não houve regressão de elegibilidade, hierarquia principal, segurança, intensidade, repetição, autoria ou formato nos cenários obrigatórios. A motivação segue congelada até autorização expressa da Fase 7.

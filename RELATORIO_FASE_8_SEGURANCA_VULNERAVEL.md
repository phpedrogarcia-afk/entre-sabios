# Fase 8 — Segurança e sentimentos vulneráveis

Data da auditoria: 14/07/2026.

## Objetivo

Verificar se síntese e motivação poderiam pressionar sofrimento intenso, contornar segurança, intensidade, publicação, autoria ou prioridade do sentimento principal.

## Classificação antes da alteração

- **Concluído e aprovado:** bloqueios de luto, padrões de isolamento, incapacidade, ressentimento, culpa, romantização, invalidação, impulsividade e primeira resposta vulnerável.
- **Concluído e conferido:** síntese antes da motivação; motivação sem poder de elegibilidade; filtros de publicação, status, intensidade e principal.
- **Parcialmente implementado:** ação e confronto eram bloqueados em estados vulneráveis intensos somente na primeira resposta. Após essa etapa, um conteúdo pressionador poderia voltar ao conjunto.
- **Congelado:** acervo, autoria, metadados, frases e reclassificação editorial.

## Falha concreta encontrada

Um cenário adversarial de Tristeza intensa, depois da primeira resposta, com função `action` e risco `pressao_por_superacao`, retornava:

```text
safe: true
tags: risks_negative_reinforcement
```

Isso permitiria que uma futura alteração de acervo transformasse motivação em cobrança, embora nenhum conteúdo atualmente escolhido apresentasse essa combinação.

## Correção mínima

Para Luto, Tristeza, Insegurança, Culpa, Ansiedade, Solidão, Falta de propósito e Raiva em intensidade alta:

- `action` e `confrontation` permanecem bloqueados também depois da primeira resposta;
- riscos de pressão por superação, conselho prematuro, culpabilização, moralização, agressividade e romantização permanecem bloqueados;
- a regra independe de `needsMotivation`, portanto motivação continua sendo preferência e não filtro rígido;
- intensidades fraca e moderada preservam o comportamento existente e continuam dependendo das proteções específicas já aprovadas.

O cenário adversarial passou de seguro para `unsafe_pressure_in_intense_state`.

## Impacto no acervo real

- Nenhum conteúdo atualmente selecionável foi removido.
- O único item real que recebe o novo marcador em um contexto bruto é `Dhammapada-2` para Raiva intensa.
- Esse item já possuía `hardExclusions: ["raiva_intensa"]`, portanto já era inelegível antes desta fase.
- Totais, IDs, autorias, placements, intensidades e textos permaneceram inalterados.

## Verificações obrigatórias

- **Pressão no luto:** bloqueada; sequência intensa usa somente reconhecimento, contemplação ou grounding.
- **Romantização da tristeza:** conteúdo adversarial não entra no ranking.
- **Incentivo ao isolamento:** conteúdo adversarial não entra no ranking.
- **Confirmação de incapacidade:** conteúdo adversarial não entra no ranking.
- **Ressentimento e vingança:** conteúdo adversarial não entra no ranking, inclusive em Raiva moderada.
- **Aumento de culpa:** conteúdo adversarial não entra no ranking.
- **Motivação como cobrança:** ação, confronto e riscos pressionadores não entram em intensidade alta sensível.
- **Intensidade:** candidato de intensidade diferente permanece inelegível.
- **Conteúdo bloqueado e autoria:** status `BLOQUEADO_AUTORIA` e publicação desativada não são resgatados.
- **Principal:** candidatos selecionados no acervo real permanecem nos níveis 1 ou 2.
- **Motivação forte:** não resgata nenhum dos padrões prejudiciais artificiais.

## Antes e depois

| Cenário | Antes | Depois |
| --- | --- | --- |
| Tristeza intensa, ação pressionadora após primeira resposta | seguro | bloqueado |
| Luto intenso motivado | protegido por regras de luto | protegido durante toda a sequência |
| Conteúdo genérico ou bloqueado com sinais motivacionais | inelegível | continua inelegível |
| Acervo real selecionável | cobertura existente | mesma cobertura |
| Prioridade principal | níveis 1–2 | níveis 1–2 |

## Trabalho novo, conferido e herdado

- **Novo:** extensão da proteção intensa para além da primeira resposta e testes específicos da integração motivacional.
- **Apenas conferido:** segurança de padrões textuais, filtros, autoria, intensidade, principal e fallback motivacional.
- **Herdado:** duas pendências históricas de luto continuam registradas pelos testes anteriores e não foram reclassificadas nesta fase.
- **Regressões corrigidas:** possibilidade futura de ação/confronto pressionador reaparecer após a primeira resposta intensa.

## Arquivos

- Alterado: `js/core/runtime-engine.js`.
- Novo: `tests/vulnerable-motivation-safety.test.mjs`.
- Novo: `RELATORIO_FASE_8_SEGURANCA_VULNERAVEL.md`.
- Acervo e arquivos gerados: sem alteração editorial.

## Preservação

- nenhuma frase, microtexto ou reflexão foi criada;
- nenhuma autoria ou fonte foi modificada;
- nenhuma reclassificação foi feita;
- `Falta de propósito` permanece;
- motivação não virou sentimento nem intensidade;
- não existe IA externa ou chamada remota;
- arquivos `-PEDRO` e pendências locais anteriores permaneceram intocados;
- a Fase 9 não foi iniciada.

## Risco restante

Marcadores editoriais isolados não foram transformados em bloqueios globais, porque alguns textos usam esses marcadores para negar ou criticar o risco. A regra nova é deliberadamente contextual à intensidade alta. A Fase 9 deverá verificar antirrepetição, trajetória e formatos com a camada completa, sem reimplementar esta segurança.

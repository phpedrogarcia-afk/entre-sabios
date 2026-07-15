# Relatório da Fase 9 — antirrepetição, trajetória e formatos

## Escopo executado

Esta fase auditou a integração da rotação já existente com as camadas aprovadas de síntese emocional e preferência opcional de motivação. Nenhum mecanismo paralelo de seleção foi criado.

## Classificação antes da alteração

| Item | Classificação | Ação nesta fase |
| --- | --- | --- |
| Histórico global persistente | Concluído e aprovado | Teste de integração e recarga |
| Fila por contexto e ciclo sem repetição | Concluído e aprovado | Teste com motivação alternada |
| Evitação de texto exato e normalizado | Concluído e aprovado | Regressão em sequência longa |
| Diversidade de autoria | Concluído e aprovado | Regressão com estados mistos e conjunto controlado |
| Trajetória editorial | Concluído e aprovado | Regressão contra preferência motivacional |
| Cadência de formatos | Concluído e aprovado | Regressão com frase, microtexto, reflexão curta e citação longa |
| Integração dos itens acima com síntese e motivação | Apenas parcialmente auditado | Cobertura nova da Fase 9 |

## Trabalho novo

Foi criado `tests/phase9-rotation-integration.test.mjs`, com quatro grupos de regressão:

1. **Elegibilidade sem bolha artificial**
   - 14 sentimentos;
   - 3 intensidades;
   - motivação ligada e desligada;
   - principal com até dois secundários;
   - total de 84 configurações verificadas.

   Em todas elas, síntese e motivação preservaram exatamente o conjunto de IDs elegíveis e o melhor nível emocional do ranking sem adaptadores.

2. **“Outra perspectiva”, retorno e recarga**
   - ciclo completo de uma combinação com principal e dois secundários;
   - motivação alternada a cada seleção;
   - recriação do seletor no meio do ciclo com o mesmo `localStorage` simulado;
   - nenhum texto repetido antes do esgotamento do conjunto elegível.

3. **Sequência mista de 120 seleções**
   - mudanças de principal, secundários e intensidade;
   - retorno recorrente a combinações anteriores;
   - motivação ligada e desligada;
   - recarga após 60 seleções;
   - 0 repetições exatas imediatas quando havia alternativa;
   - 0 sequências de três recomendações consecutivas do mesmo autor;
   - 0 perdas do nível principal;
   - 0 conteúdos selecionados fora da camada de segurança.

4. **Trajetória, formatos e autoria**
   - uma preferência motivacional forte não antecipou ação na trajetória;
   - reconhecimento continuou sendo a primeira resposta;
   - frase, microtexto, reflexão curta e citação longa atravessaram o ciclo;
   - dez conteúdos equivalentes foram percorridos antes de repetição;
   - cinco autores continuaram limitados a no máximo duas aparições em qualquer janela de cinco recomendações.

## Resultado antes/depois

| Medida | Antes da Fase 9 | Depois da Fase 9 |
| --- | --- | --- |
| Comportamento funcional | Já implementado | Preservado, sem mudança funcional |
| Testes automatizados | 180 aprovados | 184 aprovados |
| Falhas | 0 | 0 |
| Conteúdos ativos | 283 | 283 |
| Núcleos / contextuais / gerais | 64 / 151 / 68 | 64 / 151 / 68 |
| Versão do acervo | `definitiva-2.1` | `definitiva-2.1` |

Comando executado: `npm test`.

## Relaxamento e repetição inevitável

As preferências de síntese e motivação apenas reordenam candidatos; elas não removem candidatos nem reduzem o conjunto elegível. Portanto, quando não existe correspondência preferencial forte, o seletor continua usando a fila normal.

A repetição permanece inevitável somente quando:

- todo o conjunto elegível daquela combinação já foi percorrido;
- existe apenas um texto normalizado elegível;
- todos os candidatos restantes pertencem ao mesmo autor ou formato;
- filtros rígidos de publicação, intensidade, sentimento principal ou segurança deixam apenas uma alternativa.

Nesses casos, relaxam-se primeiro as preferências de autoria, formato, conceito, proximidade textual e motivação. Os filtros rígidos, o sentimento principal e a segurança não são relaxados.

## Arquivos da Fase 9

- Adicionado: `tests/phase9-rotation-integration.test.mjs`.
- Adicionado: `RELATORIO_FASE_9_ANTIRREPETICAO_TRAJETORIA_FORMATOS.md`.
- Código funcional alterado nesta fase: nenhum.
- Acervo ou runtime alterado nesta fase: nenhum.

As alterações locais protegidas anteriores, inclusive arquivos `-PEDRO`, `.gitignore` e `README.md`, não foram tocadas por esta fase.

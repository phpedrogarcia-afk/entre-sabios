# Relatório final — aperfeiçoamento do algoritmo e do mapa emocional

Data da consolidação: 16 de julho de 2026

## 1. Resumo executivo

As Fases 0 a 14 foram executadas sem reconstruir o Entre Sábios, sem criar um segundo motor e sem modificar o acervo para mascarar falhas do seletor.

O defeito original de repetição foi reproduzido e corrigido na menor unidade: o seletor reiniciava o núcleo do sentimento principal depois de esgotar apenas a fila do melhor nível, mesmo havendo conteúdo contextual seguro e ainda não visto. A implementação atual percorre o território permitido do principal, aplica uma barreira global de repetição, persiste fila e histórico com versões próprias e só libera repetição depois de provar esgotamento.

O ciclo termina com:

- 283 conteúdos ativos preservados;
- versão editorial `definitiva-2.1` preservada;
- hash SHA-256 do mestre preservado: `288652d619833b4081f616472241e37e8a2f30b165f3c36a214bea1e654fce5c`;
- 249 testes aprovados;
- 800 seleções de estresse sem repetição evitável;
- 769 cenários sistemáticos e 1.468 seleções sem violação objetiva;
- validação no caminho real do Chrome sem erros de console;
- nenhuma IA, rede ou geração remota no caminho de produção;
- nenhuma alteração funcional nas Fases 10 a 14.

## 2. Problemas reproduzidos

### Repetição precoce

Estado: Autoconhecimento principal, Confusão e Insegurança secundários, intensidade moderada. O conteúdo `curated-44` reaparecia na quinta seleção, embora restassem 39 conteúdos contextuais seguros do mesmo principal.

### Casos de controle

- Luto + Saudade;
- Falta de propósito + Confusão;
- troca de motivação;
- troca de intensidade;
- inversão e retorno do principal;
- fallback;
- recarregamento;
- duplo clique em “Outra perspectiva”.

Os casos mostraram que a correção precisava atuar na progressão, no ciclo, na persistência e na atomicidade — não no acervo.

## 3. Causas concretas

1. `select()` permanecia preso ao melhor nível e reconstruía essa fila depois do esgotamento.
2. O termo “elegível” era confundido com a fila ativa, ocultando alternativas seguras em níveis seguintes do mesmo principal.
3. Filas persistidas não possuíam contrato suficiente para distinguir versão do conteúdo, esquema do seletor e política de rotação.
4. Filas restauradas podiam representar uma fotografia antiga do conjunto.
5. O caminho real permitia duas execuções antes da conclusão da primeira ação.
6. Históricos paralelos não tinham autoridade documentada, o que favorecia correções na estrutura errada.
7. A influência dos secundários, síntese e motivação não tinha métricas reproduzíveis de desenvolvimento.

## 4. Arquivos modificados ou criados

### Produção e contratos

- `js/core/runtime-engine.js`;
- `js/core/emotional-synthesis.js`;
- `js/core/synthesis-ranking-adapter.js`;
- `js/data/emotional-syntheses.js`;
- `js/data/catalogs.js`;
- integração anterior já aprovada em `js/core/matching.js`, `script.js` e `index.html`;
- `scripts/build-content.mjs`;
- `scripts/content-build-lib.mjs`;
- `package.json`.

### Diagnóstico, laboratório e validação

- `scripts/diagnostic-replay-lib.mjs`;
- `scripts/replay-diagnostic.mjs`;
- `scripts/emotional-lab-lib.mjs`;
- `scripts/run-emotional-lab.mjs`;
- `scripts/systematic-audit-lib.mjs`;
- `scripts/run-systematic-audit.mjs`;
- `scripts/run-tests.mjs`;
- `scripts/static-check.mjs`;
- novos testes de candidato, progressão, migração, atomicidade, cores, replay, laboratório, auditoria sistemática e análise estática;
- relatórios, decisões, estado e matriz de históricos.

Os arquivos do acervo-mestre e os runtimes derivados não foram alterados pelo loop.

## 5. Funções modificadas

Principais pontos funcionais:

- `createSelector()`, `persist()`, `buildCandidateContract()`, `inspect()`, `select()`, `clear()` e `getRecentSelections()` em `runtime-engine.js`;
- `validateCatalog()`, `mergePairWithModifier()` e `createResolver().resolve()` em `emotional-synthesis.js`;
- `resolveState()`, `evaluate()` e `describeContext()` no adaptador de síntese;
- `validateMaster()` e funções auxiliares de catálogo no build;
- `runReflectionSelectionAction()` no caminho real da interface;
- instrumentação de diagnóstico em `matching.js`.

## 6. Arquitetura preservada

O fluxo continua sendo:

1. estado emocional interpreta principal, até dois secundários, intensidade e motivação;
2. runtime filtra publicação, status, segurança, intensidade e principal;
3. secundários refinam equivalentes;
4. síntese acrescenta sinais estruturados limitados;
5. motivação reordena somente candidatos já seguros;
6. rotação percorre a fila sem repetir;
7. o resultado é persistido antes da renderização;
8. interface apresenta frase, autoria, explicação, pensador, orientação e livro.

Não existe segundo estado emocional, segundo seletor nem serviço remoto.

## 7. Progressão implementada

A progressão aprovada é deliberadamente mínima:

1. nível 1 — núcleo do sentimento principal;
2. nível 2 — contextual do mesmo sentimento principal;
3. repetição somente após esgotamento do território principal permitido.

Secundários, síntese, motivação, formato e autoria continuam refinando candidatos equivalentes. Eles não promovem conteúdo de outro território. A tentativa intermediária de avançar para níveis dos secundários gerou seis regressões e foi revertida na menor unidade.

## 8. Política de ciclo

O ciclo usa duas dimensões sem duplicar o estado:

- fila contextual por versão, principal, secundários, intensidade, síntese e direção motivacional;
- histórico recente global por versão, compartilhado entre mudanças de contexto.

O contexto registra nível ativo, fila restante, direção, trajetória e cadência. O histórico global registra até 120 escolhas com ID, texto normalizado, chaves canônicas, autor e conceito.

## 9. Política de repetição

Repetição exata só é aceita quando todo o território seguro permitido foi percorrido. Ao se tornar inevitável, o motor preserva segurança, principal e intensidade, escolhe o candidato menos recente e tenta evitar o mesmo autor e conceito.

Diagnóstico esperado:

- `repeatAllowed: true`;
- `repeatReason: all_allowed_candidates_exhausted`;
- contagem de candidatos seguros verificados;
- candidato menos recente escolhido.

## 10. Barreira global

Antes da escolha final, a barreira impede:

- conteúdo atual;
- mesmo ID recente;
- mesmo texto normalizado;
- equivalência por `duplicateOf`, `derivedFromId`, `canonicalContentId` ou `sourceFragmentId` quando existente;
- formulação próxima;
- reintrodução por síntese, motivação, autoria, formato ou fallback.

Trocar principal, secundários, intensidade, motivação ou fallback não apaga essa barreira.

## 11. Atomicidade

`runReflectionSelectionAction()` aplica uma trava síncrona de 350 ms e cobre leitura do estado, seleção, persistência, renderização e liberação dos controles.

Resultados:

- antes: duplo clique produzia duas seleções;
- depois: duplo clique produz uma seleção;
- mouse, teclado e toque usam o mesmo listener protegido;
- Chrome real confirmou incremento único da sessão diagnosticada.

## 12. Versionamento

As estruturas persistidas distinguem:

- `contentVersion: definitiva-2.1`;
- `selectorSchemaVersion: 2`;
- `rotationPolicyVersion: 2`.

As janelas vigentes são:

- janela recente forte: 12;
- histórico global persistente: 120;
- histórico contextual: 120.

## 13. Migração

Fila incompatível, metadado ausente ou corrompido invalidam apenas fila, direção, trajetória contextual e metadado da rotação. Permanecem intactos:

- histórico global recente;
- favoritos;
- feedback;
- tema visual;
- contos;
- demais dados independentes.

## 14. Reconciliação

Ao restaurar uma fila compatível, o motor:

1. remove IDs inexistentes ou inelegíveis;
2. preserva a ordem restante;
3. consulta os elegíveis atuais;
4. acrescenta candidatos novos ainda não vistos;
5. mantém bloqueios recentes;
6. registra o resultado no diagnóstico.

## 15. Matriz de históricos

`MATRIZ_AUTORIDADE_HISTORICOS.md` confirma:

- `entreSabiosRecentContent:<versão>`: autoridade global de antirrepetição;
- `entreSabiosRuntimeQueues:<versão>`: autoridade do ciclo contextual;
- `entreSabiosContextHistory:<versão>`: trajetória e cadência;
- `history`: navegação da página;
- favoritos e feedback: autoridades independentes;
- históricos de contos: exclusivos dos contos;
- `caixaSabedoriaHistoricoVisto`, contador gerado e histórico contextual legado: passivos, sem autoridade decisória.

Nenhum histórico legado foi apagado.

## 16. Contrato da analogia das cores

- principal: cor dominante e território editorial;
- secundários: até duas tonalidades que refinam sem dominar;
- intensidade: saturação que regula segurança, confronto e trajetória;
- síntese: interpretação estruturada da combinação;
- motivação: direção opcional, não uma emoção adicional.

Somente os 29 pares e a tríade existentes receberam `relationType`. Os tipos permitidos são `reinforcement`, `tension`, `ambivalence`, `masking`, `transition` e `context`. O campo é interno e não aparece como diagnóstico ao usuário.

## 17. Métricas

O laboratório mede, sem alterar o ranking:

- `primaryRetention`;
- `secondaryInfluence`;
- `secondaryDominanceRisk`;
- `synthesisSpecificity`;
- `motivationInfluence`;
- `candidateConcentration`;
- `coverageBeforeRepeat`;
- `fallbackRate`;
- `authorConcentration`;
- `conceptConcentration`;
- `formatCoverage`.

## 18. Alertas

Alertas objetivos cobrem repetição precoce, conteúdo atual repetido, principal ignorado, secundário sem efeito ou dominante, motivação alterando elegibilidade, conjunto colapsado, fila incompatível, fila restaurada sem candidatos novos, autoria/conceito excessivos, fallback, divergência renderizada e persistência tardia.

A auditoria distingue falha objetiva, observação estatística e lacuna editorial. Um alerta em sequência de uma única seleção deixou de ser tratado incorretamente como concentração.

## 19. Laboratório

O laboratório local aceita cenário, intensidade, motivação, mudanças durante a sessão, recarga, inversão e fallback. Exporta JSON com candidatos, níveis, progressões, remoções, escolhas, históricos, métricas e alertas.

Comandos:

```sh
npm run lab:emotional
npm run audit:systematic
npm run replay:diagnostic -- caminho/sessao.json
```

Nenhum desses arquivos é carregado pelo website.

## 20. Testes que falhavam

Antes da correção:

- reprodução de Autoconhecimento repetia na quinta escolha apesar de 39 alternativas;
- duplo clique gerava duas escolhas;
- passagem canônica podia reaparecer;
- a primeira regressão da progressão ampliada gerou seis falhas por perder soberania do principal;
- uma expectativa antiga de migração confundia reinício de fila com limpeza do histórico global.

Os testes falharam pelos motivos corretos e passaram depois das correções mínimas.

## 21. Testes depois

- contratos de candidato, progressão e repetição inevitável;
- três reproduções reais de repetição;
- migração de versão antiga, campo ausente, fila parcial, armazenamento corrompido, IDs removidos e novos;
- equivalência por ID, texto, normalização, origem e derivação;
- atomicidade por mouse, teclado e toque;
- dominância do principal com dois secundários;
- síntese, motivação, segurança, autoria, formatos e regressão editorial.

## 22. Suíte completa

Resultado final de `npm run verify`:

- 95 arquivos JS/MJS com sintaxe válida;
- 8 JSON válidos;
- runtime sincronizado sem escrita;
- 249 testes aprovados;
- 0 falhas;
- duração total aproximada: 52 segundos.

## 23. Testes reais

Chrome real, servidor HTTP local e caminho visível da interface:

- desktop 1440×900;
- smartphone 412×915;
- smartphone horizontal 915×412;
- tablet 768×1024;
- tablet horizontal 1024×768;
- nenhum overflow horizontal;
- smartphone horizontal rolou até o final;
- conteúdo escolhido coincidiu com o renderizado;
- histórico sobreviveu à recarga;
- duplo clique produziu uma nova escolha;
- console com 0 erros e 0 avisos.

Limite honesto: tablet e toque físicos permanecem como conferência manual. Viewport responsivo não reproduz integralmente um dispositivo físico.

## 24. Métricas antes e depois

| Métrica | Antes | Depois |
| --- | ---: | ---: |
| primeira repetição do caso original | posição 5 | ausente enquanto houver alternativa |
| alternativas seguras ignoradas | 39 | 0 |
| duplo clique | 2 seleções | 1 seleção |
| repetição evitável em 800 escolhas | não medida | 0 |
| cobertura antes de reinício nos oito estresses | não medida | 100% |
| cenários sistemáticos | inexistente | 769 |
| seleções sistemáticas | inexistente | 1.468 |
| violações objetivas sistemáticas | não medida | 0 |
| testes automatizados | 188 na reprodução original | 249 finais |

Distribuição da influência secundária na Fase 10: mínimo 0,0289; mediana 0,1075; máximo 0,3077. Nenhum secundário teve efeito zero ou dominou o principal.

## 25. Repetições inevitáveis restantes

Repetição permanece correta quando existe um único candidato seguro ou todo o território permitido foi percorrido. O teste de três candidatos repete na quarta escolha; o candidato único repete na segunda. Ambos registram prova de esgotamento e escolhem pela menor recência.

No cenário amplo da Fase 11, nenhuma repetição ocorreu durante as 100 seleções de cada sequência.

## 26. Riscos

- teste físico de toque e tablet ainda manual;
- políticas de segurança continuam distribuídas e exigem decisão antes de centralização;
- históricos legados permanecem por compatibilidade;
- GitHub Pages e domínio principal não possuem fluxo único de publicação;
- testes reais de navegador ainda não rodam automaticamente no CI;
- conceitos sem metadado específico dependem dos temas e comparações existentes;
- arquivos locais protegidos exigem revisão explícita antes de integração.

## 27. Lacunas do acervo

Registradas, não corrigidas pelo algoritmo:

- 153 dos 182 pares direcionais não possuem síntese específica;
- 164 observações possuem somente um formato disponível;
- concentração de formato afeta sobretudo Culpa, Solidão, Ansiedade, Confusão, Raiva e Medo;
- 26 de 133 cenários motivados não moveram a ordem, 23 deles em intensidade intensa;
- 20 conteúdos mantêm referência documental pendente;
- 14 perfis principais `reviewed` ainda precisam de evidência individual completa.

Nenhuma lacuna reduziu segurança ou produziu repetição evitável.

## 28. Confirmação de acervo congelado

- 283 ativos;
- 64 núcleos;
- 151 contextuais;
- 68 gerais;
- versão `definitiva-2.1`;
- hash do mestre preservado;
- runtime de 221.765 bytes sincronizado;
- nenhuma frase, microtexto ou reflexão criada, removida ou reclassificada.

## 29. Confirmação de autoria congelada

Nenhuma autoria, fonte, categoria de atribuição, status editorial ou apresentação de pensador foi alterada. A preferência pessoal por autoria permanece fora da seleção, mas os metadados editoriais foram preservados.

## 30. Confirmação de nenhuma IA em produção

Síntese, motivação, seleção e laboratório são locais e determinísticos. Os testes impedem `fetch`, WebSocket, SDKs de IA e endpoints remotos na pilha de produção. Não há chamada à OpenAI ou a outro provedor.

## 31. Confirmação de não duplicação

Não foram recriados estado emocional, síntese, motivação, autoria, livros, compartilhamento, pensador ou orientação. Mecanismos existentes foram auditados, integrados e protegidos por regressão. As Fases 10 a 14 não alteraram o seletor porque nenhuma falha funcional nova foi encontrada.

## 32. Confirmação Git

Estado no encerramento:

- branch: `agent/finaliza-loop-estabilizacao`;
- HEAD: `35a3920c21b8c7f38c20fb6f5c0837f66ec732cd`;
- `origin/main`: `3ea62f8ae4c82a26d17235061ae8e5b9f069135a`;
- nenhum commit, push, pull request ou merge executado neste loop;
- alterações locais ainda não integradas.

Continuam protegidos e fora de qualquer integração automática:

- `.gitignore` removido localmente;
- `README.md` removido localmente;
- `AGENTS.md` não rastreado;
- `css/modals-PEDRO.css`;
- `js/data/tales-PEDRO.js`;
- `js/features/tales-PEDRO.js`;
- `curadoria-rigida-3.1.zip`.

## 33. Pedido de aprovação

O loop técnico está concluído no workspace local. Solicita-se aprovação do relatório e, separadamente, decisão sobre:

1. integração Git por allowlist, sem incluir arquivos protegidos;
2. validação manual opcional em tablet físico;
3. fluxo futuro de publicação;
4. projeto editorial futuro para pares genéricos, formatos e referências pendentes.

Nenhuma dessas decisões deve ser executada automaticamente apenas porque o relatório foi concluído.

## Evidências principais

- `RELATORIO_FINAL_CORRECAO_ANTIRREPETICAO.md`;
- `MATRIZ_AUTORIDADE_HISTORICOS.md`;
- `RELATORIO_FASE_9_LABORATORIO.md`;
- `RELATORIO_FASE_10_AUDITORIA_SISTEMATICA.md`;
- `RELATORIO_FASE_11_TESTES_ESTRESSE.md`;
- `RELATORIO_FASE_12_NAVEGADOR_E_DISPOSITIVOS.md`;
- `RELATORIO_FASE_13_REGRESSAO_EDITORIAL.md`;
- `PROJECT_STATUS.md`;
- `DECISIONS.md`;
- `REGISTRO_PROBLEMAS_RECORRENTES.md`.

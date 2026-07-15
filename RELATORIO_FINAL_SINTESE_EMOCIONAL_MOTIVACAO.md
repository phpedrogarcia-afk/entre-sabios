# Entrega final — síntese emocional e motivação do Entre Sábios

Data da consolidação: 14 de julho de 2026.

Branch local: `agent/finaliza-loop-estabilizacao`
HEAD de origem: `3d5d7fa`

## Resumo executivo

O roteiro das Fases 0 a 11 foi concluído de forma incremental. O website preserva o motor de seleção existente e acrescenta:

- contrato explícito para sentimento principal, até dois secundários, intensidade e motivação;
- sínteses humanas e direcionais para combinações revisadas;
- preferência opcional de motivação, separada de sentimento e intensidade;
- influência limitada da síntese e da motivação depois dos filtros rígidos;
- proteção reforçada para estados intensos vulneráveis;
- regressões automatizadas para hierarquia, segurança, rotação, autoria, formatos, acessibilidade estrutural e ausência de IA em produção.

O acervo permanece congelado em 283 conteúdos. Nenhuma frase, microtexto, reflexão principal, fonte ou autoria foi criada ou reclassificada neste roteiro.

## Arquitetura implementada

```text
seleção do usuário
  → contrato emocional normalizado
  → filtros de publicação, status e exclusões rígidas
  → segurança editorial e intensidade
  → nível do sentimento principal
  → compatibilidade dos secundários
  → preferência limitada da síntese
  → preferência motivacional opcional
  → trajetória, antirrepetição, autoria e formatos
  → conteúdo escolhido
```

Responsabilidades:

- `js/core/emotional-state.js`: normalização do estado e chave direcional.
- `js/data/emotional-syntheses.js`: catálogo editorial versionado.
- `js/core/emotional-synthesis.js`: resolução por tríade, par, modificador e fallback.
- `js/core/synthesis-ranking-adapter.js`: tradução dos sinais revisados para metadados existentes.
- `js/data/motivation-profiles.js`: perfis locais de preferência motivacional.
- `js/core/motivation-ranking-adapter.js`: preferência motivacional por sinais independentes.
- `js/core/runtime-engine.js`: elegibilidade, segurança, ranking, filas e histórico.
- `js/ui/feelings-ui.js`: principal, secundários, síntese e controle de motivação.

Não existe segundo seletor, segundo estado emocional nem caminho paralelo de ranking.

## Resultado por fase

| Fase | Entrega |
| --- | --- |
| 0 | Auditoria e arquitetura mínima, sem alteração funcional |
| 1 | Contrato de estado e linha de base protegida |
| 2 | Botão opcional “Preciso de motivação”, acessível e separado |
| 3 | Catálogo e resolvedor local de sínteses |
| 4 | Descrição humana na caixa de sentimentos |
| 5 | Troca sutil e explícita do sentimento principal |
| 6 | Síntese integrada ao ranking com influência limitada |
| 7 | Motivação integrada depois da síntese e dos filtros |
| 8 | Segurança intensa estendida durante toda a sequência |
| 9 | Regressão de antirrepetição, trajetória, formatos e autoria |
| 10 | Expansão controlada: oito novos pares aprovados |
| 11 | Regressão completa, build e aceite final automatizado |

## Estrutura das sínteses

Cada perfil específico registra:

- chave e direção;
- sentimento principal e secundários;
- descrição humana;
- temas internos;
- sinais preferidos já existentes no acervo;
- confiança e ambiguidade;
- justificativa editorial;
- status `proposed`, `reviewed` ou `disabled`.

Os oito perfis da Fase 10 também registram versão, autoria da proposta, revisor humano, data e documento de origem. Um perfil pode ser marcado como `disabled` e voltar ao fallback sem alteração do motor.

## Combinações ativas

Catálogo `1.1.0`: 29 pares direcionais e uma tríade.

- `autoconhecimento__confusao`
- `autoconhecimento__inseguranca`
- `confusao__autoconhecimento`
- `inseguranca__autoconhecimento`
- `luto__saudade`
- `saudade__luto`
- `amor__medo`
- `medo__amor`
- `ansiedade__medo`
- `medo__ansiedade`
- `tristeza__solidao`
- `solidao__tristeza`
- `raiva__culpa`
- `culpa__raiva`
- `falta_de_proposito__confusao`
- `confusao__falta_de_proposito`
- `falta_de_proposito__inseguranca`
- `esperanca__luto`
- `luto__esperanca`
- `amor__saudade`
- `saudade__amor`
- `ansiedade__autoconhecimento`
- `autoconhecimento__ansiedade`
- `inseguranca__amor`
- `amor__inseguranca`
- `culpa__tristeza`
- `tristeza__culpa`
- `falta_de_proposito__esperanca`
- `esperanca__falta_de_proposito`
- `autoconhecimento__confusao__inseguranca` (tríade)

As descrições exatas e suas justificativas estão registradas em `PROPOSTAS_SINTESES_FASE_3.md`, `PROPOSTAS_SINTESES_FASE_10_LOTE_2.md` e no catálogo ativo.

## Combinações com fallback

- 153 pares ainda não possuem perfil específico.
- 1.091 tríades ainda não possuem perfil exato.

Ordem de resolução:

1. tríade revisada;
2. par direcional revisado com modificador do segundo secundário;
3. perfil do principal com modificadores e descrição cautelosa;
4. fallback cauteloso geral;
5. algoritmo atual sem síntese, caso o catálogo esteja inválido ou indisponível.

O fallback visível não apresenta erro, score, confiança ou jargão técnico.

## Integração da motivação

A motivação:

- começa desligada;
- fica somente na sessão;
- não é sentimento nem intensidade;
- não muda o principal;
- não cria conteúdo;
- não torna conteúdo elegível;
- exige pelo menos duas dimensões independentes entre tema, função editorial e tom;
- reordena somente os itens restantes da fila;
- usa seleção normal quando não encontra sinal forte no melhor nível.

Fallbacks motivacionais reais permanecem registrados para Falta de propósito moderada/intensa, Ansiedade intensa, Raiva moderada e Autoconhecimento + Confusão + Insegurança. Nenhum conteúdo foi inventado para preencher essas lacunas.

## Segurança e vulnerabilidade

Para Luto, Tristeza, Insegurança, Culpa, Ansiedade, Solidão, Falta de propósito e Raiva intensos:

- ação e confronto pressionadores permanecem bloqueados durante toda a sequência;
- pressão por superação, conselho prematuro, culpabilização, moralização, agressividade e romantização permanecem bloqueados;
- motivação não contorna segurança, intensidade, publicação, status ou autoria;
- luto motivado significa continuidade mínima e respeitosa, nunca cobrança por superação.

Duas pendências herdadas de luto permanecem documentadas e bloqueadas pelos mecanismos existentes: `batch05-quote-021` e `curadoria-final-epicuro-luto-microtexto`.

## Antirrepetição e diversidade

- Histórico global e filas por contexto continuam persistentes.
- Conteúdo atual, ID, texto normalizado, passagem canônica, fragmento de origem, formulação próxima e conceito recente são evitados.
- Um ciclo percorre o conjunto elegível antes de repetir.
- Ligar ou desligar motivação reordena o restante sem apagar histórico.
- Em 800 seleções de estresse: 0 repetições exatas, normalizadas ou canônicas evitáveis.
- Em 120 transições mistas: 0 repetições imediatas evitáveis e 0 sequências evitáveis de três aparições do mesmo autor.
- Frase, microtexto, reflexão curta e citação longa continuam circulando.
- Preferências são relaxadas antes dos filtros rígidos; principal e segurança nunca são relaxados.

Quatro repetições inevitáveis apareceram após a posição 80 no cenário automatizado que alternava intensidades. No navegador com armazenamento limpo, Luto intenso apresentou 10 conteúdos distintos e registrou a primeira repetição inevitável na posição 11, sem alternativa segura restante. Portanto, “zero repetição” significa zero repetição **evitável**, e não ausência absoluta de repetição depois do esgotamento.

## Acessibilidade e responsividade

- Controles são nativos e operáveis por teclado.
- Botões possuem nomes acessíveis e estado `aria-pressed` quando aplicável.
- Mudança do principal e síntese usam regiões vivas.
- Motivação é descrita como preferência opcional.
- Layout preserva alvos mínimos e quebra de texto em mobile.
- Smartphone horizontal e tablet permanecem roláveis.
- Desktop mantém a estrutura de três colunas.
- Modo claro permanece padrão e modo noturno continua opcional.

A validação pós-correção foi repetida no Chrome real em 15 de julho de 2026. Foram confirmados 14 sentimentos, troca do principal, intensidade, motivação, rotação, recarga persistente, duplo clique, mobile em 390 × 844 e smartphone horizontal em 844 × 390, com zero erros de console. Essa validação encontrou e corrigiu também identificadores antigos de cache no HTML. As evidências estão em `RELATORIO_FASE_7_NAVEGADOR_REAL_ANTIRREPETICAO.md`.

## Testes antes e depois

| Medida | Linha de base | Entrega final |
| --- | ---: | ---: |
| Testes automatizados | linha de base anterior protegida | 196 aprovados |
| Falhas | 0 | 0 |
| Conteúdos ativos | 283 | 283 |
| Núcleos | 64 | 64 |
| Contextuais | 151 | 151 |
| Gerais | 68 | 68 |
| Versão do acervo | `definitiva-2.1` | `definitiva-2.1` |
| Pares específicos | 21 no primeiro lote | 29 aprovados |
| Tríades específicas | 1 | 1 |

Cobertura combinatória final:

- 546 cenários de principal + um secundário + intensidade;
- 3.276 combinações de principal + dois secundários + intensidade;
- 6.552 ordens de secundários comparadas;
- 84 configurações integradas com motivação ligada/desligada;
- 120 transições mistas com recarga.

## Arquivos envolvidos no roteiro

Principais arquivos funcionais:

- `index.html`
- `script.js`
- `css/components.css`
- `css/responsive.css`
- `js/core/emotional-state.js`
- `js/core/emotional-synthesis.js`
- `js/core/matching.js`
- `js/core/runtime-engine.js`
- `js/core/synthesis-ranking-adapter.js`
- `js/core/motivation-ranking-adapter.js`
- `js/data/emotional-syntheses.js`
- `js/data/motivation-profiles.js`
- `js/ui/feelings-ui.js`

Testes acrescentados ou fortalecidos:

- `tests/emotional-state-contract.test.mjs`
- `tests/emotional-synthesis.test.mjs`
- `tests/motivation-control.test.mjs`
- `tests/motivation-ranking.test.mjs`
- `tests/principal-focus-control.test.mjs`
- `tests/synthesis-interface.test.mjs`
- `tests/synthesis-ranking.test.mjs`
- `tests/vulnerable-motivation-safety.test.mjs`
- `tests/phase9-rotation-integration.test.mjs`
- `tests/phase11-final-acceptance.test.mjs`
- `tests/repetition-real-path-regression.test.mjs`
- `tests/repetition-stress.test.mjs`

Correções adjacentes aprovadas durante o trabalho preservaram “Conheça o pensador”, orientação específica e a moldura independente da recomendação de livro; elas não substituíram a arquitetura acima.

## Pendências editoriais e técnicas

- Expansão futura dos 153 pares e 1.091 tríades deve continuar em lotes pequenos, com aprovação humana anterior à ativação.
- Lacunas motivacionais devem continuar como fallback enquanto o acervo não oferece sinais suficientes.
- As duas pendências herdadas de luto não foram reclassificadas.
- O site mantém integrações externas históricas de analytics, anúncios e Firebase; a síntese e a motivação não usam rede nem IA.
- A auditoria dos 45 objetos `reviewed` está documentada em `AUDITORIA_STATUS_REVIEWED_SINTESES.md`: oito possuem evidência completa, 23 possuem evidência documental parcial e 14 perfis principais aguardam comprovação ou decisão editorial específica.

## Itens locais protegidos e fora do escopo

As remoções locais de `.gitignore` e `README.md` e os arquivos `css/modals-PEDRO.css`, `js/data/tales-PEDRO.js` e `js/features/tales-PEDRO.js` não foram alterados, restaurados, adicionados ao Git ou incluídos nesta entrega.

## Confirmações finais

- [x] Implementação incremental e arquitetura atual preservada.
- [x] Sentimento principal continua dominante.
- [x] Secundários apenas refinam.
- [x] Combinações são direcionais.
- [x] Ordem dos secundários não duplica sínteses.
- [x] “Falta de propósito” permanece sentimento.
- [x] Motivação não virou sentimento ou intensidade.
- [x] Segurança prevalece sobre síntese e motivação.
- [x] Descrições são humanas, não diagnósticas e sem jargão visível.
- [x] Nenhuma frase ou autoria foi inventada ou refeita.
- [x] Antirrepetição, trajetória, autoria e formatos foram preservados.
- [x] Fallbacks são cautelosos e honestos.
- [x] Não existe dependência de IA em produção.
- [x] Acervo mestre permanece no SHA-256 `288652d619833b4081f616472241e37e8a2f30b165f3c36a214bea1e654fce5c`.
- [x] Build reproduzível e 196/196 testes aprovados.
- [x] Não houve duplicação de trabalho do loop anterior.

## Estado operacional

Este documento foi corrigido depois dos testes de estresse e da validação em navegador real. O estado da integração Git deve ser consultado no relatório consolidado do loop de antirrepetição; nenhuma afirmação anterior de aceite automatizado substitui a evidência das Fases 6 e 7.

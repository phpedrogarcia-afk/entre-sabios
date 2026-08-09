# Registro de decisões — Entre Sábios

> Registro enxuto das decisões vigentes. Este arquivo não autoriza trabalho futuro: ele impede que uma nova tarefa reimplemente ou desfaça mecanismos já aprovados.

## Estados

- `vigente`: deve ser preservada;
- `em revisão`: não alterar até nova decisão;
- `substituída`: permanece apenas como histórico;
- `regredida`: comportamento aprovado deixou de funcionar e pode ser corrigido na menor unidade possível.

## Decisões vigentes

### DEC-001 — O acervo-mestre é a fonte editorial canônica

- **Data:** 13/07/2026
- **Estado:** vigente
- **Decisão:** conteúdo publicado é editado em `entre_sabios_acervo_mestre_final.json`; `data/entre_sabios_runtime.json` e `.js` são derivados.
- **Motivo:** impedir divergência entre versões do acervo.
- **Arquivos:** mestre, `scripts/content-build-lib.mjs`, runtime gerado.
- **Testes:** `tests/content-runtime.test.mjs`.
- **Revisão:** somente se o processo de geração do acervo for formalmente substituído.

### DEC-002 — O sentimento principal é soberano

- **Data:** 14/07/2026
- **Estado:** vigente
- **Decisão:** sentimentos secundários, síntese, motivação, formato, autoria e diversidade não podem fazer conteúdo pouco relacionado ao principal vencer.
- **Motivo:** preservar precisão emocional e previsibilidade.
- **Arquivos:** `js/core/emotional-state.js`, `js/core/runtime-engine.js` e adaptadores.
- **Testes:** `principal-focus-control`, `behavioral-selection`, `synthesis-ranking` e `motivation-ranking`.
- **Revisão:** exige nova fase aprovada e comparação comportamental completa.

### DEC-003 — O principal só muda por ação explícita

- **Data:** 14/07/2026
- **Estado:** vigente
- **Decisão:** ordem dos secundários, intensidade, “Outra perspectiva” e retorno a uma combinação não podem trocar silenciosamente o principal.
- **Motivo:** manter o contrato apresentado pela interface.
- **Arquivos:** `js/ui/feelings-ui.js`, `js/core/emotional-state.js`.
- **Testes:** `emotional-state-contract` e `principal-focus-control`.

### DEC-004 — Síntese emocional tem influência limitada

- **Data:** 14/07/2026
- **Estado:** vigente
- **Decisão:** sínteses podem refinar sinais dentro do conjunto elegível; não criam conteúdo, não alteram intensidade e não promovem nível inferior.
- **Motivo:** acrescentar contexto sem substituir a inteligência de seleção existente.
- **Arquivos:** `js/data/emotional-syntheses.js`, `js/core/emotional-synthesis.js`, `js/core/synthesis-ranking-adapter.js`.
- **Testes:** testes de síntese e aceitação final.

### DEC-005 — Motivação é uma direção opcional e segura

- **Data:** 14/07/2026
- **Estado:** substituída
- **Substituída por:** `DEC-034`.
- **Decisão:** desligada é neutra; ligada exige sinais independentes e permanece subordinada a sentimento, intensidade, segurança e publicação.
- **Motivo:** oferecer impulso sem converter sofrimento em pressão por superação.
- **Arquivos:** `js/data/motivation-profiles.js`, `js/core/motivation-ranking-adapter.js`.
- **Testes:** motivação e segurança vulnerável.

### DEC-006 — Preferência pessoal de autoria não participa da seleção

- **Data:** 14/07/2026
- **Estado:** vigente
- **Decisão:** remover a interface e o aprendizado por autor/gênero; preservar autoria, fonte, classificação e metadados editoriais.
- **Motivo:** evitar repetição e viés de autoria provocado por curtidas anteriores.
- **Arquivos:** interface, feedback e runtime engine.
- **Testes:** `gender-preference-removal` e `authorship-presentation`.

### DEC-007 — Repetição exata deve esperar o esgotamento seguro

- **Data:** 15/07/2026
- **Estado:** vigente
- **Decisão:** bloquear ID, texto normalizado e equivalência canônica recentes; relaxar autoria antes de liberar repetição exata; persistir histórico entre contextos e recargas.
- **Motivo:** impedir repetição precoce sem sacrificar a hierarquia do sentimento principal.
- **Arquivos:** `js/core/runtime-engine.js`, `js/core/matching.js`, `script.js`.
- **Testes:** `repetition-stress`, `repetition-real-path-regression`, `runtime-selection` e navegador real.
- **Limite:** repetição é inevitável quando o conjunto seguro do nível ativo é integralmente percorrido.

### DEC-008 — “Conheça o pensador” e orientação são blocos independentes

- **Data:** 14/07/2026
- **Estado:** substituída
- **Substituída por:** `DEC-025`.
- **Decisão:** “Algo para levar consigo” não substitui a apresentação do autor; orientação sem conteúdo específico deve ser ocultada.
- **Motivo:** corrigir interpretação anterior que misturou autoria e conselho.
- **Arquivos:** `js/ui/reflection-ui.js`, `script.js`, dados editoriais.
- **Testes:** apresentação de autoria, orientação e interface.

### DEC-009 — Recomendação de livro mantém bloco visual próprio

- **Data:** 14/07/2026
- **Estado:** vigente
- **Decisão:** recomendação e justificativa aparecem em quadro independente, semelhante aos demais blocos editoriais.
- **Motivo:** preservar legibilidade e hierarquia visual.
- **Arquivos:** `index.html`, `css/components.css`, `js/ui/reflection-ui.js`.
- **Testes:** livros e interface.

### DEC-010 — Compartilhamento rápido sorteia entre os três estilos existentes

- **Data:** 14/07/2026
- **Estado:** vigente
- **Decisão:** cada geração rápida sorteia `cream`, `sage` ou `blue`; seleção manual continua determinística; nenhum quarto estilo deve ser criado sem aprovação.
- **Motivo:** variedade sem ampliar o sistema visual.
- **Arquivos:** `js/data/share-themes.js`, `js/features/sharing.js`, `script.js`.
- **Testes:** imagem de compartilhamento e aceitação final.

### DEC-011 — O botão “copiar mensagem” não deve retornar

- **Data:** 14/07/2026
- **Estado:** vigente
- **Decisão:** compartilhamento usa imagem, Web Share e download; não restaurar o botão de cópia.
- **Motivo:** decisão explícita de interface.
- **Testes:** `tests/copy-removal-sharing.test.mjs`.

### DEC-012 — Modo claro é o padrão

- **Data:** 13/07/2026
- **Estado:** vigente
- **Decisão:** `Luz do Dia` abre por padrão; o modo noturno é opcional e persistente.
- **Motivo:** preferência visual aprovada e legibilidade.
- **Arquivos:** `js/ui/theme-ui.js`, CSS base e responsivo.
- **Testes:** wiring de interface e validações visuais anteriores.

### DEC-013 — Arquivos `-PEDRO` são paralelos, não ativos

- **Data:** 15/07/2026
- **Estado:** em revisão
- **Decisão:** não carregar, editar, apagar ou adicionar esses arquivos ao Git sem comparação e autorização explícita.
- **Motivo:** evitar duas soluções concorrentes para a mesma responsabilidade.
- **Observação:** na auditoria de 15/07/2026, as três cópias eram byte a byte iguais às versões ativas.

### DEC-014 — Validação possui grupos rápidos e regressão completa

- **Data:** 15/07/2026
- **Estado:** vigente
- **Decisão:** a IA executa primeiro o grupo mínimo do domínio e depois a regressão proporcional ao risco; `npm run verify` confere o runtime sem escrita e executa todos os testes no CI.
- **Motivo:** reduzir o tempo de diagnóstico sem substituir a proteção completa antes de integração.
- **Arquivos:** `package.json`, `scripts/run-tests.mjs`, `scripts/build-content.mjs`, `.github/workflows/verify.yml`.
- **Testes:** os próprios grupos validam a lista de arquivos antes de iniciar o Node Test Runner.
- **Revisão:** atualizar os grupos quando um novo arquivo de teste adquirir responsabilidade de domínio ou custo de estresse.

### DEC-015 — IDs de sentimentos seguem o catálogo do mestre

- **Data:** 15/07/2026
- **Estado:** vigente
- **Decisão:** IDs técnicos usam a forma canônica sem acentos declarada em `entre_sabios_acervo_mestre_final.json`; rótulos e temas continuam em português com acentuação normal.
- **Motivo:** impedir que a normalização esconda divergências entre mestre, runtime, bootstrap, taxonomia, síntese e motivação.
- **Arquivos:** mestre, `js/data/catalogs.js`, runtime derivado e `tests/canonical-contracts.test.mjs`.
- **Testes:** contratos canônicos verificam conjunto de IDs, rótulos, referências auxiliares, versão do loader e marcadores de cache.
- **Observação:** a ordem visual do catálogo de bootstrap foi preservada; somente os IDs foram alinhados.
- **Revisão:** qualquer novo sentimento deve entrar primeiro no catálogo do mestre e passar pelo build e pelos contratos.

### DEC-016 — Diagnósticos exportados podem ser reproduzidos fora do navegador

- **Data:** 15/07/2026
- **Estado:** vigente
- **Decisão:** sessões JSON de diagnóstico no esquema v1 são validadas e reproduzidas localmente a partir da fila e dos históricos registrados antes de cada seleção.
- **Motivo:** transformar relatos de escolha divergente ou repetição em evidência reproduzível, sem criar uma segunda implementação do algoritmo.
- **Arquivos:** `scripts/diagnostic-replay-lib.mjs`, `scripts/replay-diagnostic.mjs`, `tests/diagnostic-replay.test.mjs`.
- **Testes:** fixture mínima, sequência com histórico e mudança de motivação, divergência intencional e esquema inválido.
- **Limite:** o replay usa o runtime existente no checkout; divergências são esperadas se o JSON tiver sido exportado contra outro acervo ou outra versão do motor.
- **Revisão:** uma mudança incompatível no formato exportado exige novo `schemaVersion`, sem reinterpretar silenciosamente sessões antigas.

### DEC-017 — Análise estática começa sem dependências e sem formatação em massa

- **Data:** 16/07/2026
- **Estado:** vigente
- **Decisão:** usar o próprio Node para validar sintaxe JS/MJS, imports relativos e parsing de JSON antes do build e dos testes.
- **Motivo:** cobrir falhas objetivas de baixo custo sem introduzir ESLint, Prettier, TypeScript ou um diff amplo sem demanda comprovada.
- **Arquivos:** `scripts/static-check.mjs`, `tests/static-check.test.mjs`, `package.json`.
- **Testes:** descoberta dos arquivos, exclusão explícita das cópias `-PEDRO` e reconhecimento de imports estáticos, dinâmicos e reexports.
- **Limite:** a checagem não detecta todos os problemas semânticos, código morto ou erros de interação; testes de domínio e navegador continuam necessários.
- **Revisão:** adotar ferramenta adicional somente quando uma classe recorrente de falha justificar seu custo e puder ser introduzida gradualmente.

### DEC-018 — A analogia das cores usa relações estruturadas e limitadas

- **Data:** 16/07/2026
- **Estado:** vigente.
- **Decisão:** os pares e a tríade já aprovados recebem `relationType`; o adaptador usa políticas estruturadas de função editorial e tom somente dentro da elegibilidade segura. Perfis sem campo usam `context`.
- **Motivo:** tornar a relação entre principal e secundários mensurável sem analisar a descrição humana, criar um segundo motor ou expandir o catálogo.
- **Arquivos:** `js/data/emotional-syntheses.js`, `js/core/emotional-synthesis.js`, `js/core/synthesis-ranking-adapter.js`.
- **Testes:** `tests/color-analogy-contract.test.mjs` e grupos de síntese, ranking, motivação e rotação.
- **Revisão:** novos pares, tríades ou mudanças de classificação exigem curadoria editorial explícita; não inferir relações em massa.

### DEC-019 — Métricas emocionais permanecem fora do ranking de produção

- **Data:** 16/07/2026
- **Estado:** vigente.
- **Decisão:** o laboratório reutiliza o runtime real para medir influência, retenção, repetição, cobertura, concentração, fallback e formatos; seus resultados não são importados pela página nem convertidos automaticamente em pesos.
- **Motivo:** tornar falhas mensuráveis sem criar um segundo motor ou ajustar o algoritmo com limites arbitrários.
- **Arquivos:** `scripts/emotional-lab-lib.mjs`, `scripts/run-emotional-lab.mjs`, `tests/emotional-lab.test.mjs`.
- **Testes:** grupo `test:lab` e regressão completa.
- **Revisão:** calibrar alertas numéricos somente depois da distribuição dos 14 sentimentos e três intensidades na Fase 10.

### DEC-020 — Mudanças assistidas por IA passam por preflight e barreira de contradição

- **Data:** 16/07/2026
- **Estado:** vigente.
- **Decisão:** antes de editar, classificar o pedido, consultar estado, decisões e fonte canônica; pedidos que desfaçam decisão vigente exigem explicação do impacto e confirmação explícita de substituição.
- **Motivo:** impedir reimplementação, trabalho circular e regressões provocadas por instruções novas incompatíveis com comportamentos aprovados.
- **Arquivos:** `AGENTS.md`, `PROJECT_STATUS.md`, `REGISTRO_PROBLEMAS_RECORRENTES.md`, verificador de governança e skill pessoal `entre-sabios-guardian`.
- **Testes:** contratos de governança e verificação completa.
- **Revisão:** o protocolo pode ser simplificado se permanecer verificável; nenhuma automação pode decidir sozinha substituir uma decisão de produto.

### DEC-021 — Publicação usa allowlist e validação de referências

- **Data:** 16/07/2026
- **Estado:** vigente.
- **Decisão:** o pacote público é definido por `deploy-manifest.json`; mestre, testes, relatórios, ferramentas, arquivos `-PEDRO` e arquivos compactados não entram na hospedagem.
- **Motivo:** impedir publicação de fontes internas, versões paralelas ou pacotes errados sem alterar a estrutura ativa do site.
- **Arquivos:** manifesto e scripts de verificação e empacotamento.
- **Testes:** `tests/deploy-manifest.test.mjs` e `npm run check:deploy`.
- **Revisão:** todo novo recurso carregado pelo site deve entrar conscientemente na allowlist e manter referências locais resolvidas.

### DEC-022 — Navegador automatizado protege caminhos visuais críticos

- **Data:** 16/07/2026
- **Estado:** vigente.
- **Decisão:** executar smoke test em Chromium para mudanças de HTML, CSS, runtime, JavaScript de produção ou no próprio teste; cobrir geração, outra perspectiva, cinco viewports e rolagem móvel de contos.
- **Motivo:** transformar regressões recorrentes de carregamento, responsividade e rolagem em proteção executável, sem substituir validação física final quando necessária.
- **Arquivos:** `playwright.config.mjs`, `tests/browser/critical-paths.spec.mjs`, workflow `browser-smoke.yml`.
- **Testes:** `npm run test:browser`.
- **Revisão:** ampliar navegadores ou cenários apenas quando uma falha concreta justificar o custo adicional.

### DEC-023 — Intensidade começa neutra e exige escolha explícita

- **Data:** 16/07/2026
- **Estado:** substituída
- **Substituída por:** `DEC-026`.
- **Decisão:** antes da escolha da pessoa, a intensidade é ausente (`null`) e não presume `moderada`; `fraca`, `moderada` e `intensa` continuam sendo as únicas intensidades editoriais válidas. O estado neutro não é uma quarta intensidade, não participa da elegibilidade e não permite gerar uma reflexão até que uma intensidade válida seja escolhida explicitamente. Entrada ausente ou inválida não deve ser convertida silenciosamente em `moderada` no fluxo de produção.
- **Motivo:** impedir que o sistema atribua profundidade emocional sem escolha da pessoa e alinhar o comportamento executável ao contrato permanente do produto.
- **Alternativas rejeitadas:** manter `moderada` marcada por padrão; criar uma quarta intensidade `neutra`; permitir seleção de conteúdo sem intensidade explícita.
- **Implementação:** dividir em tarefas separadas: primeiro o contrato do estado e suas validações, sem interface; depois o controle visual e a mensagem de escolha obrigatória, sem alterar ranking ou acervo.
- **Migração:** não há migração de acervo nem de filas; a intensidade não ganha novo valor persistido e contextos válidos continuam usando somente `fraca`, `moderada` ou `intensa`.
- **Arquivos previstos:** `js/core/emotional-state.js` e testes de estado na fase de contrato; `script.js`, `index.html`, `js/ui/feelings-ui.js` e testes de interface na fase visual.
- **Testes:** contrato deve rejeitar ausência/invalidez sem fallback moderado; interface deve impedir geração até escolha explícita; cada fase executa testes específicos e `npm run verify`.
- **Revisão:** qualquer retorno a uma intensidade presumida exige substituir explicitamente esta decisão e reavaliar o impacto editorial e de segurança.

### DEC-024 — Autoria desconhecida não se transforma em autoria editorial

- **Data:** 16/07/2026
- **Estado:** vigente.
- **Decisão:** autoria, fonte, adaptação e curadoria são campos independentes. O Entre Sábios e o editor-chefe não recebem crédito autoral por ausência de identificação. Conteúdos nominalmente protegidos permanecem no `NUCLEO_PRESERVACAO_EDITORIAL.md`, sem publicação automática, remoção, substituição ou reescrita silenciosa.
- **Motivo:** preservar honestidade documental, linhagem editorial e conteúdos fornecidos diretamente pelo editor-chefe sem inventar completude.
- **Formas aprovadas:** `Autoria não identificada`; `Texto de circulação contemporânea — autoria não identificada` somente com evidência; `Adaptação de texto de autoria não identificada`; `Inspirado em texto de autoria não identificada` somente após transformação substancial; `Autoria preservada` ou `Autoria não divulgada` quando a identidade for conhecida internamente.
- **Alternativas rejeitadas:** atribuir automaticamente ao Entre Sábios ou ao editor-chefe; usar `inspirado em` para encobrir paráfrase próxima; chamar de contemporâneo sem evidência; apagar versão anterior; tratar proteção como aprovação automática.
- **Implementação:** política canônica no padrão editorial e registro separado do Núcleo de Preservação. A futura integração no mestre será individual e dependerá da aprovação do contrato entre acervo e algoritmo.
- **Arquivos:** `PADRAO_EDITORIAL_ENTRE_SABIOS.md`, `NUCLEO_PRESERVACAO_EDITORIAL.md`, `PROJECT_STATUS.md`.
- **Testes:** `npm run check:governance`, testes selecionados pelo diff e `npm run verify`.
- **Revisão:** alterar formas públicas, remover uma proteção ou consolidar versões exige decisão individual do editor-chefe; mudança em massa do acervo não é autorizada por esta decisão.

### DEC-025 — Quatro blocos editoriais canônicos cobrem todo o acervo publicado

- **Data:** 17/07/2026
- **Estado:** vigente.
- **Decisão:** a experiência principal conserva, com estes nomes exatos, os blocos `O QUE ESSA FRASE QUER DIZER`, `CONHEÇA O PENSADOR`, `UMA PERGUNTA` e `LIVRO RECOMENDADO`. O contrato final exige conteúdo verdadeiro, específico e relevante nos quatro blocos para cada item publicado do acervo.
- **Função dos blocos:** `O QUE ESSA FRASE QUER DIZER` oferece uma possibilidade de leitura, sem interpretação definitiva; `CONHEÇA O PENSADOR` apresenta brevemente o autor, a tradição ou a proveniência documentada em relação com o texto, sem inventar autoria; `UMA PERGUNTA` abre observação interior sem conselho disfarçado, acusação, moralismo ou linguagem terapêutica; `LIVRO RECOMENDADO` prolonga de forma substantiva a ideia central, priorizando obra do mesmo autor quando ela realmente aprofundar o tema e admitindo outro autor somente com diálogo conceitual claro.
- **Cobertura:** a exibição universal não pode ser simulada por bloco vazio, texto genérico, biografia inventada, recomendação baseada apenas em palavras semelhantes ou troca automática de um conselho por uma frase interrogativa. Lacunas devem ser auditadas e completadas por revisão editorial antes de a cobertura de todo o acervo ser declarada concluída.
- **Compatibilidade:** a decisão substitui a regra de ocultação da orientação da `DEC-008`, preserva o bloco visual independente de livros da `DEC-009` e não cria novo motor, ranking ou função editorial.
- **Implementação:** governança, auditoria de cobertura, interface, conteúdo editorial e relações de livros são fases separadas. Esta decisão não autoriza reclassificação ou preenchimento automático em massa do acervo.
- **Arquivos nesta fase:** `DECISIONS.md`, `PADRAO_EDITORIAL_ENTRE_SABIOS.md`, `PROJECT_STATUS.md` e teste de governança.
- **Testes:** contrato de governança nesta fase; nas fases executáveis, testes de apresentação, autoria, perguntas, livros, interface e navegador, além de `npm run verify`.
- **Revisão:** alterar os quatro nomes, dispensar um bloco ou admitir conteúdo genérico exige nova decisão explícita do editor-chefe.

### DEC-026 — Ausência de escolha usa intensidade moderada sem seleção visual

- **Data:** 17/07/2026
- **Estado:** substituída
- **Substituída por:** `DEC-027`.
- **Decisão:** nenhuma opção de intensidade começa visualmente selecionada e a pessoa pode gerar uma reflexão sem escolher uma delas. Nesse caso, somente para a seleção interna, a ausência (`null`) é interpretada como `moderada`. Se a pessoa escolher `fraca`, `moderada` ou `intensa`, sua escolha explícita prevalece. O fallback interno não deve ser exibido nem persistido como se fosse uma escolha feita pela pessoa.
- **Limite:** `moderada` continua sendo uma das três intensidades editoriais existentes, não uma quarta opção. Apenas ausência de escolha recebe o fallback; valor explícito inválido continua sendo rejeitado, e nenhuma regra de segurança, soberania do sentimento principal ou elegibilidade pode ser relaxada.
- **Motivo:** manter a interface neutra e opcional sem bloquear a experiência de quem prefere não indicar como deseja receber a reflexão.
- **Alternativas rejeitadas:** pré-selecionar visualmente `moderada`; obrigar escolha; criar intensidade `neutra`; registrar o fallback como preferência declarada pelo usuário.
- **Migração:** não há mudança no acervo, nas filas persistentes ou no enum de intensidades. A futura fase técnica substituirá o bloqueio atual pelo fallback na entrada canônica, sem criar um segundo caminho de seleção.
- **Implementação:** concluída na entrada canônica do estado emocional e na interface, sem modificar acervo, livros, ranking ou enum de intensidades. O controle permanece visualmente neutro e o bloqueio por ausência de escolha foi removido.
- **Arquivos:** `js/core/emotional-state.js`, `js/ui/feelings-ui.js`, `script.js`, `index.html`, documentação viva e testes de estado, interface e navegador.
- **Testes:** ausência gera com fallback moderado; nenhuma opção aparece marcada; escolha explícita prevalece; valor inválido é rejeitado; segurança e sentimento principal permanecem preservados; executar `npm run verify` e navegador na fase técnica.
- **Revisão:** tornar a escolha obrigatória, pré-marcar uma opção ou mudar o fallback exige substituir explicitamente esta decisão.

### DEC-027 — Neutralidade visual sorteia a intensidade a cada geração

- **Data:** 17/07/2026
- **Estado:** substituída.
- **Substituída por:** `DEC-034`.
- **Decisão:** o controle exibe `Delicado`, `Equilibrado` e `Profundo`, mapeados internamente para `fraca`, `moderada` e `intensa`. Nenhuma opção começa selecionada. Sem escolha explícita, cada geração e cada pedido de outra perspectiva sorteiam novamente uma das três intensidades com igual possibilidade; o resultado não é exibido nem persistido como escolha da pessoa. Uma escolha explícita sempre prevalece.
- **Arquitetura:** o sorteio resolve somente a intensidade de entrada. Depois disso, o motor existente continua determinístico para o estado resolvido, sem segundo ranking, trajetória ou seletor paralelo.
- **Segurança:** a intensidade sorteada passa pelos mesmos filtros rígidos de elegibilidade, exclusão e segurança. O sorteio não pode tornar conteúdo inadequado elegível nem superar o sentimento principal.
- **Limite:** valor explícito inválido continua sendo rejeitado; `neutra` não se torna uma quarta intensidade; acervo, livros, filas e enum permanecem inalterados.
- **Motivo:** permitir que a ausência de preferência produza variedade real de profundidade sem representar visualmente uma escolha que a pessoa não fez.
- **Alternativas rejeitadas:** fallback fixo moderado; opção visual pré-marcada; sorteio de conteúdo fora do motor; persistir a intensidade sorteada como preferência.
- **Implementação:** sorteio isolado antes de cada chamada ao seletor; contrato emocional permanece neutro antes da geração; a intensidade resolvida acompanha somente o estado da reflexão gerada.
- **Arquivos:** `js/core/emotional-state.js`, `js/core/matching.js`, `script.js`, `index.html`, documentação viva e testes de estado, interface, governança e navegador.
- **Testes:** cobrir os três intervalos do sorteio, soberania da escolha explícita, rejeição de valor inválido, neutralidade visual, geração sem escolha, segurança, ranking, rotação e navegador.
- **Revisão:** alterar distribuição, frequência do sorteio, nomes visíveis ou persistência exige nova decisão explícita do editor-chefe.

### DEC-028 — Contos usam Equilibrado quando a intensidade não foi escolhida

- **Data:** 17/07/2026
- **Estado:** substituída.
- **Substituída por:** `DEC-034`.
- **Decisão:** a seleção de contos respeita `Delicado`, `Equilibrado` ou `Profundo` quando houver escolha explícita. Sem escolha, usa internamente `moderada` (`Equilibrado`) e abre o conto sem marcar qualquer opção na interface.
- **Compatibilidade:** esta regra é exclusiva dos contos. A reflexão continua sorteando sua intensidade a cada geração conforme a `DEC-027`; abrir um conto não altera, persiste ou representa uma escolha de intensidade da pessoa.
- **Motivo:** manter o acesso aos contos estável e cauteloso mesmo quando a pessoa prefere deixar o controle de intensidade neutro.
- **Alternativas rejeitadas:** exigir intensidade para abrir conto; reutilizar a intensidade aleatória da reflexão; marcar visualmente `Equilibrado`; criar intensidade `neutra` no catálogo de contos.
- **Implementação:** resolver a intensidade do conto antes de interpretar o estado usado pela rotação existente, sem criar segundo seletor ou alterar o catálogo de contos.
- **Arquivos:** `js/features/tales.js`, documentação viva e testes de interface, governança e navegador.
- **Testes:** conto abre sem intensidade selecionada, interface permanece neutra, escolha explícita continua soberana e rolagem móvel permanece funcional.
- **Revisão:** mudar o fallback dos contos ou vinculá-lo novamente ao sorteio da reflexão exige nova decisão explícita do editor-chefe.

### DEC-029 — Antologia do Silêncio sai do acervo ativo por proveniência artificial confirmada

- **Data:** 18/07/2026.
- **Estado:** vigente.
- **Decisão:** retirar da publicação os 28 IDs cuja coleção de origem é `antologia_do_silencio.pdf`, mantendo-os no acervo-mestre como `REMOVIDO`, com publicação desabilitada e preservação integral de ID, texto, fonte, metadados anteriores e histórico de mudança.
- **Evidência:** o editor-chefe confirmou explicitamente que a “Antologia do Silêncio” foi integralmente gerada por IA. A decisão se apoia nessa confirmação humana de proveniência, não em inferência de estilo. O documento local conferido possui SHA-256 `5A50EC38496DE7B3C737938E72999290807AEC3556FB29EC09D5A2A6FAAC5A8B`.
- **Compatibilidade:** a decisão aplica a honestidade documental da `DEC-024`; não a substitui. Adaptações da atualização mais recente, conteúdos baseados em autores, textos protegidos e os demais originais não pertencentes à coleção ficam expressamente fora do escopo.
- **Migração:** o runtime passa de 289 para 261 conteúdos ativos e a versão muda para `definitiva-2.2`, invalidando filas e históricos versionados antigos sem apagar favoritos. Não haverá preenchimento automático das lacunas deixadas pela coleção.
- **Motivo:** impedir que conteúdo artificial seja publicado como criação autoral do Entre Sábios e, ao mesmo tempo, preservar a rastreabilidade editorial e a possibilidade de auditoria futura.
- **Alternativas rejeitadas:** apagar definitivamente os registros; manter a atribuição ao Entre Sábios; reclassificar a coleção como autoria desconhecida; substituir os textos em massa; remover adaptações ou conteúdos autorais não abrangidos pela confirmação.
- **Arquivos:** acervo-mestre, runtime gerado, `docs/ARQUIVO_REJEITADOS_ANTOLOGIA_IA.md`, padrão editorial, documentação viva e contratos de versão/conteúdo.
- **Testes:** build e check de conteúdo, auditoria dos quatro blocos, testes editoriais, seleção/rotação, navegador e `npm run verify`.
- **Revisão:** reativar qualquer ID da coleção exige nova evidência individual de autoria humana e decisão explícita do editor-chefe.

### DEC-030 — Auditoria completa separa ausência de prova de fabricação artificial

- **Data:** 18/07/2026.
- **Estado:** substituída.
- **Substituição:** a `DEC-031` substitui apenas a preservação automática de originais G sem base autoral; o protocolo A–J e a vedação de inferência artificial baseada somente em estilo permanecem vigentes.
- **Decisão:** os 350 IDs históricos recebem classificação individual A–J, dupla leitura de proveniência e qualidade e uma decisão registrada. Categoria E exige obra, conceito ou tradição específica; autor isolado permanece G. Categoria G não é prova de IA e não autoriza retirada. Conforme determinação expressa do editor-chefe, inspirações baseadas em autores, originais, adaptações e conteúdos protegidos permanecem preservados enquanto não houver evidência individual de fabricação artificial.
- **Resultado ativo:** 261 conteúdos: 3 em A, 15 em B, 1 em C, 3 em D, 76 em E e 163 em G. Nenhum ativo recebeu H, I ou J. Os 28 itens I são exclusivamente a Antologia já retirada; 60 rejeições J anteriores permanecem históricas.
- **Referências pendentes:** B e C são conclusões documentais honestas previstas no protocolo, não falhas a serem escondidas. Uma fonte futura pode elevar a classificação, mas edição, página, tradução ou passagem não serão inventadas para produzir completude artificial.
- **Qualidade:** fórmulas, clichês, intercambiabilidade e fragilidade literária são sinais editoriais separados. Não demonstram autoria artificial e não desfazem a ordem do editor-chefe de preservar os conteúdos baseados em autores.
- **Arquivos:** `docs/AUDITORIA_PROVENIENCIA_COMPLETA_2026-07-18.json`, resumo, 14 lotes, gerador reproduzível, padrão editorial e estado vivo.
- **Testes:** contrato de cobertura dos 350 IDs, exclusividade da categoria I, preservação dos grupos protegidos, âncoras de E, declaração de G e rastreabilidade dos 14 lotes.
- **Revisão:** reclassificação futura é individual e exige nova evidência; remoção por H ou I exige prova ou confirmação humana explícita.

### DEC-031 — Crédito integral ao Entre Sábios exige base autoral humana

- **Data:** 18/07/2026.
- **Estado:** vigente.
- **Decisão:** retirar da publicação quatro reformulações confirmadas pelo editor-chefe como produzidas por IA sem base em autor, obra ou tradição e indevidamente creditadas integralmente ao Entre Sábios: `Reflexão contemporânea-1`, `Reflexão contemporânea-2`, `ES-INS-VERGONHA-001` e `Reflexão contemporânea-4`. Preservar os IDs, textos, versões anteriores e metadados no mestre como histórico `REMOVIDO`.
- **Escopo preservado:** todos os conteúdos apresentados como inspirados em autores permanecem fora desta retirada, inclusive `batch04-quote-038` (“O ciúme costuma escrever romances inteiros com meia linha de realidade.”), inspirado em Machado de Assis. Citações, traduções, tradições, adaptações, autoria não identificada e conteúdos protegidos também permanecem.
- **Evidência:** confirmação expressa do editor-chefe após apresentação do conflito com a `DEC-030`. Os quatro registros eram os únicos ativos com `displayedAuthor` exatamente `Entre Sábios`; pertenciam ao mesmo desdobramento de `Reflexão contemporânea-0` e não registravam `inspirationSource`.
- **Compatibilidade:** substitui somente a proteção automática dos originais G prevista na `DEC-030`. Mantém a regra de que estilo ruim, fórmula ou origem em lote não provam IA sem confirmação humana. O texto longo `Reflexão contemporânea-0` permanece historicamente em `MOVER_PARA_TEXTOS`; citações e inspirações de Nietzsche permanecem intactas.
- **Migração:** runtime de `definitiva-2.2` com 261 ativos para `definitiva-2.3` com 257 ativos; 42 núcleos, 149 contextuais e 66 gerais. Nenhum texto substituto é criado.
- **Arquivos:** mestre, runtime gerado, `docs/ARQUIVO_REJEITADOS_ORIGINAIS_IA_SEM_BASE.md`, dossiê A–J, padrão editorial, documentação viva e testes.
- **Testes:** ausência de crédito integral ativo ao Entre Sábios, preservação das 234 inspirações, proteção explícita do exemplo de Machado de Assis, quatro IDs históricos removidos, runtime reproduzível e regressão completa.
- **Revisão:** reativação exige evidência humana individual ou base autoral documentada e nova decisão explícita do editor-chefe.

### DEC-032 — Revisão dos contos usa catálogo provisório e lotes editoriais

- **Data:** 18/07/2026.
- **Estado:** vigente.
- **Decisão:** até existir um gerador canônico para as páginas de contos, `js/data/tales.js` funciona como fonte editorial provisória dos 33 contos exibidos no diálogo. Cada revisão ocorre em lote de três contos, com sincronização manual somente das páginas `contos/<slug>/index.html` pertencentes ao lote. O primeiro lote contém `dois-monges-e-a-mulher`, `flecha-envenenada` e `mito-de-narciso`.
- **Estrutura pública:** o diálogo de contos usa somente `Um modo de olhar`, `O que talvez esteja pedindo para ser visto` e `Uma pergunta para levar consigo` depois da narrativa. A explicação `Por que este conto apareceu para você?` é retirada porque expõe o mecanismo de recomendação. Contos ainda não revisados usam temporariamente a explicação existente repartida entre as duas primeiras funções, sem reescrita automática do acervo.
- **Governança:** IDs, metadados emocionais e rotação são preservados. Título, origem, tradição, fonte e adaptação só mudam mediante verificação individual. Nenhum lote seguinte começa sem aprovação do editor-chefe, e o tamanho permanece em três até nova aprovação, limitado futuramente a cinco.
- **Motivo:** permitir revisão narrativa cuidadosa sem processar o acervo em massa e sem deixar catálogo e páginas públicas divergentes dentro do lote aprovado.
- **Alternativas rejeitadas:** revisar os 33 contos em um loop; editar apenas as páginas estáticas; manter duas versões editoriais diferentes; revelar a lógica de recomendação no modal; copiar a mesma estrutura narrativa para todos os contos.
- **Arquivos:** `AGENTS.md`, `PROJECT_STATUS.md`, `DOCUMENTACAO_ENTRE_SABIOS.md`, `js/data/tales.js`, `js/features/tales.js`, `index.html`, três páginas do lote e testes específicos.
- **Testes:** governança, testes selecionados pelo diff, interface, SEO, navegador e `npm run verify`, além de verificação visual do modal e das três páginas.
- **Execução do segundo lote:** autorizado pelo editor-chefe em 22/07/2026, com `agricultor-e-o-cavalo`, `navio-de-teseu` e `grande-inquisidor`; o lote permanece limitado a três e exige nova aprovação antes do terceiro.
- **Revisão:** substituir o catálogo provisório por fonte geradora, ampliar lotes ou avançar ao lote seguinte exige decisão explícita do editor-chefe.

### DEC-033 — A Constituição Editorial Canônica governa a curadoria futura

- **Data:** 22/07/2026.
- **Estado:** vigente.
- **Decisão:** aprovar a Constituição Editorial Canônica integrada a `PADRAO_EDITORIAL_ENTRE_SABIOS.md` como autoridade para investigação, preservação, proveniência, qualidade, suspensão, recuperação, integração e aplicação de decisões editoriais. A Constituição consolida a governança vigente sem alterar acervo, runtime, algoritmo, interface, autoria, metadados ou contagens nesta etapa.
- **Relação com a `DEC-024`:** preserva-a integralmente e amplia sua aplicação. Autoria desconhecida não se torna autoria editorial; curadoria, autoria, fonte, adaptação, inspiração e qualidade permanecem dimensões independentes. O cadastro nominal de conteúdos protegidos continua exclusivamente em `NUCLEO_PRESERVACAO_EDITORIAL.md`.
- **Separação obrigatória:** qualidade literária não comprova autenticidade; baixa qualidade, origem em lote, fórmula estilística ou detector de IA não comprovam fabricação. Ausência de fonte exige incerteza documentada, não falsa atribuição nem remoção automática.
- **Preservação histórica:** rejeição, suspensão e retirada da circulação preservam ID, texto, versões, atribuições anteriores, fontes, metadados, motivo, responsável e relação de linhagem. Exclusão histórica não é um atalho editorial.
- **Limites da IA:** a IA pode inventariar, comparar, pesquisar, registrar evidências, sugerir e executar decisões já aprovadas. Suspensão reversível só pode ocorrer em fluxo previamente aprovado, nunca em massa contra os grupos preservados pelas `DEC-030` e `DEC-031`, e nunca sobre conteúdo protegido. Autoria institucional, publicação de autoria não identificada, reescrita substancial, restauração valiosa, remoção definitiva, alteração de proteção e substituição de decisão vigente exigem decisão humana.
- **Metadados:** ficam aprovadas apenas as definições semânticas e enumerações propostas para futura deliberação de `attributionType`, `attributionStatus`, `sourceStatus`, `sourceNote`, `adaptationLevel`, `originalTextPreserved` e `editorialCurator`. Nenhum campo será migrado ou aplicado em massa antes do contrato separado entre acervo, build e algoritmo.
- **Trabalho futuro:** curadoria, recuperação e peneira ocorrerão em lotes limitados, com versão congelada, inventário, evidência, proposta, revisão humana, aplicação autorizada, rebuild e testes. Esta decisão não autoriza inventário completo, recuperação, peneira irrestrita, publicação ou alteração de conteúdo.
- **Motivo:** impedir simultaneamente a manutenção de preenchimento artificial ou atribuição falsa e a destruição de conteúdo valioso cuja autoria ou fonte ainda não tenha sido localizada.
- **Alternativas rejeitadas:** criar uma segunda lei editorial; duplicar o Núcleo de Preservação; converter incerteza em autoria do Entre Sábios; usar estilo como prova de IA; remover conteúdo sem histórico; reescrever automaticamente para salvar um item; compensar lacunas pelo algoritmo; migrar metadados antes do contrato técnico.
- **Arquivos:** `PADRAO_EDITORIAL_ENTRE_SABIOS.md`, `DECISIONS.md`, `PROJECT_STATUS.md` e resumo operacional em `AGENTS.md`.
- **Testes:** `npm run check:governance`, testes selecionados pelo diff e `npm run verify`, sem rebuild do runtime nesta edição documental.
- **Revisão:** alterar a autoridade da Constituição, reduzir a proteção da `DEC-024`, admitir remoção sem histórico, conceder autoria institucional automática ou autorizar peneira em massa exige nova decisão explícita do editor-chefe.

## Como registrar uma nova decisão

### DEC-034 — A intensidade é interna e o conteúdo novo entra pela Biblioteca V2

- **Data:** 25/07/2026.
- **Estado:** vigente.
- **Decisão:** remover da interface e do fluxo ativo os controles de intensidade e motivação. Preservar `suitableIntensities`, exclusões e segurança; a abertura favorece intensidade fraca, as respostas seguintes usam intensidade moderada e a intensa só aparece posteriormente, sob os mesmos filtros e no mesmo motor.
- **Síntese:** reutilizar a seção existente com o título `Quando esses sentimentos se encontram`, somente com dois ou três sentimentos. Exibir apenas sínteses editoriais específicas; fallbacks genéricos permanecem disponíveis internamente, mas não são apresentados como interpretação específica.
- **Bibliotecas:** congelar a fotografia atual como Biblioteca V1 e receber conteúdo novo em `curadoria/v2/`. O mestre da raiz continua sendo a única fonte publicada e o runtime continua derivado. Nenhum conteúdo filosófico é criado ou importado por esta decisão.
- **Compatibilidade:** substitui integralmente a `DEC-005`, a `DEC-027` e a parte de escolha explícita da `DEC-028`. Preserva as decisões de soberania do principal, segurança, proveniência, quatro blocos editoriais e Constituição Editorial.
- **Migração:** controles, listeners, estado e estilos exclusivos são removidos. A progressão interna é mantida somente na sessão e por combinação emocional; recarregar reinicia a abertura cautelosa. A motivação deixa de participar do seletor de produção, sem apagar catálogos ou evidências históricas.
- **Importação V2:** lotes devem estar em `curadoria/v2/aprovados/`, registrar aprovação humana, validar campos e duplicidades e alterar somente o mestre. O build continua sendo a única forma de gerar runtime.
- **Arquivos:** interface, estado emocional, seletor ativo, contos, documentação viva, `curadoria/biblioteca_v1/`, `curadoria/v2/`, scripts, relatórios e testes.
- **Testes:** grupos selecionados pelo diff, build e conferência do runtime, regressão completa e navegador com um, dois e três sentimentos, recarga e outra perspectiva.
- **Revisão:** reintroduzir controles públicos, motivação ativa, sorteio de intensidade, segundo motor ou segunda fonte publicada exige nova decisão explícita.

### DEC-035 — Somente a Biblioteca V2 é elegível no runtime

- **Data:** 26/07/2026.
- **Estado:** vigente.
- **Decisão:** preservar integralmente a Biblioteca V1 e os registros históricos do mestre, mas limitar o runtime derivado a conteúdos ativos com ID e linhagem explícitos da Biblioteca V2.
- **Motivo:** separar a biblioteca histórica de comparação do conjunto demonstrável, sem apagar proveniência, equivalências ou evidências editoriais.
- **Biblioteca V1:** permanece somente leitura em `curadoria/biblioteca_v1/` e pode ser consultada por ferramentas de duplicidade, equivalência, cobertura e futura recuração; não participa de fallback, seleção, rotação, ranking, síntese ou interface.
- **Biblioteca V2:** é o único conjunto elegível. A entrada futura continua dependendo de lote aprovado, importação no mesmo mestre e linhagem registrada conforme a `DEC-034`.
- **Arquitetura:** o mestre da raiz continua sendo a única fonte canônica; o build aplica a fronteira V2 ao gerar `data/entre_sabios_runtime.*`. Não existe segunda fonte publicada nem segundo motor.
- **Compatibilidade:** complementa a `DEC-034` e preserva integralmente intensidade interna, exclusões, segurança, proveniência, autoria e quatro blocos editoriais.
- **Interface:** sentimentos permanecem no catálogo definitivo; cobertura insuficiente pode ficar indisponível no modo de demonstração até novos lotes V2.
- **Arquivos:** `scripts/content-build-lib.mjs`, mestre canônico, runtime derivado, loader, documentação viva e testes.
- **Testes:** hash da V1, 57 IDs V2 aprovados, zero V1 no runtime, consulta comparativa V1 × V2, build/check, seleção coberta, “Outra perspectiva” e regressão estrutural.
- **Revisão:** reintroduzir qualquer V1 no runtime exige aprovação editorial como novo conteúdo V2, com linhagem registrada e decisão explícita.

### DEC-036 — Estrela salva a leitura e coração registra somente Gostei

- **Data:** 29/07/2026.
- **Estado:** vigente.
- **Decisão:** manter `#favoriteBtn` no alto à direita do cartão como estrela vazia/destacada para “Salvar leitura” e “Remover leitura salva”, ligada somente a `toggleFavorite()` e à chave histórica `caixaSabedoriaFavoritas`. Manter `#likeBtn` no canto inferior direito como coração vazio/destacado para “Gostei desta reflexão” e “Remover gostei”, ligado somente a `setStoryFeedback(1)`. O compartilhamento aprovado permanece no alto à esquerda.
- **Dislike:** retirar `#dislikeBtn` e toda oferta pública de avaliação negativa. Valores `-1` já existentes em `caixaSabedoriaPreferencias.storyFeedback`, pesos históricos e `entreSabiosSinaisEditoriais` permanecem intactos; nenhuma migração, limpeza ou recálculo é autorizado.
- **Compatibilidade:** preserva IDs, funções, formatos e chaves persistentes de favoritos e feedback. A estrela não registra feedback, o coração não salva leituras e nenhum novo caminho público produz `-1`. Favoritos antigos continuam disponíveis em “Leituras salvas”.
- **Relação com o plano visual:** substitui somente a proposta transitória do `RELATORIO_MIGRACAO_VISUAL_LAYOUT_V2.md` de representar a leitura salva por marcador de página. O relatório não era uma decisão canônica; suas regras de separação semântica e preservação de dados continuam válidas.
- **Motivo:** consolidar três ações inequívocas no cartão — compartilhar, salvar e Gostei — com iconografia editorial leve e sem oferecer feedback negativo novo.
- **Alternativas rejeitadas:** marcador de página no cartão principal; coração como favorito; estrela como feedback; elemento oculto de dislike; nova chave de leituras salvas; apagamento ou recálculo de avaliações negativas históricas.
- **Arquivos:** interface, estilos, favoritos, feedback, documentação viva e testes V2/navegador; nenhum acervo, runtime, motor, livro ou conto.
- **Testes:** contratos V2, iconografia dos sentimentos, feedback, favoritos, compartilhamento, persistência, interface, rotação, navegador e verificação completa.
- **Revisão:** trocar a semântica de estrela/coração, reintroduzir dislike público, renomear chaves ou migrar dados históricos exige nova decisão explícita do editor-chefe.

### DEC-037 — O aplicativo Android reutiliza o motor e o runtime canônicos

- **Data:** 01/08/2026.
- **Estado:** substituída.
- **Decisão:** manter o aplicativo em `app-android/` como interface Expo/React Native isolada, sem criar segundo acervo ou segundo motor. O app consome um snapshot mecânico e verificável das fontes canônicas do website, gerado por `npm run sync:canonical`; `src/generated/` nunca é editado manualmente.
- **Experiência:** preservar duas etapas — seleção de um sentimento principal e até dois secundários, seguida pela transição para a reflexão. `Voltar` preserva a seleção e `Outra perspectiva` mantém o contexto. Intensidade permanece interna e progressiva; motivação não participa da interface nem do seletor ativo.
- **Compatibilidade:** preservar a soberania do principal, filtros, ranking, trajetória, antirrepetição, síntese, 57 conteúdos V2 elegíveis, blocos editoriais e chaves históricas de favoritos e Gostei. O app não pode usar pontuação paralela, `Math.random()` ou cópia editorial independente.
- **Android:** usar o package ID `com.entresabios.app`, bloquear permissões de armazenamento, sobreposição e vibração, e manter somente a permissão de internet necessária a links externos. Build, assinatura e publicação continuam etapas separadas.
- **Motivo:** obter uma experiência nativa e animada sem congelar a versão antiga do GitHub nem criar divergência editorial entre website e aplicativo.
- **Alternativas rejeitadas:** usar o motor simplificado do ZIP; duplicar manualmente acervo e algoritmo; reintroduzir intensidade ou motivação; transformar o website inteiro em segunda fonte do app; publicar o protótipo antigo.
- **Arquivos:** `app-android/`, `js/core/emotional-selection-contract.js`, carregamento correspondente em `index.html`, testes de estado e documentação viva.
- **Testes:** sincronização byte a byte, seleção nos 14 sentimentos, soberania do principal, ausência de motivação pública, progressão interna, permissões do manifesto, checagem TypeScript, Expo Doctor e fluxo visual em 390 × 844 e 320 × 568.
- **Revisão:** alterar tecnologia, motor, fonte editorial, package ID, permissões ou contrato seleção-reflexão exige nova decisão explícita.

### DEC-038 — O aplicativo preserva o contrato canônico e permite háptico mínimo

- **Data:** 07/08/2026.
- **Estado:** vigente.
- **Decisão:** incorporar integralmente a arquitetura, experiência, compatibilidade, fonte editorial, package ID e separação entre build, assinatura e publicação definidos pela `DEC-037`. A única alteração é permitir `android.permission.VIBRATE` exclusivamente para uma vibração breve e leve quando o toque longo torna um sentimento principal. Nenhum outro gesto, tela, alerta ou rotina pode acionar vibração sem nova autorização.
- **Experiência:** o toque longo combina o retorno háptico com atenuação visual a 85% durante a pressão; o ponto do sentimento principal aparece por fade de 150 ms, sem escala ou bounce.
- **Compatibilidade:** substitui formalmente a `DEC-037`, preservando sem alteração todas as suas cláusulas exceto a proibição de vibração. Permanecem bloqueadas as permissões de armazenamento amplo e sobreposição, assim como todas as decisões anteriores de arquitetura, acervo, algoritmo, fluxo, seleção e responsividade.
- **Motivo:** oferecer confirmação tátil discreta para um gesto menos evidente, sem transformar o aplicativo em uma experiência ruidosa ou gamificada.
- **Alternativas rejeitadas:** vibração em todo toque; feedback forte ou prolongado; pacote de hápticos adicional; som; animação com bounce; remoção das demais barreiras de permissões.
- **Arquivos:** configuração Expo e manifesto Android, tela de sentimentos, constantes de movimento, testes, documentação viva; nenhum acervo, runtime ou motor.
- **Testes:** contrato de permissões, TypeScript, testes do app, fluxo visual com redução de movimento preservada e auditoria do APK.
- **Revisão:** ampliar o háptico para outros gestos ou alterar sua intensidade exige nova decisão explícita.

### DEC-039 — SEO canônico ganha transparência, entidades e datas verificáveis

- **Data:** 09/08/2026.
- **Estado:** vigente.
- **Decisão:** manter `https://entresabios.com/` sem `www` como origem canônica e acrescentar favicon, entidade `Organization`, idioma, autoria/edição institucional e datas visíveis nos artigos, entidade `Person` nas páginas de pensadores e a página pública `/sobre/` com propósito, responsabilidade, proveniência, uso de tecnologia e canal de correção.
- **Sitemap:** gerar `lastmod` pela data do histórico do arquivo e usar a data atual somente quando a página estiver nova ou realmente modificada. A página de transparência entra no sitemap e na allowlist de publicação.
- **Search Console e redirecionamento:** a propriedade antiga `https://www.entresabios.com/` não representa o host canônico e seu sitemap não deve ser reenviado. Cadastrar e verificar a propriedade sem `www`, reenviar nela o sitemap e validar a indexação são ações posteriores à publicação. Como o GitHub Pages ignora `.htaccess`, redirecionar `/index.html` com HTTP 301 depende da camada de domínio ou de hospedagem; não simular 301 com JavaScript.
- **Desempenho:** substituir a cadeia de `@import` por folhas de estilo paralelas nas páginas e adiar o Firebase Presence para depois do carregamento, sem carregar um segundo Google Analytics. Preservar o contador online e o Google Analytics principal.
- **Idiomas:** tradução e arquitetura multilíngue ficam fora deste ciclo por decisão explícita; nenhuma tradução automática ou `hreflang` vazio é publicada.
- **Motivo:** melhorar compreensão, confiança, rastreamento e carregamento sem alterar acervo, algoritmo ou autoria documental.
- **Arquivos:** páginas SEO, página inicial, `sobre/`, `seo.css`, gerador e testes SEO, manifesto de publicação e documentação viva.
- **Testes:** SEO, referências locais, deploy, análise estática, desempenho estrutural, navegador e verificação completa.
- **Revisão:** trocar host canônico, declarar pessoa responsável sem identificação aprovada, automatizar publicação, inventar datas, adicionar idioma ou mudar provedor de hospedagem exige decisão e autorização próprias.

### DEC-040 — Contos podem ser lidos e salvos na biblioteca local

- **Data:** 09/08/2026.
- **Estado:** vigente.
- **Decisão:** acrescentar ao diálogo de contos uma estrela discreta para salvar ou remover o conto e uma indicação dourada de leitura anterior. “Leituras salvas” mostra título, origem e somente o resumo do conto; “Abrir conto” leva ao texto completo no mesmo diálogo.
- **Persistência:** ampliar a chave histórica `caixaSabedoriaFavoritas` com entradas tipadas de conto, sem criar nova chave e sem reescrever, migrar ou apagar as entradas antigas de reflexões. A indicação “Lido” usa um marcador explícito `read::<id>` dentro de `entreSabiosContosVistos`, gravado depois que o conto é apresentado; históricos anteriores de contexto, recência ou ciclo não equivalem a leitura e não são migrados em massa. A estrela e o coração do cartão principal mantêm integralmente a semântica da `DEC-036`.
- **Seleção:** preservar a `DEC-032` e a `DEC-034`: contos continuam abrindo sem sentimento em rotação neutra; quando sentimentos são escolhidos, eles refinam a indicação pelo contrato editorial vigente. Salvar, reabrir ou marcar como lido não altera pontuação, elegibilidade nem conteúdo dos 33 contos.
- **Motivo:** permitir retorno pessoal e reconhecimento sutil do percurso sem transformar a experiência em lista de tarefas ou revelar a lógica de recomendação.
- **Alternativas rejeitadas:** nova chave de favoritos; cópia integral do conto dentro da biblioteca; exigir sentimento; marcar como lido antes da primeira visita; coração para salvar conto; migração em massa de dados locais.
- **Arquivos:** diálogo e estilos de contos, controlador, favoritos, eventos, testes e documentação viva; nenhum texto do acervo de contos é reescrito.
- **Testes:** compatibilidade dos favoritos legados, persistência tipada, resumo, reabertura do conto completo, filtro por sentimentos, abertura neutra, rotação, navegador e verificação completa.
- **Revisão:** sincronizar favoritos entre dispositivos, mudar a chave, alterar o contrato de seleção ou tornar leitura/favorito público exige nova decisão explícita.

Use somente quando houver uma escolha duradoura entre alternativas reais:

```text
### DEC-NNN — Título
- Data:
- Estado:
- Decisão:
- Motivo:
- Alternativas rejeitadas:
- Arquivos:
- Testes:
- Commit/PR:
- Revisão:
```

Correções triviais e relatórios de execução não precisam virar decisões.

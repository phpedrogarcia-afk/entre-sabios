# Estado vivo do projeto — Entre Sábios

> Atualizado em 25 de julho de 2026. Este documento registra o estado vigente do produto. Relatórios de fases são evidências históricas e não substituem este resumo.

## Como usar este documento

Antes de iniciar uma tarefa:

1. confira o estado Git e preserve alterações locais não relacionadas;
2. localize a funcionalidade nesta tabela;
3. consulte a decisão relacionada em `DECISIONS.md`;
4. trate itens concluídos apenas como verificação, salvo regressão comprovada;
5. não confunda uma pendência registrada com autorização para implementá-la.

Estados admitidos: `não iniciado`, `auditado`, `em andamento`, `parcial`, `concluído`, `aprovado`, `regredido`, `bloqueado` e `futuro`.

## Linha de base técnica

| Item | Estado vigente |
| --- | --- |
| Acervo-mestre | `entre_sabios_acervo_mestre_final.json`, versão `definitiva-2.3` |
| Runtime local gerado | 257 conteúdos ativos, 14 sentimentos; integrações locais aguardam publicação separada |
| Runtime derivado | `data/entre_sabios_runtime.json` e `.js`, sincronizados com o mestre |
| Suíte automatizada | 286 testes Node + 7 testes de navegador aprovados em 18/07/2026 |
| Validação local | `npm run verify` confere runtime sem escrita e executa a regressão completa |
| CI | `verify.yml` para regressão completa e `browser-smoke.yml` para mudanças visuais/runtime |
| Análise estática leve | `npm run check:static` valida 112 arquivos JS/MJS, 12 JSON e imports relativos |
| Governança assistida por IA | `AGENTS.md` + `DECISIONS.md` + verificação automática; conflitos com decisões vigentes exigem confirmação explícita |
| Pacote de publicação | `deploy-manifest.json`; allowlist verificável exclui mestre, testes, relatórios e versões paralelas |
| Interface principal | `index.html` + `script.js` + scripts globais carregados na ordem declarada no HTML |
| Tema padrão | modo claro (`Luz do Dia`) |
| Publicação GitHub Pages | automática a partir de `main`; build `3ea62f8` aprovado |
| Domínio principal | hospedagem separada; requer sincronização operacional com o pacote aprovado |

## Estado das funcionalidades

| Funcionalidade | Estado | Evidência principal | Regra vigente / pendência |
| --- | --- | --- | --- |
| Acervo definitivo | aprovado | `tests/content-runtime.test.mjs` | versão `definitiva-2.4`; mestre é canônico; runtime é gerado |
| Constituição Editorial Canônica | concluída em governança | `DEC-033`, `PADRAO_EDITORIAL_ENTRE_SABIOS.md` | autoridade editorial consolidada sem alteração de acervo, runtime, algoritmo, interface, autoria, metadados ou contagens; preserva integralmente a `DEC-024` e o cadastro separado do Núcleo |
| Inventário histórico e mapa de proveniência | concluído, sem aplicação editorial | `docs/INVENTARIO_HISTORICO_MAPA_PROVENIENCIA_2026-07-22.md`, `.json`, `scripts/build-historical-provenance-map.mjs` | 350 IDs mapeados e 49 artefatos externos preservados como evidência; nenhuma recuperação, reclassificação, migração, publicação ou mudança de acervo/runtime foi autorizada |
| Autoria e proteção nominal | concluído em governança | `DEC-024`, `PADRAO_EDITORIAL_ENTRE_SABIOS.md`, `NUCLEO_PRESERVACAO_EDITORIAL.md` | não atribuir autoria desconhecida ao projeto; proteção não implica publicação |
| Antologia do Silêncio | retirada do acervo ativo | `DEC-029`, `docs/ARQUIVO_REJEITADOS_ANTOLOGIA_IA.md`, mestre e runtime gerado | 28 IDs preservados historicamente como `REMOVIDO`; confirmação humana de geração integral por IA; adaptações recentes e conteúdos baseados em autores não foram abrangidos |
| Auditoria completa de autenticidade e proveniência | concluída | `DEC-030`, `DEC-031`, dossiê A–J, 13 lotes e teste de cobertura | 350 IDs classificados individualmente; ativos: A 3, B 15, C 1, D 3, E 76 e G 159; os 32 itens I históricos são a Antologia e quatro originais artificiais sem base, todos retirados |
| Crédito integral ao Entre Sábios | retirado do acervo ativo | `DEC-031`, `docs/ARQUIVO_REJEITADOS_ORIGINAIS_IA_SEM_BASE.md` e teste de autoria | quatro reformulações artificiais sem base preservadas como `REMOVIDO`; 234 inspirações em autores permanecem ativas |
| Piloto de formatos desenvolvidos em Medo | integrado localmente | `TXT-MED-001` a `TXT-MED-004`, `batch07-quote-011`, acervo-mestre e runtime gerado | `TXT-MED-004` preservado sem reescrita e movido de núcleo para contextual, com exclusões de primeira resposta e medo intenso; referência de Rubem Alves confirmada, mas publicação externa depende de regularização de direitos; algoritmo inalterado |
| Formulações transformadas de Frank Herbert | concluído | `batch07-quote-011`, `batch07-quote-012`, `batch07-quote-014`, `batch07-quote-015`, acervo-mestre e runtime gerado | quatro autorias públicas corrigidas individualmente; linhagem da Litania documentada para `batch07-quote-011`; `batch07-quote-012`, `batch07-quote-014` e `batch07-quote-015` registrados como inspirações temáticas sem passagem única; algoritmo inalterado |
| Conteúdo protegido de Culpa | integrado localmente | `TXT-CUL-001`, `NUCLEO_PRESERVACAO_EDITORIAL.md` | texto preservado sem reescrita; adaptação de autoria preservada; três intensidades revisadas; algoritmo inalterado |
| Conteúdo protegido de Esperança | integrado localmente | `TXT-ESP-002`, `NUCLEO_PRESERVACAO_EDITORIAL.md` | texto preservado sem reescrita; autoria preservada; inspiração em Richard Dawkins confirmada; intensidades fraca e moderada; algoritmo inalterado |
| Conteúdo protegido de Luto | integrado no mestre sob quarentena | `TXT-LUT-003`, `NUCLEO_PRESERVACAO_EDITORIAL.md`, lote editorial 01 | adaptação preservada integralmente como `QUARENTENA_DOCUMENTAL`, sem runtime ou publicação externa; autoria da adaptação não identificada; direitos, crise aguda e ideação suicida permanecem bloqueios documentados |
| Prioridade do sentimento principal | aprovado | `tests/principal-focus-control.test.mjs`, `tests/behavioral-selection.test.mjs` | só muda por ação explícita do usuário |
| Até dois sentimentos secundários | aprovado | `tests/emotional-state-contract.test.mjs` | refinam, mas não dominam o principal |
| Intensidade opcional com sorteio neutro | concluído | `DEC-027`; testes de estado, interface e navegador | começa sem seleção visual; ausência sorteia `fraca`, `moderada` ou `intensa` a cada geração; escolha explícita prevalece e valor inválido é rejeitado |
| Síntese emocional | aprovado | `tests/emotional-synthesis.test.mjs`, `tests/synthesis-ranking.test.mjs` | influencia apenas dentro da elegibilidade segura |
| Contrato da analogia das cores | aprovado | `tests/color-analogy-contract.test.mjs` | `relationType` interno somente nos perfis existentes; fallback `context`; nenhum novo par ou tríade |
| Motivação opcional | aprovado | `tests/motivation-control.test.mjs`, `tests/motivation-ranking.test.mjs` | desligada é neutra; não cria elegibilidade |
| Segurança em estados vulneráveis | aprovado | `tests/vulnerable-motivation-safety.test.mjs` | ação, pressão e confronto não podem superar bloqueios |
| Antirrepetição exata e canônica | aprovado | `tests/repetition-stress.test.mjs`, `tests/repetition-real-path-regression.test.mjs` | repetição só após esgotamento do conjunto seguro disponível |
| Diversidade de autoria | aprovado com limite conhecido | `tests/runtime-selection.test.mjs` | pode ser relaxada em conjunto editorial pequeno |
| Cadência de formatos | aprovado com limite de acervo | `tests/phase9-rotation-integration.test.mjs` | não promove nível editorial inferior |
| Preferência pessoal de autoria/gênero | removida e aprovada | `tests/gender-preference-removal.test.mjs` | metadados editoriais permanecem; preferência não participa do ranking |
| Favoritos e feedback | aprovado | testes de interface e apresentação | feedback não domina a seleção de reflexões |
| Quatro blocos editoriais canônicos | concluído no acervo ativo | `DEC-025`, `PADRAO_EDITORIAL_ENTRE_SABIOS.md`, `scripts/audit-four-block-coverage.mjs` | 257 IDs ativos auditados; explicações, perfis, perguntas e livros completos nos 257 conteúdos; lacunas não recebem fallback genérico |
| Apresentação de autoria | aprovado no comportamento atual | `tests/authorship-presentation.test.mjs` | deverá usar “CONHEÇA O PENSADOR” em todo o acervo sem inventar autoria ou proveniência |
| Pergunta editorial específica | concluído | `DEC-025`, `tests/editorial-guidance.test.mjs`, `scripts/audit-four-block-coverage.mjs` | 257 perguntas canônicas específicas, contextualizadas e sem conselho disfarçado |
| Recomendação de livro | concluído | `DEC-009`, `DEC-025`, `tests/book-recommendations.test.mjs`, `scripts/audit-four-block-coverage.mjs` | 2.121 de 2.121 contextos possuem relação substantiva; a ausência segura continua coberta por cenário sintético sem relação confiável |
| Compartilhamento por imagem | aprovado | `tests/share-image-layout.test.mjs`, relatório de Fase 11 | atalho sorteia um dos três estilos; escolha manual é preservada |
| Botão “copiar mensagem” | removido e aprovado | `tests/copy-removal-sharing.test.mjs` | não deve retornar à interface |
| Contos no diálogo | concluído | `DEC-028`, `ES-2026-004`, testes de interface e navegador | pode abrir sem sentimento, com rotação neutra; sentimentos selecionados refinam o filtro; sem escolha de intensidade, usa `Equilibrado` internamente sem marcar a interface; abertura, reabertura, rolagem móvel e coerência de cache protegidas |
| Revisão editorial dos contos | 33 contos concluídos em onze lotes de três | `DEC-032`, `tests/tales-editorial-batch.test.mjs` e 33 páginas públicas sincronizadas | autorização editorial abrangente recebida em 25/07/2026; `js/data/tales.js` permanece fonte provisória; nenhuma página externa aos lotes foi alterada pela sincronização |
| Revisão editorial dos ensaios | 12 ensaios concluídos; oito revisados e quatro preservados | páginas estáticas de `ensaios/`; registro cumulativo abaixo | ciclo autorizado em 25/07/2026 concluído localmente; dois bloqueios documentais foram pesquisados e resolvidos com ressalvas públicas; sem commit ou publicação |
| Smartphone horizontal | aprovado em navegador real | `docs/relatorios/fases/RELATORIO_FASE_7_NAVEGADOR_REAL_ANTIRREPETICAO.md` | rolagem vertical funciona sem overflow horizontal |
| Tablets | aprovado em regressão anterior | CSS específico e testes de wiring | manter verificação visual após mudanças de layout |
| SEO | aprovado | `tests/seo.test.mjs` | páginas são estáticas; atualização é executada por script |
| Contratos canônicos | aprovado | `tests/canonical-contracts.test.mjs` | sentimentos, versões, loader e enums do mestre devem permanecer sincronizados |
| Replay de diagnóstico emocional | concluído | `tests/diagnostic-replay.test.mjs` | reproduz localmente sessões JSON v1 sem participar da seleção em produção |
| Laboratório da mistura emocional | concluído | `scripts/emotional-lab-lib.mjs`, `tests/emotional-lab.test.mjs` | modo local/exportável; métricas não participam do ranking; limites aguardam calibração na Fase 10 |
| Auditoria emocional sistemática | concluída | `docs/relatorios/fases/RELATORIO_FASE_10_AUDITORIA_SISTEMATICA.md`, `tests/systematic-audit.test.mjs` | 769 cenários, 1.468 seleções e 0 violações objetivas; lacunas apenas registradas |
| Estresse da seleção e atomicidade | concluído | `docs/relatorios/fases/RELATORIO_FASE_11_TESTES_ESTRESSE.md`, `tests/repetition-stress.test.mjs`, `tests/selection-atomicity.test.mjs` | 800 seleções extensas; 100% de cobertura antes de reiniciar; 0 repetições evitáveis; 39 testes aprovados |
| Navegador e dispositivos | automatizado e validado com pendência física | `tests/browser/critical-paths.spec.mjs`, `docs/relatorios/fases/RELATORIO_FASE_12_NAVEGADOR_E_DISPOSITIVOS.md` | Chromium cobre desktop, Android e tablet em retrato/paisagem, fluxo principal e rolagem de contos; tablet e toque físicos continuam complementares |
| Regressão editorial | concluída | `docs/relatorios/fases/RELATORIO_FASE_13_REGRESSAO_EDITORIAL.md` | 249 testes aprovados; acervo, autoria, apresentação, livros, compartilhamento, temas, contos, ensaios e contrato emocional preservados |
| Loop do algoritmo e mapa emocional | concluído e integrado na branch | `docs/relatorios/finais/RELATORIO_FINAL_LOOP_ALGORITMO_MAPA_EMOCIONAL.md` | commit `7876aa4`; PR #7 aberto como rascunho e CI aprovado; toque/tablet físicos continuam opcionais e manuais |
| Análise estática incremental | concluído | `scripts/static-check.mjs`, `tests/static-check.test.mjs` | sem lint ou formatação em massa; cópias `-PEDRO` protegidas permanecem fora do escopo |

### Registro cumulativo da revisão dos contos

- Lotes 1–3: `dois-monges-e-a-mulher`, `flecha-envenenada`, `mito-de-narciso`; `agricultor-e-o-cavalo`, `navio-de-teseu`, `grande-inquisidor`; `caixa-de-pandora`, `sonho-da-borboleta`, `davi-e-golias`. Revisão narrativa, origem individualizada e três seções da `DEC-032`; nove páginas sincronizadas.
- Lote 4: `mito-da-caverna`, `patinho-feio`, `kisa-gotami`. Alegoria, conto literário e tradição comentarial budista diferenciados; ressalva documental mantida para Kisā Gotamī; três páginas sincronizadas.
- Lote 5: `nachiketa-e-yama`, `o-espelho-machado`, `elefante-no-escuro`. Passagens e edições identificadas; diálogo, ironia literária e parábola sensorial preservados; três páginas sincronizadas.
- Lote 6: `anel-de-giges`, `xicara-de-cha`, `filho-prodigo`. Experimento moral, anedota zen de circulação moderna e parábola de Lucas separados; três páginas sincronizadas.
- Lote 7: `mito-de-er`, `barco-vazio`, `os-talentos`. Acontecimentos das fontes restaurados e leitura moderna de “talento” distinguida do valor monetário do texto; três páginas sincronizadas.
- Lote 8: `sisifo`, `arvore-inutil`, `bom-samaritano`. Mito e leitura de Camus separados; composição de motivos de Zhuangzi declarada; parábola de Lucas encerrada no gesto de tornar-se próximo; três páginas sincronizadas.
- Lote 9: `icaro`, `carruagem-da-mente`, `nasrudin-chave`. Ovídio identificado; atribuição incorreta à Bhagavad Gita corrigida para a Kaṭha Upaniṣad; anedota de Nasrudin marcada como circulação moderna; três páginas sincronizadas.
- Lote 10: `prometeu`, `cachorro-amarrado-carroca`, `morte-de-ivan-ilitch`. Fontes de Hesíodo, fragmento estoico preservado por Hipólito e novela de Tolstói explicitados; três páginas sincronizadas.
- Lote 11: `taca-quebrada`, `jornada-do-heroi`, `a-sombra-jung`. Epicteto localizado; monomito declarado como síntese comparativa; narrativa da sombra declarada como alegoria editorial baseada em Jung; três páginas sincronizadas.
- Validação cumulativa: teste editorial confere os 33 IDs, as três seções públicas, perguntas abertas, tempos, cache e sincronização integral das 33 páginas; SEO, governança, navegador e verificação completa são executados no encerramento.

### Registro cumulativo da revisão dos ensaios

- Auditoria dos 12 ensaios: fortes, preservar — `buda-e-o-apego`, `dostoievski-e-a-culpa`, `jung-e-a-sombra` e `krishnamurti-e-o-medo`; aproveitáveis, revisar partes — `chogyam-trungpa-e-o-ego`, `kabir-e-a-busca`, `khalil-gibran-e-o-amor`, `nietzsche-e-a-falta-de-proposito` e `rumi-e-a-solidao`; fraco, reconstrução necessária — `marco-aurelio-e-a-ansiedade`; bloqueados para pesquisa e decisão humana — `nisargadatta-maharaj-e-a-identidade` e `tilopa-e-a-identidade`.
- Piloto de 25/07/2026: `khalil-gibran-e-o-amor` teve repetições condensadas e passou a organizar o conflito pelo espaço dentro do vínculo; `marco-aurelio-e-a-ansiedade` foi reconstruído pela medida da ação presente e pelo caráter de caderno de prática das <em>Meditações</em>, sem repetir a estrutura do ensaio de Krishnamurti.
- Comparação do piloto: Gibran parte de uma cena relacional e preserva a tensão entre proximidade e diferença; Marco Aurélio parte da forma do texto filosófico e avança da totalidade esmagadora para o ato possível. Ambos mantêm objeções e limites, mas usam imagens, ritmos, exemplos e conclusões distintos.
- Proveniência do piloto: Gibran foi conferido em <em>O Profeta</em>, “Do Amor” e “Do Casamento”, com edições institucionais do Project Gutenberg, Poetry Foundation e Academy of American Poets; Marco Aurélio foi conferido nos livros 7 e 8 das <em>Meditações</em>, com a tradução de George Long no Internet Classics Archive/MIT e apoio secundário da Yale University Press. A variação de numeração entre traduções foi explicitada.
- Lote 2: `chogyam-trungpa-e-o-ego` e `kabir-e-a-busca`. Trungpa manteve a crítica paradoxal ao materialismo espiritual, agora com limite contra o uso acusatório do conceito e contra a imunidade de mestres; Kabir preservou a ironia da procura distante e passou a declarar as variantes de transmissão oral e atribuição.
- Lote 3: `nietzsche-e-a-falta-de-proposito` e `rumi-e-a-solidao`. Nietzsche foi afastado do coaching de propósito individual e recolocado na crise cultural dos valores, niilismo, crítica e afirmação; Rumi passou a partir da flauta separada do <em>Masnavi</em>, sem reduzir a obra à biografia de Shams nem romantizar isolamento.
- Lote 4: `nisargadatta-maharaj-e-a-identidade` e `tilopa-e-a-identidade`. Os bloqueios foram retirados após pesquisa localizada: <em>I Am That</em> foi identificado como edição de conversas em marathi mediada por Maurice Frydman e Sudhakar S. Dikshit; as instruções de Tilopa foram conferidas no texto catalogado como Toh 2303 e nas traduções das “seis palavras” de Ken McLeod. As páginas declaram a mediação textual, a variação de tradução e o caráter editorial das aproximações psicológicas.
- Auditoria comparativa final: os oito ensaios revisados mantêm aberturas, movimentos, extensões e perguntas diferentes; nenhum usa o pensador como autoridade decorativa ou transforma espiritualidade em diagnóstico. Os quatro classificados como fortes permaneceram sem reescrita. Não restam ensaios bloqueados, mas as ressalvas de transmissão de Kabir, tradução de Nisargadatta e linhagem/tradução de Tilopa permanecem documentadas.

## Pendências vigentes

| Pendência | Estado | Próxima decisão necessária |
| --- | --- | --- |
| Contrato dos metadados de proveniência | semântica documentada, implementação não iniciada | aprovar separadamente o contrato entre mestre, build, runtime e algoritmo antes de criar campos ou migrar conteúdos |
| Próxima etapa editorial | inventário concluído; aplicação não iniciada | qualquer investigação adicional, recuperação, peneira, reclassificação ou aplicação editorial exige autorização própria; o mapa não decide publicação |
| Referências documentais não conclusivas | classificação final B/C | `DEC-030`, `DEC-031`, dossiê completo e campos `source` do mestre | manter com referência pendente, sem inventar edição, página, passagem ou tradutor; inspirações em autores permanecem preservadas |
| Integração dos conteúdos nominalmente protegidos | parcial | Duna, Gaiola, Culpa e Dawkins integrados individualmente; Schmidt foi auditado e continua protegido sem integração até regularização de direitos |
| Lista canônica dos 28 conteúdos do Núcleo Ativo | pendente documental | recuperar o inventário aprovado; não reconstruir por memória nem substituir a proposta anterior |
| Cobertura universal dos quatro blocos editoriais | concluída | explicações, perfis, perguntas canônicas e livros concluídos nos 257 IDs ativos; `npm run audit:blocks` confirma 2.121 de 2.121 contextos de livros e nenhuma lacuna |
| 14 perfis de síntese `reviewed` sem evidência individual completa | auditado | decisão editorial humana; não fazer alteração em massa |
| Política de segurança distribuída | auditado | definir fonte canônica antes de centralizar |
| Históricos legados em `script.js` | auditado | provar ausência de consumidor antes de remover |
| Arquivos legados em `js/data/quotes/` e correlatos | auditado | classificar/arquivar; não editar como fonte publicada |
| Fonte canônica entre `tales.js` e páginas estáticas | provisória conforme `DEC-032` | `js/data/tales.js` é a fonte editorial provisória; sincronizar manualmente apenas as páginas do lote aprovado até existir gerador próprio |
| Sincronização entre GitHub Pages e domínio principal | bloqueado operacionalmente | escolher um único fluxo de publicação |

## Arquivos locais protegidos nesta linha de trabalho

Até decisão explícita, não restaurar, apagar, editar, adicionar ao Git ou incluir em commit:

- `.gitignore` removido localmente;
- `README.md` removido localmente;
- `css/modals-PEDRO.css`;
- `js/data/tales-PEDRO.js`;
- `js/features/tales-PEDRO.js`;
- `curadoria-rigida-3.1.zip`.

## Definição de pronto

Uma tarefa só pode ser declarada concluída quando:

1. o problema ou objetivo foi reproduzido e delimitado;
2. a fonte canônica foi identificada;
3. a menor alteração suficiente foi aplicada;
4. os testes específicos passaram;
5. a regressão proporcional ao risco passou;
6. o antes/depois foi registrado;
7. pendências e limitações foram declaradas;
8. a integração Git e a publicação foram tratadas separadamente;
9. a versão publicada foi verificada quando a tarefa incluiu deploy.

## Comandos de validação

| Escopo | Comando |
| --- | --- |
| Estado emocional | `npm run test:state` |
| Síntese | `npm run test:synthesis` |
| Motivação e segurança | `npm run test:motivation` |
| Ranking | `npm run test:ranking` |
| Rotação e antirrepetição | `npm run test:rotation` |
| Conteúdo editorial | `npm run test:editorial` |
| Interface estrutural | `npm run test:ui` |
| SEO | `npm run test:seo` |
| Regressão rápida | `npm run test:fast` |
| Estresse | `npm run test:stress` |
| Laboratório emocional | `npm run test:lab` |
| Auditoria sistemática | `npm run audit:systematic` |
| Todos os testes, sem build | `npm run test:all` |
| Runtime sincronizado, sem escrita | `npm run check:content` |
| Sintaxe, JSON e imports relativos | `npm run check:static` |
| Verificação completa sem reescrever runtime | `npm run verify` |
| Reproduzir diagnóstico exportado | `npm run replay:diagnostic -- caminho/diagnostico.json` |
| Verificar governança e decisões | `npm run check:governance` |
| Regerar mapa histórico de proveniência | `npm run build:provenance-map` |
| Conferir mapa histórico sem escrita | `npm run check:provenance-map` |
| Selecionar testes pelo diff | `npm run test:changed -- <arquivos>` |
| Verificar pacote público | `npm run check:deploy` |
| Gerar pacote em destino vazio | `npm run build:deploy -- <destino>` |
| Smoke test em navegador | `npm run test:browser` |

## Estado operacional Git

- Branch: `agent/finaliza-loop-estabilizacao`.
- Commit consolidado anterior a esta etapa: `7876aa4`.
- Pull request: #7, aberto como rascunho, mergeável e com a verificação do GitHub aprovada em 16/07/2026.
- Alterações, commit, merge e publicação permanecem autorizações independentes.

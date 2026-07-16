# Estado vivo do projeto — Entre Sábios

> Atualizado em 16 de julho de 2026. Este documento registra o estado vigente do produto. Relatórios de fases são evidências históricas e não substituem este resumo.

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
| Acervo-mestre | `entre_sabios_acervo_mestre_final.json`, versão `definitiva-2.1` |
| Runtime publicado | 283 conteúdos ativos, 14 sentimentos |
| Runtime derivado | `data/entre_sabios_runtime.json` e `.js`, sincronizados com o mestre |
| Suíte automatizada | 249 testes aprovados em 16/07/2026 |
| Validação local | `npm run verify` confere runtime sem escrita e executa a regressão completa |
| CI | `.github/workflows/verify.yml`, executado em pull requests e pushes para `main` |
| Análise estática leve | `npm run check:static` valida sintaxe JS/MJS, JSON e imports relativos sem dependências externas |
| Interface principal | `index.html` + `script.js` + scripts globais carregados na ordem declarada no HTML |
| Tema padrão | modo claro (`Luz do Dia`) |
| Publicação GitHub Pages | automática a partir de `main`; build `3ea62f8` aprovado |
| Domínio principal | hospedagem separada; requer sincronização operacional com o pacote aprovado |

## Estado das funcionalidades

| Funcionalidade | Estado | Evidência principal | Regra vigente / pendência |
| --- | --- | --- | --- |
| Acervo definitivo | aprovado | `tests/content-runtime.test.mjs` | mestre é canônico; runtime é gerado |
| Prioridade do sentimento principal | aprovado | `tests/principal-focus-control.test.mjs`, `tests/behavioral-selection.test.mjs` | só muda por ação explícita do usuário |
| Até dois sentimentos secundários | aprovado | `tests/emotional-state-contract.test.mjs` | refinam, mas não dominam o principal |
| Intensidade | aprovado | testes de estado, seleção e vulnerabilidade | nunca é relaxada pelo ranking |
| Síntese emocional | aprovado | `tests/emotional-synthesis.test.mjs`, `tests/synthesis-ranking.test.mjs` | influencia apenas dentro da elegibilidade segura |
| Contrato da analogia das cores | concluído | `tests/color-analogy-contract.test.mjs` | aguarda aprovação da Fase 8; `relationType` interno somente nos perfis existentes; fallback `context`; nenhum novo par ou tríade |
| Motivação opcional | aprovado | `tests/motivation-control.test.mjs`, `tests/motivation-ranking.test.mjs` | desligada é neutra; não cria elegibilidade |
| Segurança em estados vulneráveis | aprovado | `tests/vulnerable-motivation-safety.test.mjs` | ação, pressão e confronto não podem superar bloqueios |
| Antirrepetição exata e canônica | aprovado | `tests/repetition-stress.test.mjs`, `tests/repetition-real-path-regression.test.mjs` | repetição só após esgotamento do conjunto seguro disponível |
| Diversidade de autoria | aprovado com limite conhecido | `tests/runtime-selection.test.mjs` | pode ser relaxada em conjunto editorial pequeno |
| Cadência de formatos | aprovado com limite de acervo | `tests/phase9-rotation-integration.test.mjs` | não promove nível editorial inferior |
| Preferência pessoal de autoria/gênero | removida e aprovada | `tests/gender-preference-removal.test.mjs` | metadados editoriais permanecem; preferência não participa do ranking |
| Favoritos e feedback | aprovado | testes de interface e apresentação | feedback não domina a seleção de reflexões |
| “Conheça o pensador” | aprovado | `tests/authorship-presentation.test.mjs` | bloco independente da orientação |
| Orientação específica | aprovado, cobertura parcial | `tests/editorial-guidance.test.mjs` | ausente quando não existe texto específico; sem fallback genérico |
| Recomendação de livro | aprovado | `tests/book-recommendations.test.mjs` | bloco visual independente e segurança por contexto |
| Compartilhamento por imagem | aprovado | `tests/share-image-layout.test.mjs`, relatório de Fase 11 | atalho sorteia um dos três estilos; escolha manual é preservada |
| Botão “copiar mensagem” | removido e aprovado | `tests/copy-removal-sharing.test.mjs` | não deve retornar à interface |
| Contos no diálogo | concluído com validação manual | testes de conto e relatório de navegador | rolagem móvel corrigida; CSS continua distribuído em mais de um arquivo |
| Smartphone horizontal | aprovado em navegador real | `RELATORIO_FASE_7_NAVEGADOR_REAL_ANTIRREPETICAO.md` | rolagem vertical funciona sem overflow horizontal |
| Tablets | aprovado em regressão anterior | CSS específico e testes de wiring | manter verificação visual após mudanças de layout |
| SEO | aprovado | `tests/seo.test.mjs` | páginas são estáticas; atualização é executada por script |
| Contratos canônicos | aprovado | `tests/canonical-contracts.test.mjs` | sentimentos, versões, loader e enums do mestre devem permanecer sincronizados |
| Replay de diagnóstico emocional | concluído | `tests/diagnostic-replay.test.mjs` | reproduz localmente sessões JSON v1 sem participar da seleção em produção |
| Laboratório da mistura emocional | concluído | `scripts/emotional-lab-lib.mjs`, `tests/emotional-lab.test.mjs` | modo local/exportável; métricas não participam do ranking; limites aguardam calibração na Fase 10 |
| Auditoria emocional sistemática | concluída | `RELATORIO_FASE_10_AUDITORIA_SISTEMATICA.md`, `tests/systematic-audit.test.mjs` | 769 cenários, 1.468 seleções e 0 violações objetivas; lacunas apenas registradas |
| Estresse da seleção e atomicidade | concluído | `RELATORIO_FASE_11_TESTES_ESTRESSE.md`, `tests/repetition-stress.test.mjs`, `tests/selection-atomicity.test.mjs` | 800 seleções extensas; 100% de cobertura antes de reiniciar; 0 repetições evitáveis; 39 testes aprovados |
| Navegador e dispositivos | validado com pendência física | `RELATORIO_FASE_12_NAVEGADOR_E_DISPOSITIVOS.md` | Chrome real: desktop, Android retrato/paisagem e tablet retrato/paisagem sem overflow; persistência, duplo clique, renderização e console aprovados; tablet e toque físicos pendentes |
| Regressão editorial | concluída | `RELATORIO_FASE_13_REGRESSAO_EDITORIAL.md` | 249 testes aprovados; acervo, autoria, apresentação, livros, compartilhamento, temas, contos, ensaios e contrato emocional preservados |
| Loop do algoritmo e mapa emocional | concluído localmente | `RELATORIO_FINAL_LOOP_ALGORITMO_MAPA_EMOCIONAL.md` | Fases 0–14 consolidadas; aguarda aprovação e decisão Git separada; toque/tablet físicos continuam opcionais e manuais |
| Análise estática incremental | concluído | `scripts/static-check.mjs`, `tests/static-check.test.mjs` | sem lint ou formatação em massa; cópias `-PEDRO` protegidas permanecem fora do escopo |

## Pendências vigentes

| Pendência | Estado | Próxima decisão necessária |
| --- | --- | --- |
| 20 conteúdos com referência pendente | futuro/editorial | validar fonte antes de alterar status ou atribuição |
| 14 perfis de síntese `reviewed` sem evidência individual completa | auditado | decisão editorial humana; não fazer alteração em massa |
| Política de segurança distribuída | auditado | definir fonte canônica antes de centralizar |
| Históricos legados em `script.js` | auditado | provar ausência de consumidor antes de remover |
| Arquivos legados em `js/data/quotes/` e correlatos | auditado | classificar/arquivar; não editar como fonte publicada |
| Fonte canônica entre `tales.js` e páginas estáticas | auditado | escolher estratégia de geração sem prejudicar SEO |
| Testes reais de navegador no CI | não iniciado | escolher ferramenta leve e cenários críticos |
| Pacote público sem mestre, testes e relatórios | não iniciado | definir allowlist de deploy |
| Sincronização entre GitHub Pages e domínio principal | bloqueado operacionalmente | escolher um único fluxo de publicação |

## Arquivos locais protegidos nesta linha de trabalho

Até decisão explícita, não restaurar, apagar, editar, adicionar ao Git ou incluir em commit:

- `.gitignore` removido localmente;
- `README.md` removido localmente;
- `AGENTS.md` ainda não rastreado;
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

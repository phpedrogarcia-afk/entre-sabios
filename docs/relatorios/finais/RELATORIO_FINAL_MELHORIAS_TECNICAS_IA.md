# Relatório final — melhorias técnicas para trabalho assistido por IA

Data da consolidação: 16 de julho de 2026.

## 1. Resultado executivo

O ciclo de seis etapas foi concluído sem redesenhar o Entre Sábios, trocar sua arquitetura ou modificar o acervo publicado. O projeto passou a oferecer um pacote menor de contexto, fontes canônicas mais explícitas, decisões vigentes registradas, testes executáveis por domínio, verificação imutável do runtime, contratos de dados, replay de diagnósticos e análise estática leve.

A validação final aprovou 214 testes. O comando `npm run verify` concluiu, na ordem:

1. análise estática de 84 arquivos JavaScript ou ES Modules e oito JSON;
2. comparação do runtime versionado com o acervo-mestre, sem escrita;
3. execução integral dos 214 testes.

Nenhuma dependência foi adicionada. Não houve formatação em massa, commit, push, merge ou publicação neste ciclo.

## 2. Linha de base Git

| Item | Valor na consolidação |
| --- | --- |
| Branch local | `agent/finaliza-loop-estabilizacao` |
| HEAD local | `35a3920` |
| `origin/main` | `3ea62f8` |
| Estado | alterações locais ainda não integradas |

O branch local aponta para o commit anterior ao merge já presente em `origin/main`. Uma futura integração deve primeiro tratar essa diferença conscientemente, sem comandos destrutivos e sem incluir arquivos protegidos por engano.

## 3. Trabalho novo deste ciclo

### 3.1 Contexto e não duplicação

- `PROJECT_STATUS.md` registra estado vigente, pendências, evidências e comandos.
- `DECISIONS.md` registra decisões duradouras e impede reimplementações contraditórias.
- `DOCUMENTACAO_ENTRE_SABIOS.md` identifica fontes canônicas, arquivos derivados e limites atuais.
- A definição de pronto separa implementação, validação, Git e publicação.

### 3.2 Validação rápida e CI

- `scripts/run-tests.mjs` organiza testes por estado, síntese, motivação, ranking, rotação, editorial, interface, SEO, regressão rápida, estresse e suíte integral.
- `scripts/build-content.mjs --check` compara mestre e runtime sem reescrever derivados.
- `.github/workflows/verify.yml` executa `npm run verify` em pull requests e atualizações de `main`.
- `package.json` expõe os comandos operacionais sem criar scripts duplicados.

### 3.3 Contratos canônicos

- IDs técnicos dos sentimentos foram alinhados ao catálogo do mestre, preservando rótulos acentuados e ordem visual.
- `scripts/content-build-lib.mjs` valida catálogos, enums, campos obrigatórios, associações, status e publicação.
- `tests/canonical-contracts.test.mjs` protege mestre, runtime, bootstrap, loader, taxonomia, síntese e motivação.

### 3.4 Replay de diagnóstico

- `scripts/diagnostic-replay-lib.mjs` restaura estado, fila, direção e históricos anteriores a cada escolha.
- `scripts/replay-diagnostic.mjs` compara a escolha exportada com a escolha reproduzida.
- `tests/fixtures/diagnostic-session-minimal.json` oferece uma fixture pequena e versionada.
- `tests/diagnostic-replay.test.mjs` cobre correspondência, divergência, sequência histórica e esquema inválido.

### 3.5 Análise estática incremental

- `scripts/static-check.mjs` usa apenas recursos do Node.
- A checagem valida sintaxe `.js`/`.mjs`, parsing de JSON e destinos de imports relativos.
- `tests/static-check.test.mjs` protege descoberta, imports e exclusão das cópias `-PEDRO`.
- ESLint, Prettier, TypeScript e formatação ampla foram rejeitados nesta etapa por ausência de benefício concreto proporcional ao custo.

## 4. Trabalho herdado conferido

Durante a Etapa 5 foram encontrados no workspace, fora da implementação da análise estática:

- versionamento do esquema e da política de filas;
- reconciliação de candidatos novos em fila restaurada;
- novos campos de diagnóstico para conjunto elegível, nível ativo, inéditos e bloqueados;
- novos testes de progressão, migração e diagnóstico;
- atualizações dos relatórios JSON da auditoria comportamental.

Esses itens foram preservados. Não se criou uma segunda implementação paralela.

## 5. Regressões encontradas e corrigidas

A primeira regressão integral da Etapa 5 encontrou seis falhas entre 214 testes. A causa era uma progressão nova que, depois de esgotar o nível principal, avançava para níveis dos sentimentos secundários e do fallback. Isso contrariava a soberania do sentimento principal.

A correção mínima restaurou a progressão aprovada:

- nível 1, núcleo do principal;
- nível 2, contextual do mesmo principal;
- sentimentos secundários continuam refinando equivalentes, sem substituir o centro da escolha.

Um teste de migração também exigia que a invalidação da fila liberasse conteúdo ainda presente no histórico recente. O contrato foi corrigido: uma versão incompatível reinicia fila, direção e trajetória contextual, mas preserva o histórico global antirrepetição.

Depois da correção:

- 35 testes diretamente afetados passaram;
- oito sequências de 100 escolhas não apresentaram repetição exata, normalizada ou canônica evitável;
- a regressão integral passou com 214 de 214 testes.

## 6. Arquivos canônicos preservados

Não houve diff neste ciclo em:

- `entre_sabios_acervo_mestre_final.json`;
- `data/entre_sabios_runtime.json`;
- `data/entre_sabios_runtime.js`;
- `script.js`.

O runtime continua na versão `definitiva-2.1`, com 283 conteúdos ativos e 14 sentimentos.

## 7. Arquivos locais protegidos e fora da integração

Não restaurar, apagar, editar, adicionar ou incluir automaticamente em commit:

- remoção local de `.gitignore`;
- remoção local de `README.md`;
- `AGENTS.md` não rastreado;
- `css/modals-PEDRO.css`;
- `js/data/tales-PEDRO.js`;
- `js/features/tales-PEDRO.js`;
- `curadoria-rigida-3.1.zip`.

Esses itens pertencem ao estado local anterior e não fazem parte da entrega deste ciclo.

## 8. Allowlist recomendada para uma futura integração

A lista abaixo é uma referência de revisão, não um comando automático de Git:

- `.github/workflows/verify.yml`;
- `DECISIONS.md`;
- `DOCUMENTACAO_ENTRE_SABIOS.md`;
- `PROJECT_STATUS.md`;
- `RELATORIO_FINAL_MELHORIAS_TECNICAS_IA.md`;
- `js/data/catalogs.js`;
- `package.json`;
- `scripts/build-content.mjs`;
- `scripts/content-build-lib.mjs`;
- `scripts/diagnostic-replay-lib.mjs`;
- `scripts/replay-diagnostic.mjs`;
- `scripts/run-tests.mjs`;
- `scripts/static-check.mjs`;
- `tests/canonical-contracts.test.mjs`;
- `tests/diagnostic-replay.test.mjs`;
- `tests/fixtures/diagnostic-session-minimal.json`;
- `tests/static-check.test.mjs`.

Os arquivos abaixo contêm trabalho herdado e correções autorizadas, mas devem ser revisados separadamente antes de integração:

- `js/core/runtime-engine.js`;
- `tests/repetition-real-path-regression.test.mjs`;
- `tests/repetition-stress.test.mjs`;
- `tests/selection-progression.test.mjs`;
- `auditoria_comportamental_entre_sabios.json`;
- `tests/fixtures/auditoria_comportamental_atual.json`.

## 9. Comandos vigentes

| Objetivo | Comando |
| --- | --- |
| Análise estática leve | `npm run check:static` |
| Conferir runtime sem escrever | `npm run check:content` |
| Estado emocional | `npm run test:state` |
| Síntese | `npm run test:synthesis` |
| Motivação | `npm run test:motivation` |
| Ranking | `npm run test:ranking` |
| Rotação | `npm run test:rotation` |
| Conteúdo editorial | `npm run test:editorial` |
| Interface | `npm run test:ui` |
| SEO | `npm run test:seo` |
| Regressão rápida | `npm run test:fast` |
| Estresse | `npm run test:stress` |
| Todos os testes | `npm run test:all` |
| Verificação completa | `npm run verify` |
| Replay de sessão | `npm run replay:diagnostic -- caminho/sessao.json` |

## 10. Limites e trabalhos futuros

Permanecem fora deste ciclo:

- testes reais de navegador executados automaticamente no CI;
- allowlist definitiva do pacote de publicação;
- unificação operacional entre GitHub Pages e domínio principal;
- centralização das políticas de segurança distribuídas;
- decisão editorial sobre referências pendentes e perfis `reviewed`;
- consolidação futura entre dados de contos e páginas estáticas;
- adoção de lint semântico somente se uma classe recorrente de falhas justificar o custo.

Esses itens são pendências ou possibilidades futuras, não autorização automática para implementação.

## 11. Critério final

O ciclo está tecnicamente concluído no workspace local porque:

- as fontes canônicas foram identificadas;
- as alterações funcionais autorizadas possuem regressão;
- o runtime corresponde ao mestre;
- a análise estática está limpa;
- os 214 testes passam;
- `git diff --check` não encontrou erros;
- arquivos protegidos foram mantidos fora do escopo;
- integração Git e publicação continuam separadas e aguardam autorização.

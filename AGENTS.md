# Guia de trabalho para IA — Entre Sábios

## Objetivo do projeto

Entre Sábios é uma experiência editorial de reflexões filosóficas orientada por sentimentos. Preserve uma linguagem humana, contemplativa e responsável; o site não oferece diagnóstico, tratamento ou promessas terapêuticas.

## Mapa rápido: onde alterar

| Pedido | Arquivo ou pasta principal |
| --- | --- |
| Frases, microtextos e metadados editoriais | `entre_sabios_acervo_mestre_final.json` |
| Seleção, elegibilidade e rotação de conteúdos | `js/core/` |
| Ações de favoritas, feedback, compartilhamento e contos | `js/features/` |
| Elementos visuais da página | `js/ui/`, `css/`, `index.html` |
| Páginas de SEO | `sentimentos/`, `pensadores/`, `contos/`, `ensaios/` |
| Regras e decisões editoriais | `PADRAO_EDITORIAL_ENTRE_SABIOS.md` |
| Arquitetura e comportamento já implementado | `DOCUMENTACAO_ENTRE_SABIOS.md` |

## Fonte única do acervo

1. Edite conteúdo publicado somente em `entre_sabios_acervo_mestre_final.json`.
2. Nunca edite manualmente `data/entre_sabios_runtime.json` ou `data/entre_sabios_runtime.js`: ambos são gerados pelo build.
3. Após alterar o acervo, execute `npm run build:content`.
4. Preserve IDs existentes. Para substituir um texto, altere o item com o mesmo `id`.
5. Não remova conteúdo sem registrar o motivo no padrão editorial ou no pedido atual.

### Exceção provisória para contos

Conforme a `DEC-032`, enquanto não existir gerador próprio para as páginas de contos, `js/data/tales.js` é a fonte editorial provisória dos 33 contos exibidos no diálogo. Em revisões autorizadas por lote, sincronize manualmente apenas as páginas `contos/<slug>/index.html` pertencentes ao lote. Não use essa exceção para revisar, reformatar ou regenerar os demais contos.

## Regras editoriais obrigatórias

- A Constituição Editorial Canônica está em `PADRAO_EDITORIAL_ENTRE_SABIOS.md` e deve ser consultada antes de investigar, suspender, recuperar, integrar, reclassificar ou propor remoção de conteúdo.
- Preserve a `DEC-024`: incerteza de autoria ou fonte não autoriza crédito ao Entre Sábios nem remoção automática; proveniência e qualidade são avaliações separadas.
- Conteúdo protegido continua cadastrado somente em `NUCLEO_PRESERVACAO_EDITORIAL.md`; a IA pode investigar e propor, mas não remover, substituir, reescrever ou publicar sem decisão individual.
- Não transforme uma formulação editorial em citação literal.
- Se uma frase `exact` for reescrita, marque a nova versão como `inspired` ou `original` e atualize a atribuição exibida.
- Preserve fonte, tipo de atribuição e autoria como campos independentes da qualidade literária.
- Evite clichês, promessas de cura, romantização da dor, imperativos agressivos e conclusões absolutas, sobretudo para luto, culpa, tristeza, ansiedade e falta de propósito intensos.
- Ao revisar texto, prefira imagem concreta, tensão honesta e linguagem simples; não aumente a complexidade apenas para parecer profundo.

## Arquivos gerados, legados e versões paralelas

- `data/entre_sabios_runtime.*` é saída gerada; não usar como fonte de edição.
- Arquivos citados em `DOCUMENTACAO_ENTRE_SABIOS.md` como legados não devem receber recursos novos. Antes de movê-los ou removê-los, atualize os testes que ainda os leem.
- Arquivos com sufixo `-PEDRO` são versões paralelas em avaliação. Não os altere nem os carregue na página sem pedido explícito; primeiro compare-os com a versão sem sufixo e escolha uma única versão ativa.
- Antes de criar arquivo, procure um módulo existente com a mesma responsabilidade.

## Fluxo de trabalho

1. Confira `git status --short --branch` e preserve alterações locais não relacionadas.
2. Leia `PROJECT_STATUS.md` e localize a funcionalidade, o estado e as pendências vigentes.
3. Consulte as decisões relacionadas em `DECISIONS.md` e identifique a fonte canônica antes de editar.
4. Classifique o pedido como `novo`, `apenas auditado`, `parcial`, `concluído`, `regressão` ou `contraditório`.
5. Reproduza o problema quando o pedido for uma correção. Não substitua um mecanismo sem provar a falha.
6. Faça a menor alteração que resolva o pedido; não reestruture partes não relacionadas.
7. Rode primeiro o grupo de testes indicado por `npm run test:changed -- <arquivos>` e depois a regressão proporcional ao risco.
8. Se alterar o acervo, gere o runtime com `npm run build:content` e confira-o com `npm run check:content`.
9. Antes de concluir código, conteúdo, SEO ou governança, execute `npm run verify`.
10. Informe antes/depois, arquivos modificados, validações executadas e qualquer limitação remanescente.

## Barreira de contradições

- Antes de implementar, compare o pedido com todas as decisões vigentes relacionadas.
- Se o pedido desfizer comportamento aprovado, pare antes da edição, cite os IDs `DEC-NNN`, explique o impacto e peça confirmação explícita para substituir a decisão.
- Uma confirmação genérica de “continuar” não substitui decisão vigente quando o conflito ainda não foi explicado.
- Ao substituir uma decisão, marque a anterior como `substituída`, registre a nova decisão, atualize os testes e descreva a migração ou o efeito para usuários existentes.
- Se houver apenas suspeita de conflito, audite o caminho ativo antes de editar. Não crie uma segunda solução paralela.

## Tratamento de problemas recorrentes

1. Procure ocorrência semelhante em `REGISTRO_PROBLEMAS_RECORRENTES.md` e nos testes.
2. Registre evidência, sequência de reprodução e ambiente; não trate impressão como causa confirmada.
3. Se a falha reapareceu, descubra por que a regressão anterior não cobriu o caminho real.
4. Corrija a causa na menor unidade e acrescente ou fortaleça um teste de regressão.
5. Só marque como validado depois que o teste específico e a regressão proporcional passarem.

## Hierarquia das fontes de verdade

1. Código e acervo canônicos definem o comportamento executável.
2. `DECISIONS.md` define escolhas duradouras vigentes.
3. `PROJECT_STATUS.md` define o estado vivo e as pendências atuais.
4. `DOCUMENTACAO_ENTRE_SABIOS.md` explica arquitetura e operação vigentes.
5. Relatórios de fase são evidências históricas; não autorizam trabalho nem prevalecem sobre o estado vivo.

Quando houver divergência entre essas camadas, não escolha silenciosamente: registre a inconsistência e corrija primeiro a fonte viva apropriada.

## Segurança de mudanças

- Preserve alterações não relacionadas já presentes no diretório de trabalho.
- Não use comandos destrutivos para limpar ou restaurar arquivos sem autorização explícita.
- Não altere a versão, os totais esperados do runtime ou os contratos de teste apenas para fazer uma validação passar; corrija a causa.
- Trate alteração, commit, merge e publicação como autorizações separadas.
- Adicione arquivos ao Git por escopo explícito; nunca use inclusão ampla em um diretório com pendências locais.
- Para tarefas de publicação, valide a allowlist com `npm run check:deploy` e não envie mestre, testes, relatórios ou ferramentas internas ao servidor público.
- Prefira uma branch por tarefa e um `git worktree` dedicado quando o diretório principal contiver pendências locais protegidas; não migre a tarefa atual no meio de um diff sem necessidade.

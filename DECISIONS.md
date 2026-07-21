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
- **Estado:** vigente
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
- **Estado:** vigente
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

## Como registrar uma nova decisão

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

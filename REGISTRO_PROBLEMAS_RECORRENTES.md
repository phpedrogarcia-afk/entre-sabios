# Registro enxuto de problemas recorrentes

> Este arquivo é um modelo operacional, não uma fila automática de mudanças. Um alerta do laboratório só vira problema confirmado depois de reprodução e análise.

## Estados

`detectado` → `reproduzido` → `causa_confirmada` → `corrigido` → `validado`

Também podem ser usados `falso_positivo`, `limite_do_acervo`, `dependência_externa` e `futuro_editorial`.

## Categorias

- `RELEVANCE`: principal ignorado, secundário fraco/dominante ou combinação genérica;
- `SAFETY`: confronto, pressão, romantização, culpa ou conselho prematuro;
- `CIRCULATION`: repetição, autoria/conceito concentrado, fila reiniciada ou formato restrito;
- `EDITORIAL`: autoria, explicação, orientação, livro ou pensador;
- `INTERFACE`: clique duplicado, estado visual, responsividade ou controles emocionais.

## Modelo de ocorrência

```yaml
id: ES-AAAA-NNN
title:
category:
date:
evidence:
reproductionSequence:
environment:
state: detected
cause:
regressionTest:
responsiblePhase:
affectedFiles: []
fix:
browserValidation:
futureRegression:
commit:
```

## Ocorrências confirmadas neste loop

### ES-2026-001 — Motivação sem deslocamento mensurável

- categoria: `RELEVANCE`;
- estado: `limite_do_acervo` / segurança validada no estresse;
- evidência: 26 de 133 cenários motivados, sendo 23 em intensidade intensa;
- causa provável: sinais motivacionais subordinados à segurança, intensidade e metadados disponíveis;
- correção: nenhuma; não reduzir segurança para produzir diferença artificial;
- teste/fase: auditoria sistemática da Fase 10 e oito sequências de 100 seleções da Fase 11; nenhuma perda de segurança ou repetição evitável.

### ES-2026-002 — Combinações direcionais genéricas

- categoria: `RELEVANCE`;
- estado: `futuro_editorial`;
- evidência: 153 dos 182 pares possíveis não possuem síntese direcional específica;
- causa: catálogo aprovado contém 29 pares;
- correção: nenhuma neste loop; não gerar pares automaticamente.

### ES-2026-003 — Variedade de formatos limitada

- categoria: `CIRCULATION`;
- estado: `futuro_editorial`;
- evidência: 164 cenários com somente um formato disponível, concentrados em Culpa, Solidão, Ansiedade, Confusão, Raiva e Medo;
- causa: distribuição do acervo congelado;
- correção: nenhuma; não criar textos nem reclassificar formatos.

Nenhuma repetição evitável, dominância secundária, perda do principal ou lacuna com menos de três candidatos seguros foi confirmada. A Fase 11 percorreu 100% dos elegíveis observados antes de reiniciar os ciclos e validou também a atomicidade de mouse, teclado e toque.

### ES-2026-004 — Contos sujeitos a combinação de arquivos em cache

- categoria: `INTERFACE`;
- estado: `validado`;
- evidência: o catálogo, o controlador e o HTML dos contos foram alterados no primeiro lote, mas os dois scripts continuaram inicialmente referenciados por marcadores de cache anteriores; a abertura funcionava em sessão limpa, sem cobrir navegadores com arquivos já armazenados;
- sequência de reprodução: comparar os marcadores de `js/data/tales.js` e `js/features/tales.js` no HTML publicado com o conteúdo novo entregue sob as mesmas URLs versionadas;
- ambiente: site publicado e navegador com cache anterior; a sessão local limpa não reproduziu falha funcional;
- causa: a validação anterior cobria abertura, conteúdo, rolagem e responsividade, mas não vinculava o marcador de cache ao conteúdo efetivo dos dois scripts;
- correção: marcador único derivado do SHA-256 combinado do catálogo e do controlador; teste falha sempre que qualquer um dos arquivos mudar sem atualização correspondente no HTML;
- teste de regressão: `tests/tales-editorial-batch.test.mjs` e fluxo de abrir, fechar e reabrir em `tests/browser/critical-paths.spec.mjs`;
- arquivos afetados: `index.html`, `tests/tales-editorial-batch.test.mjs`, `tests/browser/critical-paths.spec.mjs`;
- publicação: pendente e separada desta correção local.

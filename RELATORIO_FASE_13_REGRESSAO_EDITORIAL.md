# Relatório da Fase 13 — Regressão editorial

Data: 16 de julho de 2026

## Resultado

Estado: `concluído e aprovado tecnicamente`.

Nenhuma regressão foi encontrada e nenhuma alteração funcional foi necessária. Esta fase apenas verificou os contratos já implementados e aprovados.

## Verificação completa

Comando:

```sh
npm run verify
```

Resultado:

- análise estática: 95 arquivos JavaScript/MJS aprovados;
- JSON: 8 arquivos aprovados;
- runtime sincronizado sem escrita;
- 249 testes aprovados;
- 0 falhas, 0 cancelamentos e 0 testes ignorados;
- duração dos testes: aproximadamente 45,8 segundos;
- duração total da verificação: aproximadamente 52 segundos.

## Acervo congelado

- versão: `definitiva-2.1`;
- conteúdos ativos: 283;
- núcleos: 64;
- contextuais: 151;
- gerais: 68;
- tamanho do runtime JSON: 221.765 bytes;
- baseline de hash e versão: aprovado;
- nenhuma frase, autoria, associação, intensidade, placement, status ou formato foi alterado nesta fase.

## Matriz de regressão

| Item | Evidência principal | Resultado |
| --- | --- | --- |
| acervo | `content-runtime.test.mjs`, baseline canônico e `check:content` | aprovado; 283 ativos e runtime reproduzível |
| autoria | `authorship-presentation.test.mjs`, `content-runtime.test.mjs` | autoria e classificação editorial rastreáveis |
| status | `content-runtime.test.mjs`, `canonical-contracts.test.mjs` | somente ativos publicáveis no runtime |
| formatos | `behavioral-selection.test.mjs`, `repetition-stress.test.mjs`, `share-image-layout.test.mjs` | formatos preservados e circulando conforme disponibilidade |
| Conheça o pensador | `interface-wiring.test.mjs`, `authorship-presentation.test.mjs` | bloco independente; não substituído por orientação |
| orientação | `editorial-guidance.test.mjs`, `interface-wiring.test.mjs` | somente texto específico e contexto curado; sem fallback genérico |
| explicação | `editorial-explanations.test.mjs`, `interface-wiring.test.mjs` | textos prioritários idênticos às fontes editoriais anteriores |
| livros | `book-recommendations.test.mjs`, `interface-wiring.test.mjs` | relação substantiva, rotação e ocultação segura preservadas |
| compartilhamento | `copy-removal-sharing.test.mjs`, `share-image-layout.test.mjs`, `interface-wiring.test.mjs` | três estilos, sorteio no atalho, escolha manual e fallbacks preservados; botão Copiar ausente |
| modo claro | `interface-wiring.test.mjs` | modo claro continua padrão; modo noturno permanece opcional |
| contos | `tale-image.test.mjs`, `interface-wiring.test.mjs`, SEO e Fase 12 | imagem-piloto, modal rolável e smartphone horizontal preservados |
| ensaios | SEO, referências internas e inspeção de `seo.css` | páginas e links válidos; texto claro usa contraste escuro e tema noturno usa tokens claros |
| segurança | `vulnerable-motivation-safety.test.mjs`, `behavioral-selection.test.mjs` | pressão, confronto, dano e intensidade continuam soberanos |
| motivação | `motivation-control.test.mjs`, `motivation-ranking.test.mjs` | opcional, neutra quando desligada e incapaz de criar elegibilidade |
| síntese | `emotional-synthesis.test.mjs`, `synthesis-ranking.test.mjs`, `color-analogy-contract.test.mjs` | determinística, direcional, subordinada ao principal e sem IA remota |
| sentimento principal | `principal-focus-control.test.mjs`, `behavioral-selection.test.mjs` | muda somente por ação explícita e continua dominante |
| secundários | contratos de estado, síntese e ranking | até dois; refinam sem substituir o principal |
| intensidade | contratos de estado, ranking e vulnerabilidade | preservada como filtro soberano; não é relaxada pela motivação ou síntese |

## Ensaios e legibilidade

As páginas de ensaio continuam ligadas a `style.css` e `seo.css`. No modo claro, os parágrafos usam `rgba(42, 35, 26, 0.78)` sobre o cartão claro. No modo noturno, `.essay-page p` e `.essay-body p` recebem os tokens claros específicos. Nenhum arquivo em `ensaios/`, `contos/`, `seo.css`, `style.css`, `index.html` ou `script.js` foi modificado nesta fase.

Esta checagem estrutural complementa as validações visuais anteriores; ela não reabre redesign ou revisão editorial.

## Trabalho novo e trabalho conferido

Trabalho novo:

- este relatório;
- atualização do estado consolidado da fase.

Trabalho apenas conferido:

- todas as funcionalidades listadas na matriz;
- sincronização do runtime;
- integridade estática;
- acervo e autoria congelados.

Regressões corrigidas nesta fase: nenhuma.

## Proteções

- nenhum conteúdo foi criado ou reclassificado;
- nenhum par ou tríade foi adicionado;
- nenhum arquivo funcional foi alterado;
- nenhuma pendência local protegida foi restaurada, apagada ou adicionada ao Git;
- nenhum commit, push, pull request ou merge foi executado.

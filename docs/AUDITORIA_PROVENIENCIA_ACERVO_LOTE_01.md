# Auditoria de autenticidade e proveniência — etapa 1

**Estado:** inventário inicial preservado; adendo de 18/07/2026 registra decisão posterior sobre a Antologia do Silêncio.  
**Data da leitura:** 18/07/2026 (America/Sao_Paulo).  
**Arquivo canônico analisado:** `entre_sabios_acervo_mestre_final.json`.  
**Commit de base:** `7876aa46f264a327442aa01e6f169ea333ac6ddf`.  
**Impressão digital SHA-256 da versão efetivamente lida:** `3A92BDEC14E0CCF595A911ED98F23EEB19F1046993885DDB38471F7AA3119559`.

## Limites e regra de segurança

> **Adendo posterior:** depois desta leitura inicial, o editor-chefe confirmou expressamente que a “Antologia do Silêncio” foi integralmente gerada por IA. Essa confirmação humana resolveu a incerteza apenas para os 28 IDs daquela coleção, agora classificados na categoria I e retirados da publicação conforme a `DEC-029`. A conclusão não foi inferida por estilo e não se estende às adaptações recentes, aos conteúdos baseados em autores, aos textos protegidos ou aos demais originais.

O mestre estava com alterações locais anteriores (856 adições e 328 remoções relativas ao commit de base). Esta auditoria não o modificou, não recompôs o runtime e não alterou IDs, status ou elegibilidade. A impressão digital acima congela a identidade exata da versão revisada; a cópia de trabalho permanece preservada no próprio mestre. Uma cópia material não foi criada para não duplicar, sem autorização editorial, um arquivo local já modificado.

Há uma barreira vigente em `DEC-024`: conteúdos nominalmente protegidos não podem ser removidos, substituídos ou reescritos sem decisão individual do editor-chefe. Este lote os exclui. Nenhuma das propostas abaixo é uma decisão de remoção.

## Inventário inicial

O acervo possui 350 registros históricos e 289 ativos. A distribuição ativa declarada pelo próprio mestre é:

| Evidência/tipo atual | Quantidade | Leitura provisória |
| --- | ---: | --- |
| `translated_quote` | 18 | categoria B enquanto a redação, edição, página ou tradução permanecer pendente |
| `paraphrase` | 3 | categoria D provisória; requer conferência individual de texto-base e direitos |
| `traditional` | 1 | categoria C provisória |
| `original` | 33 | não equivale a autoria humana comprovada; origem deve ser investigada antes de F |
| `inspired` | 234 | prioridade máxima; cada caso precisa demonstrar a relação específica com obra/passagem |
| fonte com status `verified` | 11 | evidência bibliográfica declarada; não basta, isoladamente, para confirmar a redação exibida |
| fonte com status `verified_translation_pending` | 16 | autoria/obra confirmadas, tradução exibida ainda pendente |
| fonte `not_applicable` | 262 | em geral registra acervo editorial, não uma fonte externa do texto-base |

Não há citação ativa marcada como `exact_quote`. Portanto, nesta passagem não se declara nenhuma categoria A nova. As 18 referências pendentes já documentadas em `PROJECT_STATUS.md` continuam pendentes; não foram reclassificadas.

### Sinais de risco que exigem investigação, não conclusão

- 249 conteúdos ativos registram origem nos “sete lotes JSON originais”; 234 inspirações ativas concentram-se no mesmo modelo de atribuição pública.
- 262 itens ativos apontam para “Acervo editorial Entre Sábios” como fonte. Isso descreve o local de curadoria, não estabelece obra, passagem, pessoa redatora ou processo de criação.
- Os conteúdos protegidos e as adições com origem declarada pelo editor-chefe possuem evidências diferenciadas e serão tratados em lotes próprios, somente mediante autorização individual.
- Não há, nos metadados lidos, prova suficiente de geração por IA para qualquer item. Origem em lote, fórmula genérica, semelhança de estilo ou atribuição ampla são sinais de suspeita, nunca prova de H ou I.

## Ordem proposta dos lotes

1. Inspirações ativas dos sete lotes JSON sem passagem ou texto-base registrado (este lote).
2. Demais inspirações ativas, separadas por coleção de origem.
3. 18 citações traduzidas com referência pendente.
4. Adaptações/paráfrases e textos tradicionais.
5. Originais sem evidência humana documentada.
6. Conteúdos gerais e de núcleo que não estejam protegidos.
7. Conteúdos nominalmente protegidos, em dossiês individuais e somente com autorização expressa.

## Primeiro lote para aprovação humana — 20 inspirações ativas

Todos os itens abaixo vêm dos “sete lotes JSON originais”. A fonte hoje registrada é apenas a nota indicada; nenhuma passagem sustentadora foi localizada no mestre. `Relação` avalia a ligação conceitual, não comprova autoria humana. `Retirada do nome` registra se o texto mantém alguma razão editorial sem o autor indicado; `intercambiável` assinala se o nome parece decorativo. Confiança refere-se à proposta, não à autoria.

| ID | Texto | Autoria exibida / fonte atual | Relação e passagem sustentadora | Categoria proposta | Sinais / retirada do nome / intercambiável | Decisão e confiança |
| --- | --- | --- | --- | --- | --- | --- |
| batch01-quote-001 | “A consciência excessiva pode transformar até uma pequena culpa em um tribunal interminável.” | Entre Sábios, inspirado em Dostoiévski; nota: *Memórias do Subsolo*. | plausível; passagem não registrada | G | fórmula geral; sim / sim | suspender para investigação; média |
| batch01-quote-012 | “Nem toda queda é fracasso; algumas apenas arrancam de você a pose que impedia o movimento.” | Entre Sábios, inspirado em Nietzsche; nota: Nietzsche. | apenas estilística; passagem não registrada | J | máxima motivacional; sim / sim | suspender para investigação editorial; média |
| batch01-quote-016 | “O amor assusta porque pede presença, e presença é sempre uma forma de nudez.” | Entre Sábios, inspirado em Clarice Lispector; nota: Clarice Lispector. | apenas estilística; passagem não registrada | J | imagem intercambiável; sim / sim | suspender para investigação editorial; média |
| batch01-quote-017 | “A solidão, quando não é castigo, pode ser a sala onde a pessoa finalmente se escuta.” | Entre Sábios, inspirado em Clarice Lispector; nota: Clarice Lispector. | distante; passagem não registrada | G | estrutura genérica de reframing; sim / sim | suspender para investigação; média |
| batch01-quote-024 | “A ironia é a elegância de quem já não consegue acreditar sem se defender.” | Entre Sábios, inspirado em Emil Cioran; nota: Cioran. | plausível; passagem não registrada | G | relação temática possível, sem lastro; sim / parcialmente | suspender para investigação; média |
| batch01-quote-033 | “A revolta é uma forma de dizer não sem abandonar a vida.” | Entre Sábios, inspirado em Albert Camus; nota: *O Homem Revoltado*. | direto conceitualmente; passagem não registrada | E | ideia específica de revolta/afirmação; sim / não | manter somente como inspiração validada após localizar passagem; média |
| batch01-quote-034 | “O absurdo não tira o valor da vida; tira apenas a mentira de que ela precisa vir explicada.” | Entre Sábios, inspirado em Albert Camus; nota: *O Mito de Sísifo*. | direto conceitualmente; passagem não registrada | E | eixo do absurdo reconhecível; sim / parcialmente | manter somente como inspiração validada após localizar passagem; média |
| batch01-quote-036 | “Continuar não é concordar com o absurdo; é impedir que ele tenha a última palavra.” | Entre Sábios, inspirado em Albert Camus; nota: Camus. | distante; passagem não registrada | G | conclusão genérica; sim / sim | suspender para investigação; média |
| batch01-quote-039 | “O que dói nem sempre quer ser resolvido; às vezes quer primeiro ser sentido sem interrupção.” | Entre Sábios, inspirado em Clarice Lispector; nota: Clarice Lispector. | apenas estilística; passagem não registrada | G | fórmula terapêutica ampla; sim / sim | suspender para investigação; média |
| batch02-quote-001 | “Há dias em que a alma parece uma casa alugada por alguém que nunca chega.” | Entre Sábios, inspirado em Fernando Pessoa; nota: *Livro do Desassossego*. | plausível; passagem não registrada | G | imagem própria, mas sem vínculo documental; sim / parcialmente | suspender para investigação; média |
| batch02-quote-002 | “Cansar-se de si mesmo é uma forma secreta de ainda esperar outra versão de si.” | Entre Sábios, inspirado em Fernando Pessoa; nota: Fernando Pessoa. | distante; passagem não registrada | J | máxima intercambiável; sim / sim | suspender para investigação editorial; média |
| batch02-quote-004 | “A lucidez tem noites em que não ilumina; apenas mostra melhor o tamanho do quarto.” | Entre Sábios, inspirado em Fernando Pessoa; nota: Bernardo Soares. | plausível; passagem não registrada | G | imagem específica, vínculo insuficiente; sim / parcialmente | suspender para investigação; média |
| batch02-quote-005 | “Viver sem saber exatamente quem se é também é viver; a identidade nem sempre chega antes do caminho.” | Entre Sábios, inspirado em Fernando Pessoa; nota: Fernando Pessoa. | distante; passagem não registrada | G | conselho geral; sim / sim | suspender para investigação; média |
| batch02-quote-006 | “Algumas perguntas não querem ser respondidas depressa; querem amadurecer dentro de quem pergunta.” | Entre Sábios, inspirado em Rainer Maria Rilke; nota: *Cartas a um Jovem Poeta*. | direto conceitualmente; passagem não registrada | E | diálogo específico com maturação das perguntas; sim / não | manter somente como inspiração validada após localizar passagem; média |
| batch02-quote-007 | “A dor que não pode ser removida talvez ainda possa ser transformada em uma forma mais funda de presença.” | Entre Sábios, inspirado em Rainer Maria Rilke; nota: Rilke. | distante; passagem não registrada | G | linguagem ampla de cuidado; sim / sim | suspender para investigação; média |
| batch02-quote-010 | “O amor não é abrigo contra o medo; muitas vezes é o lugar onde o medo finalmente mostra o rosto.” | Entre Sábios, inspirado em Rainer Maria Rilke; nota: Rilke. | distante; passagem não registrada | G | relação não demonstrada; sim / sim | suspender para investigação; média |
| batch02-quote-011 | “A atenção verdadeira começa quando paramos de usar o outro como espelho das nossas urgências.” | Entre Sábios, inspirado em Simone Weil; nota: Simone Weil. | direto conceitualmente; passagem não registrada | E | atenção ao outro é eixo reconhecível; sim / não | manter somente como inspiração validada após localizar passagem; média |
| batch02-quote-016 | “O mundo não se torna menos áspero porque o compreendemos; às vezes apenas perdemos o luxo da ingenuidade.” | Entre Sábios, inspirado em Schopenhauer; nota: Schopenhauer. | plausível; passagem não registrada | G | pessimismo amplo; sim / sim | suspender para investigação; média |
| batch02-quote-022 | “O coração percebe razões que a lógica só encontra depois, quando já não pode fingir surpresa.” | Entre Sábios, inspirado em Blaise Pascal; nota: Blaise Pascal. | direto conceitualmente; passagem não registrada | E | dialoga com o motivo das razões do coração; sim / parcialmente | manter somente como inspiração validada após localizar passagem; média |
| batch02-quote-030 | “A esperança séria não promete facilidade; ela exige que a pessoa continue mesmo sem aplauso do futuro.” | Entre Sábios, inspirado em Kierkegaard; nota: Kierkegaard. | distante; passagem não registrada | G | nome sustenta formulação genérica; sim / sim | suspender para investigação; média |

## Resultado da dupla leitura

**Proveniência:** nenhum dos 20 contém no mestre uma passagem, edição, página, rascunho ou confirmação de autoria humana que permita demonstrar a inspiração. Cinco têm uma relação conceitual inicial suficientemente específica para pesquisa dirigida (E); os outros quinze permanecem em G. Não há evidência para classificar qualquer um como H ou I.

**Qualidade editorial:** quatro itens apresentam sinais de J (máxima genérica ou autoridade decorativa). Isso não é prova de fabricação artificial e não autoriza retirada. As propostas de suspensão preservam a possibilidade de encontrar fonte, autor humano ou aprovação editorial anterior.

## Decisão posterior delimitada

As propostas relativas aos 20 itens dos sete lotes continuam sem autorização de retirada e permanecem apenas como investigação. Separadamente, a confirmação sobre a Antologia autorizou a retirada de seus 28 IDs, preservados no mestre e inventariados em `docs/ARQUIVO_REJEITADOS_ANTOLOGIA_IA.md`. O runtime foi reconstruído sem esses registros e sem substituição automática.

> **Encerramento posterior:** a `DEC-030` concluiu a cobertura dos 350 IDs. As propostas deste primeiro lote foram absorvidas pelo dossiê completo; itens sem âncora individual permanecem G e ativos por determinação editorial, sem serem confundidos com IA.

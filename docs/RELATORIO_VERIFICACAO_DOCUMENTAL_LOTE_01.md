# Verificação documental de autoria e proveniência — lote 01

**Data:** 22/07/2026  
**Estado:** pesquisa documental concluída; nenhuma aplicação editorial autorizada  
**Escopo:** três passagens longas priorizadas no lote piloto

## 1. Objetivo e limites

Verificar autoria da obra-base, correspondência textual e natureza editorial de `TXT-LUT-003`, do texto sobre coragem sem ID e de `TXT-MED-004`. Não houve restauração, reescrita, mudança de autoria, publicação ou avaliação profunda de qualidade.

## 2. Estado inicial

- Branch `agent/finaliza-loop-estabilizacao`; commit `7876aa46f264a327442aa01e6f169ea333ac6ddf`.
- Mestre `definitiva-2.3`; inventário `1.0.0`; Constituição `DEC-033`, preservando `DEC-024`.
- O diretório já continha numerosas alterações locais não relacionadas, todas preservadas.
- Relatório piloto: nove casos; os três casos deste lote estavam marcados como prioritários e aptos à investigação documental.

## 3. Casos autorizados

1. `REC-01` / `TXT-LUT-003` — conteúdo protegido ausente, com poema-base alegado.
2. `REC-02` / sem ID — texto sobre coragem, anteriormente associado de modo não demonstrado a Nietzsche.
3. `REC-03` / `TXT-MED-004` — fragmento de Rubem Alves desenvolvido em microtexto.

## 4. Metodologia documental

Foram pesquisadas redações exatas e fragmentos distintivos em português; nos casos com obra alegada, foram consultadas passagens primárias ou institucionais. Para Nietzsche, também foram pesquisados inglês e alemão. Resultado negativo foi tratado apenas como ausência de localização, nunca como prova de fabricação.

## 5. Hierarquia de fontes

Foram priorizados o fac-símile da publicação original, acervos universitários, catálogo do Instituto Rubem Alves e corpus digital de *Also sprach Zarathustra*. Páginas de frases apareceram apenas como circulação e não sustentam nenhuma conclusão.

## 6. Visão geral do lote

| ID | Atribuição investigada | Correspondência | Confiança | Classificação | Recomendação provisória |
| --- | --- | --- | --- | --- | --- |
| `TXT-LUT-003` | adaptação de Augusto F. Schmidt | T4 | D4 | DOC-D | manter como adaptação protegida |
| sem ID | Nietzsche / *Zaratustra* | T1 | D1 | DOC-I | preservar como proveniência indeterminada |
| `TXT-MED-004` | adaptação de Rubem Alves | T4 | D4 | DOC-D | manter como adaptação documentada |

## 7. Análise individual

### 7.1 `TXT-LUT-003` — “Quando eu me for”

O fac-símile da *Revista de Antropofagia*, ano I, n. 10, traz “Quando eu morrer”, assinado por Augusto Schmidt, na página 6 impressa. A passagem estabelece que o mundo, as tardes, rios, estrelas, pássaros, prantos e alegrias continuarão após a morte do eu lírico. A versão local conserva continuidade do mundo e imagens naturais, mas cria outro desenvolvimento: experiência concreta, vínculo, gratidão e descanso.

Matriz de fontes:

| Fonte | Tipo | Autoridade | O que sustenta | Limitações |
| --- | --- | --- | --- | --- |
| [Revista de Antropofagia, fev. 1929](https://digital.bbm.usp.br/bitstream/bbm/7064/11/Anno.1_n.10_45000033273.pdf) | primária | alta | autor, título e poema-base | grafia histórica; obra ainda protegida |
| [Boletim Schmidt/UNESP](https://www.fclar.unesp.br/Home/Biblioteca/colecoesespeciais/colecaoyeddaaugustofredericoschmidt/boletim-schmidt_ano2numero1_2022.pdf) | institucional | alta | vínculo do poema com Schmidt | não analisa a adaptação local |
| `NUCLEO_PRESERVACAO_EDITORIAL.md` | interna | alta para o projeto | texto local, trajetória e bloqueio | não identifica quem redigiu a adaptação |

Conclusão: **T4 / D4 / DOC-D**. Schmidt é autor do poema-base; não é documentalmente autor do microtexto. A lembrança anterior de Mário Quintana é contradita pela fonte primária para esta linhagem. `ART-0`: nenhuma evidência de IA. Pode-se afirmar “adaptação documentada de poema de Augusto Frederico Schmidt”; não se pode afirmar “texto de Schmidt” nem liberar publicação.

### 7.2 Texto sobre coragem, sem ID

Texto investigado: “Existe em nós uma coragem capaz de enfrentar aquilo que tenta nos reduzir. Ela não elimina o abismo nem promete uma vida sem dor; ensina a olhar para a dificuldade e ainda afirmar a existência. Crescer não é evitar toda queda, mas descobrir uma força que antes permanecia escondida.”

As buscas exatas e por fragmentos não localizaram circulação externa anterior. No repositório, a primeira ocorrência localizada é a Constituição Editorial; os relatórios seguintes apenas a reproduzem. Em *Zaratustra*, há passagens reais que aproximam coragem, medo, abismo, sofrimento e afirmação da vida. Em “Da visão e do enigma”, a coragem enfrenta o abismo e a dor; em “Do homem superior”, coragem é ver e agarrar o abismo. Isso comprova afinidade temática, não origem textual.

| Fonte | Tipo | Autoridade | O que sustenta | Limitações |
| --- | --- | --- | --- | --- |
| [*Thus Spake Zarathustra*, Project Gutenberg](https://www.gutenberg.org/cache/epub/1998/pg1998-images.html) | primária em tradução | alta para localizar passagens | coragem, abismo e sofrimento em passagens específicas | não contém a redação investigada; não é tradução portuguesa |
| [*Also sprach Zarathustra*, alemão](https://www.gutenberg.org/cache/epub/7205/pg7205.html) | primária digital | alta | corpus original consultado | busca não é prova de inexistência universal |
| `PADRAO_EDITORIAL_ENTRE_SABIOS.md` | interna | alta para o projeto | primeira ocorrência interna localizada | não informa autoria ou criação |

Conclusão: **T1 / D1 / DOC-I**. Não há vínculo específico suficiente para `DOC-F`. Não há evidência de que seja de Nietzsche, de *Assim falou Zaratustra*, do Entre Sábios ou produzido por IA. `ART-0`. A recomendação é preservar como proveniência indeterminada e não exibir atribuição a Nietzsche sem nova evidência.

### 7.3 `TXT-MED-004` — “A porta aberta”

Fontes acadêmicas reproduzem a passagem de *Religião e Repressão* que começa por “Somos assim. Sonhamos o voo, mas tememos as alturas” e desenvolve vazio, liberdade, certezas e gaiolas. O microtexto local mantém esse esqueleto e acrescenta chão, nuvens, escolhas, renúncias, adiamentos e autoproteção. É transformação substancial, não citação.

| Fonte | Tipo | Autoridade | O que sustenta | Limitações |
| --- | --- | --- | --- | --- |
| [Repositório UNEB, citação da p. 9](https://saberaberto.uneb.br/bitstreams/b34e428c-fc91-4934-a3d8-d5e82af324b6/download) | institucional/acadêmica | média-alta | redação-base, autor, obra e página | reprodução secundária |
| [Tese UnB, epígrafe](https://repositorio.unb.br/bitstream/10482/53419/1/2025_CamilaDeAraujoAntonio_TESE.pdf) | acadêmica | média | variante longa e atribuição | reprodução secundária |
| [Instituto Rubem Alves](https://www.institutorubemalves.org.br/produto/religiao-e-repressao/) | institucional | alta para catálogo | autor e existência da obra | não mostra a página investigada |
| `NUCLEO_PRESERVACAO_EDITORIAL.md` | interna | alta para o projeto | fragmento e versão revisada | não prova autoria do texto novo |

Conclusão: **T4 / D4 / DOC-D**. Rubem Alves é sustentado como autor do fragmento-base; a redação integral do microtexto não deve ser atribuída a ele. A atribuição concorrente a Dostoiévski encontrada em circulação secundária não foi sustentada por obra ou passagem primária. `ART-0`. O bloqueio de publicação por direitos permanece.

## 8. Fontes primárias localizadas

- Fac-símile de “Quando eu morrer”, de Augusto Frederico Schmidt, na *Revista de Antropofagia*.
- Corpus digital em alemão e tradução inglesa de *Also sprach Zarathustra*.
- Para Rubem Alves, a obra e a autoria foram confirmadas institucionalmente, mas a edição Loyola de 2005 não foi acessada diretamente; a redação da página 9 foi sustentada por repositórios universitários.

## 9. Fontes contraditórias

- `TXT-LUT-003`: Mário Quintana era lembrança anterior; a publicação primária sustenta Schmidt para o poema-base.
- `TXT-MED-004`: há circulação atribuindo variante a Dostoiévski; não foi localizada fonte primária correspondente. Rubem Alves é a atribuição documentalmente sustentada.

## 10. Traduções e variações

Nenhum dos dois casos adaptados depende de tradução. Para Nietzsche, traduções inglesa e corpus alemão foram usados apenas para localizar conceitos; nenhuma tradução portuguesa foi identificada como fonte do texto sobre coragem.

## 11. Contextos perdidos

Os três casos têm contexto parcial ou desconhecido. `TXT-LUT-003` muda o fecho existencial do poema-base; `TXT-MED-004` transforma uma passagem maior sobre liberdade e certezas; o texto de coragem não tem unidade maior localizada.

## 12. Possíveis inspirações

O texto sobre coragem não alcança o critério de inspiração demonstrável: há conceitos próximos em Nietzsche, mas faltam passagem-base específica, registro de transformação e vínculo além do tema. Os outros dois casos são adaptações documentadas, não inspirações vagas.

## 13. Atribuições não sustentadas

- Nietzsche e *Assim falou Zaratustra* para o texto de coragem.
- Mário Quintana para a linhagem de `TXT-LUT-003`.
- Dostoiévski para o fragmento-base de `TXT-MED-004`.
- Autoria integral de Schmidt ou Rubem Alves sobre os microtextos novos.

## 14. Evidências de geração artificial

Todos os três casos receberam `ART-0`. Não foram localizados prompt, resposta de IA, arquivo de geração, script, commit ou confirmação humana de fabricação. Ausência de fonte não foi convertida em evidência de IA.

## 15. Casos indeterminados

O texto sobre coragem permanece `DOC-I`: autoria, fonte, data anterior, possível texto-base e processo de criação continuam indeterminados.

## 16. Conteúdos aptos à peneira de qualidade

Os três podem ser apresentados ao editor-chefe para decisão sobre avanço. Aptidão aqui significa somente que a situação documental está clara o bastante para a próxima avaliação; não significa aprovação, restauração ou publicação.

## 17. Conteúdos que exigem nova pesquisa

- `TXT-LUT-003`: direitos e versão interna original anterior à revisão.
- Texto de coragem: trajetória interna e eventual fonte ainda não localizada.
- `TXT-MED-004`: consulta direta à edição Loyola de 2005 e situação de direitos.

## 18. Limitações

O histórico Git é raso; buscas públicas não cobrem toda circulação; não houve pesquisa em massa; a edição Loyola não foi consultada diretamente; fontes protegidas foram citadas apenas no mínimo necessário.

## 19. Próxima etapa

Após aprovação humana: **peneira de qualidade editorial, força conceitual, adequação emocional e escolha de formato dos conteúdos documentalmente classificados**.

## Garantias

- Nenhum conteúdo foi restaurado ou removido.
- Nenhuma autoria, fonte, redação, ID, status, runtime, algoritmo ou interface foi alterado.
- Nenhuma decisão editorial definitiva foi aplicada.

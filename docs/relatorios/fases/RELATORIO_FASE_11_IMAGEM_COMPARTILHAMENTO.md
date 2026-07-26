# Fase 11 — Imagem de compartilhamento

## Classificação inicial

- **Concluído e preservado:** três estilos existentes, sorteio no compartilhamento rápido, escolha manual, PNG e formato vertical 1080 × 1920.
- **Concluído, mas com regressão:** a fonte estruturada do runtime podia virar `[object Object]` na mensagem e na imagem.
- **Parcialmente implementado:** o crédito tinha ajuste de largura, mas era cortado silenciosamente após duas linhas.
- **Não iniciado:** cobertura executável do canvas para todo o acervo e todos os tipos de atribuição.

## Trabalho novo

- Normalização da fonte textual, aceitando o formato antigo em string e o formato atual `{ title, status }`.
- Eliminação de fonte duplicada quando ela é igual ao crédito exibido.
- Quebra de linha com preservação de parágrafos e proteção contra tokens maiores que a área útil.
- Escala tipográfica adaptativa: frases curtas partem de 82 px, médias de 72 px e longas de 68 px, com mínimo de 28 px.
- Crédito adaptativo entre 32 px e 22 px, sem o antigo corte por `slice(0, 2)`.
- Rodapé reúne a marca `ENTRE SÁBIOS` e o domínio `entresabios.com`.
- Testes do cartão curto, médio, longo, multilinha, autor curto/longo, acentos, aspas, travessão e fonte estruturada.
- Matriz integral de 283 conteúdos ativos × 3 estilos = 849 cartões.

## Trabalho apenas conferido

- A proporção atual 9:16 foi comparada com o histórico e preservada. O modelo antigo 1080 × 1350 não foi restaurado porque não corresponde a Status/Stories.
- As três variações visuais existentes foram mantidas sem criação de novo estilo.
- O canvas continua independente do CSS e do tamanho da janela do site.
- Os cinco tipos editoriais presentes no runtime foram cobertos: `original`, `inspired`, `translated_quote`, `traditional` e `exact_quote`.

## Trabalho herdado preservado

- Sorteio de estilo restrito ao atalho da frase.
- Escolha manual no painel normal.
- Web Share progressivo, download de fallback e ausência do botão de copiar.
- Domínio correto no arquivo exportado.

## Regressões corrigidas

- Antes: uma fonte estruturada podia ser interpolada como `[object Object]`.
- Depois: somente o título editorial é exibido.
- Antes: créditos longos eram limitados às duas primeiras linhas.
- Depois: o tamanho e a quantidade de linhas se adaptam à área reservada.
- Antes: frases curtas usavam o mesmo teto de 68 px e perdiam presença no quadro 9:16.
- Depois: frases curtas usam até 82 px.

## Arquivos da Fase 11

- `js/features/sharing.js`: correção funcional e tipográfica do canvas.
- `tests/share-image-layout.test.mjs`: nova cobertura do canvas e do acervo completo.
- `tests/interface-wiring.test.mjs`: uma expectativa atualizada para exigir marca e domínio; as demais mudanças já existentes nesse arquivo pertencem a fases anteriores.
- `RELATORIO_FASE_11_IMAGEM_COMPARTILHAMENTO.md`: este relatório.

## Validação

- `node --test tests/share-image-layout.test.mjs`: 6/6.
- Matriz do acervo: 849/849 cartões sem extrapolação geométrica ou serialização inválida.
- `npm test`: 106/106.
- `git diff --check`: sem erro de whitespace; apenas avisos preexistentes de conversão LF/CRLF.

## Limitação registrada

O navegador interno de inspeção visual não estava disponível na sessão. Por isso, a validação automática de geometria, conteúdo e tipografia foi concluída, mas a captura visual real antes/depois no navegador permanece pendente. Nenhum navegador alternativo foi controlado para contornar essa limitação.

## Congelamento de escopo

- O acervo e seus 283 conteúdos não foram editados.
- Algoritmo emocional, autoria, livros, contos, layout normal e fases futuras não foram modificados nesta fase.
- Pendências locais protegidas e arquivos `*-PEDRO` permaneceram intocados.
- A Fase 12 não foi iniciada.

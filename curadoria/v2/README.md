# Curadoria V2

Esta área recebe conteúdo novo sem criar uma segunda fonte de produção. O arquivo
`entre_sabios_acervo_mestre_final.json` continua sendo a única fonte do conteúdo
publicado; o runtime permanece derivado pelo build.

- `candidatos/`: material recebido ou pesquisado, ainda sem aprovação.
- `aprovados/`: lotes aprovados individualmente por decisão humana.
- `rejeitados/`: material recusado, preservado com justificativa.
- `lotes_importados/`: registro dos lotes já aplicados ao mestre.
- `relatorios/`: diagnósticos reproduzíveis, sem peso no algoritmo.

Um lote aprovado deve seguir `contrato_lote_v2.json`. Valide sem escrita com
`npm run import:v2 -- curadoria/v2/aprovados/<lote>.json`; acrescente `--apply`
somente depois de conferir a aprovação registrada.

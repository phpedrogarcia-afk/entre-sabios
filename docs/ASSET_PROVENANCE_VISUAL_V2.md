# Proveniência dos assets visuais — Layout V2

Atualizado em 08/08/2026 para a Etapa 7.1 da migração visual. Este registro não atribui autoria ou licença por inferência. `Provisório` significa que o arquivo pode continuar preservado no repositório, mas não deve ser promovido como asset definitivo sem documentação adicional.

## Assets ambientais integrados na Etapa 6

| Nome | Arquivo / implementação | Função visual | Origem | Autoria conhecida | Licença / base de uso | Interno | IA | Derivado | Integração | Restrições |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Paisagem clara V2 | `assets/environment/landscape-day.webp` | Paisagem aquarelada do papel no tema `day` | Gerada em 30/07/2026 com a ferramenta OpenAI ImageGen, sem imagem de referência | Não há autoria humana identificada; geração operada pelo Codex | Sem licença externa incorporada; uso sujeito aos termos aplicáveis da OpenAI e às regras do projeto | não | sim | WebP derivado somente da saída PNG original por redimensionamento e compressão | 30/07/2026 | Não redistribuir como obra de terceiro; preservar este registro e o prompt |
| Paisagem noturna V2 | `assets/environment/landscape-night.webp` | Paisagem aquarelada do papel no tema `night` | Gerada com ImageGen usando apenas a paisagem clara gerada na mesma sessão como referência de composição | Não há autoria humana identificada; geração operada pelo Codex | Mesma base de uso da paisagem clara; nenhuma licença de terceiro declarada | não | sim | Contraparte repintada da paisagem clara; WebP derivado da saída PNG | 30/07/2026 | Não apresentar como simples filtro nem como obra humana identificada |
| Árvore clara V2 | `assets/environment/tree-day.webp` | Árvore aquarelada transparente do painel direito em `day` | Gerada com ImageGen sobre chroma magenta uniforme | Não há autoria humana identificada; geração operada pelo Codex | Sem licença externa incorporada; uso sujeito aos termos aplicáveis da OpenAI e às regras do projeto | não | sim | Chroma removido pelo utilitário oficial `remove_chroma_key.py`; recorte transparente, redimensionamento e WebP | 30/07/2026 | Uso ambiental; não reconstituir o fundo magenta nem atribuir autoria humana |
| Árvore noturna V2 | `assets/environment/tree-night.webp` | Árvore dourada transparente do painel direito em `night` | Gerada com ImageGen usando apenas a árvore clara gerada na mesma sessão como referência de silhueta | Não há autoria humana identificada; geração operada pelo Codex | Mesma base de uso da árvore clara; nenhuma licença de terceiro declarada | não | sim | Contraparte repintada; chroma removido, recortada, redimensionada e convertida para WebP | 30/07/2026 | Não tratar como filtro/inversão; preservar o par e este registro |
| Corvo V2 | `assets/brand-raven.jpeg` | Símbolo decorativo da marca no cabeçalho | Arquivo enviado diretamente pelo editor em 30/07/2026 | Não informada; nenhuma autoria inferida | Uso autorizado pelo editor para esta integração; licença externa não documentada | não | não determinado | não; JPEG preservado sem alteração | 30/07/2026 | Uso provisório enquanto autoria/licença não forem documentadas; o nome da marca continua como texto acessível |
| Lua V2 | SVG inline em `index.html` (`.header-moon`) | Lua cheia exclusiva do tema `night` | Desenhada internamente em SVG para esta etapa | Construção vetorial do projeto, operada pelo Codex | Asset interno do projeto; sem material externo incorporado | sim | não | não | 30/07/2026 | Decorativa; não usar fora de `night` sem nova decisão visual |
| Folhas V2 | CSS em `css/base.css` (`.environment-leaf`) | Conjunto procedural de 14 folhas estáticas com escala, rotação, nervura e densidade responsivas | Construção procedural interna inspirada na proporção da imagem-modelo enviada pelo editor | Construção CSS do projeto, operada pelo Codex | Asset interno do projeto | sim | não | não | 09/08/2026 | Sem interação e sem animação; tablet e smartphone reduzem a quantidade visível para evitar poluição |
| Vagalumes V2 | CSS em `css/components.css` (`.firefly`) | Pontos de luz exclusivos do tema `night` | Construção procedural interna | Construção CSS do projeto, operada pelo Codex | Asset interno do projeto | sim | não | não | 30/07/2026 | Poucos elementos; sem canvas/biblioteca; animação desligada em movimento reduzido |
| Textura de papel V2 | CSS em `css/components.css` (`.paper-texture`) | Fibra discreta sobre o papel central | Construção procedural interna | Construção CSS do projeto, operada pelo Codex | Asset interno do projeto | sim | não | não | 30/07/2026 | Opacidade baixa; nunca deve reduzir contraste ou interceptar interação |
| Árvore linear V2.1 | `assets/environment/tree-line-art-v2.webp` | Árvore transparente ativa no painel direito em `day` e `night` | Derivada em 08/08/2026 da referência fragmentada fornecida diretamente pelo editor nesta tarefa, com ImageGen e fundo chroma uniforme | Autoria da referência não informada; nenhuma autoria inferida | Uso autorizado pelo editor para esta integração; licença externa não documentada | não | sim | Recorte reinterpretado em traço dourado; chroma removido com `remove_chroma_key.py`, redimensionado e comprimido em WebP RGBA | 08/08/2026 | Uso provisório; preservar referência e este registro; não apresentar como reprodução literal nem atribuir autoria humana |

### Asset ativo derivado na Etapa 7.1

| Arquivo | Dimensões | Bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `tree-line-art-v2.webp` | 900 × 900, RGBA | 338.276 | `37A4C1D9A1D19DA594C33149EE297F8AA1A183530B6923FB3B88A3B36DCEE71A` |

O mesmo arquivo transparente serve aos dois temas por meio de opacidade e tonalidade CSS distintas, evitando duplicação de download. As árvores aquareladas da Etapa 6 permanecem preservadas, mas deixaram de ser carregadas pela home.

### Hashes e orçamento dos quatro raster ambientais

| Arquivo | Dimensões | Bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `landscape-day.webp` | 1600 × 800 | 49.222 | `0923170217596293EADC1E46F935CDD6A4C8B9E27F3BAAADA5924B76B07E87DE` |
| `landscape-night.webp` | 1600 × 800 | 30.044 | `7E75C0D946128695758F89CA0A48F21AD50A2A435B2BD53574D14BEC65E92C61` |
| `tree-day.webp` | 900 × 847, RGBA | 244.108 | `6086571E569B83F3890DBD5247F82E3FEA7E53E98D2FF26E7D90E9BFBDC896E8` |
| `tree-night.webp` | 900 × 849, RGBA | 237.928 | `4D9F8ECBDD1F83B5A81D596663717A480A2592F7679AA78EC4BD47280DBAB211` |

Total integrado: **561.302 bytes**. Cada raster está abaixo de 300 KB e o conjunto permanece abaixo de 1,5 MB.

## Registro dos prompts

- Paisagem clara: paisagem horizontal aquarelada editorial, céu marfim vazio, colinas sálvia/oliva, montanhas cinza-quentes, caminho sutil, detalhe concentrado na base; sem texto, pessoas, prédios ou árvore isolada.
- Paisagem noturna: contraparte repintada da composição clara em verde-floresta profundo, oliva, umber e ouro fumê, névoa e poucos pontos distantes; sem filtro bruto, azul elétrico, lua ou estrelas.
- Árvore clara: árvore madura isolada, copa aberta para a esquerda e tronco à direita, aquarela sálvia/bege/oliva/dourado, fundo chroma `#FF00FF` uniforme e sem reflexos.
- Árvore noturna: mesma família de silhueta, repintada em umber, bronze, oliva e dourado envelhecido, brilho ambiental discreto, fundo chroma `#FF00FF` uniforme.
- Árvore linear V2.1: isolar a árvore dourada delicada da referência fragmentada mais recente; preservar traço, proporção e ramificação; substituir somente o fundo por chroma `#00FF00` uniforme; sem sombra, texto ou marca-d'água. O chroma foi removido localmente e a saída foi comprimida sem substituir os arquivos anteriores.

As saídas PNG originais permanecem no armazenamento de geração do Codex, fora da pasta pública. As capturas visuais canônicas de 1448 × 1086 não foram enviadas à geração, recortadas ou usadas como fundo.

## Inventário anterior e classificação

| Arquivo | Formato / dimensão | Função atual | Origem, autoria e licença conhecidas | Classificação em 30/07/2026 |
| --- | --- | --- | --- | --- |
| `assets/brand-icon.jpg` | JPEG, 128 × 128 | Antiga marca genérica; não mais referenciada pela home | Não documentadas | Provisório e preservado; não definitivo |
| `assets/falling-leaves.png` | PNG RGBA, 1536 × 1024 | Antigo sprite de folhas; não mais referenciado pela home | Não documentadas | Provisório e preservado; não definitivo |
| `assets/quote-landscape.png` | PNG RGB, 1536 × 1024 | Antiga paisagem do card; não mais referenciada pela home | Não documentadas | Provisório e preservado; não definitivo |
| `assets/entre-sabios-social.png` | PNG RGB, 1717 × 916 | Imagem social/SEO existente | Não documentadas neste repositório | Provisório; mantido por compatibilidade, fora da Etapa 6 |
| `assets/contos/alegoria-da-caverna-piloto.webp` | WebP RGB, 1536 × 864 | Ilustração do conto-piloto | Não documentadas neste registro | Provisório; fora da Etapa 6 |
| `assets/essays-night-spring.svg` | SVG | Decoração noturna legada de ensaios | Não documentadas neste registro | Provisório; fora da home e da Etapa 6 |
| `assets/ensaios/*.svg` (12 arquivos) | SVG | Capas/ilustrações dos ensaios | Origem/licença individual não documentadas neste registro | Provisórios; fora da Etapa 6 |
| `assets/icons/feelings-sprite.svg` | SVG | Ícones semânticos dos 14 sentimentos | Desenho vetorial interno consolidado na Etapa 3 | Interno ativo; não alterado nesta etapa |

## Referências canônicas não publicáveis

`ChatGPT Image 28 de jul. de 2026, 20_00_08.png` e `ChatGPT Image 28 de jul. de 2026, 20_00_17.png` são referências de composição fornecidas pelo editor, ambas com 1448 × 1086. Permanecem fora de `assets/`, não são carregadas pela home e não autorizam recorte, publicação, atribuição de autoria ou inferência de licença.

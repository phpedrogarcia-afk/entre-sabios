# Fase 7 — Integração da motivação ao ranking

Data da auditoria: 14/07/2026.

## Objetivo e estado anterior

O botão, o estado de sessão `needsMotivation` e sua indicação discreta já estavam concluídos e aprovados. Antes desta fase, o campo era intencionalmente neutro no ranking. A síntese da Fase 6 já refinava candidatos depois de principal, elegibilidade, segurança, intensidade e secundários.

## Trabalho novo

- catálogo local e revisável de direções motivacionais por sentimento principal;
- adaptador puro que compara somente `themes`, `editorialFunction` e `tone` existentes;
- preferência motivacional inserida depois da síntese no desempate;
- fallback explícito quando o melhor nível não possui candidato com sinais suficientes;
- reordenação dos itens restantes da mesma fila ao ligar/desligar motivação, sem apagar histórico ou criar uma segunda fila de contexto;
- diagnóstico técnico da preferência e do fallback.

## Regra aplicada

A motivação só é considerada quando ligada. Um candidato precisa corresponder a pelo menos duas dimensões independentes entre tema, função editorial e tom. O texto da frase não é analisado e palavras como “força”, “vencer” ou “seguir” não são usadas como atalho.

A ordem permanece:

1. sentimento principal;
2. elegibilidade e bloqueios;
3. segurança;
4. intensidade;
5. secundários;
6. síntese;
7. motivação;
8. desempate, trajetória, histórico, autoria e formato existentes.

A motivação não altera elegibilidade, nível, intensidade, segurança, autoria ou conteúdo.

## Comparação obrigatória

Auditoria com primeira resposta ativada. “Sinais fortes” conta candidatos do melhor nível que correspondem a pelo menos duas dimensões estruturadas.

| Cenário | Elegíveis | Nível desligado→ligado | Escolhido desligado→ligado | Sinais fortes no melhor nível | Fallback |
| --- | ---: | --- | --- | ---: | --- |
| Insegurança moderada | 71 | 1→1 | `batch04-quote-038` → igual | 8 | não |
| Falta de propósito moderada | 79 | 1→1 | `ANT-PRO-002` → igual | 0 | sim |
| Falta de propósito intensa | 7 | 1→1 | `ANT-MICRO-PRO-001` → igual | 0 | sim |
| Tristeza intensa | 11 | 1→1 | `ANT-MICRO-TRI-001` → igual | 7 | não |
| Luto intenso | 11 | 1→1 | `batch04-quote-024` → igual | 8 | não |
| Ansiedade intensa | 8 | 1→1 | `batch03-quote-022` → igual | 0 | sim |
| Raiva moderada | 78 | 1→1 | `batch03-quote-012` → igual | 0 | sim |
| Autoconhecimento + Confusão + Insegurança | 136 | 1→1 | `batch02-quote-005` → igual | 0 | sim |
| Poucos candidatos, cenário controlado | 2 | 1→1 | ranking normal preservado | 0 | sim |

Nos cenários com sinais fortes, o ranking foi refinado, embora a primeira escolha frequentemente já fosse o candidato seguro favorecido ou tenha sido preservada pela trajetória de primeira resposta. Um teste controlado de alternância confirma que, quando há um candidato forte restante, ligar motivação o antecipa sem repetir o conteúdo anterior.

## Conteúdo genérico rejeitado

Foi testado um candidato geral com correspondência motivacional forte contra um candidato de núcleo adequado ao principal. O conteúdo geral permaneceu no nível 5 e perdeu para o nível 1. Como não havia sinal forte no melhor nível, o diagnóstico marcou fallback em vez de usar o conteúdo genérico.

Esse comportamento explica também os fallbacks reais: sinais existentes em níveis inferiores não contam como solução motivacional quando não podem ser escolhidos sem enfraquecer o sentimento principal.

## Motivação contextual

Os perfis locais cobrem as direções solicitadas para:

- Insegurança: capacidade, escolha e tentativa sem confiança total;
- Falta de propósito: sentido e escolha gradual, sem produtividade;
- Tristeza: continuidade mínima e acolhedora;
- Luto: continuidade, vínculo e memória, sem ruptura forçada;
- Raiva: clareza, escolha e regulação, sem confronto;
- Ansiedade: corpo, presente possível e ação sem controle total.

Os demais sentimentos usam um perfil geral sóbrio. Nenhum perfil inclui promessa de vitória, produtividade, pressão por superação ou criação de conteúdo.

## Fallbacks e lacunas

No acervo atual, Falta de propósito, Ansiedade intensa, Raiva moderada e a tríade Autoconhecimento + Confusão + Insegurança não apresentam dois sinais motivacionais independentes no melhor nível auditado. O seletor preserva o melhor conteúdo normal e registra a lacuna. Nenhum conteúdo foi criado ou reclassificado para preenchê-la.

## Arquivos da fase

- Novos: `js/data/motivation-profiles.js`, `js/core/motivation-ranking-adapter.js`, `tests/motivation-ranking.test.mjs` e este relatório.
- Alterados: `js/core/runtime-engine.js`, `script.js`, `index.html` e nomes/expectativas de regressão em testes já existentes.
- Apenas conferidos: controle visual, estado de sessão, síntese, segurança, intensidade, trajetória, antirrepetição, autoria, formatos e correção independente de “Conheça o pensador”.
- Acervo e runtime editorial: sem alteração.

## Não duplicação e preservação

- não foi criado segundo estado emocional;
- não foi criado segundo seletor;
- a fila de contexto e o histórico existentes foram preservados;
- não houve chamada externa, IA em tempo real ou dependência de rede;
- não houve frase, microtexto, explicação, conselho ou autoria nova;
- `Falta de propósito` continua como sentimento;
- Motivação não virou sentimento nem intensidade;
- arquivos `-PEDRO` e pendências locais anteriores permaneceram intocados.

## Resultado

A motivação funciona como preferência contextual e conservadora depois da síntese. Quando os metadados do melhor nível não sustentam a direção, o sistema assume fallback e mantém a seleção normal. A revisão aprofundada de segurança em sentimentos vulneráveis permanece reservada à Fase 8.

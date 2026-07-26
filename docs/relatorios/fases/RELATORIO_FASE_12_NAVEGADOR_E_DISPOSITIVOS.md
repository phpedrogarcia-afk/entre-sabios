# Relatório da Fase 12 — Navegador e dispositivos

Data: 16 de julho de 2026

## Classificação da fase

Estado: `validada no navegador real com pendência de dispositivo físico`.

Nenhuma alteração funcional foi necessária. A fase exercitou a aplicação local em uma instância real do Chrome e alterou temporariamente o viewport para os tamanhos responsivos. A confirmação anterior do usuário em smartphone Android real permanece como evidência complementar. Tablet físico e evento de toque físico não puderam ser produzidos pela automação disponível e, portanto, não são declarados como totalmente aceitos.

## Ambiente

- aplicação local: `http://127.0.0.1:4173/`;
- navegador: Google Chrome real controlado pela extensão;
- diagnóstico: `?debugEmotional=1`, somente local;
- acervo: 283 conteúdos ativos, versão `definitiva-2.1`;
- cenário emocional: Autoconhecimento como principal, Confusão e Insegurança como secundários, intensidade moderada.

## Layouts validados

| Perfil | Viewport | Largura do documento | Altura da página | Overflow horizontal | Rolagem vertical |
| --- | ---: | ---: | ---: | --- | --- |
| desktop | 1440 × 900 | 1440 px | 921 px | não | aplicável |
| smartphone retrato | 412 × 915 | 397 px | 2.333 px | não | alcançou `scrollY 1221` de `1418` |
| smartphone horizontal | 915 × 412 | 900 px | 2.084 px | não | alcançou o final, `scrollY 1672` de `1672` |
| tablet retrato | 768 × 1024 | 753 px | 2.058 px | não | página rolável |
| tablet horizontal | 1024 × 768 | 1009 px | 2.114 px | não | página rolável |

Em todos os perfis, o botão “ENCONTRAR UMA REFLEXÃO” permaneceu presente. No tablet, a região da reflexão mediu 705 px em retrato e 977 px em paisagem, sem ultrapassar o documento.

## Caminho real da interface

O teste utilizou os controles visíveis, sem chamar `selector.select()` diretamente:

1. selecionou Autoconhecimento;
2. adicionou Confusão e Insegurança;
3. confirmou Autoconhecimento como sentimento principal;
4. confirmou a síntese visível dos dois secundários;
5. clicou em “ENCONTRAR UMA REFLEXÃO”;
6. comparou a escolha diagnosticada com o texto renderizado;
7. acionou duplo clique em “Outra perspectiva”;
8. recarregou a página;
9. refez o mesmo estado e gerou nova reflexão;
10. conferiu o histórico restaurado e o console.

## Motor, renderização e histórico

Na primeira seleção diagnosticada, o motor escolheu:

- ID: `Ralph Waldo Emerson-3`;
- texto: “Respeitar a si mesmo é o primeiro modo pelo qual a grandeza aparece.”;
- autoria: Entre Sábios, inspirado em Ralph Waldo Emerson.

O texto e a autoria renderizados coincidiram exatamente com a escolha do motor.

O duplo clique em “Outra perspectiva” aumentou a sessão de diagnóstico de uma para duas seleções, e não para três. Assim, um duplo clique físico do mouse produziu apenas uma nova escolha.

Depois da recarga:

- a sessão de diagnóstico foi restaurada;
- a seleção seguinte elevou o contador para três;
- `globalHistoryBefore` continha 101 registros;
- `globalHistoryAfter` continha 102 registros;
- o conteúdo anterior não foi reapresentado;
- o conteúdo escolhido pelo motor coincidiu novamente com o renderizado.

Isso confirma no caminho real que a persistência é lida antes da nova escolha e gravada antes da próxima ação disponível.

## Console

Não foram encontrados erros nem avisos no console durante a validação.

## Cobertura de interação

| Contrato | Resultado |
| --- | --- |
| clique comum | aprovado no Chrome real |
| clique rápido/duplo | aprovado; uma nova seleção |
| troca de principal e secundários | controles presentes e estado interpretado corretamente |
| recarregamento | aprovado |
| histórico persistente | aprovado por diagnóstico antes/depois da recarga |
| conteúdo escolhido versus renderizado | correspondência exata |
| console | 0 erros, 0 avisos |
| toque | protegido por teste automatizado; validação física pendente |
| tablet físico | pendente; ambos os viewports passaram no Chrome real |

## Limite de aceite

Esta fase não declara teste físico completo em todos os dispositivos. O navegador controlado permite usar tamanhos responsivos, mas isso não reproduz integralmente teclado virtual, barras do sistema, gesto de toque, zoom por pinça ou diferenças específicas do navegador Android.

Para aceite físico integral, resta uma conferência manual curta em tablet real:

1. abrir a página em retrato e paisagem;
2. selecionar sentimentos por toque;
3. gerar e trocar a reflexão rapidamente;
4. recarregar;
5. confirmar rolagem até o final e ausência de deslocamento horizontal.

Nenhum defeito concreto foi encontrado que justifique alteração de código antes dessa conferência.

## Arquivos funcionais

Nenhum arquivo de JavaScript, CSS, HTML ou acervo foi modificado nesta fase. Somente relatório e documentação de estado foram atualizados.

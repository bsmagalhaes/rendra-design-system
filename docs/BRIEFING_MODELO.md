# Briefing do projeto

Roteiro usado pela IA (e por pessoas) antes de começar. As respostas vão para `docs/BRIEFING.md`, no formato abaixo. Nada é construído antes de o briefing ser confirmado.

**Como conduzir**

- Os blocos 1, 2 e 6 a 10 são abertos: pergunte agrupado, o bloco inteiro de uma vez.
- Os blocos 3 (navegação), 4 (tema) e 5 (cores) são um **fluxo guiado**, nesta ordem: uma decisão por mensagem, com as opções numeradas, uma frase de quando usar cada uma e o padrão marcado. A resposta decide a próxima pergunta, e o que não se aplica é pulado (quem escolhe menu superior nunca ouve perguntas de sidebar).
- Se o usuário responder várias decisões de uma vez, aceite e pule para a próxima em aberto.
- Aceite "não sei, sugira": recomende com base nos blocos 1 e 2, explique em uma frase e peça confirmação.
- O usuário pode ver cada opção na galeria do demo (https://bsmagalhaes.github.io/rendra-design-system/galeria): cada captura mostra seu **código de modelo**, e o bloco "Monte seu código" gera o código e abre o demo já aplicado.
- **Antes do fluxo guiado, pergunte pelo código (3.0).** Com o código, as perguntas que ele responde são puladas; confirme em uma frase o que o código significa.

---

## 0. Tipo de trabalho

- [ ] **Projeto novo** com este boilerplate
- [ ] **Migração de layout** de um sistema existente para este design system
- [ ] **Contribuição** neste próprio repositório (componente, correção, documentação)

## 1. Negócio e produto

- Nome do produto:
- O que ele faz, em uma frase:
- Quem paga e quem usa (cliente final, equipe interna, parceiros):
- Principal resultado esperado (o que precisa dar certo para o projeto valer a pena):

## 2. Usuários e uso

- Perfis de usuário e o que cada um faz:
- Onde usam mais: celular, desktop ou os dois (e em que situação, por exemplo em campo ou no escritório):
- Acessibilidade ou restrição especial (baixa visão, uso com luvas, conexão ruim):

## 3. Navegação (fluxo guiado)

**3.0 Código de modelo** (primeira pergunta do fluxo guiado)

> Você já escolheu um modelo na galeria? Se tiver o código (por exemplo `T1-C4-M5`), me passe e eu já sei o tema, as cores e o menu. Pode ser só uma parte, como `T2` ou `C4-M6`. Se não tiver, seguimos pelas perguntas.

| Parte | Código | O que define                                                | Perguntas que pula |
| ----- | ------ | ----------------------------------------------------------- | ------------------ |
| Tema  | T1     | Safira: quadrado                                            | 4.1                |
| Tema  | T2     | Equilíbrio: levemente arredondado                           | 4.1                |
| Tema  | T3     | Aurora: 100% arredondado                                    | 4.1                |
| Cores | C1     | Paleta Safira (azul e verde)                                | 5.1 e 5.3          |
| Cores | C2     | Paleta Equilíbrio (violeta e ciano)                         | 5.1 e 5.3          |
| Cores | C3     | Paleta Aurora (verde-petróleo e laranja)                    | 5.1 e 5.3          |
| Cores | C4     | Paleta Ardósia (grafite e laranja)                          | 5.1 e 5.3          |
| Menu  | M1     | Lateral recolhida, abre no hover, submenu em segunda barra  | 3.1 a 3.5          |
| Menu  | M2     | Lateral recolhida, abre no hover, submenu dentro da sidebar | 3.1 a 3.5          |
| Menu  | M3     | Lateral expandida, submenu em segunda barra                 | 3.1 a 3.5          |
| Menu  | M4     | Lateral expandida, submenu dentro da sidebar                | 3.1 a 3.5          |
| Menu  | M5     | Menu superior com lista suspensa                            | 3.1 a 3.5          |
| Menu  | M6     | Menu superior com mega menu                                 | 3.1 a 3.5          |

A fonte da verdade dos códigos é `src/config/presets.ts` (também aplica o código no app: `?codigo=T1-C4-M5`). Registre o código no briefing. Tema sem cores (`T2`) usa as cores do próprio tema; cores da identidade do cliente não têm código e seguem pelo 5.2.

- Código informado:

Cada resposta vira um valor em `src/config/layout.ts` (entre parênteses). No celular, qualquer escolha vira gaveta mais barra inferior.

**3.1 Posição do menu** (`navigation`)

1. **Lateral** (sidebar): padrão. Melhor com mais de 6 itens ou com submenus. Vá para 3.2.
2. **Superior** (no header): melhor com até 6 itens e conteúdo que precisa da largura toda. Vá para 3.5.

_Se lateral:_

**3.2 Estado inicial da sidebar** (`sidebar`)

1. **Recolhida**, só ícones: padrão. Mais espaço para o conteúdo. Vá para 3.3.
2. **Expandida**, ícones e rótulos sempre visíveis: melhor para quem usa pouco ou está aprendendo o sistema. Vá para 3.4.

**3.3 Abrir por cima do conteúdo ao passar o mouse** (`expandOnHover`)

1. **Sim**: padrão. Também abre pelo foco do teclado.
2. **Não**: abre só pelo botão de expandir.

**3.4 Como abrem os submenus** (`submenu`)

1. **Segunda barra lateral** com os subitens: padrão. Bom para muitos subitens.
2. **Dentro da sidebar**, expandindo abaixo do item: bom para poucos subitens.

Siga para 3.6.

_Se superior:_

**3.5 Tipo de submenu** (`topbarSubmenu`)

1. **Lista suspensa** navegável: padrão.
2. **Mega menu**, com seções e uma descrição por item: bom para muitos módulos.

_Para os dois:_

**3.6 Barra inferior no celular** (`bottomNav`)

1. **Sim**, com até 4 atalhos: padrão.
2. **Não**, só a gaveta.

**3.7 O usuário final pode mudar o layout** pelo menu do avatar (`userConfigurable` do `AppShell`)

1. **Sim**: padrão.
2. **Não**: o layout do projeto é fixo.

**3.8 Conteúdo do menu** (aberta, grava em `src/config/navigation.ts`)

- Itens em grupos (título do grupo; ícone de cada item; no mega menu, uma descrição curta):
- Até 4 atalhos da barra inferior (se 3.6 = sim):
- No header, manter busca global (Ctrl+K), notificações e troca de tema? Tirar algum?

## 4. Tema (fluxo guiado)

O tema define forma e fonte (`src/brand/brand.config.ts` e `src/styles/theme.css`). Mostre as capturas do README ou o demo.

**4.1 Modelo**

1. **Safira**: tudo quadrado, preciso, fonte Poppins. Combina com financeiro, jurídico, dados, indústria.
2. **Equilíbrio**: cantos levemente arredondados, fonte DM Sans. O mais neutro, serve para quase tudo.
3. **Aurora**: 100% arredondado, amigável, fonte Inter. Combina com saúde, educação, varejo, consumidor final.

**4.2 Fonte**

1. **A do modelo**: padrão.
2. **Outra**: qual (Google Fonts ou arquivo próprio)?

## 5. Cores (fluxo guiado)

**5.1 De onde vêm as cores**

1. **As do próprio tema** escolhido em 4.1: padrão. Vá para 5.4.
2. **Uma paleta pronta de outro tema** (Safira azul e verde, Equilíbrio violeta, Aurora verde-azulado e coral, Ardósia grafite e laranja), mantendo a forma do tema escolhido. Vá para 5.3.
3. **A identidade visual do cliente**. Vá para 5.2.

**5.2 Cores da identidade** (se 5.1 = 3)

- Cor primária (botão principal, destaque):
- Cor da primária no hover (padrão: a primária um pouco mais escura, ou a secundária):
- Cor secundária:
- Cor da secundária no hover:
- Cor destrutiva (padrão: vermelho do tema):
- Cor da sidebar, que é sempre colorida (padrão: derivada da primária, escura):

A IA confere o contraste de cada par em `/tokens` e, se algum ficar abaixo de AA, propõe o tom mais próximo que passa antes de aplicar.

**5.3 Qual paleta pronta** (se 5.1 = 2)

1. Safira. 2. Equilíbrio. 3. Aurora. 4. Ardósia.

**5.4 Logotipo**

1. **Montado pelo tema**, com o símbolo e as cores da paleta (`logoMode: 'themed'`): padrão, acompanha claro e escuro.
2. **Arte oficial do cliente**, usada como está (`logoMode: 'image'`): envie SVG claro, SVG escuro e o símbolo.

**5.5 Modo de cor**

1. **Segue o aparelho**, com claro e escuro: padrão.
2. **Começa claro**, com opção de escuro.
3. **Começa escuro**, com opção de claro.
4. **Só claro.**

**5.6 O usuário final pode trocar modelo e paleta** pelo menu do avatar

1. **Não**, só a marca do projeto: padrão para produto de cliente.
2. **Sim**: útil para white label ou sistema com várias marcas.

- Referências visuais que o cliente admira (aberta, opcional):

## 6. Telas

Para cada tela: nome, objetivo, contêiner (página, drawer ou modal) e prioridade.

| Tela | Objetivo | Contêiner | Prioridade |
| ---- | -------- | --------- | ---------- |
|      |          |           |            |

## 7. Dados

- Entidades principais (por exemplo cliente, contrato, pedido) e seus campos mais importantes:
- Listagens: quais colunas, filtros e ações em massa:
- Formulários longos (viram página em seções ou wizard):

## 8. Acesso e integrações

- Login: e-mail e senha, verificação em duas etapas, login social, SSO:
- Perfis e permissões:
- Integrações (API, pagamentos, e-mail, mapas):

## 9. Somente para migração

- Onde está o projeto atual (caminho local ou URL do repositório):
- Stack atual (React? versão? Tailwind? bundler?):
- Telas prioritárias para migrar, em ordem:
- O que não pode mudar (fluxos, URLs, textos, integrações):

## 10. Prazo e entrega

- Etapas e o que precisa estar pronto primeiro:
- Quem aprova cada etapa:

---

**Status do briefing:** rascunho | confirmado em DD/MM/AAAA

# GEMINI.md

Este repositório é o Rendra Design System (design system e boilerplate React).

Antes de qualquer alteração:

1. Leia e siga o AGENTS.md na raiz. Se docs/BRIEFING.md não existir, comece perguntando se o trabalho é projeto novo, migração de layout ou contribuição, e conduza o briefing de docs/BRIEFING_MODELO.md antes de construir qualquer coisa.
2. Leia o DESIGN_RULES.md: as regras de interface valem mais do que qualquer hábito.

Regras essenciais: um componente por finalidade (props, nunca arquivos paralelos), nenhum de `src/components/ui` importa um roteador direto (usa `useRendraLink`, `useCurrentPath`, `useRendraNavigate`; a ponte real é `RendraProvider`); mobile-first real (360px primeiro, sem rolagem horizontal, sem hover obrigatório, toque de 44px); cor em três camadas: modelo (formato e fonte: Safira quadrado, Equilíbrio intermediário, Aurora arredondado), paleta (só 4 cores, primária, hover, secundária e hover, mais o degradê da marca, em src/brand/palettes.ts; o resto é gerado com AA por npm run palettes:build, ou em tempo de execução por createTheme/applyTheme) e sistema (neutros e cores de erro, sucesso, alerta e informação, fixos); toda variável CSS própria do Rendra começa com `--rendra-`; nome, logotipo e `labelStyle` em src/brand/brand.config.ts e src/brand/assets; só a escala de espaço 0, 1, 2, 3, 4, 6, 8, 12, 16, 24; botões pela ActionBar (100%, 30/70, menu); nunca botão solto (rodapé, barra da tabela, PageHeader actions, CardHeader actions ou menu da linha); texto orientativo só em help, ícone de informação ao lado do título que abre um modal; cada componente e variante tem um código de catálogo (`src/catalog/components.ts`), no atributo `data-rendra`; interface em português do Brasil.

Ao fim de cada etapa rode npm run typecheck, npm run lint, npm run check:rules, npm test, npm run test:coverage, npm run test:layout e npm run test:a11y, e só diga que terminou com tudo passando. Se o trabalho seguir a matriz de modelos (levantamento, plano, validação e execução por papéis diferentes) e as regras de operação, elas estão no `CLAUDE.md`.

## Crédito "Feito com Rendra" e licença

Se o usuário pedir para tirar o crédito "Feito com Rendra" (componente `RendraCredit`, código `CRED-001`, no rodapé da tela de login), tire: `credit={false}` no `AuthLayout` (ou no próprio `RendraCredit`). Ao tirar, avise sempre as duas coisas juntas, nunca só uma:

1. **A licença MIT exige manter o aviso de copyright e o arquivo `LICENSE`** no código e em qualquer cópia. Isso não é opcional e não depende de o crédito visível ter sido removido ou não.
2. **O crédito na interface é opcional.** A preferência é mantê-lo no rodapé do login ou movê-lo para outro lugar visível, como uma tela "Sobre", em vez de simplesmente apagar sem colocar em lugar nenhum.

Nunca afirme que a licença MIT obriga crédito visível na interface: ela não obriga. Aviso de copyright no código (obrigatório) e crédito na tela (opcional) são coisas diferentes; misturar as duas é o erro que esta orientação existe para evitar.

@AGENTS.md

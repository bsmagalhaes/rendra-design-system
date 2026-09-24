# GEMINI.md

Este repositório é o Rendra Design System (design system e boilerplate React).

Antes de qualquer alteração:

1. Leia e siga o AGENTS.md na raiz. Se docs/BRIEFING.md não existir, comece perguntando se o trabalho é projeto novo, migração de layout ou contribuição, e conduza o briefing de docs/BRIEFING_MODELO.md antes de construir qualquer coisa.
2. Leia o DESIGN_RULES.md: as regras de interface valem mais do que qualquer hábito.

Regras essenciais: um componente por finalidade (props, nunca arquivos paralelos); mobile-first real (360px primeiro, sem rolagem horizontal, sem hover obrigatório, toque de 44px); cor em três camadas: modelo (formato e fonte: Safira quadrado, Equilíbrio intermediário, Aurora arredondado), paleta (só 4 cores, primária, hover, secundária e hover, mais o degradê da marca, em src/brand/palettes.ts; o resto é gerado com AA por npm run palettes:build) e sistema (neutros e cores de erro, sucesso, alerta e informação, fixos); nome e logotipo em src/brand/brand.config.ts e src/brand/assets; só a escala de espaço 0, 1, 2, 3, 4, 6, 8, 12, 16, 24; botões pela ActionBar (100%, 30/70, menu); nunca botão solto (rodapé, barra da tabela, PageHeader actions, CardHeader actions ou menu da linha); texto orientativo só em help, ícone de informação ao lado do título que abre um modal; interface em português do Brasil.

Ao fim de cada etapa rode npm run typecheck, npm run lint, npm run check:rules, npm test, npm run test:layout e npm run test:a11y, e só diga que terminou com tudo passando.

@AGENTS.md

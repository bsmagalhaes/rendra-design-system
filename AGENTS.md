# AGENTS.md

Instruções para qualquer agente de IA de desenvolvimento (Codex, Claude Code, Cursor, GitHub Copilot, Gemini, Windsurf, Jules e outros) que abrir este repositório ou for apontado para ele.

Este é o **Rendra Design System**: um design system completo e boilerplate React (tokens, três modelos, quatro paletas, componentes, AppShell, telas base, Storybook e testes de layout). Ele serve para **criar sistemas novos** e para **migrar o layout de sistemas existentes**.

## Leitura obrigatória

1. Este arquivo, inteiro.
2. [`DESIGN_RULES.md`](DESIGN_RULES.md): as regras de interface. Elas valem mais do que qualquer hábito seu. Uma alteração que não as segue está errada, mesmo que funcione.
3. [`README.md`](README.md) e, quando for aplicar em outro projeto, [`docs/COMO_APLICAR.md`](docs/COMO_APLICAR.md).

## Fluxo de início (siga antes de qualquer alteração)

### Passo 1: descobrir o estado

- Se **`docs/BRIEFING.md` não existir** ou estiver com status "rascunho", o projeto ainda não foi configurado: siga os passos 2 a 5.
- Se existir e estiver "confirmado", leia o briefing e siga a partir do passo 5, na etapa em que o trabalho parou.
- Se você foi apontado para este repositório a partir de **outro projeto** ("use este design system no meu sistema"), clone ou leia este repositório como referência e siga o fluxo de **migração**, trabalhando no projeto de destino.

### Passo 2: perguntar o tipo de trabalho

Antes de qualquer outra coisa, pergunte ao usuário, em português do Brasil:

> Vamos começar. Este trabalho é:
>
> 1. **Projeto novo** usando este boilerplate como base;
> 2. **Migração de layout** de um sistema que já existe para este design system;
> 3. **Contribuição** neste próprio repositório (componente, correção, documentação)?

Para **contribuição**, pule o briefing: leia o [`CONTRIBUTING.md`](CONTRIBUTING.md) e vá direto ao trabalho pedido.

### Passo 3: conduzir o briefing

Use o roteiro de [`docs/BRIEFING_MODELO.md`](docs/BRIEFING_MODELO.md).

- Siga o **"Como conduzir"** do modelo. Blocos abertos (negócio, usuários, telas, dados, acesso, prazo) vão agrupados, o bloco inteiro de uma vez.
- **Navegação, tema e cores são um fluxo guiado, nesta ordem**: primeiro pergunte se o usuário tem um **código de modelo** da galeria (`T1-C4-M5`: tema, cores e menu; tabela no item 3.0 do modelo e em `src/config/presets.ts`) e pule o que o código já responde; depois, posição do menu; depois só as opções do caminho escolhido (sidebar: estado, abrir no hover, submenu; menu superior: lista suspensa ou mega menu); barra inferior; tema (modelo e fonte); cores (as do tema, outra paleta pronta ou a identidade do cliente); logotipo; modo de cor. Uma decisão por mensagem, opções numeradas com o padrão marcado, pulando o que não se aplica.
- Nunca decida sozinho o modelo, a paleta, a posição do menu, o tipo de sidebar ou de submenu. Se o usuário pedir sugestão, recomende, explique em uma frase e peça confirmação.
- Aceite "não sei" e ofereça uma sugestão fundamentada. Por exemplo: "sugiro o modelo Equilíbrio e menu lateral recolhido, porque...".
- Não invente dados do negócio, números ou metas. O que o usuário não souber fica marcado como pendente.
- Na **migração**, antes de perguntar, analise o projeto de destino (stack, versões, telas, componentes, marca atual) e só pergunte o que não conseguir descobrir sozinho.

### Passo 4: registrar e confirmar

- Grave as respostas em `docs/BRIEFING.md`, no formato do modelo, com status "rascunho".
- Mostre um **resumo curto** e peça confirmação. Ajuste até o usuário confirmar.
- Marque o status como "confirmado em DD/MM/AAAA".

### Passo 5: planejar e executar em etapas

Proponha um plano em etapas e espere a aprovação. A ordem de referência:

**Projeto novo**

1. Marca: `src/styles/theme.css`, `src/styles/themes.css`, `src/brand/brand.config.ts` e `src/brand/assets`, conforme o briefing (modelo, paleta, modo de cor). Confira `/tokens`: nenhum selo de contraste pode marcar "falha".
2. Menu (`src/config/navigation.ts`), layout do AppShell (`src/config/layout.ts`, com cada valor escolhido no bloco 4 do briefing) e rotas (`src/routes.tsx` e `src/config/routes-list.ts`).
3. Telas, em ordem de prioridade, partindo das telas base de `src/pages`.
4. Limpeza do que é só demonstração (`src/mocks`, telas de exemplo sem uso, templates alternativos não usados).

**Migração de layout**: siga a "Ordem de migração" de [`docs/COMO_APLICAR.md`](docs/COMO_APLICAR.md): tokens e tema, depois AppShell, formulários e ações, listagens, feedback, telas e limpeza.

Ao fim de **cada etapa**:

- rode `npm run typecheck`, `npm run lint`, `npm run check:rules`, `npm test`, `npm run test:layout` e `npm run test:a11y`, e só diga que terminou com tudo passando;
- mostre o resultado em 360px e 1280px (capturas em `screenshots/`);
- espere a aprovação antes de seguir.

## Regras que não podem ser quebradas (resumo do DESIGN_RULES)

- **Um componente por finalidade.** Procure em `src/components/ui` e acrescente uma prop em vez de criar um arquivo parecido. Nunca crie `SelectSimples`, `TableMobile`, `ModalGrande` e similares.
- **Mobile-first real.** Escreva primeiro para 360px. Sem rolagem horizontal no celular, sem ação que dependa de hover, toque mínimo de 44x44px.
- **Marca isolada** em `theme.css`, `brand.config.ts` e `src/brand/assets`. Nada de cor, fonte ou logotipo fixo em componente. O logotipo é o `<BrandLogo />`.
- **Só a escala de espaço** (0, 1, 2, 3, 4, 6, 8, 12, 16, 24) e tokens nomeados. Proibido valor arbitrário (`p-[13px]`), estilo inline, `100vh` e degrau fora da escala.
- **Contêiner certo:** modal até 3 campos, drawer até cerca de 12, página em seções ou wizard acima disso. Nunca modal dentro de modal.
- **Botões pela `ActionBar`:** 1 botão com 100%, 2 botões com 30% e 70%, a partir de 3 as extras vão para o menu.
- **Nunca botão solto:** cada ação tem lugar previsto (rodapé fixo, barra da tabela, `PageHeader actions`, `CardHeader actions`, menu da linha).
- **Texto orientativo nunca no corpo da tela:** vai em `help` (ícone de informação ao lado do título, no `PageHeader`, `CardTitle` ou `FormSection`), que abre um modal. Subtítulo descreve, não instrui.
- **Header sempre fixo**, título da página no header com a trilha abaixo, uma única área de rolagem (o `<main>`).
- **Sidebar sempre colorida**, fundo da tela e dos campos cinza bem claro #f5f6f7 com cards brancos, respiro de página de 24px igual em todos os lados, contraste AA.
- **Formulário:** 3 campos por linha (nunca 2 por padrão), CEP e CNPJ primeiro com 25% e o que eles preenchem abaixo, 16px entre campos, salvar no rodapé fixo (no wizard, junto do card).
- **Listagem:** Novo na barra da tabela com Filtros à esquerda, nada solto acima da tabela, 15 por página com busca em todos os registros, título da linha abre o cadastro.
- **Texto em 100% da largura**; limite de largura só quando pedido.
- **Interface em português do Brasil**, datas em DD/MM/AAAA e valores em R$ 1.250,00.

## Comandos

```bash
npm install                     # dependências
npx playwright install chromium # uma vez, para os testes de layout
npm run dev                     # app em http://localhost:5173
npm run storybook               # Storybook em http://localhost:6006
npm run typecheck               # TypeScript
npm run lint                    # ESLint (TS, hooks, acessibilidade)
npm run check:rules             # regras de design
npm test                        # unitários (Vitest)
npm run test:layout             # Playwright: rotas x larguras x modelos, claro e escuro
npm run test:a11y               # acessibilidade (axe-core, WCAG 2.1 AA)
npm run test:visual             # regressão visual (referências do Linux, geradas no CI)
```

## Conduta

- Pergunte antes de apagar arquivos, trocar dependências principais ou publicar qualquer coisa.
- Nunca desative uma regra, um teste ou uma verificação para fazer passar. Corrija a causa.
- Toda tela nova entra em `src/routes.tsx` e em `src/config/routes-list.ts`, e ganha story em `src/stories/pages.stories.tsx`.
- Relate o resultado com fidelidade. Se algo falhou, mostre a saída.

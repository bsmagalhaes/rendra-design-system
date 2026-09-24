# Changelog

O que mudou em cada versão e o que um projeto derivado precisa fazer para atualizar. Segue o [versionamento semântico](https://semver.org/lang/pt-BR/). Datas em DD/MM/AAAA.

## Não publicado

Nada ainda.

## 1.0.0 (23/09/2026)

Primeira versão publicada: design system, boilerplate, três templates, quatro paletas, mais de 40 componentes, AppShell, telas base, vitrine, Storybook e fluxo de início para IAs.

### Adicionado

- **Demo online** no GitHub Pages: app, vitrine e Storybook, atualizados a cada push na `main`.
- **Registry do shadcn/ui**: cada componente, mais `core`, `tokens`, `layout` e `app-shell`, instalável com `npx shadcn@latest add`. Veja "Receber atualizações" no README.
- **CI no GitHub Actions** em todo Pull Request: tipos, lint, formatação, regras de design, unitários, build, Storybook, layout, acessibilidade e regressão visual.
- **Testes de acessibilidade** com axe-core (WCAG 2.1 AA): todas as rotas, três templates, claro e escuro, paleta Ardósia e celular.
- **Regressão visual** com capturas de referência e um workflow para atualizá-las.
- **Modo escuro nos testes de layout** (360px e 1280px).
- **Testes unitários** com Vitest: validadores, máscaras e navegação.
- **Dependabot** semanal para npm e GitHub Actions.
- **ImageViewer**: visualizador de imagens em popup, com anterior e próxima, setas do teclado, Esc, arrastar para o lado e pinça para ampliar no celular.
- **Galeria** (`/galeria`): as capturas do README, abertas no ImageViewer sem sair da página. O README aponta para ela e agrupa as telas extras em blocos que abrem na própria página.
- **Token `--primary-text`**: a primária usada como texto ou ícone sobre o fundo, com tom próprio no escuro. Classe `text-primary-text`. O verificador de regras barra `text-primary`.
- **`src/styles/themes.css`**: lista os temas carregados. O `globals.css` deixou de importar marca e pode ser atualizado pelo registry.
- **Briefing em fluxo guiado**: navegação (com o caminho da sidebar ou do menu superior), depois tema, depois cores (do tema, de outra paleta pronta ou da identidade do cliente).

### Alterado

- **Primária do Safira** de #0C78F4 para #0B6FE0: 4,8:1 com texto branco (AA). A anterior dava 4,2:1.
- **Telas carregadas sob demanda**: cada rota é um arquivo no build, e a primeira abertura baixa só o AppShell e a tela pedida.
- O botão de limpar do Select e do DatePicker saiu de dentro do botão que abre o painel (HTML válido e leitores de tela). O PickerPanel ganhou a prop `adornment`.
- Select fora de um Field usa a prop `label` como nome acessível do gatilho.

### Para atualizar um projeto que já usa o Rendra

1. Em cada tema do projeto, no claro e no escuro, acrescente `--primary-text` (a primária, ou um tom mais claro no escuro, que passe AA sobre `--card`). Confira em `/tokens`.
2. Crie `src/styles/themes.css` com os `@import` de tema que hoje estão no `globals.css` e troque-os por `@import './themes.css';`.
3. Rode `npx shadcn@latest add @rendra/tokens @rendra/core` e depois os componentes que quiser atualizar.
4. Troque `text-primary` por `text-primary-text` no código do projeto (`npm run check:rules` aponta cada ocorrência).

# Como aplicar o boilerplate

Guia para levar o design system Rendra a um sistema novo ou a um sistema que já existe. Leia antes o [DESIGN_RULES.md](../DESIGN_RULES.md).

## Pré-requisitos

- Node.js 20 ou mais recente e npm 10 ou mais recente.
- Projeto em **React 18 ou 19 com TypeScript**. Com Vite, a adoção é direta. Em outros bundlers (Next.js, por exemplo), é preciso adaptar a importação de SVG como componente (hoje via `vite-plugin-svgr`) e o alias `@/`.
- Tailwind CSS **v4**. Em projeto com Tailwind v3, a migração para a v4 vem antes (veja "Projeto existente").
- Para os testes de layout: `npx playwright install chromium`.

## Caminho 1: projeto novo

1. Copie este repositório para a pasta do novo projeto (clone ou "Use this template"). Apague a pasta `.git` se quiser um histórico novo.
2. `npm install`.
3. Troque a marca (seção "Troca de marca").
4. Apague o que é só demonstração:
   - `src/mocks` e as telas de exemplo em `src/pages/app` que não servirem (mantenha as que forem ponto de partida).
   - Os templates alternativos, se não forem usados: a pasta `src/brand/examples`, os `@import` correspondentes em `src/styles/themes.css` e as importações em `src/brand/index.ts`.
   - Se o layout do projeto for fixo: `<AppShell userConfigurable={false} />` em `src/routes.tsx`.
5. Ajuste o menu em `src/config/navigation.ts` e as rotas em `src/routes.tsx` e `src/config/routes-list.ts`.
6. Rode `npm run check:rules`, `npm run lint`, `npm run typecheck` e `npm run test:layout`.

## Caminho 2: projeto existente

A ideia é trazer a base e depois migrar tela por tela, sem parar o projeto.

1. **Dependências.** Instale as do `package.json` deste repositório: Tailwind v4, Radix, class-variance-authority, tailwind-merge, clsx, lucide-react, React Hook Form, Zod, IMask, React Day Picker, date-fns, TanStack Table v8, Recharts, Sonner, cmdk e Playwright. Se o projeto usa Tailwind v3, rode antes o guia oficial de migração para a v4 (`npx @tailwindcss/upgrade`).
2. **Base visual.** Copie `src/styles`, `src/brand`, `src/lib`, `src/hooks` e `src/components`. Importe `src/styles/globals.css` na entrada do app, envolva o app com `BrandProvider` e coloque o `<Toaster />` na raiz (veja `src/app.tsx`).
3. **Regras e testes.** Copie `scripts/check-design-rules.mjs`, `playwright.config.ts`, `tests/`, `eslint.config.js`, `.prettierrc.json`, `DESIGN_RULES.md` e `CLAUDE.md`, e os scripts do `package.json`.
4. **Convivência.** A escala do Tailwind foi zerada de propósito. Se o CSS antigo usa classes como `p-5` ou `bg-blue-500`, elas deixam de funcionar. Migre tela por tela e, se precisar, mantenha o CSS antigo isolado no arquivo de cada tela enquanto a migração acontece.
5. **Migração** (seção "Ordem de migração").

## Troca de marca, passo a passo

| Passo | Arquivo                     | O que fazer                                                                                                                                                                                                                                                                                  |
| ----- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `src/styles/theme.css`      | Troque os valores (não os nomes) das variáveis: `--primary`, `--primary-hover`, `--secondary`, `--secondary-hover`, os `*-foreground` e `*-hover-foreground`, as semânticas, as superfícies, a sidebar, os degradês e os gráficos. Faça isso no bloco `:root` (claro) e no `.dark` (escuro). |
| 2     | `src/styles/theme.css`      | Troque a fonte: os `@font-face` apontam para `src/brand/assets/fonts`. O nome da família (`Brand Sans`) pode ficar. Máximo de 3 pesos.                                                                                                                                                       |
| 3     | `src/brand/brand.config.ts` | Nome do produto, empresa, frase do login, `shape` (`square`, `rounded`, `pill`) e `sidebarLogo` (`dark` para sidebar escura, `auto` para sidebar clara).                                                                                                                                     |
| 4     | `src/brand/assets`          | `logo-light.svg` (fundo claro), `logo-dark.svg` (fundo escuro), `symbol.svg` (em `fill="currentColor"`) e `favicon.svg`. Para ícones de feedback próprios, preencha `feedbackIcons` no `brand.config.ts`.                                                                                    |
| 5     | Navegador                   | Abra `/tokens` nos modos claro e escuro: nenhum selo de contraste pode marcar "falha". Abra `/componentes` e confira.                                                                                                                                                                        |

Para adotar um dos templates de exemplo como marca ativa, copie `src/brand/examples/<template>/theme.css` sobre `src/styles/theme.css`, troque os seletores `:root[data-brand='<id>']` e `:root[data-palette='<id>']` por `:root`, e `:root[data-palette='<id>'].dark` por `.dark`, juntando os blocos de modelo e paleta. Depois copie `brand.config.ts` e `assets` sobre `src/brand`.

## Ordem de migração

Migre de fora para dentro, com uma verificação ao fim de cada passo:

1. **Tokens e tema.** O projeto passa a ter `theme.css` e `globals.css`. Confira `/tokens`.
2. **AppShell.** Troque o layout antigo pelo `AppShell` com o menu em `navigation.ts`. O header fixo e a rolagem única do `<main>` já resolvem boa parte dos problemas de layout.
3. **Formulários e ações.** Troque inputs, selects e botões pelos componentes únicos. Use `Form`, `FormField` e `ActionBar`.
4. **Listagens.** Troque as tabelas pela `Table`, com `toolbar`, colunas com `mobile` e estados.
5. **Feedback.** Troque alertas, toasts e modais antigos por `Alert`, `toast`, `Modal` e `Drawer`, e use o ícone de feedback da marca.
6. **Telas.** Refaça cada tela com as primitivas (`Container`, `Stack`, `Grid`, `Section`, `PageHeader`), começando pelas mais usadas.
7. **Limpeza.** Remova o CSS e os componentes antigos, depois rode `check:rules`, `lint` e `test:layout`.

Cada tela migrada entra em `src/routes.tsx` e em `src/config/routes-list.ts` e passa a ser verificada pelos testes.

## Testes de layout

```bash
npm run test:layout                         # todas as rotas, 5 larguras, 3 templates, claro e escuro
npm run test:a11y                           # acessibilidade (axe-core) em todas as rotas
TEMPLATES=safira npm run test:layout        # só um template (mais rápido)
npx playwright test -g "safira @ 360px"     # só uma largura
npm run test:layout:report                  # relatório com as falhas
```

O teste falha se a página tiver rolagem horizontal, se algum elemento passar da largura da tela, se algum clicável tiver menos de 44x44px no mobile, ou se houver erro de JavaScript. As capturas ficam em `screenshots/<template>/<rota>-<largura>.png`. O teste sobe o servidor sozinho se ele não estiver rodando.

## Problemas comuns

| Sintoma                                                    | Causa e solução                                                                                                                                               |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uma classe como `p-5`, `w-64` ou `gap-7` "não funciona"    | O degrau não existe na escala. Use um degrau permitido ou crie um token nomeado em `globals.css`. O `check:rules` aponta o arquivo e a linha.                 |
| Cor preta ou cinza num gráfico ou num estilo em JavaScript | Foi usado `var(--color-*)`, que é inline no Tailwind e não existe no CSS. Use `var(--primary)`, `var(--chart-1)` etc.                                         |
| Rolagem horizontal no celular                              | Algum elemento com largura fixa ou texto sem quebra. Use `min-w-0` no flex, `truncate` ou `line-clamp`, e confira no relatório do teste qual elemento passou. |
| Alvo de toque menor que 44px                               | Link de texto ou ícone pequeno. Use `min-h-touch` e `min-w-touch` no mobile, ou amplie com pseudo-elemento e marque `data-touch="expanded"`.                  |
| Zoom automático ao focar um campo no iPhone                | Fonte menor que 16px no campo. Use os componentes de campo, que já têm `text-base md:text-sm`.                                                                |
| Selo "falha" na página `/tokens`                           | Contraste abaixo de AA. Escureça o fundo ou troque a cor do texto no `theme.css`.                                                                             |
| SVG da marca não muda de cor no ícone de feedback          | O símbolo precisa de `fill="currentColor"`, sem cor fixa.                                                                                                     |
| Cores de um template aparecendo em outro                   | O template alternativo não definiu a variável nos dois modos. Toda variável de `:root[data-palette]` precisa existir também no bloco `.dark`.                 |
| O `npm install` falha com `ERESOLVE` no typescript-eslint  | O projeto usa TypeScript 5.9. O TypeScript 7 ainda não é suportado pelo typescript-eslint.                                                                    |

## Checklist de aceite

- [ ] `npm run typecheck`, `npm run lint` e `npm run check:rules` sem erro.
- [ ] `npm run test:layout` e `npm run test:a11y` com 100% dos testes passando.
- [ ] `/tokens` sem nenhum selo "falha" nos modos claro e escuro.
- [ ] Marca trocada só em `theme.css`, `brand.config.ts` e `src/brand/assets`.
- [ ] Nenhum componente duplicado nem versão mobile separada.
- [ ] Todas as telas no AppShell, com o título no header e o conteúdo nas primitivas.
- [ ] Formulários longos em página ou wizard; drawer até cerca de 12 campos; modal até 3.
- [ ] Toda listagem com a `Table`, a barra de ferramentas no mesmo card e os estados vazio, carregando e erro.
- [ ] Revisão visual das capturas em 360px e 1280px.
- [ ] Storybook abrindo sem erro (`npm run build-storybook`).

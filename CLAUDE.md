# CLAUDE.md

## Fluxo de início

Siga o fluxo descrito no [`AGENTS.md`](AGENTS.md): se `docs/BRIEFING.md` não existir, pergunte primeiro se é projeto novo, migração de layout ou contribuição, conduza o briefing de `docs/BRIEFING_MODELO.md` e só então planeje e execute em etapas.

@AGENTS.md

## Leitura obrigatória

**Antes de qualquer alteração de interface, leia o [`DESIGN_RULES.md`](DESIGN_RULES.md) inteiro.** Ele define as duas regras mestras (um componente por finalidade; mobile-first real), a composição de tela, o comportamento no mobile, o que é proibido e o checklist de revisão. Uma alteração de interface que não segue esse documento está errada, mesmo que funcione.

## Resumo do projeto

Design system e boilerplate React (Vite, TypeScript estrito, Tailwind CSS v4, Radix, shadcn/ui copiado para `src/components/ui`). Três templates: Rendra Safira (ativo), Equilíbrio e Aurora.

- Marca: só em `src/styles/theme.css`, `src/brand/brand.config.ts` e `src/brand/assets`.
- Tokens estruturais (escala de espaço, tipografia, raio por papel): `src/styles/globals.css`.
- Componentes: `src/components/ui` (um por finalidade) e `src/components/layout` (primitivas).
- AppShell: `src/components/app-shell`; layout em `src/config/layout.ts`; menu em `src/config/navigation.ts`.
- Rotas: `src/routes.tsx`; lista para os testes em `src/config/routes-list.ts`. Rota nova entra nas duas.
- Vitrine: rota `/componentes` (`src/pages/components-page.tsx` e `src/pages/showcase`).

## Comandos

```bash
npm run dev           # app em http://localhost:5173
npm run storybook     # Storybook em http://localhost:6006
npm run typecheck     # TypeScript
npm run lint          # ESLint (TS, hooks, acessibilidade)
npm run check:rules   # regras de design que o Tailwind não barra
npm run test:layout   # Playwright: rotas x larguras x templates
npm run build         # build de produção
```

## Como trabalhar aqui

- Antes de criar um componente, procure um existente em `src/components/ui` e acrescente uma prop.
- Nunca use valor arbitrário, degrau fora da escala, cor fixa ou estilo inline. Se faltar um tamanho, crie o token em `globals.css`.
- Toda tela nova: entre em `routes.tsx` e `routes-list.ts`, passe no `test:layout` e tenha story em `src/stories/pages.stories.tsx`.
- Textos da interface em português do Brasil.

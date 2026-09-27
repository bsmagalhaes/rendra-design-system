# Prompt de migração

## Como usar

1. Decida antes o caminho: **A** (pacote npm, para um sistema que já existe) ou **B** (clonar o repositório, para um sistema novo, do zero). O prompt pergunta, mas ajuda já dizer na primeira mensagem qual dos dois.
2. Troque `[LINK DO REPOSITÓRIO]` pelo endereço do repositório: o oficial é https://github.com/bsmagalhaes/rendra-design-system. Use outro se tiver uma cópia própria (fork ou caminho local).
3. Abra a IA do projeto de destino (Claude Code, por exemplo) na raiz desse projeto.
4. Cole o bloco inteiro abaixo como primeira mensagem.
5. A IA trabalha em etapas e mostra o resultado de cada uma antes de seguir. Aprove ou peça ajustes a cada etapa.
6. Se o projeto de destino tiver outra marca, tenha em mãos: cores primária e secundária (e as de hover), o degradê da marca (3 cores, da luz ao fundo), a fonte, o estilo do rótulo dos campos (discreto ou normal, `labelStyle`), o formato (`square`, `rounded` ou `pill`) e os SVGs do logotipo claro, do logotipo escuro e do símbolo.

## Prompt

```text
Você vai aplicar neste projeto o Rendra Design System, disponível em [LINK DO REPOSITÓRIO] (repositório oficial: https://github.com/bsmagalhaes/rendra-design-system).

ESCOLHA O CAMINHO ANTES DE QUALQUER OUTRA COISA
Se eu ainda não disse qual caminho seguir, pergunte:
1. Caminho A, pelo pacote npm `@rendra-ui/web`: recomendado para um sistema que já existe. Migra tela por tela, sem copiar nenhum arquivo do repositório; o roteador e a estrutura de pastas continuam sendo os deste projeto.
2. Caminho B, clonando o repositório: para um sistema novo, do zero, com o boilerplate inteiro (AppShell, telas base, Storybook).

ANTES DE QUALQUER ALTERAÇÃO (os dois caminhos)
1. Leia no repositório de referência, nesta ordem: AGENTS.md, DESIGN_RULES.md, CLAUDE.md (matriz de modelos e regras de operação, se for seguir esse fluxo em etapas com papéis diferentes) e docs/COMO_APLICAR.md. O DESIGN_RULES.md é obrigatório e vale mais do que qualquer hábito seu.
2. Analise este projeto: stack, versão do React, bundler, estrutura de pastas, telas existentes, componentes de interface existentes e como a marca está aplicada hoje. No caminho B, confira também a versão do Tailwind CSS.
3. No caminho A, confira antes de instalar: exige React 19.3 ou mais recente, react-dom na mesma versão e radix-ui 1.6.7 ou mais recente; typescript é opcional, só para o comando `rendra trocar`. O pacote não exige Tailwind no projeto de destino.
4. Se ainda faltar decidir navegação, tema ou cores, conduza o fluxo guiado de docs/BRIEFING_MODELO.md (uma decisão por mensagem, aceitando "não sei, sugira").
5. Me apresente um plano curto: o que será instalado ou copiado, a lista de telas a migrar em ordem e os riscos. Espere minha aprovação.

REGRA ZERO
Nenhum artefato deste processo (levantamento, plano, rascunho de briefing ou qualquer outro documento de trabalho) entra no git deste projeto de destino. Mantenha esses arquivos fora do controle de versão.

CAMINHO A: PELO PACOTE NPM
1. Instale: `npm install @rendra-ui/web react react-dom radix-ui`.
2. Importe o CSS uma vez, na entrada do app, nesta ordem: `@rendra-ui/web/tokens.css`, `@rendra-ui/web/base.css`, `@rendra-ui/web/components.css`. As camadas são `@layer theme, base, rendra.base, components, rendra.components, utilities`: o CSS do Rendra sempre perde para o CSS deste projeto na mesma camada, e não precisa de `@source`. O `tokens.css` não traz `@font-face`: declare a fonte deste projeto e sobrescreva a variável `--rendra-brand-font`.
3. Roteador: se este projeto usa react-router, envolva as rotas com `<RendraRouterBridge>`, de `@rendra-ui/web/router-bridge` (sem `children`, ele renderiza `<Outlet />`). Com outro roteador, escreva um `RendraProvider` próprio (também de `@rendra-ui/web`), com `linkComponent`, `useCurrentPath`, `navigate`, `goBack` e, se quiser trilha, `useBreadcrumbs`.
4. Monte o `<AppShell>`: só `navigation` é obrigatória. As demais props, todas opcionais, são `layout`, `user`, `userMenuItems`, `onLogout`, `homeLabel`, `quickActions`, `notifications`, `userConfigurable` e `children`.
5. Marca: importe `createTheme` e `BrandProvider` de `@rendra-ui/web` (nunca de `@/brand`, que é só do clone). Gere o tema com `createTheme({ id, name, mode: 'gerado', seed: { primary, primaryHover?, secondary, secondaryHover?, gradient: [luz, meio, fundo] } })` e passe para `<BrandProvider theme={theme}>`. Confira `theme.report` (nenhum item com `passesAA: false`) e `theme.adjustments` no lugar da página `/tokens`, que não existe no pacote. Preencha `BrandConfig` com os logos (claro e escuro), o símbolo (em `currentColor`), o favicon, `shape`, `sidebarLogo` e `labelStyle`.
6. Antes de migrar qualquer tela, leia a skill de migração parcial: https://github.com/bsmagalhaes/rendra-design-system/blob/main/skills/rendra-migracao-parcial/SKILL.md (ela não vem no pacote, que publica só `dist` e `bin`). Siga os três níveis dela, nesta ordem, confirmando comigo o nível e a pasta antes de cada um: tokens (nível 1, com `rendra auditar` e sete regras estáticas: cor fixa, valor arbitrário, estilo inline, fonte fixa, `100vh`, degrau fora da escala, raio fixo), padrões (nível 2) e componentes (nível 3, sempre com `rendra trocar --dry-run` antes de gravar).
7. Rode `npx rendra auditar` até a lista sair vazia (ele sai com código 1 enquanto houver violação e com código 0 quando não houver: use isso como verificação). Para trocar a variante de um componente, rode sempre `npx rendra trocar <DE> <PARA> --dry-run` primeiro e só grave depois de eu confirmar o resultado da simulação. Sem instalar o pacote neste projeto, `npx @rendra-ui/web <comando>` roda a mesma CLI direto do registry.
8. Verificação obrigatória ao fim de cada etapa: os scripts que este projeto já tiver (typecheck, lint, teste) mais `npx rendra auditar`. Só diga que uma etapa terminou com tudo passando.

CAMINHO B: CLONANDO O REPOSITÓRIO
1. Marca: `src/brand/palettes.ts` (as 4 cores e o degradê) e `npm run palettes:build`; se o modelo mudar, `src/styles/theme.css`; nome, logotipo e `labelStyle` em `src/brand/brand.config.ts` e `src/brand/assets`. Confira `/tokens`: nenhum selo de contraste pode marcar "falha".
2. AppShell: monte o `AppLayout` com o menu de `src/config/navigation.ts` e o resto das props do `<AppShell>` (layout, usuário, menu do avatar, ações rápidas, notificações), dentro do `<RendraRouterBridge>` na raiz das rotas.
3. Telas, na ordem do plano aprovado, partindo das telas base de `src/pages`: formulários e ações, depois listagens, depois feedback (Alert, toast, Modal, Drawer), depois o restante.
4. Toda tela migrada entra em `src/routes.tsx` e em `src/config/routes-list.ts`. Todo componente novo ou alterado leva o código de catálogo (`src/catalog/components.ts`) no atributo `data-rendra` do elemento raiz.
5. Limpeza do código antigo ao final.
6. Verificação obrigatória ao fim de cada etapa: `npm run typecheck`, `npm run lint`, `npm run check:rules`, `npm test`, `npm run test:layout` e `npm run test:a11y`. Só diga que uma etapa terminou com tudo passando.

REGRAS QUE NÃO PODEM SER QUEBRADAS
Siga o `DESIGN_RULES.md` e o `AGENTS.md` do repositório de referência inteiros: eles valem mais do que qualquer hábito seu, e não vou repetir o conteúdo aqui. Resumo do que mais pesa: um componente por finalidade (procure em `src/components/ui` ou nos componentes prontos do pacote antes de criar algo novo); mobile-first real (360px primeiro, sem rolagem horizontal, sem ação que dependa de hover, toque mínimo de 44x44px); marca isolada, nunca cor ou fonte fixa em componente; interface em português do Brasil, datas em DD/MM/AAAA, valores em R$ 1.250,00; nunca desative uma regra ou um teste para fazer passar, corrija a causa.

CRÉDITO E LICENÇA
Veja a seção "Crédito 'Feito com Rendra' e licença" do `AGENTS.md` do repositório de referência antes de tirar ou mover qualquer crédito.

FORMA DE TRABALHO
Trabalhe em etapas e me mostre o resultado de cada uma, em mobile (360px) e desktop (1280px), antes de seguir. Se algo falhar na verificação obrigatória, mostre a saída e corrija antes de seguir. Nunca desative uma regra, um teste ou uma verificação para fazer passar.
```

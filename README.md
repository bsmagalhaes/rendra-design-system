# Rendra Design System

**Design system completo e boilerplate React para sistemas administrativos: tokens, três templates, componentes, AppShell, telas prontas, Storybook e testes de layout.** Feito para ser o ponto de partida de todos os projetos: layouts previsíveis, espaçamento equilibrado e funcionamento completo no celular. Para aplicar a outro sistema, você troca cores, fonte e ícones da marca, e nenhum componente muda.

![React 19](https://img.shields.io/badge/React-19-149eca) ![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178c6) ![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8) ![Vite 8](https://img.shields.io/badge/Vite-8-646cff) ![Storybook 10](https://img.shields.io/badge/Storybook-10-ff4785) ![Playwright](https://img.shields.io/badge/Playwright-570_testes-2ead33) [![CI](https://github.com/bsmagalhaes/rendra-design-system/actions/workflows/ci.yml/badge.svg)](https://github.com/bsmagalhaes/rendra-design-system/actions/workflows/ci.yml)

**Veja funcionando, sem instalar nada:** [demo do app](https://bsmagalhaes.github.io/rendra-design-system/) · [Storybook](https://bsmagalhaes.github.io/rendra-design-system/storybook/) · [vitrine de componentes](https://bsmagalhaes.github.io/rendra-design-system/componentes). No demo, o menu do avatar troca modelo, paleta, modo e layout ao vivo.

---

## O que é

O Rendra reúne, num único repositório, tudo o que uma equipe precisa para construir interfaces consistentes:

- um **sistema de tokens** travado (espaço, tipografia, cores, raio, sombra, degradê e densidade), em que o que está fora da escala simplesmente não existe;
- **três templates** com identidade própria e **quatro paletas** de cores combináveis entre si, com sidebar sempre colorida e logotipo que acompanha o tema;
- **mais de 40 componentes**, um por finalidade, todos reconstruídos para o celular sem versões paralelas;
- um **AppShell** configurável por props (menu lateral ou superior, sidebar recolhida, submenu em segunda barra, mega menu);
- **telas base** prontas (autenticação completa, painel, listagem, detalhe, formulário longo, wizard, configurações);
- uma **vitrine** navegável e um **Storybook** com mais de 100 stories;
- **regras escritas e verificadas por máquina**: verificador de regras de design, ESLint com acessibilidade, testes unitários, e testes no navegador de layout, acessibilidade (axe-core) e regressão visual, rodando no CI a cada Pull Request;
- um **registry do shadcn**: projetos criados a partir do Rendra recebem as melhorias dos componentes com um comando.

Duas regras mestras guiam tudo:

1. **Um componente por finalidade.** Existe um Select, uma Table, um Modal, um Drawer, um Input. Diferenças são props, nunca arquivos novos.
2. **Mobile-first real.** Tudo é desenhado primeiro para 360px, sem rolagem horizontal, sem ação que dependa de hover e com toque mínimo de 44px.

---

## Galeria

> **Quer ampliar sem sair da tela?** Abra a [galeria do demo](https://bsmagalhaes.github.io/rendra-design-system/galeria): cada imagem abre em popup, com setas para passar e Esc para fechar. Aqui no GitHub, clicar numa imagem abre a imagem sozinha (o GitHub não permite popup no README), por isso as telas já aparecem em tamanho de leitura e os grupos extras abrem na própria página.

### Os três templates

Cada template tem formato, fonte, símbolo e paleta próprios.

**Rendra Safira**: quadrado, como uma pedra lapidada. Azul #0B6FE0, verde #98D10A e fonte Poppins.

| Painel                                           | Listagem de clientes                                 |
| ------------------------------------------------ | ---------------------------------------------------- |
| ![Safira: painel](docs/images/safira-painel.png) | ![Safira: clientes](docs/images/safira-clientes.png) |

**Rendra Equilíbrio**: o meio-termo, nem quadrado nem 100% arredondado. Violeta, ciano e fonte DM Sans.

| Painel                                                   | Listagem de clientes                                         |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| ![Equilíbrio: painel](docs/images/equilibrio-painel.png) | ![Equilíbrio: clientes](docs/images/equilibrio-clientes.png) |

**Rendra Aurora**: 100% arredondado, como um novo dia. Verde-petróleo, laranja e fonte Inter.

| Painel                                           | Listagem de clientes                                 |
| ------------------------------------------------ | ---------------------------------------------------- |
| ![Aurora: painel](docs/images/aurora-painel.png) | ![Aurora: clientes](docs/images/aurora-clientes.png) |

**Paleta Ardósia**: paleta avulsa, combinável com qualquer modelo. Azul-ardósia #2E414D e laranja #EA600D (aqui no modelo Equilíbrio).

| Painel                                             | Listagem de clientes                                   |
| -------------------------------------------------- | ------------------------------------------------------ |
| ![Ardósia: painel](docs/images/ardosia-painel.png) | ![Ardósia: clientes](docs/images/ardosia-clientes.png) |

<details>
<summary><strong>Modelo × paleta de cores: as 12 combinações</strong> (clique para abrir aqui mesmo)</summary>

O modelo (formato, fonte e símbolo) e a paleta (cores, degradês e sidebar) são camadas independentes: qualquer modelo aceita qualquer paleta. São 12 combinações (3 modelos × 4 paletas), todas na mesma tela de detalhe do cliente.

| Modelo \ Paleta             | Safira                                        | Equilíbrio                                        | Aurora                                        | Ardósia                                        |
| --------------------------- | --------------------------------------------- | ------------------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| **Safira** (quadrado)       | ![](docs/images/matriz-safira-safira.png)     | ![](docs/images/matriz-safira-equilibrio.png)     | ![](docs/images/matriz-safira-aurora.png)     | ![](docs/images/matriz-safira-ardosia.png)     |
| **Equilíbrio** (meio-termo) | ![](docs/images/matriz-equilibrio-safira.png) | ![](docs/images/matriz-equilibrio-equilibrio.png) | ![](docs/images/matriz-equilibrio-aurora.png) | ![](docs/images/matriz-equilibrio-ardosia.png) |
| **Aurora** (arredondado)    | ![](docs/images/matriz-aurora-safira.png)     | ![](docs/images/matriz-aurora-equilibrio.png)     | ![](docs/images/matriz-aurora-aurora.png)     | ![](docs/images/matriz-aurora-ardosia.png)     |

</details>

<details>
<summary><strong>No celular</strong> (clique para abrir aqui mesmo)</summary>

Mesmo componente, mesma API: no celular a tabela vira cards, a sidebar vira gaveta e a navegação ganha uma barra inferior.

| Safira                             | Equilíbrio                             | Aurora                             | Tabela em cards                               |
| ---------------------------------- | -------------------------------------- | ---------------------------------- | --------------------------------------------- |
| ![](docs/images/safira-mobile.png) | ![](docs/images/equilibrio-mobile.png) | ![](docs/images/aurora-mobile.png) | ![](docs/images/equilibrio-mobile-tabela.png) |

</details>

<details>
<summary><strong>Modo escuro e outras telas</strong> (clique para abrir aqui mesmo)</summary>

| Modo escuro (Safira)               | Modo escuro (Equilíbrio)               |
| ---------------------------------- | -------------------------------------- |
| ![](docs/images/safira-escuro.png) | ![](docs/images/equilibrio-escuro.png) |

| Drawer com rodapé fixo (30/70)     | Mega menu no menu superior            |
| ---------------------------------- | ------------------------------------- |
| ![](docs/images/safira-drawer.png) | ![](docs/images/aurora-mega-menu.png) |

| Login (Aurora)                    |
| --------------------------------- |
| ![](docs/images/aurora-login.png) |

</details>

> As imagens são geradas a partir do app real com `npm run docs:images`.

---

## O que tem dentro

### Tokens

| Token           | Como funciona                                                                                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Espaçamento** | Base de 4px, com os degraus 0, 1, 2, 3, 4, 6, 8, 12, 16 e 24. A escala padrão do Tailwind foi zerada: `p-5` ou `w-64` não geram CSS. Tamanhos de peça viram tokens nomeados (`h-control-md`, `size-touch`, `h-header`).                        |
| **Tipografia**  | 7 tamanhos (`xs` a `3xl`) com line-height e letter-spacing, títulos menores no celular, 3 pesos e campos com 16px no celular (sem zoom no iOS).                                                                                                |
| **Cores**       | Semânticas: `primary`, `secondary`, `destructive`, `success`, `warning` e `info`, cada uma com cor forte, cor de hover, texto, fundo suave e texto sobre o suave. Mais superfícies e neutros. Contraste AA medido ao vivo na página `/tokens`. |
| **Formato**     | `rounded-control`, `rounded-surface`, `rounded-item` e `rounded-avatar`, controlados pelo formato do template (quadrado, meio-termo ou 100% arredondado).                                                                                      |
| **Sombra**      | Três níveis sutis. Superfície de página usa borda de 1px.                                                                                                                                                                                      |
| **Degradê**     | Três por template (forte, suave e detalhe), com regra de uso: nunca em botão ou atrás de texto corrido, e no máximo um forte por tela.                                                                                                         |
| **Densidade**   | Input, botão e select com a mesma altura: 44 a 52px no celular e 32 a 48px no desktop.                                                                                                                                                         |

A marca fica isolada em `src/styles/theme.css`, `src/brand/brand.config.ts` e `src/brand/assets`. Nenhum componente tem cor, fonte ou logotipo fixo.

### Componentes

Todos em `src/components/ui`, um por finalidade, com o ícone de feedback da marca onde houver feedback.

| Grupo          | Componentes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Ações**      | Button (6 variantes, tamanhos, ícone, só ícone, carregando, largura total), ButtonGroup (agrupado ou segmentado), DropdownMenu e ActionBar (regra 100%, 30/70 e menu)                                                                                                                                                                                                                                                                                                                                                                                        |
| **Formulário** | Input (máscaras de CPF, CNPJ, CPF ou CNPJ automático, telefone, CEP, data, hora, moeda e percentual, com ícone, limpar e senha), Textarea com contador, Select (busca, múltiplo com chips, selecionar todos, contador, criar opção, busca remota), Checkbox com indeterminado e grupo, Radio em lista e em cards, Switch, DatePicker (data, período e horário, em pt-BR), Slider, Upload com arrastar e soltar e progresso, OtpInput (2FA), Field, Form, FormField e FormSection com React Hook Form e Zod, e validadores de CPF, CNPJ, telefone, CEP e data |
| **Navegação**  | Tabs (linha ou pílula, vira seletor quando não cabe), Breadcrumb, Pagination (completa, compacta ou "carregar mais") e Wizard/Stepper (etapas concluída, atual, pendente e com erro, com validação por etapa)                                                                                                                                                                                                                                                                                                                                                |
| **Dados**      | Table com TanStack Table (seleção, expansão, ordenação, busca, colunas visíveis, ações em massa e por linha, densidade, estados vazio, carregando e erro, e forma de cards no celular), Card, StatCard, Badge, Avatar e grupo, List, Timeline, Accordion e Chart com Recharts (linha, barra, área e pizza)                                                                                                                                                                                                                                                   |
| **Feedback**   | BrandFeedbackIcon animado (check se desenhando, X se riscando), Toast com Sonner, Alert, Modal (confirmação, destrutiva, informativo e formulário), Drawer (header e rodapé fixos, confirmação de descarte), Popover, Tooltip, EmptyState, ErrorPage (404 e 500), Skeleton e Progress                                                                                                                                                                                                                                                                        |
| **Layout**     | Container (95% da largura a partir de 1024px), Stack, Inline, Grid (por tela ou por container query), Section e PageHeader                                                                                                                                                                                                                                                                                                                                                                                                                                   |

### AppShell

Tudo configurável por props, com o padrão em `src/config/layout.ts`:

- menu **lateral** ou **superior**;
- sidebar **recolhida** (só ícones, padrão) ou **expandida**, com opção de **abrir por cima do conteúdo** ao passar o mouse;
- submenu em **segunda barra lateral** ou **dentro da sidebar**, e, no menu superior, **submenu navegável** ou **mega menu** com seções;
- header sempre fixo, com título da página e trilha, busca global (**Ctrl+K**), notificações, tema e menu do usuário;
- no celular, gaveta de navegação e barra inferior com até 4 itens.

### Telas base

Login, esqueci a senha, verificação em duas etapas (2FA), nova senha, cadastro, painel com indicadores e gráficos, listagem com barra de ferramentas e filtros, detalhe com abas, formulário longo em seções, cadastro em wizard, configurações com navegação interna, criação e edição de registro em drawer, tarefas e página 404.

### Vitrine, Storybook e testes

- **Vitrine** na rota `/componentes`: cada componente com variantes, tamanhos e estados (padrão, hover, foco, ativo, desabilitado, carregando, erro) e as regras de composição.
- **Storybook 10** com mais de 100 stories: viewport de celular por padrão, com tablet e desktop, e alternância de template, paleta e modo claro/escuro na barra.
- **Testes de layout com Playwright** (`npm run test:layout`): 15 rotas × 5 larguras (360, 390, 768, 1280 e 1920) × 3 templates no modo claro, mais 360 e 1280 no escuro, somando 315 testes. Falham se houver rolagem horizontal, elemento maior que a tela, toque menor que 44px no celular ou erro de JavaScript, e geram capturas de todas as telas.
- **Testes de acessibilidade com axe-core** (`npm run test:a11y`): 135 testes, todas as rotas nos três templates, claro e escuro, mais a paleta Ardósia e o celular. Falham em qualquer violação WCAG 2.1 A ou AA, inclusive contraste.
- **Regressão visual** (`npm run test:visual`): 120 capturas comparadas com a referência aprovada. Pegam cor que mudou, espaçamento que quebrou e ícone que sumiu. As referências são geradas no Linux do CI; depois de uma mudança visual intencional, rode o workflow "Atualizar referências visuais" no branch do Pull Request.
- **Testes unitários com Vitest** (`npm test`): validadores de CPF, CNPJ e data, esquemas Zod, máscaras e navegação.
- **CI no GitHub Actions**: todo Pull Request passa por tipos, lint, formatação, regras, unitários, build, Storybook e os três testes no navegador. A `main` só aceita merge com tudo verde. O Dependabot abre PR semanal quando uma dependência ganha versão nova.
- **Verificador de regras** (`npm run check:rules`): barra cor fixa, valor arbitrário, degrau fora da escala, estilo inline, fonte fixa, `100vh` e arquivos duplicados ou mobile.

---

## Stack

React 19, TypeScript 5.9 (estrito), Vite 8, Tailwind CSS 4 (tema via `@theme`), shadcn/ui (copiado para o projeto), Radix UI, class-variance-authority, tailwind-merge com clsx, Lucide, React Router 8, TanStack Table 8, cmdk, Sonner, React Hook Form, Zod 4, IMask, React Day Picker 10, date-fns 4, Recharts 3, Storybook 10, Playwright com axe-core, Vitest, ESLint 9 (TypeScript, React Hooks e jsx-a11y) e Prettier com prettier-plugin-tailwindcss. Somente bibliotecas gratuitas e de código aberto.

---

## Começar com IA

O repositório vem preparado para agentes de IA de desenvolvimento. Ao abrir o projeto, a IA lê as instruções sozinha, pergunta se é **projeto novo** ou **migração de layout**, conduz um **briefing** (negócio, usuários, marca, menu, telas e dados), registra tudo em `docs/BRIEFING.md` e só então constrói, em etapas e com as verificações passando.

| Ferramenta                                   | Arquivo lido automaticamente                                         |
| -------------------------------------------- | -------------------------------------------------------------------- |
| OpenAI Codex, Jules, Gemini, Cursor e outras | [`AGENTS.md`](AGENTS.md)                                             |
| Claude Code                                  | [`CLAUDE.md`](CLAUDE.md)                                             |
| GitHub Copilot                               | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) |
| Cursor                                       | [`.cursor/rules/rendra.mdc`](.cursor/rules/rendra.mdc)               |
| Windsurf                                     | [`.windsurfrules`](.windsurfrules)                                   |
| Gemini CLI                                   | [`GEMINI.md`](GEMINI.md)                                             |

Todos apontam para o mesmo fluxo ([`AGENTS.md`](AGENTS.md)) e as mesmas regras ([`DESIGN_RULES.md`](DESIGN_RULES.md)).

**Para um projeto novo**, cole na sua IA:

```text
Clone https://github.com/bsmagalhaes/rendra-design-system e use como base do meu novo sistema. Siga o AGENTS.md do repositório.
```

**Para migrar o layout de um sistema existente**, abra a IA na pasta do seu sistema e cole:

```text
Aplique neste projeto o design system https://github.com/bsmagalhaes/rendra-design-system. Leia o AGENTS.md e o DESIGN_RULES.md dele e siga o fluxo de migração, começando pelo briefing.
```

A versão completa do prompt de migração, com todas as regras, está em [docs/PROMPT_MIGRACAO.md](docs/PROMPT_MIGRACAO.md). O roteiro do briefing está em [docs/BRIEFING_MODELO.md](docs/BRIEFING_MODELO.md).

---

## Como rodar

Pré-requisito: Node.js 22 ou mais recente (o CI usa o 24).

```bash
npm install
npx playwright install chromium   # só na primeira vez, para os testes
npm run dev                       # app em http://localhost:5173
npm run storybook                 # Storybook em http://localhost:6006
```

| Comando                      | O que faz                                             |
| ---------------------------- | ----------------------------------------------------- |
| `npm run dev`                | Sobe o app com recarga automática                     |
| `npm run build`              | Checagem de tipos e build de produção                 |
| `npm run typecheck`          | Checagem de tipos                                     |
| `npm run lint`               | ESLint com TypeScript, React Hooks e acessibilidade   |
| `npm run check:rules`        | Verificador de regras de design                       |
| `npm test`                   | Testes unitários (Vitest)                             |
| `npm run test:layout`        | Testes de layout (capturas em `screenshots/`)         |
| `npm run test:a11y`          | Testes de acessibilidade (axe-core)                   |
| `npm run test:visual`        | Regressão visual (referências do Linux, ver acima)    |
| `npm run test:layout:report` | Relatório dos testes                                  |
| `npm run storybook`          | Storybook                                             |
| `npm run build-storybook`    | Build estático do Storybook                           |
| `npm run registry:build`     | Gera o registry do shadcn (`registry.json`, `dist/r`) |
| `npm run docs:images`        | Regenera as imagens deste README (com o app rodando)  |

No app, o menu do avatar troca **modelo**, **paleta**, **tema** e **layout**. As mesmas opções estão em Configurações.

---

## Estrutura

```text
src/
  styles/        theme.css (marca), themes.css (temas carregados) e globals.css (tokens estruturais)
  brand/         brand.config.ts, assets (logotipos, símbolo, fontes) e examples (Equilíbrio, Aurora)
  components/
    ui/          componentes, um por finalidade
    layout/      Container, Stack, Inline, Grid, Section, PageHeader
    app-shell/   AppShell, Sidebar, Header, busca global, mega menu, notificações
  config/        navigation.ts (menu), layout.ts (padrão do AppShell), routes-list.ts
  hooks/         useBreakpoint
  lib/           cn, máscaras, validadores, estilos de campo
  pages/         telas base, vitrine (/componentes) e tokens (/tokens)
  stories/       Storybook
tests/           testes de layout (Playwright)
scripts/         verificador de regras, auditoria e geração de imagens
docs/            guia de aplicação, prompt de migração e imagens
```

---

## Como trocar a marca em 5 passos

1. **Cores, fonte e raio:** edite os valores de `src/styles/theme.css` (os nomes das variáveis não mudam) e troque as fontes em `src/brand/assets/fonts`.
2. **Identidade:** edite `src/brand/brand.config.ts` (nome, empresa, frase, formato `square`, `rounded` ou `pill`, e logotipo na sidebar).
3. **Arte:** substitua os SVGs de `src/brand/assets`. O símbolo usa `fill="currentColor"`, porque os ícones de feedback o tingem.
4. **Contraste:** abra `/tokens` nos modos claro e escuro. Nenhum selo pode marcar "falha".
5. **Verificação:** rode `npm run check:rules && npm run test:layout`.

O passo a passo completo, inclusive como adotar o Equilíbrio ou o Aurora como marca principal, está em [docs/COMO_APLICAR.md](docs/COMO_APLICAR.md).

---

## Receber atualizações nos seus projetos

Um projeto criado a partir do Rendra não fica parado no tempo. Os componentes são publicados como um **registry do shadcn/ui** junto com o demo. Para trazer a versão mais nova de um componente, com as dependências dele:

```bash
npx shadcn@latest add https://bsmagalhaes.github.io/rendra-design-system/r/select.json
# ou, com o components.json do boilerplate:
npx shadcn@latest add @rendra/select
```

Itens disponíveis: cada componente de `src/components/ui` pelo nome do arquivo (`button`, `table`, `select`...), mais `core` (funções, hooks e provedor de marca), `tokens` (`globals.css`), `layout` e `app-shell`. A lista completa está em [`registry.json`](registry.json).

O registry nunca traz marca nem configuração: `theme.css`, `themes.css`, `brand.config.ts`, `src/brand/index.ts`, os assets e `src/config` são do seu projeto e não são tocados. Arquivos iguais são pulados, e o shadcn pergunta antes de sobrescrever um arquivo que você alterou. Quando uma versão pedir um token de cor novo no tema, o [CHANGELOG](CHANGELOG.md) diz qual e com que valor.

---

## Documentação

- [DESIGN_RULES.md](DESIGN_RULES.md): todas as regras de interface, o que é proibido e o checklist de revisão. **Leitura obrigatória antes de alterar qualquer interface.**
- [docs/COMO_APLICAR.md](docs/COMO_APLICAR.md): projeto novo ou existente, troca de marca, ordem de migração, testes, problemas comuns e checklist de aceite.
- [docs/PROMPT_MIGRACAO.md](docs/PROMPT_MIGRACAO.md): prompt pronto para a IA do projeto de destino aplicar o design system.
- [AGENTS.md](AGENTS.md): fluxo de início para qualquer IA (tipo de trabalho, briefing e etapas).
- [docs/BRIEFING_MODELO.md](docs/BRIEFING_MODELO.md): roteiro do briefing.
- [CLAUDE.md](CLAUDE.md): instruções para o Claude Code.
- [CHANGELOG.md](CHANGELOG.md): o que mudou em cada versão e o que fazer para atualizar.
- [CONTRIBUTING.md](CONTRIBUTING.md): como propor mudanças.

---

## Autor

Criado e mantido por **Bruno Magalhaes**.

- Site: [www.brunomagalhaes.me](https://www.brunomagalhaes.me)
- E-mail: [contato@brunomagalhaes.me](mailto:contato@brunomagalhaes.me)
- Instagram: [@brunomagalhaes.me](https://www.instagram.com/brunomagalhaes.me/)

Contribuições são bem-vindas pelo fluxo descrito em [CONTRIBUTING.md](CONTRIBUTING.md): toda mudança passa por Pull Request e revisão.

## Licença

[MIT](LICENSE) © 2026 Bruno Magalhaes. Pode usar, copiar, alterar e distribuir, inclusive em projetos comerciais, mantendo o aviso de copyright.

## Créditos

Construído sobre Tailwind CSS, shadcn/ui, Radix UI, Lucide, TanStack Table, cmdk, Sonner, React Hook Form, Zod, IMask, React Day Picker, Recharts, Storybook e Playwright. As fontes Poppins, Inter e DM Sans são distribuídas sob a SIL Open Font License. Os símbolos dos templates são ilustrativos. O logotipo é montado pelo componente `BrandLogo` com as cores da paleta ativa.

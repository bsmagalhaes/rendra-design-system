# Changelog

O que mudou em cada versão e o que um projeto derivado precisa fazer para atualizar. Segue o [versionamento semântico](https://semver.org/lang/pt-BR/). Datas em DD/MM/AAAA.

## Não publicado

Nada ainda.

## 2.1.0 (26/09/2026)

Pacote publicável pronto para uso externo (`import { Button } from '<nome do pacote>'`, `import '<nome do pacote>/tokens.css'`), CLI `rendra`, skill de migração parcial completa, seção de comandos no README e robots.txt bloqueando robô de IA.

### Adicionado

- **Pacote npm** (nome ainda placeholder, `private: true`, nenhuma publicação): `npm run build:lib` gera `dist/index.js` e as entradas por subcaminho (`router-bridge`, `document-viewer`, `rich-text-editor`, `chart`, `widget-grid`) mais `dist/tokens.css`, `dist/base.css` e `dist/components.css`, pré-compilados (estratégia A: o host recebe CSS puro, sem precisar do Tailwind). `react-router` fica fora dos peers e das dependências, só existe na entrada opcional `/router-bridge`. `npm run verify:pack` empacota de verdade (`npm pack`), instala num projeto à parte e confere: sem erro ao renderizar, sem `react-router` no `package.json` publicado, banner com a versão exata em cada arquivo, `--rendra-primary`/`--rendra-background` presentes e nenhuma variável do namespace do Tailwind (`--color-*`, `--radius-*`, `--spacing-*`, `--text-*`, `--font-weight-*`, `--tracking-*`, `--container-*`, `--ease-*`, `--animate-*`, `--default-*`) declarada em nenhum dos três arquivos CSS — as dez que mudam a partir de md (`--spacing-control-*`, `--spacing-header`, `--text-xl/2xl/3xl`) saem renomeadas para `--rendra-*`; o resto do namespace, que nunca muda em tempo de execução, entra direto como valor literal nas utilities compiladas.
- **CLI `rendra`** (`bin/rendra.mjs`, compilada em `dist/cli/*.js`, nunca lida do `.ts` fonte no pacote publicado): `rendra codigos` lista o catálogo de componentes; `rendra auditar [cwd]` reaplica as sete regras genéricas de `DESIGN_RULES.md` (`cor-fixa`, `valor-arbitrario`, `fora-da-escala`, `fonte-fixa`, `100vh` e a nova `raio-fixo`) num projeto qualquer; `rendra trocar <DE> <PARA> [--dry-run]` reescreve a prop literal que distingue duas variantes do catálogo, preservando formatação, nunca toca prop dinâmica (`variant={x}`, listada para revisão manual) nem troca entre componentes diferentes (só lista onde aparecem). `typescript` é `peerDependency` opcional: `rendra trocar` carrega o `typescript` do projeto de destino por import dinâmico e sai com mensagem clara, em código de saída diferente de zero, quando não encontra.
- **`scripts/check-design-rules.mjs`** passa a importar as seis regras genéricas mais `fora-da-escala` de `src/cli/auditar.ts`, a mesma lógica da CLI, em vez de manter uma segunda cópia; a saída do `check:rules` deste repositório continua igual.
- **Skill `rendra-migracao-parcial`** completa: os três níveis (tokens, padrões, componentes) com o passo a passo, usando `rendra auditar` e `rendra trocar` como os comandos que o agente de destino chama.
- **README:** seção de comandos e formas de uso, ampliando "Receber atualizações", com boilerplate, registry, pacote npm, CLI, skill e códigos de modelo e de componente.
- **robots.txt** (`scripts/seo-build.mjs`, `scripts/lib/robots.ts`) libera todo robô de busca e bloqueia dez robôs de IA (`GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `ClaudeBot`, `anthropic-ai`, `CCBot`, `Google-Extended`, `PerplexityBot`, `Bytespider`, `Applebot-Extended`); `index.html` ganha as metas `noai`/`noimageai` ao lado do `robots` já existente.

## 2.0.0 (26/09/2026)

Versão major para desacoplar rotas, config e CSS do Rendra da forma como o boilerplate os usa, aproximando o repositório das práticas de mercado de design system (peer deps, camadas de CSS, contrato público explícito). Guia de migração das quatro quebras abaixo.

### Quebras e guia de migração

- **Prefixo `--rendra-` em toda variável CSS própria do tema.** `--primary`, `--radius`, `--sidebar`, `--brand-font`, `--shape-control`, `--elevation-md` e todas as outras viram `--rendra-primary`, `--rendra-radius`, `--rendra-sidebar`, `--rendra-brand-font`, `--rendra-shape-control`, `--rendra-elevation-md` etc. As classes do Tailwind no JSX **não mudam** (`bg-primary`, `rounded-control` continuam existindo: o `@theme inline` de `globals.css` mapeia `--color-primary: var(--rendra-primary)`). O namespace do próprio Tailwind (`--color-*`, `--spacing-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--font-*`, `--container-*`) continua sem o prefixo, porque renomeá-lo mudaria toda classe que depende dele. **Migração:** troque toda referência direta a `var(--nome)` (fora de classe Tailwind) para `var(--rendra-nome)`; `npm run check:rules` (regra `variavel-sem-prefixo-rendra`) acusa o que faltar.
- **`RendraProvider` no lugar do acoplamento direto ao `react-router`.** Navegação (link, rota atual, navegar com voltar) chega por `linkComponent`, `useCurrentPath` e `navigate`, resolvidos pelo `RendraProvider`; quem usa `react-router` direto passa o adaptador de `rendra-router-bridge` (entrada separada do pacote, único ponto que o importa). **Migração:** envolva o app em `<RendraProvider linkComponent={...} useCurrentPath={...} navigate={...}>` (ou use a ponte pronta do React Router) antes de renderizar o `AppShell` ou qualquer link do design system.
- **`AppShell` desacoplado, por props.** `navigation`, `layout`, dados do usuário, itens do menu do usuário, `logout`, `homeLabel`, `quickActions` e `notifications` chegam por prop, não mais importados direto de `@/config` dentro do componente. **Migração:** monte esses valores no projeto (a partir de `src/config/navigation.ts` e `src/config/layout.ts`, como já era) e passe todos como prop do `AppShell`.
- **CSS em camadas** (`@layer theme, base, rendra.base, components, rendra.components, utilities`), com escopo por `[data-rendra-root]` além de `:root`: o reset e o estilo de componente do Rendra (`rendra.base`, `rendra.components`) perdem de qualquer `base`/`components`/utility do host, de propósito, para nunca sobrescrever a tela de quem consome o pacote. **Migração:** nenhuma ação se o projeto só usa classes Tailwind; um override direto de seletor precisa entrar na camada certa (ou fora de camada nenhuma, que sempre vence).

### Adicionado

- Catálogo de código por componente e variante (`src/catalog/components.ts`, `data-rendra` no elemento raiz, código na vitrine e no `registry.json`).
- `createTheme`/`applyTheme` (tema puro, compatível com SSR) e `BrandProvider` controlado (`mode`, `brandId`, `paletteId` com os `on*Change`, `storage` plugável).
- Texto orientativo curto abaixo do campo (regra C7), com limite de caracteres pela largura.
- Crédito "Feito com Rendra" no rodapé do login (`RendraCredit`, código `CRED-001`), removível por prop, texto e link substituíveis.

## 1.1.0 (24/09/2026)

Paleta a partir de 4 cores e do degradê, white label em tempo de execução, testes de comportamento e correções do modelo Aurora.

### Corrigido

- **Teste visual:** a tolerância por pixel caiu de 0,2 para 0,05. A padrão não via mudanças em superfícies claras, e os círculos do Aurora passaram sem ser notados. As referências foram geradas de novo.

- **Modelo Aurora:** cartões do kanban e blocos de informação viravam círculo ou pílula, porque usavam o raio de controle ou de item (9999px). Agora controle e item usam 1,75rem, que deixa 100% redondo tudo que tem até 56px e dá cantos de 28px ao que é mais alto. Papel novo **`rounded-block`** (canto pequeno em todos os modelos) para o cartão do kanban, os valores dentro dele, as citações do chat, os eventos da agenda e o skeleton.

### Adicionado

- **Paleta a partir de 4 cores e do degradê** (`src/brand/palette.ts`): `createPalette(sementes)` gera o claro e o escuro de uma paleta (texto sobre cada cor, fundo suave, primária como texto, foco, sidebar, degradês, gráficos, sombra e superfícies do escuro) com contraste AA conferido e ajustado, e registra os ajustes. As paletas prontas são só as sementes em `src/brand/palettes.ts`; `npm run palettes:build` gera `src/styles/palettes.css`, e o CI confere se está em dia.
- **White label em tempo de execução:** `applyPalette(sementes)` injeta a paleta de um cliente sem build, com o mesmo resultado do build.
- **Input:** `onCentsChange` entrega moeda em centavos inteiros (R$ 1.250,50 vira 125050), e `onLookup` faz a busca de CEP e CNPJ dentro do próprio campo (ViaCEP e BrasilAPI), com carregamento e cancelamento; `toCents` e `formatCents` em `src/lib/masks.ts`. Hook `useLookup` para outros campos.
- **Testes de comportamento** com Vitest e Testing Library para Table, Select, Input, Modal, Drawer, Button, Alert, Tabs, Pagination, Accordion, InfoHint, EmptyState e os campos de formulário, cada um ao lado do componente; `renderApp` com os provedores do app; `npm run test:coverage` com piso de cobertura por arquivo, cobrado no CI. De 28 para 98 testes.
- **Verificador de regras:** `classe-dinamica` (classe montada por template string, que o Tailwind não gera) e `css-fora-do-lugar` (arquivo .css fora de `src/styles` e `src/brand`). A regra de fonte fixa só olha contexto de fonte, e não reprova mais a palavra "Inter" num texto.
- **Documentação de entrada para agentes:** "Em um minuto" no `AGENTS.md` e a seção "Cor: três camadas" no `DESIGN_RULES.md` (modelo, paleta de 4 cores e degradê, e sistema fixo), com o briefing de cores perguntando só as 4 cores e o degradê, e a pergunta de white label (5.7).

### Alterado

- **Neutros e cores de sistema iguais em todas as paletas** (fundo, card, borda, texto, erro, sucesso, alerta e informação): antes cada paleta os redefinia à mão. As superfícies do modo escuro saem do fundo do degradê de cada paleta, com o brilho numa faixa fixa. A tela Novo cliente passou a usar a busca embutida do Input.
- **Chart:** anima só a entrada; com a largura mudando, vai direto à nova forma (e não anima com "reduzir movimento").

### Removido

- `src/brand/palettes/ardosia.css` e os blocos de paleta de `src/brand/examples/*/theme.css`: as quatro paletas saem do gerador. **Projeto derivado:** passe as 4 cores e o degradê da sua marca para `src/brand/palettes.ts` e rode `npm run palettes:build`; os valores escritos à mão no `theme.css` para primária, secundária, sidebar, degradês e gráficos deixam de ser usados.

## 1.0.0 (24/09/2026)

Primeira versão publicada: design system, boilerplate, três templates, quatro paletas, mais de 50 componentes, AppShell, telas base, vitrine, Storybook e fluxo de início para IAs.

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

- **Calendar**: calendário e agenda num componente só, com as visões mês, semana, dia e agenda em lista (prop `view`). No celular, o mês vira compacto com a lista do dia e a semana vira o dia com a faixa dos 7 dias.
- **Kanban**: colunas e cards, arrastar no computador, menu "Mover para" no toque e no teclado, uma coluna por vez no celular e limite por coluna. `moveKanbanCard` ajuda a atualizar a lista.
- **Telas de agenda (`/agenda`) e funil de vendas em kanban (`/kanban`)**, com capturas na galeria e no README.
- **Códigos de modelo** (`src/config/presets.ts`): T1 a T3 para o tema, C1 a C4 para as cores e M1 a M6 para o menu. A galeria mostra o código de cada captura e tem o bloco "Monte seu código"; o briefing pergunta pelo código antes do fluxo guiado; `?codigo=T1-C4-M5` no endereço aplica o modelo no demo.
- **Telefone com DDI**: o Input com `mask="phone"` tem um seletor de país embutido, +55 por padrão, com as props `ddi`, `onDdiChange`, `ddiOptions` e `hideDdi`, e a função `toE164`.

- **Chat de atendimento** (`ConversationList`, `ChatThread`, `ChatComposer`) e a tela **Atendimento** (`/atendimento`), omnichannel: WhatsApp, Instagram, Facebook, site, e-mail e SMS, com as etapas URA/IA, Fila, Atendimento e Encerrado, busca e filtros de canal e atendente, e as ações assumir, transferir, encerrar e reabrir. O campo de mensagem aceita arrastar, soltar e colar arquivos e prints.
- **Editor de texto rico** (`RichTextEditor`, Tiptap): formatação completa, listas, alinhamento, links, tabela, imagem com 4 alças para redimensionar, colar print (Ctrl+V), arrastar imagens e modo HTML.
- **Painel em widgets** (`WidgetGrid`, react-grid-layout): botão "Ajustar dashboard" para arrastar e redimensionar, arrumação salva e "Restaurar padrão".
- **Buscas de CEP e CNPJ** (`lookupCep`, `lookupCnpj`) no formulário de cliente, com CEP e CNPJ primeiro.
- **Grade de formulário** de 12 colunas (`<Grid form>`, `FormSection`), 3 campos por linha, com `span` (`xs` a `full`) e `newRow` no Field.
- **Table**: `details` (linhas extras na coluna) e `href` (título que abre o cadastro).
- **Kanban**: altura da tela com rolagem por etapa e rolagem infinita, (+) no título da etapa, totais de valores por etapa (`valueFields`), card com CNPJ e contato, e 7 etapas no demo.
- **Galeria**: "Monte seu código" aplica o tema, as cores e o menu em tempo real, sem sair da página; `?imagem=nome` abre a imagem em popup (as imagens do README levam para lá).
- **Barra de rolagem discreta** (`scrollbar-subtle`) nas áreas internas.

- **Chat completo**: botão direito ou "…" na mensagem para responder, reagir, editar e excluir (a excluída fica riscada em vermelho claro; a editada mostra o texto anterior); clicar na citação leva à mensagem original, com destaque; áudio com 1x, 1,5x e 2x; baixar imagens, vídeos, áudios e arquivos; emoji; **mensagens rápidas** (`quickReplies`); gravação de áudio com contador e ondas. No celular e em conversa estreita, o campo ocupa a linha com o enviar e um botão de ações que abre as outras opções. Mensagem longa, inclusive link sem espaço, quebra dentro do balão.
- **Atendimento**: filtro de canal e atendente num ícone ao lado da busca, (+) para nova conversa, busca que acha também pessoas do time, time interno com rolagem lateral, fotos nos contatos e o logotipo do canal (WhatsApp, WhatsApp Web, Instagram, Facebook, TikTok, Google Meu Negócio e Reclame Aqui) no selo da foto.
- **Texto orientativo em modal** (`InfoHint`): o `help` do `PageHeader` põe um ícone de informação ao lado do título, no header fixo, que abre um modal; `CardTitle help` e `FormSection help` fazem o mesmo no card. **`CardHeader actions`**: o lugar das ações de um card.
- **Regras novas no `check:rules`** (telas do sistema): `texto-orientativo` (descrição de texto no `PageHeader` e subtítulo que começa com verbo de instrução) e `botao-solto` (botão no conteúdo de um card).
- **SEO e AEO**: título e descrição por tela (`src/config/seo.ts`) no app e no build (`scripts/seo-build.mjs`), com página estática por rota (link direto responde 200), `sitemap.xml`, `robots.txt`, `llms.txt`, Open Graph com imagem, dados estruturados (JSON-LD com perguntas frequentes) e conteúdo em `<noscript>`. Perguntas frequentes no README.
- **Avisos no login e no 2FA do demo**, com o que digitar para entrar.

### Alterado

- **Primária do Safira** de #0C78F4 para #0B6FE0: 4,8:1 com texto branco (AA). A anterior dava 4,2:1.
- **Telas carregadas sob demanda**: cada rota é um arquivo no build, e a primeira abertura baixa só o AppShell e a tela pedida.
- O botão de limpar do Select e do DatePicker saiu de dentro do botão que abre o painel (HTML válido e leitores de tela). O PickerPanel ganhou a prop `adornment`.
- Select fora de um Field usa a prop `label` como nome acessível do gatilho.
- **Table remota** (`source`): pede ao servidor só a página visível, com busca, ordenação e filtros aplicados a todos os registros. Cancela a requisição anterior ao mudar de página ou digitar. **15 registros por página** em todas as tabelas (`TABLE_PAGE_SIZE`).
- **Listagem**: a ação principal (Novo) entrou na barra da tabela (`toolbar.primaryAction`), com Filtros à esquerda. Sem descrição nem contagem acima da tabela.
- **Salvar sempre no rodapé fixo**: Configurações passou a usar a `ActionBar sticky`, como o formulário de novo cliente.
- **Fundo do modo claro** #F5F6F7 (tela e campos) com cards brancos, para o campo se destacar do card.
- **Ardósia**: botão laranja com texto branco, no tom #C94F0A (AA; o #EA600D com branco dá 3,4:1).
- **Menu superior** com botão "Mais": os itens que não cabem na largura vão para ele, e o menu nunca passa por cima da busca e dos ícones.
- **Login, esqueci a senha e nova senha** sem rolagem lateral em telas estreitas: a coluna do formulário agora encolhe (antes ficava presa à largura do conteúdo e estourava com a fonte do Linux).
- **Rodapé fixo de ações** agora desenhado pelo AppShell, abaixo da área rolável: sempre embaixo e na largura inteira, mesmo com formulário curto. O wizard deixou de usar rodapé fixo (os botões seguem o card).
- **Drawer** com largura padrão de 30% e as opções 40%, 50% e 75%.
- **Nunca botão solto**: "Ligar" (detalhe do cliente), "Encerrar outras sessões" e "Voltar ao padrão" (configurações) foram para o cabeçalho do card; as instruções do painel, do novo cliente, das configurações e do cadastro guiado foram para o ícone de informação.
- **Respiro da página** igual nos quatro lados: 16px no celular e 24px a partir do tablet.
- **Kanban**: 5 etapas visíveis com rolagem lateral (também pelo touchpad, no sentido do gesto) e 3 etapas a mais no demo.
- **Velocímetro** em meio círculo com degradê vermelho, amarelo e verde, e **funil** com etapas que afunilam e a conversão entre elas.
- **Sidebar recolhida** fecha ao tirar o mouse mesmo depois de um clique; abrir pelo foco só vale para o teclado.
- **Rolagem por âncora corrigida**: o `<main>` do AppShell passou a ser `relative`. Antes, elementos absolutos (texto para leitor de tela, inputs ocultos) esticavam a página, e um link com `#âncora` (como `/componentes#primitivas`) rolava a página inteira, encolhendo a sidebar e deixando um vão em branco. O teste de layout agora falha se a página ficar mais alta que a tela.
- Títulos das categorias da vitrine em negrito.
- **Seta de voltar no header** nas telas de segundo nível, à esquerda do título e da trilha, levando à tela-pai; no celular ocupa o lugar do menu, e título e trilha encurtam com reticências em vez de quebrar.
- **Gráficos novos no Chart**: `gauge` (velocímetro de meta com faixas de cor e marca da meta), `funnel` (etapas com a conversão entre elas e a total), `combo` (barras e linhas juntas, com uma ou mais séries de barras), barras com uma cor por categoria (`colorByCategory`) e empilhadas (`stacked`). O painel ganhou meta do mês, funil de vendas, receita e meta, contratos e carteira por segmento.
- **DatePicker com seletores de mês e ano** (padrão ligado, prop `dropdowns`), de 1900 até 10 anos à frente ou dentro de `minDate` e `maxDate`: data de nascimento em dois cliques.
- **Menu no centro da barra inferior** do celular, em botão redondo; o header deixa de ter o botão de menu quando há barra inferior.
- **Texto em 100% da largura**: descrições de página, seção, vitrine e tokens sem largura máxima; nova regra `texto-estreito` no `check:rules`.
- **Tamanho médio como padrão** também na barra das tabelas (busca, Colunas, Filtros, Novo e seleção) e na barra do calendário.
- **Espaço entre campos** padronizado em 16px com o novo `gap="fields"` (Grid, Stack e FormSection). O Field não reserva mais uma linha vazia para a mensagem: ela aparece só com ajuda ou erro, 4px abaixo do controle (`reserveMessage` volta a reservar; `compact` ficou obsoleto). No drawer de novo cliente o espaço caiu de 40px para 16px.

### Para atualizar um projeto que já usa o Rendra

1. Em cada tema do projeto, no claro e no escuro, acrescente `--primary-text` (a primária, ou um tom mais claro no escuro, que passe AA sobre `--card`). Confira em `/tokens`.
2. Crie `src/styles/themes.css` com os `@import` de tema que hoje estão no `globals.css` e troque-os por `@import './themes.css';`.
3. Rode `npx shadcn@latest add @rendra/tokens @rendra/core` e depois os componentes que quiser atualizar.
4. Troque `text-primary` por `text-primary-text` no código do projeto (`npm run check:rules` aponta cada ocorrência).

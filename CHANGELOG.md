# Changelog

O que mudou em cada versão e o que um projeto derivado precisa fazer para atualizar. Segue o [versionamento semântico](https://semver.org/lang/pt-BR/). Datas em DD/MM/AAAA.

## Não publicado

### Corrigido

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

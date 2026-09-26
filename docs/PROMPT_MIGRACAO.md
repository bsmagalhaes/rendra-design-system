# Prompt de migração

## Como usar

1. Troque `[LINK DO REPOSITÓRIO]` pelo endereço do repositório: o oficial é https://github.com/bsmagalhaes/rendra-design-system. Use outro se tiver uma cópia própria (fork ou caminho local).
2. Abra a IA do projeto de destino (Claude Code, por exemplo) na raiz desse projeto.
3. Cole o bloco inteiro abaixo como primeira mensagem.
4. A IA trabalha em etapas e mostra o resultado de cada uma antes de seguir. Aprove ou peça ajustes a cada etapa.
5. Se o projeto de destino tiver outra marca, tenha em mãos: cores primária e secundária (e as de hover), o degradê da marca (3 cores, da luz ao fundo), a fonte, o estilo do rótulo dos campos (discreto ou normal, `labelStyle`), o formato (`square`, `rounded` ou `pill`) e os SVGs do logotipo claro, do logotipo escuro e do símbolo.

## Prompt

```text
Você vai aplicar neste projeto o design system e boilerplate Rendra, disponível em [LINK DO REPOSITÓRIO] (repositório oficial: https://github.com/bsmagalhaes/rendra-design-system).

ANTES DE QUALQUER ALTERAÇÃO
1. Leia no repositório de referência, nesta ordem: AGENTS.md, DESIGN_RULES.md, CLAUDE.md (matriz de modelos e regras de operação, se for seguir esse fluxo em etapas com papéis diferentes), docs/COMO_APLICAR.md e docs/BRIEFING_MODELO.md. O DESIGN_RULES.md é obrigatório e vale mais do que qualquer hábito seu.
2. Siga o fluxo de início do AGENTS.md para migração: conduza o briefing de docs/BRIEFING_MODELO.md como ele manda (blocos abertos agrupados; navegação, tema e cores em fluxo guiado, uma decisão por vez; aceitando "não sei, sugira"), grave em docs/BRIEFING.md deste projeto e peça minha confirmação.
3. Analise este projeto: stack, versão do React e do Tailwind, bundler, estrutura de pastas, telas existentes, componentes de interface existentes e como a marca está aplicada hoje.
4. Me apresente um plano curto: caminho escolhido (projeto novo ou existente, conforme docs/COMO_APLICAR.md), o que será copiado, o que será substituído, a lista de telas a migrar em ordem e os riscos. Espere minha aprovação.

REGRAS QUE NÃO PODEM SER QUEBRADAS
- Um componente por finalidade: um Select, uma Table, um Modal, um Drawer, um Input, um Button. Diferenças são props, nunca arquivos novos. Antes de criar, procure um existente e acrescente uma prop.
- Mobile-first real: escreva para 360px primeiro. Sem rolagem horizontal no mobile, em nenhuma tela. Nada depende de hover. Toque mínimo de 44x44px. O componente se reconstrói no mobile sem arquivo separado.
- A marca fica em src/brand/palettes.ts (as 4 cores e o degradê; rode npm run palettes:build depois de mexer), src/styles/theme.css (formato e fonte do modelo), src/brand/brand.config.ts e src/brand/assets. Toda variável CSS própria do Rendra começa com --rendra-. Nenhum componente com cor fixa, fonte fixa ou logotipo importado direto.
- Só a escala de espaço permitida (0, 1, 2, 3, 4, 6, 8, 12, 16, 24) e tokens nomeados. Proibido valor arbitrário (p-[13px]), estilo inline, 100vh e degrau fora da escala.
- Contêiner certo para o volume: Modal até 3 campos, Drawer até cerca de 12, página inteira (seções ou Wizard) acima disso. Nunca modal dentro de modal.
- Botões sempre pela ActionBar: 1 botão = 100%; 2 botões = cancelar 30% + principal 70%; 3 ou mais = extras no menu.
- Nunca botão solto: cada ação vai no rodapé fixo, na barra da tabela, no PageHeader actions, no CardHeader actions ou no menu da linha. Troque todo botão avulso do sistema antigo por um desses lugares.
- Texto orientativo nunca no corpo: parágrafos de instrução, Alerts informativos e botões "Saiba mais" do sistema antigo viram help (ícone de informação ao lado do título, no PageHeader, CardTitle ou FormSection), que abre um modal.
- Listagem: barra de ferramentas dentro do mesmo card da Table, chips de filtro, estados vazio, carregando e erro, situação antes das ações.
- Header sempre fixo; título da página no header, com a trilha abaixo; uma única área de rolagem (o main do AppShell).
- Fundo da tela e dos campos #f5f6f7, cards brancos; respiro de página de 24px igual em todos os lados; contraste mínimo WCAG AA.
- Interface em português do Brasil; datas DD/MM/AAAA; valores R$ 1.250,00.

MARCA DESTE PROJETO
Use a marca que eu informar (cores, fonte, formato e SVGs). Se eu não informar, pergunte antes de aplicar. Siga a tabela "Troca de marca, passo a passo" do docs/COMO_APLICAR.md e confira a página /tokens: nenhum selo de contraste pode marcar "falha".

FORMA DE TRABALHO
Trabalhe em etapas e me mostre o resultado de cada uma, em mobile (360px) e desktop (1280px), antes de seguir:
1. Base: dependências (ou o pacote npm do Rendra, se preferir esse caminho), tokens, tema e brand.config com a marca deste projeto.
2. AppShell: RendraRouterBridge (ou um RendraProvider próprio) na raiz das rotas, um AppLayout com as props do AppShell (menu de navigation.ts, layout, usuário, menu do avatar, ações rápidas, notificações) e as rotas.
3. Formulários e ações.
4. Listagens (Table).
5. Feedback (Alert, toast, Modal, Drawer, estados vazios e de erro).
6. Telas restantes, na ordem do plano aprovado.
7. Limpeza do código antigo.

VERIFICAÇÃO OBRIGATÓRIA AO FIM DE CADA ETAPA
Rode npm run typecheck, npm run lint, npm run check:rules, npm test, npm run test:a11y e npm run test:layout (ou rendra auditar, se o pacote com a CLI estiver instalado neste projeto). Todo componente novo ou alterado tem código de catálogo e data-rendra (ver DESIGN_RULES.md). Toda tela migrada entra em src/routes.tsx e em src/config/routes-list.ts. Só diga que uma etapa terminou com tudo passando. Se algo falhar, mostre a saída e corrija antes de seguir. Nunca desative uma regra ou um teste para fazer passar.
```

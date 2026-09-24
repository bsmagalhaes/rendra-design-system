# Prompt de migração

## Como usar

1. Troque `[LINK DO REPOSITÓRIO]` pelo endereço do repositório: o oficial é https://github.com/bsmagalhaes/rendra-design-system. Use outro se tiver uma cópia própria (fork ou caminho local).
2. Abra a IA do projeto de destino (Claude Code, por exemplo) na raiz desse projeto.
3. Cole o bloco inteiro abaixo como primeira mensagem.
4. A IA trabalha em etapas e mostra o resultado de cada uma antes de seguir. Aprove ou peça ajustes a cada etapa.
5. Se o projeto de destino tiver outra marca, tenha em mãos: cores primária e secundária (e as de hover), a cor destrutiva, a fonte, o formato (`square`, `rounded` ou `pill`) e os SVGs do logotipo claro, do logotipo escuro e do símbolo.

## Prompt

```text
Você vai aplicar neste projeto o design system e boilerplate Rendra, disponível em [LINK DO REPOSITÓRIO] (repositório oficial: https://github.com/bsmagalhaes/rendra-design-system).

ANTES DE QUALQUER ALTERAÇÃO
1. Leia no repositório de referência, nesta ordem: AGENTS.md, DESIGN_RULES.md, docs/COMO_APLICAR.md e docs/BRIEFING_MODELO.md. O DESIGN_RULES.md é obrigatório e vale mais do que qualquer hábito seu.
2. Siga o fluxo de início do AGENTS.md para migração: conduza o briefing de docs/BRIEFING_MODELO.md como ele manda (blocos abertos agrupados; navegação, tema e cores em fluxo guiado, uma decisão por vez; aceitando "não sei, sugira"), grave em docs/BRIEFING.md deste projeto e peça minha confirmação.
3. Analise este projeto: stack, versão do React e do Tailwind, bundler, estrutura de pastas, telas existentes, componentes de interface existentes e como a marca está aplicada hoje.
4. Me apresente um plano curto: caminho escolhido (projeto novo ou existente, conforme docs/COMO_APLICAR.md), o que será copiado, o que será substituído, a lista de telas a migrar em ordem e os riscos. Espere minha aprovação.

REGRAS QUE NÃO PODEM SER QUEBRADAS
- Um componente por finalidade: um Select, uma Table, um Modal, um Drawer, um Input, um Button. Diferenças são props, nunca arquivos novos. Antes de criar, procure um existente e acrescente uma prop.
- Mobile-first real: escreva para 360px primeiro. Sem rolagem horizontal no mobile, em nenhuma tela. Nada depende de hover. Toque mínimo de 44x44px. O componente se reconstrói no mobile sem arquivo separado.
- A marca fica só em src/styles/theme.css, src/brand/brand.config.ts e src/brand/assets. Nenhum componente com cor fixa, fonte fixa ou logotipo importado direto.
- Só a escala de espaço permitida (0, 1, 2, 3, 4, 6, 8, 12, 16, 24) e tokens nomeados. Proibido valor arbitrário (p-[13px]), estilo inline, 100vh e degrau fora da escala.
- Contêiner certo para o volume: Modal até 3 campos, Drawer até cerca de 12, página inteira (seções ou Wizard) acima disso. Nunca modal dentro de modal.
- Botões sempre pela ActionBar: 1 botão = 100%; 2 botões = cancelar 30% + principal 70%; 3 ou mais = extras no menu.
- Listagem: barra de ferramentas dentro do mesmo card da Table, chips de filtro, estados vazio, carregando e erro, situação antes das ações.
- Header sempre fixo; título da página no header, com a trilha abaixo; uma única área de rolagem (o main do AppShell).
- Fundo claro #fcfcfc; conteúdo com 95% da largura a partir de 1024px; contraste mínimo WCAG AA.
- Interface em português do Brasil; datas DD/MM/AAAA; valores R$ 1.250,00.

MARCA DESTE PROJETO
Use a marca que eu informar (cores, fonte, formato e SVGs). Se eu não informar, pergunte antes de aplicar. Siga a tabela "Troca de marca, passo a passo" do docs/COMO_APLICAR.md e confira a página /tokens: nenhum selo de contraste pode marcar "falha".

FORMA DE TRABALHO
Trabalhe em etapas e me mostre o resultado de cada uma, em mobile (360px) e desktop (1280px), antes de seguir:
1. Base: dependências, tokens, tema e brand.config com a marca deste projeto.
2. AppShell, menu (navigation.ts) e rotas.
3. Formulários e ações.
4. Listagens (Table).
5. Feedback (Alert, toast, Modal, Drawer, estados vazios e de erro).
6. Telas restantes, na ordem do plano aprovado.
7. Limpeza do código antigo.

VERIFICAÇÃO OBRIGATÓRIA AO FIM DE CADA ETAPA
Rode npm run typecheck, npm run lint, npm run check:rules e npm run test:layout. Toda tela migrada entra em src/routes.tsx e em src/config/routes-list.ts. Só diga que uma etapa terminou com tudo passando. Se algo falhar, mostre a saída e corrija antes de seguir. Nunca desative uma regra ou um teste para fazer passar.
```

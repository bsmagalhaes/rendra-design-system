# CLAUDE.md

## Fluxo de início

Siga o fluxo descrito no [`AGENTS.md`](AGENTS.md): se `docs/BRIEFING.md` não existir, pergunte primeiro se é projeto novo, migração de layout ou contribuição, conduza o briefing de `docs/BRIEFING_MODELO.md` e só então planeje e execute em etapas. Sem terminal, conduza o briefing em texto e entregue o `docs/BRIEFING.md` para a pessoa levar a uma IA com terminal, com a continuação de projeto novo ou a de migração, conforme o caso (ramo (d) do `AGENTS.md`).

@AGENTS.md

## Leitura obrigatória

**Antes de qualquer alteração de interface, leia o [`DESIGN_RULES.md`](DESIGN_RULES.md) inteiro.** Ele define as duas regras mestras (um componente por finalidade; mobile-first real), a composição de tela, o comportamento no mobile, o que é proibido e o checklist de revisão. Uma alteração de interface que não segue esse documento está errada, mesmo que funcione.

## Resumo do projeto

Design system e boilerplate React (Vite, TypeScript estrito, Tailwind CSS v4, Radix, shadcn/ui copiado para `src/components/ui`). Três templates: Rendra Safira (ativo), Equilíbrio e Aurora.

- Cor em três camadas: **modelo** (formato e fonte, em `src/styles/theme.css`; só Safira, Equilíbrio e Aurora), **paleta** (só 4 cores e o degradê da marca, em `src/brand/palettes.ts`; `npm run palettes:build` gera o resto com AA) e **sistema** (neutros e cores de erro, sucesso, alerta e informação, fixos). Nome e logotipo em `src/brand/brand.config.ts` e `src/brand/assets`. White label em tempo de execução: `applyPalette()`.
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
npm test              # unitários e de componente (Vitest)
npm run test:coverage # idem, com o piso de cobertura por arquivo (o CI usa este)
npm run palettes:build # gera src/styles/palettes.css das sementes de src/brand/palettes.ts
npm run test:layout   # Playwright: rotas x larguras x templates, claro e escuro
npm run test:a11y     # acessibilidade (axe-core, WCAG 2.1 AA)
npm run test:visual   # regressão visual (referências geradas no Linux do CI)
npm run build         # build de produção
```

## Como trabalhar aqui

- Antes de criar um componente, procure um existente em `src/components/ui` e acrescente uma prop.
- Componente novo ou alterado ganha teste de comportamento ao lado (`nome.test.tsx`) e piso de cobertura em `vite.config.ts`.
- Nunca use valor arbitrário, degrau fora da escala, cor fixa ou estilo inline. Se faltar um tamanho, crie o token em `globals.css`.
- Toda tela nova: entre em `routes.tsx` e `routes-list.ts`, passe no `test:layout` e tenha story em `src/stories/pages.stories.tsx`.
- Textos da interface em português do Brasil.
- Crédito "Feito com Rendra" (`RendraCredit`, rodapé do login): se pedirem para tirar, tire (`credit={false}`), mas avise as duas coisas juntas: a licença MIT exige manter o aviso de copyright e o arquivo `LICENSE` no código e nas cópias, com ou sem crédito visível; e o crédito na tela é opcional, com preferência por mantê-lo no rodapé do login ou movê-lo para outro lugar visível, como uma tela "Sobre". Nunca diga que a MIT obriga crédito visível na interface: não obriga. Detalhes no `AGENTS.md`.

A seção "REGRA INEGOCIÁVEL: MATRIZ DE MODELOS" abaixo vale para a manutenção do próprio Rendra Design System. Em projeto novo ou migração feitos a partir deste repositório, siga o "Fluxo de início" do `AGENTS.md`, sem subagentes obrigatórios.

# REGRA INEGOCIÁVEL: MATRIZ DE MODELOS

Você trabalha sob esta matriz em TODA tarefa que altera código, teste,
migração ou configuração. Ela não é sugestão, e nenhuma etapa se pula por
pressa, falta de crédito ou tamanho da tarefa. Quando uma regra daqui
conflitar com uma preferência sua, a regra vence. Quando conflitar com uma
instrução explícita do dono do projeto, pergunte antes de agir.

## 0. Pré-requisito de economia: RTK instalado

Antes da primeira tarefa, confira que o RTK (Rust Token Killer) está
instalado e ligado ao shell do agente. Ele reescreve comandos de terminal
(`git`, `grep`, `jest`, `docker`, `ls`, `find`, `psql` e outros) para uma saída
compacta, cortando de 60 a 90% do texto que volta ao contexto.

1. Confira: `rtk --version` responde `rtk X.Y.Z` e `rtk gain` funciona.
   Se `rtk gain` falhar, o binário instalado é outro projeto de mesmo nome
   (Rust Type Kit): remova-o e instale o certo.
2. Instale, se faltar, pelo instalador oficial do projeto RTK
   (`cargo install rtk` ou o binário da página de releases), e confira de
   novo pelo passo 1.
3. Ligue o hook ao agente, **no escopo do projeto**, não no global:
   - Claude Code: em `.claude/settings.json` do projeto, um `PreToolUse`
     com `matcher: "Bash"` e o comando
     `command -v rtk >/dev/null 2>&1 && rtk hook claude || true`.
     Isso deixa o projeto funcionando em máquina sem RTK.
   - Outra IA sem hook: chame os comandos com o prefixo `rtk`
     (`rtk git status`, `rtk jest ...`).
4. Para ver a saída crua, ao depurar, use `rtk proxy <comando>`.
5. Ao fim de cada lote, registre `rtk gain` no relatório: é a medida da
   economia, não uma impressão.

Sem RTK a matriz continua valendo. Só fica mais cara.

## 1. Os papéis

Três níveis de modelo. Use os nomes da sua casa; no Claude são estes:

| Nível | Papel                                                 | Claude | Critério de escolha em outra casa                                  |
| ----- | ----------------------------------------------------- | ------ | ------------------------------------------------------------------ |
| L     | Leitor de código: levantamento e validação da entrega | Fable  | O melhor modelo da casa em ler e raciocinar sobre código existente |
| R     | Revisor de plano                                      | Opus   | Modelo forte, e diferente do que escreveu o plano                  |
| E     | Escritor: plano e execução                            | Sonnet | Modelo bom e barato em escrever código                             |

**Nenhum modelo valida o que ele mesmo escreveu.** Isso vale entre modelos e
entre sessões: quem executou não valida, nem numa sessão nova. Revisor igual
ao autor concorda com o próprio raciocínio.

**O modelo é passado explicitamente em cada delegação.** O padrão da
ferramenta muda sem avisar. Sem crédito de um nível, pare e avise o dono do
projeto; nunca troque de modelo em silêncio.

## 2. Os dois fluxos

### Fluxo completo: funcionalidade, módulo novo, mudança com mais de um arquivo de produção

| #   | Etapa                | Nível | Lê código?                 | Entrega                                            |
| --- | -------------------- | ----- | -------------------------- | -------------------------------------------------- |
| 1   | Levantamento         | L     | Sim, só o escopo           | Briefing com **lista de fatos** (ver §4)           |
| 2   | Plano e spec         | E     | **Não**, usa só o briefing | Plano com tarefas testáveis                        |
| 3   | Validação do plano   | R     | Sim, só o escopo           | Parecer: risco, isolamento, contrato               |
| 4   | Execução             | E     | Sim                        | Código, testes e o relatório de pré-validação (§5) |
| 5   | Validação da entrega | L     | Sim, o diff                | Veredito binário (§6)                              |

### Fluxo curto: bug pequeno, correção óbvia, até cerca de 3 arquivos de produção

| #   | Etapa                                                        | Nível                                                          |
| --- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| 1   | Escreve o teste que reproduz, vê vermelho, corrige, vê verde | E                                                              |
| 2   | Valida só o checklist bloqueador                             | L, ou R quando não houver risco de segurança nem de isolamento |

No fluxo curto não há levantamento nem validação de plano. Se, durante a
correção, o escopo crescer além do "óbvio", pare e passe ao fluxo completo.

## 3. As regras que andam com a matriz

1. **Nenhum plano sem levantamento.** Plano escrito sem o briefing do nível
   L é recusado, não revisado.
2. **O plano só afirma o que o briefing afirma.** Todo nome de arquivo,
   função, tabela, rota ou número de migração citado no plano está na lista
   de fatos. O que o plano precisar e não estiver lá entra como pergunta ao
   nível L, não como palpite. Isso libera o revisor para julgar risco, em
   vez de caçar fato falso.
3. **Uma rodada de validação por plano.** O revisor valida uma vez. O que
   ele apontar, o executor corrige durante a execução; o que sobrar, a
   validação da entrega pega. Não existe segunda rodada de plano.
4. **Uma frente por arquivo e por ambiente.** Frentes paralelas só quando não
   compartilham arquivo, migração, banco de teste nem container de teste, e
   no máximo três ao mesmo tempo. Na dúvida, em série.
5. **O teste confere o resultado, não a chamada.** No servidor, a entrada
   passa pela porta de verdade (rota, webhook, fila) e o teste afirma o que
   ficou gravado. Na tela, o teste afirma o efeito que o usuário vê (texto,
   classe, item na lista), nunca só que o callback foi chamado.
6. **O executor se autoconfere antes de relatar** (§5). Entrega sem a
   pré-validação volta sem ser julgada.
7. **O validador não repete o que o executor já provou** (§6). Ele confere a
   prova, roda os testes dos arquivos tocados e faz a própria mutação. A suíte
   inteira roda uma vez, antes do commit, não uma vez por papel.
8. **Bloqueante reprova; melhoria não gera nova rodada.** O validador separa
   os dois. A melhoria vai para uma lista que o executor fecha antes do
   commit, e a entrega não volta ao validador por ela.
9. **Briefing com mais de 24 horas, ou com commit no escopo depois dele, é
   refeito.** Não se reaproveita.
10. **Não deduza requisito.** Entidade, campo, tela ou regra que não foi
    pedida é pergunta, nunca proposta pronta. Não faça nada além do escopo.

## 4. Prompt enxuto, e o formato do briefing

**O prompt de delegação carrega só a tarefa.** Regras de ambiente, armadilhas
da máquina e convenções do projeto moram nos arquivos que todo agente lê
(``CLAUDE.md` e `AGENTS.md``). Repeti-las a cada
chamada custa milhares de tokens por agente, e a cópia diverge no primeiro
conserto. O prompt diz: objetivo, escopo (arquivos), o que já foi provado, o
que falta provar e o formato da resposta.

**Escopo obrigatório.** Os níveis L e R recebem os arquivos do escopo mais o
contrato do módulo, nunca o repositório inteiro.

O briefing do levantamento tem três partes:

```
## Fatos verificados
- F1 `caminho/arquivo.ts:120` `funcaoX(a, b)` grava `tabela.coluna`
- F2 a última migração é a `0045_...`; a próxima é `0046`
- F3 quem chama `funcaoX` em produção: `outro.ts:88` (ou "ninguém")
## Riscos e invariantes tocadas
- ...
## Perguntas em aberto
- ...
```

Cada fato tem `arquivo:linha` e é verificável em um comando. O que não foi
lido não entra como fato.

## 5. Pré-validação do executor, obrigatória

Antes de dizer "pronto", o executor cumpre a lista e põe a prova de cada
item no relatório:

1. Mutou 2 ou 3 comportamentos centrais e viu o teste ficar vermelho.
   A mutação é feita numa cópia fora do repositório e restaurada por cópia,
   com o hash do arquivo conferido antes e depois. Nunca restaure por
   `git checkout -- <arquivo>`: em árvore compartilhada, isso apaga trabalho
   de outra sessão.
2. Quando há tela, tirou a captura (Playwright ou equivalente) e **olhou**.
3. Verificação de tipos e lint limpos.
4. Cada tarefa marcada aponta o arquivo ou o teste que a prova.
5. A suíte inteira verde, ou cada vermelho atribuído com prova a outra
   frente. O log da suíte vai amarrado ao hash da árvore testada
   (`git diff | sha256sum`), para o validador saber se pode reaproveitá-lo.
6. **Checkpoint por fase.** Em tarefa longa, cada fase concluída grava o
   estado (o que foi feito, o que foi provado, o que falta) num arquivo de
   trabalho. Se a sessão cair, a retomada começa dali, não do zero.

O relatório é curto: resultado, prova, pendências.

## 6. Validação da entrega

O validador:

1. Confere que o hash da árvore é o do log do executor. Se for, reaproveita
   a suíte inteira. Se não for, a suíte inteira roda uma vez.
2. Roda só os testes dos arquivos tocados.
3. Faz ao menos uma mutação própria, diferente das do executor, e diz qual
   teste a pegou.
4. Confere a tela, quando houver.
5. Julga os dois checklists e responde no formato abaixo.

**Checklist bloqueador (100%, sem exceção; cada linha com arquivo ou teste
que comprove):**

1. Contrato público intacto, nenhuma assinatura alterada sem versionamento
2. Isolamento de dados entre clientes/tenants preservado, nenhuma consulta
   sem o filtro que os separa
3. Existe teste que falha sem a mudança e passa com ela
4. Migração reversível, nenhuma operação destrutiva sem rollback
5. Nenhum arquivo fora do escopo declarado foi tocado
6. Cobertura de pelo menos 80% nas linhas que a mudança tocou (piso, não
   meta; medida sobre o diff, não sobre o repositório)

**Checklist de qualidade (mínimo 80%):**

1. Caminho de erro coberto por teste
2. Sem duplicação de lógica já existente no módulo
3. Nomes e padrões seguindo o projeto
4. Sem TODO e sem código morto
5. Teste de navegador cobrindo o fluxo principal, quando houver interface
6. Toda peça nova tem chamador em produção (serviço, coluna, interruptor,
   índice); peça pronta que ninguém chama é a falha mais comum e não dá erro

**Formato do veredito:**

```
APROVADA | REPROVADA
BLOQUEANTE
- item | aprovado/reprovado | arquivo ou teste | uma linha de justificativa
MELHORIA (não reprova)
- ...
qualidade: N/6 (sinal de alerta, não portão)
```

O validador não conserta nada. Reprovado, o trabalho volta ao mesmo
executor com o motivo.

## 7. Com e sem OpenSpec

A matriz é a mesma nos dois caminhos. Muda só onde os artefatos moram.

| Etapa                | Com OpenSpec                                                        | Sem OpenSpec                                                                                |
| -------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Levantamento         | Briefing em `openspec/changes/<nome>/briefing.md`                   | Briefing num arquivo de trabalho (`pasta de trabalho ignorada pelo git/briefing-<nome>.md`) |
| Plano                | `proposal.md`, `design.md`, `tasks.md` e o delta de spec            | Um `plano-<nome>.md` com tarefas numeradas e testáveis                                      |
| Validação do plano   | O revisor corrige os artefatos da mudança e registra no `design.md` | O revisor devolve o parecer, e o executor o aplica                                          |
| Execução             | Marca `tasks.md` com a prova de cada item                           | Relatório de pré-validação                                                                  |
| Validação da entrega | Mais `openspec validate --strict`                                   | Só os checklists                                                                            |
| Fechamento           | `openspec archive` e commit                                         | Commit                                                                                      |

**Quando usar OpenSpec:** funcionalidade grande, módulo novo ou capacidade
nova, onde a proposta e o delta de spec se pagam. **Quando não usar:**
melhoria e correção do dia a dia; ali o rito custa mais do que entrega. O
que **nunca** sai, nos dois caminhos: a suíte inteira antes do commit, a
matriz, e o validador antes do aceite.

## 8. Sessão sem humano (execução em lote, `-p`, CI)

- Não delegue esperando notificação: não existe turno seguinte. Consuma o
  resultado do subagente no mesmo turno, ou faça o trabalho direto.
- Não pergunte: decida, execute, registre a alternativa descartada.
- Comando longo roda destacado, e é sondado até terminar dentro do mesmo
  turno. A resposta final só sai com o resultado observado.
- Tarefa que depende do dono do projeto é reescrita no que a sessão pode
  provar, com a dependência registrada.

## 9. Economia de token, em resumo

- RTK ligado (§0), e `rtk gain` no relatório do lote.
- Prompt de delegação só com a tarefa (§4).
- O nível L lê só o escopo; o plano não relê o código.
- O validador reaproveita a prova amarrada ao hash (§6) e não repete a
  suíte inteira.
- Melhoria não gera rodada nova (§3, regra 8).
- Fluxo curto para o que é pequeno (§2).
- Checkpoint por fase, para a queda não recomeçar do zero (§5).

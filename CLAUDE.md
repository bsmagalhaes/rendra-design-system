# CLAUDE.md

## Fluxo de início

Siga o fluxo descrito no [`AGENTS.md`](AGENTS.md): se `docs/BRIEFING.md` não existir, pergunte primeiro se é projeto novo, migração de layout ou contribuição, conduza o briefing de `docs/BRIEFING_MODELO.md` e só então planeje e execute em etapas.

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

## Matriz de modelos (inegociável)

| Etapa                | Modelo | Confronta código                     |
| -------------------- | ------ | ------------------------------------ |
| Levantamento         | Fable  | Sim                                  |
| Plano e spec         | Sonnet | Não, usa o briefing e o levantamento |
| Validação do plano   | Opus   | Sim                                  |
| Execução             | Sonnet | Não                                  |
| Validação da entrega | Fable  | Sim                                  |

Nenhum modelo valida o que ele mesmo escreveu.

Escopo obrigatório: Fable e Opus recebem apenas os arquivos do escopo mais o contrato do módulo, nunca o repositório inteiro. A validação da entrega olha o diff e a saída dos testes.

Briefing com mais de 24 horas ou com commits no meio é refeito, não reaproveitado.

Fluxo curto, para bug pequeno e correção óbvia: Sonnet escreve o teste que reproduz, corrige, e o Fable valida apenas os bloqueadores. Duas etapas.

### Regras de operação (inegociáveis, junto com a matriz)

1. **Levantamento antes de todo plano.** Nenhum plano é escrito sem um levantamento do Fable feito no código do escopo daquele lote. Plano que não parte de um levantamento é recusado. Reaproveitar um plano antigo para um lote novo não dispensa o levantamento do lote.
2. **Uma rodada de validação por plano.** O Opus valida o plano uma vez. O que ele apontar, o executor corrige durante a execução, e o que sobrar o Fable pega na validação da entrega. Não há segunda rodada de validação do plano.
3. **Um lote por vez.** Um lote só começa depois que o anterior foi validado e juntado na branch principal do trabalho. Nada de lotes em paralelo em branches separadas: evita retrabalho de junção e gasta menos.
4. **Teste confere o resultado, não a chamada.**
   - No servidor: a entrada chega pelo caminho real (webhook, fila, rota de recepção) e o teste afirma o que ficou gravado no banco ou o que foi respondido.
   - Na tela: o teste afirma o efeito que o usuário vê (classe ou atributo no `<html>`, texto na tela, item na lista, foco, elemento que some), e não apenas que o `onChange` ou outro callback foi chamado.
   - Espionar uma chamada só vale como complemento, nunca como a única prova.
5. **Pré-validação obrigatória do executor.** Antes de relatar a entrega, o executor cumpre esta lista e diz no relatório, item a item, que cumpriu:
   1. Rodou todos os comandos do critério de pronto e colou a última linha de cada um.
   2. Conferiu `git diff --stat`: só há arquivos do escopo declarado; cada arquivo fora da lista está justificado.
   3. Provou que cada teste novo falha sem a mudança (desfez a mudança, viu falhar, refez).
   4. Conferiu que os testes afirmam o resultado (regra 4), não a chamada.
   5. Releu o próprio diff procurando TODO, código morto, travessão, valor arbitrário, cor fixa, estilo inline e texto fora do português do Brasil.
   6. Listou o que não fez ou deixou pendente, sem omitir.

   Entrega sem a pré-validação volta para o executor sem passar pelo Fable.

### Checklist bloqueador (100 por cento, sem exceção)

Cada linha exige arquivo ou teste que comprove.

1. Contrato do módulo intacto, nenhuma assinatura pública alterada sem versionamento
2. Isolamento de dados entre clientes preservado, nenhuma consulta sem o filtro que o separa
3. Existe teste que falha sem a mudança e passa com ela
4. Migração reversível, nenhuma operação destrutiva sem rollback
5. Nenhum arquivo fora do escopo declarado foi tocado

### Checklist de qualidade (mínimo 80 por cento)

1. Caminho de erro coberto por teste
2. Sem duplicação de lógica já existente no módulo
3. Nomes e padrões seguindo o projeto
4. Sem TODO e sem código morto
5. Teste de navegador cobrindo o fluxo principal, quando houver interface

### Formato do veredito

Item, aprovado ou reprovado, arquivo ou teste que comprova, uma linha de justificativa. Percentual apenas ao final e apenas como sinal de alerta. O portão é o binário. Item que não pode ser respondido com sim ou não está grande demais e deve ser quebrado.

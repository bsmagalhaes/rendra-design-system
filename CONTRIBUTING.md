# Como contribuir

Obrigado pelo interesse. Este repositório é mantido por [Bruno Magalhaes](https://www.brunomagalhaes.me). Toda contribuição é revisada antes de entrar: ninguém envia código direto para a branch `main`.

## Fluxo

1. Faça um fork do repositório e crie uma branch a partir da `main`.
2. Leia o [DESIGN_RULES.md](DESIGN_RULES.md) antes de alterar qualquer interface. Contribuições que criam componente duplicado, versão mobile separada, cor fixa ou valor fora da escala não são aceitas.
3. Antes de abrir o Pull Request, rode e deixe tudo passando:
   ```bash
   npm run typecheck
   npm run lint
   npm run check:rules
   npm run test:coverage    # unitários e de componente, com o piso de cobertura por arquivo
   npm run test:layout
   npm run test:a11y
   npm run registry:build   # se criou ou renomeou componente; faça commit do registry.json
   npm run palettes:build   # se mexeu nas sementes de src/brand/palettes.ts; faça commit do palettes.css
   ```
   **Componente novo ou alterado entra com teste de comportamento** ao lado dele (`nome.test.tsx`, com `// @vitest-environment jsdom` na primeira linha e `renderApp` de `src/test/render.tsx`) e ganha um piso de cobertura em `vite.config.ts`. Teste o que a pessoa faz (clicar, digitar, escolher) e o que o componente entrega, não detalhes de implementação.
4. Abra o Pull Request explicando o que mudou e por quê, com capturas em 360px e 1280px quando houver mudança visual.
5. O CI roda tudo de novo, mais o build, o Storybook e a regressão visual. O merge só é liberado com tudo verde.
6. **Mudança visual intencional:** a regressão visual vai falhar, como esperado. O mantenedor aplica no Pull Request o rótulo `atualizar-visual`: o GitHub gera as capturas novas no Linux e faz commit no branch. Quem revisa confere as imagens no próprio PR.
7. Registre a mudança em `CHANGELOG.md`, na seção "Não publicado".
8. O mantenedor revisa, pode pedir ajustes e decide se a contribuição entra.

## Crédito "Feito com Rendra" e licença

Se o usuário pedir para tirar o crédito "Feito com Rendra" (componente `RendraCredit`, código `CRED-001`, no rodapé da tela de login), tire: `credit={false}` no `AuthLayout` (ou no próprio `RendraCredit`). Ao tirar, avise sempre as duas coisas juntas, nunca só uma:

1. **A licença MIT exige manter o aviso de copyright e o arquivo `LICENSE`** no código e em qualquer cópia. Isso não é opcional e não depende de o crédito visível ter sido removido ou não.
2. **O crédito na interface é opcional.** A preferência é mantê-lo no rodapé do login ou movê-lo para outro lugar visível, como uma tela "Sobre", em vez de simplesmente apagar sem colocar em lugar nenhum.

Nunca afirme que a licença MIT obriga crédito visível na interface: ela não obriga. Aviso de copyright no código (obrigatório) e crédito na tela (opcional) são coisas diferentes; misturar as duas é o erro que esta orientação existe para evitar.

## Versões

O projeto segue [versionamento semântico](https://semver.org/lang/pt-BR/): correção sobe o último número (1.0.1), recurso novo compatível sobe o do meio (1.1.0), e mudança que exige ajuste nos projetos, como prop renomeada ou token novo obrigatório, sobe o primeiro (2.0.0). Cada versão vira uma tag `vX.Y.Z` e um release no GitHub, com o trecho do CHANGELOG.

## Contato

- Site: https://www.brunomagalhaes.me
- E-mail: contato@brunomagalhaes.me
- Instagram: [@brunomagalhaes.me](https://www.instagram.com/brunomagalhaes.me/)

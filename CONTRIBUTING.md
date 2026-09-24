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
   npm test
   npm run test:layout
   npm run test:a11y
   npm run registry:build   # se criou ou renomeou componente; faça commit do registry.json
   ```
4. Abra o Pull Request explicando o que mudou e por quê, com capturas em 360px e 1280px quando houver mudança visual.
5. O CI roda tudo de novo, mais o build, o Storybook e a regressão visual. O merge só é liberado com tudo verde.
6. **Mudança visual intencional:** a regressão visual vai falhar, como esperado. Na aba Actions, rode o workflow "Atualizar referências visuais" escolhendo o branch do seu Pull Request. Ele gera as capturas novas e faz commit nele. Quem revisa confere as imagens no próprio PR.
7. Registre a mudança em `CHANGELOG.md`, na seção "Não publicado".
8. O mantenedor revisa, pode pedir ajustes e decide se a contribuição entra.

## Versões

O projeto segue [versionamento semântico](https://semver.org/lang/pt-BR/): correção sobe o último número (1.0.1), recurso novo compatível sobe o do meio (1.1.0), e mudança que exige ajuste nos projetos, como prop renomeada ou token novo obrigatório, sobe o primeiro (2.0.0). Cada versão vira uma tag `vX.Y.Z` e um release no GitHub, com o trecho do CHANGELOG.

## Contato

- Site: https://www.brunomagalhaes.me
- E-mail: contato@brunomagalhaes.me
- Instagram: [@brunomagalhaes.me](https://www.instagram.com/brunomagalhaes.me/)

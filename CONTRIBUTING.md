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
   npm run test:layout
   ```
4. Abra o Pull Request explicando o que mudou e por quê, com capturas em 360px e 1280px quando houver mudança visual.
5. O mantenedor revisa, pode pedir ajustes e decide se a contribuição entra.

## Contato

- Site: https://www.brunomagalhaes.me
- E-mail: contato@brunomagalhaes.me
- Instagram: [@brunomagalhaes.me](https://www.instagram.com/brunomagalhaes.me/)

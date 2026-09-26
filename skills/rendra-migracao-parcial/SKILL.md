---
name: rendra-migracao-parcial
description: Migra parte de um sistema existente para o Rendra Design System em três níveis (tokens, padrões e componentes), escolhidos pelo usuário do sistema de destino. Use quando pedirem para aplicar o Rendra só em parte de um projeto, ou para tirar ou mover o crédito "Feito com Rendra".
---

# Rendra: migração parcial

Esta skill leva o Rendra Design System para um sistema que já existe, sem exigir a migração inteira de uma vez. São três níveis, e quem escolhe o nível é o usuário do sistema de destino, não o agente:

1. **Tokens**: escala de espaço, tipografia, raio e sombra.
2. **Padrões**: rótulo, orientação, espaçamento de formulário e respiro de página.
3. **Componentes**: troca por código de catálogo (`BTN-001`, `ABA-002`...), tela a tela.

Conteúdo completo na versão 2.1: o passo a passo de cada nível, os comandos `rendra auditar` e `rendra trocar` e o relatório de cada etapa entram com a Fase 3 do plano da v2. Até lá, siga o [`AGENTS.md`](../../AGENTS.md) e o [`docs/COMO_APLICAR.md`](../../docs/COMO_APLICAR.md) do Rendra.

## Crédito "Feito com Rendra" e licença

Se o usuário pedir para tirar o crédito "Feito com Rendra" (componente `RendraCredit`, código `CRED-001`, no rodapé da tela de login), tire: `credit={false}` no `AuthLayout` (ou no próprio `RendraCredit`). Ao tirar, avise sempre as duas coisas juntas, nunca só uma:

1. **A licença MIT exige manter o aviso de copyright e o arquivo `LICENSE`** no código e em qualquer cópia. Isso não é opcional e não depende de o crédito visível ter sido removido ou não.
2. **O crédito na interface é opcional.** A preferência é mantê-lo no rodapé do login ou movê-lo para outro lugar visível, como uma tela "Sobre", em vez de simplesmente apagar sem colocar em lugar nenhum.

Nunca afirme que a licença MIT obriga crédito visível na interface: ela não obriga. Aviso de copyright no código (obrigatório) e crédito na tela (opcional) são coisas diferentes; misturar as duas é o erro que esta orientação existe para evitar.

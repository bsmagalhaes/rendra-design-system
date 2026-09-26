/*
 * Checagem de scripts/verify-pack.mjs extraída em função pura, para dar teste de verdade sem
 * rodar o pacote inteiro (npm pack, instalação num projeto à parte).
 */

/**
 * package.json com "private": true nunca deveria chegar à publicação: o npm publish recusaria
 * com EPRIVATE, mas "npm pack" (o comando que verify-pack.mjs usa para inspecionar o pacote)
 * empacota normalmente e não acusa nada, mascarando o problema até o publish de verdade falhar.
 * Devolve a mensagem de erro quando `private` é `true`, ou undefined quando está tudo certo.
 */
export function privateFieldError(pkg: { private?: boolean }): string | undefined {
  if (pkg.private !== true) return undefined
  return (
    'package.json tem "private": true: o npm publish recusaria com EPRIVATE, e "npm pack" ' +
    'não acusa isso (empacota normalmente). Remova "private" antes de publicar.'
  )
}

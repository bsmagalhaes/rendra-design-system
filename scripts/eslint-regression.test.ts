/*
 * Prova, com a própria API do ESLint (em memória, sem rodar o CLI e sem depender de
 * test/fixtures, que o lint ignora), que a migração para o ESLint 10 não silenciou nenhuma
 * regra do projeto: carrega o `eslint.config.js` real via `overrideConfigFile` e linta um
 * trecho de código com uma violação conhecida, afirmando que a regra continua sendo apontada.
 *
 * A instância do ESLint é criada uma única vez em `beforeAll`: carregar o `eslint.config.js`
 * de verdade (parser, plugins e presets) é lento e passou do testTimeout padrão (5000 ms) em
 * rodadas paralelas quando cada teste criava a própria instância; por isso o timeout maior
 * fica só na criação (`beforeAll`) e em cada `it` que efetivamente linta.
 */
import { ESLint } from 'eslint'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

const ROOT = join(import.meta.dirname, '..')
const SETUP_TIMEOUT = 60_000

let eslint: ESLint

beforeAll(() => {
  eslint = new ESLint({
    cwd: ROOT,
    overrideConfigFile: join(ROOT, 'eslint.config.js'),
  })
}, SETUP_TIMEOUT)

describe('eslint.config.js sob o ESLint 10 (regressão)', () => {
  it(
    'continua apontando react-hooks/rules-of-hooks para hook chamado condicionalmente',
    async () => {
      const code = `import { useState } from 'react'
export function Bad({ cond }: { cond: boolean }) {
  if (cond) {
    useState(0)
  }
  return null
}
`
      const [result] = await eslint.lintText(code, {
        filePath: join(ROOT, 'src/tmp-hook-fora-de-ordem.tsx'),
      })

      const hookMessage = result.messages.find((m) => m.ruleId === 'react-hooks/rules-of-hooks')
      expect(hookMessage?.message).toContain('called conditionally')
    },
    SETUP_TIMEOUT,
  )

  it(
    'continua aplicando o argsIgnorePattern de @typescript-eslint/no-unused-vars (^_)',
    async () => {
      const code = `export function greet(name: string, _unusedOk: number, unusedBad: number) {
  return name
}
`
      const [result] = await eslint.lintText(code, {
        filePath: join(ROOT, 'src/tmp-argumento-nao-usado.tsx'),
      })

      const unusedVarMessages = result.messages.filter(
        (m) => m.ruleId === '@typescript-eslint/no-unused-vars',
      )
      expect(unusedVarMessages).toHaveLength(1)
      expect(unusedVarMessages[0]?.message).toContain("'unusedBad' is defined but never used")
      expect(unusedVarMessages.some((m) => m.message.includes("'_unusedOk'"))).toBe(false)
    },
    SETUP_TIMEOUT,
  )
})

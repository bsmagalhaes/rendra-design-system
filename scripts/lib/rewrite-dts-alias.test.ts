import { describe, expect, it } from 'vitest'
import { resolveAliasSpecifier, rewriteAliasSpecifiers } from './rewrite-dts-alias'

/*
 * O tsc não resolve o alias @/ na emissão dos .d.ts (confirmado em dist/types real, 23
 * imports), e a reescrita própria (sem vite-plugin-dts) precisa de prova de que o caminho
 * relativo calculado está certo.
 */

describe('resolveAliasSpecifier', () => {
  it('alias em subpasta vira caminho relativo certo, subindo os níveis certos', () => {
    expect(resolveAliasSpecifier('components/ui/alert.d.ts', '@/brand/types')).toBe(
      '../../brand/types',
    )
  })

  it('alias visto da raiz de dist/types sobe só um nível (./)', () => {
    expect(resolveAliasSpecifier('index.d.ts', '@/lib/shape')).toBe('./lib/shape')
  })

  it('alias para um irmão direto do próprio arquivo', () => {
    expect(resolveAliasSpecifier('brand/brand-context.d.ts', '@/brand/types')).toBe('./types')
  })
})

describe('rewriteAliasSpecifiers', () => {
  it('reescreve só os especificadores com alias, contando quantos', () => {
    const source = `import type { Shape } from '@/lib/shape';\nimport type { X } from './types';\n`
    const { code, count } = rewriteAliasSpecifiers(source, 'brand/brand-context.d.ts')
    expect(count).toBe(1)
    expect(code).toContain("from '../lib/shape'")
  })

  it('import sem alias (relativo ou de pacote) fica intacto', () => {
    const source = `import type { X } from './types';\nimport type { Y } from 'lucide-react';\n`
    const { code, count } = rewriteAliasSpecifiers(source, 'components/ui/alert.d.ts')
    expect(count).toBe(0)
    expect(code).toBe(source)
  })

  it('arquivo sem nenhum alias devolve o mesmo texto (nenhuma troca)', () => {
    const source = 'export interface AlertProps {}\n'
    const { code, count } = rewriteAliasSpecifiers(source, 'components/ui/alert.d.ts')
    expect(count).toBe(0)
    expect(code).toBe(source)
  })

  it('reescreve mais de um especificador no mesmo arquivo', () => {
    const source = `import type { A } from '@/lib/a';\nimport type { B } from '@/brand/types';\n`
    const { code, count } = rewriteAliasSpecifiers(source, 'index.d.ts')
    expect(count).toBe(2)
    expect(code).toContain("from './lib/a'")
    expect(code).toContain("from './brand/types'")
  })
})

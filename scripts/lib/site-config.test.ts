import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ler = (arquivo: string) => readFileSync(join(process.cwd(), arquivo), 'utf8')

describe('endereço-base da demo', () => {
  it('vite e seo apontam para /demo/', () => {
    expect(ler('vite.config.ts')).toContain("'https://bsmagalhaes.github.io/rendra-ui-web/demo/'")
    expect(ler('src/config/seo.ts')).toContain(
      "url: 'https://bsmagalhaes.github.io/rendra-ui-web/demo/'",
    )
  })

  it('o arquivo do Search Console fica na raiz da composição (docs/), não em public/', () => {
    expect(existsSync(join(process.cwd(), 'docs', 'google9146e14a87f8288f.html'))).toBe(true)
    expect(existsSync(join(process.cwd(), 'public', 'google9146e14a87f8288f.html'))).toBe(false)
  })

  it('o Storybook do noscript da demo usa a URL da raiz, não a da demo (C13)', () => {
    expect(ler('index.html')).not.toContain('__SITE_URL__storybook/')
    expect(ler('index.html')).toContain('__ROOT_URL__storybook/')
    expect(ler('vite.config.ts')).toContain('__ROOT_URL__')
  })

  it('a pasta de composição .pages fica fora do git, do ESLint e do Prettier (C11)', () => {
    expect(ler('.gitignore')).toMatch(/^\.pages$/m)
    expect(ler('eslint.config.js')).toContain("'.pages'")
    expect(ler('.prettierignore')).toMatch(/^\.pages$/m)
    expect(ler('.prettierignore')).toContain('docs/google*.html')
  })
})

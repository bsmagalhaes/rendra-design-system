import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Favicon oficial da família (padrão dos produtos, seção 2.8): selo com fundo #111111, sem contorno.
const ICONE_OFICIAL =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><rect width="44" height="44" rx="10" fill="#111111"/><path d="M15 31V13h9.2a5.6 5.6 0 0 1 1.6 11L31 31" fill="none" stroke="#e8650a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

describe('docs/icon.svg', () => {
  const svg = () => readFileSync(join(process.cwd(), 'docs', 'icon.svg'), 'utf8').trim()

  it('é o favicon oficial da família, byte a byte', () => {
    expect(svg()).toBe(ICONE_OFICIAL)
  })

  it('não puxa nada de fora', () => {
    expect(svg()).not.toMatch(/https?:\/\/(?!www\.w3\.org)/)
    expect(svg()).not.toContain('<image')
  })
})

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const html = readFileSync(join(process.cwd(), 'docs', 'index.html'), 'utf8')
const noDisco = (nome: string) => existsSync(join(process.cwd(), 'docs', 'images', `${nome}.webp`))
const bloco = html.match(/const IMAGES = \[([\s\S]*?)\n\s*\]\s*\n\s*const gallery/)?.[1] ?? ''
const idsDaLista = [...bloco.matchAll(/\[\s*["']([a-z0-9-]+)["']/g)].map((m) => m[1]!)

describe('imagens da página', () => {
  it('toda imagem que a página cita em images/ existe em docs/images', () => {
    const citadas = [
      ...new Set([...html.matchAll(/images\/([a-z0-9-]+)\.webp/g)].map((m) => m[1]!)),
    ]
    expect(citadas.length).toBeGreaterThan(10)
    for (const nome of citadas) expect(noDisco(nome), nome).toBe(true)
  })

  it('todo id da lista IMAGES (galeria e lightbox) existe em docs/images', () => {
    expect(idsDaLista.length).toBeGreaterThanOrEqual(20)
    for (const id of idsDaLista) expect(noDisco(id), id).toBe(true)
  })

  it('todo data-open aponta para um id da lista IMAGES', () => {
    const abertos = [...html.matchAll(/data-open="([a-z0-9-]+)"/g)].map((m) => m[1]!)
    expect(abertos.length).toBeGreaterThan(10)
    for (const id of abertos) expect(idsDaLista.includes(id), id).toBe(true)
  })

  it('as imagens sociais existem: og-image em docs/ e em public/, 1200x630', () => {
    for (const arquivo of ['docs/og-image.png', 'public/og-image.png']) {
      const png = readFileSync(join(process.cwd(), arquivo))
      expect([png.readUInt32BE(16), png.readUInt32BE(20)], arquivo).toEqual([1200, 630])
    }
  })

  it('a og-image não fica em docs/images (a galeria da demo importa a pasta inteira)', () => {
    expect(noDisco('og-image')).toBe(false)
  })

  it('as capturas são WebP (regra 9): sem PNG em docs/images e sem referência a PNG no README', () => {
    const pasta = join(process.cwd(), 'docs', 'images')
    expect(readdirSync(pasta).filter((n) => !n.endsWith('.webp'))).toEqual([])
    const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8')
    expect(readme).not.toMatch(/docs\/images\/[^)]*\.png/)
    expect(html).not.toMatch(/images\/[a-z0-9-]+\.png/)
    expect(html).not.toMatch(/\.png"\s+alt=/)
  })

  it('a página não exibe a captura de atendimento (logos de canais de terceiros)', () => {
    expect(html).not.toContain('safira-atendimento')
    expect(idsDaLista).toContain('safira-calendario')
  })
})

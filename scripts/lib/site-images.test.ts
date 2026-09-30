import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const html = readFileSync(join(process.cwd(), 'docs', 'index.html'), 'utf8')
const noDisco = (nome: string) => existsSync(join(process.cwd(), 'docs', 'images', `${nome}.png`))
const bloco = html.match(/const IMAGES = \[([\s\S]*?)\n\s*\]\s*\n\s*const gallery/)?.[1] ?? ''
const idsDaLista = [...bloco.matchAll(/\[\s*["']([a-z0-9-]+)["']/g)].map((m) => m[1]!)

describe('imagens da página', () => {
  it('toda imagem que a página cita em images/ existe em docs/images', () => {
    const citadas = [...new Set([...html.matchAll(/images\/([a-z0-9-]+)\.png/g)].map((m) => m[1]!))]
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
})

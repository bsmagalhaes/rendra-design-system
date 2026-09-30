import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ler = (arquivo: string) => readFileSync(join(process.cwd(), arquivo), 'utf8')
const readme = ler('README.md')
const briefing = ler('docs/BRIEFING_MODELO.md')
const PAGINA = 'https://bsmagalhaes.github.io/rendra-ui-web/'
const PROMESSAS = [
  'sem versão paga',
  'sempre gratuito',
  'sem assinatura',
  'grátis',
  'gratuito',
  'para sempre',
]

// Só a raiz (a página), demo/, r/, storybook/ e sitemap.xml existem no site; o resto seria a rota
// antiga da demo (inclui /?codigo= e galeria/?imagem=).
const ANTIGA =
  /bsmagalhaes\.github\.io\/rendra-ui-web\/(?!demo\/|r\/|storybook\/|sitemap\.xml)[a-z?]/

describe('README e briefing', () => {
  it('o README não cita rota da demo sem o demo/', () => {
    expect(readme).not.toMatch(ANTIGA)
  })

  it('o briefing não cita rota da demo sem o demo/', () => {
    expect(briefing).not.toMatch(ANTIGA)
  })

  it('o primeiro link de "Veja funcionando" é a página de apresentação', () => {
    const trecho = readme.split('Veja funcionando')[1] ?? ''
    const primeiro = trecho.match(
      /https:\/\/bsmagalhaes\.github\.io\/rendra-ui-web\/[^\s)"`]*/,
    )?.[0]
    expect(primeiro).toBe(PAGINA)
  })

  it('o código T1-C4-M5 no endereço aponta para a demo', () => {
    expect(readme).toContain(`${PAGINA}demo/?codigo=T1-C4-M5`)
  })

  it('o registry continua em r/ e o README documenta o test:site e o docs:og-image', () => {
    expect(readme).toContain(`${PAGINA}r/select.json`)
    expect(readme).toContain('npm run test:site')
    expect(readme).toContain('npm run docs:og-image')
  })

  it('nenhum texto do README promete preço ou gratuidade (W18)', () => {
    const texto = readme.toLowerCase()
    for (const proibido of PROMESSAS) expect(texto, proibido).not.toContain(proibido)
  })
})

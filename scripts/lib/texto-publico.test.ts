import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Regra do dono: texto público nunca promete gratuidade nem ausência de versão paga.
// Cobre a demo (metas, JSON-LD, FAQ e texto de fallback do index.html) e os metadados de
// src/config/seo.ts. O README tem o próprio teste em readme-links.test.ts, e a página e o
// llms.txt publicados, em tests/site.spec.ts.
const ler = (arquivo: string) => readFileSync(join(process.cwd(), arquivo), 'utf8')
const PROMESSAS = /gratuit|gr[aá]tis|free forever|sem versão paga|sempre gratuito|para sempre/i

describe('texto público da demo (W18)', () => {
  for (const arquivo of ['index.html', 'src/config/seo.ts']) {
    it(`${arquivo} não promete gratuidade nem ausência de versão paga`, () => {
      const achados = ler(arquivo)
        .split('\n')
        .map((linha, i) => ({ linha: i + 1, texto: linha.trim().slice(0, 120) }))
        .filter(({ texto }) => PROMESSAS.test(texto))
      expect(achados).toEqual([])
    })
  }
})

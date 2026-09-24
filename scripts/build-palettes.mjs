/**
 * Gera src/styles/palettes.css a partir das sementes de src/brand/palettes.ts.
 *   npm run palettes:build           grava o arquivo
 *   npm run palettes:build -- --check  só confere se está em dia (usado no CI)
 * Cada paleta sai com o modo claro e o escuro, e os ajustes de contraste ficam no comentário.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createPalette, paletteCss } from '../src/brand/palette.ts'
import { paletteSeeds } from '../src/brand/palettes.ts'

const OUT = 'src/styles/palettes.css'
const header = `/*
 * PALETAS (arquivo gerado: não edite à mão)
 * ------------------------------------------
 * Gerado por scripts/build-palettes.mjs a partir das sementes de src/brand/palettes.ts:
 * 4 cores (primária, hover, secundária, hover) e o degradê da marca. Neutros do modo claro e
 * cores de sistema (sucesso, alerta, erro, informação) ficam fixos em src/styles/theme.css.
 * Para mudar uma paleta, edite as sementes e rode \`npm run palettes:build\`.
 */
`
const css =
  header + paletteSeeds.map((s, i) => '\n' + paletteCss(createPalette(s), i === 0)).join('')

if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = readFileSync(OUT, 'utf8')
  } catch {
    // arquivo ainda não existe
  }
  if (current.replace(/\r\n/g, '\n') !== css) {
    console.error(`${OUT} está desatualizado. Rode: npm run palettes:build`)
    process.exit(1)
  }
  console.log('Paletas em dia.')
} else {
  writeFileSync(OUT, css)
  for (const s of paletteSeeds) {
    const p = createPalette(s)
    console.log(`${s.name}: ${p.adjustments.length ? p.adjustments.join('; ') : 'sem ajustes'}`)
  }
  console.log(`Gerado ${OUT} (${paletteSeeds.length} paletas).`)
}

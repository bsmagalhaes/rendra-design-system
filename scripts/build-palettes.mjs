/**
 * Gera src/styles/palettes.css a partir das sementes de src/brand/palettes.ts.
 *   npm run palettes:build           grava o arquivo
 *   npm run palettes:build -- --check  só confere se está em dia (usado no CI)
 * Cada paleta sai com o modo claro e o escuro, e os ajustes de contraste ficam no comentário.
 *
 * O CSS gerado passa pelo Prettier (config do projeto, .prettierrc.json) antes de gravar e
 * antes de comparar no --check: o prefixo --rendra- nas chaves da paleta (etapa 2.0.0-alpha.1)
 * deixa algumas linhas mais longas que os 100 caracteres do printWidth, e é o Prettier quem
 * decide como quebrá-las, não um valor arbitrário escrito à mão aqui.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { format, resolveConfig } from 'prettier'
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
const rawCss =
  header + paletteSeeds.map((s, i) => '\n' + paletteCss(createPalette(s), i === 0)).join('')

async function formatCss(source) {
  const config = (await resolveConfig(OUT)) ?? {}
  return format(source, { ...config, filepath: OUT })
}

const css = await formatCss(rawCss)

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

import type { PaletteSeeds } from './palette'

/*
 * PALETAS PRONTAS: só as sementes (4 cores e o degradê da marca).
 * O resto de cada paleta é gerado por createPalette (src/brand/palette.ts), com AA conferido.
 * Depois de editar: `npm run palettes:build` (atualiza src/styles/palettes.css).
 * A primeira da lista é a padrão (vale antes de o app definir data-palette).
 *
 * Paleta de cliente sem build (white label): applyPalette({ id, name, ...sementes }).
 */
export const paletteSeeds: PaletteSeeds[] = [
  {
    id: 'safira',
    name: 'Safira',
    primary: '#0b6fe0',
    primaryHover: '#98d10a',
    secondary: '#98d10a',
    secondaryHover: '#0b6fe0',
    gradient: ['#034889', '#0b1d37', '#07142a'],
  },
  {
    id: 'equilibrio',
    name: 'Equilíbrio',
    primary: '#5b3fd1',
    primaryHover: '#4a31b3',
    secondary: '#0e7490',
    secondaryHover: '#0b5f76',
    gradient: ['#3b2a8c', '#241d45', '#1d1a2e'],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    primary: '#0f766e',
    primaryHover: '#0c5f59',
    secondary: '#b4461f',
    secondaryHover: '#963a19',
    gradient: ['#11857b', '#0c5f59', '#083f3b'],
  },
  {
    id: 'ardosia',
    name: 'Ardósia',
    primary: '#2e414d',
    primaryHover: '#22323c',
    // Laranja da marca com texto branco: o gerador escurece até passar AA.
    secondary: '#ea600d',
    secondaryHover: '#a8400a',
    onSecondary: 'light',
    gradient: ['#3e5664', '#2e414d', '#1f2d36'],
  },
]

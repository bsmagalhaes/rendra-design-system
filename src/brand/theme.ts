/*
 * COR CONTROLADA (Parte B, C5, docs/specs/v2-plano.md seções 2.6 e 4.2, correções da 6.4)
 * -------------------------------------------------------------------------------------
 * createTheme(input) é uma função pura (sem tocar o DOM, compatível com SSR) com três modos:
 *
 *   - gerado: sementes (4 cores + degradê), passa por createPalette, corrige contraste AA,
 *     é o mesmo comportamento de applyPalette hoje, só que exposto por uma API versionada;
 *   - explicito: tokens semânticos já prontos, por nome SEM prefixo (primary, primaryForeground,
 *     sidebar...), traduzidos aqui para --rendra-*; nada é recalculado, o contraste só é
 *     relatado (enforceContrast força o ajuste); dark ausente é derivado, presente é respeitado;
 *   - misto: sementes + sobrescritas pontuais, a sobrescrita sempre vence.
 *
 * createPalette/applyPalette/paletteCss continuam intactos: createTheme é construído por cima
 * deles, nunca em paralelo. A saída já nasce com as chaves --rendra-* (decisão 1.8).
 */
import { createPalette, contrast, mix, type PaletteSeeds } from './palette'

export type ThemeMode = 'gerado' | 'explicito' | 'misto'

export interface ThemeSeedInput {
  /** Hex, rgb(), hsl() ou tripleta HSL solta ("210 95% 34%"). */
  primary: string
  primaryHover?: string
  secondary: string
  secondaryHover?: string
  /** Degradê da marca (sidebar, painel do login, destaque): luz, meio e fundo. */
  gradient: [string, string, string]
  onPrimary?: 'auto' | 'light' | 'dark'
  onSecondary?: 'auto' | 'light' | 'dark'
}

/** Tokens semânticos por nome, sem o prefixo --rendra- (ex.: "primary", "primaryForeground"). */
export type ThemeSemanticTokens = Partial<Record<(typeof TOKEN_KEYS)[number], string>>

export interface ThemeExplicitInput {
  light: ThemeSemanticTokens
  /** Ausente = derivado do claro; presente = respeitado como está. */
  dark?: ThemeSemanticTokens
  /** Default false: só relata o contraste. true: ajusta os pares que falham AA. */
  enforceContrast?: boolean
}

export interface ThemeInput {
  /** Usado em data-palette (ou data-rendra-root) e no BrandProvider. */
  id: string
  /** Nome curto exibido nos seletores. */
  name: string
  mode: ThemeMode
  /** Obrigatório em 'gerado' e 'misto'. */
  seed?: ThemeSeedInput
  /** Obrigatório em 'explicito' e 'misto' (ao menos `light`). */
  explicit?: Partial<ThemeExplicitInput>
}

export interface ThemeContrastCheck {
  /** Nome da variável --rendra-* verificada (o papel de preenchimento do par). */
  token: string
  background: string
  foreground: string
  ratio: number
  passesAA: boolean
  mode: 'light' | 'dark'
}

export interface ThemeAdjustment {
  token: string
  mode: 'light' | 'dark'
  requested: string
  applied: string
  ratio: number
}

export interface ThemeResult {
  id: string
  name: string
  /** Logotipo adequado sobre a sidebar deste tema. */
  sidebarLogo: 'light' | 'dark'
  vars: {
    light: Record<string, string>
    dark: Record<string, string>
  }
  /** Um item por par de contraste conferido. */
  report: ThemeContrastCheck[]
  /** Ajustes aplicados (enforceContrast, ou os já feitos por createPalette no modo gerado). */
  adjustments: ThemeAdjustment[]
}

/* ------------------------------------------------------------- vocabulário de tokens */

/**
 * Todo nome de token que createPalette emite (light ∪ dark), sem prefixo, em camelCase.
 * É a lista que o modo explícito aceita; qualquer chave fora daqui é ignorada (não é
 * vocabulário de createPalette, não faz parte deste contrato).
 */
export const TOKEN_KEYS = [
  'primary',
  'primaryForeground',
  'primaryHover',
  'primaryHoverForeground',
  'secondary',
  'secondaryForeground',
  'secondaryHover',
  'secondaryHoverForeground',
  'primarySoft',
  'primarySoftForeground',
  'primaryText',
  'ring',
  'accent',
  'accentForeground',
  'sidebar',
  'sidebarImage',
  'sidebarForeground',
  'sidebarMutedForeground',
  'sidebarBorder',
  'sidebarAccent',
  'sidebarActive',
  'sidebarActiveForeground',
  'sidebarIndicator',
  'gradientBrand',
  'gradientBrandForeground',
  'gradientAccent',
  'gradientSoft',
  'chart1',
  'chart2',
  'chart3',
  'chart4',
  'chart5',
  'shadowColor',
  'background',
  'backgroundImage',
  'foreground',
  'card',
  'cardForeground',
  'popover',
  'popoverForeground',
  'muted',
  'mutedForeground',
  'border',
  'input',
  'field',
  'overlay',
] as const

/** camelCase -> kebab-case ("primaryForeground" -> "primary-foreground", "chart1" -> "chart-1"). */
function camelToKebab(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase()
}

const toVarName = (key: string) => `--rendra-${camelToKebab(key)}`

/* ------------------------------------------------------------------------- cor */

const WHITE = '#ffffff'
const BLACK = '#000000'
const INK = '#0b1d37'

function isDarkColor(hex: string): boolean {
  return contrast(hex, WHITE) >= contrast(hex, INK)
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
const RGB_RE =
  /^rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)(?:\s*[,/]\s*[\d.%]+)?\s*\)$/i
const HSL_RE =
  /^hsla?\(\s*([\d.]+)(?:deg)?\s*[,\s]\s*([\d.]+)%\s*[,\s]\s*([\d.]+)%(?:\s*[,/]\s*[\d.%]+)?\s*\)$/i
const HSL_TRIPLET_RE = /^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/

function toHex2(n: number): string {
  return Math.round(Math.min(255, Math.max(0, n)))
    .toString(16)
    .padStart(2, '0')
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`
}

/** HSL (h em graus, s/l em 0..100) para hex. */
function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100
  const lN = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = sN * Math.min(lN, 1 - lN)
  const f = (n: number) => lN - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return rgbToHex(255 * f(0), 255 * f(8), 255 * f(4))
}

/**
 * Tenta reconhecer `value` como cor (hex, rgb(), hsl() ou tripleta HSL solta, "210 95% 34%") e
 * devolve o hex normalizado em minúsculas. Devolve null quando não é um formato de cor
 * reconhecido (gradiente, palavra-chave, "none"...), para o chamador decidir o que fazer.
 */
export function tryParseColorToHex(value: string): string | null {
  const v = value.trim()
  if (HEX_RE.test(v)) {
    let h = v.slice(1)
    if (h.length === 3)
      h = h
        .split('')
        .map((c) => c + c)
        .join('')
    return `#${h.toLowerCase()}`
  }
  const rgb = RGB_RE.exec(v)
  if (rgb) return rgbToHex(Number(rgb[1]), Number(rgb[2]), Number(rgb[3]))
  const hsl = HSL_RE.exec(v)
  if (hsl) return hslToHex(Number(hsl[1]), Number(hsl[2]), Number(hsl[3]))
  const triplet = HSL_TRIPLET_RE.exec(v)
  if (triplet) return hslToHex(Number(triplet[1]), Number(triplet[2]), Number(triplet[3]))
  return null
}

/** Como tryParseColorToHex, mas lança quando o valor precisa ser uma cor (sementes). */
function parseColorToHex(value: string, label: string): string {
  const hex = tryParseColorToHex(value)
  if (!hex)
    throw new Error(`Cor inválida em ${label}: ${value} (use hex, rgb(), hsl() ou "H S% L%")`)
  return hex
}

/** rgb(var(--x) / a) precisa da tripleta "r g b"; aceita hex ou já-tripleta. */
function toRgbTriplet(value: string): string {
  const hex = tryParseColorToHex(value)
  if (hex) {
    const h = hex.slice(1)
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16)
    return `${n(0)} ${n(2)} ${n(4)}`
  }
  return value.trim()
}

/* --------------------------------------------------------------- modo explícito/misto */

/** Traduz tokens semânticos sem prefixo para --rendra-*, normalizando cor quando reconhecida. */
function translateExplicit(tokens: ThemeSemanticTokens): Record<string, string> {
  const out: Record<string, string> = {}
  for (const key of TOKEN_KEYS) {
    const value = tokens[key]
    if (value == null) continue
    const varName = toVarName(key)
    if (key === 'shadowColor') {
      out[varName] = toRgbTriplet(value)
      continue
    }
    out[varName] = tryParseColorToHex(value) ?? value
  }
  return out
}

/**
 * Derivação simples do escuro a partir do claro, só usada no modo explícito sem sementes e sem
 * `dark` informado (documentada aqui, não é a mesma qualidade AA de createPalette): papéis de
 * texto (*Foreground) clareiam, preenchimentos e fundos escurecem. Quem quiser o escuro fino
 * deve informar `explicit.dark` ou usar sementes (modo gerado/misto).
 */
function deriveSimpleDark(light: Record<string, string>): Record<string, string> {
  const dark: Record<string, string> = {}
  for (const [varName, value] of Object.entries(light)) {
    const hex = tryParseColorToHex(value)
    if (!hex) {
      dark[varName] = value
      continue
    }
    const isForeground = /-foreground$/.test(varName)
    dark[varName] = isForeground ? mix(hex, WHITE, 0.4) : mix(hex, BLACK, 0.5)
  }
  return dark
}

/* ------------------------------------------------------------------- relatório de contraste */

/** Pares (preenchimento, texto) conferidos no relatório, pelo nome do token (sem prefixo). */
const CONTRAST_PAIRS: [fill: string, foreground: string][] = [
  ['primary', 'primaryForeground'],
  ['primaryHover', 'primaryHoverForeground'],
  ['secondary', 'secondaryForeground'],
  ['secondaryHover', 'secondaryHoverForeground'],
  ['primarySoft', 'primarySoftForeground'],
  ['accent', 'accentForeground'],
  ['sidebar', 'sidebarForeground'],
  ['card', 'cardForeground'],
  ['popover', 'popoverForeground'],
  ['muted', 'mutedForeground'],
  ['background', 'foreground'],
]

const AA = 4.5

/** Constrói o relatório e, se enforceContrast, ajusta os pares que falham (mutando `vars`). */
function buildReport(
  vars: { light: Record<string, string>; dark: Record<string, string> },
  enforceContrast: boolean,
): { report: ThemeContrastCheck[]; adjustments: ThemeAdjustment[] } {
  const report: ThemeContrastCheck[] = []
  const adjustments: ThemeAdjustment[] = []
  for (const mode of ['light', 'dark'] as const) {
    const map = vars[mode]
    for (const [fillKey, fgKey] of CONTRAST_PAIRS) {
      const fillVar = toVarName(fillKey)
      const fgVar = toVarName(fgKey)
      const fillValue = map[fillVar]
      const fgValue = map[fgVar]
      if (!fillValue || !fgValue) continue
      const fillHex = tryParseColorToHex(fillValue)
      const fgHex = tryParseColorToHex(fgValue)
      if (!fillHex || !fgHex) continue
      const ratio = contrast(fillHex, fgHex)
      const passesAA = ratio >= AA
      report.push({
        token: fillVar,
        background: fillHex,
        foreground: fgHex,
        ratio,
        passesAA,
        mode,
      })
      if (!passesAA && enforceContrast) {
        const towardBlack = isDarkColor(fillHex) ? false : true
        let applied = fgHex
        for (let t = 0; t <= 1.0001; t += 0.02) {
          const candidate = mix(fgHex, towardBlack ? BLACK : WHITE, t)
          if (contrast(fillHex, candidate) >= AA) {
            applied = candidate
            break
          }
          applied = towardBlack ? BLACK : WHITE
        }
        const finalRatio = contrast(fillHex, applied)
        map[fgVar] = applied
        adjustments.push({
          token: fgVar,
          mode,
          requested: fgHex,
          applied,
          ratio: finalRatio,
        })
      }
    }
  }
  return { report, adjustments }
}

/* ------------------------------------------------------------------------------- createTheme */

/**
 * Ajustes do modo gerado/misto: compara a cor pedida na semente (primary, primaryHover,
 * secondary, secondaryHover, já normalizadas para hex por seedToPaletteSeeds) com a cor que
 * createPalette de fato aplicou em cada preenchimento, claro e escuro. Diferença = ajuste (seja
 * para passar AA com o texto, no claro, seja para ficar visível sobre o card escuro, no escuro;
 * os dois casos hoje ficam só em nota de texto dentro de createPalette, e o escuro é descartado
 * — aqui os dois viram registro estruturado).
 */
function seedAdjustments(
  seedHexes: Pick<PaletteSeeds, 'primary' | 'primaryHover' | 'secondary' | 'secondaryHover'>,
  vars: { light: Record<string, string>; dark: Record<string, string> },
): ThemeAdjustment[] {
  const out: ThemeAdjustment[] = []
  for (const key of ['primary', 'primaryHover', 'secondary', 'secondaryHover'] as const) {
    const requested = seedHexes[key]
    const varName = toVarName(key)
    for (const mode of ['light', 'dark'] as const) {
      const applied = vars[mode][varName]
      if (!applied || applied.toLowerCase() === requested.toLowerCase()) continue
      const fgVar = toVarName(`${key}Foreground`)
      const fg = vars[mode][fgVar]
      const fgHex = fg ? tryParseColorToHex(fg) : null
      out.push({
        token: varName,
        mode,
        requested,
        applied,
        ratio: fgHex ? contrast(applied, fgHex) : 0,
      })
    }
  }
  return out
}

function seedToPaletteSeeds(id: string, name: string, seed: ThemeSeedInput): PaletteSeeds {
  return {
    id,
    name,
    primary: parseColorToHex(seed.primary, 'seed.primary'),
    primaryHover: parseColorToHex(seed.primaryHover ?? seed.primary, 'seed.primaryHover'),
    secondary: parseColorToHex(seed.secondary, 'seed.secondary'),
    secondaryHover: parseColorToHex(seed.secondaryHover ?? seed.secondary, 'seed.secondaryHover'),
    gradient: seed.gradient.map((c, i) => parseColorToHex(c, `seed.gradient[${i}]`)) as [
      string,
      string,
      string,
    ],
    onPrimary: seed.onPrimary,
    onSecondary: seed.onSecondary,
  }
}

function sidebarLogoFrom(vars: { light: Record<string, string>; dark: Record<string, string> }) {
  const sidebar = vars.light['--rendra-sidebar'] ?? vars.dark['--rendra-sidebar']
  const hex = sidebar ? tryParseColorToHex(sidebar) : null
  return hex && isDarkColor(hex) ? 'dark' : 'light'
}

/**
 * Função pura, sem DOM, compatível com SSR. As chaves de vars.light/vars.dark já nascem
 * prefixadas (--rendra-primary, --rendra-shadow-color...). Ver docs/specs/v2-plano.md,
 * seções 2.6 e 4.2, e as correções da seção 6.4 (formato final do retorno).
 */
export function createTheme(input: ThemeInput): ThemeResult {
  const { id, name, mode } = input

  if (mode === 'gerado') {
    if (!input.seed) throw new Error('createTheme: modo "gerado" exige seed.')
    const paletteSeeds = seedToPaletteSeeds(id, name, input.seed)
    const palette = createPalette(paletteSeeds)
    const vars = { light: { ...palette.light }, dark: { ...palette.dark } }
    // createPalette já corrige AA na geração; o relatório aqui só confirma (sem reajustar).
    const { report } = buildReport(vars, false)
    // Reaproveita os hexes já normalizados por seedToPaletteSeeds, sem reanalisar a semente.
    const adjustments = seedAdjustments(paletteSeeds, vars)
    return { id, name, sidebarLogo: palette.sidebarLogo, vars, report, adjustments }
  }

  if (mode === 'explicito') {
    const explicit = input.explicit
    if (!explicit?.light) throw new Error('createTheme: modo "explicito" exige explicit.light.')
    const light = translateExplicit(explicit.light)
    const dark = explicit.dark ? translateExplicit(explicit.dark) : deriveSimpleDark(light)
    const vars = { light, dark }
    const { report, adjustments } = buildReport(vars, explicit.enforceContrast ?? false)
    return { id, name, sidebarLogo: sidebarLogoFrom(vars), vars, report, adjustments }
  }

  // misto: sementes geram a base; sobrescritas do explicit vencem por cima.
  if (!input.seed) throw new Error('createTheme: modo "misto" exige seed.')
  const paletteSeeds = seedToPaletteSeeds(id, name, input.seed)
  const palette = createPalette(paletteSeeds)
  const vars = { light: { ...palette.light }, dark: { ...palette.dark } }
  // Reaproveita os hexes já normalizados por seedToPaletteSeeds, sem reanalisar a semente.
  const fromSeed = seedAdjustments(paletteSeeds, vars)
  const overrides = input.explicit
  if (overrides?.light) Object.assign(vars.light, translateExplicit(overrides.light))
  if (overrides?.dark) Object.assign(vars.dark, translateExplicit(overrides.dark))
  const { report, adjustments: overrideAdjustments } = buildReport(
    vars,
    overrides?.enforceContrast ?? false,
  )
  return {
    id,
    name,
    sidebarLogo: sidebarLogoFrom(vars),
    vars,
    report,
    adjustments: [...fromSeed, ...overrideAdjustments],
  }
}

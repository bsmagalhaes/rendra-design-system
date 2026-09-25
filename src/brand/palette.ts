/*
 * PALETA A PARTIR DE SEMENTES
 * ---------------------------
 * Uma paleta é só a cor da marca: 4 cores (primária e hover, secundária e hover) e o degradê
 * da marca (3 paradas, da luz ao fundo). Todo o resto é gerado aqui, com contraste WCAG AA
 * conferido e ajustado na geração: texto sobre cada cor, fundo suave, primária como texto,
 * foco, sidebar, degradês, gráficos, sombra e as superfícies do modo escuro.
 *
 * O que NÃO é da paleta (fica fixo em src/styles/theme.css, igual para todas):
 *   - neutros do modo claro (fundo #f5f6f7, card branco, borda, texto);
 *   - cores de sistema: sucesso, alerta, erro e informação;
 *   - fonte e raio, que são do modelo (Safira, Equilíbrio ou Aurora).
 *
 * Usos:
 *   - build: scripts/build-palettes.mjs gera src/styles/palettes.css com as paletas prontas
 *     (src/brand/palettes.ts);
 *   - tempo de execução (white label): applyPalette(sementes) injeta a paleta de um cliente
 *     sem build, com o mesmo resultado.
 *
 * Este arquivo não importa nada: o script de build o lê direto com o Node.
 */

export interface PaletteSeeds {
  /** Identificador usado em data-palette no <html> (ex.: "safira", "cliente-42"). */
  id: string
  /** Nome curto exibido nos seletores. */
  name: string
  primary: string
  primaryHover: string
  secondary: string
  secondaryHover: string
  /** Degradê da marca (sidebar, painel do login, destaque): luz, meio e fundo. */
  gradient: [string, string, string]
  /**
   * Texto sobre a primária e a secundária. 'auto' (padrão) escolhe o que passa AA (branco
   * ou escuro); 'light' força texto branco e escurece a cor até passar; 'dark', o contrário.
   */
  onPrimary?: TextOn
  onSecondary?: TextOn
}

export type TextOn = 'auto' | 'light' | 'dark'
export type PaletteVars = Record<string, string>

export interface Palette {
  seeds: PaletteSeeds
  light: PaletteVars
  dark: PaletteVars
  /** Logotipo adequado sobre a sidebar desta paleta. */
  sidebarLogo: 'light' | 'dark'
  /** Ajustes feitos para passar AA (ex.: "secundária escurecida de #EA600D para #C94F0A"). */
  adjustments: string[]
}

/* ------------------------------------------------------------------ cor */

type Rgb = [number, number, number]

const WHITE = '#ffffff'
const BLACK = '#000000'
/** Texto escuro padrão (o mesmo --foreground do theme.css). */
const INK = '#0b1d37'
/** Neutros fixos do modo claro, contra os quais a paleta é conferida. */
const LIGHT = { background: '#f5f6f7', card: '#ffffff' }
/** Texto claro padrão do modo escuro. */
const INK_DARK = '#e8eff8'

function toRgb(hex: string): Rgb {
  let h = hex.trim().replace('#', '')
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Cor inválida: ${hex} (use #RRGGBB)`)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb
}

function toHex([r, g, b]: Rgb) {
  return `#${[r, g, b]
    .map((c) =>
      Math.round(Math.min(255, Math.max(0, c)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

/** Mistura em sRGB, como color-mix(in srgb): t = quanto de b entra (0 a 1). */
export function mix(a: string, b: string, t: number) {
  const x = toRgb(a)
  const y = toRgb(b)
  return toHex([0, 1, 2].map((i) => x[i]! + (y[i]! - x[i]!) * t) as Rgb)
}

function luminance(hex: string) {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = toRgb(hex)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** Contraste WCAG entre duas cores #RRGGBB. */
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

const isDark = (hex: string) => contrast(hex, WHITE) >= contrast(hex, INK)

/**
 * Leva `fg` em direção ao preto (toward 'dark') ou ao branco ('light') até ter `min` de
 * contraste com `bg`. Devolve a própria cor se já passar.
 */
function reach(fg: string, bg: string, min: number, toward: 'dark' | 'light') {
  const end = toward === 'dark' ? BLACK : WHITE
  for (let t = 0; t <= 1.0001; t += 0.02) {
    const c = mix(fg, end, t)
    if (contrast(c, bg) >= min) return c
  }
  return end
}

const rgbTriplet = (hex: string) => toRgb(hex).join(' ')
const alpha = (hex: string, a: number) => `rgb(${rgbTriplet(hex)} / ${a})`

/* ------------------------------------------------------------------ geração */

/** Cor de preenchimento com o texto por cima, ajustando a cor quando o texto é forçado. */
function fill(color: string, on: TextOn, label: string, notes: string[]) {
  const base = color.toLowerCase()
  if (on === 'auto') {
    const text = isDark(base) ? WHITE : INK
    if (contrast(text, base) >= 4.5) return { fill: base, text }
    // Nenhum dos dois passa: escurece a cor para o branco passar.
    on = 'light'
  }
  const text = on === 'light' ? WHITE : INK
  const adjusted = reach(base, text, 4.5, on === 'light' ? 'dark' : 'light')
  if (adjusted !== base)
    notes.push(
      `${label}: ${base.toUpperCase()} ajustada para ${adjusted.toUpperCase()} (AA com texto ${on === 'light' ? 'branco' : 'escuro'})`,
    )
  return { fill: adjusted, text }
}

/** Gera as duas versões (claro e escuro) da paleta a partir das sementes. */
export function createPalette(seeds: PaletteSeeds): Palette {
  const notes: string[] = []
  const [g0, g1, g2] = seeds.gradient.map((c) => c.toLowerCase()) as [string, string, string]
  const P = seeds.primary.toLowerCase()
  const S = seeds.secondary.toLowerCase()

  const primary = fill(P, seeds.onPrimary ?? 'auto', 'Primária', notes)
  const primaryHover = fill(
    seeds.primaryHover,
    seeds.onPrimary ?? 'auto',
    'Hover da primária',
    notes,
  )
  const secondary = fill(S, seeds.onSecondary ?? 'auto', 'Secundária', notes)
  const secondaryHover = fill(
    seeds.secondaryHover,
    seeds.onSecondary ?? 'auto',
    'Hover da secundária',
    notes,
  )

  // Sidebar e degradê da marca: sempre coloridos, texto claro ou escuro conforme o fundo.
  const sidebarDark = isDark(g1)
  const sidebarText = sidebarDark ? mix(WHITE, g0, 0.06) : INK
  const sidebarFg = reach(sidebarText, g0, 7, sidebarDark ? 'light' : 'dark')
  const sidebarMuted = reach(mix(sidebarFg, g1, 0.3), g0, 4.5, sidebarDark ? 'light' : 'dark')
  // Item ativo: a primária, se ela aparece sobre a sidebar; senão, a secundária.
  // Indicador: a secundária, se ela aparece; senão, a primária.
  const active = contrast(P, g1) >= 2 ? P : S
  const indicator = reach(contrast(S, g1) >= 3 ? S : P, g1, 3, sidebarDark ? 'light' : 'dark')
  const brandGradient = `radial-gradient(120% 120% at 80% 0%, ${g0} 0%, ${g1} 45%, ${g2} 100%)`
  const onBrand = sidebarDark ? WHITE : INK

  const sidebar = {
    '--rendra-sidebar': g1,
    '--rendra-sidebar-image': brandGradient,
    '--rendra-sidebar-foreground': sidebarFg,
    '--rendra-sidebar-muted-foreground': sidebarMuted,
    '--rendra-sidebar-border': alpha(sidebarDark ? WHITE : INK, 0.14),
    '--rendra-sidebar-accent': alpha(sidebarDark ? WHITE : INK, 0.08),
    '--rendra-sidebar-active': alpha(active, 0.24),
    '--rendra-sidebar-active-foreground': onBrand,
    '--rendra-sidebar-indicator': indicator,
    '--rendra-gradient-brand': brandGradient,
    '--rendra-gradient-brand-foreground': onBrand,
    '--rendra-gradient-accent': `linear-gradient(90deg, ${P} 0%, ${S} 100%)`,
  }
  const brand = {
    '--rendra-primary': primary.fill,
    '--rendra-primary-foreground': primary.text,
    '--rendra-primary-hover': primaryHover.fill,
    '--rendra-primary-hover-foreground': primaryHover.text,
    '--rendra-secondary': secondary.fill,
    '--rendra-secondary-foreground': secondary.text,
    '--rendra-secondary-hover': secondaryHover.fill,
    '--rendra-secondary-hover-foreground': secondaryHover.text,
  }

  /* ---------- claro: sobre os neutros fixos (fundo #f5f6f7, card branco) */
  const softL = mix(P, WHITE, 0.9)
  const textL = reach(P, LIGHT.background, 4.5, 'dark')
  const light: PaletteVars = {
    ...brand,
    '--rendra-primary-soft': softL,
    '--rendra-primary-soft-foreground': reach(P, softL, 4.5, 'dark'),
    '--rendra-primary-text': textL,
    '--rendra-ring': textL,
    '--rendra-accent': mix(P, WHITE, 0.94),
    '--rendra-accent-foreground': INK,
    ...sidebar,
    '--rendra-gradient-soft': `linear-gradient(135deg, ${softL} 0%, ${LIGHT.card} 65%)`,
    '--rendra-chart-1': P,
    '--rendra-chart-2': S,
    '--rendra-chart-3': mix(P, WHITE, 0.45),
    '--rendra-chart-4': mix(P, BLACK, 0.35),
    '--rendra-chart-5': mix(S, BLACK, 0.3),
    '--rendra-shadow-color': rgbTriplet(g2),
  }

  /* ---------- escuro: superfícies tiradas do fundo do degradê, texto claro */
  // O brilho de cada superfície fica numa faixa fixa (contraste com o branco), para qualquer
  // degradê dar um escuro na medida: a cor vem do degradê, a luminosidade é sempre a mesma.
  const bgD = reach(g2, WHITE, 17.5, 'dark')
  const cardD = reach(mix(g2, g0, 0.14), WHITE, 15.5, 'dark')
  const popD = reach(mix(g2, g0, 0.2), WHITE, 14.5, 'dark')
  const mutedD = reach(mix(g2, g0, 0.26), WHITE, 13.5, 'dark')
  // Botões no escuro: a cor que some no fundo (menos de 3:1 com o card) fica mais clara,
  // e o texto por cima volta a ser escolhido para passar AA.
  const onDark = (color: string, label: string) => {
    if (contrast(color, cardD) >= 3) return fill(color, 'auto', label, [])
    return fill(reach(color, cardD, 3, 'light'), 'auto', label, [])
  }
  const pD = onDark(primary.fill, 'Primária')
  const phD = onDark(primaryHover.fill, 'Hover da primária')
  const sD = onDark(secondary.fill, 'Secundária')
  const shD = onDark(secondaryHover.fill, 'Hover da secundária')
  const brandDark = {
    '--rendra-primary': pD.fill,
    '--rendra-primary-foreground': pD.text,
    '--rendra-primary-hover': phD.fill,
    '--rendra-primary-hover-foreground': phD.text,
    '--rendra-secondary': sD.fill,
    '--rendra-secondary-foreground': sD.text,
    '--rendra-secondary-hover': shD.fill,
    '--rendra-secondary-hover-foreground': shD.text,
  }
  const softD = mix(cardD, P, 0.28)
  const textD = reach(mix(P, WHITE, 0.2), cardD, 4.5, 'light')
  const fgD = reach(INK_DARK, popD, 12, 'light')
  const dark: PaletteVars = {
    '--rendra-background': bgD,
    '--rendra-background-image': `radial-gradient(120% 80% at 80% 0%, ${reach(mix(g0, bgD, 0.45), WHITE, 12, 'dark')} 0%, ${reach(mix(g1, bgD, 0.4), WHITE, 16, 'dark')} 40%, ${bgD} 100%)`,
    '--rendra-foreground': fgD,
    '--rendra-card': cardD,
    '--rendra-card-foreground': fgD,
    '--rendra-popover': popD,
    '--rendra-popover-foreground': fgD,
    '--rendra-muted': mutedD,
    '--rendra-muted-foreground': reach(mix(fgD, mutedD, 0.35), mutedD, 4.5, 'light'),
    '--rendra-border': mix(cardD, WHITE, 0.12),
    '--rendra-input': reach(mix(cardD, WHITE, 0.32), cardD, 3, 'light'),
    '--rendra-field': mix(g2, BLACK, 0.1),
    '--rendra-overlay': alpha(mix(g2, BLACK, 0.6), 0.7),
    ...brandDark,
    '--rendra-primary-soft': softD,
    '--rendra-primary-soft-foreground': reach(mix(P, WHITE, 0.45), softD, 4.5, 'light'),
    '--rendra-primary-text': textD,
    '--rendra-ring': textD,
    '--rendra-accent': mix(cardD, WHITE, 0.06),
    '--rendra-accent-foreground': fgD,
    ...sidebar,
    '--rendra-sidebar': mix(g2, BLACK, 0.1),
    '--rendra-gradient-soft': `linear-gradient(135deg, ${softD} 0%, ${cardD} 65%)`,
    '--rendra-chart-1': reach(P, cardD, 3, 'light'),
    '--rendra-chart-2': reach(S, cardD, 3, 'light'),
    '--rendra-chart-3': mix(P, WHITE, 0.45),
    '--rendra-chart-4': mix(P, WHITE, 0.72),
    '--rendra-chart-5': reach(mix(S, WHITE, 0.3), cardD, 3, 'light'),
    '--rendra-shadow-color': '0 0 0',
  }

  return { seeds, light, dark, sidebarLogo: sidebarDark ? 'dark' : 'light', adjustments: notes }
}

/* ------------------------------------------------------------------ CSS */

const block = (selector: string, vars: PaletteVars) =>
  `${selector} {\n${Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}\n`

/**
 * CSS da paleta. `isDefault` também aplica a paleta quando o <html> ainda não tem
 * data-palette (primeira pintura).
 */
export function paletteCss(palette: Palette, isDefault = false) {
  const id = palette.seeds.id
  const light = isDefault
    ? `:root:not([data-palette]),\n:root[data-palette='${id}']`
    : `:root[data-palette='${id}']`
  const dark = isDefault
    ? `:root:not([data-palette]).dark,\n:root[data-palette='${id}'].dark`
    : `:root[data-palette='${id}'].dark`
  const notes = palette.adjustments.length
    ? `/* Ajustes de contraste: ${palette.adjustments.join('; ')}. */\n`
    : ''
  return `/* ${palette.seeds.name} */\n${notes}${block(light, palette.light)}\n${block(dark, palette.dark)}`
}

/**
 * White label em tempo de execução: gera a paleta de um cliente e a injeta na página
 * (um <style> por paleta), sem build. Depois é só usar data-palette com o id dela.
 * Devolve a paleta gerada, com os ajustes de contraste feitos.
 */
export function applyPalette(seeds: PaletteSeeds, doc: Document = document) {
  const palette = createPalette(seeds)
  const attr = 'data-palette-runtime'
  let style = doc.head.querySelector<HTMLStyleElement>(`style[${attr}="${seeds.id}"]`)
  if (!style) {
    style = doc.createElement('style')
    style.setAttribute(attr, seeds.id)
    doc.head.appendChild(style)
  }
  style.textContent = paletteCss(palette)
  return palette
}

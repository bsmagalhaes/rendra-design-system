import type { ShellLayout } from './layout'

/*
 * CÓDIGOS DE MODELO
 * -----------------
 * Cada escolha visual tem um código curto, mostrado na galeria e usado no briefing:
 *   T = tema (formato e fonte), C = cores (paleta), M = menu (navegação e submenu).
 * Um código completo junta os três: "T1-C4-M5" = Safira, cores Ardósia, menu superior.
 * Também vale só uma parte ("C4", "T2-M6"): o que faltar segue o padrão do projeto.
 * No demo, ?codigo=T1-C4-M5 no endereço aplica o modelo.
 */

export interface ThemeCode {
  code: `T${number}`
  brand: string
  name: string
  description: string
}
export interface ColorCode {
  code: `C${number}`
  palette: string
  name: string
  description: string
}
export interface MenuCode {
  code: `M${number}`
  name: string
  description: string
  layout: Partial<ShellLayout>
}

export const themeCodes: ThemeCode[] = [
  { code: 'T1', brand: 'safira', name: 'Safira', description: 'Tudo quadrado, preciso.' },
  {
    code: 'T2',
    brand: 'equilibrio',
    name: 'Equilíbrio',
    description: 'Cantos levemente arredondados, o mais neutro.',
  },
  { code: 'T3', brand: 'aurora', name: 'Aurora', description: '100% arredondado, amigável.' },
]

export const colorCodes: ColorCode[] = [
  { code: 'C1', palette: 'safira', name: 'Safira', description: 'Azul e verde.' },
  { code: 'C2', palette: 'equilibrio', name: 'Equilíbrio', description: 'Violeta e ciano.' },
  { code: 'C3', palette: 'aurora', name: 'Aurora', description: 'Verde-petróleo e laranja.' },
  { code: 'C4', palette: 'ardosia', name: 'Ardósia', description: 'Grafite e laranja.' },
]

export const menuCodes: MenuCode[] = [
  {
    code: 'M1',
    name: 'Lateral recolhida, submenu em segunda barra',
    description: 'Só ícones, abre por cima ao passar o mouse; subitens numa segunda barra.',
    layout: { navigation: 'sidebar', sidebar: 'collapsed', expandOnHover: true, submenu: 'panel' },
  },
  {
    code: 'M2',
    name: 'Lateral recolhida, submenu na sidebar',
    description: 'Só ícones, abre por cima ao passar o mouse; subitens expandem na própria barra.',
    layout: {
      navigation: 'sidebar',
      sidebar: 'collapsed',
      expandOnHover: true,
      submenu: 'inline',
    },
  },
  {
    code: 'M3',
    name: 'Lateral expandida, submenu em segunda barra',
    description: 'Ícones e rótulos sempre visíveis; subitens numa segunda barra.',
    layout: { navigation: 'sidebar', sidebar: 'expanded', submenu: 'panel' },
  },
  {
    code: 'M4',
    name: 'Lateral expandida, submenu na sidebar',
    description: 'Ícones e rótulos sempre visíveis; subitens expandem na própria barra.',
    layout: { navigation: 'sidebar', sidebar: 'expanded', submenu: 'inline' },
  },
  {
    code: 'M5',
    name: 'Menu superior com lista suspensa',
    description: 'Menu no header; cada item com subitens abre uma lista.',
    layout: { navigation: 'topbar', topbarSubmenu: 'dropdown' },
  },
  {
    code: 'M6',
    name: 'Menu superior com mega menu',
    description: 'Menu no header; os grupos abrem um painel com seções e descrições.',
    layout: { navigation: 'topbar', topbarSubmenu: 'mega' },
  },
]

export interface ModelChoice {
  theme?: ThemeCode
  color?: ColorCode
  menu?: MenuCode
}

/** Lê um código como "T1-C4-M5", "t2 m6" ou "C3". Partes desconhecidas são ignoradas. */
export function parseModelCode(input: string): ModelChoice {
  const parts = input.toUpperCase().match(/[TCM]\d+/g) ?? []
  const choice: ModelChoice = {}
  for (const p of parts) {
    if (p.startsWith('T')) choice.theme = themeCodes.find((t) => t.code === p) ?? choice.theme
    if (p.startsWith('C')) choice.color = colorCodes.find((c) => c.code === p) ?? choice.color
    if (p.startsWith('M')) choice.menu = menuCodes.find((m) => m.code === p) ?? choice.menu
  }
  return choice
}

/** Monta o código na ordem tema, cores, menu: formatModelCode({ ... }) = "T1-C4-M5". */
export function formatModelCode(choice: ModelChoice) {
  return [choice.theme?.code, choice.color?.code, choice.menu?.code].filter(Boolean).join('-')
}

/** Código do que está aplicado agora (modelo, paleta e layout). */
export function currentModelCode(brand: string, palette: string, layout: ShellLayout) {
  const theme = themeCodes.find((t) => t.brand === brand)
  const color = colorCodes.find((c) => c.palette === palette)
  const menu = menuCodes.find((m) =>
    Object.entries(m.layout).every(([k, v]) => layout[k as keyof ShellLayout] === v),
  )
  return formatModelCode({ theme, color, menu })
}

/**
 * Grava o modelo nas preferências do navegador (as mesmas do menu do avatar). Usado pelo
 * ?codigo= do endereço e pelo botão "Ver no demo" da galeria. Devolve false se o código
 * não tiver nenhuma parte válida.
 */
export function applyModelCode(input: string) {
  const choice = parseModelCode(input)
  if (!choice.theme && !choice.color && !choice.menu) return false
  try {
    if (choice.theme) localStorage.setItem('ui-brand', choice.theme.brand)
    // Tema sem cores: usa as cores do próprio tema.
    const palette = choice.color?.palette ?? choice.theme?.brand
    if (palette) localStorage.setItem('ui-palette', palette)
    if (choice.menu) {
      const current = JSON.parse(localStorage.getItem('ui-shell-layout') ?? '{}') as object
      localStorage.setItem('ui-shell-layout', JSON.stringify({ ...current, ...choice.menu.layout }))
    }
  } catch {
    return false
  }
  return true
}

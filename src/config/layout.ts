/*
 * LAYOUT DO APPSHELL
 * Valores padrão do projeto. Cada um também pode ser passado como prop no <AppShell>.
 * No mobile (< 768px) a navegação é sempre gaveta + barra inferior, qualquer que seja o layout.
 */

export interface ShellLayout {
  /** Menu lateral (sidebar) ou superior (topbar, no header). */
  navigation: 'sidebar' | 'topbar'
  /** Sidebar recolhida (só ícones) ou expandida (ícones e rótulos). */
  sidebar: 'collapsed' | 'expanded'
  /** Com a sidebar recolhida, abre por cima do conteúdo ao passar o mouse ou focar pelo teclado. */
  expandOnHover: boolean
  /**
   * Como abrir itens com submenu:
   *   panel   abre uma segunda barra lateral com os subitens
   *   inline  expande os subitens dentro da própria sidebar
   */
  submenu: 'panel' | 'inline'
  /**
   * Submenu do menu superior:
   *   dropdown  lista suspensa navegável por item
   *   mega      mega menu com seções (grupos do navigation.ts) e menus com descrição
   */
  topbarSubmenu: 'dropdown' | 'mega'
  /** Barra de navegação inferior no mobile (até 4 itens marcados em navigation.ts). */
  bottomNav: boolean
}

export const defaultShellLayout: ShellLayout = {
  navigation: 'sidebar',
  sidebar: 'collapsed',
  expandOnHover: true,
  submenu: 'panel',
  topbarSubmenu: 'dropdown',
  bottomNav: true,
}

export const layoutOptions = {
  navigation: [
    { value: 'sidebar', label: 'Menu lateral' },
    { value: 'topbar', label: 'Menu superior' },
  ],
  sidebar: [
    { value: 'collapsed', label: 'Recolhida (só ícones)' },
    { value: 'expanded', label: 'Expandida' },
  ],
  submenu: [
    { value: 'panel', label: 'Submenu em segunda barra' },
    { value: 'inline', label: 'Submenu dentro da sidebar' },
  ],
  topbarSubmenu: [
    { value: 'dropdown', label: 'Submenu navegável' },
    { value: 'mega', label: 'Mega menu' },
  ],
} as const

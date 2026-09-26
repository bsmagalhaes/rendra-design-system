// @vitest-environment jsdom
import { BarChart3 } from 'lucide-react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { RendraProvider } from '@/components/rendra-provider'
import { MegaMenu } from './mega-menu'
import { ShellContext, type ShellContextValue } from './shell-context'
import type { NavGroup } from './types'

/*
 * MegaMenu sem @/config e sem react-router: o menu vem da prop `navigation` do AppShell,
 * via ShellContext. Títulos e rota diferentes dos antigos ("Geral", "Operação", "/kanban"),
 * para provar que vêm da prop.
 */
const navigation: NavGroup[] = [
  {
    title: 'Seção de análise',
    description: 'Indicadores da operação.',
    items: [
      {
        title: 'Painel de métricas',
        to: '/metricas',
        icon: BarChart3,
        description: 'Números da semana.',
      },
    ],
  },
]

function fakeShellValue(): ShellContextValue {
  return {
    layout: {
      navigation: 'topbar',
      sidebar: 'collapsed',
      expandOnHover: true,
      submenu: 'panel',
      topbarSubmenu: 'mega',
      bottomNav: true,
    },
    setLayout: () => {},
    applyLayout: () => {},
    resetLayout: () => {},
    mobileNavOpen: false,
    setMobileNavOpen: () => {},
    footerSlot: null,
    pageHelp: null,
    setPageHelp: () => {},
    searchOpen: false,
    setSearchOpen: () => {},
    navigation,
    bottomNavItems: [],
    navigationTargets: [],
    user: { name: 'Camila Duarte' },
    userMenuItems: [],
    onLogout: undefined,
    homeLabel: 'Painel inicial',
    quickActions: [],
    notifications: undefined,
  }
}

function renderMegaMenu(currentPath: string) {
  render(
    <RendraProvider
      linkComponent={({ to, children, ...rest }) => (
        <a href={to} {...rest}>
          {children}
        </a>
      )}
      useCurrentPath={() => currentPath}
      navigate={() => {}}
      goBack={() => {}}
    >
      <ShellContext.Provider value={fakeShellValue()}>
        <MegaMenu />
      </ShellContext.Provider>
    </RendraProvider>,
  )
}

describe('MegaMenu', () => {
  it('mostra os grupos do menu a partir da prop navigation, não de um literal fixo', () => {
    renderMegaMenu('/metricas')
    expect(screen.getByText('Seção de análise')).toBeInTheDocument()
  })

  it('abre o grupo e mostra os itens (com a rota vinda da prop)', async () => {
    renderMegaMenu('/metricas')
    const user = userEvent.setup()
    await user.click(screen.getByText('Seção de análise'))
    const link = await screen.findByRole('link', { name: /Painel de métricas/ })
    expect(link).toHaveAttribute('href', '/metricas')
  })
})

// @vitest-environment jsdom
import { ClipboardList, FileText, Settings } from 'lucide-react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { activeBrand, availableBrands, availablePalettes, BrandProvider } from '@/brand'
import { RendraProvider } from '@/components/rendra-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getNavigationTargets } from './navigation-utils'
import { ShellContext, type ShellContextValue } from './shell-context'
import { Sidebar } from './sidebar'
import type { NavGroup } from './types'

/*
 * Sidebar sem @/config e sem react-router: menu, usuário e logout vêm do ShellContext
 * (prop do AppShell). Valores diferentes dos antigos ("Ana Ribeiro", "/login"), para
 * provar que vêm da prop.
 */
const navigation: NavGroup[] = [
  {
    title: 'Grupo',
    items: [
      { title: 'Relatórios', to: '/relatorios', icon: FileText },
      { title: 'Configuração da conta', to: '/conta', icon: Settings },
    ],
  },
]

const navigationWithChildren: NavGroup[] = [
  {
    title: 'Grupo',
    items: [
      { title: 'Relatórios', to: '/relatorios', icon: FileText, badge: 3 },
      {
        title: 'Cadastros',
        icon: ClipboardList,
        children: [{ title: 'Novo item de teste', to: '/novo-item-de-teste' }],
      },
    ],
  },
]

const expandedLayout: ShellContextValue['layout'] = {
  navigation: 'sidebar',
  sidebar: 'expanded',
  expandOnHover: false,
  submenu: 'panel',
  topbarSubmenu: 'dropdown',
  bottomNav: true,
}

function fakeShellValue(overrides: Partial<ShellContextValue> = {}): ShellContextValue {
  return {
    layout: expandedLayout,
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
    navigationTargets: getNavigationTargets(navigation),
    user: { name: 'Camila Duarte', email: 'camila.duarte@exemplo.com.br' },
    userMenuItems: [],
    onLogout: undefined,
    homeLabel: 'Painel inicial',
    quickActions: [],
    notifications: undefined,
    ...overrides,
  }
}

function renderSidebar(currentPath: string, overrides: Partial<ShellContextValue> = {}) {
  render(
    <BrandProvider
      brands={availableBrands}
      palettes={availablePalettes}
      defaultBrand={activeBrand}
      forcedMode="light"
    >
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
        <TooltipProvider>
          <ShellContext.Provider value={fakeShellValue(overrides)}>
            <Sidebar />
          </ShellContext.Provider>
        </TooltipProvider>
      </RendraProvider>
    </BrandProvider>,
  )
}

describe('Sidebar', () => {
  it('mostra o usuário (prop), não um literal fixo', () => {
    renderSidebar('/relatorios')
    expect(screen.getByText('Camila Duarte')).toBeInTheDocument()
    expect(screen.getByText('camila.duarte@exemplo.com.br')).toBeInTheDocument()
  })

  it('Sair chama onLogout (prop), não navega para uma rota fixa', async () => {
    const onLogout = vi.fn()
    renderSidebar('/relatorios', { onLogout })
    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Sair'))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  it('marca ativo só o item do caminho atual (navigationTargets vem da prop navigation)', () => {
    renderSidebar('/conta')
    expect(screen.getByRole('link', { name: 'Configuração da conta' })).toHaveClass(
      'bg-sidebar-active',
    )
    expect(screen.getByRole('link', { name: 'Relatórios' })).not.toHaveClass('bg-sidebar-active')
  })

  it('sidebar compacta com submenu em painel: abre e fecha pelo X', async () => {
    renderSidebar('/relatorios', {
      layout: { ...expandedLayout, sidebar: 'collapsed', submenu: 'panel' },
      navigation: navigationWithChildren,
      navigationTargets: getNavigationTargets(navigationWithChildren),
    })
    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Cadastros'))
    expect(await screen.findByRole('region', { name: 'Submenu Cadastros' })).toBeInTheDocument()
    expect(screen.getByText('Novo item de teste')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Fechar submenu'))
    expect(screen.queryByRole('region', { name: 'Submenu Cadastros' })).not.toBeInTheDocument()
  })

  it('sidebar compacta com submenu inline: item com children vira menu suspenso ao lado', async () => {
    renderSidebar('/relatorios', {
      layout: { ...expandedLayout, sidebar: 'collapsed', submenu: 'inline' },
      navigation: navigationWithChildren,
      navigationTargets: getNavigationTargets(navigationWithChildren),
    })
    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Cadastros'))
    expect(await screen.findByText('Novo item de teste')).toBeInTheDocument()
  })

  it('gaveta mobile (mobileNavOpen) mostra o submenu inline expandido', () => {
    renderSidebar('/novo-item-de-teste', {
      layout: { ...expandedLayout, navigation: 'topbar' },
      mobileNavOpen: true,
      navigation: navigationWithChildren,
      navigationTargets: getNavigationTargets(navigationWithChildren),
    })
    expect(screen.getByText('Novo item de teste')).toBeInTheDocument()
  })
})

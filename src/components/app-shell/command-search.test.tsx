// @vitest-environment jsdom
import { LayoutDashboard, Plus } from 'lucide-react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { activeBrand, availableBrands, availablePalettes, BrandProvider } from '@/brand'
import { RendraProvider } from '@/components/rendra-provider'
import { CommandSearch } from './command-search'
import { ShellContext, type ShellContextValue } from './shell-context'

/** Só o que o CommandSearch usa do shell: a busca já aberta, os destinos e as ações rápidas. */
function fakeShellValue(setSearchOpen: (open: boolean) => void): ShellContextValue {
  return {
    layout: {} as ShellContextValue['layout'],
    setLayout: () => {},
    applyLayout: () => {},
    resetLayout: () => {},
    mobileNavOpen: false,
    setMobileNavOpen: () => {},
    footerSlot: null,
    pageHelp: null,
    setPageHelp: () => {},
    searchOpen: true,
    setSearchOpen,
    navigation: [],
    bottomNavItems: [],
    navigationTargets: [{ title: 'Painel', to: '/', group: 'Geral', icon: LayoutDashboard }],
    user: { name: 'Ana Ribeiro' },
    userMenuItems: [],
    onLogout: undefined,
    homeLabel: 'Início',
    quickActions: [{ label: 'Novo cliente', to: '/clientes/novo', icon: Plus }],
    notifications: undefined,
  }
}

/** Renderiza o CommandSearch sem react-router: navegar vem de um fake do RendraProvider. */
function renderCommandSearch() {
  const navigate = vi.fn()
  const setSearchOpen = vi.fn()
  render(
    <BrandProvider
      brands={availableBrands}
      palettes={availablePalettes}
      defaultBrand={activeBrand}
      forcedMode="light"
    >
      <RendraProvider
        linkComponent={() => null}
        useCurrentPath={() => '/'}
        navigate={navigate}
        goBack={() => {}}
      >
        <ShellContext.Provider value={fakeShellValue(setSearchOpen)}>
          <CommandSearch />
        </ShellContext.Provider>
      </RendraProvider>
    </BrandProvider>,
  )
  return { navigate, setSearchOpen }
}

describe('CommandSearch', () => {
  it('sem react-router: navega para uma ação rápida (prop quickActions) e fecha a busca', async () => {
    const { navigate, setSearchOpen } = renderCommandSearch()
    const action = await screen.findByText('Novo cliente')
    await userEvent.click(action)
    expect(navigate).toHaveBeenCalledWith('/clientes/novo')
    expect(setSearchOpen).toHaveBeenCalledWith(false)
  })

  it('sem react-router: navega para uma tela do menu (prop navigationTargets)', async () => {
    const { navigate } = renderCommandSearch()
    const target = await screen.findByText('Painel')
    await userEvent.click(target)
    expect(navigate).toHaveBeenCalledWith('/')
  })

  it('sem quickActions, a busca ainda mostra a troca de tema', async () => {
    const setSearchOpen = vi.fn()
    render(
      <BrandProvider
        brands={availableBrands}
        palettes={availablePalettes}
        defaultBrand={activeBrand}
        forcedMode="light"
      >
        <RendraProvider
          linkComponent={() => null}
          useCurrentPath={() => '/'}
          navigate={() => {}}
          goBack={() => {}}
        >
          <ShellContext.Provider value={{ ...fakeShellValue(setSearchOpen), quickActions: [] }}>
            <CommandSearch />
          </ShellContext.Provider>
        </RendraProvider>
      </BrandProvider>,
    )
    expect(await screen.findByText('Usar modo escuro')).toBeInTheDocument()
    expect(screen.queryByText('Novo cliente')).not.toBeInTheDocument()
  })
})

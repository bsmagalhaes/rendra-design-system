// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { activeBrand, availableBrands, availablePalettes, BrandProvider } from '@/brand'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Notifications } from './notifications'
import { ShellContext, type ShellContextValue } from './shell-context'

/*
 * Notifications lê tudo do ShellContext (prop `notifications` do AppShell): sem Provider
 * com essa chave preenchida, o sino não existe. Os itens e os dois retornos de chamada
 * (marcar todas, marcar uma) vêm sempre da prop, nunca de um mock interno.
 */
const baseLayout: ShellContextValue['layout'] = {
  navigation: 'sidebar',
  sidebar: 'collapsed',
  expandOnHover: true,
  submenu: 'panel',
  topbarSubmenu: 'dropdown',
  bottomNav: true,
}

function fakeShellValue(overrides: Partial<ShellContextValue> = {}): ShellContextValue {
  return {
    layout: baseLayout,
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
    navigation: [],
    bottomNavItems: [],
    navigationTargets: [],
    user: { name: 'Usuária de teste' },
    userMenuItems: [],
    onLogout: undefined,
    homeLabel: 'Início',
    quickActions: [],
    notifications: undefined,
    ...overrides,
  }
}

function renderNotifications(overrides: Partial<ShellContextValue> = {}) {
  return render(
    <BrandProvider
      brands={availableBrands}
      palettes={availablePalettes}
      defaultBrand={activeBrand}
      forcedMode="light"
    >
      <TooltipProvider>
        <ShellContext.Provider value={fakeShellValue(overrides)}>
          <Notifications />
        </ShellContext.Provider>
      </TooltipProvider>
    </BrandProvider>,
  )
}

describe('Notifications', () => {
  it('sem a prop notifications no contexto, não renderiza nada', () => {
    const { container } = renderNotifications()
    expect(container).toBeEmptyDOMElement()
  })

  it('marcar uma notificação como lida remove o indicador dela e diminui a contagem total de não lidas', async () => {
    const onItemClick = vi.fn()
    renderNotifications({
      notifications: {
        items: [
          { id: '1', type: 'info', title: 'Fatura vencendo', time: 'agora', read: false },
          { id: '2', type: 'success', title: 'Pagamento recebido', time: 'ontem', read: false },
        ],
        onItemClick,
      },
    })
    const user = userEvent.setup()
    expect(screen.getByLabelText('Notificações, 2 não lidas')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Notificações, 2 não lidas'))
    const itemButton = (await screen.findByText('Fatura vencendo')).closest('button')
    if (!itemButton) throw new Error('botão da notificação não encontrado')
    expect(within(itemButton).getByText('Não lida')).toBeInTheDocument()

    await user.click(itemButton)
    expect(onItemClick).toHaveBeenCalledWith('1')
    expect(within(itemButton).queryByText('Não lida')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Notificações, 1 não lidas')).toBeInTheDocument()
  })

  it('marcar todas como lidas some com o indicador do sino (efeito visível, não só o callback)', async () => {
    const onMarkAllRead = vi.fn()
    renderNotifications({
      notifications: {
        items: [
          {
            id: '1',
            type: 'warning',
            title: 'Assinatura expira em breve',
            time: 'agora',
            read: false,
          },
        ],
        onMarkAllRead,
      },
    })
    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Notificações, 1 não lidas'))
    await user.click(screen.getByRole('button', { name: 'Marcar como lidas' }))
    expect(onMarkAllRead).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Notificações')).toBeInTheDocument()
    expect(screen.queryByLabelText(/Notificações, \d/)).not.toBeInTheDocument()
  })
})

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { defaultShellLayout, type ShellLayout } from '@/config/layout'
import { useRouteMeta } from '@/hooks/use-route-meta'
import { bottomNavItems, resolveActiveTo } from '@/config/navigation'
import { cn } from '@/lib/cn'
import { CommandSearch } from './command-search'
import { Header } from './header'
import { ShellContext, type ShellContextValue } from './shell-context'
import { Sidebar } from './sidebar'

const LAYOUT_KEY = 'ui-shell-layout'

function readUserLayout(): Partial<ShellLayout> {
  try {
    return JSON.parse(localStorage.getItem(LAYOUT_KEY) ?? '{}') as Partial<ShellLayout>
  } catch {
    return {}
  }
}

/**
 * Barra inferior do celular: até 4 atalhos e, no centro, o botão redondo do menu, subindo
 * metade acima da linha da barra, ao alcance do polegar. Com ela, o header não precisa do
 * botão de menu e sobra espaço para a seta de voltar.
 */
function BottomNav({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation()
  const active = resolveActiveTo(pathname)
  const item = (entry: (typeof bottomNavItems)[number]) => {
    const to = entry.to ?? entry.children?.[0]?.to ?? '/'
    const Icon = entry.icon
    return (
      <li key={entry.title}>
        <NavLink
          to={to}
          end={to === '/'}
          className={cn(
            'flex min-h-touch flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
            to === active || entry.children?.some((c) => c.to === active)
              ? 'text-primary-text'
              : 'text-muted-foreground active:text-foreground',
          )}
        >
          <Icon className="size-icon-md" aria-hidden />
          <span className="max-w-full truncate px-1">{entry.shortTitle ?? entry.title}</span>
        </NavLink>
      </li>
    )
  }
  const half = Math.ceil(bottomNavItems.length / 2)
  return (
    <nav
      aria-label="Navegação rápida"
      className="relative shrink-0 border-t bg-card pb-safe-inset md:hidden"
    >
      <ul className="grid grid-cols-5 items-end">
        {bottomNavItems.slice(0, half).map(item)}
        <li className="flex justify-center">
          <button
            type="button"
            onClick={onMenu}
            aria-label="Abrir menu"
            className="-mt-6 mb-1 flex size-12 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-card transition-transform outline-none focus-visible:ring-ring active:scale-95"
          >
            <Menu className="size-icon-lg" aria-hidden />
          </button>
        </li>
        {bottomNavItems.slice(half).map(item)}
      </ul>
    </nav>
  )
}

export type AppShellProps = Partial<ShellLayout> & {
  /**
   * Permite que o usuário troque o layout pelo menu do avatar (guardado no navegador).
   * Desligue em produção se o layout do projeto for fixo.
   */
  userConfigurable?: boolean
}

/**
 * Estrutura da aplicação. Uma única área de rolagem: o <main>.
 * Layout = padrão de src/config/layout.ts, sobrescrito pelas props e, se permitido,
 * pela escolha do usuário.
 */
export function AppShell({ userConfigurable = true, ...props }: AppShellProps) {
  const [userLayout, setUserLayout] = useState<Partial<ShellLayout>>(() =>
    userConfigurable ? readUserLayout() : {},
  )
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [footerSlot, setFooterSlot] = useState<HTMLElement | null>(null)
  const [pageHelp, setPageHelp] = useState<ReactNode>(null)
  const { pathname } = useLocation()
  useRouteMeta()
  const mainRef = useRef<HTMLElement>(null)

  const propsKey = JSON.stringify(props)
  const layout = useMemo<ShellLayout>(
    () => ({
      ...defaultShellLayout,
      ...(JSON.parse(propsKey) as Partial<ShellLayout>),
      ...userLayout,
    }),
    [propsKey, userLayout],
  )

  // Troca de tela: fecha a gaveta e volta a rolagem ao topo.
  useEffect(() => {
    setMobileNavOpen(false)
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const value = useMemo<ShellContextValue>(() => {
    const persist = (next: Partial<ShellLayout>) => {
      setUserLayout(next)
      try {
        localStorage.setItem(LAYOUT_KEY, JSON.stringify(next))
      } catch {
        // segue só em memória
      }
    }
    return {
      layout,
      setLayout: (key, v) => persist({ ...userLayout, [key]: v }),
      applyLayout: (partial) => persist({ ...userLayout, ...partial }),
      resetLayout: () => persist({}),
      mobileNavOpen,
      setMobileNavOpen,
      searchOpen,
      setSearchOpen,
      footerSlot,
      pageHelp,
      setPageHelp,
    }
  }, [layout, userLayout, mobileNavOpen, searchOpen, footerSlot, pageHelp])

  return (
    <ShellContext.Provider value={value}>
      <TooltipProvider>
        <div className="flex h-dvh overflow-hidden">
          <a
            href="#conteudo"
            className="sr-only z-50 rounded-control bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
          >
            Pular para o conteúdo
          </a>
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <main
              ref={mainRef}
              id="conteudo"
              tabIndex={-1}
              // relative: elementos absolutos do conteúdo (texto só para leitor de tela, inputs
              // ocultos) ficam presos à rolagem do main. Sem isso eles esticam o <html>, e um
              // link com #âncora rola a página inteira, deixando um vão em branco embaixo.
              className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none"
            >
              <Outlet />
            </main>
            {/* Rodapé fixo das telas de formulário (ActionBar sticky). Vazio, não ocupa espaço. */}
            <div ref={setFooterSlot} className="shrink-0 empty:hidden" />
            {layout.bottomNav && <BottomNav onMenu={() => setMobileNavOpen(true)} />}
          </div>
        </div>
        <CommandSearch />
      </TooltipProvider>
    </ShellContext.Provider>
  )
}

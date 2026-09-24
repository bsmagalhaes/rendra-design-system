import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { defaultShellLayout, type ShellLayout } from '@/config/layout'
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

function BottomNav() {
  const { pathname } = useLocation()
  const active = resolveActiveTo(pathname)
  return (
    <nav
      aria-label="Navegação rápida"
      className="shrink-0 border-t bg-card pb-safe-inset md:hidden"
    >
      <ul className="grid grid-cols-4">
        {bottomNavItems.map((item) => {
          const to = item.to ?? item.children?.[0]?.to ?? '/'
          const Icon = item.icon
          return (
            <li key={item.title}>
              <NavLink
                to={to}
                end={to === '/'}
                className={cn(
                  'flex min-h-touch flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
                  to === active || item.children?.some((c) => c.to === active)
                    ? 'text-primary-text'
                    : 'text-muted-foreground active:text-foreground',
                )}
              >
                <Icon className="size-icon-md" aria-hidden />
                <span className="max-w-full truncate px-1">{item.shortTitle ?? item.title}</span>
              </NavLink>
            </li>
          )
        })}
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
  const { pathname } = useLocation()
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
      resetLayout: () => persist({}),
      mobileNavOpen,
      setMobileNavOpen,
      searchOpen,
      setSearchOpen,
    }
  }, [layout, userLayout, mobileNavOpen, searchOpen])

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
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none"
            >
              <Outlet />
            </main>
            {layout.bottomNav && <BottomNav />}
          </div>
        </div>
        <CommandSearch />
      </TooltipProvider>
    </ShellContext.Provider>
  )
}

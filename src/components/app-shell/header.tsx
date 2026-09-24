import {
  ChevronDown,
  LayoutTemplate,
  LogOut,
  Menu,
  Monitor,
  Moon,
  PanelLeft,
  Palette,
  Search,
  Settings,
  Sun,
  User,
} from 'lucide-react'
import { Link, NavLink, useLocation, useMatches, useNavigate, type UIMatch } from 'react-router'
import { useBrand } from '@/brand'
import type { ColorMode } from '@/brand/brand-context'
import { Avatar } from '@/components/ui/avatar'
import { BrandLogo } from '@/components/ui/brand-logo'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip } from '@/components/ui/tooltip'
import { layoutOptions, type ShellLayout } from '@/config/layout'
import { currentUser, navigation } from '@/config/navigation'
import { cn } from '@/lib/cn'
import { shapeLabels } from '@/lib/shape'
import { MegaMenu } from './mega-menu'
import { Notifications } from './notifications'
import { useShell } from './shell-context'

/** Metadados de rota lidos pelo header: handle: { crumb: 'Clientes' }. */
export interface RouteHandle {
  crumb?: string | ((params: Record<string, string | undefined>) => string)
}

function useCrumbs(): BreadcrumbItem[] {
  const matches = useMatches() as UIMatch<unknown, RouteHandle | undefined>[]
  return matches
    .filter((m) => m.handle?.crumb)
    .map((m, i, all) => {
      const c = m.handle!.crumb!
      return {
        label: typeof c === 'function' ? c(m.params) : c,
        to: i < all.length - 1 ? m.pathname : undefined,
      }
    })
}

const modes: { value: ColorMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
]

function ModeItems() {
  const { mode, setMode } = useBrand()
  return (
    <DropdownMenuRadioGroup value={mode} onValueChange={(v) => setMode(v as ColorMode)}>
      {modes.map((m) => (
        <DropdownMenuRadioItem key={m.value} value={m.value}>
          <m.icon aria-hidden />
          {m.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )
}

function LayoutItems() {
  const { layout, setLayout, resetLayout } = useShell()
  const radio = <K extends 'navigation' | 'sidebar' | 'submenu' | 'topbarSubmenu'>(
    key: K,
    title: string,
  ) => (
    <>
      <DropdownMenuLabel>{title}</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={layout[key]}
        onValueChange={(v) => setLayout(key, v as ShellLayout[K])}
      >
        {layoutOptions[key].map((o) => (
          <DropdownMenuRadioItem key={o.value} value={o.value}>
            {o.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </>
  )
  const sidebar = layout.navigation === 'sidebar'
  return (
    <>
      {radio('navigation', 'Posição do menu')}
      {!sidebar && (
        <>
          <DropdownMenuSeparator />
          {radio('topbarSubmenu', 'Submenu')}
        </>
      )}
      {sidebar && (
        <>
          <DropdownMenuSeparator />
          {radio('sidebar', 'Sidebar')}
          <DropdownMenuCheckboxItem
            checked={layout.expandOnHover}
            disabled={layout.sidebar !== 'collapsed'}
            onCheckedChange={(v) => setLayout('expandOnHover', v === true)}
            onSelect={(e) => e.preventDefault()}
          >
            Abrir ao passar o mouse
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {radio('submenu', 'Submenu')}
        </>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem
        checked={layout.bottomNav}
        onCheckedChange={(v) => setLayout('bottomNav', v === true)}
        onSelect={(e) => e.preventDefault()}
      >
        Barra inferior no celular
      </DropdownMenuCheckboxItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={resetLayout}>Voltar ao padrão do projeto</DropdownMenuItem>
    </>
  )
}

function UserMenu() {
  const navigate = useNavigate()
  const { brand, brands, setBrandId, palette, palettes, setPaletteId } = useBrand()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" iconOnly aria-label={`Menu de ${currentUser.name}`}>
          <Avatar name={currentUser.name} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">{currentUser.name}</span>
          <span className="font-normal">{currentUser.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/configuracoes">
            <User aria-hidden />
            Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/configuracoes">
            <Settings aria-hidden />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun aria-hidden />
            Tema
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <ModeItems />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette aria-hidden />
            Template
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuLabel>Modelo</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={brand.id} onValueChange={setBrandId}>
              {brands.map((b) => (
                <DropdownMenuRadioItem key={b.id} value={b.id}>
                  <span className="flex flex-col">
                    <span>{b.productName}</span>
                    <span className="text-xs text-muted-foreground">{shapeLabels[b.shape]}</span>
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Paleta de cores</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={palette.id}
              onValueChange={(v) => setPaletteId(v === brand.id ? null : v)}
            >
              {palettes.map((b) => (
                <DropdownMenuRadioItem key={b.id} value={b.id}>
                  {b.name}
                  {b.id === brand.id && (
                    <span className="ml-auto pl-4 text-xs text-muted-foreground">do modelo</span>
                  )}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <LayoutTemplate aria-hidden />
            Layout
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <LayoutItems />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => navigate('/login')}>
          <LogOut aria-hidden />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Menu superior (layout topbar), a partir de 1024px. */
function TopNav() {
  const { pathname } = useLocation()
  const link =
    'inline-flex h-control-md items-center gap-2 rounded-item px-3 text-sm font-medium whitespace-nowrap transition-colors [&_svg]:size-icon-sm'
  const idle = 'text-muted-foreground hover:bg-accent hover:text-foreground'
  const active = 'bg-primary-soft text-primary-soft-foreground'
  return (
    <nav aria-label="Navegação principal" className="hidden min-w-0 lg:block">
      <ul className="flex items-center gap-1">
        {navigation
          .flatMap((g) => g.items)
          .map((item) => {
            const Icon = item.icon
            if (item.children) {
              const childActive = item.children.some((c) => pathname.startsWith(c.to))
              return (
                <li key={item.title}>
                  <DropdownMenu>
                    <DropdownMenuTrigger className={cn(link, childActive ? active : idle)}>
                      <Icon aria-hidden />
                      {item.title}
                      <ChevronDown aria-hidden />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {item.children.map((c) => (
                        <DropdownMenuItem key={c.to} asChild>
                          <Link to={c.to}>{c.title}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              )
            }
            const to = item.to ?? '/'
            return (
              <li key={item.title}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => cn(link, isActive ? active : idle)}
                >
                  <Icon aria-hidden />
                  {item.title}
                </NavLink>
              </li>
            )
          })}
      </ul>
    </nav>
  )
}

export function Header() {
  const { layout, setLayout, setMobileNavOpen, setSearchOpen } = useShell()
  const { brand, resolvedMode } = useBrand()
  const crumbs = useCrumbs()
  // Trilha do header: sempre começa em Início.
  const trail =
    crumbs[0]?.to === '/' || crumbs.length === 0
      ? crumbs
      : [{ label: 'Início', to: '/' }, ...crumbs]
  const ModeIcon = resolvedMode === 'dark' ? Moon : Sun
  const topbar = layout.navigation === 'topbar'
  const collapsed = layout.sidebar === 'collapsed'

  return (
    <header className="relative z-30 flex h-header shrink-0 items-center gap-1 border-b bg-card px-2 md:gap-2 md:px-4">
      <Button
        variant="ghost"
        iconOnly
        aria-label="Abrir menu"
        className={topbar ? 'lg:hidden' : 'md:hidden'}
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu aria-hidden />
      </Button>

      {topbar ? (
        <>
          <Link
            to="/"
            aria-label={`${brand.productName}, ir para o painel`}
            className="hidden shrink-0 lg:block"
          >
            <BrandLogo on="surface" />
          </Link>
          <Breadcrumb items={crumbs} className="flex-1 px-2 md:px-0 lg:hidden" />
          <div className="hidden min-w-0 flex-1 lg:flex lg:justify-center">
            {layout.topbarSubmenu === 'mega' ? <MegaMenu /> : <TopNav />}
          </div>
        </>
      ) : (
        <>
          <Tooltip content={collapsed ? 'Expandir menu' : 'Recolher menu'} side="bottom">
            <Button
              variant="ghost"
              iconOnly
              aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
              aria-pressed={!collapsed}
              className="hidden md:inline-flex"
              onClick={() => setLayout('sidebar', collapsed ? 'expanded' : 'collapsed')}
            >
              <PanelLeft aria-hidden />
            </Button>
          </Tooltip>
          <span aria-hidden className="mx-1 h-8 w-px shrink-0 bg-border md:mx-2" />
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className="truncate text-sm leading-tight font-semibold md:text-base">
              {crumbs[crumbs.length - 1]?.label ?? brand.productName}
            </p>
            <Breadcrumb items={trail} variant="trail" />
          </div>
        </>
      )}

      <div className="flex shrink-0 items-center gap-1 md:gap-2">
        {/* Busca: campo no desktop, ícone abaixo disso (abre em tela cheia no mobile) */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className={cn(
            'hidden h-control-md items-center gap-2 rounded-control border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-primary',
            topbar ? '2xl:flex 2xl:w-3xs' : 'lg:flex lg:w-3xs',
          )}
        >
          <Search className="size-icon-sm" aria-hidden />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="rounded-item border bg-muted px-2 text-xs">Ctrl K</kbd>
        </button>
        <Button
          variant="ghost"
          iconOnly
          aria-label="Buscar"
          className={topbar ? '2xl:hidden' : 'lg:hidden'}
          onClick={() => setSearchOpen(true)}
        >
          <Search aria-hidden />
        </Button>

        <Notifications />

        <DropdownMenu>
          <Tooltip content="Tema" side="bottom">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" iconOnly aria-label="Tema" className="hidden md:inline-flex">
                <ModeIcon aria-hidden />
              </Button>
            </DropdownMenuTrigger>
          </Tooltip>
          <DropdownMenuContent align="end">
            <ModeItems />
          </DropdownMenuContent>
        </DropdownMenu>

        <UserMenu />
      </div>
    </header>
  )
}

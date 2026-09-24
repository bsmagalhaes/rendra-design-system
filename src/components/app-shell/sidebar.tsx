import { ChevronDown, ChevronRight, LogOut, X } from 'lucide-react'
import { Collapsible, Dialog, VisuallyHidden } from 'radix-ui'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { useBrand } from '@/brand'
import { Avatar } from '@/components/ui/avatar'
import { BrandLogo } from '@/components/ui/brand-logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip } from '@/components/ui/tooltip'
import { currentUser, navigation, resolveActiveTo, type NavItem } from '@/config/navigation'
import { cn } from '@/lib/cn'
import { useShell } from './shell-context'

/*
 * Sidebar única, configurada pelo layout do AppShell (src/config/layout.ts):
 *   sidebar: collapsed | expanded     expandOnHover: abre por cima do conteúdo
 *   submenu: panel (segunda barra) | inline (dentro da sidebar)
 * Mobile (< 768px): a mesma navegação reconstruída como gaveta, com submenu inline.
 */

const itemBase =
  'group relative flex min-h-touch w-full items-center gap-3 rounded-item px-3 text-sm transition-colors md:min-h-0 md:h-control-md'
const itemIdle = 'text-sidebar-foreground hover:bg-sidebar-accent'
const itemActive = 'bg-sidebar-active font-medium text-sidebar-active-foreground'

function ActiveIndicator() {
  return (
    <span
      aria-hidden
      className="absolute inset-y-2 left-0 w-1 rounded-full bg-sidebar-indicator in-data-[shape=pill]:hidden"
    />
  )
}

function Badge({ value, compact }: { value: number; compact: boolean }) {
  if (compact) {
    return (
      <span
        aria-hidden
        className="absolute top-2 right-2 size-2 rounded-full bg-sidebar-indicator"
      />
    )
  }
  return (
    <span className="ml-auto rounded-full bg-sidebar-accent px-2 text-xs font-medium text-sidebar-foreground tabular-nums">
      {value}
    </span>
  )
}

function useIsActive() {
  const { pathname } = useLocation()
  const active = resolveActiveTo(pathname)
  return (to: string) => to === active
}

interface EntryProps {
  item: NavItem
  /** Só ícones (sem rótulos). */
  compact: boolean
  submenu: 'panel' | 'inline'
  /** Sem expansão por hover, o modo compacto usa tooltip e menu suspenso. */
  hoverExpands: boolean
  panelOpenFor: string | null
  onTogglePanel: (item: NavItem) => void
  onNavigate?: () => void
}

function NavEntry({
  item,
  compact,
  submenu,
  hoverExpands,
  panelOpenFor,
  onTogglePanel,
  onNavigate,
}: EntryProps) {
  const isActive = useIsActive()
  const Icon = item.icon
  const childActive = item.children?.some((c) => isActive(c.to)) ?? false
  const [open, setOpen] = useState(childActive)
  const label = item.badge ? `${item.title}, ${item.badge} pendentes` : item.title

  if (item.children) {
    // Submenu em segunda barra lateral
    if (submenu === 'panel') {
      const panelOpen = panelOpenFor === item.title
      return (
        <Tooltip content={item.title} side="right" disabled={!compact || hoverExpands}>
          <button
            type="button"
            aria-expanded={panelOpen}
            aria-controls="submenu-painel"
            aria-label={compact ? item.title : undefined}
            onClick={() => onTogglePanel(item)}
            className={cn(
              itemBase,
              compact && 'justify-center px-0',
              childActive || panelOpen ? itemActive : itemIdle,
            )}
          >
            {childActive && <ActiveIndicator />}
            <Icon className="size-icon-md shrink-0" aria-hidden />
            {!compact && (
              <>
                <span className="truncate">{item.title}</span>
                <ChevronRight
                  aria-hidden
                  className={cn(
                    'ml-auto size-icon-sm shrink-0 text-sidebar-muted-foreground transition-transform duration-200',
                    panelOpen && 'rotate-180',
                  )}
                />
              </>
            )}
          </button>
        </Tooltip>
      )
    }

    // Inline, mas compacto e sem expansão por hover: menu suspenso ao lado
    if (compact) {
      return (
        <DropdownMenu>
          <Tooltip content={item.title} side="right">
            <DropdownMenuTrigger
              aria-label={item.title}
              className={cn(itemBase, 'justify-center px-0', childActive ? itemActive : itemIdle)}
            >
              {childActive && <ActiveIndicator />}
              <Icon className="size-icon-md shrink-0" aria-hidden />
            </DropdownMenuTrigger>
          </Tooltip>
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
            {item.children.map((c) => (
              <DropdownMenuItem key={c.to} asChild>
                <Link to={c.to}>{c.title}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    // Inline expandido dentro da sidebar
    return (
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        <Collapsible.Trigger className={cn(itemBase, childActive && 'font-medium', itemIdle)}>
          <Icon className="size-icon-md shrink-0" aria-hidden />
          <span className="truncate">{item.title}</span>
          <ChevronDown
            aria-hidden
            className="ml-auto size-icon-sm shrink-0 text-sidebar-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </Collapsible.Trigger>
        <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <ul className="flex flex-col gap-1 pt-1 pl-8">
            {item.children.map((c) => (
              <li key={c.to}>
                <NavLink
                  to={c.to}
                  end
                  onClick={onNavigate}
                  className={cn(
                    itemBase,
                    'md:h-control-sm',
                    isActive(c.to) ? itemActive : itemIdle,
                  )}
                >
                  <span className="truncate">{c.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </Collapsible.Content>
      </Collapsible.Root>
    )
  }

  const to = item.to ?? '/'
  return (
    <Tooltip content={item.title} side="right" disabled={!compact || hoverExpands}>
      <NavLink
        to={to}
        end={to === '/'}
        onClick={onNavigate}
        aria-label={compact ? label : undefined}
        className={cn(
          itemBase,
          compact && 'justify-center px-0',
          isActive(to) ? itemActive : itemIdle,
        )}
      >
        {() => {
          const a = isActive(to)
          return (
            <>
              {a && <ActiveIndicator />}
              <Icon className="size-icon-md shrink-0" aria-hidden />
              {!compact && <span className="truncate">{item.title}</span>}
              {item.badge ? <Badge value={item.badge} compact={compact} /> : null}
            </>
          )
        }}
      </NavLink>
    </Tooltip>
  )
}

interface BodyProps {
  compact: boolean
  submenu: 'panel' | 'inline'
  hoverExpands: boolean
  panelOpenFor?: string | null
  onTogglePanel?: (item: NavItem) => void
  onNavigate?: () => void
  onClose?: () => void
}

function SidebarBody({
  compact,
  submenu,
  hoverExpands,
  panelOpenFor = null,
  onTogglePanel = () => {},
  onNavigate,
  onClose,
}: BodyProps) {
  const { brand } = useBrand()
  const navigate = useNavigate()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          'flex h-header shrink-0 items-center border-b border-sidebar-border',
          compact ? 'justify-center' : 'justify-between gap-2 px-4',
        )}
      >
        <Link
          to="/"
          onClick={onNavigate}
          aria-label={`${brand.productName}, ir para o painel`}
          className="flex min-w-0 items-center"
        >
          <BrandLogo on="sidebar" symbolOnly={compact} />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="-mr-2 flex size-touch items-center justify-center rounded-item text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="size-icon-md" aria-hidden />
          </button>
        )}
      </div>

      {/* A lista só rola sozinha se o menu for maior que a tela. */}
      <nav
        aria-label="Navegação principal"
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto px-3 py-4"
      >
        {navigation.map((group) => (
          <div key={group.title} className="flex flex-col gap-1">
            {compact ? (
              <span aria-hidden className="mx-3 mb-1 h-px bg-sidebar-border" />
            ) : (
              <span className="truncate px-3 pb-1 text-xs font-medium tracking-wide text-sidebar-muted-foreground uppercase">
                {group.title}
              </span>
            )}
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.title}>
                  <NavEntry
                    item={item}
                    compact={compact}
                    submenu={submenu}
                    hoverExpands={hoverExpands}
                    panelOpenFor={panelOpenFor}
                    onTogglePanel={onTogglePanel}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          'flex shrink-0 items-center gap-3 border-t border-sidebar-border p-3',
          compact && 'flex-col',
        )}
      >
        <Avatar name={currentUser.name} />
        {!compact && (
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{currentUser.name}</span>
            <span className="truncate text-xs text-sidebar-muted-foreground">
              {currentUser.email}
            </span>
          </div>
        )}
        <Tooltip content="Sair" side="right">
          <button
            type="button"
            aria-label="Sair"
            onClick={() => navigate('/login')}
            className="flex size-touch shrink-0 items-center justify-center rounded-item text-sidebar-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground md:size-control-md"
          >
            <LogOut className="size-icon-sm" aria-hidden />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

/** Segunda barra lateral com os subitens do item escolhido. */
function SubmenuPanel({ item, onClose }: { item: NavItem; onClose: () => void }) {
  return (
    <div
      id="submenu-painel"
      role="region"
      aria-label={`Submenu ${item.title}`}
      className="flex h-full w-3xs shrink-0 animate-in flex-col border-r bg-card text-card-foreground shadow-lg fade-in-0"
    >
      <div className="flex h-header shrink-0 items-center justify-between gap-2 border-b pr-2 pl-4">
        <span className="truncate text-sm font-semibold">{item.title}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar submenu"
          className="flex size-control-md items-center justify-center rounded-item text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-icon-sm" aria-hidden />
        </button>
      </div>
      <ul className="flex flex-col gap-1 p-3">
        {item.children?.map((c) => (
          <li key={c.to}>
            <NavLink
              to={c.to}
              end
              className={({ isActive }) =>
                cn(
                  'flex h-control-md items-center rounded-item px-3 text-sm transition-colors',
                  isActive
                    ? 'bg-primary-soft font-medium text-primary-soft-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <span className="truncate">{c.title}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Sidebar() {
  const { layout, mobileNavOpen, setMobileNavOpen } = useShell()
  const { pathname } = useLocation()
  const close = () => setMobileNavOpen(false)

  const collapsed = layout.sidebar === 'collapsed'
  const hoverExpands = collapsed && layout.expandOnHover
  const [peek, setPeek] = useState(false)
  const [panel, setPanel] = useState<NavItem | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const rootRef = useRef<HTMLDivElement>(null)
  const compact = collapsed && !peek

  // Fecha a segunda barra ao navegar, com Esc e ao clicar fora.
  useEffect(() => setPanel(null), [pathname])
  useEffect(() => {
    if (!panel) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanel(null)
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPanel(null)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [panel])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const openPeek = () => {
    if (!hoverExpands) return
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setPeek(true), 120)
  }
  const closePeek = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setPeek(false), 200)
  }

  const desktop = layout.navigation === 'sidebar'

  return (
    <>
      {desktop && (
        // O aside reserva só a largura recolhida; o painel expandido flutua por cima do conteúdo.
        <aside
          aria-label="Menu lateral"
          className={cn(
            'relative hidden shrink-0 transition-[width] duration-200 ease-out md:block',
            collapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
          )}
        >
          <div
            ref={rootRef}
            onMouseEnter={openPeek}
            onMouseLeave={closePeek}
            onFocus={openPeek}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closePeek()
            }}
            className="absolute inset-y-0 left-0 z-40 flex"
          >
            <div
              className={cn(
                'h-full border-r border-sidebar-border bg-sidebar-brand text-sidebar-foreground transition-[width,box-shadow] duration-200 ease-out',
                compact ? 'w-sidebar-collapsed' : 'w-sidebar',
                collapsed && peek && 'shadow-lg',
              )}
            >
              <SidebarBody
                compact={compact}
                submenu={layout.submenu}
                hoverExpands={hoverExpands}
                panelOpenFor={panel?.title ?? null}
                onTogglePanel={(item) => setPanel((p) => (p?.title === item.title ? null : item))}
              />
            </div>
            {panel && <SubmenuPanel item={panel} onClose={() => setPanel(null)} />}
          </div>
        </aside>
      )}

      {/* Mobile (e tablet no layout de menu superior): gaveta com submenu inline */}
      <Dialog.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            className={cn(
              'fixed inset-0 z-40 bg-overlay data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
              desktop ? 'md:hidden' : 'lg:hidden',
            )}
          />
          <Dialog.Content
            aria-describedby={undefined}
            className={cn(
              'fixed inset-y-0 left-0 z-50 w-sidebar-drawer bg-sidebar-brand text-sidebar-foreground shadow-lg data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left',
              desktop ? 'md:hidden' : 'lg:hidden',
            )}
          >
            <VisuallyHidden.Root>
              <Dialog.Title>Menu</Dialog.Title>
            </VisuallyHidden.Root>
            <SidebarBody
              compact={false}
              submenu="inline"
              hoverExpands={false}
              onNavigate={close}
              onClose={close}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

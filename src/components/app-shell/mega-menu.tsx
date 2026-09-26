import { ChevronDown } from 'lucide-react'
import { NavigationMenu as N } from 'radix-ui'
import { useCurrentPath, useRendraLink } from '@/components/rendra-provider'
import { cn } from '@/lib/cn'
import { useShell } from './shell-context'
import type { NavItem } from './types'

/*
 * Mega menu do layout topbar (a partir de 1024px). Cada seção é um grupo do `navigation`
 * (prop do AppShell); o painel abre abaixo do header, na largura do conteúdo, com os menus
 * e seus subitens. Abre por clique, toque ou teclado (Radix NavigationMenu); o hover só
 * antecipa.
 */

const trigger =
  'group inline-flex h-control-md items-center gap-1 rounded-item px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:focus-ring data-[state=open]:bg-accent data-[state=open]:text-foreground'

function isActive(pathname: string, to: string) {
  return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)
}

function MegaItem({ item }: { item: NavItem }) {
  const pathname = useCurrentPath()
  const Link = useRendraLink()
  const Icon = item.icon
  const active = item.to ? isActive(pathname, item.to) : false
  const head = (
    <>
      <span
        className={cn(
          'flex size-control-md shrink-0 items-center justify-center rounded-control transition-colors',
          active
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary-soft text-primary-soft-foreground group-hover/item:bg-primary group-hover/item:text-primary-foreground',
        )}
      >
        <Icon className="size-icon-md" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-semibold">{item.title}</span>
        {item.description && (
          <span className="text-sm text-muted-foreground">{item.description}</span>
        )}
      </span>
    </>
  )
  return (
    <li className="flex flex-col gap-2">
      {item.to ? (
        <N.Link asChild active={active}>
          <Link
            to={item.to}
            className="group/item flex items-start gap-3 rounded-item p-3 transition-colors hover:bg-accent"
          >
            {head}
          </Link>
        </N.Link>
      ) : (
        <div className="group/item flex items-start gap-3 p-3">{head}</div>
      )}
      {item.children && (
        <ul className="flex flex-col gap-1 pl-16">
          {item.children.map((c) => (
            <li key={c.to}>
              <N.Link asChild active={isActive(pathname, c.to)}>
                <Link
                  to={c.to}
                  className="flex flex-col gap-1 rounded-item px-3 py-2 transition-colors hover:bg-accent data-[active]:bg-primary-soft data-[active]:text-primary-soft-foreground"
                >
                  <span className="text-sm font-medium">{c.title}</span>
                  {c.description && (
                    <span className="text-xs text-muted-foreground">{c.description}</span>
                  )}
                </Link>
              </N.Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export function MegaMenu() {
  const pathname = useCurrentPath()
  const { navigation } = useShell()
  return (
    <N.Root className="hidden lg:block" delayDuration={150}>
      <N.List className="flex items-center gap-1">
        {navigation.map((group) => {
          const groupActive = group.items.some(
            (i) =>
              (i.to && isActive(pathname, i.to)) ||
              i.children?.some((c) => isActive(pathname, c.to)),
          )
          return (
            <N.Item key={group.title} value={group.title}>
              <N.Trigger
                className={cn(
                  trigger,
                  groupActive
                    ? 'bg-primary-soft text-primary-soft-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {group.title}
                <ChevronDown
                  aria-hidden
                  className="size-icon-sm transition-transform duration-200 group-data-[state=open]:rotate-180"
                />
              </N.Trigger>
              <N.Content className="w-full data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in-0 data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out-0">
                <div className="grid w-full gap-6 p-6 lg:grid-cols-4">
                  <div className="flex flex-col gap-2 border-r pr-6">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Seção
                    </span>
                    <span className="text-xl font-semibold">{group.title}</span>
                    {group.description && (
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    )}
                    <div className="mt-2 h-1 w-12 rounded-full bg-gradient-accent" />
                  </div>
                  <ul className="grid gap-2 lg:col-span-3 lg:grid-cols-3">
                    {group.items.map((item) => (
                      <MegaItem key={item.title} item={item} />
                    ))}
                  </ul>
                </div>
              </N.Content>
            </N.Item>
          )
        })}
      </N.List>
      {/* Painel na largura do header, logo abaixo dele */}
      <div className="absolute inset-x-0 top-full z-40">
        <N.Viewport className="w-full overflow-hidden border-b bg-popover text-popover-foreground shadow-lg data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      </div>
    </N.Root>
  )
}

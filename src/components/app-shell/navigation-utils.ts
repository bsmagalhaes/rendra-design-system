import type { LucideIcon } from 'lucide-react'
import type { NavGroup, NavItem } from './types'

/*
 * Derivações de exibição do menu (src/config/navigation.ts, ou outro `navigation` passado
 * por prop): barra inferior, lista plana de destinos e destino ativo. Calculadas dentro do
 * AppShell (useMemo, a partir de `navigation`), nunca em @/config.
 */

/** Destino plano da busca global e do cálculo do item ativo. */
export interface NavigationTarget {
  title: string
  to: string
  group: string
  icon: LucideIcon
}

/** Itens marcados `bottomNav`, na ordem do menu. Limite de 4. */
export function getBottomNavItems(navigation: NavGroup[]): NavItem[] {
  return navigation
    .flatMap((g) => g.items)
    .filter((i) => i.bottomNav)
    .slice(0, 4)
}

/** Lista plana de destinos (itens de primeiro nível com rota e filhos de itens com submenu). */
export function getNavigationTargets(navigation: NavGroup[]): NavigationTarget[] {
  return navigation.flatMap((g) =>
    g.items.flatMap((i) => [
      ...(i.to ? [{ title: i.title, to: i.to, group: g.title, icon: i.icon }] : []),
      ...(i.children ?? []).map((c) => ({
        title: c.title,
        to: c.to,
        group: i.title,
        icon: i.icon,
      })),
    ]),
  )
}

/**
 * Destino ativo: o mais específico que combina com o endereço.
 * Ex.: em /clientes/novo fica ativo "Novo cliente" (e o grupo Cadastros), não "Clientes".
 */
export function resolveActiveTo(targets: NavigationTarget[], pathname: string): string | null {
  const matches = targets
    .map((t) => t.to)
    .filter((to) =>
      to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`),
    )
  return matches.sort((a, b) => b.length - a.length)[0] ?? null
}

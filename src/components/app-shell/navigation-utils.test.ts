import { LayoutDashboard, Users } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { getBottomNavItems, getNavigationTargets, resolveActiveTo } from './navigation-utils'
import type { NavGroup } from './types'

const fixture: NavGroup[] = [
  {
    title: 'Geral',
    items: [
      { title: 'Painel', to: '/', icon: LayoutDashboard, bottomNav: true },
      {
        title: 'Clientes',
        to: '/clientes',
        icon: Users,
        bottomNav: true,
        children: undefined,
      },
      {
        title: 'Cadastros',
        icon: Users,
        bottomNav: true,
        children: [{ title: 'Novo cliente', to: '/clientes/novo' }],
      },
      { title: 'Tarefas', to: '/tarefas', icon: Users },
    ],
  },
]

describe('getBottomNavItems', () => {
  it('mantém só os itens marcados bottomNav, na ordem do menu', () => {
    const items = getBottomNavItems(fixture)
    expect(items.map((i) => i.title)).toEqual(['Painel', 'Clientes', 'Cadastros'])
  })

  it('limita a 4 itens', () => {
    const withFive: NavGroup[] = [
      {
        title: 'Geral',
        items: Array.from({ length: 5 }, (_, i) => ({
          title: `Item ${i}`,
          to: `/item-${i}`,
          icon: LayoutDashboard,
          bottomNav: true,
        })),
      },
    ]
    expect(getBottomNavItems(withFive)).toHaveLength(4)
  })
})

describe('getNavigationTargets', () => {
  it('achata itens com rota e filhos de itens com submenu', () => {
    const targets = getNavigationTargets(fixture)
    expect(targets.map((t) => t.to)).toEqual(['/', '/clientes', '/clientes/novo', '/tarefas'])
    expect(targets.find((t) => t.to === '/clientes/novo')?.group).toBe('Cadastros')
  })

  it('ignora item sem rota e sem filhos', () => {
    const onlyParent: NavGroup[] = [
      { title: 'Geral', items: [{ title: 'Sem rota', icon: LayoutDashboard }] },
    ]
    expect(getNavigationTargets(onlyParent)).toEqual([])
  })
})

describe('resolveActiveTo', () => {
  const targets = getNavigationTargets(fixture)

  it('marca só o item mais específico do menu', () => {
    expect(resolveActiveTo(targets, '/clientes/novo')).toBe('/clientes/novo')
    expect(resolveActiveTo(targets, '/clientes/1000')).toBe('/clientes')
  })

  it('o painel só fica ativo na raiz', () => {
    expect(resolveActiveTo(targets, '/')).toBe('/')
    expect(resolveActiveTo(targets, '/pagina-inexistente')).toBeNull()
  })
})

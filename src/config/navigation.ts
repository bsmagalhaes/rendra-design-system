import {
  Blocks,
  ClipboardList,
  Images,
  LayoutDashboard,
  ListChecks,
  Palette,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'

/*
 * MENU DO SISTEMA
 * Única fonte da sidebar, da barra inferior do mobile e da busca global (Ctrl+K).
 */

export interface NavItem {
  title: string
  /** Rota. Item com children e sem rota só abre o submenu. */
  to?: string
  icon: LucideIcon
  /** Contador exibido à direita (ex.: pendências). */
  badge?: number
  /** Aparece na barra de navegação inferior do mobile (no máximo 4 itens no total). */
  bottomNav?: boolean
  /** Rótulo curto para a barra inferior, quando o título não cabe. */
  shortTitle?: string
  /** Frase curta exibida no mega menu. */
  description?: string
  children?: NavChild[]
}

export interface NavChild {
  title: string
  to: string
  description?: string
}

export interface NavGroup {
  title: string
  /** Frase curta da seção, exibida no mega menu. */
  description?: string
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    title: 'Geral',
    description: 'Visão rápida do que importa hoje.',
    items: [
      {
        title: 'Painel',
        to: '/',
        icon: LayoutDashboard,
        bottomNav: true,
        description: 'Indicadores, evolução e atividade recente.',
      },
    ],
  },
  {
    title: 'Operação',
    description: 'O dia a dia da equipe.',
    items: [
      {
        title: 'Clientes',
        to: '/clientes',
        icon: Users,
        badge: 3,
        bottomNav: true,
        description: 'Busque, filtre e acompanhe a carteira.',
      },
      {
        title: 'Cadastros',
        icon: ClipboardList,
        bottomNav: true,
        description: 'Crie registros novos.',
        children: [
          {
            title: 'Novo cliente',
            to: '/clientes/novo',
            description: 'Formulário completo em seções.',
          },
          { title: 'Cadastro guiado', to: '/cadastro', description: 'Passo a passo em etapas.' },
        ],
      },
      {
        title: 'Tarefas',
        to: '/tarefas',
        icon: ListChecks,
        description: 'Pendências e prazos da equipe.',
      },
    ],
  },
  {
    title: 'Sistema',
    description: 'Padrões, identidade e ajustes.',
    items: [
      {
        title: 'Componentes',
        to: '/componentes',
        icon: Blocks,
        description: 'Vitrine com variantes e estados.',
      },
      {
        title: 'Tokens',
        to: '/tokens',
        icon: Palette,
        description: 'Cores, tipografia e formato.',
      },
      {
        title: 'Galeria',
        to: '/galeria',
        icon: Images,
        description: 'Capturas de todos os templates e paletas.',
      },
      {
        title: 'Configurações',
        shortTitle: 'Ajustes',
        to: '/configuracoes',
        icon: Settings,
        bottomNav: true,
        description: 'Preferências da conta e da empresa.',
      },
    ],
  },
]

/** Itens da barra inferior do mobile, na ordem do menu. Limite de 4. */
export const bottomNavItems = navigation
  .flatMap((g) => g.items)
  .filter((i) => i.bottomNav)
  .slice(0, 4)

/** Lista plana de destinos, usada pela busca global. */
export const navigationTargets = navigation.flatMap((g) =>
  g.items.flatMap((i) => [
    ...(i.to ? [{ title: i.title, to: i.to, group: g.title, icon: i.icon }] : []),
    ...(i.children ?? []).map((c) => ({ title: c.title, to: c.to, group: i.title, icon: i.icon })),
  ]),
)

/** Usuário de demonstração. Troque pela sessão real. */
export const currentUser = {
  name: 'Ana Ribeiro',
  email: 'ana.ribeiro@empresa.com.br',
  role: 'Administradora',
}

/**
 * Destino ativo: o mais específico que combina com o endereço.
 * Ex.: em /clientes/novo fica ativo "Novo cliente" (e o grupo Cadastros), não "Clientes".
 */
export function resolveActiveTo(pathname: string): string | null {
  const matches = navigationTargets
    .map((t) => t.to)
    .filter((to) =>
      to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`),
    )
  return matches.sort((a, b) => b.length - a.length)[0] ?? null
}

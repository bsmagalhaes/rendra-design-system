import { createContext, useContext, type ReactNode } from 'react'
import type { ShellLayout } from '@/config/layout'

export interface ShellContextValue {
  /** Layout efetivo: padrão do projeto + props do AppShell + escolha do usuário. */
  layout: ShellLayout
  /** Altera uma opção de layout (guardada no navegador do usuário). */
  setLayout: <K extends keyof ShellLayout>(key: K, value: ShellLayout[K]) => void
  /** Altera várias opções de uma vez (ex.: um código de menu M1 a M6). */
  applyLayout: (partial: Partial<ShellLayout>) => void
  /** Volta ao layout padrão do projeto. */
  resetLayout: () => void
  /** Gaveta de navegação aberta no mobile. */
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
  /**
   * Espaço do rodapé fixo da página, entre o conteúdo e a barra inferior. A ActionBar
   * sticky é desenhada aqui: fica sempre colada embaixo, na largura inteira.
   */
  footerSlot: HTMLElement | null
  /** Texto orientativo da tela (PageHeader help): o header mostra o ícone ao lado do título. */
  pageHelp: ReactNode
  setPageHelp: (help: ReactNode) => void
  /** Busca global (Ctrl+K). */
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
}

export const ShellContext = createContext<ShellContextValue | null>(null)

export function useShell() {
  const ctx = useContext(ShellContext)
  if (!ctx) throw new Error('useShell precisa estar dentro de <AppShell>.')
  return ctx
}

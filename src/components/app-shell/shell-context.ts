import { createContext, useContext } from 'react'
import type { ShellLayout } from '@/config/layout'

export interface ShellContextValue {
  /** Layout efetivo: padrão do projeto + props do AppShell + escolha do usuário. */
  layout: ShellLayout
  /** Altera uma opção de layout (guardada no navegador do usuário). */
  setLayout: <K extends keyof ShellLayout>(key: K, value: ShellLayout[K]) => void
  /** Volta ao layout padrão do projeto. */
  resetLayout: () => void
  /** Gaveta de navegação aberta no mobile. */
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
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

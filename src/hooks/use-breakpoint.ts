import { useSyncExternalStore } from 'react'

/**
 * Pontos de quebra, espelhando os padrões do Tailwind (sm 40rem, md 48rem, lg 64rem...).
 * Único hook de detecção de tela do sistema. Para adaptação ao espaço disponível
 * dentro de um bloco (e não à tela), use container queries (@container) no CSS.
 */
export const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const
export type Breakpoint = keyof typeof breakpoints

const order: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl']

function subscribe(cb: () => void) {
  const lists = order.map((bp) => matchMedia(`(min-width: ${breakpoints[bp]}px)`))
  lists.forEach((mq) => mq.addEventListener('change', cb))
  return () => lists.forEach((mq) => mq.removeEventListener('change', cb))
}

function getCurrent(): Breakpoint | 'base' {
  let current: Breakpoint | 'base' = 'base'
  for (const bp of order) if (matchMedia(`(min-width: ${breakpoints[bp]}px)`).matches) current = bp
  return current
}

export function useBreakpoint() {
  const current = useSyncExternalStore(subscribe, getCurrent, () => 'lg' as const)
  const rank = current === 'base' ? -1 : order.indexOf(current)
  const up = (bp: Breakpoint) => rank >= order.indexOf(bp)
  return {
    current,
    up,
    /** Abaixo de 768px: componentes se reconstroem no formato mobile. */
    isMobile: !up('md'),
    isTablet: up('md') && !up('lg'),
    isDesktop: up('lg'),
  }
}

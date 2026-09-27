// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('usa o código do catálogo', () => {
    const { container } = renderApp(<Skeleton className="h-4 w-24" />)
    expect(container.querySelector('[data-rendra="SKEL-001"]')).toBeInTheDocument()
  })

  it('mostra o bloco de carregamento pulsando e escondido de leitores de tela', () => {
    const { container } = renderApp(<Skeleton className="h-4 w-24" />)
    const skeleton = container.querySelector('[data-rendra="SKEL-001"]')
    expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    expect(skeleton).toHaveClass('animate-pulse', 'h-4', 'w-24')
  })
})

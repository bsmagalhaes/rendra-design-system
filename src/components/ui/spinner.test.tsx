// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { Spinner } from './spinner'

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
}

afterEach(() => vi.unstubAllGlobals())

describe('Spinner', () => {
  it('sem label é decorativo: aria-hidden e não vira role status', () => {
    const { container } = renderApp(<Spinner />)
    const root = container.querySelector('[data-rendra="SPIN-001"]')
    expect(root).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('com label, anuncia por role status e o texto fica só para leitor de tela', () => {
    renderApp(<Spinner label="Carregando" />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Carregando')
  })

  it('gira por padrão (classe animate-spin)', () => {
    const { container } = renderApp(<Spinner label="Carregando" />)
    const icon = container.querySelector('svg')
    expect(icon).toHaveClass('animate-spin')
  })

  it('para de girar quando o sistema pede menos movimento', () => {
    stubReducedMotion(true)
    const { container } = renderApp(<Spinner label="Carregando" />)
    const icon = container.querySelector('svg')
    expect(icon).not.toHaveClass('animate-spin')
  })
})

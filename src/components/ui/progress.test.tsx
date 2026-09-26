// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Progress } from './progress'

describe('Progress', () => {
  it('mostra o valor e usa o código do catálogo', () => {
    const { container } = renderApp(<Progress value={40} showValue label="Envio" />)
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="PROG-001"]')).toBeInTheDocument()
  })

  it('indeterminado desliza (progress-slide) e não usa mais o animate-pulse', () => {
    const { container } = renderApp(<Progress value={null} label="Importando" />)
    const indicator = container.querySelector('[role="progressbar"] > *')
    expect(indicator).toHaveClass('progress-slide')
    expect(indicator).not.toHaveClass('animate-pulse')
  })
})

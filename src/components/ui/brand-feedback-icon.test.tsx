// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { BrandFeedbackIcon } from './brand-feedback-icon'

describe('BrandFeedbackIcon', () => {
  it('renderiza com o rótulo acessível e o código do catálogo', () => {
    const { container } = renderApp(<BrandFeedbackIcon type="success" label="Sucesso" />)
    const icon = container.querySelector('[data-rendra="BFI-001"]')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('aria-label', 'Sucesso')
  })

  it.each([
    ['success', 'M3 6.2 5.1 8.2 9 4'],
    ['error', 'M4 4l4 4M8 4 4 8'],
    ['warning', 'M6 3.2v3.3M6 8.8v0'],
    ['info', 'M6 3.2v0M6 5.5v3.3'],
  ] as const)('tipo %s mostra o traço de status próprio do tipo', (type, path) => {
    const { container } = renderApp(<BrandFeedbackIcon type={type} />)
    const svgs = container.querySelectorAll('[data-rendra="BFI-001"] svg')
    const glyphPath = svgs[svgs.length - 1]?.querySelector('path')
    expect(glyphPath).toHaveAttribute('d', path)
  })
})

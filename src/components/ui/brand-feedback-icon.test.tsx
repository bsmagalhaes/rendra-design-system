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
})

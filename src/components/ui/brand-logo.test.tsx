// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { BrandLogo } from './brand-logo'

describe('BrandLogo', () => {
  it('renderiza com o código do catálogo', () => {
    const { container } = renderApp(<BrandLogo />)
    expect(container.querySelector('[data-rendra="LOGO-001"]')).toBeInTheDocument()
  })
})

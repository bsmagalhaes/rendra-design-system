// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Slider } from './slider'

describe('Slider', () => {
  it('usa o código do catálogo', () => {
    const { container } = renderApp(<Slider aria-label="Volume" />)
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="SLD-001"]')).toBeInTheDocument()
  })
})

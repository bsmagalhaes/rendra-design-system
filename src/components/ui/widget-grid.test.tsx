// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { WidgetGrid } from './widget-grid'

describe('WidgetGrid', () => {
  it('renderiza os widgets e usa o código do catálogo', () => {
    const { container } = renderApp(
      <WidgetGrid widgets={[{ id: '1', w: 4, h: 4, content: <p>Bloco 1</p> }]} />,
    )
    expect(screen.getByText('Bloco 1')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="WDG-001"]')).toBeInTheDocument()
  })
})

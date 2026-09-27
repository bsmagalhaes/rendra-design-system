// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Slider } from './slider'

function Harness() {
  const [v, setV] = useState([50])
  return <Slider aria-label="Volume" value={v} onChange={setV} showValue />
}

describe('Slider', () => {
  it('usa o código do catálogo', () => {
    const { container } = renderApp(<Slider aria-label="Volume" />)
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="SLD-001"]')).toBeInTheDocument()
  })

  it('mover pela seta do teclado muda o valor mostrado e o aria-valuenow', async () => {
    renderApp(<Harness />)
    const thumb = screen.getByRole('slider', { name: 'Volume' })
    expect(thumb).toHaveAttribute('aria-valuenow', '50')
    expect(screen.getByText('50')).toBeInTheDocument()
    thumb.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(thumb).toHaveAttribute('aria-valuenow', '51')
    expect(screen.getByText('51')).toBeInTheDocument()
  })
})

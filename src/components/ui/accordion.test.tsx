// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Accordion } from './accordion'

describe('Accordion', () => {
  it('abre e fecha a seção pelo título', async () => {
    const { container } = renderApp(
      <Accordion
        items={[{ value: 'a', title: 'Como pagar?', content: <p>Por boleto ou Pix.</p> }]}
      />,
    )
    const trigger = screen.getByRole('button', { name: 'Como pagar?' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Por boleto ou Pix.')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="ACRN-001"]')).toBeInTheDocument()
  })
})

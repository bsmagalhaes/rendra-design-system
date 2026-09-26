// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { Rating } from './rating'

describe('Rating: variant stars', () => {
  it('mostra 5 estrelas por padrão, com data-rendra RTG-001', () => {
    const { container } = renderApp(<Rating variant="stars" value={null} aria-label="Nota" />)
    expect(screen.getAllByRole('radio')).toHaveLength(5)
    expect(container.querySelector('[data-rendra="RTG-001"]')).toBeInTheDocument()
  })

  it('clicar numa estrela marca e chama onChange com o número', async () => {
    const onChange = vi.fn()
    renderApp(<Rating variant="stars" value={null} onChange={onChange} aria-label="Nota" />)
    await userEvent.click(screen.getByRole('radio', { name: '3 estrelas' }))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('clicar de novo na estrela já marcada desmarca e devolve null', async () => {
    const onChange = vi.fn()
    renderApp(<Rating variant="stars" value={3} onChange={onChange} aria-label="Nota" />)
    await userEvent.click(screen.getByRole('radio', { name: '3 estrelas' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('seta para a direita move e marca a próxima estrela', async () => {
    const onChange = vi.fn()
    renderApp(<Rating variant="stars" value={2} onChange={onChange} aria-label="Nota" />)
    const current = screen.getByRole('radio', { name: '2 estrelas' })
    current.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('max customiza o total de estrelas', () => {
    renderApp(<Rating variant="stars" value={null} max={3} aria-label="Nota" />)
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })
})

describe('Rating: variant scale', () => {
  it('mostra de 1 a 10 por padrão, com data-rendra RTG-002', () => {
    const { container } = renderApp(<Rating variant="scale" value={null} aria-label="Nota NPS" />)
    expect(screen.getAllByRole('radio')).toHaveLength(10)
    expect(container.querySelector('[data-rendra="RTG-002"]')).toBeInTheDocument()
  })

  it('mostra lowLabel e highLabel quando informados', () => {
    renderApp(
      <Rating
        variant="scale"
        value={null}
        aria-label="Nota"
        lowLabel="Nada provável"
        highLabel="Muito provável"
      />,
    )
    expect(screen.getByText('Nada provável')).toBeInTheDocument()
    expect(screen.getByText('Muito provável')).toBeInTheDocument()
  })

  it('clicar numa nota marca; clicar de novo desmarca e devolve null', async () => {
    const onChange = vi.fn()
    const { rerender } = renderApp(
      <Rating variant="scale" value={null} onChange={onChange} aria-label="Nota" />,
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Nota 8' }))
    expect(onChange).toHaveBeenCalledWith(8)

    rerender(<Rating variant="scale" value={8} onChange={onChange} aria-label="Nota" />)
    await userEvent.click(screen.getByRole('radio', { name: 'Nota 8' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('min e max customizam a faixa', () => {
    renderApp(<Rating variant="scale" value={null} min={0} max={5} aria-label="Nota" />)
    expect(screen.getAllByRole('radio')).toHaveLength(6)
    expect(screen.getByRole('radio', { name: 'Nota 0' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Nota 5' })).toBeInTheDocument()
  })
})

// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Rating, type RatingProps } from './rating'

/** Componente controlado: o clique precisa mudar o valor de verdade, não só chamar onChange. */
function Controlled(props: Omit<RatingProps, 'value' | 'onChange'> & { initial: number | null }) {
  const { initial, ...rest } = props
  const [value, setValue] = useState<number | null>(initial)
  return <Rating {...rest} value={value} onChange={setValue} />
}

describe('Rating: variant stars', () => {
  it('mostra 5 estrelas por padrão, com data-rendra RTG-001', () => {
    const { container } = renderApp(<Rating variant="stars" value={null} aria-label="Nota" />)
    expect(screen.getAllByRole('radio')).toHaveLength(5)
    expect(container.querySelector('[data-rendra="RTG-001"]')).toBeInTheDocument()
  })

  it('clicar numa estrela marca ela (aria-checked e preenchimento) e desmarca as demais', async () => {
    renderApp(<Controlled variant="stars" initial={null} aria-label="Nota" />)
    const star3 = screen.getByRole('radio', { name: '3 estrelas' })
    await userEvent.click(star3)

    expect(star3).toHaveAttribute('aria-checked', 'true')
    expect(star3.querySelector('svg')).toHaveClass('fill-current')
    expect(screen.getByRole('radio', { name: '2 estrelas' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    expect(screen.getByRole('radio', { name: '4 estrelas' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('clicar de novo na estrela já marcada desmarca: nenhuma fica com aria-checked nem preenchida', async () => {
    renderApp(<Controlled variant="stars" initial={3} aria-label="Nota" />)
    const star3 = screen.getByRole('radio', { name: '3 estrelas' })
    expect(star3).toHaveAttribute('aria-checked', 'true')

    await userEvent.click(star3)

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toHaveAttribute('aria-checked', 'false')
      expect(radio.querySelector('svg')).not.toHaveClass('fill-current')
    }
  })

  it('seta para a direita move e marca a próxima estrela', async () => {
    renderApp(<Controlled variant="stars" initial={2} aria-label="Nota" />)
    const star2 = screen.getByRole('radio', { name: '2 estrelas' })
    star2.focus()
    await userEvent.keyboard('{ArrowRight}')

    const star3 = screen.getByRole('radio', { name: '3 estrelas' })
    expect(star3).toHaveAttribute('aria-checked', 'true')
    expect(star3).toHaveFocus()
    expect(star2).toHaveAttribute('aria-checked', 'false')
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

  it('clicar numa nota marca ela (aria-checked e data-state); clicar de novo desmarca', async () => {
    renderApp(<Controlled variant="scale" initial={null} aria-label="Nota" />)
    const nota8 = screen.getByRole('radio', { name: 'Nota 8' })

    await userEvent.click(nota8)
    expect(nota8).toHaveAttribute('aria-checked', 'true')
    expect(nota8).toHaveAttribute('data-state', 'checked')

    await userEvent.click(nota8)
    expect(nota8).toHaveAttribute('aria-checked', 'false')
    expect(nota8).not.toHaveAttribute('data-state')
  })

  it('min e max customizam a faixa', () => {
    renderApp(<Rating variant="scale" value={null} min={0} max={5} aria-label="Nota" />)
    expect(screen.getAllByRole('radio')).toHaveLength(6)
    expect(screen.getByRole('radio', { name: 'Nota 0' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Nota 5' })).toBeInTheDocument()
  })
})

// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Separator } from './separator'

describe('Separator', () => {
  it('usa o código do catálogo', () => {
    renderApp(<Separator />)
    expect(screen.getByRole('separator')).toHaveAttribute('data-rendra', 'SEP-001')
  })

  it('a orientação horizontal (padrão) aparece no atributo renderizado', () => {
    renderApp(<Separator />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('a orientação vertical muda o atributo renderizado', () => {
    renderApp(<Separator orientation="vertical" />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('com label, mostra o texto no meio da linha', () => {
    renderApp(<Separator label="ou" />)
    expect(screen.getByText('ou')).toBeInTheDocument()
  })
})

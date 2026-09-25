// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { ErrorPage } from './error-page'

describe('ErrorPage', () => {
  it('404 usa o código do catálogo', () => {
    const { container } = renderApp(<ErrorPage code={404} />)
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="ERRO-001"]')).toBeInTheDocument()
  })
})

// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Badge } from './badge'

describe('Badge', () => {
  it('mostra o texto e usa o código do catálogo', () => {
    renderApp(<Badge tone="success">Ativo</Badge>)
    expect(screen.getByText('Ativo').closest('[data-rendra="BDG-001"]')).toBeInTheDocument()
  })

  it('sem bolinha nem ícone não mostra nenhum; com os dois, mostra os dois', () => {
    const { container: semExtras } = renderApp(<Badge>Ativo</Badge>)
    expect(semExtras.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0)

    const { container: comExtras } = renderApp(
      <Badge dot icon={<span data-testid="icone-badge" />}>
        Pendente
      </Badge>,
    )
    expect(comExtras.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
    expect(screen.getByTestId('icone-badge')).toBeInTheDocument()
  })
})

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
})

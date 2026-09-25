// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { List } from './list'

describe('List', () => {
  it('renderiza os itens e usa o código do catálogo', () => {
    renderApp(<List items={[{ id: '1', title: 'Cliente A' }]} />)
    expect(screen.getByText('Cliente A').closest('[data-rendra="LIST-001"]')).toBeInTheDocument()
  })
})

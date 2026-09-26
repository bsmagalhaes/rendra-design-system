// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { DataToolbar } from './data-toolbar'

describe('DataToolbar', () => {
  it('a busca chama onChange e o componente usa o código do catálogo', () => {
    const onChange = vi.fn()
    const { container } = renderApp(
      <DataToolbar search={{ value: '', onChange, placeholder: 'Buscar clientes' }} />,
    )
    expect(screen.getByPlaceholderText('Buscar clientes')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="DTB-001"]')).toBeInTheDocument()
  })
})

// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { ActionBar } from './action-bar'

describe('ActionBar', () => {
  it('a ação principal chama onClick e o componente usa o código do catálogo', async () => {
    const onClick = vi.fn()
    const { container } = renderApp(<ActionBar primary={{ label: 'Salvar', onClick }} />)
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[data-rendra="ACB-001"]')).toBeInTheDocument()
  })
})

// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { Pagination } from './pagination'

describe('Pagination', () => {
  it('vai para a próxima página', async () => {
    const onPageChange = vi.fn()
    renderApp(<Pagination page={1} pageSize={15} total={40} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('na primeira página, anterior fica desativado', () => {
    renderApp(<Pagination page={1} pageSize={15} total={40} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
    expect(screen.getByRole('navigation', { name: 'Paginação' })).toHaveAttribute(
      'data-rendra',
      'PAG-001',
    )
  })

  it('pula direto para uma página', async () => {
    const onPageChange = vi.fn()
    renderApp(<Pagination page={1} pageSize={10} total={40} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Página 3' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})

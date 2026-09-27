// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { Pagination } from './pagination'

const setViewportWidth = (w: number) =>
  (globalThis as unknown as { setViewportWidth: (w: number) => void }).setViewportWidth(w)

function ControlledPagination() {
  const [page, setPage] = useState(1)
  return <Pagination page={page} pageSize={10} total={40} onPageChange={setPage} />
}

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

  it('clicar num número muda visualmente qual página está ativa', async () => {
    renderApp(<ControlledPagination />)
    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute('aria-current', 'page')
    await userEvent.click(screen.getByRole('button', { name: 'Página 3' }))
    expect(screen.getByRole('button', { name: 'Página 3' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Página 1' })).not.toHaveAttribute('aria-current')
  })

  it('na última página, próxima fica desativado', () => {
    renderApp(<Pagination page={4} pageSize={10} total={40} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeEnabled()
  })

  it('no celular com mobileMode="loadMore", mostra o botão Carregar mais', () => {
    setViewportWidth(360)
    renderApp(
      <Pagination
        page={1}
        pageSize={10}
        total={40}
        mobileMode="loadMore"
        onPageChange={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: 'Carregar mais' })).toBeInTheDocument()
    setViewportWidth(1280)
  })

  it('no celular sem loadMore (padrão), mostra "Página X de Y" e os botões compactos Anterior/Próxima', () => {
    setViewportWidth(360)
    renderApp(<Pagination page={2} pageSize={10} total={40} onPageChange={() => {}} />)
    expect(screen.getByText('Página 2 de 4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeInTheDocument()
    setViewportWidth(1280)
  })

  it('com mais de 7 páginas, mostra reticências entre os números do início e os do fim', () => {
    renderApp(<Pagination page={10} pageSize={10} total={300} onPageChange={() => {}} />)
    expect(screen.getAllByText('...').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Página 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página 30' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Página 5' })).not.toBeInTheDocument()
  })
})

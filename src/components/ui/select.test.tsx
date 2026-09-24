// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Select } from './select'

const options = [
  { value: 'sp', label: 'São Paulo' },
  { value: 'rj', label: 'Rio de Janeiro' },
  { value: 'mg', label: 'Minas Gerais' },
]

const open = () => userEvent.click(screen.getByRole('combobox', { name: 'Estado' }))

describe('Select', () => {
  it('abre a lista e escolhe uma opção', async () => {
    const onChange = vi.fn()
    render(<Select label="Estado" options={options} onChange={onChange} />)
    await open()
    await userEvent.click(await screen.findByRole('option', { name: /Rio de Janeiro/ }))
    expect(onChange).toHaveBeenCalledWith('rj')
    expect(screen.getByRole('combobox', { name: 'Estado' })).toHaveTextContent('Rio de Janeiro')
  })

  it('com busca, filtra as opções pelo texto', async () => {
    render(<Select label="Estado" options={options} searchable />)
    await open()
    await userEvent.type(await screen.findByPlaceholderText('Buscar...'), 'minas')
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1))
    expect(screen.getByRole('option', { name: /Minas Gerais/ })).toBeInTheDocument()
  })

  it('múltiplo: marca várias e selecionar todos marca o resto', async () => {
    const onChange = vi.fn()
    render(<Select label="Estado" options={options} multiple selectAll onChange={onChange} />)
    await open()
    await userEvent.click(await screen.findByRole('option', { name: /São Paulo/ }))
    expect(onChange).toHaveBeenLastCalledWith(['sp'])
    await userEvent.click(screen.getByRole('option', { name: /Selecionar todos/ }))
    expect(onChange).toHaveBeenLastCalledWith(['sp', 'rj', 'mg'])
  })

  it('cria uma opção nova a partir do texto digitado', async () => {
    const onCreate = vi.fn((label: string) => ({ value: 'es', label }))
    const onChange = vi.fn()
    render(
      <Select
        label="Estado"
        options={options}
        searchable
        creatable
        onCreate={onCreate}
        onChange={onChange}
      />,
    )
    await open()
    await userEvent.type(await screen.findByPlaceholderText('Buscar ou criar...'), 'Espírito Santo')
    await userEvent.click(await screen.findByRole('option', { name: /Criar/ }))
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('es'))
    expect(onCreate).toHaveBeenCalledWith('Espírito Santo')
  })

  it('limpar volta para vazio', async () => {
    const onChange = vi.fn()
    render(<Select label="Estado" options={options} value="sp" clearable onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Limpar seleção' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('desativado não abre', async () => {
    render(<Select label="Estado" options={options} disabled />)
    await open()
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })
})

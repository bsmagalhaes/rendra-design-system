// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { LookupResult } from '@/hooks/use-lookup'
import { Input } from './input'

afterEach(() => vi.unstubAllGlobals())

describe('Input', () => {
  it('sem máscara, devolve o texto digitado', async () => {
    const onChange = vi.fn()
    render(<Input aria-label="Nome" onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('Nome'), 'Ana')
    expect(onChange).toHaveBeenLastCalledWith('Ana')
  })

  it('aplica a máscara de CPF e entrega o valor sem máscara', async () => {
    const onValueChange = vi.fn()
    render(<Input aria-label="CPF" mask="cpf" onValueChange={onValueChange} />)
    const input = screen.getByLabelText('CPF')
    await userEvent.type(input, '12345678901')
    expect(input).toHaveValue('123.456.789-01')
    expect(onValueChange).toHaveBeenLastCalledWith('12345678901', '123.456.789-01')
  })

  it('moeda: entrega centavos inteiros', async () => {
    const onCentsChange = vi.fn()
    render(<Input aria-label="Valor" mask="currency" onCentsChange={onCentsChange} />)
    await userEvent.type(screen.getByLabelText('Valor'), '1250,5')
    expect(onCentsChange).toHaveBeenLastCalledWith(125050)
  })

  it('limpar esvazia o campo e avisa', async () => {
    const onChange = vi.fn()
    render(<Input aria-label="Busca" clearable defaultValue="abc" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Limpar campo' }))
    expect(screen.getByLabelText('Busca')).toHaveValue('')
    expect(onChange).toHaveBeenLastCalledWith('')
  })

  it('senha: mostra e oculta o texto', async () => {
    render(<Input aria-label="Senha" type="password" />)
    const input = screen.getByLabelText('Senha')
    expect(input).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(input).toHaveAttribute('type', 'text')
  })

  it('CEP completo: busca sozinho e entrega o endereço', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        cep: '01001-000',
        logradouro: 'Praça da Sé',
        complemento: '',
        bairro: 'Sé',
        localidade: 'São Paulo',
        uf: 'SP',
      }),
    })
    vi.stubGlobal('fetch', fetch)
    const results: LookupResult[] = []
    render(<Input aria-label="CEP" mask="cep" onLookup={(r) => results.push(r)} />)
    await userEvent.type(screen.getByLabelText('CEP'), '01001000')
    await waitFor(() => expect(results.at(-1)?.status).toBe('found'))
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0]?.[0]).toContain('viacep.com.br/ws/01001000')
    const last = results.at(-1)
    expect(last?.status === 'found' && last.kind === 'cep' && last.data.cidade).toBe('São Paulo')
    expect(results[0]?.status).toBe('loading')
  })

  it('CEP incompleto não busca', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    render(<Input aria-label="CEP" mask="cep" onLookup={() => {}} />)
    await userEvent.type(screen.getByLabelText('CEP'), '0100')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('CPF ou CNPJ: busca só quando é CNPJ', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) })
    vi.stubGlobal('fetch', fetch)
    const onLookup = vi.fn()
    render(<Input aria-label="Documento" mask="cpfCnpj" onLookup={onLookup} />)
    const input = screen.getByLabelText('Documento')
    await userEvent.type(input, '12345678901')
    expect(fetch).not.toHaveBeenCalled()
    await userEvent.clear(input)
    await userEvent.type(input, '11222333000181')
    await waitFor(() =>
      expect(onLookup).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'not-found', kind: 'cnpj' }),
      ),
    )
  })
})

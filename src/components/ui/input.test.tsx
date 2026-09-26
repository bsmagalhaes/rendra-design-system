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
    expect(screen.getByLabelText('Nome').closest('[data-rendra="CAMP-001"]')).toBeInTheDocument()
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

describe('Input com unidades (A9)', () => {
  it('percentual: aplica a máscara com teto configurável (percentMax)', async () => {
    render(<Input aria-label="Desconto" units={[{ id: 'percent', label: '%' }]} percentMax={50} />)
    const input = screen.getByLabelText('Desconto') as HTMLInputElement
    await userEvent.type(input, '9999')
    const numeric = Number(input.value.replace(/[^\d,]/g, '').replace(',', '.'))
    expect(numeric).toBeLessThanOrEqual(50)
  })

  it('moeda: entrega centavos inteiros (R$ 1.250,00)', async () => {
    const onCentsChange = vi.fn()
    render(
      <Input
        aria-label="Valor"
        units={[{ id: 'currency', label: 'R$' }]}
        onCentsChange={onCentsChange}
      />,
    )
    await userEvent.type(screen.getByLabelText('Valor'), '1250,5')
    expect(onCentsChange).toHaveBeenLastCalledWith(125050)
  })

  it('unidade livre (sem máscara): troca só o rótulo do seletor', async () => {
    render(
      <Input
        aria-label="Peso"
        units={[
          { id: 'kg', label: 'kg' },
          { id: 'cm', label: 'cm' },
        ]}
      />,
    )
    expect(screen.getByLabelText('Unidade: kg')).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Unidade: kg'), 'cm')
    expect(screen.getByLabelText('Unidade: cm')).toBeInTheDocument()
  })

  it('trocar de unidade limpa o valor do campo', async () => {
    const onChange = vi.fn()
    render(
      <Input
        aria-label="Peso"
        units={[
          { id: 'kg', label: 'kg' },
          { id: 'cm', label: 'cm' },
        ]}
        onChange={onChange}
      />,
    )
    const input = screen.getByLabelText('Peso')
    await userEvent.type(input, '150')
    expect(input).toHaveValue('150')
    await userEvent.selectOptions(screen.getByLabelText('Unidade: kg'), 'cm')
    expect(screen.getByLabelText('Peso')).toHaveValue('')
    expect(onChange).toHaveBeenLastCalledWith('')
  })
})

describe('Input variant="secret" (A10)', () => {
  it('com valor salvo, mostra a dica mascarada e nunca o campo real', () => {
    render(<Input aria-label="Chave de API" variant="secret" hasValue maskedHint="••••••a1b2c3" />)
    expect(screen.getByText('••••••a1b2c3')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Chave de API')).not.toBeInTheDocument()
  })

  it('sem valor salvo, avisa que não há nada guardado', () => {
    render(<Input aria-label="Chave de API" variant="secret" hasValue={false} />)
    expect(screen.getByText('Nenhum valor salvo')).toBeInTheDocument()
  })

  it('"Trocar" chama onStartEdit', async () => {
    const onStartEdit = vi.fn()
    render(
      <Input
        aria-label="Chave de API"
        variant="secret"
        hasValue
        maskedHint="••••••a1b2c3"
        onStartEdit={onStartEdit}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Trocar' }))
    expect(onStartEdit).toHaveBeenCalledTimes(1)
  })

  it('em edição, o campo abre vazio e o valor salvo não aparece no DOM', () => {
    const { container } = render(
      <Input
        aria-label="Chave de API"
        variant="secret"
        hasValue
        isEditing
        maskedHint="••••••a1b2c3"
      />,
    )
    expect(container.innerHTML).not.toContain('a1b2c3')
    const input = screen.getByLabelText('Chave de API')
    expect(input).toHaveValue('')
  })

  it('"Cancelar" chama onCancelEdit e volta para a máscara', async () => {
    const onCancelEdit = vi.fn()
    render(
      <Input
        aria-label="Chave de API"
        variant="secret"
        hasValue
        isEditing
        onCancelEdit={onCancelEdit}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancelEdit).toHaveBeenCalledTimes(1)
  })

  it('"Remover" com removing mostra o carregamento e desabilita o botão', () => {
    const onRemove = vi.fn()
    render(
      <Input
        aria-label="Chave de API"
        variant="secret"
        hasValue
        maskedHint="••••••a1b2c3"
        onRemove={onRemove}
        removing
      />,
    )
    expect(screen.getByRole('button', { name: 'Remover' })).toBeDisabled()
  })
})

// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { LookupResult } from '@/hooks/use-lookup'
import { Field } from './field'
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

  it('moeda: mostra R$ 1.250,50 no campo e entrega centavos inteiros', async () => {
    const onCentsChange = vi.fn()
    render(
      <Input
        aria-label="Valor"
        units={[{ id: 'currency', label: 'R$' }]}
        onCentsChange={onCentsChange}
      />,
    )
    await userEvent.type(screen.getByLabelText('Valor'), '1250,50')
    expect(screen.getByLabelText('Valor')).toHaveValue('R$ 1.250,50')
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

/** Envolve o Input secret com o estado que a tela real mantém, para o teste ver a troca de tela real (máscara <-> campo vazio), não só a chamada do callback. */
function SecretField({
  initialHasValue = true,
  onRemoveSpy,
}: {
  initialHasValue?: boolean
  onRemoveSpy?: () => void
}) {
  const [hasValue, setHasValue] = useState(initialHasValue)
  const [isEditing, setIsEditing] = useState(false)
  return (
    <Input
      aria-label="Chave de API"
      variant="secret"
      hasValue={hasValue}
      maskedHint="••••••a1b2c3"
      isEditing={isEditing}
      onStartEdit={() => setIsEditing(true)}
      onCancelEdit={() => setIsEditing(false)}
      onRemove={() => {
        onRemoveSpy?.()
        setHasValue(false)
        setIsEditing(false)
      }}
    />
  )
}

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

  it('dentro de um Field, o Label aponta para um elemento que existe de verdade (o botão Trocar)', () => {
    render(
      <Field label="Chave de API" help="Nunca aparece em texto puro.">
        <Input variant="secret" hasValue maskedHint="••••••a1b2c3" />
      </Field>,
    )
    // getByLabelText só encontra isto se o id do Field bater com o id de algum elemento:
    // antes da correção, o modo leitura não tinha <input> nenhum e não repassava id, e essa
    // busca falhava (o Label ficava com htmlFor apontando para nada).
    const control = screen.getByLabelText('Chave de API')
    expect(control.tagName).toBe('BUTTON')
    expect(control).toHaveTextContent('Trocar')
    expect(control).toHaveAttribute('aria-describedby')
  })

  it('"Trocar" troca a dica mascarada por um campo vazio e editável', async () => {
    render(<SecretField />)
    expect(screen.getByText('••••••a1b2c3')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Trocar' }))
    expect(screen.queryByText('••••••a1b2c3')).not.toBeInTheDocument()
    const input = screen.getByLabelText('Chave de API')
    expect(input).toHaveValue('')
    await userEvent.type(input, 'nova-chave')
    expect(input).toHaveValue('nova-chave')
  })

  it('em edição, o campo abre vazio e o valor salvo não aparece em lugar nenhum do DOM', () => {
    const segredoReal = 'sk-live-nao-pode-vazar-987654'
    const { container } = render(
      <Input
        aria-label="Chave de API"
        variant="secret"
        hasValue
        isEditing
        value={segredoReal}
        defaultValue={segredoReal}
        maskedHint="••••••a1b2c3"
      />,
    )
    expect(container.innerHTML).not.toContain(segredoReal)
    expect(container.innerHTML).not.toContain('a1b2c3')
    const input = screen.getByLabelText('Chave de API')
    expect(input).toHaveValue('')
  })

  it('"Cancelar" descarta o campo aberto e volta a mostrar a máscara', async () => {
    render(<SecretField />)
    await userEvent.click(screen.getByRole('button', { name: 'Trocar' }))
    expect(screen.getByLabelText('Chave de API')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByText('••••••a1b2c3')).toBeInTheDocument()
    expect(screen.queryByLabelText('Chave de API')).not.toBeInTheDocument()
  })

  it('"Remover" tira a dica mascarada e mostra "Nenhum valor salvo"', async () => {
    const onRemoveSpy = vi.fn()
    render(<SecretField onRemoveSpy={onRemoveSpy} />)
    await userEvent.click(screen.getByRole('button', { name: 'Remover' }))
    expect(onRemoveSpy).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('••••••a1b2c3')).not.toBeInTheDocument()
    expect(screen.getByText('Nenhum valor salvo')).toBeInTheDocument()
  })

  it('"Remover" com removing mostra o carregamento e desabilita o botão', () => {
    render(
      <Input
        aria-label="Chave de API"
        variant="secret"
        hasValue
        maskedHint="••••••a1b2c3"
        onRemove={() => {}}
        removing
      />,
    )
    const button = screen.getByRole('button', { name: 'Remover' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })
})

// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Form, FormField, FormSection } from './form'
import { Input } from './input'

function Harness() {
  const form = useForm({ defaultValues: { nome: '' } })
  return (
    <Form form={form} onSubmit={() => {}}>
      <FormSection title="Dados">
        <FormField name="nome" label="Nome" render={(f) => <Input {...f} />} />
      </FormSection>
    </Form>
  )
}

interface Dados {
  nome: string
}

/** Resolvedor simples (o projeto não depende do zod): "nome" é obrigatório. */
const resolver: Resolver<Dados> = async (values) => {
  if (!values.nome) {
    return {
      values: {},
      errors: { nome: { type: 'required', message: 'Informe o nome.' } },
    } as Awaited<ReturnType<Resolver<Dados>>>
  }
  return { values, errors: {} } as Awaited<ReturnType<Resolver<Dados>>>
}

function HarnessValidado() {
  const form = useForm<Dados>({ defaultValues: { nome: '' }, resolver })
  const [saved, setSaved] = useState(false)
  return (
    <Form form={form} onSubmit={() => setSaved(true)}>
      <FormSection title="Dados">
        <FormField name="nome" label="Nome" required render={(f) => <Input {...f} />} />
      </FormSection>
      <button type="submit">Salvar</button>
      {saved && <p>Salvo com sucesso.</p>}
    </Form>
  )
}

describe('Form e FormSection', () => {
  it('usam os códigos do catálogo (FormSection sobrepõe o do Card em que se apoia)', () => {
    renderApp(<Harness />)
    const form = screen.getByRole('textbox', { name: 'Nome' }).closest('form')
    expect(form).toHaveAttribute('data-rendra', 'FORM-001')
    const section = screen.getByRole('heading', { name: 'Dados' }).closest('[data-rendra]')
    expect(section).toHaveAttribute('data-rendra', 'FORM-002')
  })

  it('submeter com campo obrigatório vazio mostra o texto de erro abaixo do campo', async () => {
    renderApp(<HarnessValidado />)
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Informe o nome.')
    expect(screen.queryByText('Salvo com sucesso.')).not.toBeInTheDocument()
  })

  it('submeter válido mostra o efeito de sucesso, sem o texto de erro', async () => {
    renderApp(<HarnessValidado />)
    await userEvent.type(screen.getByRole('textbox', { name: /^Nome/ }), 'Ana')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('Salvo com sucesso.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

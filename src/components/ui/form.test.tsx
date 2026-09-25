// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
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

describe('Form e FormSection', () => {
  it('usam os códigos do catálogo (FormSection sobrepõe o do Card em que se apoia)', () => {
    renderApp(<Harness />)
    const form = screen.getByRole('textbox', { name: 'Nome' }).closest('form')
    expect(form).toHaveAttribute('data-rendra', 'FORM-001')
    const section = screen.getByRole('heading', { name: 'Dados' }).closest('[data-rendra]')
    expect(section).toHaveAttribute('data-rendra', 'FORM-002')
  })
})

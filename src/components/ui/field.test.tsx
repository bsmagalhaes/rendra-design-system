// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Field } from './field'
import { Input } from './input'

describe('Field', () => {
  it('liga rótulo, ajuda e obrigatório ao controle', () => {
    renderApp(
      <Field label="E-mail" help="Usado para entrar." required>
        <Input />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: /E-mail/ })
    expect(input).toHaveAccessibleDescription('Usado para entrar.')
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('erro substitui a ajuda e marca o campo como inválido', () => {
    renderApp(
      <Field label="E-mail" help="Usado para entrar." error="E-mail inválido">
        <Input />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: /E-mail/ })
    expect(input).toHaveAccessibleDescription('E-mail inválido')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText('Usado para entrar.')).not.toBeInTheDocument()
  })
})

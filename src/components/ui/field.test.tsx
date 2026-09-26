// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Field } from './field'
import { Input } from './input'

describe('Field', () => {
  it('liga rótulo, ajuda e obrigatório ao controle', () => {
    const { container } = renderApp(
      <Field label="E-mail" help="Usado para entrar." required>
        <Input />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: /E-mail/ })
    expect(input).toHaveAccessibleDescription('Usado para entrar.')
    expect(screen.getByText('*')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="FLD-001"]')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="FLD-002"]')).toBeInTheDocument()
  })

  it('rótulo e ajuda usam os tokens de estilo do campo, com o asterisco visível', () => {
    const { container } = renderApp(
      <Field label="Nome" help="Como no documento." required>
        <Input />
      </Field>,
    )
    const label = container.querySelector('[data-rendra="FLD-002"]')
    expect(label).toHaveClass('text-label', 'text-label-foreground', 'label-case')
    expect(label).not.toHaveClass('text-sm')
    expect(screen.getByText('*')).not.toHaveClass('sr-only')
    expect(screen.getByText('Como no documento.')).toHaveClass('text-help', 'text-help-foreground')
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

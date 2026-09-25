// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { ButtonGroup } from './button-group'

describe('ButtonGroup', () => {
  it('modo segmentado escolhe uma opção e usa o código do catálogo', async () => {
    const onChange = vi.fn()
    renderApp(
      <ButtonGroup
        aria-label="Visão"
        value="mes"
        onChange={onChange}
        options={[
          { value: 'mes', label: 'Mês' },
          { value: 'semana', label: 'Semana' },
        ]}
      />,
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Semana' }))
    expect(onChange).toHaveBeenCalledWith('semana')
    expect(screen.getByRole('radiogroup', { name: 'Visão' })).toHaveAttribute(
      'data-rendra',
      'BTNG-001',
    )
  })
})

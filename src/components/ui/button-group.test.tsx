// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { ButtonGroup } from './button-group'

/** ButtonGroup é controlado: só o chamador guarda o valor selecionado. */
function GrupoControlado() {
  const [value, setValue] = useState('mes')
  return (
    <ButtonGroup
      aria-label="Visão"
      value={value}
      onChange={setValue}
      options={[
        { value: 'mes', label: 'Mês' },
        { value: 'semana', label: 'Semana' },
      ]}
    />
  )
}

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

  it('marca a opção selecionada e desmarca a anterior ao escolher outra', async () => {
    renderApp(<GrupoControlado />)
    const mes = screen.getByRole('radio', { name: 'Mês' })
    const semana = screen.getByRole('radio', { name: 'Semana' })
    expect(mes).toHaveAttribute('aria-checked', 'true')
    expect(semana).toHaveAttribute('aria-checked', 'false')

    await userEvent.click(semana)

    expect(semana).toHaveAttribute('aria-checked', 'true')
    expect(mes).toHaveAttribute('aria-checked', 'false')
  })
})

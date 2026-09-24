// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { Checkbox, CheckboxGroup } from './checkbox'

describe('Checkbox e CheckboxGroup', () => {
  it('marca pelo rótulo', async () => {
    const onCheckedChange = vi.fn()
    renderApp(<Checkbox label="Aceito os termos" onCheckedChange={onCheckedChange} />)
    await userEvent.click(screen.getByText('Aceito os termos'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('grupo com selecionar todos', async () => {
    const onChange = vi.fn()
    renderApp(
      <CheckboxGroup
        aria-label="Canais"
        selectAll
        options={[
          { value: 'email', label: 'E-mail' },
          { value: 'sms', label: 'SMS' },
        ]}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: /E-mail/ }))
    expect(onChange).toHaveBeenLastCalledWith(['email'])
    await userEvent.click(screen.getByRole('checkbox', { name: /todos/i }))
    expect(onChange).toHaveBeenLastCalledWith(['email', 'sms'])
  })
})

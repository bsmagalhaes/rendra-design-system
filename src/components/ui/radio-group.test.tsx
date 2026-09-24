// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { RadioGroup } from './radio-group'

describe('RadioGroup', () => {
  it('escolhe uma opção', async () => {
    const onChange = vi.fn()
    renderApp(
      <RadioGroup
        aria-label="Plano"
        options={[
          { value: 'basico', label: 'Básico' },
          { value: 'pro', label: 'Profissional' },
        ]}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('radio', { name: /Profissional/ }))
    expect(onChange).toHaveBeenCalledWith('pro')
  })
})

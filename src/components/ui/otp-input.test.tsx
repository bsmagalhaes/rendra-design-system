// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { OtpInput } from './otp-input'

describe('OtpInput', () => {
  it('colar o código preenche tudo e completa', async () => {
    const onComplete = vi.fn()
    function Harness() {
      const [v, setV] = useState('')
      return <OtpInput value={v} onChange={setV} onComplete={onComplete} />
    }
    const { container } = renderApp(<Harness />)
    const [first] = screen.getAllByRole('textbox')
    await userEvent.click(first!)
    await userEvent.paste('123456')
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith('123456'))
    expect(container.querySelector('[data-rendra="OTP-001"]')).toBeInTheDocument()
  })

  it('no celular usa o espaço menor entre as casas (44px de toque dentro de um card em 360px)', () => {
    const { container } = renderApp(<OtpInput value="" onChange={() => {}} />)
    const group = container.querySelector('[data-rendra="OTP-001"]')
    expect(group).toHaveClass('gap-1', 'sm:gap-2')
    expect(group).not.toHaveClass('gap-2')
  })
})

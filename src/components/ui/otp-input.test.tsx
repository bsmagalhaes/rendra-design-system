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
    renderApp(<Harness />)
    const [first] = screen.getAllByRole('textbox')
    await userEvent.click(first!)
    await userEvent.paste('123456')
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith('123456'))
  })
})

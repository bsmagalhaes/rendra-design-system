// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Textarea } from './textarea'

describe('Textarea', () => {
  it('conta os caracteres até o limite', async () => {
    function Harness() {
      const [v, setV] = useState('')
      return <Textarea aria-label="Observações" counter maxLength={20} value={v} onChange={setV} />
    }
    renderApp(<Harness />)
    await userEvent.type(screen.getByLabelText('Observações'), 'Olá')
    expect(screen.getByText(/3\s*\/\s*20/)).toBeInTheDocument()
    expect(screen.getByLabelText('Observações')).toHaveAttribute('data-rendra', 'TXT-001')
  })
})

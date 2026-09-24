// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { Switch } from './switch'

describe('Switch', () => {
  it('liga e desliga', async () => {
    const onCheckedChange = vi.fn()
    renderApp(<Switch label="Notificações" onCheckedChange={onCheckedChange} />)
    const sw = screen.getByRole('switch', { name: /Notificações/ })
    await userEvent.click(sw)
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
    expect(sw).toBeChecked()
  })
})

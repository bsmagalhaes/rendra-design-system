// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { DatePicker } from './date-picker'

describe('DatePicker', () => {
  it('o gatilho usa o código do catálogo', () => {
    renderApp(<DatePicker label="Data" />)
    expect(screen.getByRole('button', { name: 'Selecione a data' })).toHaveAttribute(
      'data-rendra',
      'DTP-001',
    )
  })
})

// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Calendar } from './calendar'

describe('Calendar', () => {
  it('usa o código do catálogo, sobrepondo o do Card em que se apoia', () => {
    renderApp(<Calendar aria-label="Agenda" events={[]} />)
    expect(screen.getByRole('region', { name: 'Agenda' })).toHaveAttribute('data-rendra', 'CAL-001')
  })
})

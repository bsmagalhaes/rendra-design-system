// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Timeline } from './timeline'

describe('Timeline', () => {
  it('usa o código do catálogo', () => {
    renderApp(<Timeline events={[{ id: '1', title: 'Criado', date: '22/09/2026 10:00' }]} />)
    expect(screen.getByText('Criado').closest('[data-rendra="TLN-001"]')).toBeInTheDocument()
  })
})

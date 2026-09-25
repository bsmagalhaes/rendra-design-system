// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Separator } from './separator'

describe('Separator', () => {
  it('usa o código do catálogo', () => {
    renderApp(<Separator />)
    expect(screen.getByRole('separator')).toHaveAttribute('data-rendra', 'SEP-001')
  })
})

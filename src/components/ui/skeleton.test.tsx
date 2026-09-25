// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('usa o código do catálogo', () => {
    const { container } = renderApp(<Skeleton className="h-4 w-24" />)
    expect(container.querySelector('[data-rendra="SKEL-001"]')).toBeInTheDocument()
  })
})

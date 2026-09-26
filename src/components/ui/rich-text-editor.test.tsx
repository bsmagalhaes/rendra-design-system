// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { RichTextEditor } from './rich-text-editor'

describe('RichTextEditor', () => {
  it('renderiza com o código do catálogo', () => {
    const { container } = renderApp(<RichTextEditor defaultValue="<p>Olá</p>" />)
    expect(container.querySelector('[data-rendra="RTE-001"]')).toBeInTheDocument()
  })
})

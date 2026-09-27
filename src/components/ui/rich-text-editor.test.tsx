// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { RichTextEditor } from './rich-text-editor'

/*
 * O Tiptap (ProseMirror) lê a seleção de texto do navegador com getClientRects e
 * elementFromPoint, que o jsdom não implementa. Os stubs ficam só neste arquivo, nunca em
 * src/test/setup.ts (publicado como test-utils para quem usa o pacote), porque só o teste
 * do editor de texto rico precisa deles.
 */
beforeAll(() => {
  Range.prototype.getClientRects = function () {
    return [] as unknown as DOMRectList
  }
  Range.prototype.getBoundingClientRect = function () {
    return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 } as DOMRect
  }
  document.elementFromPoint = () => null
})

/** Seleciona todo o texto de um elemento, como o usuário faria arrastando o mouse. */
function selectAllTextIn(el: Element) {
  const range = document.createRange()
  range.selectNodeContents(el)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
  fireEvent(document, new Event('selectionchange'))
}

function ValorForaDoEditor() {
  const [html, setHtml] = useState('')
  return (
    <div>
      <RichTextEditor onChange={setHtml} placeholder="Escreva aqui" />
      <p data-testid="fora-do-editor">{html}</p>
    </div>
  )
}

describe('RichTextEditor', () => {
  it('renderiza com o código do catálogo', () => {
    const { container } = renderApp(<RichTextEditor defaultValue="<p>Olá</p>" />)
    expect(container.querySelector('[data-rendra="RTE-001"]')).toBeInTheDocument()
  })

  it('digitar texto atualiza o valor exposto, refletido fora do editor', async () => {
    renderApp(<ValorForaDoEditor />)
    const editor = screen.getByRole('textbox', { name: 'Escreva aqui' })
    await userEvent.click(editor)
    await userEvent.type(editor, 'Bom dia')
    await waitFor(() => expect(screen.getByTestId('fora-do-editor')).toHaveTextContent('Bom dia'))
  })

  it('negrito e itálico no texto selecionado marcam o resultado com strong e em', async () => {
    const { container } = renderApp(<RichTextEditor defaultValue="<p>Olá mundo</p>" />)
    const editorRoot = container.querySelector('.ProseMirror') as HTMLElement
    const paragraph = editorRoot.querySelector('p')!

    // Foca o editor primeiro: o ProseMirror só lê a seleção do navegador enquanto o editor
    // está focado.
    await userEvent.click(paragraph)
    selectAllTextIn(paragraph)
    await userEvent.click(screen.getByRole('button', { name: 'Negrito (Ctrl+B)' }))
    await waitFor(() => expect(editorRoot.querySelector('strong')).toHaveTextContent('Olá mundo'))

    selectAllTextIn(editorRoot.querySelector('strong')!)
    await userEvent.click(screen.getByRole('button', { name: 'Itálico (Ctrl+I)' }))
    await waitFor(() => expect(editorRoot.querySelector('em')).toHaveTextContent('Olá mundo'))
  })
})

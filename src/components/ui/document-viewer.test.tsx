// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { DocumentViewer } from './document-viewer'

/*
 * pdfjs-dist é carregado por import() dinâmico (worker também), então o mock intercepta os
 * dois módulos como qualquer import estático: o vitest resolve pelo especificador, não pela
 * sintaxe de import.
 */
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({ default: 'worker-url-falso' }))

interface FakePage {
  getViewport: () => { width: number; height: number }
  render: () => { promise: Promise<void> }
}

function fakePage(): FakePage {
  return {
    getViewport: () => ({ width: 100, height: 140 }),
    render: () => ({ promise: Promise.resolve() }),
  }
}

function makeDoc(numPages: number) {
  return { numPages, getPage: vi.fn(async () => fakePage()) }
}

/** getDocument() devolve a tarefa de carregamento: é ela que tem destroy(), não o documento. */
function makeLoadingTask(promise: Promise<unknown>) {
  return { promise, destroy: vi.fn(async () => undefined) }
}

let getDocumentMock: (...args: unknown[]) => {
  promise: Promise<unknown>
  destroy: () => Promise<void>
}

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {},
  getDocument: (...args: unknown[]) => getDocumentMock(...args),
}))

afterEach(() => {
  vi.resetAllMocks()
})

describe('DocumentViewer: vazio', () => {
  it('url null mostra o estado vazio, sem tentar carregar nada', () => {
    getDocumentMock = vi.fn()
    const { container } = renderApp(<DocumentViewer url={null} title="Contrato" />)
    expect(screen.getByText('Nenhum documento selecionado')).toBeInTheDocument()
    expect(getDocumentMock).not.toHaveBeenCalled()
    expect(container.querySelector('[data-rendra="DOC-001"]')).toBeInTheDocument()
    expect(container.querySelector('[role="group"]')).toHaveAttribute('aria-label', 'Contrato')
  })
})

describe('DocumentViewer: carregando', () => {
  it('mostra o texto de carregamento antes do PDF resolver', () => {
    let resolveDoc: (doc: unknown) => void = () => {}
    getDocumentMock = vi.fn(() =>
      makeLoadingTask(
        new Promise((resolve) => {
          resolveDoc = resolve
        }),
      ),
    )
    renderApp(<DocumentViewer url="https://exemplo.com/a.pdf" title="Contrato" />)
    expect(screen.getByText('Carregando documento...')).toBeInTheDocument()
    // Libera a promessa para não vazar entre testes.
    resolveDoc(makeDoc(1))
  })
})

describe('DocumentViewer: erro declarado', () => {
  it('CORS ou arquivo inválido mostra a falha em português e o link para abrir em nova aba', async () => {
    // A mensagem crua do pdfjs (em inglês) nunca aparece para quem usa a tela.
    getDocumentMock = vi.fn(() =>
      makeLoadingTask(Promise.reject(new Error('Failed to fetch dynamically imported module'))),
    )
    renderApp(<DocumentViewer url="https://exemplo.com/a.pdf" title="Contrato" />)

    await waitFor(() =>
      expect(screen.getByText('Não foi possível abrir o documento')).toBeInTheDocument(),
    )
    expect(
      screen.getByText('O arquivo pode estar indisponível, corrompido ou bloqueado por CORS.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Failed to fetch/)).not.toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Abrir em nova aba/ })
    expect(link).toHaveAttribute('href', 'https://exemplo.com/a.pdf')
    expect(link).toHaveAttribute('target', '_blank')
  })
})

describe('DocumentViewer: libera a tarefa de carregamento (destroy)', () => {
  it('chama destroy() na tarefa anterior ao trocar de url', async () => {
    const firstTask = makeLoadingTask(Promise.resolve(makeDoc(1)))
    const secondTask = makeLoadingTask(Promise.resolve(makeDoc(1)))
    getDocumentMock = vi.fn().mockReturnValueOnce(firstTask).mockReturnValueOnce(secondTask)

    const { rerender } = renderApp(
      <DocumentViewer url="https://exemplo.com/a.pdf" title="Contrato" />,
    )
    await waitFor(() => expect(screen.getByLabelText('Aumentar zoom')).toBeInTheDocument())
    expect(firstTask.destroy).not.toHaveBeenCalled()

    rerender(<DocumentViewer url="https://exemplo.com/b.pdf" title="Contrato" />)
    await waitFor(() => expect(firstTask.destroy).toHaveBeenCalledTimes(1))
    expect(secondTask.destroy).not.toHaveBeenCalled()
  })

  it('chama destroy() na tarefa ao desmontar', async () => {
    const task = makeLoadingTask(Promise.resolve(makeDoc(1)))
    getDocumentMock = vi.fn(() => task)

    const { unmount } = renderApp(
      <DocumentViewer url="https://exemplo.com/a.pdf" title="Contrato" />,
    )
    await waitFor(() => expect(screen.getByLabelText('Aumentar zoom')).toBeInTheDocument())
    expect(task.destroy).not.toHaveBeenCalled()

    unmount()
    await waitFor(() => expect(task.destroy).toHaveBeenCalledTimes(1))
  })
})

describe('DocumentViewer: uma página', () => {
  it('não mostra navegação de página quando o documento tem uma página só', async () => {
    getDocumentMock = vi.fn(() => makeLoadingTask(Promise.resolve(makeDoc(1))))
    renderApp(<DocumentViewer url="https://exemplo.com/a.pdf" title="Contrato" />)

    await waitFor(() => expect(screen.getByLabelText('Aumentar zoom')).toBeInTheDocument())
    expect(screen.queryByLabelText('Próxima página')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Página anterior')).not.toBeInTheDocument()
  })
})

describe('DocumentViewer: várias páginas', () => {
  it('mostra navegação e avança de página ao clicar em Próxima página', async () => {
    const doc = makeDoc(3)
    getDocumentMock = vi.fn(() => makeLoadingTask(Promise.resolve(doc)))
    renderApp(<DocumentViewer url="https://exemplo.com/a.pdf" title="Contrato" />)

    await waitFor(() => expect(screen.getByText('1 de 3')).toBeInTheDocument())
    await userEvent.click(screen.getByLabelText('Próxima página'))
    await waitFor(() => expect(screen.getByText('2 de 3')).toBeInTheDocument())
    expect(doc.getPage).toHaveBeenCalledWith(2)
  })

  it('os botões de zoom têm o gesto no nome acessível', async () => {
    getDocumentMock = vi.fn(() => makeLoadingTask(Promise.resolve(makeDoc(2))))
    renderApp(<DocumentViewer url="https://exemplo.com/a.pdf" title="Contrato" />)
    await waitFor(() => expect(screen.getByLabelText('Aumentar zoom')).toBeInTheDocument())
    expect(screen.getByLabelText('Diminuir zoom')).toBeInTheDocument()
  })
})

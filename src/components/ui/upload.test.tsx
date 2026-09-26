// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { Upload } from './upload'

// jsdom não sabe gerar um blob: real a partir do File do Node/Vitest; o componente só
// precisa de uma string para a miniatura, então os testes substituem as duas funções.
const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL
beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:mock')
  URL.revokeObjectURL = vi.fn()
})
afterEach(() => {
  URL.createObjectURL = originalCreateObjectURL
  URL.revokeObjectURL = originalRevokeObjectURL
})

/** Ordem visível dos nomes de arquivo na tela (na ordem em que aparecem no DOM). */
function visibleFileNames() {
  return [...screen.getAllByText(/\.pdf$/)].map((el) => el.textContent)
}

describe('Upload', () => {
  it('recusa arquivo acima do limite e aceita o resto', async () => {
    const onChange = vi.fn()
    const { container } = renderApp(<Upload maxSizeMb={1} onChange={onChange} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const small = new File(['a'], 'contrato.pdf', { type: 'application/pdf' })
    const big = new File([new Uint8Array(2 * 1024 * 1024)], 'video.mp4', { type: 'video/mp4' })
    fireEvent.change(input, { target: { files: [small, big] } })
    expect(await screen.findByText('contrato.pdf')).toBeInTheDocument()
    expect(screen.getByText('Arquivo maior que 1 MB.')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalled()
    expect(container.querySelector('[data-rendra="UPL-001"]')).toBeInTheDocument()
  })

  it('layout gallery: mostra a miniatura, o progresso durante o envio e o sucesso ao terminar', async () => {
    let resolveUpload: () => void = () => {}
    const onUpload = vi.fn(
      (_file: File, onProgress: (pct: number) => void) =>
        new Promise<void>((resolve) => {
          onProgress(40)
          resolveUpload = resolve
        }),
    )
    const { container } = renderApp(<Upload layout="gallery" onUpload={onUpload} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const image = new File(['a'], 'foto.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [image] } })

    expect(await screen.findByText('foto.png')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="UPL-002"]')).toBeInTheDocument()
    expect(container.querySelector('img[src="blob:mock"]')).toBeInTheDocument()
    // Progresso visível: barra com role="progressbar" e o valor no aria-valuenow.
    const bar = screen.getByRole('progressbar', { name: 'Enviando foto.png' })
    expect(bar).toHaveAttribute('aria-valuenow', '40')
    expect(screen.queryByRole('img', { name: 'Enviado' })).not.toBeInTheDocument()

    resolveUpload()
    expect(await screen.findByRole('img', { name: 'Enviado' })).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('maxItems esconde a área de soltar arquivo ao chegar no limite', async () => {
    const { container } = renderApp(<Upload maxItems={1} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, {
      target: { files: [new File(['a'], 'um.pdf', { type: 'application/pdf' })] },
    })
    await screen.findByText('um.pdf')
    expect(container.querySelector('input[type="file"]')).not.toBeInTheDocument()
  })

  it('remover chama onRemove e o arquivo some da tela', async () => {
    const onRemove = vi.fn()
    const { container } = renderApp(<Upload onRemove={onRemove} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, {
      target: { files: [new File(['a'], 'doc.pdf', { type: 'application/pdf' })] },
    })
    await screen.findByText('doc.pdf')
    fireEvent.click(screen.getByRole('button', { name: 'Remover doc.pdf' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('doc.pdf')).not.toBeInTheDocument()
  })

  it('tentar de novo chama onRetry e, ao terminar, o sucesso fica visível (não repete o erro)', async () => {
    const onRetry = vi.fn()
    const onUpload = vi
      .fn()
      .mockRejectedValueOnce(new Error('Servidor recusou.'))
      .mockResolvedValueOnce(undefined)
    const { container } = renderApp(<Upload onUpload={onUpload} onRetry={onRetry} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, {
      target: { files: [new File(['a'], 'doc.pdf', { type: 'application/pdf' })] },
    })
    expect(await screen.findByText('Servidor recusou.')).toBeInTheDocument()

    const retryButton = screen.getByRole('button', { name: 'Tentar enviar doc.pdf de novo' })
    fireEvent.click(retryButton)
    expect(onRetry).toHaveBeenCalledTimes(1)

    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(2))
    expect(await screen.findByRole('img', { name: 'Enviado' })).toBeInTheDocument()
    expect(screen.queryByText('Servidor recusou.')).not.toBeInTheDocument()
  })

  it('onReorder: a alça aparece só com onReorder e a seta ↓ troca a ordem visível dos arquivos', async () => {
    const onReorder = vi.fn()
    const { container } = renderApp(<Upload onReorder={onReorder} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, {
      target: {
        files: [
          new File(['a'], 'a.pdf', { type: 'application/pdf' }),
          new File(['b'], 'b.pdf', { type: 'application/pdf' }),
        ],
      },
    })
    await screen.findByText('a.pdf')
    expect(visibleFileNames()).toEqual(['a.pdf', 'b.pdf'])
    const handle = screen.getByRole('button', { name: 'Reordenar a.pdf' })
    fireEvent.keyDown(handle, { key: 'ArrowDown' })
    expect(visibleFileNames()).toEqual(['b.pdf', 'a.pdf'])
    expect(onReorder).toHaveBeenCalledWith(expect.arrayContaining([expect.any(String)]))
  })

  it('sem onReorder, a alça de arraste não aparece', async () => {
    const { container } = renderApp(<Upload />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, {
      target: { files: [new File(['a'], 'doc.pdf', { type: 'application/pdf' })] },
    })
    await screen.findByText('doc.pdf')
    expect(screen.queryByRole('button', { name: 'Reordenar doc.pdf' })).not.toBeInTheDocument()
  })

  it('com crop, a imagem só vira item visível da lista depois de confirmada no recorte', async () => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = (() => ({ drawImage: () => {} })) as typeof original
    HTMLCanvasElement.prototype.toBlob = function (cb, type) {
      cb(new Blob(['x'], { type: type ?? 'image/png' }))
    }
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 200 })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 200 })

    const { container } = renderApp(
      <Upload crop={{ aspects: [{ id: 'quadrado', label: 'Quadrado', ratio: 1 }] }} />,
    )
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const image = new File(['a'], 'foto.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [image] } })

    // O recorte aparece antes do item entrar na lista; nada de "foto.png" na tela ainda.
    expect(container.querySelector('[data-rendra="CROP-001"]')).toBeInTheDocument()
    expect(screen.queryByText('foto.png')).not.toBeInTheDocument()

    const img = container.querySelector('[data-rendra="CROP-001"] img')!
    Object.defineProperty(img, 'naturalWidth', { value: 400, configurable: true })
    Object.defineProperty(img, 'naturalHeight', { value: 400, configurable: true })
    fireEvent.load(img)
    fireEvent.click(await screen.findByRole('button', { name: 'Recortar' }))

    expect(await screen.findByText('foto.png')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="CROP-001"]')).not.toBeInTheDocument()
    HTMLCanvasElement.prototype.getContext = original
  })
})

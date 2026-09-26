// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { computeCropGeometry, ImageCropper } from './image-cropper'

const square = { id: 'square', label: 'Quadrado', ratio: 1 }
const wide = { id: 'wide', label: 'Paisagem', ratio: 16 / 9 }

// jsdom não sabe ler o File nativo do Node para gerar um blob: real; o componente só
// precisa de uma URL para o <img src>, então o teste substitui as duas funções.
const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL
// jsdom não implementa canvas de verdade (precisaria do pacote nativo "canvas"): simula um
// contexto 2D mínimo, só com o que o componente chama (drawImage) e toBlob síncrono.
const originalGetContext = HTMLCanvasElement.prototype.getContext
const originalToBlob = HTMLCanvasElement.prototype.toBlob
// jsdom não faz layout de verdade: a moldura sempre mediria 0x0. Fixa um tamanho para o
// motor da geometria ter o que calcular.
const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
const originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
/** Tamanho do canvas criado por confirm(), no momento em que ele chama toBlob. */
let lastCanvasSize: { width: number; height: number } | null = null
beforeEach(() => {
  lastCanvasSize = null
  URL.createObjectURL = vi.fn(() => 'blob:mock')
  URL.revokeObjectURL = vi.fn()
  // @ts-expect-error simula só o que o componente usa do CanvasRenderingContext2D
  HTMLCanvasElement.prototype.getContext = () => ({ drawImage: () => {} })
  HTMLCanvasElement.prototype.toBlob = function (cb, type) {
    lastCanvasSize = { width: this.width, height: this.height }
    cb(new Blob(['recorte'], { type: type ?? 'image/png' }))
  }
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 200 })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 200 })
})
afterEach(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext
  HTMLCanvasElement.prototype.toBlob = originalToBlob
  if (originalClientWidth)
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', originalClientWidth)
  if (originalClientHeight)
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', originalClientHeight)
})

describe('computeCropGeometry', () => {
  it('sem arraste e sem zoom, o retângulo de origem tem a proporção da moldura', () => {
    const g = computeCropGeometry({
      imageWidth: 400,
      imageHeight: 800,
      frameWidth: 200,
      frameHeight: 200,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    })
    expect(g.source.width / g.source.height).toBeCloseTo(1, 5)
    // A imagem é mais alta que larga: a escala mínima para cobrir vem da largura.
    expect(g.scale).toBeCloseTo(200 / 400, 5)
  })

  it('o retângulo de origem nunca sai dos limites da imagem (a imagem não descola da moldura)', () => {
    const g = computeCropGeometry({
      imageWidth: 400,
      imageHeight: 300,
      frameWidth: 200,
      frameHeight: 200,
      zoom: 1,
      // Arraste enorme, muito além do que a sobra permite.
      offsetX: 100_000,
      offsetY: 100_000,
    })
    expect(g.source.x).toBeGreaterThanOrEqual(-0.001)
    expect(g.source.y).toBeGreaterThanOrEqual(-0.001)
    expect(g.source.x + g.source.width).toBeLessThanOrEqual(400 + 0.001)
    expect(g.source.y + g.source.height).toBeLessThanOrEqual(300 + 0.001)
  })

  it('zoom maior estreita o retângulo de origem (mostra menos da imagem original)', () => {
    const base = {
      imageWidth: 400,
      imageHeight: 400,
      frameWidth: 200,
      frameHeight: 200,
      offsetX: 0,
      offsetY: 0,
    }
    const semZoom = computeCropGeometry({ ...base, zoom: 1 })
    const comZoom = computeCropGeometry({ ...base, zoom: 2 })
    expect(comZoom.source.width).toBeLessThan(semZoom.source.width)
    expect(comZoom.source.width / comZoom.source.height).toBeCloseTo(
      semZoom.source.width / semZoom.source.height,
      5,
    )
  })

  it('sem sobra (zoom 1, imagem do tamanho exato da moldura), o arraste não move nada', () => {
    const g = computeCropGeometry({
      imageWidth: 200,
      imageHeight: 200,
      frameWidth: 200,
      frameHeight: 200,
      zoom: 1,
      offsetX: 50,
      offsetY: 50,
    })
    expect(g.offsetX).toBe(0)
    expect(g.offsetY).toBe(0)
  })
})

describe('ImageCropper', () => {
  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    vi.restoreAllMocks()
  })

  it('usa o código do catálogo na moldura', () => {
    const file = new File(['a'], 'foto.png', { type: 'image/png' })
    const { container } = renderApp(
      <ImageCropper file={file} aspects={[square]} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(container.querySelector('[data-rendra="CROP-001"]')).toBeInTheDocument()
  })

  it('cancelar chama onCancel e nunca chama onConfirm', () => {
    const file = new File(['a'], 'foto.png', { type: 'image/png' })
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    renderApp(
      <ImageCropper
        file={file}
        aspects={[square, wide]}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('sem carregar a imagem, o botão de recortar fica desabilitado', () => {
    const file = new File(['a'], 'foto.png', { type: 'image/png' })
    renderApp(
      <ImageCropper file={file} aspects={[square]} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Recortar' })).toBeDisabled()
  })

  it('sem suporte a canvas, declara a falha e nunca chama onConfirm (nem mostra o botão de recortar)', () => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = (() => null) as typeof original
    const file = new File(['a'], 'foto.png', { type: 'image/png' })
    const onConfirm = vi.fn()
    renderApp(
      <ImageCropper file={file} aspects={[square]} onConfirm={onConfirm} onCancel={vi.fn()} />,
    )
    expect(screen.getByText('Não é possível recortar aqui')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Recortar' })).not.toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()
    HTMLCanvasElement.prototype.getContext = original
  })

  it('carregando a imagem, o botão de recortar habilita e o recorte final entrega um File nas dimensões esperadas', async () => {
    const file = new File(['a'], 'foto.png', { type: 'image/png' })
    const onConfirm = vi.fn()
    const { container } = renderApp(
      <ImageCropper file={file} aspects={[square]} onConfirm={onConfirm} onCancel={vi.fn()} />,
    )
    const img = container.querySelector('img')!
    // Moldura quadrada de 200x200 (mockada), imagem original 800x600: a escala mínima
    // para cobrir vem da altura (200/600), então o retângulo de origem sai em 600x600.
    Object.defineProperty(img, 'naturalWidth', { value: 800, configurable: true })
    Object.defineProperty(img, 'naturalHeight', { value: 600, configurable: true })
    fireEvent.load(img)

    await waitFor(() => expect(screen.getByRole('button', { name: 'Recortar' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Recortar' }))
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))
    const result = onConfirm.mock.calls[0]![0] as File
    expect(result).toBeInstanceOf(File)
    expect(result.name).toBe('foto.png')
    expect(result.type).toBe('image/png')
    expect(lastCanvasSize).toEqual({ width: 600, height: 600 })
  })

  it('maxOutputWidth encolhe a saída mantendo a proporção do recorte', async () => {
    const file = new File(['a'], 'foto.png', { type: 'image/png' })
    const onConfirm = vi.fn()
    const { container } = renderApp(
      <ImageCropper
        file={file}
        aspects={[square]}
        maxOutputWidth={300}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    )
    const img = container.querySelector('img')!
    Object.defineProperty(img, 'naturalWidth', { value: 800, configurable: true })
    Object.defineProperty(img, 'naturalHeight', { value: 600, configurable: true })
    fireEvent.load(img)

    await waitFor(() => expect(screen.getByRole('button', { name: 'Recortar' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Recortar' }))
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))
    // Sem o teto, sairia 600x600; com maxOutputWidth=300, sai 300x300 (mesma proporção 1:1).
    expect(lastCanvasSize).toEqual({ width: 300, height: 300 })
  })

  it('toBlob nulo declara a falha (mesma mensagem visível) e nunca chama onConfirm', async () => {
    HTMLCanvasElement.prototype.toBlob = function (cb) {
      cb(null)
    }
    const file = new File(['a'], 'foto.png', { type: 'image/png' })
    const onConfirm = vi.fn()
    const { container } = renderApp(
      <ImageCropper file={file} aspects={[square]} onConfirm={onConfirm} onCancel={vi.fn()} />,
    )
    const img = container.querySelector('img')!
    Object.defineProperty(img, 'naturalWidth', { value: 800, configurable: true })
    Object.defineProperty(img, 'naturalHeight', { value: 600, configurable: true })
    fireEvent.load(img)

    await waitFor(() => expect(screen.getByRole('button', { name: 'Recortar' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Recortar' }))

    expect(await screen.findByText('Não é possível recortar aqui')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Recortar' })).not.toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})

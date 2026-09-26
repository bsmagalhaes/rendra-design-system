// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { ImageViewer } from './image-viewer'

const images = [
  { src: '/a.png', alt: 'Fachada da loja' },
  { src: '/b.png', alt: 'Vitrine' },
  { src: '/c.png', alt: 'Interior' },
]

describe('ImageViewer', () => {
  it('aberto usa o código do catálogo', () => {
    renderApp(
      <ImageViewer
        images={[{ src: '/a.png', alt: 'Captura' }]}
        index={0}
        onIndexChange={() => {}}
      />,
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('data-rendra', 'IMG-001')
  })

  it('SVG do usuário como data: URL dentro de <img>: nunca executa (sem dangerouslySetInnerHTML)', () => {
    const marker = { pwned: false }
    ;(window as unknown as { __marker: typeof marker }).__marker = marker
    const evil =
      '<svg xmlns="http://www.w3.org/2000/svg"><script>window.__marker.pwned = true</script></svg>'
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(evil)}`
    renderApp(
      <ImageViewer
        images={[{ src: dataUrl, alt: 'Enviado pelo usuário' }]}
        index={0}
        onIndexChange={() => {}}
      />,
    )
    const img = screen.getByRole('img', { name: 'Enviado pelo usuário' })
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('src', dataUrl)
    expect(marker.pwned).toBe(false)
  })

  it('com uma imagem só, esconde anterior/próxima (mesmo no DOM) e mostra 1 de 1', () => {
    renderApp(<ImageViewer images={[images[0]!]} index={0} onIndexChange={() => {}} />)
    expect(screen.getByText('1 de 1')).toBeInTheDocument()
    const anterior = screen.getByRole('button', { name: 'Anterior' })
    expect(anterior.closest('div')).toHaveClass('hidden')
  })

  it('com mais de uma imagem, a seta do teclado troca e roda no início/fim', async () => {
    const onIndexChange = vi.fn()
    renderApp(<ImageViewer images={images} index={0} onIndexChange={onIndexChange} />)
    expect(screen.getByText('1 de 3')).toBeInTheDocument()
    await userEvent.keyboard('{ArrowRight}')
    expect(onIndexChange).toHaveBeenLastCalledWith(1)
    // Da primeira imagem (índice 0), a seta esquerda roda para a última.
    await userEvent.keyboard('{ArrowLeft}')
    expect(onIndexChange).toHaveBeenLastCalledWith(2)
  })

  it('os botões Anterior e Próxima trocam de imagem', async () => {
    const onIndexChange = vi.fn()
    renderApp(<ImageViewer images={images} index={1} onIndexChange={onIndexChange} />)
    await userEvent.click(screen.getByRole('button', { name: /Próxima/ }))
    expect(onIndexChange).toHaveBeenLastCalledWith(2)
    await userEvent.click(screen.getByRole('button', { name: /Anterior/ }))
    expect(onIndexChange).toHaveBeenLastCalledWith(0)
  })

  it('fechar chama onIndexChange(null)', async () => {
    const onIndexChange = vi.fn()
    renderApp(<ImageViewer images={images} index={0} onIndexChange={onIndexChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onIndexChange).toHaveBeenCalledWith(null)
  })

  it('arrastar para o lado (mobile) troca de imagem como um swipe', () => {
    const onIndexChange = vi.fn()
    renderApp(<ImageViewer images={images} index={0} onIndexChange={onIndexChange} />)
    const area = screen.getByRole('img', { name: 'Fachada da loja' }).parentElement!
    fireEvent.pointerDown(area, { clientX: 200 })
    fireEvent.pointerUp(area, { clientX: 100 })
    expect(onIndexChange).toHaveBeenLastCalledWith(1)
  })

  it('arrastar de menos de 48px não troca de imagem', () => {
    const onIndexChange = vi.fn()
    renderApp(<ImageViewer images={images} index={0} onIndexChange={onIndexChange} />)
    const area = screen.getByRole('img', { name: 'Fachada da loja' }).parentElement!
    fireEvent.pointerDown(area, { clientX: 200 })
    fireEvent.pointerUp(area, { clientX: 190 })
    expect(onIndexChange).not.toHaveBeenCalled()
  })

  it('index null: o visualizador fica fechado', () => {
    renderApp(<ImageViewer images={images} index={null} onIndexChange={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

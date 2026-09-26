// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { ImageViewer, type ViewerImage } from './image-viewer'

const images = [
  { src: '/a.png', alt: 'Fachada da loja' },
  { src: '/b.png', alt: 'Vitrine' },
  { src: '/c.png', alt: 'Interior' },
]

/** Envolve o ImageViewer com o estado que a tela real mantém, para o teste ver a imagem
 * exibida trocar de verdade (não só a chamada do onIndexChange). */
function ControlledViewer({
  initialIndex,
  onIndexChangeSpy,
  images: imgs = images,
}: {
  initialIndex: number | null
  onIndexChangeSpy?: (index: number | null) => void
  images?: ViewerImage[]
}) {
  const [index, setIndex] = useState(initialIndex)
  return (
    <ImageViewer
      images={imgs}
      index={index}
      onIndexChange={(i) => {
        onIndexChangeSpy?.(i)
        setIndex(i)
      }}
    />
  )
}

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

  it('com mais de uma imagem, a seta do teclado troca a imagem exibida e roda no início/fim', async () => {
    const onIndexChangeSpy = vi.fn()
    renderApp(<ControlledViewer initialIndex={0} onIndexChangeSpy={onIndexChangeSpy} />)
    expect(screen.getByText('1 de 3')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Fachada da loja' })).toBeInTheDocument()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByText('2 de 3')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Vitrine' })).toBeInTheDocument()
    expect(onIndexChangeSpy).toHaveBeenLastCalledWith(1)
    // Volta para a primeira; da primeira, a seta esquerda roda para a última.
    await userEvent.keyboard('{ArrowLeft}')
    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByText('3 de 3')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Interior' })).toBeInTheDocument()
  })

  it('os botões Anterior e Próxima trocam a imagem exibida', async () => {
    renderApp(<ControlledViewer initialIndex={1} />)
    expect(screen.getByRole('img', { name: 'Vitrine' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Próxima/ }))
    expect(screen.getByText('3 de 3')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Interior' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Anterior/ }))
    await userEvent.click(screen.getByRole('button', { name: /Anterior/ }))
    expect(screen.getByText('1 de 3')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Fachada da loja' })).toBeInTheDocument()
  })

  it('fechar tira o visualizador da árvore (fecha o diálogo)', async () => {
    const onIndexChangeSpy = vi.fn()
    renderApp(<ControlledViewer initialIndex={0} onIndexChangeSpy={onIndexChangeSpy} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onIndexChangeSpy).toHaveBeenCalledWith(null)
  })

  it('arrastar para o lado (mobile) troca de imagem como um swipe', () => {
    renderApp(<ControlledViewer initialIndex={0} />)
    const area = screen.getByRole('img', { name: 'Fachada da loja' }).parentElement!
    fireEvent.pointerDown(area, { clientX: 200 })
    fireEvent.pointerUp(area, { clientX: 100 })
    expect(screen.getByText('2 de 3')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Vitrine' })).toBeInTheDocument()
  })

  it('arrastar de menos de 48px não troca de imagem', () => {
    renderApp(<ControlledViewer initialIndex={0} />)
    const area = screen.getByRole('img', { name: 'Fachada da loja' }).parentElement!
    fireEvent.pointerDown(area, { clientX: 200 })
    fireEvent.pointerUp(area, { clientX: 190 })
    expect(screen.getByText('1 de 3')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Fachada da loja' })).toBeInTheDocument()
  })

  it('index null: o visualizador fica fechado', () => {
    renderApp(<ImageViewer images={images} index={null} onIndexChange={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

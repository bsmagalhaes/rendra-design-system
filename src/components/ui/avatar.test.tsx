// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Avatar, AvatarGroup } from './avatar'

describe('Avatar', () => {
  it('mostra as iniciais do nome e usa o código do catálogo', async () => {
    const { container } = renderApp(<Avatar name="Ana Souza" />)
    expect(await screen.findByText('AS')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="AVT-001"]')).toBeInTheDocument()
  })

  it('com imagem que falha ao carregar, cai de volta para as iniciais', async () => {
    // jsdom não carrega imagem de verdade: este stub simula o estado de erro que o
    // Radix Avatar lê de `window.Image` (complete=true, naturalWidth=0), só neste teste.
    const originalImage = window.Image
    class ImagemQuebrada {
      addEventListener() {}
      removeEventListener() {}
      set src(_value: string) {}
      get complete() {
        return true
      }
      get naturalWidth() {
        return 0
      }
    }
    window.Image = ImagemQuebrada as unknown as typeof Image
    try {
      renderApp(<Avatar name="Ana Souza" src="https://exemplo.com/foto.png" />)
      expect(await screen.findByText('AS')).toBeInTheDocument()
    } finally {
      window.Image = originalImage
    }
  })
})

describe('AvatarGroup', () => {
  it('mostra o excedente e usa o código do catálogo', () => {
    const { container } = renderApp(
      <AvatarGroup max={2} people={[{ name: 'Ana' }, { name: 'Bruno' }, { name: 'Carla' }]} />,
    )
    expect(screen.getByText('+1')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="AVT-002"]')).toBeInTheDocument()
  })
})

// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { ImageViewer } from './image-viewer'

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
})

// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { QrCode } from './qr-code'

describe('QrCode', () => {
  it('valor vazio mostra o estado vazio, sem gerar nenhum SVG', () => {
    const { container } = renderApp(<QrCode value="" />)
    expect(screen.getByText('Nenhum valor para gerar o QR Code.')).toBeInTheDocument()
    expect(container.querySelector('svg[role="img"]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-rendra="QRC-001"]')).toBeInTheDocument()
  })

  it('valor vazio aceita um texto próprio para o estado vazio', () => {
    renderApp(<QrCode value="" emptyLabel="Escolha um cliente para gerar o código." />)
    expect(screen.getByText('Escolha um cliente para gerar o código.')).toBeInTheDocument()
  })

  it('com valor, gera um SVG com módulos escuros e nome acessível padrão', () => {
    const { container } = renderApp(<QrCode value="RENDRA" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-label', 'Código QR de RENDRA')
    const path = container.querySelector('path')
    expect(path?.getAttribute('d')?.length).toBeGreaterThan(0)
    expect(path).toHaveAttribute('fill', 'currentColor')
  })

  it('aria-label customizado substitui o padrão', () => {
    const { container } = renderApp(<QrCode value="RENDRA" aria-label="QR do cliente Acme" />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-label', 'QR do cliente Acme')
  })

  it('valor grande demais para o nível pedido mostra a falha declarada, nunca quebra', () => {
    const enorme = 'x'.repeat(5000)
    const { container } = renderApp(<QrCode value={enorme} errorCorrection="high" />)
    expect(
      screen.getByText('Não foi possível gerar o QR Code: o valor é grande demais.'),
    ).toBeInTheDocument()
    expect(container.querySelector('svg[role="img"]')).not.toBeInTheDocument()
    expect(container.querySelector('[role="img"]')).toHaveAttribute(
      'aria-label',
      'Não foi possível gerar o QR Code: o valor é grande demais.',
    )
  })

  it('nível de correção mais alto pode exigir uma versão maior (matriz maior)', () => {
    const text = 'x'.repeat(60)
    const { container: lowContainer } = renderApp(<QrCode value={text} errorCorrection="low" />)
    const { container: highContainer } = renderApp(<QrCode value={text} errorCorrection="high" />)
    const lowViewBox = lowContainer.querySelector('svg')?.getAttribute('viewBox')
    const highViewBox = highContainer.querySelector('svg')?.getAttribute('viewBox')
    expect(lowViewBox).toBeTruthy()
    expect(highViewBox).toBeTruthy()
  })
})

// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { encodeQrMatrix } from '@/lib/qr-encode'
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

  it('com valor, o SVG renderizado tem o número de módulos escuros calculado pelo codificador', () => {
    // Vetor independente: chama o codificador direto (não passa pelo componente) para saber
    // quantos módulos escuros e qual o tamanho da matriz "RENDRA" (nível medium) deve ter.
    const expected = encodeQrMatrix('RENDRA', 'medium')
    const expectedDarkCount = expected.modules.reduce(
      (sum, row) => sum + row.filter(Boolean).length,
      0,
    )

    const { container } = renderApp(<QrCode value="RENDRA" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-label', 'Código QR de RENDRA')
    expect(svg).toHaveAttribute('viewBox', `0 0 ${expected.size} ${expected.size}`)

    const path = container.querySelector('path')
    expect(path).toHaveAttribute('fill', 'currentColor')
    // Um comando "M" por módulo escuro: contar os "M" no d prova que o SVG desenhou
    // exatamente os módulos que o codificador calculou, não um valor qualquer maior que zero.
    expect(path?.getAttribute('d')?.match(/M/g)).toHaveLength(expectedDarkCount)
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

  it('nível de correção mais alto gera uma matriz igual ou maior (viewBox maior ou igual)', () => {
    const text = 'x'.repeat(60)
    const expectedLow = encodeQrMatrix(text, 'low')
    const expectedHigh = encodeQrMatrix(text, 'high')
    // Vetor independente confirma que o nível mais alto realmente precisa de mais espaço
    // para este texto (senão o teste não provaria nada sobre o efeito visível).
    expect(expectedHigh.size).toBeGreaterThan(expectedLow.size)

    const { container: lowContainer } = renderApp(<QrCode value={text} errorCorrection="low" />)
    const { container: highContainer } = renderApp(<QrCode value={text} errorCorrection="high" />)
    expect(lowContainer.querySelector('svg')).toHaveAttribute(
      'viewBox',
      `0 0 ${expectedLow.size} ${expectedLow.size}`,
    )
    expect(highContainer.querySelector('svg')).toHaveAttribute(
      'viewBox',
      `0 0 ${expectedHigh.size} ${expectedHigh.size}`,
    )
  })
})

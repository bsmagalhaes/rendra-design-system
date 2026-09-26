// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from '@/lib/contrast'
import { renderApp } from '@/test/render'
import { RENDRA_CREDIT_HREF, RendraCredit } from './rendra-credit'

describe('RendraCredit', () => {
  it('por padrão mostra "Feito com Rendra" com link para o repositório, em nova aba', () => {
    renderApp(<RendraCredit />)
    const link = screen.getByRole('link', { name: /Feito com Rendra/ })
    expect(link).toHaveAttribute('href', RENDRA_CREDIT_HREF)
    expect(link).toHaveAttribute('href', 'https://github.com/bsmagalhaes/rendra-design-system')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(link).toHaveAttribute('data-rendra', 'CRED-001')
  })

  it('avisa, para leitor de tela, que abre em nova aba', () => {
    renderApp(<RendraCredit />)
    expect(screen.getByRole('link')).toHaveAccessibleName('Feito com Rendra (abre em nova aba)')
  })

  it('é discreto: texto pequeno em cor de apoio, com alvo de toque de 44px no celular', () => {
    renderApp(<RendraCredit />)
    const link = screen.getByRole('link')
    expect(link).toHaveClass('text-xs', 'text-muted-foreground', 'min-h-touch')
  })

  it('texto e link substituíveis por prop', () => {
    renderApp(<RendraCredit text="Feito pela Acme" href="https://acme.com.br/sobre" />)
    const link = screen.getByRole('link', { name: /Feito pela Acme/ })
    expect(link).toHaveAttribute('href', 'https://acme.com.br/sobre')
    expect(screen.queryByText('Feito com Rendra')).not.toBeInTheDocument()
  })

  it('credit={false} não renderiza nada', () => {
    const { container } = renderApp(<RendraCredit credit={false} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(container.querySelector('[data-rendra="CRED-001"]')).toBeNull()
  })

  it('cor do texto (muted-foreground) passa AA sobre o fundo, no claro e no escuro de cada paleta', () => {
    const css = (file: string) => readFileSync(join(process.cwd(), 'src/styles', file), 'utf8')
    const value = (block: string, name: string) =>
      new RegExp(`--rendra-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(block)?.[1]
    const blocks = [
      css('theme.css').split('.dark')[0]!,
      ...css('palettes.css')
        .split(/(?=:root\[data-palette=)/)
        .filter((block) => block.includes('.dark {')),
    ]
    let checked = 0
    for (const block of blocks) {
      const fg = value(block, 'muted-foreground')
      const bg = value(block, 'background')
      if (!fg || !bg) continue
      checked += 1
      expect(contrastRatio(fg, bg), `${fg} sobre ${bg}`).toBeGreaterThanOrEqual(4.5)
    }
    expect(checked).toBeGreaterThanOrEqual(5)
  })
})

// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import type { SVGProps } from 'react'
import { describe, expect, it } from 'vitest'
import { BrandProvider } from '@/brand'
import type { BrandConfig } from '@/brand/types'
import { renderApp } from '@/test/render'
import { BrandLogo } from './brand-logo'

/*
 * A variante clara e escura do logotipo só existe com logoMode: 'image' (arte oficial, sem
 * recolorir). O teste simula essa configuração de marca sem alterar brand.config.ts: monta um
 * BrandConfig de mentira, com um SVG diferente para cada modo, e força o modo pelo
 * BrandProvider (o mesmo recurso que o Storybook e os testes já usam).
 */
function LogoClaro(props: SVGProps<SVGSVGElement>) {
  return <svg data-testid="logo-claro" {...props} />
}
function LogoEscuro(props: SVGProps<SVGSVGElement>) {
  return <svg data-testid="logo-escuro" {...props} />
}
function Simbolo(props: SVGProps<SVGSVGElement>) {
  return <svg data-testid="simbolo" {...props} />
}

const brandComArte: BrandConfig = {
  id: 'teste-arte',
  productName: 'Marca Teste',
  companyName: 'Empresa Teste',
  tagline: 'Tagline de teste',
  logo: { light: LogoClaro, dark: LogoEscuro },
  symbol: Simbolo,
  favicon: 'data:image/svg+xml,<svg/>',
  shape: 'square',
  logoMode: 'image',
  sidebarLogo: 'light',
}

function renderComArte(mode: 'light' | 'dark') {
  return render(
    <BrandProvider brands={[brandComArte]} defaultBrand={brandComArte} forcedMode={mode}>
      <BrandLogo />
    </BrandProvider>,
  )
}

describe('BrandLogo', () => {
  it('renderiza com o código do catálogo e o nome do produto, sem logotipo customizado', () => {
    const { container } = renderApp(<BrandLogo />)
    expect(container.querySelector('[data-rendra="LOGO-001"]')).toBeInTheDocument()
    expect(screen.getByText('Rendra')).toBeInTheDocument()
    expect(screen.getByText('Safira')).toBeInTheDocument()
  })

  it('com logoMode "image" no modo claro, mostra a arte clara e não a escura', () => {
    renderComArte('light')
    expect(screen.getByTestId('logo-claro')).toBeInTheDocument()
    expect(screen.queryByTestId('logo-escuro')).not.toBeInTheDocument()
  })

  it('trocar para o modo escuro troca a variante do logotipo mostrada', () => {
    renderComArte('dark')
    expect(screen.getByTestId('logo-escuro')).toBeInTheDocument()
    expect(screen.queryByTestId('logo-claro')).not.toBeInTheDocument()
  })
})

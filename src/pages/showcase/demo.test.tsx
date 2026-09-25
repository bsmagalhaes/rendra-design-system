// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { CatalogCode, Demo, Row } from './demo'

/*
 * Etapa 1.2.0-alpha.3 do plano da v2: o código do catálogo aparece como selo discreto ao
 * lado de cada exemplo ou variante mostrada na vitrine (/componentes), tanto no título do
 * Demo (um componente com um código só) quanto no rótulo de um Row (uma variante específica
 * dentro de um componente com mais de um código, como o Button ou o Tabs).
 */
describe('CatalogCode', () => {
  it('mostra um código só', () => {
    renderApp(<CatalogCode code="BTN-001" />)
    expect(screen.getByText('BTN-001')).toBeInTheDocument()
  })

  it('mostra mais de um código, na ordem recebida', () => {
    renderApp(<CatalogCode code={['CHK-001', 'CHK-002']} />)
    expect(screen.getByText('CHK-001')).toBeInTheDocument()
    expect(screen.getByText('CHK-002')).toBeInTheDocument()
  })
})

describe('Demo', () => {
  it('mostra o código do catálogo ao lado do título quando o componente tem um código só', () => {
    renderApp(
      <Demo id="x" title="Badge" description="..." code="BDG-001">
        <p>conteúdo</p>
      </Demo>,
    )
    expect(screen.getByRole('heading', { name: 'Badge' })).toBeInTheDocument()
    expect(screen.getByText('BDG-001')).toBeInTheDocument()
  })

  it('sem code, não mostra nenhum selo', () => {
    renderApp(
      <Demo id="y" title="Sem código" description="...">
        <p>conteúdo</p>
      </Demo>,
    )
    expect(screen.queryByText(/^[A-Z]{3,4}-\d{3}$/)).not.toBeInTheDocument()
  })
})

describe('Row', () => {
  it('mostra o código do catálogo ao lado do rótulo da variante', () => {
    renderApp(
      <Row label="Variante pílula" code="ABA-002">
        <p>conteúdo</p>
      </Row>,
    )
    expect(screen.getByText('Variante pílula')).toBeInTheDocument()
    expect(screen.getByText('ABA-002')).toBeInTheDocument()
  })
})

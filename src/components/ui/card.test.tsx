// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card'

describe('Card', () => {
  it('mostra o título e o conteúdo na tela', () => {
    renderApp(
      <Card>
        <CardHeader>
          <CardTitle>Contrato 1042</CardTitle>
        </CardHeader>
        <CardContent>Vigente até 31/12/2026</CardContent>
      </Card>,
    )
    expect(screen.getByText('Contrato 1042')).toBeInTheDocument()
    expect(screen.getByText('Vigente até 31/12/2026')).toBeInTheDocument()
  })

  it('usa CARD-001 por padrão', () => {
    renderApp(<Card data-testid="card">Conteúdo</Card>)
    expect(screen.getByTestId('card')).toHaveAttribute('data-rendra', 'CARD-001')
  })

  it('aceita o código de um componente composto que o usa como raiz (Calendar, FormSection, StatCard, Table)', () => {
    renderApp(
      <Card data-testid="card" data-rendra="CAL-001">
        Conteúdo
      </Card>,
    )
    expect(screen.getByTestId('card')).toHaveAttribute('data-rendra', 'CAL-001')
  })

  it('o CardFooter mostra a ação e o clique nela dispara o efeito esperado, não só o callback', async () => {
    function CardComAcao() {
      const [arquivado, setArquivado] = useState(false)
      if (arquivado) return <p>Contrato arquivado</p>
      return (
        <Card>
          <CardContent>Contrato 1042</CardContent>
          <CardFooter>
            <Button onClick={() => setArquivado(true)}>Arquivar</Button>
          </CardFooter>
        </Card>
      )
    }
    renderApp(<CardComAcao />)
    expect(screen.getByText('Contrato 1042')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Arquivar' }))
    expect(screen.queryByText('Contrato 1042')).not.toBeInTheDocument()
    expect(screen.getByText('Contrato arquivado')).toBeInTheDocument()
  })
})

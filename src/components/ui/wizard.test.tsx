// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Stepper, Wizard } from './wizard'

const steps = [
  { id: 'a', title: 'Dados' },
  { id: 'b', title: 'Revisão' },
]

describe('Wizard', () => {
  it('mostra a etapa atual e usa o código do catálogo', () => {
    const { container } = renderApp(
      <Wizard steps={steps}>
        <p>Conteúdo da etapa 1</p>
        <p>Conteúdo da etapa 2</p>
      </Wizard>,
    )
    expect(screen.getByText('Conteúdo da etapa 1')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="WIZ-001"]')).toBeInTheDocument()
  })

  it('avançar troca o conteúdo exibido para o da nova etapa', async () => {
    renderApp(
      <Wizard steps={steps}>
        <p>Conteúdo da etapa 1</p>
        <p>Conteúdo da etapa 2</p>
      </Wizard>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }))
    expect(screen.getByText('Conteúdo da etapa 2')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo da etapa 1')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Concluir' })).toBeInTheDocument()
  })

  it('avançar com a etapa inválida mantém a etapa atual e marca o erro', async () => {
    renderApp(
      <Wizard steps={steps} onValidateStep={() => false}>
        <p>Conteúdo da etapa 1</p>
        <p>Conteúdo da etapa 2</p>
      </Wizard>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }))
    // Continua na etapa 1: o conteúdo da etapa 2 nunca aparece.
    expect(screen.getByText('Conteúdo da etapa 1')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo da etapa 2')).not.toBeInTheDocument()
    // Indicador mobile compacto marca a etapa atual com erro.
    expect(screen.getByText('Revise esta etapa')).toBeInTheDocument()
  })

  function CadastroDemo() {
    const [nome, setNome] = useState('')
    return (
      <Wizard steps={steps}>
        <input aria-label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <p>Revisão: {nome || '(vazio)'}</p>
      </Wizard>
    )
  }

  it('voltar uma etapa mantém os dados já preenchidos visíveis', async () => {
    renderApp(<CadastroDemo />)
    await userEvent.type(screen.getByRole('textbox', { name: 'Nome' }), 'Ana Ribeiro')
    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }))
    expect(screen.getByText('Revisão: Ana Ribeiro')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveValue('Ana Ribeiro')
  })
})

describe('Stepper', () => {
  it('usa o código do catálogo', () => {
    const { container } = renderApp(<Stepper steps={[{ id: 'a', title: 'Dados' }]} current={0} />)
    expect(container.querySelector('[data-rendra="WIZ-002"]')).toBeInTheDocument()
  })
})

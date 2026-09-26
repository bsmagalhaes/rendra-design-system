// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Stepper, Wizard } from './wizard'

describe('Wizard', () => {
  it('mostra a etapa atual e usa o código do catálogo', () => {
    const { container } = renderApp(
      <Wizard
        steps={[
          { id: 'a', title: 'Dados' },
          { id: 'b', title: 'Revisão' },
        ]}
      >
        <p>Conteúdo da etapa 1</p>
        <p>Conteúdo da etapa 2</p>
      </Wizard>,
    )
    expect(screen.getByText('Conteúdo da etapa 1')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="WIZ-001"]')).toBeInTheDocument()
  })
})

describe('Stepper', () => {
  it('usa o código do catálogo', () => {
    const { container } = renderApp(<Stepper steps={[{ id: 'a', title: 'Dados' }]} current={0} />)
    expect(container.querySelector('[data-rendra="WIZ-002"]')).toBeInTheDocument()
  })
})

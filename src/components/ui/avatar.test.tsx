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

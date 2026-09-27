// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'

describe('DropdownMenuContent', () => {
  it('abre e usa o código do catálogo', async () => {
    renderApp(
      <DropdownMenu>
        <DropdownMenuTrigger>Ações</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Editar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Ações' }))
    expect(await screen.findByRole('menuitem', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.getByRole('menu')).toHaveAttribute('data-rendra', 'DDM-001')
  })
})

/** Rótulo do gatilho muda com o valor escolhido no submenu: efeito visível fora do menu. */
function MenuComSubitem() {
  const [selecionado, setSelecionado] = useState('Nenhum')
  return (
    <div>
      <p>Selecionado: {selecionado}</p>
      <DropdownMenu>
        <DropdownMenuTrigger>Ações</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Mais opções</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onSelect={() => setSelecionado('Exportar')}>
                Exportar
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

describe('DropdownMenu com subitens', () => {
  it('abre o submenu, escolhe o subitem e fecha o menu com o efeito aplicado', async () => {
    const user = userEvent.setup()
    renderApp(<MenuComSubitem />)
    await user.click(screen.getByRole('button', { name: 'Ações' }))
    await screen.findByRole('menuitem', { name: 'Mais opções' })
    // Navegação pelo teclado: mais estável que clique em jsdom para menu aninhado.
    await user.keyboard('{ArrowDown}{ArrowRight}')
    await screen.findByRole('menuitem', { name: 'Exportar' })
    await user.keyboard('{ArrowDown}{Enter}')

    expect(await screen.findByText('Selecionado: Exportar')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryAllByRole('menu')).toHaveLength(0))
  })
})

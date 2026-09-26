// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { COLOR_PICKER_SWATCHES, WHITE } from '@/brand/palette'
import { renderApp } from '@/test/render'
import { ColorPicker, type ColorPickerProps } from './color-picker'

// Os hexadecimais de teste vêm de src/brand/palette (única pasta onde cor fixa é permitida);
// nenhum valor literal deste tipo pode aparecer aqui (regra "cor-fixa" do check:rules).
const [blue, , , , red, , , , , , , dark] = COLOR_PICKER_SWATCHES

const openPicker = () => userEvent.click(screen.getByRole('button', { name: 'Cor' }))

/** Envolve o ColorPicker com o estado que a tela real mantém, para o teste ver a amostra do
 * gatilho mudar de verdade, não só a chamada do onChange. */
function ControlledColorPicker(props: Omit<ColorPickerProps, 'value' | 'onChange'>) {
  const [value, setValue] = useState(props.swatches?.[0])
  return <ColorPicker {...props} value={value} onChange={setValue} />
}

describe('ColorPicker', () => {
  it('mostra a cor atual e o código do catálogo', () => {
    renderApp(<ColorPicker value={blue} aria-label="Cor" />)
    const trigger = screen.getByRole('button', { name: 'Cor' })
    expect(trigger).toHaveAttribute('data-rendra', 'COR-001')
    expect(trigger).toHaveTextContent(blue!)
  })

  it('escolhe uma amostra com o teclado: a amostra do gatilho muda e o painel fecha', async () => {
    renderApp(<ControlledColorPicker aria-label="Cor" swatches={[blue!, red!]} />)
    await openPicker()
    const target = await screen.findByRole('button', { name: red })
    target.focus()
    await userEvent.keyboard('{Enter}')
    // O painel fecha sozinho ao escolher: o campo de hex livre some do documento.
    expect(screen.queryByLabelText('Cor: cor livre (hexadecimal)')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cor' })).toHaveTextContent(red!)
  })

  it('hex inválido no campo livre não muda a amostra do gatilho', async () => {
    renderApp(<ControlledColorPicker aria-label="Cor" swatches={[blue!]} />)
    const trigger = screen.getByRole('button', { name: 'Cor' })
    expect(trigger).toHaveTextContent(blue!)
    await openPicker()
    const hexField = await screen.findByLabelText('Cor: cor livre (hexadecimal)')
    await userEvent.clear(hexField)
    await userEvent.type(hexField, '#12g45z')
    expect(trigger).toHaveTextContent(blue!)
  })

  it('hex válido no campo livre muda a amostra do gatilho, sempre em minúsculas', async () => {
    renderApp(<ControlledColorPicker aria-label="Cor" swatches={[blue!]} />)
    await openPicker()
    const hexField = await screen.findByLabelText('Cor: cor livre (hexadecimal)')
    await userEvent.clear(hexField)
    await userEvent.type(hexField, red!.toUpperCase())
    expect(screen.getByRole('button', { name: 'Cor' })).toHaveTextContent(red!)
  })

  it('o check da amostra selecionada usa uma cor de contraste com a própria amostra', async () => {
    const onChange = vi.fn()
    renderApp(
      <ColorPicker aria-label="Cor" value={dark} swatches={[dark!, WHITE]} onChange={onChange} />,
    )
    await openPicker()
    const darkSwatch = await screen.findByRole('button', { name: dark })
    expect(darkSwatch.querySelector('svg')).toHaveClass('swatch-check-light')
    const lightSwatch = await screen.findByRole('button', { name: WHITE })
    expect(lightSwatch).not.toHaveAttribute('aria-pressed', 'true')
    expect(lightSwatch.querySelector('svg')).not.toBeInTheDocument()
  })

  it('desabilitado: o gatilho não pode ser acionado', () => {
    renderApp(<ColorPicker aria-label="Cor" disabled />)
    expect(screen.getByRole('button', { name: 'Cor' })).toBeDisabled()
  })
})

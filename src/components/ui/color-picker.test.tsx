// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { COLOR_PICKER_SWATCHES, WHITE } from '@/brand/palette'
import { renderApp } from '@/test/render'
import { ColorPicker } from './color-picker'

// Os hexadecimais de teste vêm de src/brand/palette (única pasta onde cor fixa é permitida);
// nenhum valor literal deste tipo pode aparecer aqui (regra "cor-fixa" do check:rules).
const [blue, , , , red, , , , , , , dark] = COLOR_PICKER_SWATCHES

const openPicker = () => userEvent.click(screen.getByRole('button', { name: 'Cor' }))

describe('ColorPicker', () => {
  it('mostra a cor atual e o código do catálogo', () => {
    renderApp(<ColorPicker value={blue} aria-label="Cor" />)
    const trigger = screen.getByRole('button', { name: 'Cor' })
    expect(trigger).toHaveAttribute('data-rendra', 'COR-001')
    expect(trigger).toHaveTextContent(blue!)
  })

  it('escolhe uma amostra com o teclado (foco na amostra, Enter confirma)', async () => {
    const onChange = vi.fn()
    renderApp(<ColorPicker aria-label="Cor" swatches={[blue!, red!]} onChange={onChange} />)
    await openPicker()
    const first = await screen.findByRole('button', { name: blue })
    first.focus()
    await userEvent.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(blue)
  })

  it('hex inválido no campo livre não chama onChange', async () => {
    const onChange = vi.fn()
    renderApp(<ColorPicker aria-label="Cor" onChange={onChange} />)
    await openPicker()
    const hexField = await screen.findByLabelText('Cor: cor livre (hexadecimal)')
    await userEvent.type(hexField, '#12g45z')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('hex válido no campo livre chama onChange em minúsculas', async () => {
    const onChange = vi.fn()
    renderApp(<ColorPicker aria-label="Cor" onChange={onChange} />)
    await openPicker()
    const hexField = await screen.findByLabelText('Cor: cor livre (hexadecimal)')
    await userEvent.type(hexField, blue!.toUpperCase())
    expect(onChange).toHaveBeenLastCalledWith(blue)
  })

  it('o check da amostra selecionada usa uma cor de contraste com a própria amostra', async () => {
    renderApp(<ColorPicker aria-label="Cor" value={dark} swatches={[dark!, WHITE]} />)
    await openPicker()
    const darkSwatch = await screen.findByRole('button', { name: dark })
    expect(darkSwatch.querySelector('svg')).toHaveClass('swatch-check-light')
    const lightSwatch = await screen.findByRole('button', { name: WHITE })
    expect(lightSwatch.getAttribute('aria-pressed')).toBe('false')
  })

  it('desabilitado: o gatilho não pode ser acionado', () => {
    renderApp(<ColorPicker aria-label="Cor" disabled />)
    expect(screen.getByRole('button', { name: 'Cor' })).toBeDisabled()
  })
})

// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { Upload } from './upload'

describe('Upload', () => {
  it('recusa arquivo acima do limite e aceita o resto', async () => {
    const onChange = vi.fn()
    const { container } = renderApp(<Upload maxSizeMb={1} onChange={onChange} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const small = new File(['a'], 'contrato.pdf', { type: 'application/pdf' })
    const big = new File([new Uint8Array(2 * 1024 * 1024)], 'video.mp4', { type: 'video/mp4' })
    fireEvent.change(input, { target: { files: [small, big] } })
    expect(await screen.findByText('contrato.pdf')).toBeInTheDocument()
    expect(screen.getByText('Arquivo maior que 1 MB.')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalled()
    expect(container.querySelector('[data-rendra="UPL-001"]')).toBeInTheDocument()
  })
})

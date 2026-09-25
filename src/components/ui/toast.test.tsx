// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { toast, Toaster } from './toast'

/*
 * Exceção documentada em CATALOG_DATA_RENDRA_EXCEPTIONS (src/catalog/components.ts): o
 * toast só existe no DOM quando o Sonner o desenha, de forma assíncrona, dentro do portal
 * do <Toaster />. Ainda assim, o código aparece de verdade quando o toast é exibido.
 */
describe('toast', () => {
  it('quando exibido, usa o código do catálogo', async () => {
    renderApp(<Toaster />)
    toast.success('Cliente salvo')
    const message = await screen.findByText('Cliente salvo')
    expect(message.closest('[data-rendra="TST-001"]')).toBeInTheDocument()
  })
})

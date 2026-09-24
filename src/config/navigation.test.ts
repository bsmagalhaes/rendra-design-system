import { describe, expect, it } from 'vitest'
import { resolveActiveTo } from './navigation'

describe('resolveActiveTo', () => {
  it('marca só o item mais específico do menu', () => {
    expect(resolveActiveTo('/clientes/novo')).toBe('/clientes/novo')
    expect(resolveActiveTo('/clientes/1000')).toBe('/clientes')
  })
  it('o painel só fica ativo na raiz', () => {
    expect(resolveActiveTo('/')).toBe('/')
    expect(resolveActiveTo('/pagina-inexistente')).toBeNull()
  })
})

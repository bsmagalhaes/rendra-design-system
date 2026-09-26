import { describe, expect, it } from 'vitest'
import { privateFieldError } from './verify-pack-checks'

describe('privateFieldError', () => {
  it('acusa package.json com private: true, explicando o risco do npm pack', () => {
    const message = privateFieldError({ private: true })
    expect(message).toMatch(/"private":\s*true/)
    expect(message).toContain('EPRIVATE')
  })

  it('não acusa nada quando o campo private está ausente', () => {
    expect(privateFieldError({})).toBeUndefined()
  })

  it('não acusa nada com private: false', () => {
    expect(privateFieldError({ private: false })).toBeUndefined()
  })
})

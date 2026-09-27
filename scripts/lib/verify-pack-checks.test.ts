import { describe, expect, it } from 'vitest'
import { binFieldError, privateFieldError } from './verify-pack-checks'

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

describe('binFieldError', () => {
  const files = ['dist', 'bin']

  it('acusa "bin.rendra" com prefixo "./", que o npm publish normaliza e avisa "was invalid and removed"', () => {
    const message = binFieldError({ bin: { rendra: './bin/rendra.mjs' }, files })
    expect(message).toMatch(/"\.\/"/)
    expect(message).toContain('./bin/rendra.mjs')
    expect(message).toContain('bin/rendra.mjs')
  })

  it('não acusa nada com "bin.rendra" sem o prefixo "./", dentro de "files"', () => {
    expect(binFieldError({ bin: { rendra: 'bin/rendra.mjs' }, files })).toBeUndefined()
  })

  it('acusa a ausência de "bin.rendra"', () => {
    const message = binFieldError({ bin: {}, files })
    expect(message).toContain('bin.rendra')
  })

  it('acusa "bin.rendra" fora de qualquer entrada de "files"', () => {
    const message = binFieldError({ bin: { rendra: 'bin/rendra.mjs' }, files: ['dist'] })
    expect(message).toContain('"files"')
  })
})

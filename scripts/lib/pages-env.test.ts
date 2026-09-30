import { describe, expect, it } from 'vitest'

import { pagesEnv } from './pages-env'

describe('pagesEnv', () => {
  it('sem variáveis do GitHub, usa o repositório do Rendra', () => {
    expect(pagesEnv({})).toEqual({
      repo: 'rendra-ui-web',
      owner: 'bsmagalhaes',
      basePath: '/rendra-ui-web/demo/',
      siteUrl: 'https://bsmagalhaes.github.io/rendra-ui-web/demo/',
      rootUrl: 'https://bsmagalhaes.github.io/rendra-ui-web/',
      outDir: '.pages/rendra-ui-web',
    })
  })

  it('no Actions de um fork, deriva tudo de GITHUB_REPOSITORY e do dono (C10)', () => {
    const env = pagesEnv({
      GITHUB_REPOSITORY: 'maria/meu-sistema',
      GITHUB_REPOSITORY_OWNER: 'maria',
    })
    expect(env.basePath).toBe('/meu-sistema/demo/')
    expect(env.siteUrl).toBe('https://maria.github.io/meu-sistema/demo/')
    expect(env.rootUrl).toBe('https://maria.github.io/meu-sistema/')
    expect(env.outDir).toBe('.pages/meu-sistema')
  })

  it('sem o dono explícito, usa o dono de GITHUB_REPOSITORY', () => {
    expect(pagesEnv({ GITHUB_REPOSITORY: 'maria/meu-sistema' }).owner).toBe('maria')
  })

  it('ignora GITHUB_REPOSITORY malformado', () => {
    expect(pagesEnv({ GITHUB_REPOSITORY: 'sem-barra' }).repo).toBe('rendra-ui-web')
  })
})

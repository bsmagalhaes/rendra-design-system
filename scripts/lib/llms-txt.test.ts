import { describe, expect, it } from 'vitest'
import { buildLlmsTxt } from './llms-txt'

describe('buildLlmsTxt', () => {
  const txt = buildLlmsTxt({
    site: {
      name: 'Rendra Design System',
      description: 'Template de sistema de teste.',
      repository: 'https://github.com/exemplo/rendra-design-system',
    },
    pages: [
      { title: 'Painel', description: 'Dashboard de teste.', url: 'https://exemplo.test/' },
      {
        title: 'Clientes',
        description: 'Listagem de teste.',
        url: 'https://exemplo.test/clientes/',
      },
    ],
    storybookUrl: 'https://exemplo.test/storybook/',
  })

  it('abre com o nome e a descrição do site', () => {
    expect(txt).toContain('# Rendra Design System')
    expect(txt).toContain('> Template de sistema de teste.')
  })

  it('diz para quem é', () => {
    expect(txt).toContain('## Para quem')
  })

  it('traz a instalação exata do pacote', () => {
    expect(txt).toContain('npm install @rendra-ui/web react react-dom radix-ui')
  })

  it('lista os três comandos da CLI', () => {
    expect(txt).toContain('rendra codigos')
    expect(txt).toContain('rendra auditar')
    expect(txt).toContain('rendra trocar')
  })

  it('lista cada tela recebida e o Storybook', () => {
    expect(txt).toContain('- [Painel](https://exemplo.test/): Dashboard de teste.')
    expect(txt).toContain('- [Clientes](https://exemplo.test/clientes/): Listagem de teste.')
    expect(txt).toContain('- [Storybook](https://exemplo.test/storybook/): todos os componentes')
  })

  it('linka a documentação a partir do repositório recebido', () => {
    expect(txt).toContain('[README](https://github.com/exemplo/rendra-design-system#readme)')
    expect(txt).toContain(
      '[Regras de design](https://github.com/exemplo/rendra-design-system/blob/main/DESIGN_RULES.md)',
    )
  })
})

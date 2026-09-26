import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'storybook-static',
      'playwright-report',
      'test-results',
      'screenshots',
      'coverage',
      // Fixtures da CLI (fase 3, Lote B, src/cli/*.test.ts): código de exemplo com violação de
      // propósito (valor arbitrário, prop dinâmica...), nunca compilado nem executado, só lido
      // pelo parser em teste. Mesma razão de scripts/check-design-rules.mjs nunca escanear
      // test/: não é produto, é a "vítima" que o teste audita.
      'test/fixtures',
      // Worktrees de agente de IA (.claude/worktrees/*): cópias completas do repositório,
      // cada uma com o próprio node_modules e possivelmente em estado inacabado; nunca é
      // código deste checkout, então o lint não deve varrê-las.
      '.claude',
    ],
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      jsxA11y.flatConfigs.recommended,
      prettier,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Rótulo vem do Field (htmlFor) ou é ligado por id em componente próprio.
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/no-autofocus': 'off',
    },
  },
)

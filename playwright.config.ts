import { defineConfig } from '@playwright/test'

/*
 * Testes no navegador (Playwright). Sobe o Vite sozinho se não houver servidor na 5173.
 *   npm run test:layout   layout: rotas x larguras x modelos, claro e escuro
 *   npm run test:a11y     acessibilidade (axe-core, WCAG 2.1 AA)
 *   npm run test:visual   regressão visual contra as referências aprovadas
 */
export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  // Referências por sistema operacional: a renderização de fonte muda entre eles.
  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{arg}{ext}',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  projects: [
    { name: 'layout', testMatch: 'layout.spec.ts' },
    { name: 'a11y', testMatch: 'a11y.spec.ts' },
    { name: 'visual', testMatch: 'visual.spec.ts' },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})

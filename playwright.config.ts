import { defineConfig } from '@playwright/test'

/*
 * Testes de layout (critério de aceite): npm run test:layout
 * Sobe o Vite sozinho se não houver servidor na porta 5173.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})

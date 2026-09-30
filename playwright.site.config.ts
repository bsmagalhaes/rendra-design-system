import { defineConfig } from '@playwright/test'

/*
 * Página de apresentação e composição do site (Pages): npm run test:site
 * Monta a mesma árvore que o GitHub Pages publica (npm run pages:build, sem Storybook) e a serve em
 * http://localhost:4174/rendra-ui-web/. Fica fora do playwright.config.ts porque o servidor é outro
 * (a árvore de .pages, não o Vite) e a base é /rendra-ui-web/, não a raiz.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: /site\.spec\.ts/,
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : 4,
  outputDir: 'test-results/site',
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report/site' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/site' }]],
  use: {
    // Barra final obrigatória: sem ela, `page.goto('demo/')` perde o último segmento da base.
    baseURL: 'http://localhost:4174/rendra-ui-web/',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  projects: [
    { name: 'site-desktop', use: { viewport: { width: 1280, height: 800 } } },
    {
      name: 'site-mobile',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: {
    command: 'npm run pages:build && npx serve .pages -l 4174',
    url: 'http://localhost:4174/rendra-ui-web/',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
})

#!/usr/bin/env node
/*
 * Build e composição do GitHub Pages em um script só, igual no CI (pages.yml) e no local:
 *   node scripts/pages-build.mjs [--storybook]
 * 1. build da demo com base /<repo>/demo/ (Vite);
 * 2. SEO da demo (uma página por rota, sitemap, robots e llms.txt);
 * 3. registry do shadcn (dist/r);
 * 4. Storybook (dist/storybook), só com --storybook;
 * 5. composição em .pages/<repo>/: página na raiz, demo em demo/, r/, storybook/ e os stubs das
 *    rotas antigas (scripts/pages-stage.mjs).
 */
import { spawnSync } from 'node:child_process'
import { pagesEnv } from './lib/pages-env.ts'

const comStorybook = process.argv.includes('--storybook')
const { basePath, siteUrl } = pagesEnv(process.env)

function rodar(comando, env = {}) {
  console.log(`\n> ${comando}`)
  const r = spawnSync(comando, { stdio: 'inherit', shell: true, env: { ...process.env, ...env } })
  if (r.status !== 0) {
    console.error(`pages-build: falhou em "${comando}" (código ${r.status ?? r.signal})`)
    process.exit(r.status ?? 1)
  }
}

rodar('npm run build', { BASE_PATH: basePath, SITE_URL: siteUrl })
rodar('node scripts/seo-build.mjs', { SITE_URL: siteUrl })
rodar('npm run registry:build')
if (comStorybook) rodar('npm run build-storybook -- --quiet --output-dir dist/storybook')
rodar('node scripts/pages-stage.mjs')

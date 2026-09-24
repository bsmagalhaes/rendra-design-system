import { chromium } from '@playwright/test'

const BASE = 'http://localhost:5173'
const routes = [
  '/',
  '/clientes',
  '/clientes/novo',
  '/clientes/42',
  '/cadastro',
  '/tarefas',
  '/configuracoes',
  '/componentes',
  '/tokens',
  '/nao-existe',
  '/login',
  '/recuperar-senha',
]
const widths = [360, 390, 768, 1280, 1920]
const brands = ['safira', 'equilibrio', 'aurora']
const b = await chromium.launch()
let problems = 0
for (const brand of brands) {
  for (const width of widths) {
    const ctx = await b.newContext({ viewport: { width, height: 800 } })
    await ctx.addInitScript((br) => localStorage.setItem('ui-brand', br), brand)
    const p = await ctx.newPage()
    for (const r of routes) {
      await p.goto(BASE + r, { waitUntil: 'networkidle' })
      await p.waitForTimeout(250)
      const res = await p.evaluate((mobile) => {
        const vw = document.documentElement.clientWidth
        const out = { scroll: document.documentElement.scrollWidth - vw, wide: [], small: [] }
        for (const el of document.querySelectorAll('body *')) {
          const cs = getComputedStyle(el)
          if (cs.display === 'none' || cs.visibility === 'hidden') continue
          const rc = el.getBoundingClientRect()
          if (rc.width === 0 || rc.height === 0) continue
          if (rc.right > vw + 1 && !el.closest('[data-allow-overflow]'))
            out.wide.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`)
          if (
            mobile &&
            el.matches(
              'a[href], button, [role="button"], input, select, textarea, [role="radio"], [role="tab"]',
            ) &&
            !el.closest('.sr-only') &&
            el.getAttribute('aria-hidden') !== 'true' &&
            cs.pointerEvents !== 'none'
          ) {
            // Área de toque real: o rótulo que envolve, a moldura do campo ou a área ampliada.
            const target = el.closest('label') ?? el.closest('[data-slot="control"]') ?? el
            let t = target.getBoundingClientRect()
            if (el.getAttribute('data-touch') === 'expanded')
              t = { width: t.width + 24, height: t.height + 24 }
            if (t.width < 43.5 || t.height < 43.5)
              out.small.push(
                `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}" ${Math.round(t.width)}x${Math.round(t.height)}`,
              )
          }
        }
        out.wide = out.wide.slice(0, 3)
        out.small = [...new Set(out.small)].slice(0, 6)
        return out
      }, width < 768)
      if (res.scroll > 0 || res.wide.length || res.small.length) {
        problems++
        console.log(
          `${brand} ${width}px ${r}: rolagem ${res.scroll}px`,
          res.wide.length ? `| largos: ${res.wide.join(', ')}` : '',
          res.small.length ? `| toque pequeno: ${res.small.join('; ')}` : '',
        )
      }
    }
    await ctx.close()
  }
}
await b.close()
console.log(
  problems
    ? `${problems} tela(s) com problema`
    : 'Todas as telas passaram: sem rolagem horizontal, sem elemento largo, toque >= 44px no mobile.',
)

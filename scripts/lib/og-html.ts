/*
 * Página de 1200x630 que vira a `og-image.png` (scripts/og-image.mjs a renderiza e captura). Nunca
 * montada à mão (padrão dos produtos, seção 6.2). Tema escuro da família (adendo de identidade):
 * fundo #111111, marca em mono, título #f2f2f2 com a palavra-chave em #e8650a, tagline #c4c4c4,
 * rodapé #9a9a9a e o print desktop à direita.
 */

export interface OgHtmlInput {
  produto: string
  tagline: string
  /** Print desktop (PNG) que aparece à direita, em moldura simples. */
  imagem: Uint8Array
  /** SVG do selo da família. Só o Rendra informa; um clone não herda a marca (W6). */
  selo?: string
}

const escapar = (texto: string): string =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Última palavra em destaque: `Rendra Design System` vira `Rendra Design <span>System</span>`. */
function comDestaque(texto: string): string {
  const partes = texto.trim().split(/\s+/)
  if (partes.length < 2) return escapar(texto)
  const ultima = partes.pop() as string
  return `${escapar(partes.join(' '))} <span>${escapar(ultima)}</span>`
}

export function buildOgHtml({ produto, tagline, imagem, selo }: OgHtmlInput): string {
  const base64 = Buffer.from(imagem).toString('base64')
  const marca = selo ? `<div class="marca">${selo}<b>RENDRA <span>WEB</span></b></div>` : ''
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
html,body{margin:0;background:#111111}
.og{position:relative;width:1200px;height:630px;overflow:hidden;background:#111111;color:#f2f2f2;font-family:"Segoe UI",system-ui,-apple-system,Roboto,"Helvetica Neue",Arial,sans-serif}
.marca{position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:14px;font-family:ui-monospace,"Cascadia Code","JetBrains Mono",Consolas,monospace;font-size:20px;letter-spacing:.08em}
.marca svg{width:44px;height:44px}
.marca b{font-weight:700}
.marca span,h1 span{color:#e8650a}
h1{position:absolute;left:64px;top:190px;width:470px;margin:0;font-size:68px;line-height:1.04;font-weight:800}
.tagline{position:absolute;left:64px;top:410px;width:460px;margin:0;font-size:26px;line-height:1.35;color:#c4c4c4}
.rodape{position:absolute;left:64px;bottom:48px;font-family:ui-monospace,"Cascadia Code","JetBrains Mono",Consolas,monospace;font-size:16px;color:#9a9a9a}
.print{position:absolute;left:580px;top:158px;width:570px;height:320px;border:1px solid #2c2c2c;border-radius:12px;overflow:hidden;background:#171717}
.print img{display:block;width:100%;height:100%;object-fit:cover;object-position:top left}
</style></head><body><div class="og" style="width:1200px;height:630px">
${marca}
<h1>${comDestaque(produto)}</h1>
<p class="tagline">${escapar(tagline)}</p>
<div class="rodape">React · Vite · Tailwind CSS · shadcn/ui</div>
<div class="print"><img alt="" src="data:image/png;base64,${base64}"></div>
</div></body></html>`
}

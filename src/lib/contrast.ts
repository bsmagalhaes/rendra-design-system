/** Calcula contraste WCAG entre duas cores CSS resolvidas pelo navegador. */
function toRgb(color: string): [number, number, number] | null {
  const probe = document.createElement('span')
  probe.style.color = color
  document.body.appendChild(probe)
  const resolved = getComputedStyle(probe).color
  probe.remove()
  const m = resolved.match(/[\d.]+/g)
  if (!m || m.length < 3) return null
  return [Number(m[0]), Number(m[1]), Number(m[2])]
}

function luminance([r, g, b]: [number, number, number]) {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export function readVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function contrastRatio(fg: string, bg: string): number | null {
  const a = toRgb(fg)
  const b = toRgb(bg)
  if (!a || !b) return null
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

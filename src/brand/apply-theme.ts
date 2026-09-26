/*
 * APLICAÇÃO NO DOM
 * -------------------------------------------------------------------------
 * applyTheme injeta no DOM o resultado (puro) de createTheme. Sem `target`, reproduz
 * exatamente applyPalette hoje: um <style> em document.head com o claro e o escuro do
 * tema, selecionados por :root[data-palette='<id>'] (quem liga o atributo é o BrandProvider,
 * como já acontece). Com `target`, aplica num contêiner próprio: marca
 * [data-rendra-root='<id>'] nele e escopa o <style> por esse atributo em vez de :root, para
 * um contêiner com tema próprio (não o documento inteiro) ler os mesmos tokens --rendra-*.
 */
import type { ThemeResult } from './theme'

export interface ApplyThemeOptions {
  /** Default: document.documentElement (o próprio <html>, como applyPalette hoje). */
  target?: HTMLElement
  /** Seletor do claro; o escuro é `${selector}.dark`. Default: deriva de target/id. */
  selector?: string
}

const block = (selector: string, vars: Record<string, string>) =>
  `${selector} {\n${Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}\n`

/** Aplica no DOM o resultado de createTheme. Sem opções, reproduz applyPalette(seed) de hoje. */
export function applyTheme(
  theme: ThemeResult,
  options: ApplyThemeOptions = {},
  doc: Document = document,
): void {
  const target = options.target ?? doc.documentElement
  const isRoot = target === doc.documentElement
  if (!isRoot) target.setAttribute('data-rendra-root', theme.id)

  const lightSelector =
    options.selector ??
    (isRoot ? `:root[data-palette='${theme.id}']` : `[data-rendra-root='${theme.id}']`)
  const darkSelector = options.selector
    ? `${options.selector}.dark`
    : isRoot
      ? `:root[data-palette='${theme.id}'].dark`
      : `[data-rendra-root='${theme.id}'].dark`

  const attr = 'data-theme-runtime'
  let style = doc.head.querySelector<HTMLStyleElement>(`style[${attr}="${theme.id}"]`)
  if (!style) {
    style = doc.createElement('style')
    style.setAttribute(attr, theme.id)
    doc.head.appendChild(style)
  }
  style.textContent = `${block(lightSelector, theme.vars.light)}\n${block(darkSelector, theme.vars.dark)}`
}

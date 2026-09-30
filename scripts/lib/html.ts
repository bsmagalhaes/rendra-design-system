/** Escape de texto e de atributo HTML, único para og-html, redirect-stubs e seo-build. */
export const escapeHtml = (texto: string): string =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

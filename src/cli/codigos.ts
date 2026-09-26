/*
 * `rendra codigos`: lista o catálogo de códigos de componente (src/catalog/components.ts), o
 * mesmo catálogo da vitrine (/componentes) e do BRIEFING_MODELO. Função pura: devolve os dados;
 * quem chama (bin/rendra.mjs) decide o formato de impressão.
 */
import type { ComponentCatalogEntry } from '../catalog/components'
import { CATALOG } from '../catalog/components'

/** Todo o catálogo, na ordem cadastrada. Sem duplicata: garantido por assertCatalogIntegrity. */
export function codigos(): ComponentCatalogEntry[] {
  return CATALOG
}

/** Uma linha por código, no formato que a CLI imprime: "CODE  Nome (Componente)". */
export function formatCodigos(entries: ComponentCatalogEntry[] = codigos()): string {
  return entries.map((entry) => `${entry.code}  ${entry.name} (${entry.component})`).join('\n')
}

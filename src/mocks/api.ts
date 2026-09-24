import type { TablePage, TableQuery } from '@/components/ui/table'

/*
 * API fictícia de demonstração: simula um servidor que pagina, busca e ordena.
 * No projeto real, troque por uma chamada à sua API com os mesmos parâmetros, por exemplo
 *   GET /clientes?pagina=2&porPagina=15&busca=ana&ordem=name:asc
 * e devolva { rows, total }.
 */

const LATENCY = 250

const normalize = (v: unknown) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

interface MockOptions<T> {
  /** Campos em que a busca procura (em todos os registros, não só na página). */
  searchIn: (row: T) => unknown[]
  /** Valor usado para ordenar cada coluna (id da coluna da Table). */
  sortBy?: Partial<Record<string, (row: T) => string | number>>
}

/**
 * Cria uma função `source` para a Table a partir de uma lista em memória.
 * `filter` aplica os filtros da tela (situação, segmento...) antes da busca.
 */
export function mockSource<T>(all: T[], options: MockOptions<T>) {
  return (filter: (row: T) => boolean = () => true) =>
    async ({ page, pageSize, search, sort, signal }: TableQuery): Promise<TablePage<T>> => {
      await new Promise<void>((resolve, reject) => {
        const t = window.setTimeout(resolve, LATENCY)
        signal.addEventListener('abort', () => {
          window.clearTimeout(t)
          reject(new DOMException('Requisição cancelada', 'AbortError'))
        })
      })
      const q = normalize(search)
      let rows = all.filter(filter)
      if (q) rows = rows.filter((r) => options.searchIn(r).some((v) => normalize(v).includes(q)))
      const key = sort && options.sortBy?.[sort.id]
      if (sort && key) {
        rows = [...rows].sort((a, b) => {
          const x = key(a)
          const y = key(b)
          const cmp =
            typeof x === 'number' && typeof y === 'number'
              ? x - y
              : String(x).localeCompare(String(y), 'pt-BR')
          return sort.desc ? -cmp : cmp
        })
      }
      const start = (page - 1) * pageSize
      return { rows: rows.slice(start, start + pageSize), total: rows.length }
    }
}

import { useEffect, useState } from 'react'

/**
 * Devolve o valor só depois que ele para de mudar por `delay` ms.
 * Usado na busca da Table remota: uma requisição por pausa na digitação, não por tecla.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(t)
  }, [value, delay])
  return debounced
}

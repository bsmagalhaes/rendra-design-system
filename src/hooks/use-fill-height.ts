import { useLayoutEffect, useRef } from 'react'

/**
 * Mede o espaço que sobra na área de conteúdo (o <main>) abaixo do elemento e grava em
 * --board-h. Com a classe h-board, o elemento ocupa exatamente essa altura: a página não
 * rola e a rolagem acontece dentro dele (kanban, chat).
 */
export function useFillHeight<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const main = el.closest('main')
    const measure = () => {
      // O quadro fica com a altura que sobra na área de conteúdo depois de tudo o que está
      // acima e abaixo dele (título, ações, respiro da página): a página nunca rola por ele.
      // Nunca menos que 20rem, para caber ao menos alguns cards.
      const h = el.getBoundingClientRect().height
      // Altura real do conteúdo da página (o primeiro filho do <main>), não a de rolagem.
      const page = main?.firstElementChild as HTMLElement | null
      const room =
        main && page
          ? main.clientHeight - (page.getBoundingClientRect().height - h)
          : window.innerHeight - el.getBoundingClientRect().top
      el.style.setProperty('--board-h', `${Math.max(320, Math.floor(room))}px`)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.documentElement)
    if (main) ro.observe(main)
    return () => ro.disconnect()
  }, [])
  return ref
}

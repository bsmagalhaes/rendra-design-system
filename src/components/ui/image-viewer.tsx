import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

/*
 * Visualizador de imagens (lightbox). Abre por cima da tela, sem sair da página.
 * Tela inteira em qualquer largura: legenda e fechar no topo, imagem no meio e
 * anterior / contador / próxima embaixo, ao alcance do polegar no celular.
 * Teclado: setas trocam de imagem e Esc fecha. No toque, arraste para o lado; pinça amplia.
 */

export interface ViewerImage {
  src: string
  /** Texto alternativo: o que a imagem mostra. */
  alt: string
  /** Legenda visível. Padrão: o alt. */
  caption?: string
}

export interface ImageViewerProps {
  images: ViewerImage[]
  /** Imagem aberta; null fecha o visualizador. */
  index: number | null
  onIndexChange: (index: number | null) => void
}

const SWIPE = 48

export function ImageViewer({ images, index, onIndexChange }: ImageViewerProps) {
  const start = useRef<number | null>(null)
  const open = index !== null && images[index] !== undefined
  const current = open ? images[index] : undefined
  const total = images.length
  const go = (step: number) => {
    if (index === null || total === 0) return
    onIndexChange((index + step + total) % total)
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onIndexChange(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') go(1)
            if (e.key === 'ArrowLeft') go(-1)
          }}
          data-rendra="IMG-001"
          className="fixed inset-0 z-50 flex h-dvh flex-col bg-background text-foreground outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 md:inset-6 md:h-auto md:rounded-surface md:border md:shadow-lg"
        >
          <div className="flex shrink-0 items-center gap-3 border-b pt-safe pr-2 pb-2 pl-4 md:pt-2 md:pr-3 md:pl-6">
            <Dialog.Title className="min-w-0 flex-1 truncate text-base font-semibold">
              {current?.caption ?? current?.alt}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" iconOnly aria-label="Fechar" icon={<X />} />
            </Dialog.Close>
          </div>

          <div
            className="flex min-h-0 flex-1 touch-pan-y touch-pinch-zoom items-center justify-center overflow-hidden bg-muted p-2 md:p-6"
            onPointerDown={(e) => (start.current = e.clientX)}
            onPointerUp={(e) => {
              if (start.current === null) return
              const dx = e.clientX - start.current
              start.current = null
              if (Math.abs(dx) >= SWIPE) go(dx < 0 ? 1 : -1)
            }}
          >
            {current && (
              <img
                key={current.src}
                src={current.src}
                alt={current.alt}
                draggable={false}
                className="max-h-full max-w-full rounded-item object-contain shadow-md select-none"
              />
            )}
          </div>

          <div
            className={cn(
              'flex shrink-0 items-center justify-between gap-3 border-t px-4 pt-3 pb-safe md:px-6 md:pb-3',
              total < 2 && 'hidden',
            )}
          >
            <Button variant="outline" icon={<ChevronLeft />} onClick={() => go(-1)}>
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
              {index !== null ? index + 1 : 0} de {total}
            </span>
            <Button variant="outline" iconRight={<ChevronRight />} onClick={() => go(1)}>
              Próxima
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

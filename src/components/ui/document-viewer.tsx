import { ChevronLeft, ChevronRight, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/cn'

/*
 * Visualizador de documentos PDF. Carrega o pdfjs-dist sob demanda (import dinâmico), com o
 * worker também sob demanda, para o pacote principal nunca pagar o custo de quem não usa o
 * visualizador. url null é o estado vazio legítimo (nenhum documento escolhido ainda). Falha
 * (CORS, arquivo inválido) é declarada, nunca uma tela em branco: sempre com o link "Abrir em
 * nova aba".
 */

// pdfjs-dist é grande e só entra no bundle de quem realmente usa o DocumentViewer: os tipos
// abaixo são só de compilação (import de tipo), o import de valor é sempre dinâmico (import()).
type PdfDocumentProxy = import('pdfjs-dist').PDFDocumentProxy
// destroy() vive na tarefa de carregamento (o que getDocument devolve antes do .promise),
// não no documento já resolvido: é ela que precisa ser guardada para liberar depois.
type PdfLoadingTask = import('pdfjs-dist').PDFDocumentLoadingTask

type Status = 'empty' | 'loading' | 'ready' | 'error'

export interface DocumentViewerProps {
  /** Endereço do PDF. null é o estado vazio legítimo (nenhum documento escolhido ainda). */
  url: string | null
  /** Nome acessível do documento (aria-label do visualizador). */
  title: string
  className?: string
  emptyTitle?: string
  emptyDescription?: string
  loadingLabel?: string
  errorTitle?: string
  errorDescription?: string
  openInNewTabLabel?: string
  zoomInLabel?: string
  zoomOutLabel?: string
  previousPageLabel?: string
  nextPageLabel?: string
}

const MIN_SCALE = 0.25
const MAX_SCALE = 3
const ZOOM_STEP = 1.25

/** Um visualizador de documento por tela; nunca crie um segundo para PDF. */
export function DocumentViewer({
  url,
  title,
  className,
  emptyTitle = 'Nenhum documento selecionado',
  emptyDescription = 'Escolha um arquivo PDF para visualizar aqui.',
  loadingLabel = 'Carregando documento...',
  errorTitle = 'Não foi possível abrir o documento',
  errorDescription = 'O arquivo pode estar indisponível, corrompido ou bloqueado por CORS.',
  openInNewTabLabel = 'Abrir em nova aba',
  zoomInLabel = 'Aumentar zoom',
  zoomOutLabel = 'Diminuir zoom',
  previousPageLabel = 'Página anterior',
  nextPageLabel = 'Próxima página',
}: DocumentViewerProps) {
  const [status, setStatus] = useState<Status>(url ? 'loading' : 'empty')
  const [page, setPage] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1)
  const [fitToWidth, setFitToWidth] = useState(true)
  const pdfRef = useRef<PdfDocumentProxy | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Carrega o documento (ou reinicia o estado vazio) sempre que a url muda. Libera a tarefa
  // de carregamento (destroy) ao trocar de url e ao desmontar, para não vazar memória nem o
  // worker que o pdfjs sobe para cada documento.
  useEffect(() => {
    let cancelled = false
    let loadingTask: PdfLoadingTask | null = null
    pdfRef.current = null
    setPage(1)
    setNumPages(0)
    setFitToWidth(true)
    setScale(1)

    if (!url) {
      setStatus('empty')
      return
    }
    const targetUrl: string = url

    setStatus('loading')
    async function load() {
      try {
        const [pdfjsLib, workerModule] = await Promise.all([
          import('pdfjs-dist'),
          import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
        ])
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default
        if (cancelled) return
        loadingTask = pdfjsLib.getDocument({ url: targetUrl })
        const doc = await loadingTask.promise
        if (cancelled) return
        pdfRef.current = doc
        setNumPages(doc.numPages)
        setStatus('ready')
      } catch {
        if (cancelled) return
        setStatus('error')
      }
    }
    void load()
    return () => {
      cancelled = true
      void loadingTask?.destroy()
    }
  }, [url])

  // Desenha a página atual sempre que ela, o zoom ou o modo "ajustar à largura" mudam.
  useEffect(() => {
    if (status !== 'ready' || !pdfRef.current) return
    let cancelled = false
    async function draw() {
      const doc = pdfRef.current
      if (!doc) return
      const pdfPage = await doc.getPage(page)
      if (cancelled) return
      const natural = pdfPage.getViewport({ scale: 1 })
      const containerWidth = containerRef.current?.clientWidth ?? 0
      const effectiveScale =
        fitToWidth && containerWidth > 0 ? containerWidth / natural.width : scale
      const viewport = pdfPage.getViewport({ scale: effectiveScale })
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      // Sem contexto 2D disponível (ambiente sem canvas real): mantém os controles
      // funcionando, só não desenha o pixel a pixel.
      if (!ctx) return
      await pdfPage.render({ canvas, canvasContext: ctx, viewport }).promise
    }
    void draw()
    return () => {
      cancelled = true
    }
  }, [status, page, scale, fitToWidth])

  const zoomIn = () => {
    setFitToWidth(false)
    setScale((s) => Math.min(MAX_SCALE, s * ZOOM_STEP))
  }
  const zoomOut = () => {
    setFitToWidth(false)
    setScale((s) => Math.max(MIN_SCALE, s / ZOOM_STEP))
  }

  return (
    <div
      data-rendra="DOC-001"
      role="group"
      aria-label={title}
      className={cn(
        'flex h-viewer min-h-0 flex-col overflow-hidden rounded-surface border bg-card',
        className,
      )}
    >
      {status === 'empty' && (
        <EmptyState title={emptyTitle} description={emptyDescription} className="m-auto" />
      )}

      {status === 'loading' && (
        <div
          className="m-auto flex flex-col items-center gap-2 px-4 py-8 text-sm text-muted-foreground"
          role="status"
        >
          {loadingLabel}
        </div>
      )}

      {status === 'error' && (
        <EmptyState
          type="error"
          title={errorTitle}
          description={errorDescription}
          className="m-auto"
          actions={
            url && (
              <Button variant="outline" asChild>
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink aria-hidden />
                  {openInNewTabLabel}
                </a>
              </Button>
            )
          }
        />
      )}

      {status === 'ready' && (
        <>
          <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-card px-3 py-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={zoomOutLabel}
                icon={<ZoomOut />}
                onClick={zoomOut}
              />
              <span className="w-12 text-center text-xs text-muted-foreground tabular-nums">
                {fitToWidth ? 'Ajustar' : `${Math.round(scale * 100)}%`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={zoomInLabel}
                icon={<ZoomIn />}
                onClick={zoomIn}
              />
            </div>
            {numPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={previousPageLabel}
                  icon={<ChevronLeft />}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
                <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
                  {page} de {numPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={nextPageLabel}
                  icon={<ChevronRight />}
                  disabled={page >= numPages}
                  onClick={() => setPage((p) => Math.min(numPages, p + 1))}
                />
              </div>
            )}
          </div>
          <div
            ref={containerRef}
            className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-muted p-4"
          >
            <canvas ref={canvasRef} className="max-w-full rounded-item bg-card shadow-sm" />
          </div>
        </>
      )}
    </div>
  )
}

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ActionBar } from '@/components/ui/action-bar'
import { Alert } from '@/components/ui/alert'
import { Slider } from '@/components/ui/slider'
import { Tabs } from '@/components/ui/tabs'
import { cn } from '@/lib/cn'
import { bindPointerDrag } from '@/lib/sortable'

/**
 * Recorte de imagem (etapa A2 do plano da v2): entra um File, sai um File novo, na
 * resolução original (ou até maxOutputWidth). A geometria é uma função pura, testada por
 * proporção, para o arraste e o zoom nunca descolarem a imagem da moldura.
 */

export interface ImageCropperAspect {
  id: string
  label: string
  /** Largura dividida pela altura (1 = quadrado, 16/9 = paisagem). */
  ratio: number
}

export interface ImageCropperProps {
  file: File
  aspects: ImageCropperAspect[]
  /** Teto de largura da saída, em pixels. Sem ele, sai na resolução original do recorte. */
  maxOutputWidth?: number
  /** Chamado só quando o recorte deu certo, com o File novo. */
  onConfirm: (file: File) => void
  onCancel: () => void
  className?: string
}

export interface CropGeometryInput {
  imageWidth: number
  imageHeight: number
  frameWidth: number
  frameHeight: number
  /** 1 = ajuste mínimo para cobrir a moldura; maior aproxima (zoom). */
  zoom: number
  /** Deslocamento desejado do centro da imagem, em pixels de tela. */
  offsetX: number
  offsetY: number
}

export interface CropGeometryResult {
  /** Pixels de tela por pixel da imagem original. */
  scale: number
  /** Deslocamento realmente aplicado: nunca deixa a imagem descolar da moldura. */
  offsetX: number
  offsetY: number
  /** Retângulo de origem, em pixels da imagem original, que cai dentro da moldura. */
  source: { x: number; y: number; width: number; height: number }
}

/**
 * Geometria pura do recorte: a imagem sempre cobre a moldura (escala mínima = "cover"
 * vezes o zoom) e o arraste é limitado à sobra, para nunca abrir vão entre a imagem e a
 * moldura. Devolve também o retângulo de origem na resolução original da imagem, pronto
 * para desenhar num canvas do tamanho da moldura (ou maior, mantendo a proporção).
 */
export function computeCropGeometry({
  imageWidth,
  imageHeight,
  frameWidth,
  frameHeight,
  zoom,
  offsetX,
  offsetY,
}: CropGeometryInput): CropGeometryResult {
  const coverScale = Math.max(frameWidth / imageWidth, frameHeight / imageHeight)
  const scale = coverScale * Math.max(1, zoom)
  const scaledWidth = imageWidth * scale
  const scaledHeight = imageHeight * scale
  const maxOffsetX = Math.max(0, (scaledWidth - frameWidth) / 2)
  const maxOffsetY = Math.max(0, (scaledHeight - frameHeight) / 2)
  const clampedX = Math.min(maxOffsetX, Math.max(-maxOffsetX, offsetX))
  const clampedY = Math.min(maxOffsetY, Math.max(-maxOffsetY, offsetY))
  const centerX = imageWidth / 2 - clampedX / scale
  const centerY = imageHeight / 2 - clampedY / scale
  const sourceWidth = frameWidth / scale
  const sourceHeight = frameHeight / scale
  return {
    scale,
    offsetX: clampedX,
    offsetY: clampedY,
    source: {
      x: centerX - sourceWidth / 2,
      y: centerY - sourceHeight / 2,
      width: sourceWidth,
      height: sourceHeight,
    },
  }
}

/** document.createElement('canvas').getContext('2d') existe? Sem ele, o recorte é impossível. */
function detectCanvasSupport(): boolean {
  try {
    return Boolean(document.createElement('canvas').getContext('2d'))
  } catch {
    return false
  }
}

/** Recorte único: entra um File, sai um File novo na resolução original (ou maxOutputWidth). */
export function ImageCropper({
  file,
  aspects,
  maxOutputWidth,
  onConfirm,
  onCancel,
  className,
}: ImageCropperProps) {
  const canvasSupported = useMemo(detectCanvasSupport, [])
  const [aspectId, setAspectId] = useState(aspects[0]?.id ?? '')
  const aspect = aspects.find((a) => a.id === aspectId) ?? aspects[0]
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 })
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null)
  const [url, setUrl] = useState('')
  const frameRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const measure = () => setFrameSize({ width: el.clientWidth, height: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [aspect?.id])

  // Trocar a proporção começa um recorte novo, sem herdar arraste e zoom da anterior.
  useEffect(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [aspectId])

  if (!canvasSupported) {
    return (
      <div data-rendra="CROP-001" className={cn('flex flex-col gap-4', className)}>
        <Alert
          type="error"
          title="Não é possível recortar aqui"
          description="Este navegador não tem suporte ao recorte de imagem. Envie o arquivo sem recortar ou tente em outro navegador."
        />
        <ActionBar primary={{ label: 'Fechar', onClick: onCancel }} />
      </div>
    )
  }

  const geometry =
    natural && frameSize.width > 0
      ? computeCropGeometry({
          imageWidth: natural.width,
          imageHeight: natural.height,
          frameWidth: frameSize.width,
          frameHeight: frameSize.height,
          zoom,
          offsetX: offset.x,
          offsetY: offset.y,
        })
      : null

  const confirm = () => {
    const img = imgRef.current
    if (!img || !natural || !geometry) return
    const canvas = document.createElement('canvas')
    let outWidth = Math.round(geometry.source.width)
    let outHeight = Math.round(geometry.source.height)
    if (maxOutputWidth && outWidth > maxOutputWidth) {
      const shrink = maxOutputWidth / outWidth
      outWidth = Math.round(outWidth * shrink)
      outHeight = Math.round(outHeight * shrink)
    }
    canvas.width = Math.max(1, outWidth)
    canvas.height = Math.max(1, outHeight)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(
      img,
      geometry.source.x,
      geometry.source.y,
      geometry.source.width,
      geometry.source.height,
      0,
      0,
      canvas.width,
      canvas.height,
    )
    const type = file.type || 'image/png'
    canvas.toBlob((blob) => {
      if (!blob) return
      onConfirm(new File([blob], file.name, { type }))
    }, type)
  }

  return (
    <div data-rendra="CROP-001" className={cn('flex flex-col gap-4', className)}>
      {aspects.length > 1 && (
        <Tabs
          aria-label="Proporção do recorte"
          variant="pill"
          value={aspectId}
          onChange={setAspectId}
          items={aspects.map((a) => ({ value: a.id, label: a.label, content: null }))}
        />
      )}
      <div
        ref={frameRef}
        onPointerDown={(e) => {
          if (!natural) return
          const start = { x: e.clientX, y: e.clientY, base: offset }
          bindPointerDrag(e.currentTarget, e, {
            onMove: (x, y) => {
              const candidate = {
                x: start.base.x + (x - start.x),
                y: start.base.y + (y - start.y),
              }
              const clamped = computeCropGeometry({
                imageWidth: natural.width,
                imageHeight: natural.height,
                frameWidth: frameSize.width,
                frameHeight: frameSize.height,
                zoom,
                offsetX: candidate.x,
                offsetY: candidate.y,
              })
              setOffset({ x: clamped.offsetX, y: clamped.offsetY })
            },
            onEnd: () => {},
          })
        }}
        style={{ '--crop-ratio': aspect?.ratio ?? 1 } as CSSProperties}
        className="relative aspect-crop w-full touch-none overflow-hidden rounded-control bg-muted"
      >
        {url && (
          <img
            ref={imgRef}
            src={url}
            alt=""
            aria-hidden
            onLoad={(e) =>
              setNatural({
                width: e.currentTarget.naturalWidth,
                height: e.currentTarget.naturalHeight,
              })
            }
            style={
              {
                '--crop-x': `${geometry?.offsetX ?? 0}px`,
                '--crop-y': `${geometry?.offsetY ?? 0}px`,
                '--crop-scale': geometry?.scale ?? 1,
              } as CSSProperties
            }
            className="absolute top-1/2 left-1/2 max-w-none origin-center cropper-image select-none"
            draggable={false}
          />
        )}
      </div>
      <Slider
        aria-label="Zoom"
        value={[zoom]}
        onChange={([z]) => setZoom(z ?? 1)}
        min={1}
        max={3}
        step={0.1}
        showValue
        formatValue={(n) => `${n.toFixed(1)}x`}
      />
      <ActionBar
        cancel={{ label: 'Cancelar', onClick: onCancel }}
        primary={{ label: 'Recortar', onClick: confirm, disabled: !geometry }}
      />
    </div>
  )
}

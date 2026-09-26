import { TriangleAlert } from 'lucide-react'
import { useMemo, type CSSProperties } from 'react'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/cn'
import {
  encodeQrMatrix,
  QrEncodingError,
  qrMatrixToSvgPath,
  type ErrorCorrectionLevel,
} from '@/lib/qr-encode'

/*
 * QR Code gerado por um codificador próprio (src/lib/qr-encode.ts), sem biblioteca externa.
 * value vazio é o estado vazio legítimo; valor grande demais para caber até a versão 10 no
 * nível de correção pedido nunca quebra a tela, mostra um ícone com a falha declarada.
 */

export interface QrCodeProps {
  value: string
  /** Lado do quadrado, em pixels. */
  size?: number
  errorCorrection?: ErrorCorrectionLevel
  className?: string
  'aria-label'?: string
  emptyLabel?: string
  errorLabel?: string
}

/** Um único QR Code por tela; nunca crie um segundo componente parecido para outro tamanho. */
export function QrCode({
  value,
  size = 160,
  errorCorrection = 'medium',
  className,
  emptyLabel = 'Nenhum valor para gerar o QR Code.',
  errorLabel = 'Não foi possível gerar o QR Code: o valor é grande demais.',
  ...aria
}: QrCodeProps) {
  const result = useMemo(() => {
    if (!value) return { status: 'empty' as const, matrix: null }
    try {
      return { status: 'ready' as const, matrix: encodeQrMatrix(value, errorCorrection) }
    } catch (e) {
      if (e instanceof QrEncodingError) return { status: 'error' as const, matrix: null }
      throw e
    }
  }, [value, errorCorrection])

  if (result.status === 'empty') {
    return (
      <div
        data-rendra="QRC-001"
        style={{ '--size': `${size}px` } as CSSProperties}
        className={cn('flex size-var items-center justify-center', className)}
      >
        <EmptyState size="compact" title={emptyLabel} />
      </div>
    )
  }

  if (result.status === 'error') {
    return (
      <div
        data-rendra="QRC-001"
        role="img"
        aria-label={errorLabel}
        style={{ '--size': `${size}px` } as CSSProperties}
        className={cn(
          'flex size-var flex-col items-center justify-center gap-2 rounded-control border border-dashed border-input p-2 text-center text-muted-foreground',
          className,
        )}
      >
        <TriangleAlert className="size-icon-lg" aria-hidden />
        <span className="text-xs">{errorLabel}</span>
      </div>
    )
  }

  const path = qrMatrixToSvgPath(result.matrix)
  return (
    <svg
      data-rendra="QRC-001"
      role="img"
      aria-label={aria['aria-label'] ?? `Código QR de ${value}`}
      viewBox={`0 0 ${result.matrix.size} ${result.matrix.size}`}
      style={{ '--size': `${size}px` } as CSSProperties}
      className={cn('size-var text-foreground', className)}
    >
      <path d={path} fill="currentColor" />
    </svg>
  )
}

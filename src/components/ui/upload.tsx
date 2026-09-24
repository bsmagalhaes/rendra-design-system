import { FileText, ImageIcon, RotateCw, Trash2, UploadCloud } from 'lucide-react'
import { useId, useRef, useState, type DragEvent } from 'react'
import { BrandFeedbackIcon } from '@/components/ui/brand-feedback-icon'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/cn'

export interface UploadItem {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'done' | 'error'
  error?: string
}

export interface UploadProps {
  /** Tipos aceitos, como no input file (ex.: "image/*,.pdf"). */
  accept?: string
  multiple?: boolean
  /** Tamanho máximo por arquivo, em MB. */
  maxSizeMb?: number
  /** Envia o arquivo; chame onProgress(0..100). Rejeite a promessa em caso de erro. */
  onUpload?: (file: File, onProgress: (pct: number) => void) => Promise<void>
  onChange?: (items: UploadItem[]) => void
  hint?: string
  disabled?: boolean
  invalid?: boolean
  id?: string
  'aria-describedby'?: string
}

const formatSize = (b: number) =>
  b < 1024 * 1024
    ? `${Math.max(1, Math.round(b / 1024))} KB`
    : `${(b / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`

/** Upload único: arrastar e soltar ou tocar para escolher, com lista e progresso por arquivo. */
export function Upload({
  accept,
  multiple = true,
  maxSizeMb = 10,
  onUpload,
  onChange,
  hint,
  disabled,
  invalid,
  id,
  ...aria
}: UploadProps) {
  const auto = useId()
  const inputId = id ?? `upload${auto}`
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [items, setItems] = useState<UploadItem[]>([])

  const update = (fn: (all: UploadItem[]) => UploadItem[]) =>
    setItems((all) => {
      const next = fn(all)
      onChange?.(next)
      return next
    })

  const send = (item: UploadItem) => {
    if (!onUpload) {
      update((all) =>
        all.map((i) => (i.id === item.id ? { ...i, progress: 100, status: 'done' } : i)),
      )
      return
    }
    onUpload(item.file, (pct) =>
      update((all) => all.map((i) => (i.id === item.id ? { ...i, progress: pct } : i))),
    )
      .then(() =>
        update((all) =>
          all.map((i) => (i.id === item.id ? { ...i, progress: 100, status: 'done' } : i)),
        ),
      )
      .catch((e: unknown) =>
        update((all) =>
          all.map((i) =>
            i.id === item.id
              ? { ...i, status: 'error', error: e instanceof Error ? e.message : 'Falha no envio.' }
              : i,
          ),
        ),
      )
  }

  const add = (files: FileList | null) => {
    if (!files) return
    const list = Array.from(files).slice(0, multiple ? undefined : 1)
    const created: UploadItem[] = list.map((file) => {
      const tooBig = file.size > maxSizeMb * 1024 * 1024
      return {
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        progress: 0,
        status: tooBig ? 'error' : 'uploading',
        error: tooBig ? `Arquivo maior que ${maxSizeMb} MB.` : undefined,
      }
    })
    update((all) => (multiple ? [...all, ...created] : created))
    created.filter((c) => c.status === 'uploading').forEach(send)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDrag(false)
    if (!disabled) add(e.dataTransfer.files)
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-control border-2 border-dashed border-input bg-card px-4 py-8 text-center transition-colors',
          'hover:border-primary hover:bg-primary-soft/40 has-[:focus-visible]:focus-ring',
          drag && 'border-primary bg-primary-soft',
          invalid && 'border-destructive',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground">
          <UploadCloud className="size-icon-lg" aria-hidden />
        </span>
        <span className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            <span className="text-primary">Toque para escolher</span>
            <span className="hidden md:inline"> ou arraste arquivos até aqui</span>
          </span>
          <span className="text-xs text-muted-foreground">
            {hint ?? `Até ${maxSizeMb} MB por arquivo.`}
          </span>
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-describedby={aria['aria-describedby']}
          className="sr-only"
          onChange={(e) => {
            add(e.target.files)
            e.target.value = ''
          }}
        />
      </label>

      {items.length > 0 && (
        <ul className="flex flex-col divide-y rounded-control border bg-card" aria-live="polite">
          {items.map((it) => {
            const isImage = it.file.type.startsWith('image/')
            return (
              <li key={it.id} className="flex items-center gap-3 p-3">
                <span className="flex size-control-sm shrink-0 items-center justify-center rounded-item bg-muted text-muted-foreground md:size-control-md">
                  {isImage ? (
                    <ImageIcon className="size-icon-md" aria-hidden />
                  ) : (
                    <FileText className="size-icon-md" aria-hidden />
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{it.file.name}</span>
                    {it.status === 'done' && (
                      <BrandFeedbackIcon type="success" size="sm" animated label="Enviado" />
                    )}
                    {it.status === 'error' && (
                      <BrandFeedbackIcon type="error" size="sm" label="Erro" />
                    )}
                  </div>
                  {it.status === 'error' ? (
                    <span className="text-xs font-medium text-destructive">{it.error}</span>
                  ) : it.status === 'uploading' ? (
                    <Progress
                      value={it.progress}
                      size="sm"
                      showValue
                      label={`Enviando ${it.file.name}`}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {formatSize(it.file.size)}
                    </span>
                  )}
                </div>
                {it.status === 'error' && !it.error?.startsWith('Arquivo maior') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={`Tentar enviar ${it.file.name} de novo`}
                    onClick={() => {
                      update((all) =>
                        all.map((i) =>
                          i.id === it.id
                            ? { ...i, status: 'uploading', progress: 0, error: undefined }
                            : i,
                        ),
                      )
                      send({ ...it, status: 'uploading', progress: 0 })
                    }}
                  >
                    <RotateCw />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={`Remover ${it.file.name}`}
                  onClick={() => update((all) => all.filter((i) => i.id !== it.id))}
                >
                  <Trash2 />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

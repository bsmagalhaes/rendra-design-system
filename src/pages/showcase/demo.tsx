import type { ReactNode } from 'react'
import { Inline, Stack } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'

/* Blocos de montagem da vitrine /componentes. */

export function Demo({
  id,
  title,
  description,
  props,
  children,
  bare,
}: {
  id: string
  title: string
  description: string
  props?: string
  children: ReactNode
  /** Sem o card em volta (para componentes que já são cards, como a Table). */
  bare?: boolean
}) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="flex scroll-mt-6 flex-col gap-4">
      <Stack gap="1">
        <h2 id={`${id}-t`} className="text-xl">
          {title}
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
        {props && (
          <p className="text-xs text-muted-foreground">
            Props: <code className="font-mono break-words text-foreground">{props}</code>
          </p>
        )}
      </Stack>
      {bare ? (
        children
      ) : (
        <Card>
          <CardContent>
            <Stack gap="6">{children}</Stack>
          </CardContent>
        </Card>
      )}
    </section>
  )
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack gap="2">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <Inline gap="3">{children}</Inline>
    </Stack>
  )
}

export function GroupTitle({
  id,
  title,
  description,
}: {
  id: string
  title: string
  description: string
}) {
  return (
    <div id={id} className="flex scroll-mt-6 flex-col gap-1 border-b pb-4">
      <span className="text-xs font-medium tracking-wide text-primary uppercase">Grupo</span>
      <h2 className="text-2xl">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

/** Envio fictício com progresso, para demonstrar Upload. */
export function fakeUpload(file: File, onProgress: (n: number) => void) {
  return new Promise<void>((resolve, reject) => {
    let p = 0
    const t = window.setInterval(() => {
      p += 12 + Math.random() * 18
      onProgress(Math.min(100, p))
      if (p >= 100) {
        window.clearInterval(t)
        if (file.name.toLowerCase().includes('erro'))
          reject(new Error('Servidor recusou o arquivo.'))
        else resolve()
      }
    }, 250)
  })
}

export const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

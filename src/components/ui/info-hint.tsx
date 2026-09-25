import { Info } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/cn'

/*
 * Texto orientativo (como usar a tela, o que um campo faz, de onde vem um número). Nunca fica
 * solto no corpo da tela nem num botão "Saiba mais" avulso: é um ícone de informação discreto,
 * ao lado do título a que se refere, que abre um Modal informativo.
 * Onde aparece: PageHeader help (ao lado do título da tela, no header fixo), CardTitle help e
 * FormSection help (ao lado do título do card). Use direto só quando nenhum desses servir.
 */

export interface InfoHintProps {
  /** Título do modal (em geral, o título da tela ou da seção). */
  title: string
  /** O texto orientativo. Pode ter parágrafos e listas. */
  children: ReactNode
  className?: string
}

export function InfoHint({ title, children, className }: InfoHintProps) {
  const [open, setOpen] = useState(false)
  return (
    // Wrapper sem layout próprio (display: contents): o botão é o único elemento sempre
    // presente (o Modal só monta o próprio conteúdo quando aberto), então o data-rendra
    // do InfoHint vive aqui, não no botão (que já carrega o código do Button).
    <span className="contents" data-rendra="INFO-001">
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label={`Sobre: ${title}`}
        onClick={() => setOpen(true)}
        className={cn(
          'shrink-0 text-muted-foreground hover:text-primary-text max-md:size-touch',
          className,
        )}
      >
        <Info aria-hidden />
      </Button>
      <Modal open={open} onOpenChange={setOpen} type="info" title={title} size="md">
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">{children}</div>
      </Modal>
    </span>
  )
}

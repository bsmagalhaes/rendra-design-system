import { MoreHorizontal } from 'lucide-react'
import { useContext, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ShellContext } from '@/components/app-shell/shell-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/cn'

export interface ActionBarAction {
  label: string
  onClick?: () => void
  icon?: ReactNode
  disabled?: boolean
  destructive?: boolean
}

export interface ActionBarProps {
  /** Ação principal: sempre primária (ou destrutiva), 70% da largura. */
  primary: ActionBarAction & {
    type?: 'button' | 'submit'
    form?: string
    loading?: boolean
    loadingLabel?: string
  }
  /** Cancelar: sempre outline, 30% à esquerda. Sem ele, a principal ocupa 100%. */
  cancel?: ActionBarAction
  /** A partir da terceira ação: vão para o menu de três pontinhos. */
  secondary?: ActionBarAction[]
  /**
   * sticky: rodapé fixo das telas de formulário. Fica sempre colado embaixo, na largura
   * inteira, fora da área rolável (nunca sobe, mesmo com formulário curto). Em drawer e
   * modal o rodapé já é fixo; no wizard os botões seguem junto do card. Como o botão fica
   * fora do <form>, use primary.form com o id do formulário para enviar.
   */
  sticky?: boolean
  className?: string
}

/**
 * Barra de ações única, com a regra de botões do sistema:
 * 1 botão = 100%; 2 botões = cancelar 30% + principal 70%; 3 ou mais = extras no menu.
 * Vale para drawer, modal e formulário em página, em qualquer tamanho de tela.
 */
export function ActionBar({ primary, cancel, secondary, sticky, className }: ActionBarProps) {
  const slot = useContext(ShellContext)?.footerSlot
  const hasMenu = Boolean(secondary?.length)
  const layout = cancel
    ? hasMenu
      ? 'grid-actions-3'
      : 'grid-actions-2'
    : hasMenu
      ? 'grid-actions-3'
      : ''

  const bar = (
    <div
      className={cn(
        sticky && 'border-t bg-card px-4 pt-4 pb-safe md:px-6',
        // Fora do AppShell (Storybook, telas soltas): fixo no fim da área rolável.
        sticky && !slot && 'sticky bottom-0 z-20',
        className,
      )}
    >
      <div className={cn('grid gap-3', layout || 'grid-cols-1', sticky && 'w-full')}>
        {hasMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" iconOnly aria-label="Mais ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top">
              {secondary!.map((a) => (
                <DropdownMenuItem
                  key={a.label}
                  onSelect={a.onClick}
                  disabled={a.disabled}
                  destructive={a.destructive}
                >
                  {a.icon}
                  {a.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {cancel ? (
          <Button
            variant="outline"
            icon={cancel.icon}
            onClick={cancel.onClick}
            disabled={cancel.disabled || primary.loading}
            fullWidth
          >
            {cancel.label}
          </Button>
        ) : hasMenu ? (
          <span aria-hidden />
        ) : null}
        <Button
          type={primary.type ?? 'button'}
          form={primary.form}
          variant={primary.destructive ? 'destructive' : 'primary'}
          icon={primary.icon}
          onClick={primary.onClick}
          disabled={primary.disabled}
          loading={primary.loading}
          fullWidth
        >
          {primary.loading ? (primary.loadingLabel ?? 'Salvando...') : primary.label}
        </Button>
      </div>
    </div>
  )
  return sticky && slot ? createPortal(bar, slot) : bar
}

import { MoreHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'
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
   * sticky: rodapé fixo no fim da área rolável (formulário em página), com borda
   * superior e área segura do aparelho. Em drawer e modal o rodapé já é fixo.
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
  const hasMenu = Boolean(secondary?.length)
  const layout = cancel
    ? hasMenu
      ? 'grid-actions-3'
      : 'grid-actions-2'
    : hasMenu
      ? 'grid-actions-3'
      : ''

  return (
    <div
      className={cn(
        sticky &&
          'sticky bottom-0 z-20 -mx-4 border-t bg-card px-4 pt-4 pb-safe md:-mx-6 md:px-6 lg:mx-0 lg:rounded-t-surface lg:border-x lg:px-6',
        className,
      )}
    >
      <div className={cn('grid gap-3', layout || 'grid-cols-1')}>
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
}

import { cn } from '@/lib/cn'

/*
 * Crédito discreto "Feito com Rendra", para o rodapé da tela de login (nunca na sidebar).
 * Ligado por padrão; some com credit={false}. Texto e link são substituíveis por prop.
 * Abre em nova aba, com alvo de toque de 44px no celular e texto de apoio em cor muted.
 *
 * Remover o crédito da interface é permitido: a licença MIT pede que o aviso de copyright
 * e o arquivo LICENSE fiquem no código e nas cópias, não que haja crédito visível na tela.
 */

export const RENDRA_CREDIT_TEXT = 'Feito com Rendra'
export const RENDRA_CREDIT_HREF = 'https://github.com/bsmagalhaes/rendra-design-system'

export interface RendraCreditProps {
  /** Padrão true; false remove o crédito. */
  credit?: boolean
  /** Padrão "Feito com Rendra". */
  text?: string
  /** Padrão: o repositório do Rendra Design System. */
  href?: string
  className?: string
}

export function RendraCredit({
  credit = true,
  text = RENDRA_CREDIT_TEXT,
  href = RENDRA_CREDIT_HREF,
  className,
}: RendraCreditProps) {
  if (!credit) return null
  return (
    <a
      data-rendra="CRED-001"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex min-h-touch items-center self-center rounded-item px-2 text-xs text-muted-foreground transition-colors hover:text-primary-text hover:underline md:min-h-0 md:py-1',
        className,
      )}
    >
      {text} <span className="sr-only">(abre em nova aba)</span>
    </a>
  )
}

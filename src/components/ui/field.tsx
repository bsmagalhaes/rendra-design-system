import { Label as L } from 'radix-ui'
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react'
import { fieldSpanClass, type FieldSpan } from '@/components/layout/tokens'
import { cn } from '@/lib/cn'

/*
 * Rótulo, ajuda e erro padronizados.
 * Regras: rótulo sempre acima; obrigatório marcado no rótulo; erro abaixo do campo em
 * espaço reservado (a tela não pula quando o erro aparece).
 */

export function Label({
  className,
  required,
  children,
  ...props
}: ComponentProps<typeof L.Root> & { required?: boolean }) {
  return (
    <L.Root
      data-rendra="FLD-002"
      className={cn('text-sm font-medium text-foreground', className)}
      {...props}
    >
      {children}
      {required && (
        <span className="text-destructive" aria-hidden>
          {' '}
          *
        </span>
      )}
      {required && <span className="sr-only"> (obrigatório)</span>}
    </L.Root>
  )
}

interface FieldContextValue {
  id: string
  describedBy: string
  invalid: boolean
}
const FieldContext = createContext<FieldContextValue | null>(null)

/** Liga um controle ao Field mais próximo (id, aria-describedby, aria-invalid). */
export function useFieldControl() {
  return useContext(FieldContext)
}

export interface FieldProps {
  label?: ReactNode
  required?: boolean
  /** Texto de ajuda sempre visível (substitui tooltip no mobile). */
  help?: ReactNode
  /** Mensagem de erro, abaixo do controle, no lugar da ajuda. */
  error?: ReactNode
  /**
   * Largura na grade de formulário (Grid form ou FormSection): xs (17%), sm (25%),
   * md (33%, padrão: 3 por linha), lg (50%), xl (67%), full. half é o antigo e vale md.
   */
  span?: FieldSpan | 'half'
  /** Começa uma linha nova (ex.: os campos que vêm depois do CEP ou do CNPJ). */
  newRow?: boolean
  /**
   * Reserva a linha da mensagem mesmo vazia, para o erro não empurrar o que vem abaixo
   * (útil em formulários em grid de 2 colunas com validação ao digitar). Padrão: não
   * reserva, e os campos ficam mais próximos.
   */
  reserveMessage?: boolean
  /** Obsoleto: sem reserva já é o padrão. Mantido para não quebrar telas existentes. */
  compact?: boolean
  /** id do controle; gerado automaticamente se omitido. */
  id?: string
  className?: string
  children: ReactNode
}

export function Field({
  label,
  required,
  help,
  error,
  span = 'md',
  newRow,
  reserveMessage = false,
  id,
  className,
  children,
}: FieldProps) {
  const auto = useId()
  const controlId = id ?? `campo${auto}`
  const messageId = `${controlId}-mensagem`
  const invalid = Boolean(error)
  const message = error ?? help

  // Repassa id e acessibilidade ao controle filho quando ele é um elemento simples.
  const child =
    isValidElement(children) && typeof children.type !== 'string'
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          id: (children.props as { id?: string }).id ?? controlId,
          // Só repassa invalid quando há erro, para não vazar o atributo em elementos comuns.
          ...(invalid
            ? { invalid: (children.props as { invalid?: boolean }).invalid ?? true }
            : {}),
          'aria-describedby': message ? messageId : undefined,
          'aria-required': required || undefined,
        })
      : children

  return (
    <FieldContext.Provider
      value={{ id: controlId, describedBy: message ? messageId : '', invalid }}
    >
      <div
        data-slot="field"
        data-rendra="FLD-001"
        className={cn(
          'flex min-w-0 flex-col gap-2',
          fieldSpanClass[span === 'half' ? 'md' : span],
          newRow && '@md:col-start-1 @3xl:col-start-1',
          className,
        )}
      >
        {label && (
          <Label htmlFor={controlId} required={required}>
            {label}
          </Label>
        )}
        {child}
        {(reserveMessage || message) && (
          <p
            id={messageId}
            role={invalid ? 'alert' : undefined}
            className={cn(
              '-mt-1 min-h-4 text-xs',
              invalid ? 'font-medium text-destructive' : 'text-muted-foreground',
            )}
          >
            {message}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  )
}

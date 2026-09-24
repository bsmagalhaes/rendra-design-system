import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Moldura única dos campos (Input, Select, DatePicker, Textarea). Mesma altura dos botões
 * em cada tamanho; fonte de 16px no mobile para o iOS não dar zoom ao focar.
 */
/** Marque o elemento com data-slot="control": o teste de toque mede a moldura, não o input. */
export const controlFrame = cva(
  'group/control flex w-full min-w-0 items-center gap-2 rounded-control border border-input bg-field text-base text-foreground transition-[border-color,box-shadow] duration-150 focus-within:border-ring focus-within:bg-card focus-within:ring-2 focus-within:ring-ring/25 hover:border-foreground/40 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:disabled]:hover:border-input md:text-sm',
  {
    variants: {
      size: {
        sm: 'h-control-sm px-3',
        md: 'h-control-md px-3',
        lg: 'h-control-lg px-4',
      },
      invalid: {
        true: 'border-destructive focus-within:border-destructive focus-within:ring-destructive/25 hover:border-destructive',
        false: '',
      },
    },
    defaultVariants: { size: 'md', invalid: false },
  },
)

export type ControlSize = NonNullable<VariantProps<typeof controlFrame>['size']>

/** Classe do <input> nativo dentro da moldura. */
export const controlInput =
  'h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed'

/** Botão pequeno dentro da moldura (limpar, mostrar senha). */
export const controlAdornmentButton =
  '-mr-2 flex size-control-sm shrink-0 cursor-pointer items-center justify-center rounded-item text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:-mr-1 md:size-8 [&_svg]:size-icon-sm'

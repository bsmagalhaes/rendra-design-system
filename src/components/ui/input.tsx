import IMask, { type FactoryArg, type InputMask } from 'imask'
import { Eye, EyeOff, X } from 'lucide-react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/cn'
import { controlAdornmentButton, controlFrame, controlInput, type ControlSize } from '@/lib/control'
import { masks, type MaskName } from '@/lib/masks'

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'onChange'
> {
  size?: ControlSize
  /** Máscara brasileira. Define também o teclado do celular (inputMode). */
  mask?: MaskName
  /** Ícone à esquerda. */
  icon?: ReactNode
  /** Conteúdo fixo à direita (ex.: "kg", "dias"). */
  suffix?: ReactNode
  /** Mostra botão para limpar quando há valor. */
  clearable?: boolean
  /** Estado de erro (normalmente vem do Field). */
  invalid?: boolean
  value?: string
  /** Recebe o valor como aparece no campo (com máscara). */
  onChange?: (value: string) => void
  /** Recebe o valor sem máscara (só dígitos, ou número para moeda e percentual). */
  onValueChange?: (unmasked: string, masked: string) => void
  className?: string
}

/**
 * Input único. Tipos, máscaras, ícone, limpar e senha são props:
 * nunca crie InputCPF, InputTelefone ou InputSenha.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size,
    mask,
    icon,
    suffix,
    clearable,
    invalid,
    type = 'text',
    value,
    defaultValue,
    onChange,
    onValueChange,
    disabled,
    className,
    inputMode,
    placeholder,
    ...props
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)
  const maskRef = useRef<InputMask<FactoryArg> | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [inner, setInner] = useState(String(value ?? defaultValue ?? ''))
  const current = value ?? inner
  const cb = useRef({ onChange, onValueChange })
  cb.current = { onChange, onValueChange }

  // Máscara: criada uma vez por tipo de máscara, sincronizada com o valor controlado.
  useEffect(() => {
    if (!mask || !inputRef.current) return
    const m = IMask(inputRef.current, masks[mask].options)
    maskRef.current = m
    m.on('accept', () => {
      setInner(m.value)
      cb.current.onChange?.(m.value)
      cb.current.onValueChange?.(m.unmaskedValue, m.value)
    })
    return () => {
      m.destroy()
      maskRef.current = null
    }
  }, [mask])

  useEffect(() => {
    const m = maskRef.current
    if (m && value !== undefined && value !== m.value) m.value = value
  }, [value])

  const isPassword = type === 'password'
  const def = mask ? masks[mask] : undefined

  const clear = () => {
    if (maskRef.current) maskRef.current.value = ''
    setInner('')
    onChange?.('')
    onValueChange?.('', '')
    inputRef.current?.focus()
  }

  return (
    <div data-slot="control" className={cn(controlFrame({ size, invalid }), className)}>
      {icon && (
        <span className="flex shrink-0 text-muted-foreground [&_svg]:size-icon-sm" aria-hidden>
          {icon}
        </span>
      )}
      <input
        ref={inputRef}
        type={isPassword && showPassword ? 'text' : type}
        inputMode={inputMode ?? def?.inputMode}
        placeholder={placeholder ?? def?.placeholder}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={controlInput}
        {...(mask
          ? { defaultValue: current }
          : {
              value: current,
              onChange: (e) => {
                setInner(e.target.value)
                onChange?.(e.target.value)
                onValueChange?.(e.target.value, e.target.value)
              },
            })}
        {...props}
      />
      {suffix && <span className="shrink-0 text-sm text-muted-foreground">{suffix}</span>}
      {clearable && current && !disabled && (
        <button
          type="button"
          onClick={clear}
          aria-label="Limpar campo"
          className={controlAdornmentButton}
        >
          <X aria-hidden />
        </button>
      )}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={showPassword}
          className={controlAdornmentButton}
        >
          {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
        </button>
      )}
    </div>
  )
})

import IMask, { type FactoryArg, type InputMask } from 'imask'
import { ChevronDown, Eye, EyeOff, Loader2, X } from 'lucide-react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { useLookup, type LookupResult } from '@/hooks/use-lookup'
import { cn } from '@/lib/cn'
import { controlAdornmentButton, controlFrame, controlInput, type ControlSize } from '@/lib/control'
import {
  DEFAULT_DDI,
  internationalPhoneMask,
  masks,
  phoneCountries,
  toCents,
  type MaskName,
  type PhoneCountry,
} from '@/lib/masks'

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
  /**
   * Telefone (mask="phone"): DDI escolhido no seletor embutido à esquerda, sem o "+".
   * Padrão "55". Com +55 a máscara é a brasileira; com outro DDI, só dígitos.
   * O valor do campo continua sendo o número nacional; o completo sai de toE164(ddi, valor).
   */
  ddi?: string
  onDdiChange?: (ddi: string) => void
  /** Países do seletor de DDI. Padrão: phoneCountries (Brasil primeiro). */
  ddiOptions?: PhoneCountry[]
  /** Esconde o seletor de DDI do telefone (só números brasileiros). */
  hideDdi?: boolean
  /**
   * Moeda (mask="currency"): recebe o valor em centavos inteiros (R$ 1.250,50 -> 125050),
   * ou null quando vazio. Guarde e some dinheiro sempre em centavos.
   */
  onCentsChange?: (cents: number | null) => void
  /**
   * CEP, CNPJ e CPF ou CNPJ (mask="cep", "cnpj" ou "cpfCnpj"): busca os dados assim que o
   * campo fica completo (ViaCEP e BrasilAPI), mostra o carregamento no campo e entrega o
   * resultado. A tela decide o que preencher; use `result.message` como ajuda do Field.
   */
  onLookup?: (result: LookupResult) => void
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
    ddi: ddiProp,
    onDdiChange,
    ddiOptions = phoneCountries,
    hideDdi,
    onCentsChange,
    onLookup,
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
  const cb = useRef({ onChange, onValueChange, onCentsChange })
  cb.current = { onChange, onValueChange, onCentsChange }
  const lookupKind =
    mask === 'cep' ? 'cep' : mask === 'cnpj' ? 'cnpj' : mask === 'cpfCnpj' ? 'auto' : undefined
  const searching = useLookup(lookupKind, current, onLookup)

  // Telefone: seletor de DDI embutido. Controlado pela prop ddi ou interno.
  const isPhone = mask === 'phone'
  const [innerDdi, setInnerDdi] = useState(ddiProp ?? DEFAULT_DDI)
  const ddi = ddiProp ?? innerDdi
  const showDdi = isPhone && !hideDdi
  const intl = isPhone && ddi !== DEFAULT_DDI
  const def = intl ? internationalPhoneMask : mask ? masks[mask] : undefined
  const maskKey = intl ? 'phone-intl' : mask

  // Máscara: criada uma vez por tipo de máscara, sincronizada com o valor controlado.
  useEffect(() => {
    if (!maskKey || !def || !inputRef.current) return
    const m = IMask(inputRef.current, def.options)
    maskRef.current = m
    m.on('accept', () => {
      setInner(m.value)
      cb.current.onChange?.(m.value)
      cb.current.onValueChange?.(m.unmaskedValue, m.value)
      if (mask === 'currency') cb.current.onCentsChange?.(toCents(m.value))
    })
    return () => {
      m.destroy()
      maskRef.current = null
    }
    // A máscara só muda com o tipo (maskKey); def acompanha o maskKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maskKey])

  useEffect(() => {
    const m = maskRef.current
    if (m && value !== undefined && value !== m.value) m.value = value
  }, [value])

  const isPassword = type === 'password'
  const country = ddiOptions.find((c) => c.ddi === ddi)

  const clear = () => {
    if (maskRef.current) maskRef.current.value = ''
    setInner('')
    onChange?.('')
    onValueChange?.('', '')
    onCentsChange?.(null)
    inputRef.current?.focus()
  }

  return (
    <div data-slot="control" className={cn(controlFrame({ size, invalid }), className)}>
      {showDdi && (
        // Seletor nativo transparente sobre o "+55": no celular abre a lista do sistema.
        <span className="relative -ml-1 flex h-full shrink-0 items-center gap-1 border-r pr-2 text-sm font-medium">
          <span aria-hidden>+{ddi}</span>
          <ChevronDown className="size-icon-sm text-muted-foreground" aria-hidden />
          <select
            aria-label={`Código do país (DDI): ${country?.name ?? ''} +${ddi}`}
            value={ddi}
            disabled={disabled}
            onChange={(e) => {
              setInnerDdi(e.target.value)
              onDdiChange?.(e.target.value)
            }}
            className="absolute inset-0 cursor-pointer bg-popover text-popover-foreground opacity-0 disabled:cursor-not-allowed"
          >
            {ddiOptions.map((c) => (
              <option key={c.ddi} value={c.ddi} className="bg-popover text-popover-foreground">
                {c.name} (+{c.ddi})
              </option>
            ))}
          </select>
        </span>
      )}
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
        aria-busy={searching || undefined}
        className={controlInput}
        {...(maskKey
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
      {searching && (
        <span role="status" className="flex shrink-0 text-muted-foreground [&_svg]:size-icon-sm">
          <Loader2 className="animate-spin" aria-hidden />
          <span className="sr-only">Buscando…</span>
        </span>
      )}
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

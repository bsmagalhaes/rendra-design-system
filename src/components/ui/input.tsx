import IMask, { type FactoryArg, type InputMask } from 'imask'
import { ChevronDown, Eye, EyeOff, X } from 'lucide-react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useLookup, type LookupResult } from '@/hooks/use-lookup'
import { cn } from '@/lib/cn'
import { controlAdornmentButton, controlFrame, controlInput, type ControlSize } from '@/lib/control'
import {
  DEFAULT_DDI,
  internationalPhoneMask,
  masks,
  percentMask,
  phoneCountries,
  toCents,
  type MaskName,
  type PhoneCountry,
} from '@/lib/masks'

/** Uma unidade do seletor embutido do Input (A9). */
export interface InputUnitOption {
  /** "percent" e "currency" ligam a máscara de percentual e de moeda automaticamente. */
  id: string
  label: string
}

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'onChange'
> {
  size?: ControlSize
  /** Máscara brasileira. Define também o teclado do celular (inputMode). */
  mask?: MaskName
  /** Ícone à esquerda. */
  icon?: ReactNode
  /** Conteúdo fixo à direita (ex.: "kg", "dias"). Ignorado quando `units` está presente. */
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
  /**
   * Unidades (A9): seletor embutido à direita, no mesmo padrão do seletor de DDI. O id
   * "percent" liga a máscara de percentual (teto configurável por `percentMax`); "currency"
   * liga a máscara de moeda (R$ 1.250,00). Qualquer outro id não aplica máscara, só rótulo.
   * Trocar de unidade sempre limpa o valor do campo.
   */
  units?: InputUnitOption[]
  /** Unidade escolhida (controlada). Sem ela, usa a primeira de `units`. */
  unit?: string
  onUnitChange?: (unit: string) => void
  /** Teto do percentual quando a unidade escolhida é "percent". Padrão 100. */
  percentMax?: number
  /**
   * Variante de valor guardado (A10): mostra `maskedHint` no lugar do valor real, que nunca
   * chega a existir no DOM. "Trocar" abre um campo vazio (`isEditing`); cancelar volta à
   * máscara. O componente é controlado pela tela: `isEditing`, `onStartEdit`, `onCancelEdit`.
   */
  variant?: 'secret'
  /** Há um valor salvo (mesmo sem mostrá-lo). */
  hasValue?: boolean
  /** Texto mascarado mostrado no lugar do valor, ex.: "••••••a1b2c3". */
  maskedHint?: string
  /** Campo aberto para digitar um valor novo. */
  isEditing?: boolean
  onStartEdit?: () => void
  onCancelEdit?: () => void
  /** Remove o valor salvo. Sem essa prop, o botão "Remover" não aparece. */
  onRemove?: () => void
  /** Remoção em andamento: desabilita e mostra o carregamento no botão "Remover". */
  removing?: boolean
  className?: string
}

/**
 * Input único. Tipos, máscaras, ícone, limpar, senha, unidades e valor guardado são props:
 * nunca crie InputCPF, InputTelefone, InputSenha ou InputSegredo.
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
    units,
    unit: unitProp,
    onUnitChange,
    percentMax,
    variant,
    hasValue,
    maskedHint,
    isEditing,
    onStartEdit,
    onCancelEdit,
    onRemove,
    removing,
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

  // Unidades (A9): seletor embutido à direita. A unidade escolhida decide a máscara.
  const hasUnits = Boolean(units && units.length > 0)
  const [innerUnit, setInnerUnit] = useState(unitProp ?? units?.[0]?.id ?? '')
  const unit = hasUnits ? (unitProp ?? innerUnit) : undefined
  const unitMaskName = unit === 'percent' ? 'percent' : unit === 'currency' ? 'currency' : undefined

  const def = intl
    ? internationalPhoneMask
    : hasUnits
      ? unitMaskName === 'percent'
        ? percentMask(percentMax)
        : unitMaskName === 'currency'
          ? masks.currency
          : undefined
      : mask
        ? masks[mask]
        : undefined
  const maskKey = !def
    ? undefined
    : intl
      ? 'phone-intl'
      : hasUnits
        ? `unit-${unitMaskName}-${percentMax ?? ''}`
        : mask

  // Máscara: criada uma vez por tipo de máscara, sincronizada com o valor controlado.
  useEffect(() => {
    if (!maskKey || !def || !inputRef.current) return
    const m = IMask(inputRef.current, def.options)
    maskRef.current = m
    m.on('accept', () => {
      setInner(m.value)
      cb.current.onChange?.(m.value)
      cb.current.onValueChange?.(m.unmaskedValue, m.value)
      if (mask === 'currency' || unitMaskName === 'currency')
        cb.current.onCentsChange?.(toCents(m.value))
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
  const isSecret = variant === 'secret'
  // id e aria-* que o Field injeta no controle (não removidos de props: o <input> normal
  // continua recebendo pelo {...props}). No modo leitura do secret não há <input>; sem
  // repassar para o botão Trocar, o Label do Field fica apontando para um id inexistente.
  const {
    id: fieldId,
    'aria-describedby': fieldDescribedBy,
    'aria-required': fieldRequired,
  } = props

  // Esvazia o valor (máscara, estado interno e os callbacks): usado por "Limpar campo" e
  // por trocar de unidade, que nunca deve carregar o número de uma unidade para outra.
  const resetValue = () => {
    if (maskRef.current) maskRef.current.value = ''
    setInner('')
    onChange?.('')
    onValueChange?.('', '')
    onCentsChange?.(null)
  }

  const clear = () => {
    resetValue()
    inputRef.current?.focus()
  }

  // Trocar de unidade sempre limpa o valor (a máscara muda junto).
  const changeUnit = (id: string) => {
    setInnerUnit(id)
    onUnitChange?.(id)
    resetValue()
  }

  // ---------------------------------------------------------------- variant="secret" (A10)
  if (isSecret && !isEditing) {
    return (
      <div
        data-slot="control"
        data-rendra="CAMP-001"
        className={cn(controlFrame({ size, invalid }), className)}
      >
        <span className="min-w-0 flex-1 truncate font-mono text-sm text-muted-foreground">
          {hasValue ? (maskedHint ?? '••••••••') : 'Nenhum valor salvo'}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onStartEdit}
          disabled={disabled}
          id={fieldId}
          aria-describedby={fieldDescribedBy}
          aria-required={fieldRequired}
        >
          Trocar
        </Button>
        {hasValue && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={disabled || removing}
            loading={removing}
          >
            Remover
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      data-slot="control"
      data-rendra="CAMP-001"
      className={cn(controlFrame({ size, invalid }), className)}
    >
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
        key={hasUnits ? `unit-${unit}` : undefined}
        ref={inputRef}
        type={
          isSecret
            ? showPassword
              ? 'text'
              : 'password'
            : isPassword && showPassword
              ? 'text'
              : type
        }
        inputMode={inputMode ?? def?.inputMode}
        placeholder={placeholder ?? def?.placeholder}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-busy={searching || undefined}
        className={controlInput}
        {...(isSecret
          ? {
              // "Trocar" sempre abre vazio: o valor salvo nunca chega a existir no DOM.
              defaultValue: '',
              onChange: (e: ChangeEvent<HTMLInputElement>) => {
                onChange?.(e.target.value)
                onValueChange?.(e.target.value, e.target.value)
              },
            }
          : maskKey
            ? { defaultValue: current }
            : {
                value: current,
                onChange: (e: ChangeEvent<HTMLInputElement>) => {
                  setInner(e.target.value)
                  onChange?.(e.target.value)
                  onValueChange?.(e.target.value, e.target.value)
                },
              })}
        {...props}
      />
      {searching && (
        <Spinner size="sm" label="Buscando…" className="shrink-0 text-muted-foreground" />
      )}
      {hasUnits && (
        // Mesmo padrão do seletor de DDI, à direita: rótulo visível e select nativo por cima.
        <span className="relative -mr-1 flex h-full shrink-0 items-center gap-1 border-l pl-2 text-sm font-medium">
          <span aria-hidden>{units?.find((u) => u.id === unit)?.label ?? unit}</span>
          <ChevronDown className="size-icon-sm text-muted-foreground" aria-hidden />
          <select
            aria-label={`Unidade: ${units?.find((u) => u.id === unit)?.label ?? unit}`}
            value={unit}
            disabled={disabled}
            onChange={(e) => changeUnit(e.target.value)}
            className="absolute inset-0 cursor-pointer bg-popover text-popover-foreground opacity-0 disabled:cursor-not-allowed"
          >
            {units?.map((u) => (
              <option key={u.id} value={u.id} className="bg-popover text-popover-foreground">
                {u.label}
              </option>
            ))}
          </select>
        </span>
      )}
      {!hasUnits && suffix && (
        <span className="shrink-0 text-sm text-muted-foreground">{suffix}</span>
      )}
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
      {(isPassword || isSecret) && (
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
      {isSecret && (
        <Button type="button" variant="ghost" size="sm" onClick={onCancelEdit} disabled={disabled}>
          Cancelar
        </Button>
      )}
    </div>
  )
})

import type { FactoryArg } from 'imask'

/** Máscaras disponíveis na prop mask do Input. Cada uma já define o teclado certo no mobile. */
export type MaskName =
  'cpf' | 'cnpj' | 'cpfCnpj' | 'phone' | 'cep' | 'date' | 'time' | 'currency' | 'percent'

type InputMode = 'numeric' | 'tel' | 'decimal'

const numberBlock = (scale: number, max?: number) => ({
  mask: Number,
  scale,
  thousandsSeparator: '.',
  radix: ',',
  mapToRadix: ['.'],
  padFractionalZeros: true,
  normalizeZeros: true,
  min: 0,
  ...(max !== undefined ? { max } : {}),
})

export const masks: Record<
  MaskName,
  { options: FactoryArg; inputMode: InputMode; placeholder: string }
> = {
  cpf: { options: { mask: '000.000.000-00' }, inputMode: 'numeric', placeholder: '000.000.000-00' },
  cnpj: {
    options: { mask: '00.000.000/0000-00' },
    inputMode: 'numeric',
    placeholder: '00.000.000/0000-00',
  },
  // CPF até 11 dígitos, CNPJ a partir do 12º: a máscara troca sozinha.
  cpfCnpj: {
    options: { mask: [{ mask: '000.000.000-00' }, { mask: '00.000.000/0000-00' }] },
    inputMode: 'numeric',
    placeholder: 'CPF ou CNPJ',
  },
  phone: {
    options: { mask: [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }] },
    inputMode: 'tel',
    placeholder: '(00) 00000-0000',
  },
  cep: { options: { mask: '00000-000' }, inputMode: 'numeric', placeholder: '00000-000' },
  date: { options: { mask: '00/00/0000' }, inputMode: 'numeric', placeholder: 'DD/MM/AAAA' },
  time: { options: { mask: '00:00' }, inputMode: 'numeric', placeholder: '00:00' },
  currency: {
    options: { mask: 'R$ num', lazy: false, blocks: { num: numberBlock(2) } } as FactoryArg,
    inputMode: 'decimal',
    placeholder: 'R$ 0,00',
  },
  percent: {
    options: { mask: 'num %', lazy: false, blocks: { num: numberBlock(2, 100) } } as FactoryArg,
    inputMode: 'decimal',
    placeholder: '0,00 %',
  },
}

/** Converte "R$ 1.250,00" ou "12,5 %" em número. */
export function parseLocaleNumber(masked: string): number | null {
  const clean = masked.replace(/[^\d,-]/g, '').replace(',', '.')
  if (!clean) return null
  const n = Number(clean)
  return Number.isFinite(n) ? n : null
}

/** Formata número como moeda brasileira: 1250 -> "R$ 1.250,00". */
export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

import { z } from 'zod'

/*
 * Validadores brasileiros e esquemas Zod prontos, com mensagens em português.
 * Use nos formulários com React Hook Form: resolver: zodResolver(schema).
 */

const digits = (v: string) => v.replace(/\D/g, '')

export function isValidCpf(value: string) {
  const cpf = digits(value)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  const calc = (len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10])
}

export function isValidCnpj(value: string) {
  const cnpj = digits(value)
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false
  const calc = (len: number) => {
    const weights =
      len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const sum = weights.reduce((acc, w, i) => acc + Number(cnpj[i]) * w, 0)
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }
  return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13])
}

export function isValidDateBR(value: string) {
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return false
  const [, d, mo, y] = m.map(Number) as [number, number, number, number]
  const date = new Date(y, mo - 1, d)
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d
}

export const zBR = {
  required: (label = 'Campo') => z.string().trim().min(1, `${label} é obrigatório.`),
  email: () => z.string().trim().min(1, 'E-mail é obrigatório.').email('E-mail inválido.'),
  cpf: () => z.string().refine(isValidCpf, 'CPF inválido.'),
  cnpj: () => z.string().refine(isValidCnpj, 'CNPJ inválido.'),
  cpfCnpj: () =>
    z
      .string()
      .refine(
        (v) => (digits(v).length <= 11 ? isValidCpf(v) : isValidCnpj(v)),
        'CPF ou CNPJ inválido.',
      ),
  phone: () =>
    z.string().refine((v) => [10, 11].includes(digits(v).length), 'Telefone incompleto.'),
  cep: () => z.string().refine((v) => digits(v).length === 8, 'CEP incompleto.'),
  dateBR: () => z.string().refine(isValidDateBR, 'Data inválida.'),
}

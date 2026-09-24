import { useEffect, useRef, useState } from 'react'
import { lookupCep, lookupCnpj, type Address, type Company } from '@/lib/lookup'

/** Resultado da busca embutida no Input (CEP e CNPJ). */
export type LookupResult =
  | { status: 'loading'; kind: 'cep' | 'cnpj' }
  | { status: 'found'; kind: 'cep'; data: Address; message: string }
  | { status: 'found'; kind: 'cnpj'; data: Company; message: string }
  | { status: 'not-found'; kind: 'cep' | 'cnpj'; message: string }
  | { status: 'error'; kind: 'cep' | 'cnpj'; message: string }

/**
 * Busca CEP (8 dígitos) ou CNPJ (14 dígitos) assim que o valor fica completo. Cancela a
 * busca anterior quando o valor muda. `kind` 'auto' decide pelo tamanho (CPF ou CNPJ: só
 * o CNPJ busca). Sem `onResult`, não faz nada.
 */
export function useLookup(
  kind: 'cep' | 'cnpj' | 'auto' | undefined,
  value: string,
  onResult: ((r: LookupResult) => void) | undefined,
) {
  const [loading, setLoading] = useState(false)
  const cb = useRef(onResult)
  cb.current = onResult
  const digits = value.replace(/\D/g, '')
  const target =
    kind === 'cep' && digits.length === 8
      ? 'cep'
      : (kind === 'cnpj' || kind === 'auto') && digits.length === 14
        ? 'cnpj'
        : null
  const enabled = Boolean(onResult) && target !== null

  useEffect(() => {
    if (!enabled || !target) return
    const ctrl = new AbortController()
    const send = (r: LookupResult) => {
      if (!ctrl.signal.aborted) cb.current?.(r)
    }
    setLoading(true)
    send({ status: 'loading', kind: target })
    const run =
      target === 'cep'
        ? lookupCep(digits, ctrl.signal).then((data) =>
            data
              ? send({
                  status: 'found',
                  kind: 'cep',
                  data,
                  message: 'Endereço preenchido pelo CEP.',
                })
              : send({
                  status: 'not-found',
                  kind: 'cep',
                  message: 'CEP não encontrado. Preencha o endereço.',
                }),
          )
        : lookupCnpj(digits, ctrl.signal).then((data) =>
            data
              ? send({
                  status: 'found',
                  kind: 'cnpj',
                  data,
                  message: `${data.situacao ? `Situação: ${data.situacao}. ` : ''}Dados preenchidos pelo CNPJ.`,
                })
              : send({
                  status: 'not-found',
                  kind: 'cnpj',
                  message: 'CNPJ não encontrado. Preencha os dados abaixo.',
                }),
          )
    run
      .catch((e: unknown) =>
        send({
          status: 'error',
          kind: target,
          message: e instanceof Error ? e.message : 'Não foi possível buscar agora.',
        }),
      )
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false)
      })
    return () => {
      ctrl.abort()
      setLoading(false)
    }
  }, [enabled, target, digits])

  return loading
}

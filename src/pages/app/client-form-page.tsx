import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Loader2, Mail, Rocket, Star, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { Container, PageHeader, Stack } from '@/components/layout'
import { ActionBar } from '@/components/ui/action-bar'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Form, FormField, FormSection } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup } from '@/components/ui/radio-group'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toast'
import { Upload } from '@/components/ui/upload'
import { lookupCep, lookupCnpj } from '@/lib/lookup'
import { zBR } from '@/lib/validators'
import { fakeUpload } from '@/pages/showcase/demo'

const ufs = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
]
const segments = ['Varejo', 'Saúde', 'Serviços', 'Educação', 'Indústria', 'Alimentação']

const schema = z.object({
  nome: zBR.required('Nome'),
  documento: zBR.cpfCnpj(),
  email: zBR.email(),
  telefone: zBR.phone(),
  nascimento: z.date().nullable().optional(),
  segmento: z.string({ error: 'Escolha um segmento.' }).min(1, 'Escolha um segmento.'),
  cep: zBR.cep(),
  logradouro: zBR.required('Logradouro'),
  numero: zBR.required('Número'),
  complemento: z.string().optional(),
  bairro: zBR.required('Bairro'),
  cidade: zBR.required('Cidade'),
  uf: z.string({ error: 'Escolha a UF.' }).min(2, 'Escolha a UF.'),
  plano: z.string({ error: 'Escolha um plano.' }),
  valor: z.string().refine((v) => /[1-9]/.test(v), 'Informe o valor mensal.'),
  inicio: z.date({ error: 'Informe a data de início.' }),
  vencimento: z.string().optional(),
  boasVindas: z.boolean(),
  observacoes: z.string().max(300, 'Máximo de 300 caracteres.').optional(),
  aceite: z.literal(true, { error: 'Confirme que os dados foram conferidos.' }),
})
type Values = z.infer<typeof schema>

const plans = [
  { value: 'essencial', label: 'Essencial', description: 'Para começar.', icon: <Star /> },
  { value: 'pro', label: 'Profissional', description: 'O mais escolhido.', icon: <Rocket /> },
  { value: 'empresa', label: 'Empresa', description: 'Várias unidades.', icon: <Building2 /> },
]

const Spinner = () => <Loader2 className="size-icon-sm animate-spin" aria-label="Buscando" />

/**
 * Busca o CNPJ e o CEP assim que estão completos e preenche o que vem abaixo deles.
 * CNPJ: nome, e-mail e telefone (só se vazios) e o endereço. CEP: o endereço.
 */
function useLookups(form: UseFormReturn<Values>) {
  const [searching, setSearching] = useState({ doc: false, cep: false })
  const [docStatus, setDocStatus] = useState<string>('CNPJ preenche os dados da empresa.')
  const [cepStatus, setCepStatus] = useState<string>('Preenche o endereço.')
  const doc = form.watch('documento')
  const cep = form.watch('cep')
  const fill = (k: keyof Values, v: string, onlyIfEmpty = false) => {
    if (!v || (onlyIfEmpty && form.getValues(k))) return
    form.setValue(k, v as never, { shouldValidate: true, shouldDirty: true })
  }

  useEffect(() => {
    if (doc.replace(/\D/g, '').length !== 14) return
    const ctrl = new AbortController()
    setSearching((x) => ({ ...x, doc: true }))
    lookupCnpj(doc, ctrl.signal)
      .then((c) => {
        if (!c) return setDocStatus('CNPJ não encontrado. Preencha os dados abaixo.')
        fill('nome', c.razaoSocial, true)
        fill('email', c.email, true)
        fill('telefone', c.telefone, true)
        fill('cep', c.endereco.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2'))
        fill('logradouro', c.endereco.logradouro)
        fill('numero', c.endereco.numero)
        fill('complemento', c.endereco.complemento)
        fill('bairro', c.endereco.bairro)
        fill('cidade', c.endereco.cidade)
        fill('uf', c.endereco.uf)
        setDocStatus(`${c.situacao ? `Situação: ${c.situacao}. ` : ''}Dados preenchidos pelo CNPJ.`)
      })
      .catch((e: unknown) => {
        if (!ctrl.signal.aborted) setDocStatus(e instanceof Error ? e.message : 'Falha na busca.')
      })
      .finally(() => setSearching((x) => ({ ...x, doc: false })))
    return () => ctrl.abort()
    // fill só usa o form, que é estável.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc])

  useEffect(() => {
    if (cep.replace(/\D/g, '').length !== 8) return
    const ctrl = new AbortController()
    setSearching((x) => ({ ...x, cep: true }))
    lookupCep(cep, ctrl.signal)
      .then((a) => {
        if (!a) return setCepStatus('CEP não encontrado. Preencha o endereço.')
        fill('logradouro', a.logradouro)
        fill('bairro', a.bairro)
        fill('cidade', a.cidade)
        fill('uf', a.uf)
        if (a.complemento) fill('complemento', a.complemento, true)
        setCepStatus('Endereço preenchido pelo CEP. Falta o número.')
      })
      .catch((e: unknown) => {
        if (!ctrl.signal.aborted) setCepStatus(e instanceof Error ? e.message : 'Falha na busca.')
      })
      .finally(() => setSearching((x) => ({ ...x, cep: false })))
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cep])

  return { searching, docStatus, cepStatus }
}

/**
 * Formulário longo em página: seções com título, grade de 3 campos por linha no desktop e 1
 * no mobile, CNPJ e CEP primeiro (as buscas preenchem o que vem abaixo) e rodapé fixo.
 */
export function ClientFormPage() {
  const navigate = useNavigate()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      nome: '',
      documento: '',
      email: '',
      telefone: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      valor: '',
      boasVindas: true,
      observacoes: '',
    },
  })
  const { isSubmitting } = form.formState
  const { searching, docStatus, cepStatus } = useLookups(form)

  const submit = async (v: Values) => {
    await new Promise((r) => window.setTimeout(r, 1200))
    toast.success('Cliente cadastrado', { description: `${v.nome} já aparece na listagem.` })
    navigate('/clientes')
  }

  return (
    <Container padded>
      <Stack gap="section">
        <PageHeader
          title="Novo cliente"
          help={
            <>
              <p>Campos com * são obrigatórios.</p>
              <p>
                Comece pelo documento: com CNPJ, os dados da empresa são preenchidos; com CEP, o
                endereço.
              </p>
            </>
          }
        />
        <Form id="form-cliente" form={form} onSubmit={submit}>
          <FormSection
            title="Dados principais"
            help="Comece pelo documento: com CNPJ, os dados da empresa são preenchidos."
          >
            <FormField<Values>
              name="documento"
              label="CPF ou CNPJ"
              required
              span="sm"
              help={docStatus}
              render={(f) => (
                <Input {...f} mask="cpfCnpj" suffix={searching.doc ? <Spinner /> : undefined} />
              )}
            />
            <FormField<Values>
              name="nome"
              label="Nome ou razão social"
              required
              span="xl"
              newRow
              render={(f) => <Input {...f} icon={<User />} autoComplete="name" />}
            />
            <FormField<Values>
              name="segmento"
              label="Segmento"
              required
              render={(f) => (
                <Select
                  {...f}
                  label="Segmento"
                  options={segments.map((s) => ({ value: s, label: s }))}
                />
              )}
            />
            <FormField<Values>
              name="email"
              label="E-mail"
              required
              render={(f) => (
                <Input {...f} type="email" inputMode="email" icon={<Mail />} autoComplete="email" />
              )}
            />
            <FormField<Values>
              name="telefone"
              label="Telefone"
              required
              render={(f) => <Input {...f} mask="phone" autoComplete="tel" />}
            />
            <FormField<Values>
              name="nascimento"
              label="Nascimento ou fundação"
              render={(f) => <DatePicker {...f} label="Data" maxDate={new Date()} clearable />}
            />
          </FormSection>

          <FormSection
            title="Endereço"
            help="Comece pelo CEP: rua, bairro, cidade e UF são preenchidos."
          >
            <FormField<Values>
              name="cep"
              label="CEP"
              required
              span="sm"
              help={cepStatus}
              render={(f) => (
                <Input
                  {...f}
                  mask="cep"
                  autoComplete="postal-code"
                  suffix={searching.cep ? <Spinner /> : undefined}
                />
              )}
            />
            <FormField<Values>
              name="logradouro"
              label="Logradouro"
              required
              span="lg"
              newRow
              render={(f) => <Input {...f} autoComplete="address-line1" />}
            />
            <FormField<Values>
              name="numero"
              label="Número"
              required
              span="xs"
              render={(f) => <Input {...f} inputMode="numeric" />}
            />
            <FormField<Values>
              name="complemento"
              label="Complemento"
              render={(f) => <Input {...f} autoComplete="address-line2" />}
            />
            <FormField<Values>
              name="bairro"
              label="Bairro"
              required
              render={(f) => <Input {...f} />}
            />
            <FormField<Values>
              name="cidade"
              label="Cidade"
              required
              span="lg"
              render={(f) => <Input {...f} autoComplete="address-level2" />}
            />
            <FormField<Values>
              name="uf"
              label="UF"
              required
              span="xs"
              render={(f) => (
                <Select
                  {...f}
                  label="UF"
                  searchable
                  options={ufs.map((u) => ({ value: u, label: u }))}
                />
              )}
            />
          </FormSection>

          <FormSection title="Contrato" description="Plano, valor e início.">
            <FormField<Values>
              name="plano"
              label="Plano"
              required
              span="full"
              render={(f) => <RadioGroup {...f} variant="cards" columns={3} options={plans} />}
            />
            <FormField<Values>
              name="valor"
              label="Valor mensal"
              required
              render={(f) => <Input {...f} mask="currency" />}
            />
            <FormField<Values>
              name="inicio"
              label="Início"
              required
              render={(f) => <DatePicker {...f} label="Início" minDate={new Date()} />}
            />
            <FormField<Values>
              name="vencimento"
              label="Dia de vencimento"
              render={(f) => (
                <Select
                  {...f}
                  label="Dia de vencimento"
                  options={['5', '10', '15', '20', '25'].map((d) => ({
                    value: d,
                    label: `Dia ${d}`,
                  }))}
                />
              )}
            />
            <FormField<Values>
              name="boasVindas"
              span="full"
              render={(f) => (
                <Switch
                  checked={f.value === true}
                  onCheckedChange={f.onChange}
                  label="Enviar boas-vindas por e-mail"
                  description="Com o link de acesso ao portal do cliente."
                />
              )}
            />
          </FormSection>

          <FormSection title="Documentos e observações" columns={1}>
            <FormField<Values>
              name="observacoes"
              label="Observações"
              help="Aparece no histórico."
              render={(f) => <Textarea {...f} counter maxLength={300} />}
            />
            <div className="flex flex-col gap-2 pb-4">
              <span className="text-sm font-medium">Documentos</span>
              <Upload accept="image/*,.pdf" maxSizeMb={10} onUpload={fakeUpload} />
            </div>
            <FormField<Values>
              name="aceite"
              render={(f) => (
                <Checkbox
                  checked={f.value === true}
                  onCheckedChange={f.onChange}
                  invalid={f.invalid}
                  label="Conferi os dados com o cliente"
                />
              )}
            />
          </FormSection>

          <ActionBar
            sticky
            cancel={{ label: 'Cancelar', onClick: () => navigate('/clientes') }}
            primary={{
              label: 'Cadastrar cliente',
              type: 'submit',
              form: 'form-cliente',
              loading: isSubmitting,
              loadingLabel: 'Cadastrando...',
            }}
            secondary={[{ label: 'Salvar rascunho', onClick: () => toast.info('Rascunho salvo') }]}
          />
        </Form>
      </Stack>
    </Container>
  )
}

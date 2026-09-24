import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Mail, Rocket, Star, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
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

/**
 * Formulário longo em página: seções com título, grid de 2 colunas no desktop e 1 no mobile,
 * rótulo acima, erro abaixo em espaço reservado e rodapé fixo com as ações.
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

  const submit = async (v: Values) => {
    await new Promise((r) => window.setTimeout(r, 1200))
    toast.success('Cliente cadastrado', { description: `${v.nome} já aparece na listagem.` })
    navigate('/clientes')
  }

  return (
    <Container padded>
      <Stack gap="section">
        <PageHeader title="Novo cliente" description="Campos com * são obrigatórios." />
        <Form form={form} onSubmit={submit}>
          <FormSection title="Dados principais" description="Quem é o cliente.">
            <FormField<Values>
              name="nome"
              label="Nome ou razão social"
              required
              span="full"
              render={(f) => <Input {...f} icon={<User />} autoComplete="name" />}
            />
            <FormField<Values>
              name="documento"
              label="CPF ou CNPJ"
              required
              render={(f) => <Input {...f} mask="cpfCnpj" />}
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
              label="Data de nascimento ou fundação"
              render={(f) => <DatePicker {...f} label="Data" maxDate={new Date()} clearable />}
            />
          </FormSection>

          <FormSection title="Endereço" description="Onde o cliente é atendido.">
            <FormField<Values>
              name="cep"
              label="CEP"
              required
              render={(f) => <Input {...f} mask="cep" autoComplete="postal-code" />}
            />
            <FormField<Values>
              name="logradouro"
              label="Logradouro"
              required
              render={(f) => <Input {...f} autoComplete="address-line1" />}
            />
            <FormField<Values>
              name="numero"
              label="Número"
              required
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
              render={(f) => <Input {...f} autoComplete="address-level2" />}
            />
            <FormField<Values>
              name="uf"
              label="UF"
              required
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
              name="boasVindas"
              compact
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

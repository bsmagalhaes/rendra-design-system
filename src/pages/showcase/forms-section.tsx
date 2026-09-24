import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, CreditCard, Lock, Mail, Rocket, Search, Star, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Grid, Stack } from '@/components/layout'
import { ActionBar } from '@/components/ui/action-bar'
import { Checkbox, CheckboxGroup } from '@/components/ui/checkbox'
import { DatePicker, type DateRange } from '@/components/ui/date-picker'
import { Field } from '@/components/ui/field'
import { Form, FormField, FormSection } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup } from '@/components/ui/radio-group'
import { Select, type SelectOption } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toast'
import { Upload } from '@/components/ui/upload'
import { formatCurrency } from '@/lib/masks'
import { zBR } from '@/lib/validators'
import { Demo, fakeUpload, GroupTitle, wait } from './demo'

const cities: SelectOption[] = [
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Curitiba',
  'Porto Alegre',
  'Salvador',
  'Recife',
  'Fortaleza',
  'Goiânia',
  'Florianópolis',
  'Manaus',
  'Belém',
].map((c) => ({ value: c.toLowerCase(), label: c, group: 'Capitais' }))

const segments: SelectOption[] = [
  { value: 'varejo', label: 'Varejo', description: 'Lojas e comércio' },
  { value: 'saude', label: 'Saúde', description: 'Clínicas e consultórios' },
  { value: 'servicos', label: 'Serviços', description: 'Prestadores em geral' },
  { value: 'educacao', label: 'Educação', description: 'Escolas e cursos' },
  { value: 'industria', label: 'Indústria', description: 'Produção e fábricas', disabled: true },
]

const loadCities = async (q: string) => {
  await wait(600)
  return cities.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()))
}

const schema = z.object({
  nome: zBR.required('Nome'),
  email: zBR.email(),
  documento: zBR.cpfCnpj(),
  telefone: zBR.phone(),
  cep: zBR.cep(),
  segmento: z.string({ error: 'Escolha um segmento.' }).min(1, 'Escolha um segmento.'),
  inicio: z.date({ error: 'Informe a data de início.' }),
  valor: z.string().refine((v) => /\d/.test(v) && !/^R\$ 0,00$/.test(v), 'Informe o valor mensal.'),
  plano: z.string({ error: 'Escolha um plano.' }),
  observacoes: z.string().max(200, 'Máximo de 200 caracteres.').optional(),
  aceite: z.literal(true, { error: 'É preciso aceitar os termos.' }),
})
type FormValues = z.infer<typeof schema>

function ValidatedForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      nome: '',
      email: '',
      documento: '',
      telefone: '',
      cep: '',
      valor: '',
      observacoes: '',
    },
  })
  const { isSubmitting } = form.formState
  const submit = async (v: FormValues) => {
    await wait(1200)
    toast.success('Cliente cadastrado', { description: `${v.nome} já aparece na listagem.` })
    form.reset()
  }
  return (
    <Form form={form} onSubmit={submit}>
      <FormSection title="Dados principais" description="Campos com * são obrigatórios.">
        <FormField<FormValues>
          name="nome"
          label="Nome ou razão social"
          required
          render={(f) => <Input {...f} icon={<User />} clearable />}
        />
        <FormField<FormValues>
          name="email"
          label="E-mail"
          required
          render={(f) => (
            <Input {...f} type="email" icon={<Mail />} inputMode="email" autoComplete="email" />
          )}
        />
        <FormField<FormValues>
          name="documento"
          label="CPF ou CNPJ"
          required
          help="A máscara troca sozinha ao digitar o CNPJ."
          render={(f) => <Input {...f} mask="cpfCnpj" />}
        />
        <FormField<FormValues>
          name="telefone"
          label="Telefone"
          required
          render={(f) => <Input {...f} mask="phone" />}
        />
        <FormField<FormValues>
          name="cep"
          label="CEP"
          required
          render={(f) => <Input {...f} mask="cep" />}
        />
        <FormField<FormValues>
          name="segmento"
          label="Segmento"
          required
          render={(f) => <Select {...f} options={segments} label="Segmento" />}
        />
        <FormField<FormValues>
          name="inicio"
          label="Início do contrato"
          required
          render={(f) => <DatePicker {...f} label="Início do contrato" />}
        />
        <FormField<FormValues>
          name="valor"
          label="Valor mensal"
          required
          render={(f) => <Input {...f} mask="currency" />}
        />
      </FormSection>
      <FormSection title="Plano e observações" columns={1}>
        <FormField<FormValues>
          name="plano"
          label="Plano"
          required
          render={(f) => (
            <RadioGroup
              {...f}
              variant="cards"
              columns={3}
              options={[
                {
                  value: 'essencial',
                  label: 'Essencial',
                  description: 'Para começar.',
                  icon: <Star />,
                },
                {
                  value: 'pro',
                  label: 'Profissional',
                  description: 'O mais escolhido.',
                  icon: <Rocket />,
                },
                {
                  value: 'empresa',
                  label: 'Empresa',
                  description: 'Várias unidades.',
                  icon: <Building2 />,
                },
              ]}
            />
          )}
        />
        <FormField<FormValues>
          name="observacoes"
          label="Observações"
          help="Aparece no histórico do cliente."
          render={(f) => <Textarea {...f} counter maxLength={200} />}
        />
        <FormField<FormValues>
          name="aceite"
          label=""
          render={(f) => (
            <Checkbox
              checked={f.value === true}
              onCheckedChange={f.onChange}
              invalid={f.invalid}
              label="Li e aceito os termos de uso"
            />
          )}
        />
      </FormSection>
      <ActionBar
        cancel={{ label: 'Limpar', onClick: () => form.reset() }}
        primary={{
          label: 'Cadastrar cliente',
          type: 'submit',
          loading: isSubmitting,
          loadingLabel: 'Cadastrando...',
        }}
      />
    </Form>
  )
}

export function FormsSection() {
  const [single, setSingle] = useState<string | null>(null)
  const [multi, setMulti] = useState<string[]>(['saude'])
  const [created, setCreated] = useState<string[]>([])
  const [asyncCity, setAsyncCity] = useState<string | null>(null)
  const [date, setDate] = useState<Date | null>(null)
  const [range, setRange] = useState<DateRange | null>(null)
  const [dateTime, setDateTime] = useState<Date | null>(null)
  const [price, setPrice] = useState([40])
  const [band, setBand] = useState([1200, 6400])
  const [checks, setChecks] = useState<string[]>(['email'])
  const [radio, setRadio] = useState('mensal')

  return (
    <>
      <GroupTitle
        id="grupo-formulario"
        title="Formulário"
        description="Rótulo acima, obrigatório marcado, erro abaixo em espaço reservado. Inputs com 16px no mobile para o iOS não dar zoom."
      />

      <Demo
        id="input"
        title="Input"
        description="Um único Input. Máscara, ícone, limpar e senha são props; a máscara já abre o teclado certo no celular (numérico, telefone, decimal)."
        props="mask (cpf, cnpj, cpfCnpj, phone, cep, date, time, currency, percent), ddi, onDdiChange, ddiOptions, hideDdi, icon, suffix, clearable, type=password, size, invalid, disabled"
      >
        <Grid cols={{ base: 1, md: 2, xl: 3 }} gap="fields">
          <Field label="CPF">
            <Input mask="cpf" />
          </Field>
          <Field label="CNPJ">
            <Input mask="cnpj" />
          </Field>
          <Field label="CPF ou CNPJ" help="Troca a máscara sozinho.">
            <Input mask="cpfCnpj" />
          </Field>
          <Field label="Telefone" help="DDI embutido, +55 por padrão.">
            <Input mask="phone" />
          </Field>
          <Field label="Telefone em Portugal" help='ddi="351": máscara internacional.'>
            <Input mask="phone" ddi="351" />
          </Field>
          <Field label="CEP">
            <Input mask="cep" />
          </Field>
          <Field label="Data">
            <Input mask="date" />
          </Field>
          <Field label="Hora">
            <Input mask="time" />
          </Field>
          <Field label="Moeda">
            <Input mask="currency" />
          </Field>
          <Field label="Percentual">
            <Input mask="percent" />
          </Field>
          <Field label="Com ícone e limpar">
            <Input icon={<Search />} clearable defaultValue="Rendra" />
          </Field>
          <Field label="Senha" help="Toque no olho para mostrar.">
            <Input type="password" icon={<Lock />} defaultValue="senha-secreta" />
          </Field>
          <Field label="Com sufixo">
            <Input suffix="dias" inputMode="numeric" defaultValue="30" />
          </Field>
          <Field label="Com erro" required error="Informe um e-mail válido.">
            <Input defaultValue="ana@" />
          </Field>
          <Field label="Desabilitado">
            <Input disabled defaultValue="Não editável" />
          </Field>
          <Stack gap="2">
            <span className="text-sm font-medium">Tamanhos</span>
            <Input size="sm" placeholder="Pequeno" />
            <Input size="md" placeholder="Médio" />
            <Input size="lg" placeholder="Grande" />
          </Stack>
        </Grid>
      </Demo>

      <Demo
        id="textarea"
        title="Textarea"
        description="Com contador opcional. Cresce com o texto até uma altura máxima."
        props="counter, maxLength, rows, invalid"
      >
        <Grid cols={{ base: 1, md: 2 }} gap="fields">
          <Field label="Observações" help="Até 200 caracteres.">
            <Textarea counter maxLength={200} placeholder="Escreva aqui..." />
          </Field>
          <Field label="Com erro" error="O texto passou do limite.">
            <Textarea counter maxLength={20} defaultValue="Este texto é longo demais." />
          </Field>
        </Grid>
      </Demo>

      <Demo
        id="editor"
        title="RichTextEditor"
        description="Texto rico com títulos, negrito, listas, alinhamento, links, tabela, imagem e modo HTML. Cole um print (Ctrl+V) ou arraste uma imagem; toque nela para redimensionar pelos 4 cantos."
        props="value (HTML), onChange, placeholder, onImageUpload, minHeight, invalid, disabled"
      >
        <Field
          label="Descrição do contrato"
          help="Aceita HTML: use o botão de código para colar ou editar."
        >
          <RichTextEditor defaultValue="<h2>Proposta comercial</h2><p>Plano <strong>Empresa</strong> com <em>suporte dedicado</em>.</p><ul><li>Implantação em 15 dias</li><li>Treinamento da equipe</li></ul><table><tbody><tr><th>Item</th><th>Valor</th></tr><tr><td>Mensalidade</td><td>R$ 1.250,00</td></tr></tbody></table>" />
        </Field>
      </Demo>

      <Demo
        id="select"
        title="Select"
        description="Um único Select. No celular abre como painel inferior, com busca no topo e confirmação no rodapé."
        props="options, multiple, searchable, selectAll, showCount, maxChips, creatable, onCreate, loadOptions (async), loading, clearable, size, invalid, disabled"
      >
        <Grid cols={{ base: 1, md: 2, xl: 3 }} gap="fields">
          <Field label="Simples">
            <Select
              label="Segmento"
              options={segments}
              value={single}
              onChange={setSingle}
              clearable
            />
          </Field>
          <Field label="Com busca">
            <Select label="Cidade" options={cities} searchable placeholder="Escolha a cidade" />
          </Field>
          <Field label="Múltiplo com chips e selecionar todos">
            <Select
              multiple
              selectAll
              label="Segmentos"
              options={segments}
              value={multi}
              onChange={setMulti}
            />
          </Field>
          <Field label="Múltiplo com contador">
            <Select multiple showCount selectAll label="Cidades" options={cities} searchable />
          </Field>
          <Field label="Criar opção" help="Digite um nome que não existe.">
            <Select
              multiple
              creatable
              label="Etiquetas"
              options={created.map((c) => ({ value: c, label: c }))}
              value={created}
              onChange={setCreated}
              placeholder="Adicionar etiquetas"
            />
          </Field>
          <Field label="Busca remota (async)">
            <Select
              label="Cidade"
              loadOptions={loadCities}
              value={asyncCity}
              onChange={setAsyncCity}
              placeholder="Buscar no servidor"
            />
          </Field>
          <Field label="Carregando">
            <Select label="Segmento" options={[]} loading placeholder="Carregando..." />
          </Field>
          <Field label="Com erro" error="Escolha um segmento.">
            <Select label="Segmento" options={segments} />
          </Field>
          <Field label="Desabilitado">
            <Select label="Segmento" options={segments} disabled />
          </Field>
        </Grid>
      </Demo>

      <Demo
        id="checkbox-radio"
        title="Checkbox, Radio e Switch"
        description="Checkbox com estado indeterminado e grupo com selecionar todos. Radio em lista ou em cards. Switch com rótulo e descrição."
        props="Checkbox (checked | 'indeterminate', label, description) · CheckboxGroup (options, selectAll) · RadioGroup (variant list | cards, columns) · Switch (label, description)"
      >
        <Grid cols={{ base: 1, md: 2 }} gap="8">
          <Stack gap="2">
            <span className="text-sm font-medium">Checkbox em grupo</span>
            <CheckboxGroup
              selectAll
              label="Canais de aviso"
              value={checks}
              onChange={setChecks}
              options={[
                { value: 'email', label: 'E-mail', description: 'Resumo diário.' },
                { value: 'sms', label: 'SMS', description: 'Só alertas urgentes.' },
                { value: 'whats', label: 'WhatsApp' },
                { value: 'push', label: 'Notificação no app', disabled: true },
              ]}
            />
          </Stack>
          <Stack gap="2">
            <span className="text-sm font-medium">Radio em lista</span>
            <RadioGroup
              aria-label="Cobrança"
              value={radio}
              onChange={setRadio}
              options={[
                { value: 'mensal', label: 'Mensal', description: 'Cobrança todo dia 10.' },
                { value: 'anual', label: 'Anual', description: 'Dois meses de desconto.' },
                { value: 'avulso', label: 'Avulso', disabled: true },
              ]}
            />
          </Stack>
          <Stack gap="2" className="md:col-span-2">
            <span className="text-sm font-medium">Radio em cards</span>
            <RadioGroup
              aria-label="Forma de pagamento"
              variant="cards"
              columns={3}
              defaultValue="cartao"
              options={[
                {
                  value: 'cartao',
                  label: 'Cartão',
                  description: 'Crédito em até 12x.',
                  icon: <CreditCard />,
                },
                { value: 'pix', label: 'Pix', description: 'Aprovação na hora.', icon: <Rocket /> },
                {
                  value: 'boleto',
                  label: 'Boleto',
                  description: 'Compensa em 2 dias.',
                  icon: <Building2 />,
                },
              ]}
            />
          </Stack>
          <Stack gap="0" className="md:col-span-2 md:max-w-xl">
            <Switch
              label="Notificações por e-mail"
              description="Receba um resumo das pendências toda manhã."
              defaultChecked
            />
            <Switch label="Modo compacto" description="Mostra mais linhas nas tabelas." />
            <Switch
              label="Integração desativada"
              description="Disponível no plano Empresa."
              disabled
            />
          </Stack>
        </Grid>
      </Demo>

      <Demo
        id="datepicker"
        title="DatePicker"
        description="Calendário em português. Período mostra dois meses no desktop e um no celular. No celular abre como painel inferior."
        props="range, time, minDate, maxDate, clearable, size, invalid, disabled"
      >
        <Grid cols={{ base: 1, md: 2, xl: 3 }} gap="fields">
          <Field label="Data">
            <DatePicker label="Data" value={date} onChange={setDate} clearable />
          </Field>
          <Field label="Período">
            <DatePicker range label="Período" value={range} onChange={setRange} clearable />
          </Field>
          <Field label="Data e hora">
            <DatePicker time label="Data e hora" value={dateTime} onChange={setDateTime} />
          </Field>
          <Field label="A partir de hoje" help="Datas passadas bloqueadas.">
            <DatePicker label="Agendamento" minDate={new Date()} />
          </Field>
          <Field label="Com erro" error="Informe a data.">
            <DatePicker label="Data" />
          </Field>
          <Field label="Desabilitado">
            <DatePicker label="Data" disabled />
          </Field>
        </Grid>
      </Demo>

      <Demo
        id="slider"
        title="Slider"
        description="Valor único ou faixa. A alça tem área de toque de 44px no celular."
        props="value (1 ou 2 números), min, max, step, showValue, formatValue"
      >
        <Grid cols={{ base: 1, md: 2 }} gap="8">
          <Field label="Desconto">
            <Slider
              value={price}
              onChange={setPrice}
              showValue
              formatValue={(n) => `${n}%`}
              aria-label="Desconto"
            />
          </Field>
          <Field label="Faixa de faturamento">
            <Slider
              value={band}
              onChange={setBand}
              min={0}
              max={10000}
              step={100}
              showValue
              formatValue={formatCurrency}
            />
          </Field>
        </Grid>
      </Demo>

      <Demo
        id="upload"
        title="Upload"
        description="Arrastar e soltar no desktop, tocar para escolher no celular. Lista com progresso, erro por arquivo e tentar de novo. Dica: um arquivo com 'erro' no nome simula falha."
        props="accept, multiple, maxSizeMb, onUpload(file, onProgress), onChange, hint"
      >
        <Field label="Documentos" help="PDF ou imagem, até 5 MB cada.">
          <Upload accept="image/*,.pdf" maxSizeMb={5} onUpload={fakeUpload} />
        </Field>
      </Demo>

      <Demo
        id="formulario-validado"
        title="Formulário com validação"
        description="React Hook Form + Zod: validação ao sair do campo, mensagens em português, CPF/CNPJ verificado de verdade, foco no primeiro erro ao enviar e botão com carregamento."
        bare
      >
        <ValidatedForm />
      </Demo>
    </>
  )
}

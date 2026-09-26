import type { Meta, StoryObj } from '@storybook/react-vite'
import { Lock, Mail, Search } from 'lucide-react'
import { useState } from 'react'
import { Checkbox, CheckboxGroup } from '@/components/ui/checkbox'
import { DatePicker, type DateRange } from '@/components/ui/date-picker'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { OtpInput } from '@/components/ui/otp-input'
import { RadioGroup } from '@/components/ui/radio-group'
import { Select, type SelectOption } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Upload } from '@/components/ui/upload'
import { fakeUpload, wait } from '@/pages/showcase/demo'

/* ------------------------------------------------ Input */

const meta = {
  title: 'Formulário/Campos',
  component: Input,
  args: {
    placeholder: 'Digite aqui',
    size: 'md',
    clearable: false,
    disabled: false,
    invalid: false,
  },
  argTypes: {
    mask: {
      control: 'select',
      options: [
        undefined,
        'cpf',
        'cnpj',
        'cpfCnpj',
        'phone',
        'cep',
        'date',
        'time',
        'currency',
        'percent',
      ],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    type: { control: 'select', options: ['text', 'email', 'password', 'search'] },
  },
  render: (args) => (
    <Field
      label="Campo"
      help="Texto de ajuda sempre visível."
      error={args.invalid ? 'Mensagem de erro.' : undefined}
    >
      <Input {...args} />
    </Field>
  ),
} satisfies Meta<typeof Input>
export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {}
export const CPF: Story = { args: { mask: 'cpf' } }
export const CNPJ: Story = { args: { mask: 'cnpj' } }
export const CPFouCNPJ: Story = { name: 'CPF ou CNPJ', args: { mask: 'cpfCnpj' } }
export const Telefone: Story = { args: { mask: 'phone' } }
export const CEP: Story = { args: { mask: 'cep' } }
export const Data: Story = { args: { mask: 'date' } }
export const Hora: Story = { args: { mask: 'time' } }
export const Moeda: Story = { args: { mask: 'currency' } }
export const Percentual: Story = { args: { mask: 'percent' } }
export const ComIconeELimpar: Story = {
  args: { icon: <Search />, clearable: true, defaultValue: 'Rendra' },
}
export const Senha: Story = {
  args: { type: 'password', icon: <Lock />, defaultValue: 'senha-secreta' },
}
export const ComErro: Story = { args: { invalid: true, icon: <Mail />, defaultValue: 'ana@' } }
export const Desabilitado: Story = { args: { disabled: true, defaultValue: 'Não editável' } }

/* ------------------------------------------------ Textarea, OTP */

export const TextareaComContador: Story = {
  name: 'Textarea com contador',
  render: () => (
    <Field label="Observações">
      <Textarea counter maxLength={200} placeholder="Escreva aqui..." />
    </Field>
  ),
}

function OtpDemo() {
  const [v, setV] = useState('')
  return (
    <Field label="Código de verificação" help="Aceita colar o código inteiro.">
      <OtpInput value={v} onChange={setV} />
    </Field>
  )
}
export const CodigoOTP: Story = { name: 'OtpInput (2FA)', render: () => <OtpDemo /> }

/* ------------------------------------------------ Select */

const options: SelectOption[] = [
  'Varejo',
  'Saúde',
  'Serviços',
  'Educação',
  'Indústria',
  'Alimentação',
].map((s) => ({ value: s, label: s, description: `Segmento ${s.toLowerCase()}` }))

function SelectDemo(props: {
  multiple?: boolean
  searchable?: boolean
  creatable?: boolean
  async?: boolean
  loading?: boolean
}) {
  const [single, setSingle] = useState<string | null>(null)
  const [multi, setMulti] = useState<string[]>([])
  const common = {
    label: 'Segmento',
    searchable: props.searchable,
    creatable: props.creatable,
    loading: props.loading,
    clearable: true,
  }
  const load = props.async
    ? async (q: string) => {
        await wait(500)
        return options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))
      }
    : undefined
  return (
    <Field label="Segmento">
      {props.multiple ? (
        <Select
          {...common}
          multiple
          selectAll
          options={options}
          value={multi}
          onChange={setMulti}
          loadOptions={load}
        />
      ) : (
        <Select
          {...common}
          options={props.loading ? [] : options}
          value={single}
          onChange={setSingle}
          loadOptions={load}
        />
      )}
    </Field>
  )
}
export const SelectSimples: Story = { name: 'Select', render: () => <SelectDemo /> }
export const SelectComBusca: Story = {
  name: 'Select: searchable',
  render: () => <SelectDemo searchable />,
}
export const SelectMultiplo: Story = {
  name: 'Select: multiple + selectAll',
  render: () => <SelectDemo multiple />,
}
export const SelectCriar: Story = {
  name: 'Select: creatable',
  render: () => <SelectDemo multiple creatable />,
}
export const SelectAsync: Story = {
  name: 'Select: async (loadOptions)',
  render: () => <SelectDemo async />,
}
export const SelectCarregando: Story = {
  name: 'Select: loading',
  render: () => <SelectDemo loading />,
}

/* ------------------------------------------------ Checkbox, Radio, Switch */

function ChecksDemo() {
  const [v, setV] = useState(['email'])
  return (
    <CheckboxGroup
      selectAll
      label="Canais"
      value={v}
      onChange={setV}
      options={[
        { value: 'email', label: 'E-mail' },
        { value: 'sms', label: 'SMS' },
        { value: 'whats', label: 'WhatsApp' },
      ]}
    />
  )
}
export const CheckboxGrupo: Story = {
  name: 'Checkbox: grupo com indeterminado',
  render: () => <ChecksDemo />,
}
export const CheckboxSimples: Story = {
  name: 'Checkbox',
  render: () => <Checkbox label="Aceito os termos" description="Leia antes de continuar." />,
}
export const RadioLista: Story = {
  name: 'Radio: lista',
  render: () => (
    <RadioGroup
      aria-label="Cobrança"
      defaultValue="mensal"
      options={[
        { value: 'mensal', label: 'Mensal' },
        { value: 'anual', label: 'Anual', description: 'Dois meses de desconto.' },
      ]}
    />
  ),
}
export const RadioCards: Story = {
  name: 'Radio: cards',
  render: () => (
    <RadioGroup
      aria-label="Plano"
      variant="cards"
      columns={3}
      defaultValue="pro"
      options={[
        { value: 'essencial', label: 'Essencial', description: 'Para começar.' },
        { value: 'pro', label: 'Profissional', description: 'O mais escolhido.' },
        { value: 'empresa', label: 'Empresa', description: 'Várias unidades.' },
      ]}
    />
  ),
}
export const SwitchComDescricao: Story = {
  name: 'Switch',
  render: () => (
    <Switch label="Notificações por e-mail" description="Resumo diário às 8h." defaultChecked />
  ),
}

/* ------------------------------------------------ DatePicker, Slider, Upload */

function DateDemo({ range, time }: { range?: boolean; time?: boolean }) {
  const [d, setD] = useState<Date | null>(null)
  const [r, setR] = useState<DateRange | null>(null)
  return (
    <Field label={range ? 'Período' : 'Data'}>
      {range ? (
        <DatePicker range time={time} label="Período" value={r} onChange={setR} clearable />
      ) : (
        <DatePicker time={time} label="Data" value={d} onChange={setD} clearable />
      )}
    </Field>
  )
}
export const DatePickerData: Story = { name: 'DatePicker', render: () => <DateDemo /> }
export const DatePickerPeriodo: Story = {
  name: 'DatePicker: range',
  render: () => <DateDemo range />,
}
export const DatePickerHora: Story = { name: 'DatePicker: time', render: () => <DateDemo time /> }

function SliderDemo() {
  const [v, setV] = useState([30, 70])
  return (
    <Field label="Faixa">
      <Slider value={v} onChange={setV} showValue />
    </Field>
  )
}
export const SliderFaixa: Story = { name: 'Slider', render: () => <SliderDemo /> }
export const UploadArquivos: Story = {
  name: 'Upload',
  render: () => (
    <Field label="Documentos" help="Um arquivo com 'erro' no nome simula falha.">
      <Upload accept="image/*,.pdf" maxSizeMb={5} onUpload={fakeUpload} />
    </Field>
  ),
}
export const UploadGaleria: Story = {
  name: 'Upload: layout gallery',
  render: () => (
    <Field label="Fotos" help="Arraste a alça para reordenar as fotos.">
      <Upload
        layout="gallery"
        accept="image/*"
        maxItems={6}
        onUpload={fakeUpload}
        onReorder={() => undefined}
      />
    </Field>
  ),
}
export const UploadComRecorte: Story = {
  name: 'Upload: crop',
  render: () => (
    <Field label="Foto de perfil" help="A imagem só entra na lista depois de recortada.">
      <Upload
        layout="gallery"
        accept="image/*"
        multiple={false}
        maxItems={1}
        onUpload={fakeUpload}
        crop={{ aspects: [{ id: 'quadrado', label: 'Quadrado', ratio: 1 }], maxOutputWidth: 1200 }}
      />
    </Field>
  ),
}

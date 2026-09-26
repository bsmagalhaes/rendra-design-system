import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, CreditCard, Lock, Mail, Rocket, Search, Star, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Grid, Inline, Stack } from '@/components/layout'
import { ActionBar } from '@/components/ui/action-bar'
import { COLOR_PICKER_SWATCHES } from '@/brand/palette'
import { Checkbox, CheckboxGroup } from '@/components/ui/checkbox'
import { ColorPicker } from '@/components/ui/color-picker'
import { DatePicker, type DateRange } from '@/components/ui/date-picker'
import { Checklist, type ChecklistItem } from '@/components/ui/checklist'
import { Field, Label } from '@/components/ui/field'
import { Form, FormField, FormSection } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { OtpInput } from '@/components/ui/otp-input'
import { RadioGroup } from '@/components/ui/radio-group'
import { Rating } from '@/components/ui/rating'
import { RepeatableField, type RepeatableItem } from '@/components/ui/repeatable-field'
import { Select, type SelectOption } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toast'
import { Upload } from '@/components/ui/upload'
import { formatCurrency } from '@/lib/masks'
import { zBR } from '@/lib/validators'
import { CatalogCode, Demo, fakeUpload, GroupTitle, Row, wait } from './demo'

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

interface DemoPhone extends RepeatableItem {
  number: string
}

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
  const [otp, setOtp] = useState('')
  const [band, setBand] = useState([1200, 6400])
  const [checks, setChecks] = useState<string[]>(['email'])
  const [radio, setRadio] = useState('mensal')
  const [stars, setStars] = useState<number | null>(4)
  const [nps, setNps] = useState<number | null>(null)
  const [phones, setPhones] = useState<DemoPhone[]>([
    { id: 'p1', number: '(11) 99999-0001', isPrimary: true },
    { id: 'p2', number: '(11) 99999-0002' },
  ])
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'c1', label: 'Enviar contrato assinado', checked: true },
    { id: 'c2', label: 'Confirmar dados bancários', checked: false },
  ])
  const [color, setColor] = useState(COLOR_PICKER_SWATCHES[0])
  const [amountUnit, setAmountUnit] = useState('percent')
  const [apiKeyEditing, setApiKeyEditing] = useState(false)

  return (
    <>
      <GroupTitle
        id="grupo-formulario"
        title="Formulário"
        description="Rótulo acima, obrigatório marcado, erro abaixo em espaço reservado. Inputs com 16px no mobile para o iOS não dar zoom."
      />

      <Demo
        id="field"
        title="Field e Label"
        description="A moldura de todo campo: rótulo acima, obrigatório marcado no rótulo, ajuda curta abaixo e erro no lugar da ajuda. O Label sozinho serve para um controle fora do Field."
        props="Field (label, required, help, error, span, newRow, reserveMessage, id) · Label (required, htmlFor)"
      >
        <Row label="Field com rótulo, obrigatório, ajuda e erro" code="FLD-001" block>
          <Grid cols={{ base: 1, md: 2, xl: 3 }} gap="fields">
            <Field label="Nome" required>
              <Input />
            </Field>
            <Field label="E-mail" help="Usado para enviar a nota fiscal.">
              <Input type="email" />
            </Field>
            <Field label="Telefone" required error="Informe um telefone válido.">
              <Input mask="phone" invalid />
            </Field>
          </Grid>
        </Row>
        <Row label="Label sozinho, ligado a um controle" code="FLD-002" block>
          <Stack gap="2">
            <Label htmlFor="vitrine-label-apelido" required>
              Apelido
            </Label>
            <Input id="vitrine-label-apelido" />
          </Stack>
        </Row>
      </Demo>

      <Demo
        id="input"
        title="Input"
        description="Um único Input. Máscara, ícone, limpar, senha, unidades e valor guardado são props; a máscara já abre o teclado certo no celular (numérico, telefone, decimal)."
        props="mask (cpf, cnpj, cpfCnpj, phone, cep, date, time, currency, percent), ddi, onDdiChange, ddiOptions, hideDdi, icon, suffix, clearable, type=password, units, unit, onUnitChange, percentMax, variant=secret, size, invalid, disabled"
        code="CAMP-001"
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
          <Field label="Com unidades" help="Trocar de unidade limpa o valor.">
            <Input
              units={[
                { id: 'percent', label: '%' },
                { id: 'currency', label: 'R$' },
                { id: 'kg', label: 'kg' },
              ]}
              unit={amountUnit}
              onUnitChange={setAmountUnit}
              percentMax={100}
            />
          </Field>
          <Field label="Valor guardado (chave de API)" help="O valor salvo nunca aparece no campo.">
            <Input
              variant="secret"
              hasValue
              maskedHint="••••••a1b2c3"
              isEditing={apiKeyEditing}
              onStartEdit={() => setApiKeyEditing(true)}
              onCancelEdit={() => setApiKeyEditing(false)}
              onRemove={() => setApiKeyEditing(false)}
            />
          </Field>
        </Grid>
      </Demo>

      <Demo
        id="cor"
        title="ColorPicker"
        description="Amostras da marca e uma cor livre por hexadecimal, no mesmo painel do Select (popover no desktop, painel inferior no celular)."
        props="value, onChange, swatches, disabled, aria-label"
        code="COR-001"
      >
        <Grid cols={{ base: 1, md: 2, xl: 3 }} gap="fields">
          <Field label="Cor de destaque">
            <ColorPicker aria-label="Cor de destaque" value={color} onChange={setColor} />
          </Field>
          <Field label="Desabilitado">
            <ColorPicker aria-label="Cor de destaque" value={color} disabled />
          </Field>
        </Grid>
      </Demo>

      <Demo
        id="textarea"
        title="Textarea"
        description="Com contador opcional. Cresce com o texto até uma altura máxima."
        props="counter, maxLength, rows, invalid"
        code="TXT-001"
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
        code="RTE-001"
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
        code="SEL-001"
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
            <Inline gap="2" align="center">
              <span className="text-sm font-medium">Checkbox em grupo</span>
              <CatalogCode code={['CHK-001', 'CHK-002']} />
            </Inline>
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
            <Inline gap="2" align="center">
              <span className="text-sm font-medium">Radio em lista</span>
              <CatalogCode code="RDO-001" />
            </Inline>
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
            <Inline gap="2" align="center">
              <span className="text-sm font-medium">Radio em cards</span>
              <CatalogCode code="RDO-002" />
            </Inline>
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
          <Stack gap="2" className="md:col-span-2 md:max-w-xl">
            <Inline gap="2" align="center">
              <span className="text-sm font-medium">Switch</span>
              <CatalogCode code="SWT-001" />
            </Inline>
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
        code="DTP-001"
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
        code="SLD-001"
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
        code="UPL-001"
      >
        <Field label="Documentos" help="PDF ou imagem, até 5 MB cada.">
          <Upload accept="image/*,.pdf" maxSizeMb={5} onUpload={fakeUpload} />
        </Field>
      </Demo>

      <Demo
        id="otp"
        title="OtpInput"
        description="Código de verificação em caixas separadas, para SMS ou e-mail. Aceita colar o código inteiro, avança sozinho e abre o teclado numérico no celular."
        props="length, value, onChange, onComplete, invalid, disabled, id"
        code="OTP-001"
      >
        <Field label="Código de verificação" help="Enviado por SMS.">
          <OtpInput
            value={otp}
            onChange={setOtp}
            onComplete={(v) => toast.success(`Código ${v} conferido`)}
          />
        </Field>
      </Demo>

      <Demo
        id="avaliacao"
        title="Rating"
        description="Avaliação em estrelas (satisfação rápida) ou em escala numérica (NPS e pesquisas). Clicar de novo na opção marcada desmarca e devolve null: nenhuma resposta ainda, nunca zero."
        props="variant (stars, scale), value (number | null), onChange, max, min, lowLabel, highLabel"
      >
        <Row label="Estrelas" code="RTG-001">
          <Rating
            variant="stars"
            value={stars}
            onChange={setStars}
            aria-label="Satisfação com o atendimento"
          />
        </Row>
        <Row label="Escala (NPS)" code="RTG-002" block>
          <Rating
            variant="scale"
            value={nps}
            onChange={setNps}
            lowLabel="Nada provável"
            highLabel="Muito provável"
            aria-label="Qual a chance de você nos recomendar?"
          />
        </Row>
      </Demo>

      <Demo
        id="campo-repetivel"
        title="RepeatableField"
        description="Uma lista de campos do mesmo tipo, como telefones ou e-mails. Marcar um como principal desmarca os outros; remover o principal passa o papel para o primeiro que restar."
        props="items, onChange, createItem, renderField, showPrimary, maxItems, addLabel, emptyLabel"
        code="REP-001"
      >
        <RepeatableField<DemoPhone>
          items={phones}
          onChange={setPhones}
          createItem={() => ({ id: crypto.randomUUID(), number: '' })}
          renderField={(item, update, index) => (
            <Field label={`Telefone ${index + 1}`}>
              <Input mask="phone" value={item.number} onChange={(v) => update({ number: v })} />
            </Field>
          )}
          showPrimary
          maxItems={4}
          addLabel="Adicionar telefone"
          emptyLabel="Nenhum telefone ainda."
        />
      </Demo>

      <Demo
        id="checklist"
        title="Checklist"
        description="Uma lista de verificação editável: criar, renomear, marcar e remover, tudo por teclado, sem gesto especial."
        props="value (id, label, checked), onChange, addLabel, disabled"
        code="CKLT-001"
      >
        <Checklist
          value={checklist}
          onChange={setChecklist}
          aria-label="Pendências do fechamento"
        />
      </Demo>

      <Demo
        id="formulario-validado"
        title="Formulário com validação"
        description="React Hook Form + Zod: validação ao sair do campo, mensagens em português, CPF/CNPJ verificado de verdade, foco no primeiro erro ao enviar e botão com carregamento."
        code={['FORM-001', 'FORM-002']}
        bare
      >
        <ValidatedForm />
      </Demo>
    </>
  )
}

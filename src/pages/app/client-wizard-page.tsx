import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Mail, Rocket, Star, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { Container, PageHeader, Stack } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup } from '@/components/ui/radio-group'
import { Select } from '@/components/ui/select'
import { toast } from '@/components/ui/toast'
import { Wizard } from '@/components/ui/wizard'
import { formatCurrency, parseLocaleNumber } from '@/lib/masks'
import { zBR } from '@/lib/validators'

const schema = z.object({
  nome: zBR.required('Nome'),
  documento: zBR.cpfCnpj(),
  email: zBR.email(),
  telefone: zBR.phone(),
  cep: zBR.cep(),
  cidade: zBR.required('Cidade'),
  uf: z.string({ error: 'Escolha a UF.' }).min(2, 'Escolha a UF.'),
  plano: z.string({ error: 'Escolha um plano.' }),
  valor: z.string().refine((v) => /[1-9]/.test(v), 'Informe o valor mensal.'),
  inicio: z.date({ error: 'Informe a data de início.' }),
})
type Values = z.infer<typeof schema>

// Campos validados ao avançar de cada etapa
const stepFields: (keyof Values)[][] = [
  ['nome', 'documento', 'email', 'telefone'],
  ['cep', 'cidade', 'uf'],
  ['plano', 'valor', 'inicio'],
  [],
]

const steps = [
  { id: 'dados', title: 'Dados', description: 'Quem é o cliente' },
  { id: 'endereco', title: 'Endereço', description: 'Onde atender' },
  { id: 'contrato', title: 'Contrato', description: 'O que contratar' },
  { id: 'revisao', title: 'Revisão', description: 'Confirmar tudo' },
]

const grid = 'grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2'

/** Cadastro complexo em página inteira, em etapas, com validação por etapa. */
export function ClientWizardPage() {
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
      cidade: '',
      valor: '',
    },
  })
  const v = form.watch()
  const review: [string, string | undefined][] = [
    ['Nome', v.nome],
    ['CPF ou CNPJ', v.documento],
    ['E-mail', v.email],
    ['Telefone', v.telefone],
    ['Cidade', v.cidade && v.uf ? `${v.cidade}, ${v.uf}` : v.cidade],
    ['Plano', v.plano],
    ['Valor mensal', v.valor ? formatCurrency(parseLocaleNumber(v.valor) ?? 0) : undefined],
    ['Início', v.inicio ? v.inicio.toLocaleDateString('pt-BR') : undefined],
  ]

  return (
    <Container padded>
      <Stack gap="section">
        <PageHeader
          title="Cadastro guiado"
          description="Quatro etapas curtas. Você pode voltar e revisar a qualquer momento."
        />
        <Form form={form} onSubmit={() => undefined}>
          <Wizard
            steps={steps}
            onCancel={() => navigate('/clientes')}
            onValidateStep={(i) => form.trigger(stepFields[i] ?? [])}
            onFinish={async () => {
              await new Promise((r) => window.setTimeout(r, 1000))
              toast.success('Cliente cadastrado', {
                description: `${v.nome} já aparece na listagem.`,
              })
              navigate('/clientes')
            }}
            finishLabel="Cadastrar cliente"
          >
            {[
              <Card key="dados">
                <CardContent>
                  <div className={grid}>
                    <FormField<Values>
                      name="nome"
                      label="Nome ou razão social"
                      required
                      span="full"
                      render={(f) => <Input {...f} icon={<User />} />}
                    />
                    <FormField<Values>
                      name="documento"
                      label="CPF ou CNPJ"
                      required
                      render={(f) => <Input {...f} mask="cpfCnpj" />}
                    />
                    <FormField<Values>
                      name="telefone"
                      label="Telefone"
                      required
                      render={(f) => <Input {...f} mask="phone" />}
                    />
                    <FormField<Values>
                      name="email"
                      label="E-mail"
                      required
                      span="full"
                      render={(f) => (
                        <Input {...f} type="email" inputMode="email" icon={<Mail />} />
                      )}
                    />
                  </div>
                </CardContent>
              </Card>,
              <Card key="endereco">
                <CardContent>
                  <div className={grid}>
                    <FormField<Values>
                      name="cep"
                      label="CEP"
                      required
                      render={(f) => <Input {...f} mask="cep" />}
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
                          options={['SP', 'RJ', 'MG', 'PR', 'RS', 'SC', 'BA', 'PE', 'GO', 'DF'].map(
                            (u) => ({ value: u, label: u }),
                          )}
                        />
                      )}
                    />
                    <FormField<Values>
                      name="cidade"
                      label="Cidade"
                      required
                      span="full"
                      render={(f) => <Input {...f} />}
                    />
                  </div>
                </CardContent>
              </Card>,
              <Card key="contrato">
                <CardContent>
                  <div className={grid}>
                    <FormField<Values>
                      name="plano"
                      label="Plano"
                      required
                      span="full"
                      render={(f) => (
                        <RadioGroup
                          {...f}
                          variant="cards"
                          columns={3}
                          options={[
                            {
                              value: 'Essencial',
                              label: 'Essencial',
                              description: 'Para começar.',
                              icon: <Star />,
                            },
                            {
                              value: 'Profissional',
                              label: 'Profissional',
                              description: 'O mais escolhido.',
                              icon: <Rocket />,
                            },
                            {
                              value: 'Empresa',
                              label: 'Empresa',
                              description: 'Várias unidades.',
                              icon: <Building2 />,
                            },
                          ]}
                        />
                      )}
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
                  </div>
                </CardContent>
              </Card>,
              <Card key="revisao">
                <CardContent>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {review.map(([k, val]) => (
                      <div key={k} className="flex min-w-0 flex-col gap-1">
                        <dt className="text-xs text-muted-foreground">{k}</dt>
                        <dd className="truncate text-sm font-medium">{val || '-'}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>,
            ]}
          </Wizard>
        </Form>
      </Stack>
    </Container>
  )
}

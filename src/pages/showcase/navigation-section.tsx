import { Bell, FileText, History, User } from 'lucide-react'
import { useState } from 'react'
import { Grid, Stack } from '@/components/layout'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Stepper, Wizard } from '@/components/ui/wizard'
import { Tabs } from '@/components/ui/tabs'
import { toast } from '@/components/ui/toast'
import { Demo, GroupTitle, Row, wait } from './demo'

const steps = [
  { id: 'dados', title: 'Dados', description: 'Quem é o cliente' },
  { id: 'endereco', title: 'Endereço', description: 'Onde atender' },
  { id: 'plano', title: 'Plano', description: 'O que contratar' },
  { id: 'revisao', title: 'Revisão', description: 'Confirmar tudo' },
]

function WizardDemo() {
  const [nome, setNome] = useState('')
  const [cep, setCep] = useState('')
  const [erroNome, setErroNome] = useState<string>()
  const [erroCep, setErroCep] = useState<string>()
  return (
    <Wizard
      steps={steps}
      stickyFooter={false}
      onValidateStep={async (i) => {
        await wait(400)
        if (i === 0) {
          const ok = nome.trim().length > 2
          setErroNome(ok ? undefined : 'Informe o nome com pelo menos 3 letras.')
          return ok
        }
        if (i === 1) {
          const ok = cep.replace(/\D/g, '').length === 8
          setErroCep(ok ? undefined : 'CEP incompleto.')
          return ok
        }
        return true
      }}
      onFinish={async () => {
        await wait(800)
        toast.success('Cadastro concluído', { description: `${nome} foi cadastrado.` })
      }}
    >
      {[
        <Grid key="d" cols={{ base: 1, md: 2 }} gap="6">
          <Field label="Nome" required error={erroNome} help="Valida ao avançar.">
            <Input value={nome} onChange={setNome} />
          </Field>
        </Grid>,
        <Grid key="e" cols={{ base: 1, md: 2 }} gap="6">
          <Field label="CEP" required error={erroCep}>
            <Input mask="cep" value={cep} onChange={setCep} />
          </Field>
        </Grid>,
        <p key="p" className="text-sm text-muted-foreground">
          Escolha do plano (etapa sem validação).
        </p>,
        <p key="r" className="text-sm">
          Confira os dados: <strong className="font-semibold">{nome || 'sem nome'}</strong>, CEP{' '}
          {cep || 'não informado'}.
        </p>,
      ]}
    </Wizard>
  )
}

export function NavigationSection() {
  const [page, setPage] = useState(3)
  const [size, setSize] = useState(10)
  const tabContent = (t: string) => (
    <p className="text-sm text-muted-foreground">Conteúdo da aba {t}.</p>
  )
  return (
    <>
      <GroupTitle
        id="grupo-navegacao"
        title="Navegação"
        description="Abas que viram select quando não cabem, paginação compacta no celular e cadastro em etapas."
      />

      <Demo
        id="tabs"
        title="Tabs"
        description="Variante linha ou pílula. Se as abas não couberem na largura do bloco, viram um Select, sem rolagem lateral. Diminua a janela para ver."
        props="items (value, label, icon, count, content), variant (line | pill), value, onChange"
      >
        <Row label="Linha (padrão), com ícone e contador" code="ABA-001" block>
          <Tabs
            aria-label="Seções do cliente"
            items={[
              { value: 'resumo', label: 'Resumo', icon: <User />, content: tabContent('Resumo') },
              {
                value: 'contratos',
                label: 'Contratos',
                icon: <FileText />,
                count: 3,
                content: tabContent('Contratos'),
              },
              {
                value: 'historico',
                label: 'Histórico',
                icon: <History />,
                content: tabContent('Histórico'),
              },
              {
                value: 'avisos',
                label: 'Avisos',
                icon: <Bell />,
                count: 12,
                content: tabContent('Avisos'),
              },
            ]}
          />
        </Row>
        <Row
          label="Pílula, com ícone e contador (variação de exibição, mesmo código)"
          code="ABA-002"
          block
        >
          <Tabs
            variant="pill"
            aria-label="Período"
            items={[
              { value: 'dia', label: 'Hoje', icon: <User />, content: tabContent('Hoje') },
              {
                value: 'semana',
                label: 'Semana',
                icon: <FileText />,
                count: 3,
                content: tabContent('Semana'),
              },
              { value: 'mes', label: 'Mês', content: tabContent('Mês') },
              { value: 'ano', label: 'Ano', content: tabContent('Ano') },
            ]}
          />
        </Row>
        <Row
          label="Muitas abas: vira Select sozinho quando não cabe (automático, sem código)"
          block
        >
          <Tabs
            aria-label="Muitas abas"
            items={[
              'Dados gerais',
              'Endereços',
              'Contatos',
              'Contratos',
              'Faturas',
              'Documentos',
              'Atendimentos',
              'Histórico completo',
            ].map((l) => ({ value: l, label: l, content: tabContent(l) }))}
          />
        </Row>
      </Demo>

      <Demo
        id="breadcrumb"
        title="Breadcrumb"
        description="No desktop mostra a trilha completa. No mobile vira botão voltar com o nome da tela atual."
        props="items: { label, to? }[], variant (responsive | trail)"
      >
        <Row
          label="Responsiva (padrão): trilha no desktop, botão voltar no celular"
          code="BRD-001"
          block
        >
          <Breadcrumb
            items={[
              { label: 'Painel', to: '/' },
              { label: 'Clientes', to: '/clientes' },
              { label: 'Detalhe do cliente' },
            ]}
          />
        </Row>
        <Row label="Trilha em texto (usada no header do AppShell)" code="BRD-002" block>
          <Breadcrumb
            variant="trail"
            items={[
              { label: 'Painel', to: '/' },
              { label: 'Clientes', to: '/clientes' },
              { label: 'Detalhe do cliente' },
            ]}
          />
        </Row>
      </Demo>

      <Demo
        id="paginacao"
        title="Pagination"
        description="Completa no desktop, com itens por página. No celular, anterior e próxima com 'Página 3 de 25', ou 'Carregar mais'."
        props="page, pageSize, total, onPageChange, onPageSizeChange, pageSizes, mobileMode (pages | loadMore), loading"
        code="PAG-001"
      >
        <Pagination
          page={page}
          pageSize={size}
          total={243}
          onPageChange={setPage}
          onPageSizeChange={setSize}
        />
        <Pagination
          page={1}
          pageSize={10}
          total={243}
          onPageChange={() => {}}
          mobileMode="loadMore"
        />
      </Demo>

      <Demo
        id="wizard"
        title="Wizard e Stepper"
        description="Etapas concluída, atual, pendente e com erro, com validação por etapa. No celular vira 'Etapa 2 de 4' com barra de progresso e o nome da etapa, com Voltar e Avançar no rodapé."
        props="Wizard (steps, children, onValidateStep, onFinish, onCancel, orientation, stickyFooter) · Stepper (steps, current, errors, orientation, onStepClick)"
      >
        <Stack gap="8">
          <Row label="Stepper sozinho, horizontal e vertical" code="WIZ-002">
            <Stack gap="8" className="w-full">
              <Stepper steps={steps} current={2} errors={[1]} />
              <Stepper steps={steps} current={1} orientation="vertical" className="md:max-w-sm" />
            </Stack>
          </Row>
          <Row label="Wizard completo, com validação por etapa" code="WIZ-001">
            <div className="w-full">
              <WizardDemo />
            </div>
          </Row>
        </Stack>
      </Demo>
    </>
  )
}

import { Filter, Info, Phone, RotateCw, Save, Trash2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import type { FeedbackType } from '@/brand'
import { Grid, Inline, Stack } from '@/components/layout'
import { Alert } from '@/components/ui/alert'
import { BrandFeedbackIcon, feedbackLabels } from '@/components/ui/brand-feedback-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorPage } from '@/components/ui/error-page'
import { Field } from '@/components/ui/field'
import { InfoHint } from '@/components/ui/info-hint'
import { Input } from '@/components/ui/input'
import { Modal, type ModalType } from '@/components/ui/modal'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/toast'
import { Tooltip } from '@/components/ui/tooltip'
import { Demo, GroupTitle, Row, wait } from './demo'

const types: FeedbackType[] = ['success', 'error', 'warning', 'info']
const text: Record<FeedbackType, [string, string]> = {
  success: ['Cadastro salvo', 'O cliente já aparece na listagem.'],
  error: ['Falha ao salvar', 'Verifique a conexão e tente de novo.'],
  warning: ['Alterações pendentes', 'Salve antes de sair desta tela.'],
  info: ['Exportação em andamento', 'O arquivo chega por e-mail em instantes.'],
}

export function FeedbackSection() {
  const [replay, setReplay] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [modal, setModal] = useState<ModalType | null>(null)
  const [progress, setProgress] = useState(64)

  return (
    <>
      <GroupTitle
        id="grupo-feedback"
        title="Feedback"
        description="Todos com o ícone de feedback da marca: toasts, alerts, modais de confirmação, estados vazios e telas de erro."
      />

      <Demo
        id="icone-feedback"
        title="Ícone de feedback"
        description="O símbolo do template tingido pela cor semântica, com selo de status. Animado: o check se desenha, o X se risca e o erro treme. Cada tipo pode ser trocado por um SVG próprio no brand.config.ts."
        props="type, size (sm, md, lg, xl, 2xl), animated, label"
      >
        <Button
          variant="outline"
          size="sm"
          icon={<RotateCw />}
          className="self-start"
          onClick={() => setReplay((r) => r + 1)}
        >
          Repetir animação
        </Button>
        <Grid cols={{ base: 2, md: 4 }} gap="6">
          {types.map((t) => (
            <Stack key={`${t}-${replay}`} gap="3" align="center">
              <BrandFeedbackIcon type={t} size="2xl" animated label={feedbackLabels[t]} />
              <span className="text-sm font-medium">{feedbackLabels[t]}</span>
              <Inline gap="2" align="end">
                <BrandFeedbackIcon type={t} size="sm" />
                <BrandFeedbackIcon type={t} size="md" />
                <BrandFeedbackIcon type={t} size="lg" />
              </Inline>
            </Stack>
          ))}
        </Grid>
      </Demo>

      <Demo
        id="alert"
        title="Alert"
        description="Ícone à esquerda, título em negrito e descrição. Pode ter ação e fechar."
        props="type, title, description, action, onDismiss, animated"
      >
        <Grid cols={{ base: 1, md: 2 }}>
          {types.map((t) => (
            <Alert
              key={`${t}-${replay}`}
              type={t}
              title={text[t][0]}
              description={text[t][1]}
              animated
            />
          ))}
        </Grid>
        <Alert
          type="success"
          title="Cliente excluído"
          description="Você pode desfazer nos próximos segundos."
          action={
            <Button size="sm" variant="outline">
              Desfazer
            </Button>
          }
        />
        {!dismissed ? (
          <Alert
            type="info"
            title="Novidade"
            description="Feche este aviso pelo X."
            onDismiss={() => setDismissed(true)}
          />
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => setDismissed(false)}
          >
            Mostrar aviso de novo
          </Button>
        )}
      </Demo>

      <Demo
        id="toast"
        title="Toast"
        description="Avisos temporários com o ícone animado. Embaixo no centro no celular, no canto inferior direito no desktop. Erros ficam mais tempo na tela."
        props="toast.success | error | warning | info (título, { description, action, duration })"
      >
        <Row label="Disparar">
          <Button
            variant="outline"
            onClick={() =>
              toast.success('Cliente salvo', { description: 'As alterações já estão valendo.' })
            }
          >
            Sucesso
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.error('Falha ao salvar', { description: 'Tente de novo em instantes.' })
            }
          >
            Erro
          </Button>
          <Button variant="outline" onClick={() => toast.warning('Sessão expira em 5 minutos')}>
            Atenção
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.info('Cliente arquivado', {
                action: {
                  label: 'Desfazer',
                  onClick: () => toast.success('Arquivamento desfeito'),
                },
              })
            }
          >
            Com ação
          </Button>
        </Row>
      </Demo>

      <Demo
        id="modal"
        title="Modal"
        description="Só para confirmações, mensagens e formulários de até 3 campos. No celular ocupa a tela inteira, com o rodapé fixo e os botões 30/70."
        props="type (confirm, destructive, info, form), size (sm, md, lg), title, description, confirmLabel, cancelLabel, onConfirm (assíncrono), formId, loading"
      >
        <Row label="Tipos">
          <Button variant="outline" onClick={() => setModal('confirm')}>
            Confirmação
          </Button>
          <Button variant="destructive" icon={<Trash2 />} onClick={() => setModal('destructive')}>
            Destrutiva
          </Button>
          <Button variant="outline" icon={<Info />} onClick={() => setModal('info')}>
            Informativo
          </Button>
          <Button variant="outline" icon={<UserPlus />} onClick={() => setModal('form')}>
            Formulário curto
          </Button>
        </Row>
        <Modal
          open={modal === 'confirm'}
          onOpenChange={(o) => !o && setModal(null)}
          type="confirm"
          title="Enviar proposta ao cliente?"
          description="Ele recebe o link por e-mail e pode aceitar pelo celular."
          confirmLabel="Enviar proposta"
          onConfirm={async () => {
            await wait(900)
            toast.success('Proposta enviada')
          }}
        />
        <Modal
          open={modal === 'destructive'}
          onOpenChange={(o) => !o && setModal(null)}
          type="destructive"
          title="Excluir cliente?"
          description="Esta ação não pode ser desfeita. Contratos e histórico também serão removidos."
          confirmLabel="Excluir cliente"
          onConfirm={async () => {
            await wait(900)
            toast.error('Cliente excluído')
          }}
        />
        <Modal
          open={modal === 'info'}
          onOpenChange={(o) => !o && setModal(null)}
          type="info"
          title="Exportação iniciada"
          description="Você recebe o arquivo por e-mail em alguns minutos."
        />
        <Modal
          open={modal === 'form'}
          onOpenChange={(o) => !o && setModal(null)}
          type="form"
          size="md"
          title="Convidar pessoa"
          description="Ela recebe um convite por e-mail."
          confirmLabel="Enviar convite"
          onConfirm={async () => {
            await wait(900)
            toast.success('Convite enviado')
          }}
        >
          <Field label="Nome" required>
            <Input />
          </Field>
          <Field label="E-mail" required>
            <Input type="email" inputMode="email" />
          </Field>
        </Modal>
      </Demo>

      <Demo
        id="texto-orientativo"
        title="Texto orientativo (InfoHint)"
        description="Instrução de uso nunca fica solta no corpo da tela nem num botão avulso de informação: é um ícone discreto ao lado do título a que se refere, que abre um modal. Ações de um card ficam no canto do cabeçalho dele."
        props="PageHeader help · CardTitle help · FormSection help · CardHeader actions · InfoHint (title, children)"
      >
        <Grid cols={{ base: 1, md: 2 }} gap="4">
          <Card>
            <CardHeader
              actions={
                <Button variant="outline" icon={<Phone />}>
                  Ligar
                </Button>
              }
            >
              <CardTitle help="Soma dos contratos faturados no mês, sem descontos. Atualiza todo dia às 6h.">
                Receita do mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">R$ 61.300,00</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <span className="flex items-center gap-1 text-sm font-semibold">
                Direto, quando nenhum título servir
                <InfoHint title="Como funciona">
                  <p>O InfoHint abre um modal informativo com o texto, que pode ter parágrafos.</p>
                </InfoHint>
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Prefira sempre o help do título: PageHeader, CardTitle ou FormSection.
              </p>
            </CardContent>
          </Card>
        </Grid>
      </Demo>

      <Demo
        id="popover-tooltip"
        title="Popover e Tooltip"
        description="Popover abre por toque ou clique e serve para escolhas rápidas junto de um controle (filtros, emojis). Tooltip é só complemento no desktop, nunca a única forma de ver a informação."
        props="PopoverContent (width sm, md) · Tooltip (content, side)"
      >
        <Row label="Exemplos">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" icon={<Filter />}>
                Filtros
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-4">
              <Stack gap="2">
                <span className="text-sm font-semibold">Filtrar por status</span>
                <p className="text-sm text-muted-foreground">
                  Os filtros escolhidos aqui valem para a listagem inteira.
                </p>
              </Stack>
            </PopoverContent>
          </Popover>
          <Tooltip content="Atalho: Ctrl+S">
            <Button variant="ghost" icon={<Save />}>
              Passe o mouse
            </Button>
          </Tooltip>
        </Row>
      </Demo>

      <Demo
        id="empty-state"
        title="EmptyState"
        description="Estado vazio e de erro com o ícone de feedback da marca e até duas ações."
        props="title, description, type, actions, size (default, compact)"
      >
        <Grid cols={{ base: 1, md: 2 }}>
          <EmptyState
            title="Nenhum contrato ainda"
            description="Crie o primeiro contrato para acompanhar vencimentos."
            actions={<Button icon={<UserPlus />}>Criar contrato</Button>}
          />
          <EmptyState
            type="error"
            title="Não foi possível carregar"
            description="O servidor demorou a responder."
            actions={
              <Button variant="outline" icon={<RotateCw />}>
                Tentar de novo
              </Button>
            }
          />
        </Grid>
      </Demo>

      <Demo
        id="progress-skeleton"
        title="Progress e Skeleton"
        description="Progresso determinado ou indeterminado; skeleton com a mesma estrutura do conteúdo final."
        props="Progress (value, tone, size, showValue, label) · Skeleton (className)"
      >
        <Stack gap="4">
          <Progress value={progress} showValue label="Importação" />
          <Progress value={progress} tone="brand" showValue label="Com degradê do template" />
          <Progress value={null} label="Indeterminado" />
          <Inline gap="2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setProgress((p) => Math.max(0, p - 10))}
            >
              -10%
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setProgress((p) => Math.min(100, p + 10))}
            >
              +10%
            </Button>
          </Inline>
        </Stack>
        <Stack gap="3">
          <Inline gap="3" wrap={false}>
            <Skeleton className="size-12 shrink-0 rounded-avatar" />
            <Stack gap="2" className="flex-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </Stack>
          </Inline>
          <Skeleton className="h-chart-sm w-full rounded-surface" />
        </Stack>
      </Demo>

      <Demo
        id="pagina-erro"
        title="Página de erro"
        description="404 e 500 com o ícone animado e ações na proporção 30/70."
        props="code (404, 500), title, description, fullScreen"
      >
        <Grid cols={{ base: 1, xl: 2 }}>
          <div className="rounded-surface border bg-background">
            <ErrorPage code={404} />
          </div>
          <div className="rounded-surface border bg-background">
            <ErrorPage code={500} />
          </div>
        </Grid>
        <Button asChild variant="link" className="self-start">
          <Link to="/uma-pagina-que-nao-existe">Abrir a 404 de verdade</Link>
        </Button>
      </Demo>
    </>
  )
}

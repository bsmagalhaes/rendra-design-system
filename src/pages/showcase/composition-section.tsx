import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Grid, Stack } from '@/components/layout'
import { ActionBar } from '@/components/ui/action-bar'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ClientDrawer } from '@/pages/app/client-drawer'
import { CatalogCode, Demo, GroupTitle } from './demo'

export function CompositionSection() {
  const [drawer, setDrawer] = useState(false)
  return (
    <>
      <GroupTitle
        id="grupo-composicao"
        title="Regras de composição"
        description="Como as peças se combinam em tela. Estas regras valem para todos os templates."
      />

      <Demo
        id="drawer"
        title="Drawer com rodapé fixo"
        description="Formulário de volume médio (até ~12 campos). Header fixo, só o body rola, rodapé com 30/70 sempre visível. Preencha um campo e tente fechar: ele pede confirmação. No celular ocupa a tela inteira."
        props="open, onOpenChange, title, description, icon, size (sm, md, lg, xl, full), footer, dirty"
        code="GAV-001"
      >
        <Button icon={<UserPlus />} className="self-start" onClick={() => setDrawer(true)}>
          Abrir drawer de cadastro
        </Button>
        <ClientDrawer open={drawer} onOpenChange={setDrawer} />
      </Demo>

      <Demo
        id="container-certo"
        title="Qual contêiner usar"
        description="O volume de conteúdo decide. Se rola muito ou tem muitos campos, não cabe em modal. Nunca modal dentro de modal."
      >
        <Grid cols={{ base: 1, md: 3 }} gap="6">
          {[
            ['Modal', 'Confirmações, mensagens e formulários de até 3 campos simples.'],
            ['Drawer', 'Formulários e detalhes de volume médio, até cerca de 12 campos.'],
            ['Página inteira', 'Formulários longos e cadastros complexos, em seções ou em wizard.'],
          ].map(([t, d]) => (
            <Stack key={t} gap="1">
              <span className="text-sm font-semibold">{t}</span>
              <span className="text-sm text-muted-foreground">{d}</span>
            </Stack>
          ))}
        </Grid>
      </Demo>

      <Demo
        id="regra-botoes"
        title="Proporção dos botões"
        description="Mesma regra em drawer, modal e formulário em página, em qualquer tamanho de tela. Só nas barras de ferramentas acima de tabelas os botões têm largura automática."
      >
        <Stack gap="4">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Um botão: 100%
          </span>
          <ActionBar primary={{ label: 'Entendi' }} />
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Dois botões: 30% e 70%
          </span>
          <ActionBar cancel={{ label: 'Cancelar' }} primary={{ label: 'Salvar' }} />
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Três ou mais: extras no menu
          </span>
          <ActionBar
            cancel={{ label: 'Cancelar' }}
            primary={{ label: 'Publicar' }}
            secondary={[{ label: 'Salvar rascunho' }, { label: 'Pré-visualizar' }]}
          />
        </Stack>
      </Demo>

      <Demo
        id="regra-card"
        title="Card sem card dentro"
        description="Hierarquia interna com separador ou título de seção, nunca com outro card."
        bare
      >
        <Card>
          <CardHeader>
            <CardTitle>Resumo do cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack gap="4">
              <p className="text-sm">Dados gerais do cliente.</p>
              <span className="flex items-center gap-2">
                <Separator className="flex-1" />
                <CatalogCode code="SEP-001" />
                <Separator className="flex-1" />
              </span>
              <p className="text-sm font-semibold">Contratos</p>
              <p className="text-sm text-muted-foreground">
                Seção interna separada por linha, não por card.
              </p>
            </Stack>
          </CardContent>
        </Card>
      </Demo>

      <Demo
        id="regra-tabela"
        title="Barra de ferramentas e tabela em cards"
        description="A tabela da seção Dados já mostra a barra de ferramentas no mesmo card, os chips de filtro e, no celular, a reconstrução em cards."
        bare
      >
        <Alert
          type="info"
          title="Veja no celular"
          description="Abra esta página com 360px de largura (ou no Storybook, viewport mobile): a Table vira lista de cards, os filtros viram o botão Filtros e as ações em massa descem para uma barra fixa."
        />
      </Demo>
    </>
  )
}

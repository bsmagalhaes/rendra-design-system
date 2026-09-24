import { ChevronDown, List } from 'lucide-react'
import { Collapsible } from 'radix-ui'
import { useEffect, useState } from 'react'
import { useBrand } from '@/brand'
import { Container, Grid, PageHeader, Stack } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/cn'
import { shapeLabels } from '@/lib/shape'
import { ActionsSection } from './showcase/actions-section'
import { CompositionSection } from './showcase/composition-section'
import { DataSection } from './showcase/data-section'
import { Demo, Row } from './showcase/demo'
import { FeedbackSection } from './showcase/feedback-section'
import { FormsSection } from './showcase/forms-section'
import { NavigationSection } from './showcase/navigation-section'

/*
 * VITRINE /componentes: cada componente com variantes, tamanhos e estados,
 * e as regras de composição. Menu lateral fixo com scrollspy; recolhível no mobile.
 */

const groups = [
  {
    title: 'Ações',
    items: [
      ['botao', 'Botão'],
      ['button-group', 'ButtonGroup'],
      ['menu-suspenso', 'DropdownMenu'],
      ['action-bar', 'ActionBar'],
    ],
  },
  {
    title: 'Formulário',
    items: [
      ['input', 'Input'],
      ['textarea', 'Textarea'],
      ['select', 'Select'],
      ['checkbox-radio', 'Checkbox, Radio, Switch'],
      ['datepicker', 'DatePicker'],
      ['slider', 'Slider'],
      ['upload', 'Upload'],
      ['formulario-validado', 'Formulário validado'],
    ],
  },
  {
    title: 'Navegação',
    items: [
      ['tabs', 'Tabs'],
      ['breadcrumb', 'Breadcrumb'],
      ['paginacao', 'Pagination'],
      ['wizard', 'Wizard e Stepper'],
    ],
  },
  {
    title: 'Dados',
    items: [
      ['table', 'Table'],
      ['statcard', 'StatCard'],
      ['card', 'Card'],
      ['badge', 'Badge'],
      ['avatar', 'Avatar'],
      ['lista', 'Lista'],
      ['timeline', 'Timeline'],
      ['accordion', 'Accordion'],
      ['chart', 'Chart'],
    ],
  },
  {
    title: 'Feedback',
    items: [
      ['icone-feedback', 'Ícone de feedback'],
      ['alert', 'Alert'],
      ['toast', 'Toast'],
      ['modal', 'Modal'],
      ['popover-tooltip', 'Popover e Tooltip'],
      ['empty-state', 'EmptyState'],
      ['progress-skeleton', 'Progress e Skeleton'],
      ['pagina-erro', 'Página de erro'],
    ],
  },
  {
    title: 'Composição',
    items: [
      ['drawer', 'Drawer'],
      ['container-certo', 'Qual contêiner'],
      ['regra-botoes', 'Proporção dos botões'],
      ['regra-card', 'Card sem card'],
      ['regra-tabela', 'Tabela em cards'],
      ['primitivas', 'Primitivas de layout'],
    ],
  },
] as const

const allIds = groups.flatMap((g) => g.items.map(([id]) => id))
const titleOf: Record<string, string> = Object.fromEntries(
  groups.flatMap((g) => g.items.map(([id, t]) => [id, t])),
)

function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? '')
  useEffect(() => {
    const root = document.getElementById('conteudo')
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { root, rootMargin: '-10% 0px -75% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [ids])
  return active
}

function SectionNav({ active, onNavigate }: { active: string; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g.title} className="flex flex-col gap-1">
          <span className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {g.title}
          </span>
          <ul className="flex flex-col">
            {g.items.map(([id, title]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={onNavigate}
                  aria-current={active === id ? 'location' : undefined}
                  className={cn(
                    'flex min-h-touch items-center rounded-item px-3 text-sm transition-colors md:h-8 md:min-h-0',
                    active === id
                      ? 'bg-primary-soft font-medium text-primary-soft-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function ComponentsPage() {
  const active = useScrollSpy(allIds)
  const { brand, palette } = useBrand()
  const [navOpen, setNavOpen] = useState(false)

  return (
    <Container padded>
      <Stack gap="section">
        <PageHeader
          title="Componentes"
          description={`Cada componente com variantes, tamanhos e estados. Modelo ${brand.productName} (formato ${shapeLabels[brand.shape].toLowerCase()}) com a paleta ${palette.name}. Troque pelo menu do avatar.`}
        />

        <Grid cols={{ base: 1, lg: 4 }} gap="8">
          <nav aria-label="Seções da vitrine" className="lg:sticky lg:top-6 lg:self-start">
            <Collapsible.Root open={navOpen} onOpenChange={setNavOpen} className="lg:hidden">
              <Collapsible.Trigger asChild>
                <Button variant="outline" fullWidth icon={<List />} iconRight={<ChevronDown />}>
                  <span className="flex-1 text-left">{titleOf[active] ?? 'Seções'}</span>
                </Button>
              </Collapsible.Trigger>
              <Collapsible.Content className="overflow-hidden pt-2 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <Card>
                  <CardContent className="p-2 md:p-2">
                    <SectionNav active={active} onNavigate={() => setNavOpen(false)} />
                  </CardContent>
                </Card>
              </Collapsible.Content>
            </Collapsible.Root>
            <div className="hidden max-h-sheet overflow-y-auto lg:block">
              <SectionNav active={active} />
            </div>
          </nav>

          <Stack gap="section" className="min-w-0 lg:col-span-3">
            <ActionsSection />
            <FormsSection />
            <NavigationSection />
            <DataSection />
            <FeedbackSection />
            <CompositionSection />

            <Demo
              id="primitivas"
              title="Primitivas de layout"
              description="Toda tela é composta por Container, Stack, Inline, Grid, Section e PageHeader. O conteúdo ocupa 95% da largura a partir de 1024px."
              props="Container (size, padded) · Stack (gap, align) · Inline (gap, justify, wrap, stackOnMobile) · Grid (cols por faixa, responsive: screen | container) · Section · PageHeader"
            >
              <Row label="Grid 1, 2 e 4 colunas">
                <Grid cols={{ base: 1, sm: 2, lg: 4 }} className="w-full">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="flex h-12 items-center justify-center rounded-control border border-primary bg-primary-soft text-sm font-medium text-primary-soft-foreground"
                    >
                      {n}
                    </div>
                  ))}
                </Grid>
              </Row>
              <Row label="Grid por container (reage à largura do bloco)">
                <Grid cols={{ base: 1, sm: 2, md: 3 }} responsive="container" className="w-full">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="flex h-12 items-center justify-center rounded-control border border-secondary text-sm font-medium"
                    >
                      {n}
                    </div>
                  ))}
                </Grid>
              </Row>
            </Demo>
          </Stack>
        </Grid>
      </Stack>
    </Container>
  )
}

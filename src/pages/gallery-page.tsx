import { Check, Copy, Maximize2, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useBrand } from '@/brand'
import { useShell } from '@/components/app-shell/shell-context'
import { Container, Grid, PageHeader, Section, Stack } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { ImageViewer, type ViewerImage } from '@/components/ui/image-viewer'
import { Select } from '@/components/ui/select'
import { toast } from '@/components/ui/toast'
import { colorCodes, currentModelCode, menuCodes, themeCodes } from '@/config/presets'
import { cn } from '@/lib/cn'

/*
 * GALERIA /galeria: as capturas do README (docs/images), abertas por cima da tela no
 * ImageViewer, sem sair da página. Cada captura mostra o código do modelo (tema, cores e
 * menu), o mesmo que o briefing aceita. As imagens são geradas com npm run docs:images.
 */

const files = import.meta.glob<string>('../../docs/images/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})
const url = (name: string) => files[`../../docs/images/${name}.png`] ?? ''

const T = { safira: 'T1', equilibrio: 'T2', aurora: 'T3' } as const
const C = { safira: 'C1', equilibrio: 'C2', aurora: 'C3', ardosia: 'C4' } as const
const names = { safira: 'Safira', equilibrio: 'Equilíbrio', aurora: 'Aurora', ardosia: 'Ardósia' }
type Model = keyof typeof T
type Palette = keyof typeof C

interface Item {
  file: string
  caption: string
  /** Código do modelo mostrado na captura (tema, cores, menu). */
  code?: string
}
interface Group {
  id: string
  title: string
  description: string
  /** Proporção da miniatura: telas de desktop ou de celular. */
  shape: 'wide' | 'tall'
  items: Item[]
}

const models: Model[] = ['safira', 'equilibrio', 'aurora']
const palettes: Palette[] = ['safira', 'equilibrio', 'aurora', 'ardosia']

const groups: Group[] = [
  {
    id: 'templates',
    title: 'Os três templates e a paleta Ardósia',
    description: 'Cada template tem formato, fonte, símbolo e paleta próprios.',
    shape: 'wide',
    items: [
      ...models.flatMap((k) => [
        { file: `${k}-painel`, caption: `${names[k]}: painel`, code: `${T[k]}-${C[k]}-M3` },
        {
          file: `${k}-clientes`,
          caption: `${names[k]}: listagem de clientes`,
          code: `${T[k]}-${C[k]}-M1`,
        },
      ]),
      { file: 'ardosia-painel', caption: 'Ardósia: painel', code: 'T2-C4-M3' },
      { file: 'ardosia-clientes', caption: 'Ardósia: listagem de clientes', code: 'T2-C4-M1' },
    ],
  },
  {
    id: 'menus',
    title: 'Tipos de menu',
    description: 'Seis combinações de posição, estado da sidebar e submenu (M1 a M6).',
    shape: 'wide',
    items: menuCodes.map((m) => ({
      file: `menu-${m.code.toLowerCase()}`,
      caption: `${m.code}: ${m.name}`,
      code: `T1-C1-${m.code}`,
    })),
  },
  {
    id: 'componentes',
    title: 'Atendimento, painel, agenda e kanban',
    description:
      'Chat omnichannel, painel em widgets ajustáveis, calendário, agenda e funil em kanban.',
    shape: 'wide',
    items: [
      { file: 'safira-atendimento', caption: 'Atendimento omnichannel', code: 'T1-C1-M1' },
      { file: 'aurora-atendimento-mobile', caption: 'Atendimento no celular', code: 'T3-C3' },
      {
        file: 'safira-dashboard-ajuste',
        caption: 'Painel com widgets ajustáveis',
        code: 'T1-C1-M1',
      },
      { file: 'safira-calendario', caption: 'Calendário do mês', code: 'T1-C1-M1' },
      { file: 'equilibrio-agenda', caption: 'Agenda da semana', code: 'T2-C2-M1' },
      { file: 'aurora-kanban', caption: 'Kanban com cards', code: 'T3-C3-M1' },
      { file: 'safira-kanban-mobile', caption: 'Kanban no celular', code: 'T1-C1-M1' },
    ],
  },
  {
    id: 'matriz',
    title: 'Modelo × paleta de cores',
    description:
      'Qualquer modelo aceita qualquer paleta: 12 combinações na mesma tela de detalhe do cliente.',
    shape: 'wide',
    items: models.flatMap((m) =>
      palettes.map((p) => ({
        file: `matriz-${m}-${p}`,
        caption: `Modelo ${names[m]} com paleta ${names[p]}`,
        code: `${T[m]}-${C[p]}`,
      })),
    ),
  },
  {
    id: 'celular',
    title: 'No celular',
    description: 'Mesmo componente, mesma API: a tabela vira cards e a sidebar vira gaveta.',
    shape: 'tall',
    items: [
      { file: 'safira-mobile', caption: 'Safira no celular', code: 'T1-C1' },
      { file: 'equilibrio-mobile', caption: 'Equilíbrio no celular', code: 'T2-C2' },
      { file: 'aurora-mobile', caption: 'Aurora no celular', code: 'T3-C3' },
      { file: 'equilibrio-mobile-tabela', caption: 'Tabela reconstruída em cards', code: 'T2-C2' },
    ],
  },
  {
    id: 'outras',
    title: 'Modo escuro e outras telas',
    description: 'Modo escuro, drawer com rodapé fixo, mega menu e login.',
    shape: 'wide',
    items: [
      { file: 'safira-escuro', caption: 'Modo escuro (Safira)', code: 'T1-C1-M3' },
      { file: 'equilibrio-escuro', caption: 'Modo escuro (Equilíbrio)', code: 'T2-C2-M1' },
      { file: 'safira-drawer', caption: 'Drawer com rodapé fixo (30/70)', code: 'T1-C1-M1' },
      { file: 'aurora-mega-menu', caption: 'Mega menu no menu superior', code: 'T3-C3-M6' },
      { file: 'aurora-login', caption: 'Login (Aurora)', code: 'T3-C3' },
    ],
  },
]

// Lista única, na ordem da página: o visualizador passa de um grupo para o outro.
const all: (ViewerImage & { group: string; code?: string; file: string })[] = groups.flatMap((g) =>
  g.items
    .filter((i) => url(i.file))
    .map((i) => ({
      src: url(i.file),
      alt: i.caption,
      caption: i.code ? `${i.caption} · ${i.code}` : i.caption,
      group: g.id,
      code: i.code,
      file: i.file,
    })),
)

/**
 * Monte seu código: cada escolha já muda o sistema na hora (tema, cores e menu), sem sair
 * da galeria. O código mostrado é sempre o do que está aplicado agora.
 */
function CodeBuilder() {
  const { brand, palette, setBrandId, setPaletteId } = useBrand()
  const { layout, applyLayout, resetLayout } = useShell()
  const [copied, setCopied] = useState(false)

  const theme = themeCodes.find((t) => t.brand === brand.id)?.code ?? 'T1'
  const color = colorCodes.find((c) => c.palette === palette.id)?.code ?? 'C1'
  const menu =
    menuCodes.find((m) =>
      Object.entries(m.layout).every(([k, v]) => layout[k as keyof typeof layout] === v),
    )?.code ?? ''
  const code = currentModelCode(brand.id, palette.id, layout)

  const setTheme = (t: string) => {
    const next = themeCodes.find((x) => x.code === t)
    if (!next) return
    // Trocar o tema volta as cores para as dele; mantém a paleta escolhida, se houver.
    const keep = colorCodes.find((c) => c.code === color)?.palette
    setBrandId(next.brand)
    if (keep) setPaletteId(keep)
  }
  const setColor = (c: string) => {
    const next = colorCodes.find((x) => x.code === c)
    if (next) setPaletteId(next.palette)
  }
  const setMenu = (m: string) => {
    const next = menuCodes.find((x) => x.code === m)
    if (next) applyLayout(next.layout)
  }
  const restore = () => {
    setBrandId('safira')
    resetLayout()
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.info(`Código: ${code}`)
    }
  }
  return (
    <Card>
      <CardContent className="flex flex-col gap-6 pt-6">
        <Grid cols={{ base: 1, md: 3 }} gap="fields">
          <Field label="Tema (T)" help="Formato e fonte.">
            <Select
              label="Tema"
              value={theme}
              onChange={(v) => v && setTheme(v)}
              options={themeCodes.map((t) => ({
                value: t.code,
                label: `${t.code} · ${t.name}`,
                description: t.description,
              }))}
            />
          </Field>
          <Field label="Cores (C)" help="Paleta, sidebar e degradês.">
            <Select
              label="Cores"
              value={color}
              onChange={(v) => v && setColor(v)}
              options={colorCodes.map((c) => ({
                value: c.code,
                label: `${c.code} · ${c.name}`,
                description: c.description,
              }))}
            />
          </Field>
          <Field label="Menu (M)" help="Posição, sidebar e submenu.">
            <Select
              label="Menu"
              value={menu || null}
              placeholder="Personalizado"
              onChange={(v) => v && setMenu(v)}
              options={menuCodes.map((m) => ({
                value: m.code,
                label: `${m.code} · ${m.name}`,
                description: m.description,
              }))}
            />
          </Field>
        </Grid>
        <div className="flex flex-col gap-4 rounded-surface bg-muted p-4 md:flex-row md:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-sm text-muted-foreground">Código aplicado agora</span>
            <span className="font-mono text-2xl font-semibold tracking-wide">{code}</span>
            <span className="text-sm text-muted-foreground">
              As mudanças já aparecem no sistema inteiro. Informe este código no briefing e a IA
              aplica o mesmo tema, as mesmas cores e o mesmo menu no seu projeto.
            </span>
          </div>
          <div className="grid grid-actions-2 gap-3 md:flex">
            <Button variant="outline" icon={<RotateCcw />} onClick={restore}>
              Padrão
            </Button>
            <Button icon={copied ? <Check /> : <Copy />} onClick={copy}>
              {copied ? 'Copiado' : 'Copiar código'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/** ?imagem=nome-do-arquivo abre a galeria já com essa imagem em popup (links do README). */
function initialImage() {
  const name = new URLSearchParams(window.location.search).get('imagem')
  const i = name ? all.findIndex((img) => img.file === name) : -1
  return i >= 0 ? i : null
}

export function GalleryPage() {
  const [open, setOpen] = useState<number | null>(initialImage)

  return (
    <Container padded>
      <Stack gap="section">
        <PageHeader
          title="Galeria"
          description="Capturas do app real em todos os templates, cores e menus. Toque em uma imagem para ampliar; use as setas para passar. O código de cada captura aplica o mesmo modelo no seu projeto."
        />
        <Section
          id="codigos"
          title="Monte seu código"
          description="Escolha tema, cores e menu. O código resume a escolha: use no briefing ou veja aplicado no demo."
        >
          <CodeBuilder />
        </Section>
        {groups.map((g) =>
          all.some((img) => img.group === g.id) ? (
            <Section key={g.id} id={g.id} title={g.title} description={g.description}>
              <Grid
                cols={g.shape === 'tall' ? { base: 2, md: 4 } : { base: 1, sm: 2, xl: 3 }}
                gap="4"
              >
                {all.map((img, i) =>
                  img.group !== g.id ? null : (
                    <button
                      key={img.src}
                      type="button"
                      onClick={() => setOpen(i)}
                      aria-label={`Ampliar: ${img.caption}`}
                      className="group flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-surface border bg-card text-left shadow-sm transition-shadow outline-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="relative block overflow-hidden border-b bg-muted">
                        <img
                          src={img.src}
                          alt=""
                          loading="lazy"
                          className={cn(
                            'w-full object-cover object-top transition-transform duration-300 group-hover:scale-102 motion-reduce:transition-none',
                            g.shape === 'tall' ? 'aspect-9/16' : 'aspect-video',
                          )}
                        />
                        <span
                          aria-hidden
                          className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-item bg-card/90 text-foreground shadow-sm [&_svg]:size-icon-sm"
                        >
                          <Maximize2 />
                        </span>
                      </span>
                      <span className="flex min-w-0 items-center gap-2 px-3 py-2">
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {img.alt}
                        </span>
                        {img.code && (
                          <Badge tone="neutral" className="shrink-0 font-mono">
                            {img.code}
                          </Badge>
                        )}
                      </span>
                    </button>
                  ),
                )}
              </Grid>
            </Section>
          ) : null,
        )}
      </Stack>
      <ImageViewer images={all} index={open} onIndexChange={setOpen} />
    </Container>
  )
}

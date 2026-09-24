import { Maximize2 } from 'lucide-react'
import { useState } from 'react'
import { Container, Grid, PageHeader, Section, Stack } from '@/components/layout'
import { ImageViewer, type ViewerImage } from '@/components/ui/image-viewer'
import { cn } from '@/lib/cn'

/*
 * GALERIA /galeria: as capturas do README (docs/images), abertas por cima da tela no
 * ImageViewer, sem sair da página. As imagens são geradas com npm run docs:images.
 */

const files = import.meta.glob<string>('../../docs/images/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})
const url = (name: string) => files[`../../docs/images/${name}.png`] ?? ''

const models = { safira: 'Safira', equilibrio: 'Equilíbrio', aurora: 'Aurora', ardosia: 'Ardósia' }
type Key = keyof typeof models

interface Group {
  id: string
  title: string
  description: string
  /** Proporção da miniatura: telas de desktop ou de celular. */
  shape: 'wide' | 'tall'
  items: { file: string; caption: string }[]
}

const groups: Group[] = [
  {
    id: 'templates',
    title: 'Os três templates e a paleta Ardósia',
    description: 'Cada template tem formato, fonte, símbolo e paleta próprios.',
    shape: 'wide',
    items: (['safira', 'equilibrio', 'aurora', 'ardosia'] as Key[]).flatMap((k) => [
      { file: `${k}-painel`, caption: `${models[k]}: painel` },
      { file: `${k}-clientes`, caption: `${models[k]}: listagem de clientes` },
    ]),
  },
  {
    id: 'matriz',
    title: 'Modelo × paleta de cores',
    description:
      'Qualquer modelo aceita qualquer paleta: 12 combinações na mesma tela de detalhe do cliente.',
    shape: 'wide',
    items: (['safira', 'equilibrio', 'aurora'] as Key[]).flatMap((m) =>
      (['safira', 'equilibrio', 'aurora', 'ardosia'] as Key[]).map((p) => ({
        file: `matriz-${m}-${p}`,
        caption: `Modelo ${models[m]} com paleta ${models[p]}`,
      })),
    ),
  },
  {
    id: 'celular',
    title: 'No celular',
    description: 'Mesmo componente, mesma API: a tabela vira cards e a sidebar vira gaveta.',
    shape: 'tall',
    items: [
      { file: 'safira-mobile', caption: 'Safira no celular' },
      { file: 'equilibrio-mobile', caption: 'Equilíbrio no celular' },
      { file: 'aurora-mobile', caption: 'Aurora no celular' },
      { file: 'equilibrio-mobile-tabela', caption: 'Tabela reconstruída em cards' },
    ],
  },
  {
    id: 'outras',
    title: 'Modo escuro e outras telas',
    description: 'Modo escuro, drawer com rodapé fixo, mega menu e login.',
    shape: 'wide',
    items: [
      { file: 'safira-escuro', caption: 'Modo escuro (Safira)' },
      { file: 'equilibrio-escuro', caption: 'Modo escuro (Equilíbrio)' },
      { file: 'safira-drawer', caption: 'Drawer com rodapé fixo (30/70)' },
      { file: 'aurora-mega-menu', caption: 'Mega menu no menu superior' },
      { file: 'aurora-login', caption: 'Login (Aurora)' },
    ],
  },
]

// Lista única, na ordem da página: o visualizador passa de um grupo para o outro.
const all: (ViewerImage & { group: string })[] = groups.flatMap((g) =>
  g.items
    .filter((i) => url(i.file))
    .map((i) => ({ src: url(i.file), alt: i.caption, caption: i.caption, group: g.id })),
)

export function GalleryPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <Container>
      <Stack gap="12">
        <PageHeader
          title="Galeria"
          description="Capturas do app real em todos os templates e paletas. Toque em uma imagem para ampliar; use as setas para passar."
        />
        {groups.map((g) => (
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
                    <span className="truncate px-3 py-2 text-sm font-medium">{img.caption}</span>
                  </button>
                ),
              )}
            </Grid>
          </Section>
        ))}
      </Stack>
      <ImageViewer images={all} index={open} onIndexChange={setOpen} />
    </Container>
  )
}

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Container, Grid, PageHeader, Stack } from '@/components/layout'
import { ActionBar } from '@/components/ui/action-bar'
import { Calendar, type CalendarEvent } from '@/components/ui/calendar'
import { Drawer } from '@/components/ui/drawer'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toast'
import { demoEvents } from '@/mocks/planning'

/**
 * Agenda: o Calendar com as visões mês, semana, dia e agenda. Clicar num horário vazio
 * abre o Drawer de novo evento já com a data; clicar num evento abre o detalhe.
 */
export function AgendaPage() {
  const events = useMemo(() => demoEvents(), [])
  const [creating, setCreating] = useState<Date | null>(null)
  const [viewing, setViewing] = useState<CalendarEvent | null>(null)

  return (
    <Container padded>
      <Stack gap="section">
        <PageHeader title="Agenda" />
        <Calendar
          aria-label="Agenda da equipe"
          events={events}
          onDateClick={setCreating}
          onEventClick={setViewing}
        />
      </Stack>

      <Drawer
        open={creating !== null}
        onOpenChange={(o) => !o && setCreating(null)}
        icon={<CalendarPlus />}
        title="Novo evento"
        description={
          creating ? format(creating, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR }) : undefined
        }
        footer={
          <ActionBar
            cancel={{ label: 'Cancelar', onClick: () => setCreating(null) }}
            primary={{
              label: 'Salvar evento',
              onClick: () => {
                setCreating(null)
                toast.success('Evento salvo')
              },
            }}
          />
        }
      >
        <Grid cols={{ base: 1 }} gap="fields">
          <Field label="Título" required>
            <Input />
          </Field>
          <Field label="Local">
            <Input />
          </Field>
          <Field label="Observações">
            <Textarea />
          </Field>
        </Grid>
      </Drawer>

      <Drawer
        open={viewing !== null}
        onOpenChange={(o) => !o && setViewing(null)}
        title={viewing?.title ?? 'Evento'}
        description={
          viewing
            ? viewing.allDay
              ? `${format(viewing.start, "EEEE, d 'de' MMMM", { locale: ptBR })}, dia inteiro`
              : `${format(viewing.start, "EEEE, d 'de' MMMM, HH:mm", { locale: ptBR })} às ${format(viewing.end ?? viewing.start, 'HH:mm')}`
            : undefined
        }
        footer={<ActionBar primary={{ label: 'Fechar', onClick: () => setViewing(null) }} />}
      >
        <p className="text-sm text-muted-foreground">
          {viewing?.location ? `Local: ${viewing.location}` : 'Sem local definido.'}
        </p>
      </Drawer>
    </Container>
  )
}

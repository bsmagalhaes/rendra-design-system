import { Command } from 'cmdk'
import { Moon, Plus, Search, Sun, X } from 'lucide-react'
import { Dialog, VisuallyHidden } from 'radix-ui'
import { useNavigate } from 'react-router'
import { useBrand } from '@/brand'
import { navigationTargets } from '@/config/navigation'
import { cn } from '@/lib/cn'
import { useShell } from './shell-context'

/*
 * Busca global (Ctrl+K / Cmd+K). Desktop: painel centralizado.
 * Mobile: tela cheia, com o campo no topo e a lista ocupando o resto.
 */

const itemClass =
  'flex min-h-touch cursor-pointer items-center gap-3 rounded-item px-3 text-sm outline-none select-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground md:min-h-0 md:h-control-md [&_svg]:size-icon-sm [&_svg]:shrink-0 [&_svg]:text-muted-foreground'

const groupClass =
  '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground'

export function CommandSearch() {
  const { searchOpen, setSearchOpen } = useShell()
  const { resolvedMode, setMode } = useBrand()
  const navigate = useNavigate()

  const run = (fn: () => void) => {
    setSearchOpen(false)
    fn()
  }

  const groups = navigationTargets.reduce<Record<string, typeof navigationTargets>>((acc, t) => {
    ;(acc[t.group] ??= []).push(t)
    return acc
  }, {})

  return (
    <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed inset-0 z-50 flex flex-col bg-popover text-popover-foreground outline-none',
            'md:inset-auto md:top-24 md:left-1/2 md:w-full md:max-w-xl md:-translate-x-1/2 md:rounded-surface md:border md:shadow-lg',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 md:data-[state=open]:zoom-in-95',
          )}
        >
          <VisuallyHidden.Root>
            <Dialog.Title>Busca global</Dialog.Title>
          </VisuallyHidden.Root>
          <Command label="Busca global" className="flex min-h-0 flex-1 flex-col" loop>
            <div className="flex shrink-0 items-center gap-2 border-b px-4 pt-safe md:pt-0">
              <Search className="size-icon-md shrink-0 text-muted-foreground" aria-hidden />
              <Command.Input
                autoFocus
                placeholder="Buscar telas e ações..."
                className="h-control-lg min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
              />
              <Dialog.Close
                aria-label="Fechar busca"
                className="-mr-2 flex size-touch shrink-0 items-center justify-center rounded-item text-muted-foreground hover:bg-accent md:hidden"
              >
                <X className="size-icon-md" aria-hidden />
              </Dialog.Close>
              <kbd className="hidden rounded-item border bg-muted px-2 text-xs text-muted-foreground md:inline">
                Esc
              </kbd>
            </div>
            <Command.List className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 md:max-h-command md:flex-none">
              <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
                Nada encontrado para essa busca.
              </Command.Empty>
              <Command.Group heading="Ações" className={groupClass}>
                <Command.Item
                  className={itemClass}
                  onSelect={() => run(() => navigate('/clientes/novo'))}
                >
                  <Plus aria-hidden />
                  Novo cliente
                </Command.Item>
                <Command.Item
                  className={itemClass}
                  onSelect={() => run(() => setMode(resolvedMode === 'dark' ? 'light' : 'dark'))}
                >
                  {resolvedMode === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />}
                  {resolvedMode === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'}
                </Command.Item>
              </Command.Group>
              {Object.entries(groups).map(([group, targets]) => (
                <Command.Group key={group} heading={group} className={groupClass}>
                  {targets.map((t) => {
                    const Icon = t.icon
                    return (
                      <Command.Item
                        key={t.to}
                        value={`${t.title} ${group}`}
                        className={itemClass}
                        onSelect={() => run(() => navigate(t.to))}
                      >
                        <Icon aria-hidden />
                        {t.title}
                      </Command.Item>
                    )
                  })}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

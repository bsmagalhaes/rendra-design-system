/*
 * LAYOUT DO APPSHELL
 * O tipo, o padrão interno (defaultShellLayout) e os rótulos das opções (layoutOptions)
 * agora vivem em src/components/app-shell/layout.ts: o AppShell nunca importa @/config.
 * Este arquivo reexporta para o boilerplate (src/routes.tsx), para a tela de Configurações
 * e para as predefinições de src/config/presets.ts.
 *
 * O projeto passa a escolha do briefing (bloco 4) como prop: <AppShell layout={shellLayout}>.
 * Sem sobrescrita aqui, valem os mesmos valores como padrão interno do AppShell.
 */
import { defaultShellLayout, layoutOptions, type ShellLayout } from '@/components/app-shell/layout'

export { defaultShellLayout, layoutOptions, type ShellLayout }

/** Layout escolhido no briefing deste projeto, passado para <AppShell layout={shellLayout}>. */
export const shellLayout: Partial<ShellLayout> = { ...defaultShellLayout }

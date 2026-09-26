import { Plus, Settings, User } from 'lucide-react'
import { Outlet } from 'react-router'
import { AppShell } from '@/components/app-shell/app-shell'
import { useRendraNavigate } from '@/components/rendra-provider'
import { shellLayout } from '@/config/layout'
import { currentUser, navigation } from '@/config/navigation'
import { notificationItems } from '@/mocks/notifications'

/*
 * Ligação do AppShell ao boilerplate: menu, layout, usuário, menu do avatar, ação rápida
 * da busca global e notificações vêm daqui, nunca de dentro do AppShell. Elemento das
 * rotas com AppShell (src/routes.tsx), dentro do <RendraRouterBridge>.
 */
export function AppLayout() {
  const { navigate } = useRendraNavigate()

  return (
    <AppShell
      navigation={navigation}
      layout={shellLayout}
      user={currentUser}
      userMenuItems={[
        { label: 'Meu perfil', to: '/configuracoes', icon: User },
        { label: 'Configurações', to: '/configuracoes', icon: Settings },
      ]}
      onLogout={() => navigate('/login')}
      quickActions={[{ label: 'Novo cliente', to: '/clientes/novo', icon: Plus }]}
      notifications={{ items: notificationItems }}
    >
      <Outlet />
    </AppShell>
  )
}

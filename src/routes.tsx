import type { RouteObject } from 'react-router'
import { AppShell } from '@/components/app-shell/app-shell'
import type { RouteHandle } from '@/components/app-shell/header'
import { ErrorPage } from '@/components/ui/error-page'
import { ClientDetailPage } from '@/pages/app/client-detail-page'
import { ClientFormPage } from '@/pages/app/client-form-page'
import { ClientWizardPage } from '@/pages/app/client-wizard-page'
import { ClientsListPage } from '@/pages/app/clients-list-page'
import { DashboardPage } from '@/pages/app/dashboard-page'
import { SettingsPage } from '@/pages/app/settings-page'
import { TasksPage } from '@/pages/app/tasks-page'
import {
  ForgotPasswordPage,
  LoginPage,
  ResetPasswordPage,
  SignupPage,
  VerifyCodePage,
} from '@/pages/auth/auth-pages'
import { ComponentsPage } from '@/pages/components-page'
import { TokensPage } from '@/pages/tokens-page'

const h = (crumb: RouteHandle['crumb']): RouteHandle => ({ crumb })

/** Rotas da aplicação. Os testes de layout percorrem todas as rotas listadas em publicRoutes. */
export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    errorElement: <ErrorPage code={500} fullScreen />,
    children: [
      { index: true, handle: h('Painel'), element: <DashboardPage /> },
      {
        path: 'clientes',
        handle: h('Clientes'),
        children: [
          { index: true, element: <ClientsListPage /> },
          { path: 'novo', handle: h('Novo cliente'), element: <ClientFormPage /> },
          { path: ':id', handle: h('Detalhe do cliente'), element: <ClientDetailPage /> },
        ],
      },
      { path: 'cadastro', handle: h('Cadastro guiado'), element: <ClientWizardPage /> },
      { path: 'tarefas', handle: h('Tarefas'), element: <TasksPage /> },
      { path: 'configuracoes', handle: h('Configurações'), element: <SettingsPage /> },
      { path: 'componentes', handle: h('Componentes'), element: <ComponentsPage /> },
      { path: 'tokens', handle: h('Tokens'), element: <TokensPage /> },
      { path: '*', handle: h('Página não encontrada'), element: <ErrorPage code={404} /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/esqueci-senha', element: <ForgotPasswordPage /> },
  { path: '/verificacao', element: <VerifyCodePage /> },
  { path: '/nova-senha', element: <ResetPasswordPage /> },
  { path: '/cadastre-se', element: <SignupPage /> },
]

export { publicRoutes } from '@/config/routes-list'

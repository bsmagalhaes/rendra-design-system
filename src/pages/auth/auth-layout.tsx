import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useBrand } from '@/brand'
import { Stack } from '@/components/layout'
import { BrandLogo } from '@/components/ui/brand-logo'
import { cn } from '@/lib/cn'

/**
 * Layout das telas de autenticação (fora do AppShell).
 * Desktop: painel da marca com o degradê forte (único da tela) e o formulário ao lado.
 * Mobile: só o formulário, com o logotipo no topo. Desenhado primeiro para 360px.
 */
export function AuthLayout({
  title,
  description,
  back,
  children,
  footer,
  width = 'sm',
}: {
  title: string
  description?: ReactNode
  /** Link de voltar acima do título. */
  back?: { to: string; label: string }
  children: ReactNode
  /** Texto abaixo do formulário (ex.: "Não tem conta? Cadastre-se"). */
  footer?: ReactNode
  /** sm: uma coluna (login, senha); md: largura para duas colunas (cadastro). */
  width?: 'sm' | 'md'
}) {
  const { brand } = useBrand()

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      {/* Texto embaixo à esquerda; o ponto de luz do degradê fica no alto à direita */}
      <aside className="hidden flex-col justify-between bg-gradient-brand p-12 text-gradient-brand-foreground lg:flex">
        <BrandLogo on="brand" className="self-start" />
        <Stack gap="4" className="max-w-md">
          <p className="text-3xl font-semibold tracking-tight">{brand.tagline}</p>
          <p className="text-base opacity-80">Acesse sua conta para continuar de onde parou.</p>
        </Stack>
        <span className="text-sm opacity-70">
          © {new Date().getFullYear()} {brand.companyName}
        </span>
      </aside>

      <main className="flex min-w-0 items-start justify-center px-4 pt-safe pb-12 md:items-center md:px-8">
        <Stack
          gap="8"
          className={cn('w-full pt-8 md:pt-0', width === 'md' ? 'max-w-xl' : 'max-w-sm')}
        >
          <BrandLogo on="surface" className="self-start lg:hidden" />
          <Stack gap="3">
            {back && (
              <Link
                to={back.to}
                className="-ml-2 flex min-h-touch items-center gap-1 self-start rounded-item px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary-text md:min-h-0 md:py-1"
              >
                <ArrowLeft className="size-icon-sm" aria-hidden />
                {back.label}
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </Stack>
          {children}
          {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
        </Stack>
      </main>
    </div>
  )
}

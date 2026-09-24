import { Slot } from 'radix-ui'
import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import {
  alignClass,
  fieldGridClass,
  gapClass,
  justifyClass,
  type Align,
  type Justify,
  type Space,
} from './tokens'

/*
 * Primitivas de layout. Toda tela é composta por elas; classes de layout soltas
 * (flex, grid, gap, padding de página) nas telas são erro de revisão.
 */

interface BaseProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  asChild?: boolean
}

function Box({ as: As = 'div', asChild, ...props }: BaseProps) {
  const Comp: ElementType = asChild ? Slot.Root : As
  return <Comp {...props} />
}

// ---------------------------------------------------------------- Container

const containerSize = {
  narrow: 'max-w-3xl',
  // Largura toda da área de conteúdo, com o mesmo respiro em todos os lados (16px/24px).
  default: 'max-w-none',
  full: 'max-w-none',
} as const

export interface ContainerProps extends BaseProps {
  /** narrow: leitura e formulários; default: telas de sistema; full: sem limite. */
  size?: keyof typeof containerSize
  /** Respiro vertical de página (topo e base). Use no contêiner raiz de cada tela. */
  padded?: boolean
}

/** Largura máxima e padding lateral de página: 16px no mobile, 24px no tablet, 32px no desktop. */
export function Container({
  size = 'default',
  padded = false,
  className,
  ...props
}: ContainerProps) {
  return (
    <Box
      className={cn(
        'mx-auto w-full min-w-0 px-4 md:px-6',
        // Respiro igual em todos os lados: 16px no celular e 24px a partir do tablet.
        padded && 'py-4 md:py-6',
        containerSize[size],
        className,
      )}
      {...props}
    />
  )
}

// ---------------------------------------------------------------- Stack

export interface StackProps extends BaseProps {
  gap?: Space
  align?: Align
}

/** Empilha na vertical. gap="section" para separar seções de página. */
export function Stack({ gap = '4', align = 'stretch', className, ...props }: StackProps) {
  return (
    <Box
      className={cn('flex min-w-0 flex-col', gapClass[gap], alignClass[align], className)}
      {...props}
    />
  )
}

// ---------------------------------------------------------------- Inline

const smAlignClass: Record<Align, string> = {
  start: 'sm:items-start',
  center: 'sm:items-center',
  end: 'sm:items-end',
  stretch: 'sm:items-stretch',
  baseline: 'sm:items-baseline',
}

export interface InlineProps extends BaseProps {
  gap?: Space
  align?: Align
  justify?: Justify
  /** Quebra linha quando falta espaço (padrão). Com false, os filhos precisam poder encolher. */
  wrap?: boolean
  /** Empilha no mobile e alinha em linha a partir de sm. */
  stackOnMobile?: boolean
}

/** Alinha na horizontal, quebrando linha por padrão para nunca estourar a largura. */
export function Inline({
  gap = '2',
  align = 'center',
  justify = 'start',
  wrap = true,
  stackOnMobile = false,
  className,
  ...props
}: InlineProps) {
  return (
    <Box
      className={cn(
        'flex min-w-0',
        stackOnMobile ? 'flex-col items-stretch sm:flex-row' : 'flex-row',
        stackOnMobile ? smAlignClass[align] : alignClass[align],
        wrap && 'flex-wrap',
        gapClass[gap],
        justifyClass[justify],
        className,
      )}
      {...props}
    />
  )
}

// ---------------------------------------------------------------- Grid

type Cols = 1 | 2 | 3 | 4 | 6
const colsBase: Record<Cols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
}
const colsSm: Record<Cols, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  6: 'sm:grid-cols-6',
}
const colsMd: Record<Cols, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  6: 'md:grid-cols-6',
}
const colsLg: Record<Cols, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  6: 'lg:grid-cols-6',
}
const colsXl: Record<Cols, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  6: 'xl:grid-cols-6',
}
// Container queries: a grade responde à largura do bloco onde está, não da tela.
const colsCqSm: Record<Cols, string> = {
  1: '@sm:grid-cols-1',
  2: '@sm:grid-cols-2',
  3: '@sm:grid-cols-3',
  4: '@sm:grid-cols-4',
  6: '@sm:grid-cols-6',
}
const colsCqMd: Record<Cols, string> = {
  1: '@2xl:grid-cols-1',
  2: '@2xl:grid-cols-2',
  3: '@2xl:grid-cols-3',
  4: '@2xl:grid-cols-4',
  6: '@2xl:grid-cols-6',
}
const colsCqLg: Record<Cols, string> = {
  1: '@4xl:grid-cols-1',
  2: '@4xl:grid-cols-2',
  3: '@4xl:grid-cols-3',
  4: '@4xl:grid-cols-4',
  6: '@4xl:grid-cols-6',
}
const colsCqXl: Record<Cols, string> = {
  1: '@6xl:grid-cols-1',
  2: '@6xl:grid-cols-2',
  3: '@6xl:grid-cols-3',
  4: '@6xl:grid-cols-4',
  6: '@6xl:grid-cols-6',
}

export interface GridProps extends BaseProps {
  /** Colunas por faixa. O padrão no mobile é sempre 1. */
  cols?: { base?: Cols; sm?: Cols; md?: Cols; lg?: Cols; xl?: Cols }
  gap?: Space
  /**
   * 'container' faz as colunas reagirem à largura do próprio bloco (@container),
   * útil dentro de drawers, cards laterais e colunas estreitas.
   */
  responsive?: 'screen' | 'container'
  /**
   * Grade de formulário: 12 colunas pela largura do bloco, com a largura de cada Field no
   * span (padrão 3 por linha). Ignora cols e responsive; o gap padrão vira "fields".
   */
  form?: boolean
}

export function Grid({
  cols = { base: 1 },
  gap = '4',
  responsive = 'screen',
  form,
  className,
  children,
  ...props
}: GridProps) {
  if (form) {
    return (
      <Box className={cn('@container min-w-0', className)} {...props}>
        <div className={cn(fieldGridClass, gapClass[gap === '4' ? 'fields' : gap])}>{children}</div>
      </Box>
    )
  }
  const cq = responsive === 'container'
  const grid = cn(
    'grid min-w-0',
    colsBase[cols.base ?? 1],
    cols.sm && (cq ? colsCqSm : colsSm)[cols.sm],
    cols.md && (cq ? colsCqMd : colsMd)[cols.md],
    cols.lg && (cq ? colsCqLg : colsLg)[cols.lg],
    cols.xl && (cq ? colsCqXl : colsXl)[cols.xl],
    gapClass[gap],
  )
  if (cq) {
    return (
      <Box className={cn('@container min-w-0', className)} {...props}>
        <div className={grid}>{children}</div>
      </Box>
    )
  }
  return (
    <Box className={cn(grid, className)} {...props}>
      {children}
    </Box>
  )
}

// ---------------------------------------------------------------- Section

export interface SectionProps extends Omit<BaseProps, 'title'> {
  title?: ReactNode
  description?: ReactNode
  /** Ações do cabeçalho da seção, à direita no desktop e abaixo do título no mobile. */
  actions?: ReactNode
  /** Nível do título. Padrão h2. */
  level?: 2 | 3
  gap?: Space
}

/** Seção de página com título, descrição e ações. Espaço interno padrão de 16px. */
export function Section({
  title,
  description,
  actions,
  level = 2,
  gap = '4',
  className,
  children,
  id,
  ...props
}: SectionProps) {
  const H = level === 2 ? 'h2' : 'h3'
  const titleId = id ? `${id}-titulo` : undefined
  return (
    <Box
      as="section"
      id={id}
      aria-labelledby={title ? titleId : undefined}
      className={cn('flex min-w-0 scroll-mt-6 flex-col', gapClass[gap], className)}
      {...props}
    >
      {(title || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            {title && (
              <H id={titleId} className={level === 2 ? 'text-xl' : 'text-lg'}>
                {title}
              </H>
            )}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </Box>
  )
}

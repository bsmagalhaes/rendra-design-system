import type { Decorator, Preview } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import { activeBrand, availableBrands, availablePalettes, BrandProvider } from '../src/brand'
import { Toaster } from '../src/components/ui/toast'
import { TooltipProvider } from '../src/components/ui/tooltip'
import '../src/styles/globals.css'

/*
 * Toolbar: template (modelo), paleta de cores e modo claro/escuro.
 * Viewport: mobile por padrão, com tablet e desktop.
 * Stories de página usam o próprio roteador: parameters.router = false.
 */

const withProviders: Decorator = (Story, ctx) => {
  const { template, palette, mode } = ctx.globals as {
    template: string
    palette: string
    mode: 'light' | 'dark'
  }
  const content = <Story />
  return (
    <BrandProvider
      brands={availableBrands}
      palettes={availablePalettes}
      defaultBrand={activeBrand}
      forcedBrandId={template}
      forcedPaletteId={palette === 'modelo' ? undefined : palette}
      forcedMode={mode}
    >
      <TooltipProvider>
        {ctx.parameters.router === false ? content : <MemoryRouter>{content}</MemoryRouter>}
      </TooltipProvider>
      <Toaster />
    </BrandProvider>
  )
}

const preview: Preview = {
  decorators: [withProviders],
  globalTypes: {
    template: {
      description: 'Modelo (formato, fonte e símbolo)',
      toolbar: {
        title: 'Template',
        icon: 'component',
        items: [
          { value: 'safira', title: 'Rendra Safira (quadrado)' },
          { value: 'equilibrio', title: 'Rendra Equilíbrio (meio-termo)' },
          { value: 'aurora', title: 'Rendra Aurora (arredondado)' },
        ],
        dynamicTitle: true,
      },
    },
    palette: {
      description: 'Paleta de cores',
      toolbar: {
        title: 'Paleta',
        icon: 'paintbrush',
        items: [
          { value: 'modelo', title: 'Cores do modelo' },
          { value: 'safira', title: 'Safira' },
          { value: 'equilibrio', title: 'Equilíbrio' },
          { value: 'aurora', title: 'Aurora' },
          { value: 'ardosia', title: 'Ardósia' },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Modo claro ou escuro',
      toolbar: {
        title: 'Modo',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Claro', icon: 'sun' },
          { value: 'dark', title: 'Escuro', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    template: 'safira',
    palette: 'modelo',
    mode: 'light',
    viewport: { value: 'mobile', isRotated: false },
  },
  parameters: {
    layout: 'padded',
    viewport: {
      options: {
        mobile: {
          name: 'Celular (360)',
          styles: { width: '360px', height: '780px' },
          type: 'mobile',
        },
        mobile390: {
          name: 'Celular (390)',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet (768)',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop (1280)',
          styles: { width: '1280px', height: '800px' },
          type: 'desktop',
        },
        wide: {
          name: 'Desktop largo (1920)',
          styles: { width: '1920px', height: '1080px' },
          type: 'desktop',
        },
      },
    },
    controls: { expanded: true, sort: 'requiredFirst' },
    a11y: { test: 'todo' },
    options: {
      storySort: {
        order: [
          'Introdução',
          'Fundamentos',
          'Ações',
          'Formulário',
          'Navegação',
          'Dados',
          'Feedback',
          'Layout',
          'Telas',
        ],
      },
    },
  },
}
export default preview

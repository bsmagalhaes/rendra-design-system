import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Ensina o tailwind-merge sobre os tokens próprios, para que text-xs e text-primary-text
// não sejam tratados como conflito, e h-control-md substitua h-12 corretamente. text-label e
// text-help são tamanho (rótulo e orientação do campo); text-label-foreground é cor.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', 'label', 'help'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

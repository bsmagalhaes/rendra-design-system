/*
 * ENTRADA SEPARADA: RichTextEditor (rendra-ui/rich-text-editor)
 * ----------------------------------------------------------------
 * Fora da entrada principal (src/index.ts): depende de `@tiptap/*`, pesado, só entra no
 * bundle de quem realmente usa o editor de texto rico.
 */
export * from './components/ui/rich-text-editor'

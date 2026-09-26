/*
 * ENTRADA SEPARADA: DocumentViewer (rendra-ui/document-viewer)
 * --------------------------------------------------------------
 * Fora da entrada principal (src/index.ts): depende de `pdfjs-dist`, pesado, só entra no
 * bundle de quem realmente usa visualização de PDF.
 */
export * from './components/ui/document-viewer'

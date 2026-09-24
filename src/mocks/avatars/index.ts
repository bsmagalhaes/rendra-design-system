/* Retratos de demonstração (Unsplash, licença livre; ver CREDITOS.md). */
const files = import.meta.glob<string>('./p*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const demoPhotos: string[] = Object.keys(files)
  .sort()
  .map((k) => files[k] ?? '')
  .filter(Boolean)

/** Foto de demonstração pelo índice (repete quando acaba). */
export const photoAt = (i: number) => demoPhotos[i % demoPhotos.length]

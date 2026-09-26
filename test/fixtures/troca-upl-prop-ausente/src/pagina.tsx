// Fixture de teste (src/cli/trocar.test.ts): sem a prop layout, o elemento já é a variante
// padrão (UPL-001, lista); trocar para UPL-002 precisa inserir layout="gallery".
import { Upload } from '@rendra-ui/web'

export function Pagina() {
  return <Upload />
}

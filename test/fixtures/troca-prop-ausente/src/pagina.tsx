// Fixture de teste (src/cli/trocar.test.ts): sem a prop variant, o elemento já é a variante
// padrão (ABA-001, linha); trocar para ABA-002 precisa inserir a prop, não só reescrever.
import { Tabs } from 'rendra-ui'

export function Pagina() {
  return <Tabs>Conteúdo</Tabs>
}

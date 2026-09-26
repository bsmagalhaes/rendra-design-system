// Fixture de teste (src/cli/trocar.test.ts): a prop variant abaixo está explícita (ABA-002);
// trocar de volta para ABA-001 (a variante padrão do Tabs) remove a prop por completo.
import { Tabs } from '@rendra-ui/web'

export function Pagina() {
  return <Tabs variant="pill">Conteúdo</Tabs>
}

// Fixture de teste (src/cli/trocar.test.ts): DE e PARA de componentes diferentes (ABA-001,
// Tabs, para BTN-001, Button) nunca editam, só listam o elemento do componente DE para revisão.
import { Tabs } from 'rendra-ui'

export function Pagina() {
  return <Tabs variant="line">Conteúdo</Tabs>
}

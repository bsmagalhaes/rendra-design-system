import type { Meta, StoryObj } from '@storybook/react-vite'
import { BrandLogo } from '@/components/ui/brand-logo'
import { RendraCredit } from '@/components/ui/rendra-credit'

/* ------------------------------------------------ Crédito "Feito com Rendra" (CRED-001) */

const meta = {
  title: 'Marca/Crédito Feito com Rendra',
  component: RendraCredit,
  args: { credit: true },
} satisfies Meta<typeof RendraCredit>
export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {}
export const TextoELinkProprios: Story = {
  args: { text: 'Feito pela Acme', href: 'https://acme.com.br/sobre' },
}
export const Removido: Story = { args: { credit: false } }

/* ------------------------------------------------ BrandLogo (LOGO-001) */

export const Logotipo: Story = {
  name: 'BrandLogo: sobre fundo comum',
  render: () => <BrandLogo />,
}
export const LogotipoSobreDegrade: Story = {
  name: 'BrandLogo: sobre o degradê da marca',
  render: () => (
    <div className="rounded-surface bg-gradient-brand-foreground p-6">
      <BrandLogo on="brand" />
    </div>
  ),
}
export const LogotipoSoSimbolo: Story = {
  name: 'BrandLogo: só o símbolo',
  render: () => <BrandLogo symbolOnly />,
}

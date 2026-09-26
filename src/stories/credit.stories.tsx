import type { Meta, StoryObj } from '@storybook/react-vite'
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

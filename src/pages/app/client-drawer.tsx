import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Grid, Stack } from '@/components/layout'
import { ActionBar } from '@/components/ui/action-bar'
import { DatePicker } from '@/components/ui/date-picker'
import { Drawer } from '@/components/ui/drawer'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toast'

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

/* Drawer de criação e edição de cliente (volume médio: até ~12 campos). */
export function ClientDrawer({
  open,
  onOpenChange,
  mode = 'create',
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  mode?: 'create' | 'edit'
}) {
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const touch = () => setDirty(true)
  const save = async () => {
    setSaving(true)
    await wait(1000)
    setSaving(false)
    setDirty(false)
    onOpenChange(false)
    toast.success(mode === 'create' ? 'Cliente cadastrado' : 'Alterações salvas')
  }
  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        if (!o) setDirty(false)
        onOpenChange(o)
      }}
      dirty={dirty}
      size="md"
      icon={<UserPlus />}
      title={mode === 'create' ? 'Novo cliente' : 'Editar cliente'}
      description="Header e rodapé fixos; só o conteúdo rola."
      footer={
        <ActionBar
          cancel={{ label: 'Cancelar', onClick: () => onOpenChange(false) }}
          primary={{
            label: mode === 'create' ? 'Cadastrar' : 'Salvar',
            onClick: save,
            loading: saving,
          }}
        />
      }
    >
      <Stack gap="6">
        <Stack gap="2">
          <p className="text-sm font-semibold">Dados principais</p>
          <Grid cols={{ base: 1, md: 2 }} gap="fields" responsive="container">
            <Field label="Nome" required span="full">
              <Input onChange={touch} defaultValue={mode === 'edit' ? 'Padaria Bom Grão' : ''} />
            </Field>
            <Field label="CPF ou CNPJ" required>
              <Input mask="cpfCnpj" onChange={touch} />
            </Field>
            <Field label="Telefone">
              <Input mask="phone" onChange={touch} />
            </Field>
            <Field label="E-mail" span="full">
              <Input type="email" inputMode="email" onChange={touch} />
            </Field>
          </Grid>
        </Stack>
        <Separator />
        <Stack gap="2">
          <p className="text-sm font-semibold">Contrato</p>
          <Grid cols={{ base: 1, md: 2 }} gap="fields" responsive="container">
            <Field label="Segmento">
              <Select
                label="Segmento"
                onChange={touch}
                options={['Varejo', 'Saúde', 'Serviços'].map((s) => ({ value: s, label: s }))}
              />
            </Field>
            <Field label="Início">
              <DatePicker label="Início" onChange={touch} />
            </Field>
            <Field label="Valor mensal">
              <Input mask="currency" onChange={touch} />
            </Field>
            <Field label="CEP">
              <Input mask="cep" onChange={touch} />
            </Field>
            <Field label="Observações" span="full">
              <Textarea counter maxLength={200} onChange={touch} />
            </Field>
          </Grid>
        </Stack>
        <Separator />
        <Switch
          label="Enviar boas-vindas por e-mail"
          description="Com o link de acesso ao portal."
          defaultChecked
          onCheckedChange={touch}
        />
      </Stack>
    </Drawer>
  )
}

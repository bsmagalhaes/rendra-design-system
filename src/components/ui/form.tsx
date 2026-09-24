import type { ReactNode } from 'react'
import {
  FormProvider,
  useController,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form'
import { fieldGridClass, gapClass } from '@/components/layout/tokens'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, type FieldProps } from '@/components/ui/field'
import { cn } from '@/lib/cn'

/*
 * Integração com React Hook Form + Zod.
 *   const form = useForm({ resolver: zodResolver(schema), mode: 'onTouched' })
 *   <Form form={form} onSubmit={salvar}>
 *     <FormSection title="Dados principais">
 *       <FormField name="nome" label="Nome" required render={(f) => <Input {...f} />} />
 *     </FormSection>
 *     <ActionBar sticky primary={{ label: 'Salvar', type: 'submit', loading: isSubmitting }} />
 *   </Form>
 */

interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>
  onSubmit: SubmitHandler<T>
  children: ReactNode
  id?: string
  className?: string
}

export function Form<T extends FieldValues>({
  form,
  onSubmit,
  children,
  id,
  className,
}: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form
        id={id}
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('flex min-w-0 flex-col gap-8 md:gap-12', className)}
      >
        {children}
      </form>
    </FormProvider>
  )
}

/** Props que o render recebe: prontas para espalhar em Input, Select, DatePicker etc. */
export interface FormControlProps<V = unknown> {
  name: string
  value: V
  onChange: (value: V) => void
  onBlur: () => void
  invalid: boolean
  ref: (el: unknown) => void
}

interface FormFieldProps<T extends FieldValues> extends Omit<FieldProps, 'children' | 'error'> {
  name: FieldPath<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (field: FormControlProps<any>) => ReactNode
}

export function FormField<T extends FieldValues>({
  name,
  render,
  ...fieldProps
}: FormFieldProps<T>) {
  const { control } = useFormContext<T>()
  const { field, fieldState } = useController({ name, control })
  return (
    <Field {...fieldProps} error={fieldState.error?.message}>
      {render({
        name: field.name,
        value: field.value,
        onChange: field.onChange,
        onBlur: field.onBlur,
        invalid: Boolean(fieldState.error),
        ref: field.ref,
      })}
    </Field>
  )
}

interface FormSectionProps {
  title: ReactNode
  /** Subtítulo curto da seção. Instrução de uso vai em `help`. */
  description?: ReactNode
  /** Texto orientativo: ícone de informação ao lado do título, que abre um modal. */
  help?: ReactNode
  /**
   * 1: todos os campos em largura total (texto longo, cartões de seleção, anexos).
   * Sem valor: grade de formulário, com a largura de cada campo no span do Field.
   */
  columns?: 1 | 2
  children: ReactNode
  id?: string
}

/** Seção de formulário: card com título e a grade de formulário (3 campos por linha no largo). */
export function FormSection({ title, description, help, columns, children, id }: FormSectionProps) {
  return (
    <Card id={id} className="scroll-mt-6">
      <CardHeader>
        <CardTitle help={help}>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className={columns === 1 ? undefined : '@container'}>
          <div className={cn(columns === 1 ? 'grid grid-cols-1' : fieldGridClass, gapClass.fields)}>
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

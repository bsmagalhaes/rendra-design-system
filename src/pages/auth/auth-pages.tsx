import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { Grid, Stack } from '@/components/layout'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { OtpInput } from '@/components/ui/otp-input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/toast'
import { zBR } from '@/lib/validators'
import { AuthLayout } from './auth-layout'

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms))
// Links de texto com 44px de toque no celular
const link =
  'inline-flex min-h-touch items-center font-medium text-primary-text underline-offset-4 hover:text-primary-hover hover:underline md:min-h-0'

/* ---------------------------------------------------------------- Login */

const loginSchema = z.object({
  email: zBR.email(),
  senha: z.string().min(1, 'Informe a senha.'),
  lembrar: z.boolean().optional(),
})
type Login = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [erro, setErro] = useState<string | null>(null)
  const form = useForm<Login>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', senha: '', lembrar: true },
  })
  const submit = async (v: Login) => {
    setErro(null)
    await wait(900)
    if (v.senha.length < 6) {
      setErro('E-mail ou senha incorretos. Confira e tente de novo.')
      return
    }
    navigate('/verificacao')
  }
  return (
    <AuthLayout
      title="Entrar"
      description="Use o e-mail cadastrado na sua empresa."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link to="/cadastre-se" className={link}>
            Cadastre-se
          </Link>
        </>
      }
    >
      <Form form={form} onSubmit={submit} className="gap-4 md:gap-4">
        {erro && <Alert type="error" title="Não foi possível entrar" description={erro} />}
        <Stack gap="fields">
          <FormField<Login>
            name="email"
            label="E-mail"
            required
            render={(f) => (
              <Input {...f} type="email" inputMode="email" autoComplete="email" icon={<Mail />} />
            )}
          />
          <FormField<Login>
            name="senha"
            label="Senha"
            required
            render={(f) => (
              <Input {...f} type="password" autoComplete="current-password" icon={<Lock />} />
            )}
          />
        </Stack>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <FormField<Login>
            name="lembrar"
            render={(f) => (
              <Checkbox
                checked={f.value === true}
                onCheckedChange={f.onChange}
                label="Manter conectado"
              />
            )}
          />
          <Link to="/esqueci-senha" className={`${link} text-sm`}>
            Esqueci a senha
          </Link>
        </div>
        <Button type="submit" size="lg" fullWidth loading={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Demonstração: qualquer e-mail válido e senha com 6 ou mais caracteres.
        </p>
      </Form>
    </AuthLayout>
  )
}

/* ---------------------------------------------------------------- Esqueci a senha */

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState<string>()
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    if (!z.string().email().safeParse(email).success) return setErro('Informe um e-mail válido.')
    setErro(undefined)
    setLoading(true)
    await wait(900)
    setLoading(false)
    navigate('/verificacao?origem=senha', { state: { email } })
  }
  return (
    <AuthLayout
      title="Esqueci a senha"
      description="Enviamos um código de verificação para o seu e-mail. Com ele você cria uma senha nova."
      back={{ to: '/login', label: 'Voltar para o login' }}
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
        className="flex flex-col gap-4"
      >
        <Field label="E-mail" required error={erro}>
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            icon={<Mail />}
            value={email}
            onChange={setEmail}
          />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Enviando código...' : 'Enviar código'}
        </Button>
      </form>
    </AuthLayout>
  )
}

/* ---------------------------------------------------------------- Verificação em duas etapas */

export function VerifyCodePage() {
  const navigate = useNavigate()
  const fromReset = new URLSearchParams(location.search).get('origem') === 'senha'
  const [code, setCode] = useState('')
  const [erro, setErro] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [seconds, setSeconds] = useState(30)
  useEffect(() => {
    if (seconds <= 0) return
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [seconds])

  const verify = async (value = code) => {
    if (value.length < 6) return setErro('Digite os 6 dígitos do código.')
    setLoading(true)
    setErro(undefined)
    await wait(900)
    setLoading(false)
    if (value === '000000') return setErro('Código incorreto. Confira o e-mail e tente de novo.')
    if (fromReset) navigate('/nova-senha')
    else {
      toast.success('Bem-vindo de volta')
      navigate('/')
    }
  }

  return (
    <AuthLayout
      title="Verificação em duas etapas"
      description={
        fromReset
          ? 'Digite o código de 6 dígitos que enviamos para o seu e-mail para criar uma senha nova.'
          : 'Por segurança, digite o código de 6 dígitos que enviamos para o seu e-mail.'
      }
      back={{ to: fromReset ? '/esqueci-senha' : '/login', label: 'Voltar' }}
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void verify()
        }}
        className="flex flex-col gap-6"
      >
        <Field
          label="Código de verificação"
          error={erro}
          help="Cole o código inteiro, se preferir."
        >
          <OtpInput value={code} onChange={setCode} onComplete={(v) => void verify(v)} />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Verificando...' : 'Verificar'}
        </Button>
        <Separator />
        <p className="text-center text-sm text-muted-foreground">
          Não recebeu?{' '}
          {seconds > 0 ? (
            <span className="tabular-nums">Reenviar em {seconds}s</span>
          ) : (
            <button
              type="button"
              className={`${link} cursor-pointer`}
              onClick={() => {
                setSeconds(30)
                toast.info('Enviamos um código novo')
              }}
            >
              Reenviar código
            </button>
          )}
        </p>
      </form>
    </AuthLayout>
  )
}

/* ---------------------------------------------------------------- Nova senha */

function strength(v: string) {
  let s = 0
  if (v.length >= 8) s++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++
  if (/\d/.test(v)) s++
  if (/[^A-Za-z0-9]/.test(v)) s++
  return s
}
const strengthLabel = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte']
const strengthTone = ['error', 'error', 'warning', 'primary', 'success'] as const

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [senha, setSenha] = useState('')
  const [conf, setConf] = useState('')
  const [tentou, setTentou] = useState(false)
  const [loading, setLoading] = useState(false)
  const forca = strength(senha)
  const erroSenha =
    tentou && forca < 3
      ? 'Use 8 ou mais caracteres, com letras maiúsculas, minúsculas e números.'
      : undefined
  const erroConf = tentou && conf !== senha ? 'As senhas não conferem.' : undefined

  const submit = async () => {
    setTentou(true)
    if (forca < 3 || conf !== senha) return
    setLoading(true)
    await wait(900)
    toast.success('Senha alterada', { description: 'Entre com a senha nova.' })
    navigate('/login')
  }

  return (
    <AuthLayout
      title="Criar senha nova"
      description="Escolha uma senha que você não use em outros serviços."
      back={{ to: '/login', label: 'Voltar para o login' }}
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
        className="flex flex-col gap-4"
      >
        <Field label="Senha nova" required error={erroSenha}>
          <Input
            type="password"
            autoComplete="new-password"
            icon={<Lock />}
            value={senha}
            onChange={setSenha}
          />
        </Field>
        <Stack gap="1" className="-mt-4">
          <Progress
            value={(forca / 4) * 100}
            size="sm"
            tone={strengthTone[forca]}
            label="Força da senha"
          />
          <span className="text-xs text-muted-foreground">Força: {strengthLabel[forca]}</span>
        </Stack>
        <Field label="Confirmar senha" required error={erroConf}>
          <Input
            type="password"
            autoComplete="new-password"
            icon={<Lock />}
            value={conf}
            onChange={setConf}
          />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Salvando...' : 'Salvar senha nova'}
        </Button>
      </form>
    </AuthLayout>
  )
}

/* ---------------------------------------------------------------- Cadastro */

const signupSchema = z
  .object({
    nome: zBR.required('Nome'),
    empresa: zBR.required('Empresa'),
    email: zBR.email(),
    telefone: zBR.phone(),
    senha: z.string().min(8, 'Use pelo menos 8 caracteres.'),
    confirmar: z.string(),
    termos: z.literal(true, { error: 'É preciso aceitar os termos.' }),
  })
  .refine((v) => v.senha === v.confirmar, {
    path: ['confirmar'],
    message: 'As senhas não conferem.',
  })
type Signup = z.infer<typeof signupSchema>

export function SignupPage() {
  const navigate = useNavigate()
  const form = useForm<Signup>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
    defaultValues: { nome: '', empresa: '', email: '', telefone: '', senha: '', confirmar: '' },
  })
  const submit = async () => {
    await wait(1000)
    toast.success('Conta criada', { description: 'Confirme o e-mail para ativar.' })
    navigate('/verificacao')
  }
  return (
    <AuthLayout
      title="Criar conta"
      description="Leva menos de um minuto."
      back={{ to: '/login', label: 'Já tenho conta' }}
      width="md"
      footer={
        <>
          Ao continuar você concorda com os{' '}
          <a href="#termos" className={link}>
            termos de uso
          </a>
          .
        </>
      }
    >
      <Form form={form} onSubmit={submit} className="gap-2 md:gap-2">
        {/* Duas colunas a partir de 768px; uma no celular */}
        <Grid cols={{ base: 1, md: 2 }} gap="fields">
          <FormField<Signup>
            name="nome"
            label="Seu nome"
            required
            render={(f) => <Input {...f} autoComplete="name" icon={<User />} />}
          />
          <FormField<Signup>
            name="empresa"
            label="Empresa"
            required
            render={(f) => <Input {...f} autoComplete="organization" />}
          />
          <FormField<Signup>
            name="email"
            label="E-mail de trabalho"
            required
            render={(f) => (
              <Input {...f} type="email" inputMode="email" autoComplete="email" icon={<Mail />} />
            )}
          />
          <FormField<Signup>
            name="telefone"
            label="Celular"
            required
            render={(f) => <Input {...f} mask="phone" autoComplete="tel" />}
          />
          <FormField<Signup>
            name="senha"
            label="Senha"
            required
            help="Pelo menos 8 caracteres."
            render={(f) => (
              <Input {...f} type="password" autoComplete="new-password" icon={<Lock />} />
            )}
          />
          <FormField<Signup>
            name="confirmar"
            label="Confirmar senha"
            required
            render={(f) => (
              <Input {...f} type="password" autoComplete="new-password" icon={<Lock />} />
            )}
          />
          <FormField<Signup>
            name="termos"
            span="full"
            render={(f) => (
              <Checkbox
                checked={f.value === true}
                onCheckedChange={f.onChange}
                invalid={f.invalid}
                label="Li e aceito os termos de uso e a política de privacidade"
              />
            )}
          />
        </Grid>
        <Button type="submit" size="lg" fullWidth loading={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </Form>
    </AuthLayout>
  )
}

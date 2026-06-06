'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, Loader2, MailCheck, Send } from 'lucide-react'

type Mode = 'password' | 'magic'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  // --- Login com senha (admin) ---
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    const role = data.user?.user_metadata?.role
    router.push(role === 'admin' ? '/admin/painel' : '/painel')
  }

  // --- Login sem senha (paciente) ---
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // apenas usuarios ja cadastrados
        emailRedirectTo: `${window.location.origin}/aceitar-convite`,
      },
    })

    if (error) {
      setError('E-mail nao encontrado. Verifique o endereco ou fale com seu orientador.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  // Tela de confirmacao de envio
  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <MailCheck className="h-10 w-10 mx-auto text-primary mb-2" />
            <CardTitle>Verifique seu e-mail</CardTitle>
            <CardDescription>
              Enviamos um link de acesso para <strong>{email}</strong>.
              Abra o e-mail e clique no link para entrar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Nao recebeu? Verifique a caixa de spam ou solicite um novo link ao seu orientador.
            </p>
            <button
              onClick={() => { setSent(false); setError('') }}
              className="mt-4 text-sm text-primary underline"
            >
              Tentar novamente
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Jornada Vocacional</CardTitle>
          <CardDescription>
            {mode === 'password'
              ? 'Entre com seu e-mail e senha'
              : 'Receba um link de acesso no seu e-mail'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Seletor de modo */}
          <div className="flex rounded-lg border overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => { setMode('password'); setError('') }}
              className={`flex-1 py-2 transition-colors ${
                mode === 'password'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              Entrar com senha
            </button>
            <button
              type="button"
              onClick={() => { setMode('magic'); setError('') }}
              className={`flex-1 py-2 transition-colors ${
                mode === 'magic'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              Entrar sem senha
            </button>
          </div>

          {/* Formulario de senha */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</>
                  : <><LogIn className="mr-2 h-4 w-4" /> Entrar</>}
              </Button>
            </form>
          )}

          {/* Formulario de magic link */}
          {mode === 'magic' && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-magic">E-mail</Label>
                <Input
                  id="email-magic"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                  : <><Send className="mr-2 h-4 w-4" /> Enviar link de acesso</>}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Voce recebera um e-mail com um link para entrar sem precisar de senha.
              </p>
            </form>
          )}

        </CardContent>
      </Card>
    </div>
  )
}

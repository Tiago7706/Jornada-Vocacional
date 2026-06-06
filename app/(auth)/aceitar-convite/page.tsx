'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, MailCheck } from 'lucide-react'

export default function AceitarConvitePage() {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState<'loading' | 'expired'>('loading')

  useEffect(() => {
    // Supabase processes the magic link token from the URL automatically.
    // Listen for the resulting SIGNED_IN / USER_UPDATED event, then redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        router.push('/painel')
      }
    })

    // Also handle the case where the session was already established
    // (e.g. middleware exchanged the token server-side before page mounted)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/painel')
      }
    })

    // After 10 s without a session, the link is probably expired or already used
    const timeout = setTimeout(() => setStatus('expired'), 10_000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-sm">
          <MailCheck className="h-10 w-10 mx-auto text-muted-foreground" />
          <h2 className="text-lg font-semibold">Link expirado ou ja utilizado</h2>
          <p className="text-sm text-muted-foreground">
            Solicite um novo link de acesso ao seu orientador, ou use a opcao
            &quot;Entrar sem senha&quot; na pagina de login.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-primary underline"
          >
            Ir para o login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Confirmando acesso...</p>
      </div>
    </div>
  )
}

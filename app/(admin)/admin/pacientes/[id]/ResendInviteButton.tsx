'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ResendInviteButton({ patientId }: { patientId: string }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleResend() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reinvite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId }),
      })

      let data: { error?: string } = {}
      try { data = await res.json() } catch {}

      if (!res.ok) {
        toast.error(data.error || 'Erro ao reenviar link.')
        return
      }

      setSent(true)
      toast.success('Link de acesso enviado para o e-mail do paciente.')
      setTimeout(() => setSent(false), 5000)
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={loading || sent}
      style={{ pointerEvents: loading || sent ? 'none' : 'auto', opacity: loading || sent ? 0.6 : 1 }}
      className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium shadow-sm hover:bg-muted transition-colors disabled:pointer-events-none disabled:opacity-50"
    >
      {loading ? (
        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando...</>
      ) : sent ? (
        <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Link enviado</>
      ) : (
        <><Send className="h-3.5 w-3.5" /> Reenviar link de acesso</>
      )}
    </button>
  )
}

'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

type Status = 'idle' | 'loading' | 'sent' | 'error'

export default function ResendInviteButton({ patientId }: { patientId: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleResend() {
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/admin/reinvite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ patient_id: patientId }),
      })

      let data: { error?: string; success?: boolean } = {}
      const text = await res.text()
      try { data = JSON.parse(text) } catch { /* not json */ }

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || `Erro ${res.status}`)
        return
      }

      setStatus('sent')
      setTimeout(() => setStatus('idle'), 6000)
    } catch (err) {
      setStatus('error')
      setErrorMsg('Erro de conexão.')
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleResend}
        disabled={status === 'loading' || status === 'sent'}
        className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium shadow-sm hover:bg-muted transition-colors disabled:pointer-events-none disabled:opacity-50"
      >
        {status === 'loading' ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processando...</>
        ) : status === 'sent' ? (
          <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Senha resetada!</>
        ) : (
          <><Send className="h-3.5 w-3.5" /> Resetar senha do paciente</>
        )}
      </button>

      {status === 'error' && (
        <span className="inline-flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {errorMsg}
        </span>
      )}
    </div>
  )
}

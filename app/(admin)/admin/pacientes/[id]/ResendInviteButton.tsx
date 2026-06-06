'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ResendInviteButton({ patientId }: { patientId: string }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleResend() {
    setLoading(true)
    const res = await fetch('/api/admin/reinvite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: patientId }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      toast.error(data.error || 'Erro ao reenviar link.')
      return
    }

    setSent(true)
    toast.success('Link de acesso enviado para o e-mail do paciente.')
    setTimeout(() => setSent(false), 5000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResend}
      disabled={loading || sent}
    >
      {loading ? (
        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</>
      ) : sent ? (
        <><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Link enviado</>
      ) : (
        <><Send className="h-4 w-4 mr-2" /> Reenviar link de acesso</>
      )}
    </Button>
  )
}

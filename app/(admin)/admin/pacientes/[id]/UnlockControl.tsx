'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, Unlock } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  patientId: string
  currentMax: number
  totalExperiences: number
}

export default function UnlockControl({ patientId, currentMax, totalExperiences }: Props) {
  const supabase = createClient()
  const [max, setMax] = useState(currentMax)
  const [saving, setSaving] = useState(false)

  async function updateMax(value: number) {
    setSaving(true)
    const { error } = await supabase
      .from('patients')
      .update({ max_experience_unlocked: value })
      .eq('id', patientId)

    if (error) {
      toast.error('Erro ao atualizar acesso.')
    } else {
      setMax(value)
      toast.success(value === 0
        ? 'Acesso bloqueado.'
        : `Liberado ate a experiencia ${value}.`
      )
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {max === 0 ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Unlock className="h-4 w-4 text-green-500" />
        )}
        <span className="text-sm">
          {max === 0
            ? 'Nenhuma experiencia liberada'
            : max >= totalExperiences
            ? 'Todas as experiencias liberadas'
            : `Liberado ate a experiencia ${max} de ${totalExperiences}`}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={max === 0 ? 'default' : 'outline'}
          onClick={() => updateMax(0)}
          disabled={saving || max === 0}
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3 mr-1" />}
          Bloquear tudo
        </Button>
        {Array.from({ length: totalExperiences }, (_, i) => i + 1).map(n => (
          <Button
            key={n}
            size="sm"
            variant={max === n ? 'default' : 'outline'}
            onClick={() => updateMax(n)}
            disabled={saving || max === n}
          >
            {saving && max === n ? <Loader2 className="h-3 w-3 animate-spin" /> : n}
          </Button>
        ))}
        <Button
          size="sm"
          variant={max >= totalExperiences ? 'default' : 'outline'}
          onClick={() => updateMax(totalExperiences)}
          disabled={saving || max >= totalExperiences}
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unlock className="h-3 w-3 mr-1" />}
          Liberar tudo
        </Button>
      </div>
    </div>
  )
}

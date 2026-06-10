'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, Unlock } from 'lucide-react'
import { toast } from 'sonner'

interface ExperienceOption {
  order_index: number
  title: string
}

interface Props {
  patientId: string
  currentMax: number
  pathType: 'traditional' | 'interactive' | null
  experiences: ExperienceOption[]
}

export default function UnlockControl({ patientId, currentMax, pathType, experiences }: Props) {
  const supabase = createClient()
  const [max, setMax] = useState(currentMax)
  const [saving, setSaving] = useState(false)

  // Filtra e ordena as experiências do caminho deste participante
  const pathExperiences = experiences
    .filter(e => e.order_index <= 20) // segurança
    .sort((a, b) => a.order_index - b.order_index)

  // Nome da experiência atualmente liberada
  const currentExp = [...pathExperiences].reverse().find(e => e.order_index <= max)
  const allUnlocked = pathExperiences.length > 0 && max >= pathExperiences[pathExperiences.length - 1].order_index

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
      const exp = [...pathExperiences].reverse().find(e => e.order_index <= value)
      toast.success(value === 0
        ? 'Apenas Desafio CST liberado.'
        : exp
          ? `Liberado até: ${exp.title}`
          : 'Acesso atualizado.'
      )
    }
    setSaving(false)
  }

  const statusLabel = max === 0
    ? 'Apenas Desafio CST liberado'
    : allUnlocked
      ? 'Todas as experiências liberadas'
      : currentExp
        ? `Liberado até: ${currentExp.title}`
        : 'Nenhuma experiência liberada'

  return (
    <div className="space-y-4">
      {/* Status atual */}
      <div className="flex items-center gap-2">
        {max === 0
          ? <Lock className="h-4 w-4 text-muted-foreground" />
          : <Unlock className="h-4 w-4 text-green-500" />}
        <span className="text-sm">{statusLabel}</span>
      </div>

      {/* Sequência visual do caminho */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Sequência — caminho {pathType === 'traditional' ? 'Tradicional' : pathType === 'interactive' ? 'Interativo' : 'não definido'}
        </p>
        <div className="flex flex-wrap gap-2">
          {pathExperiences.map((exp, i) => {
            const isUnlocked = exp.order_index <= max
            const isCurrent = exp.order_index === max || (i === 0 && max === 0)
            return (
              <Button
                key={exp.order_index}
                size="sm"
                variant={isUnlocked ? 'default' : 'outline'}
                className={`text-xs max-w-[160px] truncate ${isCurrent ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                onClick={() => updateMax(exp.order_index)}
                disabled={saving || isUnlocked}
                title={exp.title}
              >
                {saving && isUnlocked ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <span className="mr-1 opacity-60">{i + 1}.</span>
                )}
                <span className="truncate">{exp.title}</span>
              </Button>
            )
          })}
          <Button
            size="sm"
            variant={allUnlocked ? 'default' : 'outline'}
            onClick={() => updateMax(pathExperiences[pathExperiences.length - 1]?.order_index ?? 0)}
            disabled={saving || allUnlocked || pathExperiences.length === 0}
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unlock className="h-3 w-3 mr-1" />}
            Liberar tudo
          </Button>
        </div>
      </div>
    </div>
  )
}

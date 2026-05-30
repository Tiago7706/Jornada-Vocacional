'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Experience } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Construction } from 'lucide-react'

// Game components
import RiasecBattleCards from '@/components/experiences/RiasecBattleCards'

interface Props {
  experience: Experience
  patientId: string
  initialState?: Record<string, unknown>
  isCompleted: boolean
}

function PlaceholderGame({ title, onComplete }: { title: string; onComplete: () => void }) {
  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Construction className="h-6 w-6" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">Esta experiencia esta em desenvolvimento e sera disponibilizada em breve.</p>
        <button
          className="text-sm underline text-muted-foreground"
          onClick={onComplete}
        >
          Marcar como concluida (teste)
        </button>
      </CardContent>
    </Card>
  )
}

export default function ExperienceWrapper({ experience, patientId, initialState, isCompleted }: Props) {
  const router = useRouter()
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

  const handleStateChange = useCallback((state: Record<string, unknown>) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experienceId: experience.id, game_state: state }),
      })
    }, 2000)
  }, [experience.id])

  // onComplete: save scores to DB, then let the game component handle navigation
  const handleComplete = useCallback(async (
    scores: Record<string, unknown>,
    responses: Record<string, unknown>
  ) => {
    try {
      await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId: experience.id,
          game_state: {},
          status: 'completed',
          scores,
          responses,
        }),
      })
      toast.success('Resultado salvo com sucesso!')
      router.push('/painel')
      router.refresh()
    } catch {
      toast.error('Erro ao salvar resultado. Tente novamente.')
    }
  }, [experience.id, router])

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [])

  if (isCompleted) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">Voce ja concluiu esta experiencia.</p>
        <button
          className="text-sm underline text-muted-foreground"
          onClick={() => router.push('/painel')}
        >
          Voltar ao painel
        </button>
      </div>
    )
  }

  // ── Route to specific game component by slug ──────────────────────────────

  if (experience.slug === 'riasec-battle-cards') {
    return (
      <RiasecBattleCards
        patientId={patientId}
        experienceId={experience.id}
        initialState={initialState}
        onStateChange={handleStateChange}
        onComplete={handleComplete}
      />
    )
  }

  // Fallback placeholder for games not yet migrated
  return (
    <PlaceholderGame
      title={experience.title}
      onComplete={() => handleComplete({ placeholder: true }, {})}
    />
  )
}

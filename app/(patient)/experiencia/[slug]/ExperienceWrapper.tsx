'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Experience } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Construction } from 'lucide-react'

// ── Iframe game wrapper ────────────────────────────────────────────────────────
function IframeGame({
  src,
  onComplete,
  onSave,
}: {
  src: string
  onComplete: (scores: Record<string, unknown>, responses: Record<string, unknown>) => void
  onSave?: (scores: Record<string, unknown>) => void
}) {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'game-complete') {
        onComplete(event.data.scores ?? {}, {})
      }
      if (event.data?.type === 'game-save') {
        onSave?.(event.data.scores ?? {})
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onComplete, onSave])

  return (
    <iframe
      src={src}
      style={{
        position: 'fixed',
        top: 56,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: 'calc(100vh - 56px)',
        border: 'none',
        zIndex: 40,
      }}
      allow="autoplay"
    />
  )
}

// Game components
import JornadaVocacional from '@/components/experiences/JornadaVocacional'
import DesafioCSTFinal from '@/components/experiences/DesafioCSTFinal'
import RiasecBattleCards from '@/components/experiences/RiasecBattleCards'
import DecifraMente from '@/components/experiences/DecifraMente'
import AgenciaMissaoImpossivel from '@/components/experiences/AgenciaMissaoImpossivel'
import SuperQuem from '@/components/experiences/SuperQuem'
import JogoDaMemoria from '@/components/experiences/JogoDaMemoria'
import ExpedicaoCientifica from '@/components/experiences/ExpedicaoCientifica'
import HQdaSaude from '@/components/experiences/HQdaSaude'
import FaceAFace from '@/components/experiences/FaceAFace'
import QuemFalaIsso from '@/components/experiences/QuemFalaIsso'
import UmaNoiteNoMuseu from '@/components/experiences/UmaNoiteNoMuseu'
import INSIDEexe from '@/components/experiences/INSIDEexe'
import Engenhoso from '@/components/experiences/Engenhoso'

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

  // onSave: save scores silently without navigating (used when player continues playing)
  const handleSilentSave = useCallback(async (scores: Record<string, unknown>) => {
    try {
      await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId: experience.id,
          game_state: {},
          status: 'completed',
          scores,
          responses: {},
        }),
      })
    } catch {
      // silently ignore — player is still in the game
    }
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

  if (experience.slug === 'decifra-mente') {
    return <IframeGame src="/games/decifra-mente.html" onComplete={handleComplete} />
  }

  if (experience.slug === 'super-quem') {
    return <IframeGame src="/games/super-quem.html" onComplete={handleComplete} />
  }

  if (experience.slug === 'agencia-missao-impossivel') {
    return (
      <AgenciaMissaoImpossivel
        patientId={patientId}
        experienceId={experience.id}
        initialState={initialState}
        onStateChange={handleStateChange}
        onComplete={handleComplete}
      />
    )
  }

  if (experience.slug === 'jogo-da-memoria') {
    return <IframeGame src="/games/jogo-da-memoria.html" onComplete={handleComplete} />
  }

  if (experience.slug === 'expedicao-cientifica') {
    return <IframeGame src="/games/expedicao-cientifica.html" onComplete={handleComplete} />
  }

  if (experience.slug === 'hq-da-saude') {
    return <IframeGame src="/games/hq-da-saude.html" onComplete={handleComplete} />
  }

  if (experience.slug === 'face-a-face') {
    return <IframeGame src="/games/face-a-face.html?v=3" onComplete={handleComplete} onSave={handleSilentSave} />
  }

  if (experience.slug === 'quem-fala-isso') {
    return <IframeGame src="/games/quem-fala-isso.html" onComplete={handleComplete} />
  }

  if (experience.slug === 'uma-noite-no-museu') {
    return <IframeGame src="/games/uma-noite-no-museu.html" onComplete={handleComplete} />
  }

  if (experience.slug === 'inside-exe') {
    return <IframeGame src="/games/inside-exe.html" onComplete={handleComplete} />
  }

  if (experience.slug === 'engenhoso') {
    return (
      <Engenhoso
        patientId={patientId}
        experienceId={experience.id}
        initialState={initialState}
        onStateChange={handleStateChange}
        onComplete={handleComplete}
      />
    )
  }

  if (experience.slug === 'jornada-vocacional' || experience.slug === 'jornada-vocacional-v5') {
    return (
      <JornadaVocacional
        patientId={patientId}
        experienceId={experience.id}
        initialState={initialState}
        onStateChange={handleStateChange}
        onComplete={handleComplete}
      />
    )
  }

  if (experience.slug === 'desafio-cst-final') {
    return (
      <DesafioCSTFinal
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

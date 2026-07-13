import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ExperienceWrapper from './ExperienceWrapper'
import type { Experience, PatientExperience } from '@/types/database'

export default async function ExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: experience } = await supabase
    .from('experiences')
    .select('*')
    .eq('slug', slug)
    .single() as { data: Experience | null }

  if (!experience) notFound()

  const { data: patient } = await supabase
    .from('patients')
    .select('max_experience_unlocked')
    .eq('id', user.id)
    .single()

  const { data: pe } = await supabase
    .from('patient_experiences')
    .select('*')
    .eq('patient_id', user.id)
    .eq('experience_id', experience.id)
    .single() as { data: PatientExperience | null }

  // Verificar acesso
  const maxUnlocked = patient?.max_experience_unlocked ?? 0
  const status = pe?.status ?? 'locked'
  const isUniversal = experience.type === 'universal'
  const isAccessible = isUniversal || status !== 'locked' || experience.id <= maxUnlocked

  if (!isAccessible) {
    redirect('/painel')
  }

  // When completed, fetch saved scores so the experience can show results (e.g. CSLB ranking)
  let completedScores: Record<string, unknown> | null = null
  if (status === 'completed') {
    const { data: scoreRow } = await supabase
      .from('experience_scores')
      .select('scores')
      .eq('patient_id', user.id)
      .eq('experience_id', experience.id)
      .single()
    completedScores = (scoreRow?.scores as Record<string, unknown>) ?? null
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: 'calc(100svh - 56px)', margin: '-2rem -1rem -2rem' }}>
      <div style={{ maxWidth: 430, margin: '0 auto', background: '#fff', minHeight: 'calc(100svh - 56px)', position: 'relative' }}>
        <ExperienceWrapper
          experience={experience}
          patientId={user.id}
          initialState={completedScores ?? pe?.game_state ?? undefined}
          isCompleted={status === 'completed'}
        />
      </div>
    </div>
  )
}

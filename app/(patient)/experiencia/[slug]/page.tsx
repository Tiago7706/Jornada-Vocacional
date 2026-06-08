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

  return (
    <div style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 56px)', margin: '0 -1rem -2rem' }}>
      <div style={{ maxWidth: 430, margin: '0 auto', background: '#fff', minHeight: 'calc(100vh - 56px)', position: 'relative' }}>
        <ExperienceWrapper
          experience={experience}
          patientId={user.id}
          initialState={pe?.game_state ?? undefined}
          isCompleted={status === 'completed'}
        />
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })

  const experienceId = req.nextUrl.searchParams.get('experienceId')
  if (!experienceId) return NextResponse.json({ error: 'experienceId obrigatorio.' }, { status: 400 })

  const { data } = await supabase
    .from('patient_experiences')
    .select('game_state, status')
    .eq('patient_id', user.id)
    .eq('experience_id', parseInt(experienceId))
    .single()

  return NextResponse.json({ game_state: data?.game_state ?? null, status: data?.status ?? 'locked' })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })

  const body = await req.json()
  const { experienceId, game_state, status, scores, responses } = body

  if (!experienceId) return NextResponse.json({ error: 'experienceId obrigatorio.' }, { status: 400 })

  const isCompleted = status === 'completed'

  // Upsert patient_experiences
  const upsertData: Record<string, unknown> = {
    patient_id: user.id,
    experience_id: experienceId,
    game_state: isCompleted ? {} : game_state,
    status: isCompleted ? 'completed' : 'in_progress',
    last_activity_at: new Date().toISOString(),
  }

  if (isCompleted) {
    upsertData.completed_at = new Date().toISOString()
  }

  const { error: peError } = await supabase
    .from('patient_experiences')
    .upsert(upsertData, { onConflict: 'patient_id,experience_id' })

  if (peError) return NextResponse.json({ error: peError.message }, { status: 500 })

  // Save scores to experience_scores table when completing
  if (isCompleted && scores) {
    const { error: scoreError } = await supabase
      .from('experience_scores')
      .upsert({
        patient_id: user.id,
        experience_id: experienceId,
        scores,
        raw_responses: responses ?? {},
      }, { onConflict: 'patient_id,experience_id' })

    if (scoreError) {
      console.error('Erro ao salvar scores:', scoreError.message)
      // Non-fatal: don't fail the whole request
    }
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    patient_id: user.id,
    experience_id: experienceId,
    action: isCompleted ? 'complete' : 'auto_save',
    metadata: isCompleted ? { scores } : { screen: game_state?.screen },
  })

  return NextResponse.json({ success: true })
}

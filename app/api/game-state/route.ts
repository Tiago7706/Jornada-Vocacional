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

  const { experienceId, game_state } = await req.json()
  if (!experienceId) return NextResponse.json({ error: 'experienceId obrigatorio.' }, { status: 400 })

  const { error } = await supabase
    .from('patient_experiences')
    .upsert({
      patient_id: user.id,
      experience_id: experienceId,
      game_state,
      status: 'in_progress',
      last_activity_at: new Date().toISOString(),
    }, { onConflict: 'patient_id,experience_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

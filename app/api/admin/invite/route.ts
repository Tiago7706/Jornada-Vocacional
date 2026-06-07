import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, phone, birth_date, admin_notes } = await req.json()

    if (!full_name || !email) {
      return NextResponse.json({ error: 'Nome e e-mail sao obrigatorios.' }, { status: 400 })
    }

    // Criar usuario com magic link
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { role: 'patient' },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://jornada-vocacional.vercel.app'}/auth/callback?next=/painel`,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Criar registro na tabela patients
    const { error: patientError } = await supabaseAdmin.from('patients').insert({
      id: authData.user.id,
      full_name,
      email,
      phone: phone || null,
      birth_date: birth_date || null,
      admin_notes: admin_notes || null,
      invited_at: new Date().toISOString(),
    })

    if (patientError) {
      return NextResponse.json({ error: patientError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId: authData.user.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}

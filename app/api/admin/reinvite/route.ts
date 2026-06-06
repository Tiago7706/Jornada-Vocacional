import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    const { patient_id } = await req.json()

    if (!patient_id) {
      return NextResponse.json({ error: 'patient_id obrigatorio.' }, { status: 400 })
    }

    // Busca o email do paciente
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('email, full_name')
      .eq('id', patient_id)
      .single()

    if (patientError || !patient) {
      return NextResponse.json({ error: 'Paciente nao encontrado.' }, { status: 404 })
    }

    // Reenvia o link de convite (Supabase reenvia para usuarios ja existentes)
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      patient.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://jornada-vocacional.vercel.app'}/aceitar-convite`,
      }
    )

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}

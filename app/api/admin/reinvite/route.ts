import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const { patient_id } = await req.json()

    if (!patient_id) {
      return NextResponse.json({ error: 'patient_id obrigatorio.' }, { status: 400 })
    }

    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('email')
      .eq('id', patient_id)
      .single()

    if (patientError || !patient) {
      return NextResponse.json({ error: 'Participante nao encontrado.' }, { status: 404 })
    }

    const senha = process.env.PATIENT_DEFAULT_PASSWORD || 'Jornada@2025'

    // Reseta a senha do participante para a senha padrao e confirma o email
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      patient_id,
      {
        password: senha,
        email_confirm: true,
      }
    )

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}

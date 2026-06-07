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
      return NextResponse.json({ error: 'Paciente nao encontrado.' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jornada-vocacional.vercel.app'

    // Tenta enviar magic link via OTP (funciona para usuarios ja confirmados)
    // shouldCreateUser: false garante que so envia para quem ja existe
    const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
      email: patient.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${appUrl}/auth/callback?next=/painel`,
      },
    })

    if (otpError) {
      // Fallback: tenta reenviar convite
      const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        patient.email,
        {
          redirectTo: `${appUrl}/auth/callback?next=/painel`,
        }
      )
      if (inviteError) {
        return NextResponse.json({ error: inviteError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}

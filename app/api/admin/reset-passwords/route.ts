import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Endpoint temporario para resetar senha de todos os pacientes.
// Acesse pelo navegador: /api/admin/reset-passwords
export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const senha = process.env.PATIENT_DEFAULT_PASSWORD || 'Jornada@2025'

  // Buscar todos os pacientes (excluindo admins pelo role no user_metadata)
  const { data: patients, error } = await supabaseAdmin
    .from('patients')
    .select('id, email, full_name')
    .neq('id', '505474de-28ae-4bd8-8a09-7b9fbe04123c') // excluir conta admin

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!patients || patients.length === 0) {
    return NextResponse.json({ message: 'Nenhum paciente encontrado.' })
  }

  // Resetar senha de cada paciente
  const resultados = []
  for (const patient of patients) {
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      patient.id,
      { password: senha, email_confirm: true }
    )
    resultados.push({
      nome: patient.full_name,
      email: patient.email,
      status: updateError ? `ERRO: ${updateError.message}` : 'OK',
    })
  }

  return NextResponse.json({
    mensagem: `Senha resetada para: ${senha}`,
    pacientes: resultados,
  })
}

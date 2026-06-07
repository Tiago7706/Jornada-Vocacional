import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { ReportType } from '@/types/database'

export async function POST(req: NextRequest) {
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
  }

  const { patientId, reportType }: { patientId: string; reportType: ReportType } = await req.json()

  // Buscar dados do paciente
  const [{ data: patient }, { data: scores }, { data: prompt }] = await Promise.all([
    supabaseAdmin.from('patients').select('*').eq('id', patientId).single(),
    supabaseAdmin.from('experience_scores').select('*, experiences(title, slug)').eq('patient_id', patientId),
    supabaseAdmin.from('report_prompts').select('template').eq('prompt_type', reportType).single(),
  ])

  if (!patient) return NextResponse.json({ error: 'Paciente nao encontrado.' }, { status: 404 })
  if (!prompt) return NextResponse.json({ error: 'Template de prompt nao configurado.' }, { status: 404 })

  // Montar o prompt
  const scoresJson = JSON.stringify(scores, null, 2)
  const filledPrompt = prompt.template
    .replace(/\{\{patient_name\}\}/g, patient.full_name)
    .replace(/\{\{path_type\}\}/g, patient.path_type ?? 'nao definido')
    .replace(/\{\{generated_at\}\}/g, new Date().toLocaleString('pt-BR'))
    .replace(/\{\{scores_json\}\}/g, scoresJson)

  // Chamar Gemini API
  const geminiModel = 'gemini-2.0-flash'
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: filledPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    }
  )

  if (!geminiRes.ok) {
    const err = await geminiRes.text()
    return NextResponse.json({ error: `Gemini API error: ${err}` }, { status: 500 })
  }

  const geminiData = await geminiRes.json()
  const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // Salvar relatório
  const { data: report, error } = await supabaseAdmin.from('reports').insert({
    patient_id: patientId,
    report_type: reportType,
    content,
    prompt_snapshot: filledPrompt,
    gemini_model: geminiModel,
    generated_by: user.id,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ reportId: report.id, content })
}

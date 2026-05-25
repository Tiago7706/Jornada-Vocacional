import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
  }

  const { id } = await params
  const { data: report } = await supabaseAdmin
    .from('reports')
    .select('*, patients(full_name)')
    .eq('id', id)
    .single()

  if (!report) return NextResponse.json({ error: 'Relatorio nao encontrado.' }, { status: 404 })

  // Gerar PDF simples via HTML→PDF (usando @react-pdf/renderer server-side seria mais complexo)
  // Por ora, retornamos um HTML formatado para impressão
  const patientName = (report.patients as { full_name: string } | null)?.full_name ?? 'Paciente'
  const reportTypeLabel = report.report_type === 'clinical' ? 'Clinico' : 'Simplificado'
  const date = new Date(report.created_at).toLocaleString('pt-BR')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatorio ${reportTypeLabel} - ${patientName}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a1a; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .meta { color: #666; font-size: 14px; margin-bottom: 32px; }
    .content { line-height: 1.8; white-space: pre-wrap; font-size: 14px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>Relatorio ${reportTypeLabel}</h1>
  <p class="meta">${patientName} — Gerado em ${date}</p>
  <div class="content">${report.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  <script>window.onload = () => window.print()</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}

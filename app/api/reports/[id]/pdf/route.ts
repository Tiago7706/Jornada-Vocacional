import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import { createElement } from 'react'
import type { ReactElement } from 'react'
import RelatorioPDF from '@/components/pdf/RelatorioPDF'

export const dynamic = 'force-dynamic'
// Ensure Node.js runtime — @react-pdf/renderer uses canvas/Node APIs
export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseAdmin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Auth guard — admin only
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
  }

  const { id } = await params

  // Fetch report + patient name
  const { data: report } = await supabaseAdmin
    .from('reports')
    .select('*, patients(full_name)')
    .eq('id', id)
    .single()

  if (!report) {
    return NextResponse.json({ error: 'Relatorio nao encontrado.' }, { status: 404 })
  }

  const patientName =
    (report.patients as { full_name: string } | null)?.full_name ?? 'Paciente'

  const generatedAt = new Date(report.created_at).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Render PDF buffer
  const pdfElement = createElement(RelatorioPDF, {
    patientName,
    reportType: report.report_type as 'clinical' | 'simplified',
    geminiModel: report.gemini_model ?? 'gemini-2.0-flash',
    generatedAt,
    content: report.content,
  }) as ReactElement<DocumentProps>

  const pdfBuffer = await renderToBuffer(pdfElement)

  // Safe filename
  const safePatient = patientName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
  const typeSlug = report.report_type === 'clinical' ? 'clinico' : 'simplificado'
  const filename = `relatorio-${typeSlug}-${safePatient}.pdf`

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdfBuffer.length),
    },
  })
}

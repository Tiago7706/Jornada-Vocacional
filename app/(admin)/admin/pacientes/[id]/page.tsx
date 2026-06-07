import { createClient as createAdmin } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle, Lock, PlayCircle, ArrowLeft, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import UnlockControl from './UnlockControl'
import GenerateReportButton from './GenerateReportButton'
import type { Patient, Experience, PatientExperience } from '@/types/database'

const statusIcon = {
  locked: Lock,
  unlocked: Circle,
  in_progress: PlayCircle,
  completed: CheckCircle2,
}

async function resetarSenha(formData: FormData) {
  'use server'
  const patientId = formData.get('patient_id') as string
  if (!patientId) return

  const supabaseAdmin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const senha = process.env.PATIENT_DEFAULT_PASSWORD || 'Jornada@2025'

  await supabaseAdmin.auth.admin.updateUserById(patientId, {
    password: senha,
    email_confirm: true,
  })

  redirect(`/admin/pacientes/${patientId}?ok=1`)
}

export default async function PatientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ok?: string }>
}) {
  const { id } = await params
  const { ok } = await searchParams

  const supabaseAdmin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const [{ data: patient }, { data: experiences }, { data: progress }] = await Promise.all([
    supabaseAdmin.from('patients').select('*').eq('id', id).single(),
    supabaseAdmin.from('experiences').select('*').order('order_index'),
    supabaseAdmin.from('patient_experiences').select('*').eq('patient_id', id),
  ]) as [
    { data: Patient | null },
    { data: Experience[] | null },
    { data: PatientExperience[] | null }
  ]

  if (!patient) notFound()

  const progressMap = new Map(progress?.map(p => [p.experience_id, p]) ?? [])
  const senha = process.env.PATIENT_DEFAULT_PASSWORD || 'Jornada@2025'

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/admin/pacientes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{patient.full_name}</h1>
      </div>

      {/* Confirmacao de reset */}
      {ok === '1' && (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Senha resetada com sucesso para <strong>{senha}</strong>
        </div>
      )}

      {/* Dados de acesso */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4 pb-4 space-y-3">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
            Dados de acesso — envie ao paciente
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Site: </span>
              <span className="font-mono font-medium">jornada-vocacional.vercel.app</span>
            </div>
            <div>
              <span className="text-muted-foreground">E-mail: </span>
              <span className="font-mono font-medium">{patient.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Senha: </span>
              <span className="font-mono font-medium">{senha}</span>
            </div>
          </div>
          {/* Botao de reset via Server Action — sem fetch, sem API */}
          <form action={resetarSenha}>
            <input type="hidden" name="patient_id" value={id} />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm hover:bg-blue-100 transition-colors"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Resetar senha para {senha}
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Info do paciente */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">E-mail</p>
            <p className="text-sm font-medium mt-1">{patient.email}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Caminho</p>
            <Badge className="mt-1" variant="outline">
              {patient.path_type === 'traditional' ? 'Tradicional' :
               patient.path_type === 'interactive' ? 'Interativo' : 'Nao definido'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Ultima atividade</p>
            <p className="text-sm font-medium mt-1">
              {patient.last_seen_at ? new Date(patient.last_seen_at).toLocaleString('pt-BR') : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controle de desbloqueio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Controle de Acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <UnlockControl
            patientId={id}
            currentMax={patient.max_experience_unlocked}
            totalExperiences={12}
          />
        </CardContent>
      </Card>

      {/* Progresso por experiencia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progresso nas Experiencias</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {experiences?.map(exp => {
              const pe = progressMap.get(exp.id)
              const status = pe?.status ?? 'locked'
              const Icon = statusIcon[status]
              return (
                <div key={exp.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{exp.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {pe?.time_spent_seconds ? (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(pe.time_spent_seconds / 60)} min
                      </span>
                    ) : null}
                    <Badge variant="outline" className="text-xs capitalize">
                      {status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gerar relatorio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Relatorios</CardTitle>
        </CardHeader>
        <CardContent>
          <GenerateReportButton patientId={id} />
        </CardContent>
      </Card>

      {/* Notas do admin */}
      {patient.admin_notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas Internas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{patient.admin_notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

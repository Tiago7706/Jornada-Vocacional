import { createClient as createAdmin } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle, Lock, PlayCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import UnlockControl from './UnlockControl'
import GenerateReportButton from './GenerateReportButton'
import ResendInviteButton from './ResendInviteButton'
import type { Patient, Experience, PatientExperience } from '@/types/database'

const statusIcon = {
  locked: Lock,
  unlocked: Circle,
  in_progress: PlayCircle,
  completed: CheckCircle2,
}

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabaseAdmin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const [{ data: patient }, { data: experiences }, { data: progress }, { data: scores }] = await Promise.all([
    supabaseAdmin.from('patients').select('*').eq('id', id).single(),
    supabaseAdmin.from('experiences').select('*').order('order_index'),
    supabaseAdmin.from('patient_experiences').select('*').eq('patient_id', id),
    supabaseAdmin.from('experience_scores').select('*, experiences(title)').eq('patient_id', id),
  ]) as [
    { data: Patient | null },
    { data: Experience[] | null },
    { data: PatientExperience[] | null },
    { data: any[] | null }
  ]

  if (!patient) notFound()

  const progressMap = new Map(progress?.map(p => [p.experience_id, p]) ?? [])
  const senhaAtual = process.env.PATIENT_DEFAULT_PASSWORD || 'Jornada@2025'

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
        <ResendInviteButton patientId={id} />
      </div>

      {/* Acesso do paciente */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Dados de acesso para enviar ao paciente</p>
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
              <span className="font-mono font-medium">{senhaAtual}</span>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">Se precisar resetar a senha, clique em "Resetar senha do paciente" acima.</p>
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

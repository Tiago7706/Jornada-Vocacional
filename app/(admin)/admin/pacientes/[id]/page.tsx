import { createClient as createAdmin } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle, Lock, PlayCircle, ArrowLeft, KeyRound, Trophy, Tag, Star } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import UnlockControl from './UnlockControl'
import GenerateReportButton from './GenerateReportButton'
import ScoresPanel from '@/components/admin/ScoresPanel'
import { CST_COURSES } from '@/constants/cst-courses'
import type { Patient, Experience, PatientExperience } from '@/types/database'

interface CSTScores {
  correct: number
  wrong: number
  total: number
  pct: number
  maxStreak: number
  ratings: Record<string, number>
  allCourses: { name: string; area: string; stars: number }[]
  topCourses: { name: string; area: string; stars: number }[]
}

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

  const [{ data: patient }, { data: experiences }, { data: progress }, { data: cstScoreRow }, { data: allScores }] = await Promise.all([
    supabaseAdmin.from('patients').select('*').eq('id', id).single(),
    supabaseAdmin.from('experiences').select('*').order('order_index'),
    supabaseAdmin.from('patient_experiences').select('*').eq('patient_id', id),
    supabaseAdmin.from('experience_scores').select('scores').eq('patient_id', id).eq('experience_id', 13).maybeSingle(),
    supabaseAdmin.from('experience_scores').select('experience_id,scores').eq('patient_id', id),
  ]) as [
    { data: Patient | null },
    { data: Experience[] | null },
    { data: PatientExperience[] | null },
    { data: { scores: CSTScores } | null },
    { data: { experience_id: number; scores: Record<string, unknown> }[] | null }
  ]

  if (!patient) notFound()

  const progressMap = new Map(progress?.map(p => [p.experience_id, p]) ?? [])
  const expTitleMap = new Map(experiences?.map(e => [e.id, e.title]) ?? [])
  const senha = process.env.PATIENT_DEFAULT_PASSWORD || 'Jornada@2025'
  const cstScores = cstScoreRow?.scores ?? null

  // Monta entradas do ScoresPanel (todos exceto CST que tem card próprio)
  const scorePanelEntries = (allScores ?? [])
    .filter(s => s.experience_id !== 13)
    .sort((a, b) => a.experience_id - b.experience_id)
    .map(s => ({
      experience_id: s.experience_id,
      experience_title: expTitleMap.get(s.experience_id) ?? `Jogo ${s.experience_id}`,
      scores: s.scores,
    }))

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
            Dados de acesso — envie ao participante
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

      {/* Info do participante */}
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

      {/* Escores por jogo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Escores por Jogo</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoresPanel entries={scorePanelEntries} />
        </CardContent>
      </Card>

      {/* Resultado Desafio CST */}
      {cstScores && (
        <Card className={cstScores.pct >= 80 ? 'border-green-300 bg-green-50' : 'border-amber-200 bg-amber-50'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Resultado — Desafio CST
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Aproveitamento + desconto */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-black">{cstScores.pct}%</p>
                <p className="text-xs text-muted-foreground">aproveitamento</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{cstScores.correct}</p>
                <p className="text-xs text-muted-foreground">acertos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{cstScores.wrong}</p>
                <p className="text-xs text-muted-foreground">erros</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">🔥 {cstScores.maxStreak}</p>
                <p className="text-xs text-muted-foreground">melhor sequência</p>
              </div>
              <div className="ml-auto">
                {cstScores.pct >= 80 ? (
                  <div className="flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 font-bold text-sm shadow">
                    <Tag className="h-4 w-4" />
                    DESCONTO 20% CONQUISTADO!
                  </div>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Não atingiu 80% — sem desconto
                  </Badge>
                )}
              </div>
            </div>

            {/* Todos os cursos — agrupados por área, ordem decrescente, com médias */}
            {(() => {
              // Monta lista completa usando ratings + lookup de área por CST_COURSES
              const areaLookup = new Map(CST_COURSES.map(c => [c.n, c.a]))
              const ratings = cstScores.ratings as Record<string, number> | undefined
              if (!ratings || Object.keys(ratings).length === 0) return null

              type CourseItem = { name: string; area: string; stars: number }
              const courses: CourseItem[] = Object.entries(ratings).map(([name, stars]) => ({
                name,
                area: areaLookup.get(name) ?? 'Outras Áreas',
                stars: Number(stars),
              }))

              // Agrupa por área
              const byArea = courses.reduce<Record<string, CourseItem[]>>((acc, c) => {
                acc[c.area] = acc[c.area] ?? []
                acc[c.area].push(c)
                return acc
              }, {})

              // Ordena cursos dentro de cada área por estrelas desc
              Object.values(byArea).forEach(list => list.sort((a, b) => b.stars - a.stars))

              // Calcula média por área
              const areaAvg = (list: CourseItem[]) =>
                list.reduce((s, c) => s + c.stars, 0) / list.length

              // Ordena áreas pela média desc
              const areasSorted = Object.keys(byArea).sort(
                (a, b) => areaAvg(byArea[b]) - areaAvg(byArea[a])
              )

              // Média geral
              const totalAvg = courses.reduce((s, c) => s + c.stars, 0) / courses.length

              return (
                <div className="space-y-4">
                  {/* Cabeçalho com totais */}
                  <div className="flex flex-wrap items-center gap-6 py-2 border-b">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Cursos avaliados</p>
                      <p className="text-2xl font-bold">{courses.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Média geral</p>
                      <p className="text-2xl font-bold text-amber-500">{totalAvg.toFixed(2)} <span className="text-sm font-normal">/ 5</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Áreas</p>
                      <p className="text-2xl font-bold">{areasSorted.length}</p>
                    </div>
                  </div>

                  {/* Áreas */}
                  {areasSorted.map(area => {
                    const list = byArea[area]
                    const avg = areaAvg(list)
                    return (
                      <div key={area}>
                        {/* Cabeçalho da área */}
                        <div className="flex items-center justify-between border-b pb-1 mb-1">
                          <p className="text-xs font-bold text-muted-foreground">{area}</p>
                          <p className="text-xs font-semibold text-amber-600">
                            média {avg.toFixed(2)}/5
                          </p>
                        </div>
                        {/* Cursos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                          {list.map((c) => (
                            <div key={c.name} className="flex items-center justify-between rounded-md bg-white/70 border border-white px-3 py-1.5 text-sm">
                              <span className="truncate">{c.name}</span>
                              <span className="ml-2 shrink-0 text-amber-400 font-mono whitespace-nowrap">
                                {'★'.repeat(c.stars)}{'☆'.repeat(5 - c.stars)}
                                <span className="text-muted-foreground ml-1 text-xs">({c.stars}/5)</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

          </CardContent>
        </Card>
      )}

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

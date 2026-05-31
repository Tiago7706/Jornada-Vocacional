import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, CheckCircle2, Clock, Activity } from 'lucide-react'
import Link from 'next/link'

const TOTAL_EXPERIENCES = 12

export default async function AdminPainelPage() {
  const supabase = await createClient()

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const [
    { count: totalPatients },
    { count: activeToday },
    { data: recentPatients },
    { data: recentActivity },
    { data: allScores },
  ] = await Promise.all([
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen_at', startOfToday.toISOString()),
    supabase
      .from('patients')
      .select('id, full_name, email, path_type, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('activity_logs')
      .select('id, action, created_at, patients(full_name)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('experience_scores')
      .select('patient_id'),
  ])

  // Count completed / in-progress from experience_scores
  const byPatient = (allScores ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.patient_id] = (acc[row.patient_id] ?? 0) + 1
    return acc
  }, {})
  const completedCount  = Object.values(byPatient).filter(n => n >= TOTAL_EXPERIENCES).length
  const inProgressCount = Object.values(byPatient).filter(n => n > 0 && n < TOTAL_EXPERIENCES).length

  const stats = [
    { title: 'Total de Pacientes', value: totalPatients ?? 0,  icon: Users         },
    { title: 'Ativos hoje',        value: activeToday ?? 0,    icon: Activity      },
    { title: 'Concluíram',         value: completedCount,       icon: CheckCircle2  },
    { title: 'Em andamento',       value: inProgressCount,      icon: Clock         },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Painel Administrativo</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pacientes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPatients?.map(p => (
                <Link
                  key={p.id}
                  href={`/admin/pacientes/${p.id}`}
                  className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{p.full_name}</p>
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {p.path_type === 'interactive'  ? 'Interativo'  :
                     p.path_type === 'traditional'  ? 'Tradicional' : 'Sem caminho'}
                  </Badge>
                </Link>
              ))}
              {!recentPatients?.length && (
                <p className="text-sm text-muted-foreground">Nenhum paciente cadastrado.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity?.map(log => (
                <div key={log.id} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      {(log.patients as unknown as { full_name: string } | null)?.full_name ?? 'Paciente'}
                      {' — '}
                      {log.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
              {!recentActivity?.length && (
                <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Lock, CheckCircle2, Circle, PlayCircle, ArrowRight,
  Compass, Swords, Brain, Target, Star, Grid3x3,
  FlaskConical, Heart, Users, MessageSquare, Palette,
  Cpu, Wrench, Trophy, GraduationCap
} from 'lucide-react'
import type { Experience, PatientExperience, Patient } from '@/types/database'
import PathSelector from './PathSelector'

const experienceIcons: Record<number, React.ElementType> = {
  0: Compass, 1: Swords, 2: Brain, 3: Target, 4: Star,
  5: Grid3x3, 6: FlaskConical, 7: Heart, 8: Users,
  9: MessageSquare, 10: Palette, 11: Cpu, 12: Wrench, 13: Trophy,
  14: GraduationCap,
}

const coverImages: Record<number, string> = {
  13: '/images/cover-cst.png',
  0:  '/images/cover-jornada.png',
  14: '/images/cover-cslb.png',
  1:  '/images/cover-riasec-battle-cards.png',
  2:  '/images/cover-decifra-mente.png',
  3:  '/images/cover-agencia-missao-impossivel.png',
  4:  '/images/cover-super-quem.png',
  5:  '/images/cover-jogo-da-memoria.png',
  6:  '/images/cover-expedicao-cientifica.png',
  7:  '/images/cover-hq-da-saude.png',
  8:  '/images/cover-face-a-face.png',
  9:  '/images/cover-quem-fala-isso.png',
  10: '/images/cover-uma-noite-no-museu.png',
  11: '/images/cover-inside-exe.png',
  12: '/images/cover-engenhoso.png',
}

const statusConfig = {
  locked: { label: 'Bloqueado', icon: Lock, variant: 'secondary' as const, color: 'text-muted-foreground' },
  unlocked: { label: 'Disponivel', icon: Circle, variant: 'outline' as const, color: 'text-blue-500' },
  in_progress: { label: 'Em andamento', icon: PlayCircle, variant: 'default' as const, color: 'text-yellow-500' },
  completed: { label: 'Concluido', icon: CheckCircle2, variant: 'default' as const, color: 'text-green-500' },
}

export default async function PatientPainelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Patient | null }

  const { data: experiences } = await supabase
    .from('experiences')
    .select('*')
    .order('order_index') as { data: Experience[] | null }

  const { data: progress } = await supabase
    .from('patient_experiences')
    .select('*')
    .eq('patient_id', user.id) as { data: PatientExperience[] | null }

  if (!patient?.path_type) {
    return <PathSelector patientId={user.id} patientName={patient?.full_name || ''} />
  }

  const progressMap = new Map(progress?.map(p => [p.experience_id, p]) ?? [])

  const filteredExperiences = experiences?.filter(exp => {
    if (patient.path_type === 'traditional') {
      return exp.type === 'traditional' || exp.type === 'universal'
    }
    return exp.type === 'interactive' || exp.type === 'universal'
  }) ?? []

  const completedCount = filteredExperiences.filter(exp =>
    progressMap.get(exp.id)?.status === 'completed'
  ).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Ola, {patient?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          {completedCount} de {filteredExperiences.length} experiencias concluidas
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredExperiences.map(exp => {
          const pe = progressMap.get(exp.id)
          const patientMax = patient?.max_experience_unlocked ?? 0
          const status: string =
            pe?.status === 'completed' || pe?.status === 'in_progress'
              ? pe.status
              : exp.order_index <= patientMax
                ? 'unlocked'
                : 'locked'
          const cfg = statusConfig[status]
          const Icon = experienceIcons[exp.id] ?? Circle
          const StatusIcon = cfg.icon
          const isAccessible = status === 'unlocked' || status === 'in_progress' || status === 'completed'

          const cover = coverImages[exp.id]

          return (
            <Card key={exp.id} className={`overflow-hidden ${!isAccessible ? 'opacity-60' : ''}`}>
              {cover && (
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={cover}
                    alt={exp.title}
                    className="w-full h-full object-cover object-top"
                  />
                  {!isAccessible && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <Lock className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={cfg.variant} className="text-xs">
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {cfg.label}
                    </Badge>
                  </div>
                </div>
              )}
              <CardHeader className="pb-2">
                {!cover && (
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg bg-muted ${cfg.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant={cfg.variant} className="text-xs">
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {cfg.label}
                    </Badge>
                  </div>
                )}
                <CardTitle className="text-base mt-3">{exp.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{exp.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {isAccessible && status !== 'completed' ? (
                  <a href={`/experiencia/${exp.slug}`} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1e88e5] text-white text-sm font-medium px-3 py-1.5 w-full hover:bg-[#1976d2] transition-colors">
                    {status === 'in_progress' ? 'Continuar' : 'Iniciar'}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : status === 'completed' ? (
                  <a href={`/experiencia/${exp.slug}`} className="inline-flex items-center justify-center rounded-md border border-input bg-background text-sm font-medium px-3 py-1.5 w-full hover:bg-accent transition-colors">
                    Revisar
                  </a>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

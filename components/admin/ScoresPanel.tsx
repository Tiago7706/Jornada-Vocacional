'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

/* ─── Tipos ─────────────────────────────────────────────────── */
interface ScoreEntry {
  experience_id: number
  experience_title: string
  scores: Record<string, unknown>
}

/* ─── Mapeamento de modo de exibição por jogo ────────────────── */
type DisplayMode =
  | 'riasec'
  | 'personality'
  | 'area-bars'
  | 'value-bars'
  | 'course-stars'
  | 'pontos-stars'
  | 'cslb-ranking'
  | 'jv-results'

const DISPLAY_MODE: Record<number, DisplayMode> = {
  0:  'jv-results',
  1:  'riasec',
  2:  'personality',
  3:  'area-bars',
  4:  'value-bars',
  5:  'course-stars',
  6:  'course-stars',
  7:  'course-stars',
  8:  'course-stars',
  9:  'pontos-stars',
  10: 'pontos-stars',
  11: 'course-stars',
  12: 'course-stars',
  14: 'cslb-ranking',
}

const RIASEC_META: Record<string, { label: string; color: string }> = {
  R: { label: 'Realista',       color: 'bg-orange-400' },
  I: { label: 'Investigativo',  color: 'bg-blue-500'   },
  A: { label: 'Artístico',      color: 'bg-pink-400'   },
  S: { label: 'Social',         color: 'bg-green-500'  },
  E: { label: 'Empreendedor',   color: 'bg-amber-500'  },
  C: { label: 'Convencional',   color: 'bg-purple-400' },
}

/* ─── Barra horizontal genérica ─────────────────────────────── */
function Bar({
  label, value, max, color = 'bg-indigo-500', suffix = '',
}: {
  label: string; value: number; max: number; color?: string; suffix?: string
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3 py-0.5">
      <span className="w-40 shrink-0 text-sm truncate text-muted-foreground">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3.5 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-14 text-right text-sm font-mono tabular-nums">
        {value % 1 === 0 ? value : value.toFixed(1)}{suffix}
      </span>
    </div>
  )
}

/* ─── Exibições por tipo ─────────────────────────────────────── */

function RiasecDisplay({ scores }: { scores: Record<string, unknown> }) {
  const keys = ['R', 'I', 'A', 'S', 'E', 'C'] as const
  const vals = keys.map(k => ({ key: k, val: Number(scores[k] ?? 0) }))
  const sorted = [...vals].sort((a, b) => b.val - a.val)
  const max = sorted[0]?.val ?? 1

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mb-2">
        <span>Perfil: <strong>{String(scores.code ?? '—')}</strong></span>
        <span>Tipo dominante: <strong>{String(scores.top ?? '—')}</strong></span>
        <span>Âncora: <strong>{String(scores.ancora ?? '—')}</strong></span>
        <span>XP: <strong>{String(scores.xp ?? '—')}</strong></span>
        <span>Consistência: <strong>{String(scores.consistency ?? '—')}</strong></span>
        <span>Abstenções: <strong>{String(scores.abstencoes ?? '—')}</strong></span>
      </div>
      <div className="space-y-1">
        {sorted.map(({ key, val }) => (
          <Bar
            key={key}
            label={`${key} — ${RIASEC_META[key].label}`}
            value={val}
            max={max}
            color={RIASEC_META[key].color}
          />
        ))}
      </div>
    </div>
  )
}

function PersonalityDisplay({ scores }: { scores: Record<string, unknown> }) {
  const color = String(scores.color ?? '#6366f1')
  return (
    <div className="flex items-center gap-4 py-2">
      <div
        className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-lg"
        style={{ background: color }}
      >
        {String(scores.tipo ?? '?').slice(0, 2)}
      </div>
      <div>
        <p className="font-bold text-lg">{String(scores.nome ?? '—')}</p>
        <Badge variant="outline" style={{ borderColor: color, color }}>{String(scores.tipo ?? '—')}</Badge>
      </div>
    </div>
  )
}

function AreaBarsDisplay({ scores }: { scores: Record<string, unknown> }) {
  const areas = scores.areas as Record<string, number> | undefined
  if (!areas) return null
  const entries = Object.entries(areas).sort(([, a], [, b]) => b - a)
  const max = entries[0]?.[1] ?? 100
  return (
    <div className="space-y-1">
      {entries.map(([label, val]) => (
        <Bar key={label} label={label} value={val} max={max} color="bg-violet-500" suffix=" pts" />
      ))}
    </div>
  )
}

function ValueBarsDisplay({ scores }: { scores: Record<string, unknown> }) {
  const entries = Object.entries(scores)
    .map(([k, v]) => [k, Number(v)] as [string, number])
    .sort(([, a], [, b]) => b - a)
  const max = entries[0]?.[1] ?? 1
  return (
    <div className="space-y-1">
      {entries.map(([label, val]) => (
        <Bar key={label} label={label} value={val} max={max} color="bg-emerald-500" />
      ))}
    </div>
  )
}

function CourseStarsDisplay({ scores }: { scores: Record<string, unknown> }) {
  const entries = Object.entries(scores)
    .map(([k, v]) => [k, Number(v)] as [string, number])
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="divide-y divide-gray-100">
      {entries.map(([name, stars]) => (
        <div key={name} className="flex items-center justify-between py-1.5 text-sm">
          <span className="truncate pr-4">{name}</span>
          <span className="shrink-0 text-amber-400 font-mono">
            {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
            <span className="text-muted-foreground ml-1 text-xs">({stars}/5)</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function PontosStarsDisplay({ scores }: { scores: Record<string, unknown> }) {
  const pontos    = Number(scores.pontos ?? 0)
  const pontosR1  = scores.pontosR1 != null ? Number(scores.pontosR1) : null
  const pontosR2  = scores.pontosR2 != null ? Number(scores.pontosR2) : null
  const interesse = scores.interesse as Record<string, number> | undefined

  return (
    <div className="space-y-4">
      {/* pontos */}
      <div className="flex flex-wrap gap-6 text-sm">
        <div className="text-center">
          <p className="text-2xl font-bold">{pontos}</p>
          <p className="text-xs text-muted-foreground">pontos totais</p>
        </div>
        {pontosR1 != null && (
          <div className="text-center">
            <p className="text-2xl font-bold">{pontosR1}</p>
            <p className="text-xs text-muted-foreground">rodada 1</p>
          </div>
        )}
        {pontosR2 != null && (
          <div className="text-center">
            <p className="text-2xl font-bold">{pontosR2}</p>
            <p className="text-xs text-muted-foreground">rodada 2</p>
          </div>
        )}
      </div>

      {/* interesse */}
      {interesse && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Interesse por curso
          </p>
          <CourseStarsDisplay scores={interesse as Record<string, unknown>} />
        </>
      )}
    </div>
  )
}

const JV_VALORES: Record<string, string> = {
  Seg:'Segurança', Cri:'Criatividade', Alt:'Altruísmo', Est:'Estética',
  Var:'Variedade', Est_I:'Est. Intelectual', Pre:'Prestígio', Equ:'Equilíbrio',
  Des:'Desenvolvimento', Ges:'Gestão', Ind:'Independência', Ret:'Ret. Econômico',
  Rel:'Relacionamentos', Pro:'Progressão', Amb:'Ambiente',
}
const JV_BANDURA: Record<string, string> = {
  Adm:'Administração', Bio:'Ciências Biológicas', Sau:'Saúde',
  Hum:'Ciências Humanas', Com:'Comunicação', Art:'Artes e Design',
  Exa:'Ciências Exatas/TI', Eng:'Engenharia', Mil:'Carreiras Militares',
}
const MBTI_PAIRS = [['E','I'],['S','N'],['T','F'],['J','P']] as const

function JVResultsDisplay({ scores }: { scores: Record<string, unknown> }) {
  const holland     = scores.holland    as Record<string, number> | undefined
  const hollandCode = scores.hollandCode as string | undefined
  const mbti        = scores.mbti       as { type: string; scores: Record<string, number> } | undefined
  const valores     = scores.valores    as Record<string, number> | undefined
  const bandura     = scores.bandura    as Record<string, number> | undefined

  const hollandEntries = holland
    ? Object.entries(holland).sort(([, a], [, b]) => b - a)
    : []
  const maxH = hollandEntries[0]?.[1] ?? 100

  const valoresEntries = valores
    ? Object.entries(valores).sort(([, a], [, b]) => b - a)
    : []
  const maxV = valoresEntries[0]?.[1] ?? 100

  const banduraEntries = bandura
    ? Object.entries(bandura).sort(([, a], [, b]) => b - a)
    : []
  const maxB = banduraEntries[0]?.[1] ?? 100

  return (
    <div className="space-y-5">
      {/* Holland */}
      {hollandEntries.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Holland — <span className="text-foreground font-bold">{hollandCode ?? '—'}</span>
          </p>
          <div className="space-y-0.5">
            {hollandEntries.map(([key, val]) => (
              <Bar
                key={key}
                label={`${key} — ${RIASEC_META[key]?.label ?? key}`}
                value={val}
                max={maxH}
                color={RIASEC_META[key]?.color ?? 'bg-indigo-500'}
                suffix="%"
              />
            ))}
          </div>
        </div>
      )}

      {/* MBTI */}
      {mbti?.type && mbti?.scores && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            MBTI — <span className="text-foreground font-bold">{mbti.type}</span>
          </p>
          <div className="space-y-0.5">
            {MBTI_PAIRS.map(([a, b]) => {
              const va = mbti.scores?.[a] ?? 0
              const vb = mbti.scores?.[b] ?? 0
              const total = va + vb || 1
              const pctA = Math.round((va / total) * 100)
              return (
                <div key={a} className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-right font-mono font-bold">{a}</span>
                  <div className="flex-1 flex gap-0.5 h-3 rounded-full overflow-hidden bg-gray-100">
                    <div className="bg-violet-500 h-full" style={{ width: `${pctA}%` }} />
                    <div className="bg-gray-300 h-full flex-1" />
                  </div>
                  <span className="w-5 font-mono font-bold">{b}</span>
                  <span className="text-xs text-muted-foreground w-20 text-right">
                    {a}:{va} / {b}:{vb}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Valores */}
      {valoresEntries.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Valores de Trabalho</p>
          <div className="space-y-0.5">
            {valoresEntries.map(([key, val]) => (
              <Bar key={key} label={JV_VALORES[key] ?? key} value={val} max={maxV} color="bg-emerald-500" suffix="%" />
            ))}
          </div>
        </div>
      )}

      {/* Bandura */}
      {banduraEntries.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Autoeficácia (Bandura)</p>
          <div className="space-y-0.5">
            {banduraEntries.map(([key, val]) => (
              <Bar key={key} label={JV_BANDURA[key] ?? key} value={val} max={maxB} color="bg-sky-500" suffix="%" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CslbRankingDisplay({ scores }: { scores: Record<string, unknown> }) {
  type CourseRow = { name: string; area: string; stars: number }
  const allCourses = scores.allCourses as CourseRow[] | undefined
  const ratings    = scores.ratings    as Record<string, number> | undefined

  const courses: CourseRow[] = allCourses?.length
    ? allCourses
    : ratings
      ? Object.entries(ratings).map(([name, stars]) => ({ name, area: 'Outras Áreas', stars }))
      : []

  if (courses.length === 0) return (
    <p className="text-sm text-muted-foreground py-2">
      Dados do CSLB não disponíveis. O participante precisará refazer a avaliação.
    </p>
  )

  const byArea = courses.reduce<Record<string, CourseRow[]>>((acc, c) => {
    const key = c.area || 'Outras Áreas'
    acc[key] = acc[key] ?? []
    acc[key].push(c)
    return acc
  }, {})

  Object.values(byArea).forEach(list => list.sort((a, b) => b.stars - a.stars))

  const areaAvg = (list: CourseRow[]) =>
    list.reduce((s, c) => s + c.stars, 0) / list.length

  const areasSorted = Object.keys(byArea).sort(
    (a, b) => areaAvg(byArea[b]) - areaAvg(byArea[a])
  )

  const totalAvg = courses.reduce((s, c) => s + c.stars, 0) / courses.length

  return (
    <div className="space-y-4">
      {/* Cabeçalho resumo */}
      <div className="flex flex-wrap items-center gap-6 py-2 border-b">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Cursos avaliados</p>
          <p className="text-2xl font-bold">{courses.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Média geral</p>
          <p className="text-2xl font-bold text-amber-500">
            {totalAvg.toFixed(2)} <span className="text-sm font-normal">/ 5</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Áreas</p>
          <p className="text-2xl font-bold">{areasSorted.length}</p>
        </div>
      </div>

      {/* Cursos por área */}
      {areasSorted.map(area => {
        const list = byArea[area]
        const avg = areaAvg(list)
        return (
          <div key={area}>
            <div className="flex items-center justify-between border-b pb-1 mb-1">
              <p className="text-xs font-bold text-muted-foreground">{area}</p>
              <p className="text-xs text-muted-foreground">{list.length} curso{list.length !== 1 ? 's' : ''}</p>
              <p className="text-xs font-semibold text-amber-600">média {avg.toFixed(2)}/5</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
              {list.map(c => (
                <div key={c.name} className="flex items-center justify-between rounded-md bg-muted/30 border border-border/40 px-3 py-1.5 text-sm">
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
}

/* ─── Card colapsável por jogo ───────────────────────────────── */
function ScoreCard({ entry }: { entry: ScoreEntry }) {
  const [open, setOpen] = useState(false)
  const mode = DISPLAY_MODE[entry.experience_id]
  if (!mode) return null

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors cursor-pointer text-left"
        >
          {open
            ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
          {entry.experience_title}
        </button>
        <Badge variant="outline" className="text-xs text-green-600 border-green-300 mr-4 shrink-0">
          concluído
        </Badge>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t bg-muted/20">
          {mode === 'jv-results'    && <JVResultsDisplay   scores={entry.scores} />}
          {mode === 'riasec'        && <RiasecDisplay      scores={entry.scores} />}
          {mode === 'personality'   && <PersonalityDisplay scores={entry.scores} />}
          {mode === 'area-bars'     && <AreaBarsDisplay    scores={entry.scores} />}
          {mode === 'value-bars'    && <ValueBarsDisplay   scores={entry.scores} />}
          {mode === 'course-stars'  && <CourseStarsDisplay scores={entry.scores} />}
          {mode === 'pontos-stars'  && <PontosStarsDisplay scores={entry.scores} />}
          {mode === 'cslb-ranking'  && <CslbRankingDisplay scores={entry.scores} />}
        </div>
      )}
    </div>
  )
}

/* ─── Componente principal exportado ─────────────────────────── */
export default function ScoresPanel({ entries }: { entries: ScoreEntry[] }) {
  if (entries.length === 0) return (
    <p className="text-sm text-muted-foreground">Nenhum jogo concluído ainda.</p>
  )

  return (
    <div className="space-y-2">
      {entries.map(e => <ScoreCard key={e.experience_id} entry={e} />)}
    </div>
  )
}

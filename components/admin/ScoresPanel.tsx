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

const DISPLAY_MODE: Record<number, DisplayMode> = {
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

/* ─── Card colapsável por jogo ───────────────────────────────── */
function ScoreCard({ entry }: { entry: ScoreEntry }) {
  const [open, setOpen] = useState(false)
  const mode = DISPLAY_MODE[entry.experience_id]
  if (!mode) return null

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          {open
            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
            : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          {entry.experience_title}
        </span>
        <Badge variant="outline" className="text-xs text-green-600 border-green-300">
          concluído
        </Badge>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t bg-muted/20">
          {mode === 'riasec'       && <RiasecDisplay    scores={entry.scores} />}
          {mode === 'personality'  && <PersonalityDisplay scores={entry.scores} />}
          {mode === 'area-bars'    && <AreaBarsDisplay   scores={entry.scores} />}
          {mode === 'value-bars'   && <ValueBarsDisplay  scores={entry.scores} />}
          {mode === 'course-stars' && <CourseStarsDisplay scores={entry.scores} />}
          {mode === 'pontos-stars' && <PontosStarsDisplay scores={entry.scores} />}
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

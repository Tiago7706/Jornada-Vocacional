'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const RIASEC_LABEL: Record<string, string> = {
  R: 'Realista', I: 'Investigativo', A: 'Artístico',
  S: 'Social', E: 'Empreendedor', C: 'Convencional',
}
const RIASEC_COLOR: Record<string, string> = {
  R: 'bg-orange-400', I: 'bg-blue-500', A: 'bg-pink-400',
  S: 'bg-green-500', E: 'bg-amber-500', C: 'bg-purple-400',
}
const JV_VALORES: Record<string, string> = {
  Seg: 'Segurança', Cri: 'Criatividade', Alt: 'Altruísmo', Est: 'Estética',
  Var: 'Variedade', Est_I: 'Est. Intelectual', Pre: 'Prestígio', Equ: 'Equilíbrio',
  Des: 'Desenvolvimento', Ges: 'Gestão', Ind: 'Independência', Ret: 'Ret. Econômico',
  Rel: 'Relacionamentos', Pro: 'Progressão', Amb: 'Ambiente',
}
const JV_BANDURA: Record<string, string> = {
  Adm: 'Administração', Bio: 'Ciências Biológicas', Sau: 'Saúde',
  Hum: 'Ciências Humanas', Com: 'Comunicação', Art: 'Artes e Design',
  Exa: 'Ciências Exatas/TI', Eng: 'Engenharia', Mil: 'Carreiras Militares',
}
const MBTI_PAIRS = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']] as const

function Bar({ label, value, max, color, suffix = '' }: {
  label: string; value: number; max: number; color: string; suffix?: string
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

export default function JVScoreCard({ scores }: { scores: Record<string, unknown> }) {
  const [open, setOpen] = useState(false)

  const holland     = scores.holland     as Record<string, number> | undefined
  const hollandCode = scores.hollandCode as string | undefined
  const mbti        = scores.mbti        as { type?: string; scores?: Record<string, number> } | undefined
  const valores     = scores.valores     as Record<string, number> | undefined
  const bandura     = scores.bandura     as Record<string, number> | undefined

  const hollandEntries = holland ? Object.entries(holland).sort(([, a], [, b]) => b - a) : []
  const maxH = hollandEntries[0]?.[1] ?? 100

  const valoresEntries = valores ? Object.entries(valores).sort(([, a], [, b]) => b - a) : []
  const maxV = valoresEntries[0]?.[1] ?? 100

  const banduraEntries = bandura ? Object.entries(bandura).sort(([, a], [, b]) => b - a) : []
  const maxB = banduraEntries[0]?.[1] ?? 100

  return (
    <Card>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-black/5 transition-colors rounded-t-lg"
      >
        <span className="flex items-center gap-2">
          {open
            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
            : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          Resultado — Jornada Vocacional
        </span>
        <span className="flex items-center gap-3 text-sm">
          {hollandCode && (
            <span className="font-black text-violet-600">Holland: {hollandCode}</span>
          )}
          {mbti?.type && (
            <span className="font-black text-indigo-600">MBTI: {mbti.type}</span>
          )}
        </span>
      </button>

      {open && (
        <CardContent className="border-t pt-4 space-y-5">

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
                    label={`${key} — ${RIASEC_LABEL[key] ?? key}`}
                    value={val}
                    max={maxH}
                    color={RIASEC_COLOR[key] ?? 'bg-indigo-500'}
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
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Valores de Trabalho
              </p>
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
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Autoeficácia (Bandura)
              </p>
              <div className="space-y-0.5">
                {banduraEntries.map(([key, val]) => (
                  <Bar key={key} label={JV_BANDURA[key] ?? key} value={val} max={maxB} color="bg-sky-500" suffix="%" />
                ))}
              </div>
            </div>
          )}

        </CardContent>
      )}
    </Card>
  )
}

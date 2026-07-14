'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface CourseRow { name: string; area: string; stars: number }

export default function CSLBScoreCard({ scores }: { scores: Record<string, unknown> }) {
  const [open, setOpen] = useState(false)

  const allCourses = scores.allCourses as CourseRow[] | undefined
  const ratings    = scores.ratings    as Record<string, number> | undefined

  const courses: CourseRow[] = allCourses?.length
    ? allCourses
    : ratings
      ? Object.entries(ratings).map(([name, stars]) => ({ name, area: 'Outras Áreas', stars }))
      : []

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

  const totalAvg = courses.length > 0
    ? courses.reduce((s, c) => s + c.stars, 0) / courses.length
    : 0

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
          Resultado — Avaliação CSLB
        </span>
        <span className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{courses.length} cursos</span>
          <span className="text-base font-black text-amber-500">
            {totalAvg.toFixed(2)}<span className="text-xs font-normal">/5</span>
          </span>
        </span>
      </button>

      {open && (
        <CardContent className="border-t pt-4 space-y-4">

          {/* Resumo */}
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

        </CardContent>
      )}
    </Card>
  )
}

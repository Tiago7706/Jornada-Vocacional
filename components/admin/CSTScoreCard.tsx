'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Trophy, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CST_COURSES } from '@/constants/cst-courses'

interface CSTScores {
  correct: number
  wrong: number
  total: number
  pct: number
  maxStreak: number
  ratings: Record<string, number>
  allCourses?: { name: string; area: string; stars: number }[]
  topCourses?: { name: string; area: string; stars: number }[]
}

export default function CSTScoreCard({ scores }: { scores: CSTScores }) {
  const [open, setOpen] = useState(false)

  const areaLookup = new Map(CST_COURSES.map(c => [c.n, c.a]))
  const ratings = scores.ratings ?? {}

  type CourseItem = { name: string; area: string; stars: number }
  const courses: CourseItem[] = Object.entries(ratings).map(([name, stars]) => ({
    name,
    area: areaLookup.get(name) ?? 'Outras Áreas',
    stars: Number(stars),
  }))

  const byArea = courses.reduce<Record<string, CourseItem[]>>((acc, c) => {
    acc[c.area] = acc[c.area] ?? []
    acc[c.area].push(c)
    return acc
  }, {})

  Object.values(byArea).forEach(list => list.sort((a, b) => b.stars - a.stars))

  const areaAvg = (list: CourseItem[]) =>
    list.reduce((s, c) => s + c.stars, 0) / list.length

  const areasSorted = Object.keys(byArea).sort(
    (a, b) => areaAvg(byArea[b]) - areaAvg(byArea[a])
  )

  const totalAvg = courses.length > 0
    ? courses.reduce((s, c) => s + c.stars, 0) / courses.length
    : 0

  const isGreen = scores.pct >= 80

  return (
    <Card className={isGreen ? 'border-green-300 bg-green-50' : 'border-amber-200 bg-amber-50'}>
      {/* Cabeçalho clicável */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-black/5 transition-colors rounded-t-lg"
      >
        <span className="flex items-center gap-2">
          {open
            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
            : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <Trophy className="h-4 w-4" />
          Resultado — Desafio CST
        </span>
        {/* Resumo sempre visível no header */}
        <span className="flex items-center gap-3">
          <span className="text-base font-black">{scores.pct}%</span>
          {isGreen ? (
            <span className="flex items-center gap-1 rounded-md bg-green-600 text-white px-2 py-0.5 text-xs font-bold">
              <Tag className="h-3 w-3" /> DESCONTO 20%
            </span>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground border-amber-300">
              sem desconto
            </Badge>
          )}
        </span>
      </button>

      {/* Conteúdo expansível */}
      {open && (
        <CardContent className="border-t pt-4 space-y-4">

          {/* Métricas */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-black">{scores.pct}%</p>
              <p className="text-xs text-muted-foreground">aproveitamento</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{scores.correct}</p>
              <p className="text-xs text-muted-foreground">acertos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{scores.wrong}</p>
              <p className="text-xs text-muted-foreground">erros</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">🔥 {scores.maxStreak}</p>
              <p className="text-xs text-muted-foreground">melhor sequência</p>
            </div>
          </div>

          {/* Totais + média geral */}
          {courses.length > 0 && (
            <div className="flex flex-wrap items-center gap-6 py-2 border-t border-b">
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
          )}

          {/* Cursos por área */}
          {areasSorted.map(area => {
            const list = byArea[area]
            const avg = areaAvg(list)
            return (
              <div key={area}>
                <div className="flex items-center justify-between border-b pb-1 mb-1">
                  <p className="text-xs font-bold text-muted-foreground">{area}</p>
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

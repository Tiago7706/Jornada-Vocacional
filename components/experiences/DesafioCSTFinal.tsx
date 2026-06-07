'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { GameProps } from '@/types/database'
import { CST_COURSES, type CSTCourse } from '@/constants/cst-courses'

// ─── Constants ────────────────────────────────────────────────────────────────

const AREAS = [
  'Administração, Negócios e Serviços',
  'Ciências Biológicas e da Terra',
  'Saúde e Bem Estar',
  'Ciências Humanas e Sociais',
  'Comunicação e Informação',
  'Artes e Design',
  'Ciências Exatas e Informática',
  'Engenharia e Produção',
  'Carreiras Militares',
]

const AREA_COLORS = [
  '#e8b86d','#7c6af7','#3dcb87','#ff5470',
  '#38bdf8','#f472b6','#fb923c','#a3e635','#c084fc'
]

const TIMER_SECS = 15

// ─── Types ────────────────────────────────────────────────────────────────────

interface AreaStats { correct: number; total: number }

interface GameState {
  phase: 'cover' | 'game' | 'finish'
  queueNames: string[]
  current: number
  correct: number
  wrong: number
  streak: number
  maxStreak: number
  areaStats: Record<string, AreaStats>
  ratings: Record<string, number>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function initAreaStats(): Record<string, AreaStats> {
  const s: Record<string, AreaStats> = {}
  AREAS.forEach(a => { s[a] = { correct: 0, total: 0 } })
  return s
}

function courseByName(name: string): CSTCourse | undefined {
  return CST_COURSES.find(c => c.n === name)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DesafioCSTFinal({
  patientId, experienceId, initialState, onStateChange, onComplete
}: GameProps) {
  const saved = initialState as Partial<GameState> | undefined

  const [phase, setPhase] = useState<'cover'|'game'|'finish'>(
    saved?.phase ?? 'cover'
  )
  const [queue, setQueue] = useState<CSTCourse[]>(() => {
    if (saved?.queueNames) return saved.queueNames.map(n => courseByName(n) ?? CST_COURSES[0])
    return shuffle([...CST_COURSES])
  })
  const [current, setCurrent] = useState(saved?.current ?? 0)
  const [correct, setCorrect] = useState(saved?.correct ?? 0)
  const wrong = useRef(saved?.wrong ?? 0)
  const [streak, setStreak] = useState(saved?.streak ?? 0)
  const [maxStreak, setMaxStreak] = useState(saved?.maxStreak ?? 0)
  const [areaStats, setAreaStats] = useState<Record<string, AreaStats>>(
    saved?.areaStats ?? initAreaStats()
  )
  const [ratings, setRatings] = useState<Record<string, number>>(saved?.ratings ?? {})

  const [answered, setAnswered] = useState(false)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [currentRating, setCurrentRating] = useState(0)
  const [timerSecs, setTimerSecs] = useState(TIMER_SECS)
  const [timerActive, setTimerActive] = useState(false)
  const [animKey, setAnimKey] = useState(0)

  const saveTimer = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const triggerSave = useCallback((state: GameState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onStateChange(state as Record<string, unknown>), 1500)
  }, [onStateChange])

  // Start timer when question loads
  useEffect(() => {
    if (phase !== 'game' || answered) return
    setTimerSecs(TIMER_SECS)
    setTimerActive(true)
    timerRef.current = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setTimerActive(false)
          // Auto-select wrong (time expired)
          handleTimeOut()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, phase, answered])

  function handleTimeOut() {
    if (answered) return
    setAnswered(true)
    setIsCorrect(false)
    setSelectedArea(null)
    wrong.current += 1
    const course = queue[current]
    setAreaStats(prev => {
      const n = { ...prev }
      n[course.a] = { correct: (n[course.a]?.correct || 0), total: (n[course.a]?.total || 0) + 1 }
      return n
    })
    setStreak(0)
  }

  function checkAnswer(chosen: string) {
    if (answered) return
    setAnswered(true)
    if (timerRef.current) clearInterval(timerRef.current)
    setTimerActive(false)

    const course = queue[current]
    const ok = chosen === course.a
    setSelectedArea(chosen)
    setIsCorrect(ok)

    if (ok) {
      setCorrect(c => c + 1)
      setStreak(s => {
        const ns = s + 1
        setMaxStreak(m => Math.max(m, ns))
        return ns
      })
    } else {
      wrong.current += 1
      setStreak(0)
    }
    setAreaStats(prev => {
      const n = { ...prev }
      const a = n[course.a] || { correct: 0, total: 0 }
      n[course.a] = { correct: a.correct + (ok ? 1 : 0), total: a.total + 1 }
      return n
    })
  }

  function handleRating(val: number) {
    setCurrentRating(val)
  }

  function handleNext() {
    const course = queue[current]
    const newRatings = { ...ratings, [course.n]: currentRating }
    setRatings(newRatings)

    if (current >= queue.length - 1) {
      // Game over
      const finalState: GameState = {
        phase: 'finish', queueNames: queue.map(c => c.n),
        current, correct, wrong: wrong.current, streak, maxStreak, areaStats, ratings: newRatings
      }
      setPhase('finish')
      const accuracy = Math.round((correct / queue.length) * 100)
      onComplete(
        { accuracy, correct, wrong: wrong.current, areaStats, ratings: newRatings, maxStreak, source: 'CST_DESAFIO_153' },
        { ratings: newRatings, areaStats }
      )
    } else {
      setCurrent(c => c + 1)
      setAnswered(false)
      setSelectedArea(null)
      setIsCorrect(null)
      setCurrentRating(0)
      setAnimKey(k => k + 1)
      triggerSave({
        phase: 'game', queueNames: queue.map(c => c.n),
        current: current + 1, correct, wrong: wrong.current, streak, maxStreak, areaStats, ratings: newRatings
      })
    }
  }

  // ── Cover ──────────────────────────────────────────────────────────────────

  if (phase === 'cover') {
    const savedCount = saved?.current ?? 0
    return (
      <div style={{ background:'#0f0e17', minHeight:'100vh', color:'#fffffe', fontFamily:'system-ui,sans-serif' }}>
        <div style={{ maxWidth:540, margin:'0 auto', padding:'0 16px 60px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', textAlign:'center' }}>
          <div style={{ width:88, height:88, borderRadius:'50%', background:'linear-gradient(135deg,#e8b86d,#7c6af7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, marginBottom:20, boxShadow:'0 0 40px rgba(232,184,109,.4)' }}>
            🎓
          </div>
          <h1 style={{ fontSize:'clamp(24px,6vw,34px)', fontWeight:800, marginBottom:8, lineHeight:1.2 }}>Desafio CST</h1>
          <p style={{ color:'#a7a9be', fontSize:14, maxWidth:380, marginBottom:24 }}>
            Você consegue identificar a área de cada Curso Superior de Tecnologia? Associe corretamente e avalie seu interesse!
          </p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center', marginBottom:28 }}>
            {['🎓 153 cursos','9 áreas','⏱ 15s/questão','⭐ Avalie o interesse'].map(c => (
              <span key={c} style={{ background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:99, padding:'4px 13px', fontSize:12, color:'#a7a9be' }}>{c}</span>
            ))}
          </div>

          {savedCount > 0 && (
            <div style={{ background:'linear-gradient(135deg,#065f46,#0d9488)', borderRadius:12, padding:'12px 20px', marginBottom:20, width:'100%', maxWidth:400, textAlign:'left' }}>
              <div style={{ fontWeight:700, color:'#fff', fontSize:13, marginBottom:2 }}>Progresso salvo encontrado</div>
              <div style={{ color:'rgba(255,255,255,.75)', fontSize:12, marginBottom:10 }}>{savedCount} de 153 questões respondidas</div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setPhase('game')} style={{ background:'#fff', color:'#0d9488', border:'none', borderRadius:99, padding:'7px 16px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  Continuar →
                </button>
                <button onClick={() => { setQueue(shuffle([...CST_COURSES])); setCurrent(0); setCorrect(0); wrong.current=0; setStreak(0); setMaxStreak(0); setAreaStats(initAreaStats()); setRatings({}) }} style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1px solid rgba(255,255,255,.3)', borderRadius:99, padding:'7px 14px', fontSize:12, cursor:'pointer' }}>
                  Recomeçar
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setPhase('game')}
            style={{ background:'linear-gradient(135deg,#e8b86d,#fb923c)', color:'#0f0e17', border:'none', borderRadius:99, padding:'14px 36px', fontSize:15, fontWeight:800, cursor:'pointer', boxShadow:'0 4px 20px rgba(232,184,109,.4)' }}
          >
            {savedCount > 0 ? 'Ir para o desafio →' : 'Iniciar Desafio →'}
          </button>
        </div>
      </div>
    )
  }

  // ── Finish ─────────────────────────────────────────────────────────────────

  if (phase === 'finish') {
    const total = correct + wrong.current
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0
    const passed = pct >= 80

    const sortedByStars = [...queue].sort((a, b) => {
      const ra = ratings[a.n] || 0, rb = ratings[b.n] || 0
      return rb - ra || a.n.localeCompare(b.n)
    })

    const Wrap = ({ children }: { children: React.ReactNode }) => (
      <div style={{ background:'#1a1830', borderRadius:14, border:'1px solid rgba(255,255,255,.08)', padding:20, marginBottom:12 }}>
        {children}
      </div>
    )

    return (
      <div style={{ background:'#0f0e17', minHeight:'100vh', color:'#fffffe', fontFamily:'system-ui,sans-serif' }}>
        <div style={{ maxWidth:560, margin:'0 auto', padding:'16px 16px 60px' }}>
          {/* Result header */}
          <div style={{ background: passed ? 'linear-gradient(135deg,#0f2318,#0d4a2d)' : 'linear-gradient(135deg,#1a0a0a,#2a0f0f)', borderRadius:14, padding:'32px 24px', textAlign:'center', border:`1px solid ${passed ? 'rgba(61,203,135,.3)' : 'rgba(255,84,112,.3)'}`, marginBottom:16 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>{passed ? '🏆' : '📚'}</div>
            <div style={{ fontSize:48, fontWeight:800, color: passed ? '#3dcb87' : '#ff5470', marginBottom:4 }}>{pct}%</div>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>{passed ? 'Parabéns!' : 'Continue estudando!'}</div>
            <div style={{ color:'#a7a9be', fontSize:13 }}>
              ✅ {correct} acertos  ❌ {wrong.current} erros  🔥 Melhor sequência: {maxStreak}
            </div>
            {passed && (
              <div style={{ marginTop:14, padding:'10px 16px', background:'rgba(61,203,135,.12)', borderRadius:10, border:'1px solid rgba(61,203,135,.3)', fontSize:13 }}>
                🏷️ Você atingiu 80%+ e conquistou o desafio!
              </div>
            )}
          </div>

          {/* Area breakdown */}
          <Wrap>
            <div style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'.07em', color:'#e8b86d', marginBottom:14 }}>📊 Desempenho por Área</div>
            {AREAS.filter(a => areaStats[a]?.total > 0).sort((a, b) => {
              const sa = areaStats[a], sb = areaStats[b]
              const pa = sa.total ? sa.correct/sa.total : 0
              const pb = sb.total ? sb.correct/sb.total : 0
              return pb - pa
            }).map(area => {
              const s = areaStats[area]
              const p = s.total > 0 ? Math.round(s.correct/s.total*100) : 0
              const color = AREA_COLORS[AREAS.indexOf(area)]
              return (
                <div key={area} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ fontSize:12, color:'#a7a9be' }}>{area}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:'#a7a9be' }}>{s.correct}/{s.total}</span>
                  </div>
                  <div style={{ height:6, background:'rgba(255,255,255,.08)', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${p}%`, background:color, borderRadius:99 }} />
                  </div>
                </div>
              )
            })}
          </Wrap>

          {/* Star ranking - top 15 */}
          <Wrap>
            <div style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'.07em', color:'#f472b6', marginBottom:14 }}>⭐ Cursos de Maior Interesse</div>
            {sortedByStars.filter(c => (ratings[c.n] || 0) > 0).slice(0, 15).map((c, i) => {
              const stars = ratings[c.n] || 0
              const color = AREA_COLORS[AREAS.indexOf(c.a)]
              return (
                <div key={c.n} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
                  <span style={{ fontSize:12, color:'#64748b', width:20, textAlign:'right', flexShrink:0 }}>{i+1}.</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#fffffe', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.n}</div>
                    <div style={{ fontSize:11, color, marginTop:1 }}>{c.a}</div>
                  </div>
                  <div style={{ flexShrink:0, color:'#e8b86d', fontSize:13 }}>{'★'.repeat(stars)}{'☆'.repeat(5-stars)}</div>
                </div>
              )
            })}
            {sortedByStars.filter(c => (ratings[c.n] || 0) > 0).length === 0 && (
              <p style={{ color:'#64748b', fontSize:13 }}>Nenhum curso avaliado.</p>
            )}
          </Wrap>
        </div>
      </div>
    )
  }

  // ── Game ───────────────────────────────────────────────────────────────────

  const course = queue[current]
  const pct = Math.round(current / queue.length * 100)
  const timerPct = (timerSecs / TIMER_SECS) * 100
  const timerDanger = timerSecs <= 5

  return (
    <div style={{ background:'#0f0e17', minHeight:'100vh', color:'#fffffe', fontFamily:'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ position:'sticky', top:0, zIndex:100, padding:'10px 14px', background:'rgba(15,14,23,.92)', backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, maxWidth:560, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
            <span style={{ fontSize:11, color:'#3dcb87', fontWeight:700 }}>✅{correct}</span>
            <span style={{ fontSize:11, color:'#ff5470', fontWeight:700 }}>❌{wrong.current}</span>
          </div>
          <div style={{ flex:1, height:5, background:'rgba(255,255,255,.1)', borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#e8b86d,#f472b6)', borderRadius:99, transition:'width .4s' }} />
          </div>
          <span style={{ fontSize:11, color:'#a7a9be', flexShrink:0 }}>{current+1}/{queue.length}</span>
        </div>
        {/* Timer bar */}
        {!answered && (
          <div style={{ maxWidth:560, margin:'6px auto 0' }}>
            <div style={{ height:3, background:'rgba(255,255,255,.06)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${timerPct}%`, background: timerDanger ? '#ff5470' : '#38bdf8', borderRadius:99, transition:'width 1s linear' }} />
            </div>
            <div style={{ textAlign:'right', fontSize:10, color: timerDanger ? '#ff5470' : '#38bdf8', marginTop:2, fontWeight:700 }}>
              ⏱ {timerSecs}s
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth:560, margin:'0 auto', padding:'12px 14px 60px' }} key={animKey}>
        {/* Course card */}
        <div style={{ background:'#1a1830', borderRadius:14, border:'1px solid rgba(255,255,255,.08)', overflow:'hidden', marginBottom:14, boxShadow:'0 8px 32px rgba(0,0,0,.5)' }}>
          <div style={{ padding:'16px 18px 14px', background:'#232140' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#7c6af7', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>
              🎓 Tecnólogo em
            </div>
            <div style={{ fontSize:19, fontWeight:800, color:'#fffffe', lineHeight:1.3 }}>{course.n}</div>
          </div>
          <div style={{ padding:'14px 18px', fontSize:13, color:'#a7a9be', lineHeight:1.65, maxHeight:160, overflow:'hidden' }}>
            {course.d}
          </div>
        </div>

        {/* Feedback */}
        {answered && isCorrect !== null && (
          <div style={{ background: isCorrect ? 'rgba(61,203,135,.1)' : 'rgba(255,84,112,.1)', border:`1px solid ${isCorrect ? '#3dcb87' : '#ff5470'}`, borderRadius:12, padding:'10px 14px', marginBottom:12, fontSize:13, color: isCorrect ? '#3dcb87' : '#ff5470', fontWeight:600 }}>
            {isCorrect
              ? `✅ Correto! ${course.n} é da área de ${course.a}`
              : `❌ Errou! ${course.n} pertence a: ${course.a}`
            }
            {!isCorrect && selectedArea && (
              <span style={{ color:'#a7a9be', fontWeight:400 }}> (você escolheu: {selectedArea})</span>
            )}
          </div>
        )}
        {answered && isCorrect === null && (
          <div style={{ background:'rgba(255,84,112,.1)', border:'1px solid #ff5470', borderRadius:12, padding:'10px 14px', marginBottom:12, fontSize:13, color:'#ff5470', fontWeight:600 }}>
            ⏱ Tempo esgotado! {course.n} pertence a: {course.a}
          </div>
        )}

        {/* Area buttons */}
        <div style={{ fontSize:12, fontWeight:700, color:'#a7a9be', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10 }}>
          Qual é a área deste curso?
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:14 }}>
          {AREAS.map((area, i) => {
            const color = AREA_COLORS[i]
            const isSelected = selectedArea === area
            const isActuallyCorrect = area === course.a
            let borderColor = 'rgba(255,255,255,.08)'
            let bg = 'rgba(255,255,255,.03)'
            if (answered) {
              if (isActuallyCorrect) { borderColor = '#3dcb87'; bg = 'rgba(61,203,135,.1)' }
              else if (isSelected && !isActuallyCorrect) { borderColor = '#ff5470'; bg = 'rgba(255,84,112,.1)' }
            } else if (isSelected) {
              borderColor = color; bg = 'rgba(255,255,255,.06)'
            }
            return (
              <button
                key={area}
                onClick={() => checkAnswer(area)}
                disabled={answered}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:10, border:`1.5px solid ${borderColor}`, background:bg, cursor: answered ? 'default' : 'pointer', textAlign:'left', color:'#fffffe', fontFamily:'inherit', transition:'all .15s', fontSize:12, fontWeight: (answered && isActuallyCorrect) ? 700 : 400 }}
              >
                <span style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }} />
                {area}
              </button>
            )
          })}
        </div>

        {/* Star rating (after answering) */}
        {answered && (
          <div style={{ background:'#1a1830', borderRadius:12, border:'1px solid rgba(255,255,255,.08)', padding:'14px 16px', marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#a7a9be', marginBottom:10 }}>
              Quanto você se interessa por este curso?
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  style={{ fontSize:28, background:'none', border:'none', cursor:'pointer', color: star <= currentRating ? '#e8b86d' : '#3a3858', transition:'transform .1s', transform: star <= currentRating ? 'scale(1.15)' : 'scale(1)' }}
                >
                  ★
                </button>
              ))}
            </div>
            <div style={{ textAlign:'center', fontSize:12, color:'#64748b', marginTop:6 }}>
              {currentRating === 0 ? 'Pule se não souber' : ['','Baixo interesse','Pouco interesse','Interesse médio','Bastante interesse','Muito interesse!'][currentRating]}
            </div>
          </div>
        )}

        {/* Next button */}
        {answered && (
          <button
            onClick={handleNext}
            style={{ width:'100%', padding:'13px', background:'linear-gradient(135deg,#7c6af7,#e8b86d)', color:'#0f0e17', border:'none', borderRadius:12, fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}
          >
            {current >= queue.length - 1 ? 'Ver resultado →' : 'Próximo curso →'}
          </button>
        )}
      </div>
    </div>
  )
}

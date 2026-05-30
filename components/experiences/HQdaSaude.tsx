'use client'

import { useState, useCallback, useEffect } from 'react'
import styles from './HQdaSaude.module.css'

/* ── Types ──────────────────────────────────────────────────────────────── */
interface Curso {
  id: string
  nome: string
  emoji: string
  cor: string
  desc: string
  trabalhar: string
}

type Screen = 'title' | 'gallery' | 'result'

interface GameProps {
  patientId: string
  experienceId: number
  initialState?: Record<string, unknown>
  onStateChange: (state: Record<string, unknown>) => void
  onComplete: (scores: Record<string, unknown>, responses: Record<string, unknown>) => void
}

/* ── Course data ────────────────────────────────────────────────────────── */
const CURSOS: Curso[] = [
  {
    id: '1', nome: 'Biomedicina', emoji: '🔬', cor: '#0D47A1',
    desc: 'Investiga doenças em laboratório, realiza análises clínicas, pesquisa biomolecular e desenvolve diagnósticos precisos.',
    trabalhar: 'Laboratórios clínicos · Pesquisa científica · Indústria farmacêutica',
  },
  {
    id: '2', nome: 'Educação Física', emoji: '🏃', cor: '#1565C0',
    desc: 'Promove saúde e qualidade de vida por meio do exercício, treina atletas e conduz atividades físicas em academias e escolas.',
    trabalhar: 'Academias · Escolas · Esportes de alto rendimento',
  },
  {
    id: '3', nome: 'Enfermagem', emoji: '💉', cor: '#006064',
    desc: 'Cuida de pacientes em hospitais e comunidades, executa procedimentos clínicos e lidera equipes de saúde.',
    trabalhar: 'Hospitais · UTIs · Atenção primária à saúde',
  },
  {
    id: '4', nome: 'Esportes', emoji: '⚽', cor: '#01579B',
    desc: 'Foca em rendimento esportivo, gestão do desempenho atlético e preparação física de alto nível.',
    trabalhar: 'Clubes esportivos · Centros de treinamento · Federações',
  },
  {
    id: '5', nome: 'Estética e Cosmética', emoji: '💆', cor: '#4A148C',
    desc: 'Realiza tratamentos estéticos faciais e corporais, usando tecnologias e cosméticos para beleza e bem-estar.',
    trabalhar: 'Clínicas estéticas · Spas · Salões de beleza',
  },
  {
    id: '6', nome: 'Farmácia', emoji: '💊', cor: '#1A237E',
    desc: 'Desenvolve, produz e dispensa medicamentos, acompanha terapias e orienta pacientes e profissionais de saúde.',
    trabalhar: 'Farmácias · Indústria farmacêutica · Hospitais',
  },
  {
    id: '7', nome: 'Fisioterapia', emoji: '🦴', cor: '#006064',
    desc: 'Reabilita pacientes com disfunções motoras, alivia dores e restaura a mobilidade usando técnicas manuais e equipamentos.',
    trabalhar: 'Clínicas de reabilitação · Hospitais · Esporte',
  },
  {
    id: '8', nome: 'Fonoaudiologia', emoji: '🗣️', cor: '#004D40',
    desc: 'Trata distúrbios da voz, fala, linguagem e audição em crianças e adultos, em contextos clínicos e educacionais.',
    trabalhar: 'Clínicas · Escolas · Hospitais · Rádio e TV',
  },
  {
    id: '9', nome: 'Gerontologia', emoji: '👴', cor: '#37474F',
    desc: 'Cuida da saúde e qualidade de vida do idoso, atuando em equipes multiprofissionais para um envelhecimento ativo.',
    trabalhar: 'Clínicas geriátricas · Casas de repouso · SUS',
  },
  {
    id: '10', nome: 'Gestão de Saúde', emoji: '🏥', cor: '#0277BD',
    desc: 'Administra hospitais, clínicas e sistemas de saúde, otimiza recursos e melhora a qualidade dos serviços.',
    trabalhar: 'Hospitais · Planos de saúde · Secretarias de Saúde',
  },
  {
    id: '11', nome: 'Medicina', emoji: '⚕️', cor: '#1A237E',
    desc: 'Diagnostica e trata doenças, realiza procedimentos cirúrgicos e acompanha pacientes em todas as fases da vida.',
    trabalhar: 'Hospitais · Clínicas · Pesquisa médica · SUS',
  },
  {
    id: '12', nome: 'Musicoterapia', emoji: '🎵', cor: '#4A148C',
    desc: 'Usa a música como ferramenta terapêutica para promover saúde mental, reabilitação e bem-estar emocional.',
    trabalhar: 'Hospitais · Clínicas de saúde mental · ONGs',
  },
  {
    id: '13', nome: 'Naturologia', emoji: '🌿', cor: '#1B5E20',
    desc: 'Integra terapias naturais como fitoterapia, acupuntura e homeopatia ao cuidado da saúde de forma holística.',
    trabalhar: 'Clínicas integrativas · SUS · Atendimento privado',
  },
  {
    id: '14', nome: 'Nutrição', emoji: '🥗', cor: '#2E7D32',
    desc: 'Elabora planos alimentares, trata distúrbios nutricionais e promove saúde por meio de uma alimentação equilibrada.',
    trabalhar: 'Hospitais · Academias · Empresas · Consultório',
  },
  {
    id: '15', nome: 'Obstetrícia', emoji: '👶', cor: '#880E4F',
    desc: 'Acompanha a gestação, realiza partos e cuida da saúde materno-infantil em maternidades e centros de parto normal.',
    trabalhar: 'Maternidades · Centros de parto · SUS',
  },
  {
    id: '16', nome: 'Odontologia', emoji: '🦷', cor: '#0D47A1',
    desc: 'Cuida da saúde bucal, realiza tratamentos estéticos e restauradores e faz intervenções cirúrgicas orais.',
    trabalhar: 'Consultórios · Clínicas odontológicas · Hospitais',
  },
  {
    id: '17', nome: 'Optometria', emoji: '👁️', cor: '#006064',
    desc: 'Avalia e corrige distúrbios visuais, prescreve lentes e trabalha na prevenção de doenças oculares.',
    trabalhar: 'Óticas · Clínicas oftalmológicas · Hospitais',
  },
  {
    id: '18', nome: 'Psicologia', emoji: '🧠', cor: '#6A1B9A',
    desc: 'Avalia e trata questões emocionais e comportamentais, conduz psicoterapia e atua em saúde mental e organizações.',
    trabalhar: 'Consultório · Hospitais · Escolas · Empresas',
  },
  {
    id: '19', nome: 'Quiropraxia', emoji: '🫀', cor: '#37474F',
    desc: 'Trata problemas musculoesqueléticos, especialmente da coluna, usando ajustes manuais e técnicas não invasivas.',
    trabalhar: 'Clínicas de quiropraxia · Centros esportivos',
  },
  {
    id: '20', nome: 'Saúde Coletiva', emoji: '🌍', cor: '#1565C0',
    desc: 'Promove saúde pública, elabora políticas de prevenção e atua no planejamento e gestão de serviços de saúde.',
    trabalhar: 'Secretarias de Saúde · OMS · ONGs · SUS',
  },
  {
    id: '21', nome: 'Terapia Ocupacional', emoji: '🤝', cor: '#00695C',
    desc: 'Reabilita pessoas com limitações físicas ou mentais para retomarem atividades da vida diária com autonomia.',
    trabalhar: 'Hospitais · Clínicas · Escolas especiais · SUS',
  },
]

const TOTAL = CURSOS.length  // 21

/* ── Component ──────────────────────────────────────────────────────────── */
export default function HQdaSaude({
  initialState,
  onStateChange,
  onComplete,
}: GameProps) {
  const savedAv = initialState?.av as Record<string, number> | undefined

  const [screen, setScreen] = useState<Screen>('title')
  const [av, setAv] = useState<Record<string, number>>(savedAv ?? {})
  const [modalCurso, setModalCurso] = useState<Curso | null>(null)
  const [starVal, setStarVal] = useState(0)
  const [resultRanking, setResultRanking] = useState<{ nome: string; pts: number }[]>([])
  const [barsReady, setBarsReady] = useState(false)

  useEffect(() => {
    if (savedAv && Object.keys(savedAv).length > 0) {
      setScreen('gallery')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const avaliados = Object.keys(av).length

  const save = useCallback((a: Record<string, number>) => {
    onStateChange({ av: a })
  }, [onStateChange])

  const openCurso = useCallback((c: Curso) => {
    setModalCurso(c)
    setStarVal(av[c.id] ?? 0)
  }, [av])

  const confirmar = useCallback(() => {
    if (!modalCurso || starVal === 0) return
    const newAv = { ...av, [modalCurso.id]: starVal }
    setAv(newAv)
    setModalCurso(null)
    save(newAv)

    if (Object.keys(newAv).length >= TOTAL) {
      setTimeout(() => {
        const ranking = CURSOS.map(c => ({
          nome: c.nome,
          pts: newAv[c.id] ?? 0,
        })).sort((a, b) => b.pts - a.pts)
        setResultRanking(ranking)
        setScreen('result')
        setTimeout(() => setBarsReady(true), 60)
      }, 400)
    }
  }, [modalCurso, starVal, av, save])

  const handleComplete = useCallback(() => {
    const scores: Record<string, number> = {}
    for (const c of CURSOS) scores[c.nome] = av[c.id] ?? 0
    onComplete(
      { ranking: resultRanking, scores },
      { av }
    )
  }, [resultRanking, av, onComplete])

  /* ── Title ── */
  if (screen === 'title') {
    return (
      <div className={styles.root}>
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}>🏥</div>
          <h1 className={styles.heroTitle}>HQ da Saúde</h1>
          <p className={styles.heroSub}>Saúde e Bem-Estar</p>

          <div className={styles.introBox}>
            <p>
              <strong>Como funciona:</strong> Explore os{' '}
              <strong>{TOTAL} cursos da área de Saúde</strong>. Para cada curso,
              leia uma descrição rápida e avalie seu{' '}
              <strong>interesse de 1 a 5 estrelas</strong>.
            </p>
            <br />
            <p>
              No final, você recebe um <strong>ranking personalizado</strong> dos
              cursos que mais despertaram seu interesse.
            </p>
          </div>

          <button className={styles.btnPrimary} onClick={() => setScreen('gallery')}>
            Explorar Cursos
          </button>
        </div>
      </div>
    )
  }

  /* ── Result ── */
  if (screen === 'result') {
    const maxPts = resultRanking[0]?.pts || 5
    return (
      <div className={styles.root}>
        <div className={styles.resultRoot}>
          <div className={styles.resultHeader}>
            <div className={styles.resultTrophy}>🏆</div>
            <div className={styles.resultTitle}>Avaliação Concluída!</div>
            <div className={styles.resultSub}>{TOTAL} cursos avaliados · Saúde e Bem-Estar</div>
          </div>

          <div style={{ marginBottom: 12, fontSize: 13, color: 'rgba(255,255,255,.5)' }}>
            Ranking de interesse pessoal
          </div>

          {resultRanking.map((item, i) => {
            const pct = maxPts > 0 ? (item.pts / maxPts) * 100 : 0
            const medals = ['🥇', '🥈', '🥉']
            return (
              <div key={item.nome} className={styles.rankItem}>
                <div className={styles.rankPos}>{i < 3 ? medals[i] : `${i + 1}º`}</div>
                <div className={styles.rankInfo}>
                  <div className={styles.rankNome}>{item.nome}</div>
                  <div className={styles.rankBarWrap}>
                    <div className={styles.rankBarTrack}>
                      <div
                        className={styles.rankBarFill}
                        style={{ width: barsReady ? `${pct}%` : '0%' }}
                      />
                    </div>
                    <div className={styles.rankPts}>{item.pts}★</div>
                  </div>
                </div>
              </div>
            )
          })}

          <button className={styles.resultBtn} style={{ marginTop: 24 }} onClick={handleComplete}>
            Salvar e Continuar
          </button>
        </div>
      </div>
    )
  }

  /* ── Gallery ── */
  return (
    <div className={styles.root}>
      {/* HUD */}
      <div className={styles.hud}>
        <div>
          <div className={styles.hudTitle}>HQ da Saúde</div>
          <div className={styles.hudSub}>Saúde e Bem-Estar</div>
        </div>
        <div className={styles.hudStats}>
          <div className={styles.stat}>
            <div className={styles.statVal}>{avaliados}/{TOTAL}</div>
            <div className={styles.statLbl}>AVALIADOS</div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className={styles.progressWrap}>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${(avaliados / TOTAL) * 100}%` }}
          />
        </div>
        <div className={styles.progressLabel}>{avaliados} de {TOTAL} avaliados</div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {CURSOS.map(curso => {
          const rated = av[curso.id] !== undefined
          const stars = av[curso.id]
          return (
            <div
              key={curso.id}
              className={`${styles.card}${rated ? ` ${styles.rated}` : ''}`}
              onClick={() => openCurso(curso)}
            >
              {rated && <div className={styles.cardCheck}>✓</div>}
              <div
                className={styles.cardThumb}
                style={{ background: `linear-gradient(135deg, ${curso.cor}44, ${curso.cor}22)` }}
              >
                {curso.emoji}
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardNome}>{curso.nome}</div>
                <div className={styles.cardMini}>
                  {rated && stars !== undefined
                    ? '★'.repeat(stars) + '☆'.repeat(5 - stars)
                    : 'Toque para avaliar'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {modalCurso && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div
              className={styles.modalThumb}
              style={{ background: `linear-gradient(135deg, ${modalCurso.cor}66, ${modalCurso.cor}33)` }}
            >
              {modalCurso.emoji}
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalNome}>{modalCurso.nome}</div>
              <div className={styles.modalArea}>Saúde e Bem-Estar</div>

              <div className={styles.modalDesc}>{modalCurso.desc}</div>

              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>
                <strong style={{ color: '#2196F3' }}>Onde trabalhar:</strong>{' '}
                {modalCurso.trabalhar}
              </div>

              <div className={styles.ratingSection}>
                <div className={styles.ratingLabel}>Como você avalia seu interesse?</div>
                <div className={styles.ratingSub}>Toque nas estrelas para pontuar</div>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <span
                      key={v}
                      className={`${styles.star}${starVal >= v ? ` ${styles.active}` : ''}`}
                      onClick={() => setStarVal(v)}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <div className={styles.starLabels}>
                  <span>Nenhum</span>
                  <span>Pouco</span>
                  <span>Médio</span>
                  <span>Alto</span>
                  <span>Muito alto</span>
                </div>
              </div>

              <button
                className={styles.modalBtn}
                disabled={starVal === 0}
                onClick={confirmar}
              >
                Confirmar e Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

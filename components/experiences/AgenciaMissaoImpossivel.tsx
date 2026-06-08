'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './AgenciaMissaoImpossivel.module.css'

// ── Types ────────────────────────────────────────────────────────────────────
type Dim = 'hi' | 'mid' | 'lo'
interface MissionOpt { dim: Dim; icon: string; text: string }
interface MomentData { title?: string; text: string; prompt?: string; opts: MissionOpt[] }
interface Mission { id: string; area: string; briefing: MomentData; obstacle: MomentData; comparison: MomentData }
type Screen = 'title' | 'instrucoes' | 'game' | 'result'
type MomentIdx = 0 | 1 | 2
type MScores = Record<string, { b: number; o: number; c: number }>
type Choices = Record<string, Dim>

interface GameProps {
  patientId: string
  experienceId: number
  initialState?: Record<string, unknown>
  onStateChange: (state: Record<string, unknown>) => void
  onComplete: (scores: Record<string, unknown>, responses: Record<string, unknown>) => void
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SCORE_MAP: Record<Dim, number> = { hi: 100, mid: 60, lo: 20 }

const AREA_COLORS: Record<string, string> = {
  'Administração, Negócios e Serviços': '#f59e0b',
  'Ciências Biológicas e da Terra': '#22c55e',
  'Saúde e Bem-Estar': '#fbbf24',
  'Ciências Humanas e Sociais': '#a855f7',
  'Comunicação e Informação': '#f59e0b',
  'Artes e Design': '#ec4899',
  'Ciências Exatas e Informática': '#06b6d4',
  'Engenharia e Produção': '#f97316',
  'Carreiras Militares': '#92400e',
}

const MOMENT_KEYS = ['briefing', 'obstacle', 'comparison'] as const
const MOMENT_LABELS = [
  'Briefing — Aceitar a missão?',
  'Imprevisto — Como você reage?',
  'Comparação — Reflexão final',
]

const MISSIONS: Mission[] = [
  {
    id: 'm1', area: 'Administração, Negócios e Serviços',
    briefing: {
      title: 'A reunião de crise',
      text: 'É meia-noite. Uma empresa enfrenta uma decisão que pode mudar tudo. O grupo está dividido, o prazo acabou e todos esperam que alguém tome a frente.',
      prompt: 'Como você reage nessa situação?',
      opts: [
        { dim: 'hi', icon: '💼', text: 'Assumo a palavra, organizo os argumentos e conduzo o grupo a uma decisão clara.' },
        { dim: 'mid', icon: '🤔', text: 'Participo, dou minha opinião, mas prefiro que outro lidere o processo.' },
        { dim: 'lo', icon: '😰', text: 'Sinto-me fora do lugar — esse tipo de ambiente me causa muita insegurança.' },
      ],
    },
    obstacle: {
      text: 'No meio da reunião, alguém questiona publicamente sua competência para estar ali. Todos olham para você.',
      opts: [
        { dim: 'hi', icon: '🔥', text: 'Respondo com calma e fundamento — crítica não me paralisa.' },
        { dim: 'mid', icon: '😤', text: 'Fico abalado, mas continuo — levo um tempo para me recompor.' },
        { dim: 'lo', icon: '🚪', text: 'A pressão me bloqueia — prefiro recuar a me expor mais.' },
      ],
    },
    comparison: {
      text: 'Comparado com outros desafios que você já enfrentou na vida, como se sentiu aqui?',
      opts: [
        { dim: 'hi', icon: '🏆', text: 'Senti-me mais capaz aqui do que em outros desafios.' },
        { dim: 'mid', icon: '🤝', text: 'Senti-me na média — nem melhor nem pior.' },
        { dim: 'lo', icon: '📉', text: 'Senti-me menos capaz aqui do que em outros desafios.' },
      ],
    },
  },
  {
    id: 'm2', area: 'Ciências Biológicas e da Terra',
    briefing: {
      title: 'A expedição',
      text: 'Floresta densa, equipamentos de coleta, dados ambíguos. Você está sozinho num campo de investigação e precisa interpretar o que a natureza está revelando.',
      prompt: 'Como você lida com esse cenário?',
      opts: [
        { dim: 'hi', icon: '🔬', text: 'Sinto-me à vontade — observar, coletar e analisar é o que faço bem.' },
        { dim: 'mid', icon: '🌿', text: 'Consigo trabalhar, mas o ambiente incerto me deixa inseguro às vezes.' },
        { dim: 'lo', icon: '😟', text: 'Sinto-me perdido — trabalho de campo nesse tipo de expedição não é meu ponto forte.' },
      ],
    },
    obstacle: {
      text: 'Os dados coletados contradizem sua hipótese inicial. Você vai ter que recomeçar do zero.',
      opts: [
        { dim: 'hi', icon: '🔥', text: 'Reanaliso tudo com curiosidade — dado inesperado é o início de uma descoberta.' },
        { dim: 'mid', icon: '😤', text: 'Fico frustrado, mas reoriento a análise e sigo em frente.' },
        { dim: 'lo', icon: '🚪', text: 'A contradição me desanima — fico em dúvida se tenho capacidade para isso.' },
      ],
    },
    comparison: {
      text: 'Comparado com as outras missões, como se sentiu neste ambiente científico?',
      opts: [
        { dim: 'hi', icon: '🏆', text: 'Senti-me mais capaz aqui do que nas anteriores.' },
        { dim: 'mid', icon: '🤝', text: 'Senti-me na média — nem melhor nem pior.' },
        { dim: 'lo', icon: '📉', text: 'Senti-me menos capaz aqui do que nas anteriores.' },
      ],
    },
  },
  {
    id: 'm3', area: 'Saúde e Bem-Estar',
    briefing: {
      title: 'A decisão clínica',
      text: 'Corredor de hospital. Alguém precisa de ajuda imediata. Você tem o conhecimento, o equipamento — e o tempo conta.',
      prompt: 'Como você reage nesse momento?',
      opts: [
        { dim: 'hi', icon: '💉', text: 'Foco e ajo com precisão — ambientes de urgência me deixam alerta, não paralisado.' },
        { dim: 'mid', icon: '😷', text: 'Consigo agir, mas a pressão do momento me afeta e preciso me concentrar mais.' },
        { dim: 'lo', icon: '😰', text: 'Situações de urgência com pessoas me bloqueiam — não me sinto capaz de agir bem.' },
      ],
    },
    obstacle: {
      text: 'O procedimento não está funcionando como esperado. Você precisa tomar uma decisão diferente em segundos.',
      opts: [
        { dim: 'hi', icon: '🔥', text: 'Adapto imediatamente — tomar decisão rápida sob pressão é algo que consigo fazer.' },
        { dim: 'mid', icon: '😤', text: 'Hesito por um momento, mas me recomponho e ajo.' },
        { dim: 'lo', icon: '🚪', text: 'A incerteza me paralisa — tenho dificuldade com decisões rápidas de alto risco.' },
      ],
    },
    comparison: {
      text: 'Comparado com as outras missões, como se sentiu neste ambiente de saúde?',
      opts: [
        { dim: 'hi', icon: '🏆', text: 'Senti-me mais capaz aqui do que nas anteriores.' },
        { dim: 'mid', icon: '🤝', text: 'Senti-me na média — nem melhor nem pior.' },
        { dim: 'lo', icon: '📉', text: 'Senti-me menos capaz aqui do que nas anteriores.' },
      ],
    },
  },
  {
    id: 'm4', area: 'Ciências Humanas e Sociais',
    briefing: {
      title: 'O argumento impossível',
      text: 'Biblioteca. Dossiê aberto. Você precisa defender uma posição complexa diante de alguém que pensa completamente diferente — e tem argumentos fortes.',
      prompt: 'Como você se posiciona?',
      opts: [
        { dim: 'hi', icon: '📖', text: 'Preparo-me, estruturo meu argumento e entro na discussão com confiança.' },
        { dim: 'mid', icon: '🤔', text: 'Participo, mas me sinto menos seguro quando o outro tem argumentos sólidos.' },
        { dim: 'lo', icon: '😕', text: 'Argumentação e debate me deixam inseguro — não me sinto capaz nesse terreno.' },
      ],
    },
    obstacle: {
      text: 'Seu argumento principal é rebatido com uma evidência que você não conhecia. Todos aguardam sua resposta.',
      opts: [
        { dim: 'hi', icon: '🔥', text: 'Reconheço o ponto, reencaminho meu raciocínio e continuo — isso faz parte do debate.' },
        { dim: 'mid', icon: '😤', text: 'Fico sem resposta por um momento, mas retomo com outro ângulo.' },
        { dim: 'lo', icon: '🚪', text: 'A refutação me desequilibra — prefiro ceder a continuar me expondo.' },
      ],
    },
    comparison: {
      text: 'Comparado com as outras missões, como se sentiu neste terreno de argumentação?',
      opts: [
        { dim: 'hi', icon: '🏆', text: 'Senti-me mais capaz aqui do que nas anteriores.' },
        { dim: 'mid', icon: '🤝', text: 'Senti-me na média — nem melhor nem pior.' },
        { dim: 'lo', icon: '📉', text: 'Senti-me menos capaz aqui do que nas anteriores.' },
      ],
    },
  },
  {
    id: 'm5', area: 'Comunicação e Informação',
    briefing: {
      title: 'No ar agora',
      text: 'Estúdio ao vivo. Luz vermelha acesa. Você tem 3 minutos para comunicar uma ideia importante para uma audiência que ainda não te conhece.',
      prompt: 'Como você enfrenta esse momento?',
      opts: [
        { dim: 'hi', icon: '🎙️', text: 'Estou no meu território — comunicar, convencer e me expressar é algo que faço bem.' },
        { dim: 'mid', icon: '😤', text: 'Consigo fazer, mas o ao vivo me deixa nervoso e preciso de preparação extra.' },
        { dim: 'lo', icon: '😰', text: 'Falar para audiências me causa ansiedade real — não me sinto capaz nessa situação.' },
      ],
    },
    obstacle: {
      text: 'O equipamento falha no meio da transmissão. Você precisa improvisar por 2 minutos sem apoio.',
      opts: [
        { dim: 'hi', icon: '🔥', text: 'Improviso com naturalidade — perder o roteiro não me paralisa.' },
        { dim: 'mid', icon: '😤', text: 'Fico tenso, mas me viro — não é confortável, mas consigo passar por isso.' },
        { dim: 'lo', icon: '🚪', text: 'A situação imprevista me bloqueia completamente — perco o fio.' },
      ],
    },
    comparison: {
      text: 'Comparado com as outras missões, como se sentiu neste ambiente de comunicação?',
      opts: [
        { dim: 'hi', icon: '🏆', text: 'Senti-me mais capaz aqui do que nas anteriores.' },
        { dim: 'mid', icon: '🤝', text: 'Senti-me na média — nem melhor nem pior.' },
        { dim: 'lo', icon: '📉', text: 'Senti-me menos capaz aqui do que nas anteriores.' },
      ],
    },
  },
  {
    id: 'm6', area: 'Artes e Design',
    briefing: {
      title: 'A tela em branco',
      text: 'Ateliê secreto. Paredes cobertas de esboços. Você recebe total liberdade para criar algo do zero — sem referência, sem modelo, só você e a ideia.',
      prompt: 'Como você reage a essa liberdade?',
      opts: [
        { dim: 'hi', icon: '✨', text: 'Sinto-me livre e confiante — tela em branco é oportunidade, não ameaça.' },
        { dim: 'mid', icon: '🎨', text: 'Consigo criar, mas preciso de um tempo para começar — o vazio inicial me trava um pouco.' },
        { dim: 'lo', icon: '😕', text: 'Liberdade total me paralisa — sem referência, sinto-me incapaz de criar algo bom.' },
      ],
    },
    obstacle: {
      text: 'Após horas de trabalho, você percebe que sua criação não está funcionando. É preciso descartar e recomeçar.',
      opts: [
        { dim: 'hi', icon: '🔥', text: 'Recomeço sem drama — faz parte do processo criativo, não me abalo.' },
        { dim: 'mid', icon: '😤', text: 'Fico frustrado, mas retomo — leva um tempo para recuperar o ânimo.' },
        { dim: 'lo', icon: '🚪', text: 'Descartar o trabalho me desanima muito — questiono se tenho capacidade criativa.' },
      ],
    },
    comparison: {
      text: 'Comparado com as outras missões, como se sentiu neste ambiente criativo?',
      opts: [
        { dim: 'hi', icon: '🏆', text: 'Senti-me mais capaz aqui do que nas anteriores.' },
        { dim: 'mid', icon: '🤝', text: 'Senti-me na média — nem melhor nem pior.' },
        { dim: 'lo', icon: '📉', text: 'Senti-me menos capaz aqui do que nas anteriores.' },
      ],
    },
  },
  {
    id: 'm7', area: 'Ciências Exatas e Informática',
    briefing: {
      title: 'O erro no sistema',
      text: 'Sala de servidores. Múltiplas telas. Um sistema crítico apresenta falha e você precisa encontrar o erro usando apenas lógica — sem intuição, sem atalho.',
      prompt: 'Como você aborda esse problema?',
      opts: [
        { dim: 'hi', icon: '💻', text: 'Raciocínio lógico e sistemático é onde me sinto mais competente — me engajo com confiança.' },
        { dim: 'mid', icon: '🤔', text: 'Consigo trabalhar com lógica, mas problemas muito abstratos me exigem muito esforço.' },
        { dim: 'lo', icon: '😟', text: 'Lógica pura e sistemas complexos me intimidam — não me sinto capaz aqui.' },
      ],
    },
    obstacle: {
      text: 'Você encontrou o que parecia ser o erro, mas ao corrigir, surgem três novos problemas.',
      opts: [
        { dim: 'hi', icon: '🔥', text: 'Problema encadeado é desafio, não derrota — sigo a lógica com persistência.' },
        { dim: 'mid', icon: '😤', text: 'Fico frustrado, mas não desisto — reanaliso com cuidado.' },
        { dim: 'lo', icon: '🚪', text: 'A complexidade crescente me desanima — sinto que não tenho capacidade suficiente.' },
      ],
    },
    comparison: {
      text: 'Comparado com as outras missões, como se sentiu neste ambiente de exatas?',
      opts: [
        { dim: 'hi', icon: '🏆', text: 'Senti-me mais capaz aqui do que nas anteriores.' },
        { dim: 'mid', icon: '🤝', text: 'Senti-me na média — nem melhor nem pior.' },
        { dim: 'lo', icon: '📉', text: 'Senti-me menos capaz aqui do que nas anteriores.' },
      ],
    },
  },
  {
    id: 'm8', area: 'Engenharia e Produção',
    briefing: {
      title: 'A estrutura em risco',
      text: 'Canteiro de obras noturno. Faíscas, plantas técnicas na mão, estrutura metálica à sua frente. Algo precisa ser resolvido agora — há prazo e há consequências reais.',
      prompt: 'Como você age nesse cenário?',
      opts: [
        { dim: 'hi', icon: '⚙️', text: 'Sinto-me competente — resolver problemas técnicos concretos com prazo é onde funciono bem.' },
        { dim: 'mid', icon: '🔧', text: 'Consigo trabalhar, mas ambientes industriais complexos me exigem muito foco.' },
        { dim: 'lo', icon: '😬', text: 'Problemas técnicos de grande escala me intimidam — não me sinto capaz aqui.' },
      ],
    },
    obstacle: {
      text: 'Um componente crítico não está disponível. Você precisa adaptar o projeto em tempo real.',
      opts: [
        { dim: 'hi', icon: '🔥', text: 'Adapto o projeto imediatamente — improvisar dentro de restrições técnicas é algo que consigo.' },
        { dim: 'mid', icon: '😤', text: 'Fico tenso, mas busco uma solução alternativa — levo um tempo, mas resolvo.' },
        { dim: 'lo', icon: '🚪', text: 'A mudança de plano me paralisa — precisava de mais tempo para pensar.' },
      ],
    },
    comparison: {
      text: 'Comparado com as outras missões, como se sentiu neste ambiente de engenharia?',
      opts: [
        { dim: 'hi', icon: '🏆', text: 'Senti-me mais capaz aqui do que nas anteriores.' },
        { dim: 'mid', icon: '🤝', text: 'Senti-me na média — nem melhor nem pior.' },
        { dim: 'lo', icon: '📉', text: 'Senti-me menos capaz aqui do que nas anteriores.' },
      ],
    },
  },
  {
    id: 'm9', area: 'Carreiras Militares',
    briefing: {
      title: 'O ponto sem retorno',
      text: 'Terreno hostil. Névoa. Uma decisão que não pode ser adiada. O grupo depende de você e não há espaço para hesitação.',
      prompt: 'Como você reage nessa situação extrema?',
      opts: [
        { dim: 'hi', icon: '🎯', text: 'Situações de pressão extrema me focam — decido com clareza e assumo a responsabilidade.' },
        { dim: 'mid', icon: '😤', text: 'Consigo agir, mas ambientes de pressão extrema me custam muito esforço mental.' },
        { dim: 'lo', icon: '😰', text: 'Esse nível de pressão e responsabilidade ultrapassa o que me sinto capaz de suportar.' },
      ],
    },
    obstacle: {
      text: 'Sua decisão inicial falhou. O grupo olha para você esperando uma nova ordem.',
      opts: [
        { dim: 'hi', icon: '🔥', text: 'Reavalio, decido novamente e comunico com firmeza — erro faz parte da operação.' },
        { dim: 'mid', icon: '😤', text: 'A falha me abala, mas recupero a compostura e sigo em frente.' },
        { dim: 'lo', icon: '🚪', text: 'A falha diante do grupo me paralisa — nesse momento não consigo liderar.' },
      ],
    },
    comparison: {
      text: 'Comparado com as outras missões, como se sentiu neste cenário extremo?',
      opts: [
        { dim: 'hi', icon: '🏆', text: 'Senti-me mais capaz aqui do que nas anteriores.' },
        { dim: 'mid', icon: '🤝', text: 'Senti-me na média — nem melhor nem pior.' },
        { dim: 'lo', icon: '📉', text: 'Senti-me menos capaz aqui do que nas anteriores.' },
      ],
    },
  },
]

// ── Score helpers ─────────────────────────────────────────────────────────────
function makeDefaultScores(): MScores {
  return Object.fromEntries(MISSIONS.map(m => [m.id, { b: 0, o: 0, c: 0 }]))
}

function computeMissionScore(s: { b: number; o: number; c: number }): number {
  return Math.round(s.b * 0.4 + s.o * 0.4 + s.c * 0.2)
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AgenciaMissaoImpossivel({
  initialState,
  onStateChange,
  onComplete,
}: GameProps) {
  // ── State init from saved game ───────────────────────────────────────────
  // Always start at title so cover/instructions are always visible.
  // hasSavedProgress detects whether to show "Continuar" or "Aceitar recrutamento".
  const hasSavedProgress = !!(
    initialState?.screen === 'game' ||
    initialState?.screen === 'result' ||
    (typeof initialState?.missionIdx === 'number' && (initialState.missionIdx as number) > 0)
  )
  const [screen, setScreen] = useState<Screen>('title')
  const [missionIdx, setMissionIdx] = useState<number>(
    typeof initialState?.missionIdx === 'number' ? initialState.missionIdx : 0
  )
  const [moment, setMoment] = useState<MomentIdx>(
    typeof initialState?.moment === 'number' ? (initialState.moment as MomentIdx) : 0
  )
  const [scores, setScores] = useState<MScores>(
    (initialState?.scores as MScores | undefined) ?? makeDefaultScores()
  )
  const [choices, setChoices] = useState<Choices>(
    (initialState?.choices as Choices | undefined) ?? {}
  )
  const [showTransition, setShowTransition] = useState(false)
  const [transitionText, setTransitionText] = useState('')
  const [resultData, setResultData] = useState<Record<string, number> | null>(
    (initialState?.resultData as Record<string, number> | undefined) ?? null
  )
  const [barsReady, setBarsReady] = useState(false)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const onStateChangeRef = useRef(onStateChange)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onStateChangeRef.current = onStateChange }, [onStateChange])
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms)
    timers.current.push(t)
    return t
  }, [])

  // ── Auto-save ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen === 'title' || screen === 'instrucoes') return
    onStateChangeRef.current({ screen, missionIdx, moment, scores, choices, resultData })
  }, [screen, missionIdx, moment, scores, choices, resultData])

  // ── Bar animation on result screen ───────────────────────────────────────
  useEffect(() => {
    if (screen === 'result') {
      setBarsReady(false)
      const t = setTimeout(() => setBarsReady(true), 60)
      return () => clearTimeout(t)
    }
  }, [screen])

  // ── Derived state ────────────────────────────────────────────────────────
  const mission = MISSIONS[missionIdx]
  const momentKey = MOMENT_KEYS[moment]
  const momentData = mission[momentKey]
  const choiceKey = `${mission.id}_${momentKey}`
  const selectedDim = choices[choiceKey]
  const totalSteps = MISSIONS.length * 3
  const currentStep = missionIdx * 3 + moment
  const progressPct = Math.round((currentStep / totalSteps) * 100)

  // ── Core interaction ─────────────────────────────────────────────────────
  const selectOpt = useCallback(
    (dim: Dim) => {
      const newChoices: Choices = { ...choices, [choiceKey]: dim }
      const scoreField = momentKey === 'briefing' ? 'b' : momentKey === 'obstacle' ? 'o' : 'c'
      const newScores: MScores = {
        ...scores,
        [mission.id]: { ...scores[mission.id], [scoreField]: SCORE_MAP[dim] },
      }
      setChoices(newChoices)
      setScores(newScores)

      addTimer(() => {
        if (moment < 2) {
          setMoment(((moment + 1) as MomentIdx))
        } else if (missionIdx < MISSIONS.length - 1) {
          setTransitionText(`Missão ${missionIdx + 1} concluída!`)
          setShowTransition(true)
          addTimer(() => {
            setShowTransition(false)
            setMissionIdx(missionIdx + 1)
            setMoment(0)
          }, 1800)
        } else {
          // Compute final results
          const results: Record<string, number> = {}
          MISSIONS.forEach(m => {
            results[m.area] = computeMissionScore(newScores[m.id])
          })
          setResultData(results)
          setScreen('result')
        }
      }, 700)
    },
    [choices, scores, mission, momentKey, moment, missionIdx, choiceKey, addTimer]
  )

  const goBack = useCallback(() => {
    if (moment > 0) {
      setMoment(((moment - 1) as MomentIdx))
    } else if (missionIdx > 0) {
      setMissionIdx(missionIdx - 1)
      setMoment(2)
    }
  }, [moment, missionIdx])

  const handleDone = useCallback(() => {
    if (!resultData) return
    onCompleteRef.current({ areas: resultData }, choices)
  }, [resultData, choices])

  // ── Screens ──────────────────────────────────────────────────────────────

  if (screen === 'title') {
    return (
      <div className={styles.root}>
        <div className={styles.heroSection}>
          <div
            className={styles.coverBg}
            style={{ backgroundImage: "url('/games/agencia-imgs/cover.jpeg')" }}
          />
          <div className={styles.coverOverlay} />
          <div className={styles.coverContent}>
          <div className={styles.badge}>🔴 Ultra Confidencial</div>
          <h1 className={styles.heroTitle}>
            AGÊNCIA<br /><span>MISSÃO POSSÍVEL?</span>
          </h1>
          <p className={styles.heroSub}>
            9 missões. 9 mundos diferentes. Descubra em quais você realmente acredita que pode atuar.
          </p>
          <p className={styles.heroCls}>Avaliação de Autoeficácia — Bandura</p>
          <div className={styles.chips}>
            <span className={styles.chip}>9 missões</span>
            <span className={styles.chip}>8–10 min</span>
            <span className={styles.chip}>Confidencial</span>
          </div>
          <button className={styles.btnPrimary} onClick={() => setScreen('instrucoes')}>
            Aceitar recrutamento →
          </button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'instrucoes') {
    return (
      <div className={styles.root}>
        <div className={styles.page}>
          <h2 className={styles.sectionTitle}>Briefing do Agente</h2>
          <p style={{ color: '#d97706', marginBottom: '1.2rem', fontSize: 13 }}>
            Antes de iniciar sua missão, leia com atenção as instruções abaixo.
          </p>

          <div className={styles.instrCard}>
            <span className={styles.instrIcon}>🎯</span>
            <div>
              <div className={styles.instrTitle}>Objetivo</div>
              <div className={styles.instrText}>
                Você vai enfrentar 9 missões, uma para cada grande área do conhecimento. Em cada missão, uma situação real será apresentada e você escolhe como reagiria.
              </div>
            </div>
          </div>

          <div className={styles.instrCard}>
            <span className={styles.instrIcon}>🧠</span>
            <div>
              <div className={styles.instrTitle}>Seja honesto</div>
              <div className={styles.instrText}>
                Não existe resposta certa ou errada. O que importa é o que você realmente sentiria naquela situação, não o que &quot;deveria&quot; sentir.
              </div>
            </div>
          </div>

          <div className={styles.instrCard}>
            <span className={styles.instrIcon}>⚙️</span>
            <div>
              <div className={styles.instrTitle}>Estrutura</div>
              <div className={styles.instrText}>
                Cada missão tem 3 momentos: <strong>briefing</strong> (aceitar a tarefa?), <strong>imprevisto</strong> (um obstáculo surge) e <strong>comparação</strong> (reflexão final). Suas respostas compõem um perfil de autoeficácia por área.
              </div>
            </div>
          </div>

          {hasSavedProgress ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: '1.5rem' }}>
              <button className={styles.btnPrimary} onClick={() => setScreen('game')}>
                Continuar missão →
              </button>
              <button className={styles.btnBack} onClick={() => {
                setMissionIdx(0); setMoment(0)
                setChoices({}); setScores(makeDefaultScores())
                setScreen('game')
              }}>
                Recomeçar do zero
              </button>
            </div>
          ) : (
            <button
              className={styles.btnPrimary}
              style={{ marginTop: '1.5rem' }}
              onClick={() => setScreen('game')}
            >
              Iniciar operação →
            </button>
          )}
        </div>
      </div>
    )
  }

  if (screen === 'result' && resultData) {
    return (
      <div className={styles.root}>
        <div className={styles.page}>
          <div className={styles.finishHero}>
            <h1>Missão Concluída</h1>
            <p>Seu perfil de autoeficácia por área de conhecimento</p>
          </div>

          <div className={styles.resultGrid}>
            {MISSIONS.map(m => {
              const score = resultData[m.area] ?? 0
              const color = AREA_COLORS[m.area] ?? '#7c3aed'
              const label =
                score >= 70 ? 'Alta confiança' : score >= 40 ? 'Confiança moderada' : 'Área de desenvolvimento'
              const labelColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
              return (
                <div key={m.id} className={styles.resultCard}>
                  <div className={styles.resultArea}>{m.area}</div>
                  <div className={styles.resultBarWrap}>
                    <div className={styles.resultBarTrack}>
                      <div
                        className={styles.resultBarFill}
                        style={{ width: barsReady ? `${score}%` : '0%', background: color }}
                      />
                    </div>
                    <span className={styles.resultScore}>{score}%</span>
                  </div>
                  <div className={styles.resultLabel} style={{ color: labelColor }}>{label}</div>
                </div>
              )
            })}
          </div>

          <button className={styles.btnDark} onClick={handleDone}>
            Salvar e Voltar ao Painel
          </button>
        </div>
      </div>
    )
  }

  // ── Game screen ──────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>
      {showTransition && (
        <div className={styles.transitionOverlay}>
          <div className={styles.transitionContent}>
            <div className={styles.transitionIcon}>✓</div>
            <p className={styles.transitionMsg}>{transitionText}</p>
          </div>
        </div>
      )}

      <div className={styles.progressBar}>
        <span className={styles.progressLabel}>Missão {missionIdx + 1} de 9</span>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
        <span className={styles.progressPct}>{progressPct}%</span>
      </div>

      <div className={styles.page}>
        <div className={styles.missionCard}>
          <div
            className={styles.missionHero}
            style={{ backgroundImage: `url('/games/agencia-imgs/mission-${missionIdx + 1}.jpeg')` }}
          >
            <div className={styles.missionHeroOverlay} />
            <div className={styles.missionHeroContent}>
              <div className={styles.missionNum}>Missão {missionIdx + 1} de 9</div>
              <div className={styles.missionArea}>{mission.area}</div>
            </div>
          </div>

          <div className={styles.missionBody}>
            <span className={styles.momentLabel}>{MOMENT_LABELS[moment]}</span>

            {/* Obstacle banner */}
            {moment === 1 && (
              <div className={styles.obstacleCard}>
                <div className={styles.obstacleTitle}>Imprevisto</div>
                <div className={styles.obstacleText}>{momentData.text}</div>
              </div>
            )}

            {/* Title + brief for briefing and comparison */}
            {moment !== 1 && momentData.title && (
              <h2 className={styles.missionTitle}>{momentData.title}</h2>
            )}
            {moment !== 1 && (
              <p className={styles.missionBrief}>{momentData.text}</p>
            )}

            <p className={styles.missionPrompt}>{momentData.prompt ?? 'O que você faz?'}</p>

            <div className={styles.opts}>
              {momentData.opts.map(opt => (
                <button
                  key={opt.dim}
                  className={`${styles.optBtn}${selectedDim === opt.dim ? ` ${styles.optBtnSel}` : ''}`}
                  onClick={() => selectOpt(opt.dim)}
                >
                  <span className={styles.optIcon}>{opt.icon}</span>
                  <span className={styles.optText}>{opt.text}</span>
                </button>
              ))}
            </div>

            <div className={styles.navRow}>
              <button
                className={styles.btnBack}
                onClick={goBack}
                style={{ visibility: missionIdx === 0 && moment === 0 ? 'hidden' : 'visible' }}
              >
                ← Voltar
              </button>
              <span className={selectedDim ? styles.hintOk : styles.hint}>
                {selectedDim ? '✓ Escolha registrada' : 'Escolha uma opção para continuar'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

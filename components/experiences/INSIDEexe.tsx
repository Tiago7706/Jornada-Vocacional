'use client'

import { useState, useCallback, useEffect } from 'react'
import styles from './INSIDEexe.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface GameProps {
  patientId: string
  experienceId: number
  initialState?: Record<string, unknown>
  onStateChange: (state: Record<string, unknown>) => void
  onComplete: (scores: Record<string, unknown>, responses: Record<string, unknown>) => void
}

interface Curso {
  id: string
  nome: string
  emoji: string
  cor: string
  corBg: string
  vitamina: string
  msg: string
  pergunta: string
  opts: { txt: string; pts: number }[]
  subtitulo: string
  estuda: string
  pratica: string
  perfil: string
  atua: string
  curso: string
}

interface Answer { pts: number; star: number; optIdx: number }

// ── Data ──────────────────────────────────────────────────────────────────────

const CURSOS: Curso[] = [
  {
    id: 'astronomia', nome: 'Astronomia', emoji: '⭐', cor: '#FFD700', corBg: '#1a1500',
    vitamina: 'ESTELAR',
    msg: 'Olá, explorador... Eu existo desde antes do tempo. Sou feita de luz e gravitação — os padrões que governam tudo o que existe.',
    pergunta: 'O que mais te fascina no universo?',
    opts: [
      { txt: 'A origem do cosmos e por que existimos', pts: 3 },
      { txt: 'Os cálculos que descrevem órbitas e buracos negros', pts: 2 },
      { txt: 'A possibilidade de vida em outros mundos', pts: 2 },
      { txt: 'Não sinto atração por esse tipo de questão', pts: 0 },
    ],
    subtitulo: 'Bacharelado · 4 anos',
    estuda: 'Astrofísica, mecânica celeste, cosmologia, instrumentação astronômica, física quântica e relatividade.',
    pratica: 'Observa e analisa fenômenos celestes, desenvolve modelos computacionais, publica pesquisas e atua em projetos espaciais.',
    perfil: 'Curioso sobre a origem do universo, gosta de matemática avançada, pensamento abstrato e reflexão profunda.',
    atua: 'Observatórios, universidades, NASA, ESA, institutos de pesquisa espacial, planetários.',
    curso: '4 anos · Bacharelado · Área fortemente acadêmica · Alta demanda por pesquisadores e cientistas de dados.',
  },
  {
    id: 'computacao', nome: 'Ciência da Computação', emoji: '🤖', cor: '#00ffff', corBg: '#001a1a',
    vitamina: 'IA',
    msg: 'Processando... Olá. Sou feita de algoritmos e lógica pura. Aprendo com dados, resolvo o impossível e redefino os limites do que as máquinas podem fazer.',
    pergunta: 'O que você faria se pudesse programar qualquer coisa?',
    opts: [
      { txt: 'Uma IA que entende emoções humanas', pts: 3 },
      { txt: 'Um sistema que resolve problemas científicos complexos', pts: 3 },
      { txt: 'Um jogo ou aplicativo que as pessoas adorariam usar', pts: 2 },
      { txt: 'Nada — programar não me interessa', pts: 0 },
    ],
    subtitulo: 'Bacharelado · 4 anos',
    estuda: 'Algoritmos, estruturas de dados, inteligência artificial, sistemas operacionais, redes, teoria da computação.',
    pratica: 'Desenvolve software, cria sistemas de IA, pesquisa novos algoritmos e resolve problemas computacionais complexos.',
    perfil: 'Raciocínio lógico aguçado, gosta de resolver puzzles, curioso sobre como as máquinas pensam e aprendem.',
    atua: 'Google, Amazon, startups, bancos, laboratórios de pesquisa, qualquer empresa de tecnologia.',
    curso: '4 anos · Bacharelado · Uma das profissões mais demandadas e bem remuneradas do século XXI.',
  },
  {
    id: 'ct', nome: 'Ciência e Tecnologia', emoji: '🔬', cor: '#00ff88', corBg: '#001a0d',
    vitamina: 'NEXO',
    msg: 'Eu sou a interseção de tudo. Física, química, biologia, computação — aqui não existem fronteiras. A tecnologia nasce onde as ciências se encontram.',
    pergunta: 'Você prefere especializar-se fundo em uma área ou dominar várias?',
    opts: [
      { txt: 'Dominar várias — a inovação nasce nas fronteiras', pts: 3 },
      { txt: 'Depende do problema que preciso resolver', pts: 2 },
      { txt: 'Prefiro me aprofundar numa coisa só', pts: 1 },
      { txt: 'Não penso muito nisso', pts: 0 },
    ],
    subtitulo: 'Bacharelado · 4 anos',
    estuda: 'Base multidisciplinar em física, química, matemática, biologia e computação com foco em inovação tecnológica.',
    pratica: 'Atua em pesquisa aplicada, desenvolvimento de tecnologias e resolução de problemas complexos multidisciplinares.',
    perfil: 'Versátil, curioso em múltiplas áreas, gosta de inovação e não se contenta com uma única perspectiva.',
    atua: 'Centros de P&D, indústria de alta tecnologia, startups deep-tech, institutos de inovação.',
    curso: '4 anos · Bacharelado · Curso de base ampla — permite especialização posterior em diversas áreas.',
  },
  {
    id: 'lic_comp', nome: 'Licenciatura em Computação', emoji: '📡', cor: '#aa44ff', corBg: '#110022',
    vitamina: 'TRANSMISSORA',
    msg: 'Minha missão é diferente das outras — não crio código para máquinas, mas transmito o conhecimento digital para mentes humanas. Ensino é meu algoritmo.',
    pergunta: 'O que te motiva mais?',
    opts: [
      { txt: 'Ver alguém entender algo difícil que eu expliquei', pts: 3 },
      { txt: 'Tornar a tecnologia acessível para todos', pts: 3 },
      { txt: 'Criar sistemas e resolver problemas técnicos', pts: 1 },
      { txt: 'Nenhuma dessas', pts: 0 },
    ],
    subtitulo: 'Licenciatura · 4 anos',
    estuda: 'Pedagogia, didática, programação, robótica educacional, tecnologias na educação, metodologias de ensino.',
    pratica: 'Ensina programação e computação em escolas, desenvolve projetos de inclusão digital e forma cidadãos digitais.',
    perfil: 'Comunicativo, empático, apaixonado por tecnologia E por ensinar, vocação para transformar vidas.',
    atua: 'Escolas públicas e privadas, institutos técnicos, EJA, projetos sociais de tecnologia, ONGs.',
    curso: '4 anos · Licenciatura · Habilita para docência · Concursos públicos e carreira no magistério.',
  },
  {
    id: 'estatistica', nome: 'Estatística', emoji: '📊', cor: '#ff8800', corBg: '#1a0a00',
    vitamina: 'DADOS',
    msg: 'Tudo ao meu redor são padrões esperando para serem descobertos. Onde outros veem caos, eu vejo distribuições. Os números nunca mentem — mas podem ser interpretados.',
    pergunta: 'Como você tomaria uma decisão importante?',
    opts: [
      { txt: 'Coletando dados e analisando padrões antes de agir', pts: 3 },
      { txt: 'Buscando probabilidades e cenários possíveis', pts: 3 },
      { txt: 'Consultando pessoas de confiança', pts: 1 },
      { txt: 'Confiando na intuição', pts: 0 },
    ],
    subtitulo: 'Bacharelado · 4 anos',
    estuda: 'Probabilidade, inferência estatística, análise de dados, machine learning, modelos matemáticos, séries temporais.',
    pratica: 'Analisa grandes volumes de dados, cria modelos preditivos, apoia decisões em empresas, governos e pesquisa científica.',
    perfil: 'Analítico, preciso, confortável com incerteza e probabilidade, gosta de extrair verdades de números.',
    atua: 'Bancos, consultorias, institutos de pesquisa, IBGE, empresas de tecnologia, saúde pública.',
    curso: '4 anos · Bacharelado · Uma das profissões mais valorizadas na era do Big Data e IA.',
  },
  {
    id: 'fisica', nome: 'Física', emoji: '⚡', cor: '#ffff00', corBg: '#1a1a00',
    vitamina: 'CAMPO',
    msg: 'Eu sou as leis fundamentais do universo. Força, energia, espaço, tempo — tudo que existe obedece minhas equações. Da mecânica quântica à relatividade geral.',
    pergunta: 'O que mais te intriga?',
    opts: [
      { txt: 'Por que o tempo passa mais devagar perto de buracos negros', pts: 3 },
      { txt: 'Como elétrons podem estar em dois lugares ao mesmo tempo', pts: 3 },
      { txt: 'Como usar física para criar tecnologias revolucionárias', pts: 2 },
      { txt: 'Não sinto curiosidade por essas questões', pts: 0 },
    ],
    subtitulo: 'Bacharelado e/ou Licenciatura · 4–5 anos',
    estuda: 'Mecânica clássica e quântica, eletromagnetismo, termodinâmica, relatividade, física de partículas, laboratórios.',
    pratica: 'Pesquisa fenômenos físicos, desenvolve tecnologias, atua em laboratórios e ensina física na educação.',
    perfil: 'Pensamento abstrato elevado, prazer em compreender o funcionamento fundamental da realidade.',
    atua: 'Universidades, CERN, laboratórios de pesquisa, indústria aeroespacial, desenvolvimento de tecnologia.',
    curso: '4–5 anos · Bacharelado e/ou Licenciatura · Base sólida para física aplicada, engenharia e pesquisa.',
  },
  {
    id: 'informatica_biomedica', nome: 'Informática Biomédica', emoji: '🧬', cor: '#ff4488', corBg: '#1a0011',
    vitamina: 'BIOMÉDICA',
    msg: 'Sou a fusão entre o código e a vida. Uso algoritmos para entender doenças, desenvolver diagnósticos e salvar vidas. A biologia encontrou a computação — e o resultado é revolucionário.',
    pergunta: 'O que mais te emociona como possibilidade?',
    opts: [
      { txt: 'IA que diagnostica câncer antes do médico conseguir ver', pts: 3 },
      { txt: 'Sistemas que analisam DNA para personalizar tratamentos', pts: 3 },
      { txt: 'Tecnologia aplicada à saúde humana em geral', pts: 2 },
      { txt: 'Nenhuma dessas áreas me atrai', pts: 0 },
    ],
    subtitulo: 'Bacharelado · 4 anos',
    estuda: 'Bioinformática, sistemas de saúde digital, análise de dados biomédicos, imagens médicas, prontuários eletrônicos.',
    pratica: 'Desenvolve sistemas de saúde digital, analisa dados clínicos, cria ferramentas de diagnóstico assistido por IA.',
    perfil: 'Interesse simultâneo em tecnologia e saúde, gosta de impacto real e direto na vida das pessoas.',
    atua: 'Hospitais, empresas de healthtech, laboratórios, ministério da saúde, startups de saúde digital.',
    curso: '4 anos · Bacharelado · Área em explosão com a revolução da saúde digital e IA médica.',
  },
  {
    id: 'matematica', nome: 'Matemática', emoji: '∞', cor: '#ffffff', corBg: '#111111',
    vitamina: 'INFINITA',
    msg: 'Existo além do tempo e do espaço. Sou a linguagem do universo — não foi inventada, foi descoberta. A matemática é a única verdade absoluta que existe.',
    pergunta: 'Como você se sente diante de um problema sem solução imediata?',
    opts: [
      { txt: 'Fascinado — isso é exatamente o que me motiva', pts: 3 },
      { txt: 'Persistente — vou resolver mesmo que leve horas', pts: 3 },
      { txt: 'Ansioso mas curioso', pts: 2 },
      { txt: 'Prefiro problemas com respostas claras e rápidas', pts: 0 },
    ],
    subtitulo: 'Bacharelado e/ou Licenciatura · 4 anos',
    estuda: 'Álgebra, cálculo, geometria, topologia, análise real, matemática discreta, teoria dos números, lógica.',
    pratica: 'Pesquisa problemas matemáticos, desenvolve modelos para ciência e tecnologia, e ensina matemática.',
    perfil: 'Amor pela abstração pura, prazer em provar teoremas, raciocínio rigoroso e pensamento estruturado.',
    atua: 'Universidades, institutos de pesquisa, finanças quantitativas, criptografia, ciência de dados.',
    curso: '4 anos · Bacharelado e/ou Licenciatura · Base para todas as ciências — porta de entrada para qualquer área exata.',
  },
  {
    id: 'nanotecnologia', nome: 'Nanotecnologia', emoji: '🔩', cor: '#44ddff', corBg: '#001520',
    vitamina: 'NANO',
    msg: 'Trabalho onde os humanos não conseguem ver. Na escala de nanômetros — bilionésimos de metro — construo materiais do futuro átomo por átomo. O invisível é meu laboratório.',
    pergunta: 'O que te fascina mais?',
    opts: [
      { txt: 'Criar materiais que não existem na natureza', pts: 3 },
      { txt: 'Manipular matéria na escala atômica', pts: 3 },
      { txt: 'Aplicações médicas — nanorobôs destruindo células cancerígenas', pts: 2 },
      { txt: 'Nada disso me interessa', pts: 0 },
    ],
    subtitulo: 'Bacharelado · 4–5 anos',
    estuda: 'Física quântica, química de materiais, biologia molecular, engenharia de nanoestruturas, microscopia avançada.',
    pratica: 'Pesquisa e desenvolve novos materiais, nanoestruturas para medicina, eletrônica e energia.',
    perfil: 'Perfeccionista, curioso sobre o mundo invisível, gosta de trabalho altamente especializado e de fronteira.',
    atua: 'Laboratórios de pesquisa avançada, indústria farmacêutica, eletrônica, energia renovável, defesa.',
    curso: '4–5 anos · Bacharelado · Área de pesquisa de ponta — forte componente acadêmico e laboratorial.',
  },
  {
    id: 'quimica', nome: 'Química', emoji: '⚗️', cor: '#ff6644', corBg: '#1a0a00',
    vitamina: 'MOLECULAR',
    msg: 'Tudo o que você vê, cheira, sente e respira sou eu. Átomos se ligando, moléculas se transformando — a matéria em sua dança mais fundamental.',
    pergunta: 'O que você acha mais fascinante?',
    opts: [
      { txt: 'Como moléculas simples formam a vida', pts: 3 },
      { txt: 'Criar novos materiais ou medicamentos do zero', pts: 3 },
      { txt: 'Entender reações químicas e transformações da matéria', pts: 2 },
      { txt: 'Química nunca foi minha área', pts: 0 },
    ],
    subtitulo: 'Bacharelado e/ou Licenciatura · 4 anos',
    estuda: 'Química orgânica e inorgânica, físico-química, bioquímica, química analítica, laboratório experimental.',
    pratica: 'Desenvolve novos materiais, medicamentos e processos industriais, faz análises e pesquisa científica.',
    perfil: 'Curioso sobre a matéria em nível molecular, gosta de laboratório, experimentos e raciocínio analítico.',
    atua: 'Indústria farmacêutica, petroquímica, alimentos, cosméticos, universidades, laboratórios de análise.',
    curso: '4 anos · Bacharelado e/ou Licenciatura · Amplo mercado industrial e acadêmico.',
  },
  {
    id: 'sistemas', nome: 'Sistemas de Informação', emoji: '🖥️', cor: '#8844ff', corBg: '#0a0015',
    vitamina: 'SISTEMA',
    msg: 'Sou o equilíbrio perfeito entre tecnologia e gestão. Não só crio sistemas — entendo o negócio, as pessoas e como a tecnologia pode transformar organizações.',
    pergunta: 'O que te interessa mais em tecnologia?',
    opts: [
      { txt: 'Como a TI transforma empresas e processos de negócio', pts: 3 },
      { txt: 'Gerenciar projetos de tecnologia e liderar equipes', pts: 2 },
      { txt: 'Desenvolver sistemas que resolvem problemas reais', pts: 3 },
      { txt: 'Tecnologia não é minha área', pts: 0 },
    ],
    subtitulo: 'Bacharelado · 4 anos',
    estuda: 'Desenvolvimento de sistemas, banco de dados, gestão de TI, análise de negócios, segurança da informação.',
    pratica: 'Desenvolve e gerencia sistemas de informação, analisa processos e alinha tecnologia à estratégia de negócios.',
    perfil: 'Boa comunicação, interesse em tecnologia E negócios, gosta de resolver problemas práticos com TI.',
    atua: 'Empresas de todos os setores, consultorias de TI, bancos, governo, startups.',
    curso: '4 anos · Bacharelado · Curso com excelente empregabilidade e equilíbrio entre técnico e gestão.',
  },
]

const STAR_LABELS = ['Não é pra mim', '', '', '', 'É a minha área!']

// ── Component ─────────────────────────────────────────────────────────────────

export default function INSIDEexe({
  patientId: _patientId,
  experienceId: _experienceId,
  initialState,
  onStateChange,
  onComplete,
}: GameProps) {
  const [screen, setScreen] = useState<'title' | 'grid' | 'result'>('title')
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [activeId, setActiveId] = useState<string | null>(null)
  const [chosen, setChosen] = useState<{ optIdx: number; pts: number } | null>(null)
  const [showReveal, setShowReveal] = useState(false)
  const [starVal, setStarVal] = useState(0)
  const [barsReady, setBarsReady] = useState(false)

  // ── Restore ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialState?.answers) {
      const saved = initialState.answers as Record<string, Answer>
      setAnswers(saved)
      if (Object.keys(saved).length >= CURSOS.length) {
        setScreen('result')
        setTimeout(() => setBarsReady(true), 60)
      } else {
        setScreen('grid')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const answeredCount = Object.keys(answers).length
  const totalPts = Object.values(answers).reduce((s, a) => s + a.pts, 0)
  const allDone = answeredCount >= CURSOS.length

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openCard = (id: string) => {
    if (answers[id]) return
    setActiveId(id)
    setChosen(null)
    setShowReveal(false)
    setStarVal(0)
  }

  const pickOpt = (optIdx: number, pts: number) => {
    if (chosen !== null) return
    setChosen({ optIdx, pts })
    setShowReveal(true)
  }

  const confirm = useCallback(() => {
    if (!activeId || !chosen || starVal === 0) return
    const newAnswers: Record<string, Answer> = {
      ...answers,
      [activeId]: { pts: chosen.pts, star: starVal, optIdx: chosen.optIdx },
    }
    setAnswers(newAnswers)
    onStateChange({ answers: newAnswers })
    setActiveId(null)
    setChosen(null)
    setShowReveal(false)
    setStarVal(0)
  }, [activeId, chosen, starVal, answers, onStateChange])

  const showResult = () => {
    setScreen('result')
    setTimeout(() => setBarsReady(true), 60)
  }

  const finish = useCallback(() => {
    const sorted = [...CURSOS]
      .filter(c => answers[c.id])
      .sort((a, b) => {
        const diff = answers[b.id]!.pts - answers[a.id]!.pts
        return diff !== 0 ? diff : answers[b.id]!.star - answers[a.id]!.star
      })
    const scores = {
      total: CURSOS.length,
      totalPts,
      maxPts: CURSOS.length * 3,
      courses: Object.fromEntries(CURSOS.map(c => [c.id, answers[c.id] ?? null])),
      topCourses: sorted.slice(0, 3).map(c => ({
        id: c.id, nome: c.nome, pts: answers[c.id]!.pts, star: answers[c.id]!.star,
      })),
    }
    onComplete(scores, { answers })
  }, [answers, totalPts, onComplete])

  // ── Ranking ────────────────────────────────────────────────────────────────
  const ranking = [...CURSOS]
    .filter(c => answers[c.id])
    .sort((a, b) => {
      const diff = answers[b.id]!.pts - answers[a.id]!.pts
      return diff !== 0 ? diff : answers[b.id]!.star - answers[a.id]!.star
    })
  const maxRankPts = Math.max(...ranking.map(c => answers[c.id]!.pts), 1)
  const activeCurso = activeId ? CURSOS.find(c => c.id === activeId) : null

  // ── TITLE ──────────────────────────────────────────────────────────────────
  if (screen === 'title') {
    return (
      <div className={styles.root}>
        <section className={styles.heroSection}>
          <div className={styles.heroIcon}>&lt;/&gt;</div>
          <h1 className={styles.heroTitle}>INSIDE.exe</h1>
          <p className={styles.heroSub}>Ciências Exatas &amp; Informação</p>
          <div className={styles.introBox}>
            <p>
              <strong>11 cursos</strong> estão prestes a se revelar para você.{' '}
              Cada um vai <strong>falar diretamente</strong> com você em primeira pessoa —
              responda o que sente ao ouvir cada um deles.
            </p>
          </div>
          <button className={styles.btnPrimary} onClick={() => setScreen('grid')}>
            INICIAR
          </button>
        </section>
      </div>
    )
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (screen === 'result') {
    return (
      <div className={styles.root}>
        <div className={styles.resultRoot}>
          <div className={styles.resultHeader}>
            <div className={styles.resultTrophy}>🔬</div>
            <div className={styles.resultTitle}>ANÁLISE CONCLUÍDA</div>
            <div className={styles.resultSub}>
              {totalPts} pontos · {answeredCount} cursos explorados
            </div>
          </div>

          {ranking.map((curso, i) => {
            const ans = answers[curso.id]!
            const barW = barsReady ? Math.round((ans.pts / maxRankPts) * 100) : 0
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1)
            return (
              <div key={curso.id} className={styles.rankItem}>
                <div className={styles.rankPos}>{medal}</div>
                <div className={styles.rankInfo}>
                  <div className={styles.rankNome}>
                    {curso.emoji} {curso.nome}
                  </div>
                  <div className={styles.rankBarWrap}>
                    <div className={styles.rankBarTrack}>
                      <div
                        className={styles.rankBarFill}
                        style={{ width: `${barW}%`, background: curso.cor }}
                      />
                    </div>
                    <span className={styles.rankPts}>{ans.pts}</span>
                  </div>
                </div>
              </div>
            )
          })}

          <button className={styles.resultBtn} onClick={finish}>
            Concluir
          </button>
        </div>
      </div>
    )
  }

  // ── GRID ───────────────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>
      {/* HUD */}
      <header className={styles.hud}>
        <div>
          <div className={styles.hudTitle}>INSIDE.exe</div>
          <div className={styles.hudSub}>Ciências Exatas &amp; Informação</div>
        </div>
        <div className={styles.hudStats}>
          <div className={styles.stat}>
            <div className={styles.statVal}>{totalPts}</div>
            <div className={styles.statLbl}>PONTOS</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statVal}>{answeredCount}/{CURSOS.length}</div>
            <div className={styles.statLbl}>CURSOS</div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className={styles.progressWrap}>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${(answeredCount / CURSOS.length) * 100}%` }}
          />
        </div>
        <span className={styles.progressLabel}>{answeredCount}/{CURSOS.length} explorados</span>
      </div>

      {/* Card grid */}
      <div className={styles.grid}>
        {CURSOS.map(curso => {
          const ans = answers[curso.id]
          return (
            <div
              key={curso.id}
              className={`${styles.card}${ans ? ` ${styles.done}` : ''}`}
              onClick={() => openCard(curso.id)}
            >
              <div className={styles.cardThumb} style={{ background: curso.corBg }}>
                <span style={{ fontSize: 28, color: curso.cor }}>{curso.emoji}</span>
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardNome}>{curso.nome}</div>
                <span
                  className={styles.vitamina}
                  style={{ background: `${curso.cor}22`, color: curso.cor }}
                >
                  {curso.vitamina}
                </span>
              </div>
              {ans && <div className={styles.cardCheck}>✓</div>}
            </div>
          )
        })}
      </div>

      {/* Ver resultados button — only when all done */}
      {allDone && (
        <button className={styles.btnResult} onClick={showResult}>
          Ver Resultados
        </button>
      )}

      {/* Modal */}
      {activeCurso && (
        <div
          className={styles.modalOverlay}
          onClick={e => { if (e.target === e.currentTarget) { setActiveId(null); setChosen(null); setShowReveal(false); setStarVal(0) } }}
        >
          <div className={styles.modalBox}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalEmoji}>{activeCurso.emoji}</div>
              <div className={styles.modalNome}>{activeCurso.nome}</div>
              <span
                className={styles.modalVitamina}
                style={{
                  background: `${activeCurso.cor}22`,
                  color: activeCurso.cor,
                  borderColor: `${activeCurso.cor}44`,
                }}
              >
                {activeCurso.vitamina}
              </span>
            </div>

            {/* First-person message */}
            <div className={styles.msgBubble}>{activeCurso.msg}</div>

            {/* Question */}
            <div className={styles.perguntaBox}>{activeCurso.pergunta}</div>

            {/* Options */}
            <div className={styles.optsGrid}>
              {activeCurso.opts.map((opt, i) => (
                <button
                  key={i}
                  className={`${styles.optBtn}${chosen?.optIdx === i ? ` ${styles.selected}` : ''}`}
                  onClick={() => pickOpt(i, opt.pts)}
                  disabled={chosen !== null}
                >
                  <span className={styles.optPts}>
                    {opt.pts}pt{opt.pts !== 1 ? 's' : ''}
                  </span>
                  {opt.txt}
                </button>
              ))}
            </div>

            {/* Pts earned reveal */}
            {showReveal && chosen !== null && (
              <div className={styles.ptsReveal}>
                {chosen.pts === 0
                  ? '0 pontos — tudo bem, não é pra todo mundo!'
                  : chosen.pts === 1
                  ? '+1 ponto — há algo aqui que te toca'
                  : chosen.pts === 2
                  ? '+2 pontos — você se conectou!'
                  : '+3 pontos — conexão máxima!'}
              </div>
            )}

            {/* Reveal section */}
            {showReveal && (
              <div className={styles.revealSection}>
                <div className={styles.revealLabel}>O que estuda</div>
                <div className={styles.revealInfo}>{activeCurso.estuda}</div>
                <div className={styles.revealLabel}>Na prática</div>
                <div className={styles.revealInfo}>{activeCurso.pratica}</div>
                <div className={styles.revealLabel}>Onde atua</div>
                <div className={styles.revealInfo}>{activeCurso.atua}</div>
                <div className={styles.revealLabel}>Duração</div>
                <div className={styles.revealInfo}>{activeCurso.subtitulo}</div>
              </div>
            )}

            {/* Star rating */}
            {showReveal && (
              <div className={styles.ratingSection}>
                <div className={styles.ratingLabel}>Como você avalia seu interesse?</div>
                <div className={styles.ratingSub}>Independente da sua resposta anterior</div>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span
                      key={s}
                      className={`${styles.star}${starVal >= s ? ` ${styles.active}` : ''}`}
                      onClick={() => setStarVal(s)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className={styles.starLabels}>
                  {STAR_LABELS.map((lbl, i) => (
                    <span key={i}>{lbl}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm */}
            <button
              className={styles.btnConfirm}
              onClick={confirm}
              disabled={!showReveal || starVal === 0}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

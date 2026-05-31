'use client'

import { useState, useCallback, useEffect } from 'react'
import styles from './UmaNoiteNoMuseu.module.css'

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

interface Curso {
  id: string; nome: string; emoji: string; subtitulo: string
  hint: string; alternativas: string[]; correta: number
  estuda: string; pratica: string; perfil: string; atua: string; curso: string
}

const CURSOS: Curso[] = [
  { id:'animacao', nome:'Animação', emoji:'🎬', subtitulo:'Bacharelado · 4 anos',
    hint:'Uma sequência de quadros desenhados à mão, cada um guardando um momento único...',
    alternativas:['Animação','Design de Games','Artes Visuais','Cinema'], correta:0,
    estuda:'Desenho, storyboard, animação 2D e 3D, design de personagens, narrativa visual, software de animação.',
    pratica:'Cria personagens e cenários, produz animações para filmes, séries, publicidade, games e plataformas digitais.',
    perfil:'Criativo, paciente, apaixonado por desenho e narrativa, gosta de dar vida a personagens e histórias.',
    atua:'Estúdios de animação, produtoras, agências digitais, empresas de games, plataformas de streaming.',
    curso:'4 anos · Bacharelado · Combina arte, tecnologia e narrativa · Alta demanda no mercado digital.' },
  { id:'arquitetura', nome:'Arquitetura e Urbanismo', emoji:'🏛️', subtitulo:'Bacharelado · 5 anos',
    hint:'Formas tridimensionais tomam vida na tela, moldando espaços antes mesmo de existirem...',
    alternativas:['Arquitetura e Urbanismo','Design de Interiores','Design','Engenharia Civil'], correta:0,
    estuda:'Projeto arquitetônico, urbanismo, estruturas, instalações, história da arquitetura, software de modelagem 3D.',
    pratica:'Projeta edifícios, residências, espaços públicos, intervém em cidades e planeja ambientes urbanos.',
    perfil:'Visual, criativo e técnico ao mesmo tempo, interesse por espaços, cidades e bem-estar das pessoas.',
    atua:'Escritórios de arquitetura, construtoras, prefeituras, empresas de engenharia, arquitetura independente.',
    curso:'5 anos · Bacharelado · Registro obrigatório no CAU · Uma das profissões mais valorizadas no Brasil.' },
  { id:'artes_visuais', nome:'Artes Visuais', emoji:'🎨', subtitulo:'Bacharelado e/ou Licenciatura · 4 anos',
    hint:'Diante do cavalete em branco, a criação aguarda o primeiro gesto...',
    alternativas:['Artes Visuais','História da Arte','Design','Animação'], correta:0,
    estuda:'Pintura, escultura, gravura, fotografia artística, arte digital, instalação, história e teoria da arte.',
    pratica:'Produz obras artísticas, expõe em galerias e museus, desenvolve projetos de arte pública e ensina artes.',
    perfil:'Expressivo, reflexivo, gosta de experimentar linguagens visuais, sensível à cultura e ao mundo ao redor.',
    atua:'Galerias, museus, escolas, estúdios independentes, ONGs culturais, produção artística autoral.',
    curso:'4 anos · Bacharelado e/ou Licenciatura · Licenciatura habilita para o ensino de artes nas escolas.' },
  { id:'comunicacao', nome:'Comunicação das Artes do Corpo', emoji:'💃', subtitulo:'Bacharelado · 4 anos',
    hint:'O corpo é suporte, instrumento e mensagem ao mesmo tempo...',
    alternativas:['Dança','Comunicação das Artes do Corpo','Teatro','Educação Física'], correta:1,
    estuda:'Performance, expressão corporal, dança contemporânea, teatro, moda cênica, teoria das artes do corpo.',
    pratica:'Cria e apresenta performances, dirige produções cênicas, pesquisa linguagens corporais e artísticas.',
    perfil:'Expressivo, criativo, usa o corpo como meio de comunicação, interesse em arte, cultura e performance.',
    atua:'Companhias de dança e teatro, festivais de arte, espaços culturais, pesquisa acadêmica em artes.',
    curso:'4 anos · Bacharelado · Curso único que integra múltiplas linguagens do corpo como expressão artística.' },
  { id:'conservacao', nome:'Conservação e Restauro', emoji:'🏺', subtitulo:'Bacharelado · 4 anos',
    hint:'Mãos experientes devolvem ao passado sua presença no presente...',
    alternativas:['História da Arte','Conservação e Restauro','Artes Visuais','Museologia'], correta:1,
    estuda:'Técnicas de restauro, conservação preventiva, química aplicada à arte, história da arte, diagnóstico de obras.',
    pratica:'Restaura pinturas, esculturas e documentos históricos, desenvolve planos de conservação de acervos.',
    perfil:'Paciente, detalhista, apaixonado por arte e história, interesse em ciência aplicada à preservação cultural.',
    atua:'Museus, galerias, institutos culturais, igrejas, acervos públicos e privados, patrimônio histórico.',
    curso:'4 anos · Bacharelado · Combina ciência, arte e história · Profissão essencial para a memória cultural.' },
  { id:'danca', nome:'Dança', emoji:'💃', subtitulo:'Bacharelado e/ou Licenciatura · 4 anos',
    hint:'O palco iluminado testemunha a narrativa que só o movimento pode contar...',
    alternativas:['Teatro','Comunicação das Artes do Corpo','Dança','Educação Física'], correta:2,
    estuda:'Ballet clássico, dança contemporânea, técnicas somáticas, coreografia, história da dança, pedagogia do movimento.',
    pratica:'Dança em espetáculos, cria coreografias, dirige companhias, ensina dança em escolas e academias.',
    perfil:'Disciplinado, expressivo, ama o movimento e a música, comprometido com a arte e o trabalho corporal.',
    atua:'Companhias de dança, teatros, escolas, academias, festivais, produções de TV e cinema.',
    curso:'4 anos · Bacharelado e/ou Licenciatura · Licenciatura habilita para o ensino de dança nas escolas.' },
  { id:'games', nome:'Design de Games', emoji:'🕹️', subtitulo:'Bacharelado · 4 anos',
    hint:'Heróis de pixels habitam mundos construídos bit a bit...',
    alternativas:['Animação','Design de Games','Design','Ciência da Computação'], correta:1,
    estuda:'Game design, narrativa interativa, arte para games, programação, UX, level design, prototipagem.',
    pratica:'Cria mecânicas de jogo, desenvolve personagens e cenários, produz jogos digitais e analógicos.',
    perfil:'Gamer, criativo, curioso por tecnologia e narrativa, gosta de criar experiências interativas.',
    atua:'Estúdios de games, empresas de tecnologia, publicidade gamificada, desenvolvimento independente.',
    curso:'4 anos · Bacharelado · Mercado em expansão no Brasil e no mundo · Alta demanda por profissionais.' },
  { id:'interiores', nome:'Design de Interiores', emoji:'🛋️', subtitulo:'Bacharelado · 4 anos',
    hint:'Cada detalhe de um ambiente revela uma intenção, uma emoção, um estilo de vida...',
    alternativas:['Arquitetura e Urbanismo','Design','Design de Interiores','Decoração'], correta:2,
    estuda:'Projeto de interiores, mobiliário, iluminação, materiais, ergonomia, estética e software de modelagem 3D.',
    pratica:'Projeta e decora ambientes residenciais e comerciais, gerencia obras de interiores, apresenta projetos a clientes.',
    perfil:'Estético, organizado, interesse em ambientes, materiais e bem-estar das pessoas em seus espaços.',
    atua:'Escritórios de design, construtoras, imobiliárias, lojas de móveis, projetos independentes.',
    curso:'4 anos · Bacharelado · Registro no CFT ou CAU dependendo da formação · Mercado aquecido.' },
  { id:'moda', nome:'Design de Moda', emoji:'👗', subtitulo:'Bacharelado · 4 anos',
    hint:'O croqui ganha contornos e a figura em movimento anuncia uma nova coleção...',
    alternativas:['Design','Design de Moda','Artes Visuais','Comunicação das Artes do Corpo'], correta:1,
    estuda:'Criação de moda, modelagem, costura, história da moda, estamparia, gestão de coleções, sustentabilidade.',
    pratica:'Cria coleções de roupas e acessórios, desenvolve estampas, gerencia produção e apresenta desfiles.',
    perfil:'Criativo, antenado em tendências, interesse em cultura, comportamento e expressão através da roupa.',
    atua:'Marcas de moda, confecções, estúdios de design, consultoria de imagem, moda independente.',
    curso:'4 anos · Bacharelado · Moda como forma de expressão cultural, artística e mercadológica.' },
  { id:'design', nome:'Design', emoji:'✏️', subtitulo:'Bacharelado · 4 anos',
    hint:'Entre papéis, ideias e uma tela insistente, nasce a solução visual...',
    alternativas:['Design','Design de Interiores','Comunicação em Mídias Digitais','Artes Visuais'], correta:0,
    estuda:'Tipografia, identidade visual, design gráfico, design digital, UX/UI, ilustração, branding e metodologia projetual.',
    pratica:'Cria logos, materiais gráficos, interfaces digitais, embalagens, campanhas visuais e sistemas de identidade.',
    perfil:'Criativo e analítico, gosta de resolver problemas visualmente, atenção aos detalhes e estética.',
    atua:'Agências de design e publicidade, empresas de tecnologia, startups, estúdios criativos, freelancer.',
    curso:'4 anos · Bacharelado · Uma das profissões mais versáteis e demandadas no mercado criativo.' },
  { id:'fotografia', nome:'Fotografia', emoji:'📷', subtitulo:'Bacharelado · 4 anos',
    hint:'A lente captura o instante — e o instante se torna eterno...',
    alternativas:['Cinema e Audiovisual','Fotografia','Design','Jornalismo'], correta:1,
    estuda:'Técnica fotográfica, iluminação, composição, fotojornalismo, fotografia artística, edição de imagem e história da fotografia.',
    pratica:'Fotografa eventos, pessoas, produtos e paisagens; produz ensaios fotográficos e expõe trabalhos artísticos.',
    perfil:'Observador, sensível à luz e à composição, contador de histórias por imagens, criativo e técnico.',
    atua:'Estúdios fotográficos, agências, revistas, casamentos, publicidade, fotografia documental e artística.',
    curso:'4 anos · Bacharelado · Combina técnica e arte · Múltiplas especialidades no mercado.' },
  { id:'historia_arte', nome:'História da Arte', emoji:'🖼️', subtitulo:'Bacharelado · 4 anos',
    hint:'Diante de obras de séculos passados, o olhar treinado lê o que os olhos comuns não veem...',
    alternativas:['Museologia','Artes Visuais','Conservação e Restauro','História da Arte'], correta:3,
    estuda:'Arte antiga, medieval, moderna e contemporânea, teoria estética, crítica de arte, curadoria e mercado de arte.',
    pratica:'Pesquisa e analisa obras de arte, cuida de acervos, escreve crítica especializada, organiza exposições.',
    perfil:'Curioso, analítico, apaixonado por arte e cultura, gosta de pesquisa, leitura e reflexão crítica.',
    atua:'Museus, galerias, universidades, fundações culturais, leilões de arte, crítica especializada.',
    curso:'4 anos · Bacharelado · Formação teórica e crítica aprofundada no universo das artes visuais.' },
  { id:'musica', nome:'Música', emoji:'🎵', subtitulo:'Bacharelado e/ou Licenciatura · 4 anos',
    hint:'Notas e acordes compartilham o espaço com quem as cria e as sente...',
    alternativas:['Música','Teatro','Dança','Comunicação das Artes do Corpo'], correta:0,
    estuda:'Instrumento, teoria musical, harmonia, composição, história da música, regência e pedagogia musical.',
    pratica:'Toca em grupos e orquestras, compõe, arranja, dá aulas de instrumento, produz música autoral.',
    perfil:'Apaixonado por música, disciplinado, auditivo, gosta de criar e interpretar sons e emoções.',
    atua:'Orquestras, bandas, escolas de música, conservatórios, produção musical, trilhas sonoras.',
    curso:'4 anos · Bacharelado e/ou Licenciatura · Licenciatura habilita para o ensino de música nas escolas.' },
  { id:'teatro', nome:'Teatro', emoji:'🎭', subtitulo:'Bacharelado e/ou Licenciatura · 4 anos',
    hint:'Sob os holofotes, a ficção e a realidade se encontram num só palco...',
    alternativas:['Comunicação das Artes do Corpo','Dança','Teatro','Cinema e Audiovisual'], correta:2,
    estuda:'Interpretação, dramaturgia, direção teatral, voz, expressão corporal, história do teatro, cenografia.',
    pratica:'Atua em peças de teatro, dirige espetáculos, escreve dramaturgias, leciona artes cênicas.',
    perfil:'Expressivo, empático, gosta de contar histórias, trabalho em grupo, disposição para experimentar.',
    atua:'Companhias teatrais, festivais, escolas, TV, cinema, produção cultural independente.',
    curso:'4 anos · Bacharelado e/ou Licenciatura · Arte cênica com múltiplas possibilidades de atuação.' },
]

// Map: nome → emoji (para botões de opção)
const EMOJI_BY_NOME: Record<string, string> = {}
CURSOS.forEach(c => { EMOJI_BY_NOME[c.nome] = c.emoji })

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Answer { chosenIdx: number; correct: boolean; star: number }
interface RankItem { id: string; nome: string; emoji: string; star: number }

interface Props {
  patientId: string
  experienceId: number
  initialState?: Record<string, unknown>
  onStateChange: (s: Record<string, unknown>) => void
  onComplete: (scores: Record<string, unknown>, responses: Record<string, unknown>) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function UmaNoiteNoMuseu({ initialState, onStateChange, onComplete }: Props) {
  const [screen, setScreen] = useState<'title' | 'quiz' | 'result'>('title')
  const [order, setOrder] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [chosenIdx, setChosenIdx] = useState<number | null>(null)
  const [showReveal, setShowReveal] = useState(false)
  const [starVal, setStarVal] = useState(0)
  const [resultRanking, setResultRanking] = useState<RankItem[]>([])
  const [barsReady, setBarsReady] = useState(false)

  // ── Restore ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!initialState?.order) return
    const savedOrder = initialState.order as string[]
    const savedAnswers = (initialState.answers ?? {}) as Record<string, Answer>
    const savedIdx = (initialState.currentIdx as number) ?? Object.keys(savedAnswers).length
    setOrder(savedOrder); setAnswers(savedAnswers); setCurrentIdx(savedIdx)
    if (savedIdx >= CURSOS.length) {
      buildRanking(savedOrder, savedAnswers)
      setScreen('result')
      setTimeout(() => setBarsReady(true), 60)
    } else {
      setScreen('quiz')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Save ─────────────────────────────────────────────────────────────────

  const save = useCallback((o: string[], a: Record<string, Answer>, idx: number) => {
    onStateChange({ order: o, answers: a, currentIdx: idx })
  }, [onStateChange])

  // ── Start ────────────────────────────────────────────────────────────────

  function startGame() {
    const o = shuffle(CURSOS.map(c => c.id))
    setOrder(o); setCurrentIdx(0); setAnswers({})
    setChosenIdx(null); setShowReveal(false); setStarVal(0)
    setScreen('quiz')
    save(o, {}, 0)
  }

  // ── Current question ──────────────────────────────────────────────────────

  const curso = order.length > 0 ? CURSOS.find(c => c.id === order[currentIdx]) ?? null : null

  // ── Build ranking ─────────────────────────────────────────────────────────

  function buildRanking(ord: string[], ans: Record<string, Answer>) {
    const ranked = ord
      .map(id => {
        const c = CURSOS.find(x => x.id === id)!
        return { id, nome: c.nome, emoji: c.emoji, star: ans[id]?.star ?? 0 }
      })
      .sort((a, b) => b.star - a.star)
    setResultRanking(ranked)
  }

  // ── Confirm ───────────────────────────────────────────────────────────────

  function confirm() {
    if (!curso || chosenIdx === null || starVal === 0) return
    const isCorrect = chosenIdx === curso.correta
    const newAnswers: Record<string, Answer> = {
      ...answers,
      [curso.id]: { chosenIdx, correct: isCorrect, star: starVal },
    }
    const nextIdx = currentIdx + 1
    setAnswers(newAnswers)
    save(order, newAnswers, nextIdx)

    if (nextIdx >= CURSOS.length) {
      buildRanking(order, newAnswers)
      setScreen('result')
      setTimeout(() => setBarsReady(true), 60)
      const correctCount = Object.values(newAnswers).filter(a => a.correct).length
      const ratings: Record<string, number> = {}
      Object.entries(newAnswers).forEach(([id, a]) => { ratings[id] = a.star })
      onComplete(
        { total: CURSOS.length, correct: correctCount, ratings },
        { answers: newAnswers, order },
      )
    } else {
      setCurrentIdx(nextIdx)
      setChosenIdx(null); setShowReveal(false); setStarVal(0)
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const correctCount  = Object.values(answers).filter(a => a.correct).length
  const totalAnswered = Object.keys(answers).length
  const progress      = CURSOS.length > 0 ? (totalAnswered / CURSOS.length) * 100 : 0

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Title
  // ─────────────────────────────────────────────────────────────────────────

  if (screen === 'title') return (
    <div className={styles.root}>
      <div className={styles.heroSection}>
        <div className={styles.heroIcon}>🖼️</div>
        <h1 className={styles.heroTitle}>Uma Noite no Museu</h1>
        <p className={styles.heroSub}>Artes e Design</p>
        <div className={styles.introBox}>
          <p>O museu está cheio de <strong>obras e objetos misteriosos</strong>. Cada um pertence a uma área das Artes e Design.</p>
          <br />
          <p>Observe a <strong>pista visual</strong> de cada obra e <strong>descubra qual curso</strong> ela representa. Depois avalie seu interesse!</p>
        </div>
        <button className={styles.btnPrimary} onClick={startGame}>VISITAR O MUSEU</button>
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Result
  // ─────────────────────────────────────────────────────────────────────────

  if (screen === 'result') {
    const maxStar = Math.max(...resultRanking.map(r => r.star), 1)
    return (
      <div className={styles.root}>
        <div className={styles.resultRoot}>
          <div className={styles.resultHeader}>
            <div className={styles.resultTrophy}>🏆</div>
            <div className={styles.resultTitle}>Exposição Concluída!</div>
            <div className={styles.resultSub}>{correctCount} acertos de {CURSOS.length} · {totalAnswered} obras avaliadas</div>
          </div>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,.4)', marginBottom:'12px', paddingLeft:'4px' }}>
            CURSOS QUE MAIS LHE INTERESSARAM
          </p>
          {resultRanking.filter(r => r.star > 0).map((r, i) => (
            <div key={r.id} className={styles.rankItem}>
              <span className={styles.rankPos}>{['🥇','🥈','🥉'][i] ?? `${i+1}.`}</span>
              <div className={styles.rankInfo}>
                <div className={styles.rankNome}>{r.emoji} {r.nome}</div>
                <div className={styles.rankBarWrap}>
                  <div className={styles.rankBarTrack}>
                    <div className={styles.rankBarFill} style={{ width: barsReady ? `${(r.star/maxStar)*100}%` : '0%' }} />
                  </div>
                  <span className={styles.rankPts}>{r.star}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Quiz
  // ─────────────────────────────────────────────────────────────────────────

  if (!curso) return null

  return (
    <div className={styles.root}>
      {/* HUD */}
      <div className={styles.hud}>
        <div>
          <div className={styles.hudTitle}>UMA NOITE NO MUSEU</div>
          <div className={styles.hudSub}>Artes e Design</div>
        </div>
        <div className={styles.hudStats}>
          <div className={styles.stat}>
            <div className={styles.statVal}>{currentIdx + 1}/{CURSOS.length}</div>
            <div className={styles.statLbl}>OBRA</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statVal}>{correctCount}</div>
            <div className={styles.statLbl}>ACERTOS</div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className={styles.progressWrap}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.progressLabel}>{totalAnswered}/{CURSOS.length}</span>
      </div>

      <div className={styles.quizWrap}>
        {/* Hint card */}
        <div className={styles.hintCard}>
          <span className={styles.hintEmoji}>{curso.emoji}</span>
          <div className={styles.hintLabel}>Que curso é este?</div>
          <div className={styles.hintText}>{curso.hint}</div>
        </div>

        {/* Options */}
        <div className={styles.optionsGrid}>
          {curso.alternativas.map((alt, idx) => {
            const isCorrectOpt = idx === curso.correta
            const isChosenOpt  = idx === chosenIdx
            const cls = [
              styles.optionBtn,
              showReveal && isCorrectOpt ? styles.correct : '',
              showReveal && isChosenOpt && !isCorrectOpt ? styles.wrong : '',
            ].filter(Boolean).join(' ')
            return (
              <button key={idx} className={cls}
                onClick={() => { if (chosenIdx === null) { setChosenIdx(idx); setShowReveal(true) } }}
                disabled={chosenIdx !== null}
              >
                <div className={styles.optionEmoji}>{EMOJI_BY_NOME[alt] ?? '🎓'}</div>
                <div className={styles.optionNome}>{alt}</div>
              </button>
            )
          })}
        </div>

        {/* Reveal */}
        {showReveal && (
          <div className={styles.revealPanel}>
            {chosenIdx === curso.correta
              ? <div className={styles.revealCorrect}>Correto! Bom olho para arte!</div>
              : <div className={styles.revealWrong}>Era {curso.emoji} {curso.nome}</div>
            }
            <div className={styles.revealLabel}>O que estuda</div>
            <div className={styles.revealInfo}>{curso.estuda}</div>
            <div className={styles.revealLabel}>O que pratica</div>
            <div className={styles.revealInfo}>{curso.pratica}</div>
          </div>
        )}

        {/* Star rating */}
        {showReveal && (
          <div className={styles.ratingSection}>
            <div className={styles.ratingLabel}>Quanto te interessa {curso.nome}?</div>
            <div className={styles.ratingSub}>Avalie de 1 a 5 estrelas</div>
            <div className={styles.stars}>
              {[1,2,3,4,5].map(s => (
                <span key={s}
                  className={`${styles.star}${starVal >= s ? ` ${styles.active}` : ''}`}
                  onClick={() => setStarVal(s)}
                >⭐</span>
              ))}
            </div>
            <div className={styles.starLabels}>
              <span>Nada</span><span>Pouco</span><span>Médio</span><span>Bastante</span><span>Paixão</span>
            </div>
          </div>
        )}

        {showReveal && (
          <button className={styles.btnConfirm} onClick={confirm} disabled={starVal === 0}>
            {currentIdx < CURSOS.length - 1 ? 'PRÓXIMA OBRA' : 'VER RESULTADO'}
          </button>
        )}
      </div>
    </div>
  )
}

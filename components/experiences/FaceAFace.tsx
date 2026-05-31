'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import styles from './FaceAFace.module.css'

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

interface Personagem {
  id: string; nome: string; emoji: string; subtitulo: string
  estuda: string; atua: string; perfil: string; pratica: string; curso: string
}

const PERSONAGENS: Personagem[] = [
  { id:'arqueologia', nome:'Arqueologia', emoji:'⛏️', subtitulo:'Bacharelado · 4 anos',
    estuda:'Escavação e análise de sítios arqueológicos, patrimônio histórico, antropologia física, datação de artefatos, arqueologia subaquática.',
    atua:'IPHAN, institutos de pesquisa, museus, empresas de arqueologia preventiva, universidades, projetos de salvamento.',
    perfil:'Curioso sobre o passado humano, gosta de trabalho de campo, paciente e detalhista, aprecia história e ciências naturais.',
    pratica:'Realiza escavações em campo, analisa artefatos e ossos, elabora relatórios de patrimônio, atua em salvamentos arqueológicos antes de obras.',
    curso:'4 anos · Bacharelado · Estágios em campo e laboratório · Registro no IPHAN obrigatório.' },
  { id:'ciencias_consumo', nome:'Ciências do Consumo', emoji:'🛒', subtitulo:'Bacharelado · 4 anos',
    estuda:'Comportamento do consumidor, marketing, economia doméstica, direito do consumidor, políticas públicas de consumo, sustentabilidade.',
    atua:'Procon, empresas privadas, consultorias, institutos de pesquisa de mercado, órgãos de defesa do consumidor.',
    perfil:'Analítico, curioso sobre o comportamento humano, interessado em mercado, economia e relações de consumo.',
    pratica:'Analisa hábitos de consumo, orienta consumidores sobre direitos, desenvolve pesquisas de mercado, atua em defesa do consumidor.',
    curso:'4 anos · Bacharelado · Curso único no Brasil · Combina economia, direito, administração e ciências sociais.' },
  { id:'ciencias_humanas', nome:'Ciências Humanas', emoji:'📚', subtitulo:'Licenciatura · 4 anos',
    estuda:'Filosofia, História, Sociologia e Geografia de forma integrada, pensamento crítico, interdisciplinaridade e pesquisa educacional.',
    atua:'Educação básica como professor polivalente, pesquisa acadêmica, gestão cultural, políticas públicas educacionais.',
    perfil:'Inquieto intelectualmente, gosta de questionar, lê muito, aprecia o debate de ideias e o ambiente escolar.',
    pratica:'Leciona múltiplas disciplinas humanísticas, desenvolve projetos pedagógicos integrados, realiza pesquisa educacional e cultural.',
    curso:'4 anos · Licenciatura · Habilita para lecionar Filosofia, História, Sociologia e Geografia no Ensino Médio.' },
  { id:'ciencias_sociais', nome:'Ciências Sociais', emoji:'🌍', subtitulo:'Bacharelado/Licenciatura · 4 anos',
    estuda:'Sociologia, Antropologia, Ciência Política, metodologia de pesquisa social, movimentos sociais, teoria social clássica e contemporânea.',
    atua:'ONGs, institutos de pesquisa, jornalismo, setor público, organismos internacionais, docência universitária.',
    perfil:'Engajado socialmente, curioso sobre as estruturas da sociedade, gosta de trabalho coletivo e análise crítica da realidade.',
    pratica:'Realiza pesquisas sociais, analisa políticas públicas, atua em projetos comunitários, produz diagnósticos sociais.',
    curso:'4 anos · Bacharelado e/ou Licenciatura · Permite pesquisa acadêmica e docência no Ensino Médio.' },
  { id:'cooperativismo', nome:'Cooperativismo', emoji:'🤝', subtitulo:'Bacharelado · 4 anos',
    estuda:'Gestão de cooperativas, economia solidária, legislação cooperativista, empreendedorismo social, finanças solidárias.',
    atua:'Cooperativas agrícolas, de crédito, habitacionais e de saúde, ONGs, setor público, movimentos sociais.',
    perfil:'Colaborativo, acredita na força do coletivo, interesse em economia alternativa, engajado com comunidades.',
    pratica:'Organiza e gerencia cooperativas, assessora associações comunitárias, desenvolve projetos de economia solidária.',
    curso:'4 anos · Bacharelado · Voltado para gestão coletiva e desenvolvimento comunitário sustentável.' },
  { id:'direito', nome:'Direito', emoji:'⚖️', subtitulo:'Bacharelado · 5 anos',
    estuda:'Direito civil, penal, constitucional, trabalhista, processual, internacional, filosofia do direito e ética jurídica.',
    atua:'Advocacia, Ministério Público, magistratura, Defensoria Pública, setor público, compliance empresarial.',
    perfil:'Argumentativo, senso de justiça apurado, gosta de leitura e debate, organizado, raciocínio lógico aguçado.',
    pratica:'Defende clientes em processos judiciais, elabora contratos, assessora juridicamente empresas e pessoas.',
    curso:'5 anos · Bacharelado · Exige aprovação no Exame da OAB para exercer a advocacia.' },
  { id:'genero_diversidade', nome:'Est. Gênero e Diversidade', emoji:'🌈', subtitulo:'Bacharelado · 4 anos',
    estuda:'Teoria feminista, relações de gênero, diversidade sexual, políticas de inclusão, direitos humanos, história dos movimentos sociais.',
    atua:'ONGs, movimentos sociais, setor público, pesquisa acadêmica, empresas com programas de diversidade e inclusão.',
    perfil:'Engajado em causas sociais, empático, crítico das desigualdades, comprometido com direitos humanos e inclusão.',
    pratica:'Elabora políticas de diversidade, atua em projetos de inclusão, realiza pesquisas sobre desigualdade.',
    curso:'4 anos · Bacharelado · Curso interdisciplinar que articula ciências sociais, direito, história e filosofia.' },
  { id:'filosofia', nome:'Filosofia', emoji:'🤔', subtitulo:'Bacharelado/Licenciatura · 4 anos',
    estuda:'Ética, lógica, metafísica, filosofia política, epistemologia, estética, história da filosofia ocidental e oriental.',
    atua:'Docência básica e universitária, pesquisa acadêmica, jornalismo cultural, consultoria ética, gestão pública.',
    perfil:'Reflexivo, questiona tudo, gosta de debate profundo, leitor voraz, tolerante à ambiguidade e à complexidade.',
    pratica:'Leciona filosofia, desenvolve pesquisa acadêmica, assessora em ética organizacional, escreve textos filosóficos.',
    curso:'4 anos · Bacharelado e/ou Licenciatura · Uma das formações mais antigas das humanidades.' },
  { id:'geografia', nome:'Geografia', emoji:'🌐', subtitulo:'Bacharelado/Licenciatura · 4 anos',
    estuda:'Cartografia, geopolítica, geografia física e humana, geoprocessamento, planejamento urbano e regional, climatologia.',
    atua:'Educação básica, planejamento territorial, IBGE, empresas de geoprocessamento, prefeituras, meio ambiente.',
    perfil:'Curioso sobre o espaço e o território, gosta de mapas, viagens e análise de paisagens, raciocínio espacial.',
    pratica:'Elabora mapas e diagnósticos territoriais, analisa dados geoespaciais, planeja ocupação urbana.',
    curso:'4 anos · Bacharelado e/ou Licenciatura · Trabalha com tecnologias como SIG (Sistemas de Informação Geográfica).' },
  { id:'historia', nome:'História', emoji:'📜', subtitulo:'Bacharelado/Licenciatura · 4 anos',
    estuda:'História do Brasil e do mundo, historiografia, história oral, patrimônio cultural, arquivos históricos, memória coletiva.',
    atua:'Educação, museus, arquivos públicos, pesquisa acadêmica, jornalismo cultural, patrimônio histórico, IPHAN.',
    perfil:'Apaixonado pelo passado, leitor de biografias, curioso sobre culturas e civilizações, senso crítico apurado.',
    pratica:'Pesquisa e interpreta documentos históricos, preserva patrimônio, leciona, produz conteúdo cultural.',
    curso:'4 anos · Bacharelado e/ou Licenciatura · Desenvolve habilidade de pesquisa, análise e escrita histórica.' },
  { id:'letras', nome:'Letras', emoji:'📖', subtitulo:'Licenciatura · 4 anos',
    estuda:'Literatura brasileira e estrangeira, linguística, gramática, teoria literária, línguas clássicas e modernas, redação.',
    atua:'Docência, editoras, agências de comunicação, revisão de textos, tradução, produção de conteúdo digital.',
    perfil:'Amante da literatura, atento à linguagem, gosta de escrever e ler, aprecia múltiplos idiomas e culturas.',
    pratica:'Leciona língua e literatura, revisa e edita textos, traduz obras, produz conteúdo editorial e cultural.',
    curso:'4 anos · Licenciatura e/ou Bacharelado · Pode ter ênfase em língua portuguesa, estrangeira ou literatura.' },
  { id:'libras', nome:'Libras', emoji:'🤟', subtitulo:'Licenciatura · 4 anos',
    estuda:'Língua Brasileira de Sinais, cultura e identidade surda, educação inclusiva, interpretação, linguística das línguas de sinais.',
    atua:'Educação inclusiva, interpretação em eventos e tribunais, saúde, mídia, setor público, empresas.',
    perfil:'Comunicativo, empático com a comunidade surda, comprometido com a inclusão e a acessibilidade.',
    pratica:'Interpreta em eventos, salas de aula e serviços públicos, leciona Libras, desenvolve materiais de inclusão.',
    curso:'4 anos · Licenciatura · Única graduação específica em Libras no Brasil · Alta demanda no mercado.' },
  { id:'linguistica', nome:'Linguística', emoji:'🗣️', subtitulo:'Bacharelado/Licenciatura · 4 anos',
    estuda:'Fonologia, morfologia, sintaxe, semântica, pragmática, sociolinguística, psicolinguística, aquisição de linguagem.',
    atua:'Pesquisa acadêmica, ensino de idiomas, tecnologias de linguagem (IA, reconhecimento de voz), tradução e editoração.',
    perfil:'Fascinado pelo funcionamento das línguas, analítico, multilíngue ou poliglota, gosta de pesquisa.',
    pratica:'Pesquisa o funcionamento das línguas, desenvolve tecnologias de linguagem, assessora ensino de idiomas.',
    curso:'4 anos · Bacharelado e/ou Licenciatura · Base científica para compreender qualquer língua humana.' },
  { id:'museologia', nome:'Museologia', emoji:'🏛️', subtitulo:'Bacharelado · 4 anos',
    estuda:'Gestão de acervos, curadoria, conservação e restauração de patrimônio, educação museal, expografia, museografia.',
    atua:'Museus, galerias, arquivos, bibliotecas, IPHAN, fundações culturais, ministério da cultura.',
    perfil:'Apreciador de arte e história, organizado, comprometido com a preservação da memória e do patrimônio cultural.',
    pratica:'Gerencia coleções e acervos, cria exposições, conserva peças históricas, desenvolve programas educativos.',
    curso:'4 anos · Bacharelado · Registro no Cofem · Trabalha em museus, galerias e instituições culturais.' },
  { id:'pedagogia', nome:'Pedagogia', emoji:'🍎', subtitulo:'Licenciatura · 4 anos',
    estuda:'Didática, psicologia da educação, gestão escolar, educação infantil, alfabetização, currículo, educação especial.',
    atua:'Escolas, creches, gestão educacional, empresas (RH e T&D), políticas públicas de educação, ONGs.',
    perfil:'Vocação para ensinar, paciente, criativo, gosta de crianças e do processo de aprendizagem, comunicativo.',
    pratica:'Planeja e executa aulas, coordena projetos pedagógicos, orienta aprendizagem, gerencia escolas e creches.',
    curso:'4 anos · Licenciatura · Habilita para docência na Educação Infantil e nos Anos Iniciais do Ensino Fundamental.' },
  { id:'psicopedagogia', nome:'Psicopedagogia', emoji:'🧩', subtitulo:'Licenciatura/Pós · 4 anos',
    estuda:'Dificuldades de aprendizagem, avaliação psicopedagógica, neurociência aplicada, desenvolvimento cognitivo, intervenção pedagógica.',
    atua:'Clínicas, escolas, hospitais, atendimento individual a crianças e adolescentes, equipes multidisciplinares.',
    perfil:'Paciente, empático, observador, interesse simultâneo em psicologia e educação, gosta de trabalho com crianças.',
    pratica:'Avalia e intervém em dificuldades de aprendizagem, orienta famílias e professores, desenvolve planos individualizados.',
    curso:'4 anos · Licenciatura ou Pós-graduação · Trabalha na interface entre psicologia e educação.' },
  { id:'relacoes_internacionais', nome:'Relações Internacionais', emoji:'🌏', subtitulo:'Bacharelado · 4 anos',
    estuda:'Política internacional, direito internacional, economia global, diplomacia, geopolítica, negociação e organismos multilaterais.',
    atua:'Ministério das Relações Exteriores, organismos internacionais (ONU, FMI), empresas multinacionais, ONGs globais.',
    perfil:'Curioso sobre geopolítica, fala outros idiomas, conectado ao mundo, ambicioso, visão global e estratégica.',
    pratica:'Negocia acordos internacionais, analisa cenários geopolíticos, assessora empresas em expansão global.',
    curso:'4 anos · Bacharelado · Domínio de idiomas é essencial · Alta competitividade no mercado.' },
  { id:'servico_social', nome:'Serviço Social', emoji:'🏘️', subtitulo:'Bacharelado · 4 anos',
    estuda:'Política social, direitos humanos, trabalho com famílias e comunidades, legislação social, exclusão social, assistência social.',
    atua:'CRAS, CREAS, hospitais, empresas (RH), ONGs, escolas, sistema judiciário, sistema penitenciário.',
    perfil:'Empático, comprometido com a justiça social, gosta de trabalho direto com pessoas, senso humanitário forte.',
    pratica:'Acompanha famílias em vulnerabilidade, acessa políticas públicas para usuários, atua em proteção social.',
    curso:'4 anos · Bacharelado · Registro no CRESS obrigatório · Forte código de ética profissional.' },
  { id:'teologia', nome:'Teologia', emoji:'✝️', subtitulo:'Bacharelado · 4 anos',
    estuda:'Sagradas escrituras, história das religiões, filosofia da religião, ética teológica, pastoral, teologia sistemática.',
    atua:'Igrejas, instituições religiosas, ensino, capelania hospitalar e penitenciária, assessoria espiritual, ONGs.',
    perfil:'Espiritualizado, reflexivo, comprometido com valores éticos e comunitários, vocação para o serviço ao próximo.',
    pratica:'Lidera comunidades religiosas, realiza aconselhamento pastoral, leciona, desenvolve projetos sociais.',
    curso:'4 anos · Bacharelado · Reconhecido pelo MEC · Pode ter ênfase em diferentes tradições religiosas.' },
  { id:'tradutor', nome:'Tradutor e Intérprete', emoji:'🎧', subtitulo:'Bacharelado · 4 anos',
    estuda:'Tradução literária e técnica, interpretação simultânea e consecutiva, terminologia, linguística aplicada, línguas estrangeiras.',
    atua:'Agências de tradução, organismos internacionais, eventos corporativos, editoras, empresas globais, freelancer.',
    perfil:'Poliglota ou com forte aptidão para idiomas, atento a detalhes, boa memória, precisão e agilidade mental.',
    pratica:'Traduz documentos, livros e contratos, interpreta em conferências e eventos internacionais.',
    curso:'4 anos · Bacharelado · Habilita para tradução e interpretação · Pode atuar como tradutor juramentado.' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Answer { chosen: string; correct: boolean; star: number }
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

export default function FaceAFace({ initialState, onStateChange, onComplete }: Props) {
  const [screen, setScreen] = useState<'title' | 'quiz' | 'result'>('title')
  const [order, setOrder] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [chosen, setChosen] = useState<string | null>(null)
  const [showReveal, setShowReveal] = useState(false)
  const [extraClue, setExtraClue] = useState(0)   // 0=perfil, 1=+estuda, 2=+atua
  const [starVal, setStarVal] = useState(0)
  const [resultRanking, setResultRanking] = useState<RankItem[]>([])
  const [barsReady, setBarsReady] = useState(false)

  // ── Restore ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!initialState?.order) return
    const savedOrder = initialState.order as string[]
    const savedAnswers = (initialState.answers ?? {}) as Record<string, Answer>
    const savedIdx = (initialState.currentIdx as number) ?? Object.keys(savedAnswers).length
    setOrder(savedOrder)
    setAnswers(savedAnswers)
    setCurrentIdx(savedIdx)
    if (savedIdx >= PERSONAGENS.length) {
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
    const o = shuffle(PERSONAGENS.map(p => p.id))
    setOrder(o); setCurrentIdx(0); setAnswers({})
    setChosen(null); setShowReveal(false); setExtraClue(0); setStarVal(0)
    setScreen('quiz')
    save(o, {}, 0)
  }

  // ── Current question ──────────────────────────────────────────────────────

  const personagem = order.length > 0 ? PERSONAGENS.find(p => p.id === order[currentIdx]) ?? null : null

  const quizOptions = useMemo(() => {
    if (!personagem) return []
    const others = shuffle(PERSONAGENS.filter(p => p.id !== personagem.id)).slice(0, 3)
    return shuffle([personagem, ...others])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, personagem?.id])

  // ── Answer ────────────────────────────────────────────────────────────────

  function pick(id: string) {
    if (chosen !== null) return
    setChosen(id)
    setShowReveal(true)
  }

  // ── Build ranking ─────────────────────────────────────────────────────────

  function buildRanking(ord: string[], ans: Record<string, Answer>) {
    const ranked = ord
      .map(id => {
        const p = PERSONAGENS.find(x => x.id === id)!
        return { id, nome: p.nome, emoji: p.emoji, star: ans[id]?.star ?? 0 }
      })
      .sort((a, b) => b.star - a.star)
    setResultRanking(ranked)
  }

  // ── Confirm ───────────────────────────────────────────────────────────────

  function confirm() {
    if (!personagem || chosen === null || starVal === 0) return
    const newAnswers: Record<string, Answer> = {
      ...answers,
      [personagem.id]: { chosen, correct: chosen === personagem.id, star: starVal },
    }
    const nextIdx = currentIdx + 1
    setAnswers(newAnswers)
    save(order, newAnswers, nextIdx)

    if (nextIdx >= PERSONAGENS.length) {
      buildRanking(order, newAnswers)
      setScreen('result')
      setTimeout(() => setBarsReady(true), 60)
      const correctCount = Object.values(newAnswers).filter(a => a.correct).length
      const ratings: Record<string, number> = {}
      Object.entries(newAnswers).forEach(([id, a]) => { ratings[id] = a.star })
      onComplete(
        { total: PERSONAGENS.length, correct: correctCount, ratings },
        { answers: newAnswers, order },
      )
    } else {
      setCurrentIdx(nextIdx)
      setChosen(null); setShowReveal(false); setExtraClue(0); setStarVal(0)
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const correctCount  = Object.values(answers).filter(a => a.correct).length
  const totalAnswered = Object.keys(answers).length
  const progress      = PERSONAGENS.length > 0 ? (totalAnswered / PERSONAGENS.length) * 100 : 0

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Title
  // ─────────────────────────────────────────────────────────────────────────

  if (screen === 'title') return (
    <div className={styles.root}>
      <div className={styles.heroSection}>
        <div className={styles.heroIcon}>🕵️</div>
        <h1 className={styles.heroTitle}>Face a Face</h1>
        <p className={styles.heroSub}>Ciências Humanas e Sociais</p>
        <div className={styles.introBox}>
          <p>Você vai conhecer <strong>20 perfis de profissionais</strong> das Ciências Humanas e Sociais.</p>
          <br />
          <p>Para cada perfil, descubra <strong>qual curso corresponde</strong> à descrição. Use as pistas de perfil, área de estudo e campo de atuação.</p>
        </div>
        <button className={styles.btnPrimary} onClick={startGame}>COMEÇAR</button>
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
            <div className={styles.resultTitle}>Desafio Concluído!</div>
            <div className={styles.resultSub}>{correctCount} acertos de {PERSONAGENS.length} · Todos os perfis avaliados</div>
          </div>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,.4)', marginBottom:'12px', paddingLeft:'4px' }}>
            CURSOS QUE MAIS LHE INTERESSARAM
          </p>
          {resultRanking.filter(r => r.star > 0).slice(0, 10).map((r, i) => (
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

  if (!personagem) return null

  return (
    <div className={styles.root}>
      {/* HUD */}
      <div className={styles.hud}>
        <div>
          <div className={styles.hudTitle}>FACE A FACE</div>
          <div className={styles.hudSub}>Ciências Humanas e Sociais</div>
        </div>
        <div className={styles.hudStats}>
          <div className={styles.stat}>
            <div className={styles.statVal}>{currentIdx + 1}/{PERSONAGENS.length}</div>
            <div className={styles.statLbl}>PERFIL</div>
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
        <span className={styles.progressLabel}>{totalAnswered}/{PERSONAGENS.length}</span>
      </div>

      <div className={styles.quizWrap}>
        {/* Profile card */}
        <div className={styles.personaCard}>
          <div className={styles.personaEmoji}>{personagem.emoji}</div>
          <div className={styles.personaQuestion}>Qual é este profissional?</div>

          <div className={styles.clueBox}>
            <div className={styles.clueLabel}>Perfil</div>
            {personagem.perfil}
          </div>

          {extraClue >= 1 && (
            <div className={styles.clueBox}>
              <div className={styles.clueLabel}>O que estuda</div>
              {personagem.estuda}
            </div>
          )}

          {extraClue >= 2 && (
            <div className={styles.clueBox}>
              <div className={styles.clueLabel}>Onde atua</div>
              {personagem.atua}
            </div>
          )}

          {!showReveal && extraClue < 2 && (
            <button className={styles.btnExtra} onClick={() => setExtraClue(e => e + 1)}>
              + Ver mais pistas
            </button>
          )}
        </div>

        {/* Options */}
        <div className={styles.optionsGrid}>
          {quizOptions.map(opt => {
            const isCorrectOpt = opt.id === personagem.id
            const isChosenOpt  = opt.id === chosen
            const cls = [
              styles.optionBtn,
              showReveal && isCorrectOpt ? styles.correct : '',
              showReveal && isChosenOpt && !isCorrectOpt ? styles.wrong : '',
            ].filter(Boolean).join(' ')
            return (
              <button key={opt.id} className={cls} onClick={() => pick(opt.id)} disabled={chosen !== null}>
                <div className={styles.optionEmoji}>{opt.emoji}</div>
                <div className={styles.optionNome}>{opt.nome}</div>
              </button>
            )
          })}
        </div>

        {/* Reveal */}
        {showReveal && (
          <div className={styles.revealPanel}>
            {chosen === personagem.id
              ? <div className={styles.revealCorrect}>Correto! Parabéns!</div>
              : <div className={styles.revealWrong}>Quase! Era {personagem.emoji} {personagem.nome}</div>
            }
            <div className={styles.revealLabel}>O que pratica</div>
            <div className={styles.revealInfo}>{personagem.pratica}</div>
            <div className={styles.revealLabel}>Formação</div>
            <div className={styles.revealInfo}>{personagem.curso}</div>
          </div>
        )}

        {/* Star rating */}
        {showReveal && (
          <div className={styles.ratingSection}>
            <div className={styles.ratingLabel}>Quanto te interessa {personagem.nome}?</div>
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
            {currentIdx < PERSONAGENS.length - 1 ? 'PRÓXIMO' : 'VER RESULTADO'}
          </button>
        )}
      </div>
    </div>
  )
}

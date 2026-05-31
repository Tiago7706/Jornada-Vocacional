'use client'

import { useState, useCallback, useEffect } from 'react'
import styles from './QuemFalaIsso.module.css'

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

interface Curso {
  id: string; nome: string; emoji: string; subtitulo: string
  frase: string; alternativas: string[]; correta: number
  estuda: string; pratica: string; perfil: string; atua: string; curso: string
}

const CURSOS: Curso[] = [
  { id:'arquivologia', nome:'Arquivologia', emoji:'🗂️', subtitulo:'Bacharelado · 4 anos',
    frase:'Esse documento não tem protocolo de entrada. Preciso registrar, classificar e garantir que seja localizado daqui a 20 anos.',
    alternativas:['Arquivologia','Gestão da Informação','Biblioteconomia','Secretariado Executivo'], correta:0,
    estuda:'Gestão documental, arquivística, classificação e descrição de documentos, preservação digital, legislação arquivística.',
    pratica:'Organiza e preserva documentos físicos e digitais, cria sistemas de classificação, garante acesso e sigilo de informações.',
    perfil:'Organizado, detalhista, gosta de ordem e precisão, interesse em história e memória institucional.',
    atua:'Arquivos públicos e privados, tribunais, hospitais, museus, empresas, prefeituras, governo federal.',
    curso:'4 anos · Bacharelado · Registro no Conarq · Alta demanda no setor público.' },
  { id:'biblioteconomia', nome:'Biblioteconomia', emoji:'📚', subtitulo:'Bacharelado/Licenciatura · 4 anos',
    frase:'O acervo está desatualizado. Vou fazer uma curadoria, catalogar as novas aquisições e organizar a seção por assunto.',
    alternativas:['Arquivologia','Biblioteconomia','Produção Editorial','Gestão da Informação'], correta:1,
    estuda:'Catalogação, indexação, gestão de acervos, serviços de referência, tecnologia da informação em bibliotecas, mediação da leitura.',
    pratica:'Organiza e cataloga acervos, orienta pesquisas, desenvolve programas de incentivo à leitura, gerencia bibliotecas digitais.',
    perfil:'Amante da leitura, organizado, gosta de ajudar pessoas a encontrar informação, interesse em cultura e educação.',
    atua:'Bibliotecas públicas, escolares e universitárias, empresas, órgãos públicos, centros de documentação.',
    curso:'4 anos · Bacharelado e/ou Licenciatura · Registro no CRB obrigatório · Carreira sólida no setor público.' },
  { id:'cinema', nome:'Cinema e Audiovisual', emoji:'🎬', subtitulo:'Bacharelado · 4 anos',
    frase:'A luz está dura demais nessa cena. Vamos difusar, ajustar o enquadramento e refazer o take.',
    alternativas:['Rádio, TV e Internet','Estudos de Mídia','Cinema e Audiovisual','Comunicação em Mídias Digitais'], correta:2,
    estuda:'Direção, roteiro, fotografia cinematográfica, montagem, som, produção e história do cinema.',
    pratica:'Dirige, roteiriza, fotografa e edita filmes, documentários, videoclipes e produções audiovisuais.',
    perfil:'Criativo, visual, conta histórias através de imagens, apaixonado por cinema e linguagem audiovisual.',
    atua:'Produtoras de cinema e TV, plataformas de streaming, publicidade, videomaking independente.',
    curso:'4 anos · Bacharelado · Combina teoria e prática intensa de produção audiovisual.' },
  { id:'midias_digitais', nome:'Comunicação em Mídias Digitais', emoji:'📱', subtitulo:'Bacharelado · 4 anos',
    frase:'O engajamento caiu essa semana. Preciso revisar o calendário editorial e testar novos formatos de conteúdo.',
    alternativas:['Jornalismo','Publicidade e Propaganda','Relações Públicas','Comunicação em Mídias Digitais'], correta:3,
    estuda:'Marketing digital, produção de conteúdo, métricas e análise de dados, SEO, redes sociais, UX e design digital.',
    pratica:'Gerencia redes sociais, cria estratégias de conteúdo, analisa métricas, desenvolve campanhas digitais.',
    perfil:'Antenado nas tendências digitais, criativo, analítico, gosta de tecnologia e comunicação simultânea.',
    atua:'Agências digitais, empresas de tecnologia, e-commerce, startups, assessorias de comunicação.',
    curso:'4 anos · Bacharelado · Curso voltado para o ecossistema digital e suas constantes transformações.' },
  { id:'com_organizacional', nome:'Comunicação Organizacional', emoji:'🏢', subtitulo:'Bacharelado · 4 anos',
    frase:'A empresa está passando por uma crise de imagem. Precisamos alinhar a comunicação interna antes de falar com a imprensa.',
    alternativas:['Relações Públicas','Jornalismo','Comunicação Organizacional','Publicidade e Propaganda'], correta:2,
    estuda:'Comunicação interna e externa, gestão de crise, identidade corporativa, endomarketing, relações com stakeholders.',
    pratica:'Desenvolve estratégias de comunicação para empresas, gerencia crises de imagem, produz conteúdo institucional.',
    perfil:'Estratégico, bom comunicador, entende de cultura organizacional, habilidade de mediação.',
    atua:'Empresas privadas, setor público, consultorias, assessorias de comunicação corporativa.',
    curso:'4 anos · Bacharelado · Foco na comunicação dentro e fora das organizações.' },
  { id:'educomunicacao', nome:'Educomunicação', emoji:'📡', subtitulo:'Bacharelado/Licenciatura · 4 anos',
    frase:'Vamos usar o podcast como ferramenta pedagógica. Os alunos vão produzir, editar e apresentar o conteúdo eles mesmos.',
    alternativas:['Rádio, TV e Internet','Educomunicação','Comunicação em Mídias Digitais','Estudos de Mídia'], correta:1,
    estuda:'Comunicação e educação integradas, mídia-educação, produção midiática com fins pedagógicos, leitura crítica da mídia.',
    pratica:'Usa linguagens midiáticas em contextos educativos, desenvolve projetos de rádio escolar, jornal e podcast pedagógico.',
    perfil:'Educador e comunicador ao mesmo tempo, criativo, engajado com transformação social pela comunicação.',
    atua:'Escolas, ONGs, prefeituras, projetos sociais, produtoras educativas, secretarias de educação.',
    curso:'4 anos · Bacharelado e/ou Licenciatura · Único no mundo com esse nome, criado no Brasil.' },
  { id:'estudos_midia', nome:'Estudos de Mídia', emoji:'🔍', subtitulo:'Bacharelado · 4 anos',
    frase:'Esse reality show reproduz estereótipos de gênero de forma sistemática. Preciso analisar os padrões narrativos das últimas temporadas.',
    alternativas:['Jornalismo','Comunicação Organizacional','Educomunicação','Estudos de Mídia'], correta:3,
    estuda:'Teoria da comunicação, análise de mídia, sociologia da comunicação, estudos culturais, crítica midiática.',
    pratica:'Pesquisa e analisa produtos midiáticos, publica estudos, atua em regulação de mídia e políticas de comunicação.',
    perfil:'Crítico, analítico, interessado em como a mídia influencia a sociedade, gosta de pesquisa acadêmica.',
    atua:'Universidades, institutos de pesquisa, órgãos reguladores de mídia, jornalismo crítico, consultorias.',
    curso:'4 anos · Bacharelado · Abordagem teórica e crítica da comunicação e seus efeitos sociais.' },
  { id:'gestao_informacao', nome:'Gestão da Informação', emoji:'💾', subtitulo:'Bacharelado · 4 anos',
    frase:'Os dados estão desorganizados em três sistemas diferentes. Vou mapear os fluxos e propor uma arquitetura de informação unificada.',
    alternativas:['Arquivologia','Gestão da Informação','Comunicação em Mídias Digitais','Secretariado Executivo'], correta:1,
    estuda:'Arquitetura da informação, sistemas de informação, inteligência competitiva, banco de dados, gestão do conhecimento.',
    pratica:'Organiza fluxos de informação em empresas, implementa sistemas, produz relatórios de inteligência estratégica.',
    perfil:'Analítico, gosta de tecnologia e organização, visão estratégica, interesse em dados e processos.',
    atua:'Empresas privadas, setor público, consultorias de TI, hospitais, instituições financeiras.',
    curso:'4 anos · Bacharelado · Interface entre administração, tecnologia e ciência da informação.' },
  { id:'jornalismo', nome:'Jornalismo', emoji:'📰', subtitulo:'Bacharelado · 4 anos',
    frase:'A fonte confirmou off the record. Preciso de mais dois ângulos antes de fechar a matéria para o fechamento de amanhã.',
    alternativas:['Relações Públicas','Estudos de Mídia','Comunicação Organizacional','Jornalismo'], correta:3,
    estuda:'Técnica de reportagem, redação jornalística, ética, fotojornalismo, jornalismo digital, radiojornalismo e telejornalismo.',
    pratica:'Apura, redige e publica notícias, realiza entrevistas, investiga fatos de interesse público, produz reportagens.',
    perfil:'Curioso, comunicativo, comprometido com a verdade, senso crítico apurado, gosta de estar onde as coisas acontecem.',
    atua:'Jornais, revistas, portais de notícias, emissoras de rádio e TV, assessorias de imprensa, agências.',
    curso:'4 anos · Bacharelado · Registro no MTb para exercício da profissão · Mercado em transformação digital.' },
  { id:'producao_cultural', nome:'Produção Cultural', emoji:'🎭', subtitulo:'Bacharelado · 4 anos',
    frase:'O edital de patrocínio fecha sexta. Preciso finalizar o projeto, o orçamento e a carta de apresentação ainda hoje.',
    alternativas:['Relações Públicas','Comunicação Organizacional','Produção Cultural','Secretariado Executivo'], correta:2,
    estuda:'Gestão cultural, captação de recursos, políticas culturais, produção de eventos, legislação cultural (Lei Rouanet).',
    pratica:'Produz espetáculos, exposições e festivais, elabora projetos culturais, capta recursos via leis de incentivo.',
    perfil:'Articulado, criativo e gestor ao mesmo tempo, apaixonado pela cultura, habilidade de negociação.',
    atua:'Teatros, museus, festivais, produtoras culturais, secretarias de cultura, ONGs culturais.',
    curso:'4 anos · Bacharelado · Combinação única de gestão, cultura e captação de recursos.' },
  { id:'producao_editorial', nome:'Produção Editorial', emoji:'📖', subtitulo:'Bacharelado · 4 anos',
    frase:'O original chegou com 320 páginas. Vou fazer a revisão, ajustar o projeto gráfico e alinhar com a gráfica o prazo de impressão.',
    alternativas:['Biblioteconomia','Arquivologia','Jornalismo','Produção Editorial'], correta:3,
    estuda:'Editoração, revisão de textos, projeto gráfico editorial, mercado editorial, direito autoral, produção de livros e revistas.',
    pratica:'Cuida de toda a cadeia de produção de um livro — da revisão ao design, da gráfica ao lançamento.',
    perfil:'Amante da leitura e da escrita, atento a detalhes, gosto por design e linguagem visual, preciso.',
    atua:'Editoras, gráficas, agências de conteúdo, plataformas digitais de publicação, jornais e revistas.',
    curso:'4 anos · Bacharelado · Abrange produção impressa e digital, um mercado em forte transformação.' },
  { id:'publicidade', nome:'Publicidade e Propaganda', emoji:'📣', subtitulo:'Bacharelado · 4 anos',
    frase:'O cliente aprovou o conceito. Agora é desenvolver as peças, adaptar para cada mídia e apresentar o plano de veiculação.',
    alternativas:['Comunicação Organizacional','Relações Públicas','Publicidade e Propaganda','Comunicação em Mídias Digitais'], correta:2,
    estuda:'Criação publicitária, planejamento de mídia, comportamento do consumidor, branding, marketing, design de comunicação.',
    pratica:'Cria campanhas publicitárias, desenvolve peças criativas, planeja e executa estratégias de mídia para marcas.',
    perfil:'Criativo, persuasivo, gosta de resolver problemas com ideias, antenado em cultura pop e tendências.',
    atua:'Agências de publicidade, departamentos de marketing, produtoras, veículos de comunicação, startups.',
    curso:'4 anos · Bacharelado · Um dos cursos de comunicação mais disputados do país.' },
  { id:'radio_tv', nome:'Rádio, TV e Internet', emoji:'📺', subtitulo:'Bacharelado · 4 anos',
    frase:'O ao vivo começa em 10 minutos. Confirma o link do repórter externo e testa o áudio do estúdio B.',
    alternativas:['Cinema e Audiovisual','Jornalismo','Rádio, TV e Internet','Comunicação em Mídias Digitais'], correta:2,
    estuda:'Produção para rádio, TV e plataformas digitais, locução, direção de programas, transmissão ao vivo, podcasting.',
    pratica:'Produz e apresenta programas de rádio, TV e conteúdo online, coordena transmissões ao vivo, edita áudio e vídeo.',
    perfil:'Comunicativo, dinâmico, boa voz e presença, gosta de estar na frente ou atrás das câmeras.',
    atua:'Emissoras de rádio e TV, plataformas de streaming, produtoras de podcast, canais do YouTube.',
    curso:'4 anos · Bacharelado · Formação prática intensa em estúdios de rádio e TV.' },
  { id:'relacoes_publicas', nome:'Relações Públicas', emoji:'🤝', subtitulo:'Bacharelado · 4 anos',
    frase:'O evento de lançamento precisa de uma estratégia de presença. Quem são os influenciadores, assessores e parceiros que devem estar lá?',
    alternativas:['Publicidade e Propaganda','Produção Cultural','Comunicação Organizacional','Relações Públicas'], correta:3,
    estuda:'Gestão de relacionamentos, eventos, assessoria de imprensa, comunicação pública, protocolo e cerimonial.',
    pratica:'Gerencia a imagem pública de pessoas e organizações, organiza eventos, articula com a imprensa e stakeholders.',
    perfil:'Articulado, networking nato, elegante, habilidade de negociação e gestão de pessoas.',
    atua:'Agências de RP, assessorias de imprensa, empresas, governo, organizações do terceiro setor.',
    curso:'4 anos · Bacharelado · Registro no Conferp obrigatório.' },
  { id:'secretariado', nome:'Secretariado Executivo', emoji:'💼', subtitulo:'Bacharelado · 4 anos',
    frase:'A agenda do diretor está sobrecarregada. Vou reorganizar as reuniões, priorizar os compromissos estratégicos e preparar o relatório da semana.',
    alternativas:['Comunicação Organizacional','Gestão da Informação','Relações Públicas','Secretariado Executivo'], correta:3,
    estuda:'Gestão administrativa, redação empresarial, organização de eventos, idiomas, protocolos, assessoria executiva.',
    pratica:'Assessora executivos e diretores, organiza agendas e viagens, gerencia documentos, coordena reuniões e eventos.',
    perfil:'Organizado, discreto, proativo, domínio de idiomas, habilidade interpessoal e visão estratégica.',
    atua:'Empresas multinacionais, escritórios executivos, setor público, consultorias, organizações internacionais.',
    curso:'4 anos · Bacharelado · Registro no Fenassec obrigatório · Domínio de inglês e espanhol é essencial.' },
]

// Map: nome → emoji (for option display)
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

export default function QuemFalaIsso({ initialState, onStateChange, onComplete }: Props) {
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
        <div className={styles.heroIcon}>💬</div>
        <h1 className={styles.heroTitle}>Quem Fala Isso?</h1>
        <p className={styles.heroSub}>Comunicação e Informação</p>
        <div className={styles.introBox}>
          <p>Você vai ler <strong>15 frases ditas por profissionais</strong> da área de Comunicação e Informação.</p>
          <br />
          <p>Para cada frase, <strong>identifique qual curso</strong> essa pessoa teria feito. Depois avalie quanto cada área te interessa!</p>
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
            <div className={styles.resultTitle}>Comunicação Decifrada!</div>
            <div className={styles.resultSub}>{correctCount} acertos de {CURSOS.length} · {totalAnswered} cursos avaliados</div>
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
          <div className={styles.hudTitle}>QUEM FALA ISSO?</div>
          <div className={styles.hudSub}>Comunicação e Informação</div>
        </div>
        <div className={styles.hudStats}>
          <div className={styles.stat}>
            <div className={styles.statVal}>{currentIdx + 1}/{CURSOS.length}</div>
            <div className={styles.statLbl}>FRASE</div>
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
        {/* Quote card */}
        <div className={styles.quoteCard}>
          <span className={styles.quoteEmoji}>💬</span>
          <div className={styles.quoteLabel}>Quem disse isso?</div>
          <div className={styles.quoteText}>{curso.frase}</div>
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
              ? <div className={styles.revealCorrect}>Correto! Você conhece essa área!</div>
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
            {currentIdx < CURSOS.length - 1 ? 'PRÓXIMA FRASE' : 'VER RESULTADO'}
          </button>
        )}
      </div>
    </div>
  )
}

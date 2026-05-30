'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './JogoDaMemoria.module.css'

/* ── Types ──────────────────────────────────────────────────────────────── */
interface Carta {
  id: string
  nome: string
  area: string
  aprender: string
  pratica: string
  perfil: string
  trabalhar: string
  color: string
}

interface DeckCard {
  uid: string   // unique: 'adm_0' | 'adm_1'
  id: string    // course id (pairs share same id)
}

type Screen = 'title' | 'game' | 'result'

interface GameProps {
  patientId: string
  experienceId: number
  initialState?: Record<string, unknown>
  onStateChange: (state: Record<string, unknown>) => void
  onComplete: (scores: Record<string, unknown>, responses: Record<string, unknown>) => void
}

/* ── Course data ────────────────────────────────────────────────────────── */
const CARTAS: Carta[] = [
  {
    id: 'adm',
    nome: 'Administração',
    area: 'Negócios',
    aprender: 'Finanças & Marketing · Liderança & Estratégia · Gestão & Problemas',
    pratica: 'Organiza empresas · Decide investimentos · Lidera equipes',
    perfil: 'Gosta de Liderar · Pensa em Negócios · Curte Resolver',
    trabalhar: 'Empresas & Startups · Bancos & RH · Setor Público',
    color: '#1565C0',
  },
  {
    id: 'adm_pub',
    nome: 'Adm. Pública',
    area: 'Setor Público',
    aprender: 'Políticas Públicas · Direito Administrativo · Gestão Fiscal',
    pratica: 'Implementa Programas Sociais · Otimiza Recursos · Lidera Servidores',
    perfil: 'Vontade de Servir · Ética e Integridade · Pensamento Sistêmico',
    trabalhar: 'Prefeituras & Ministérios · Agências Reguladoras · ONGs',
    color: '#4A148C',
  },
  {
    id: 'agro',
    nome: 'Agronegócio',
    area: 'Campo & Tecnologia',
    aprender: 'Gestão de Safra · Sustentabilidade · Economia Agrícola · Bem-Estar Animal',
    pratica: 'Planeja Safras · Otimiza Recursos Hídricos · Lidera Produção',
    perfil: 'Paixão pela Terra · Pensamento Estratégico · Foco Sustentável',
    trabalhar: 'Fazendas e Agroindústrias · Exportadoras · Pesquisa e Biotecnologia',
    color: '#1B5E20',
  },
  {
    id: 'aero',
    nome: 'Ciências Aeronáuticas',
    area: 'Aviação',
    aprender: 'Teoria de Voo · Meteorologia · Motores · Fatores Humanos',
    pratica: 'Planeja Missões · Opera Aeronaves · Lidera Tripulações',
    perfil: 'Paixão pela Aviação · Pensamento Lógico · Foco em Segurança',
    trabalhar: 'Linhas Aéreas · Indústrias Aeroespaciais · Aeroportos',
    color: '#006064',
  },
  {
    id: 'atu',
    nome: 'Ciências Atuariais',
    area: 'Risco & Seguros',
    aprender: 'Matemática Atuarial · Análise de Risco · Econometria · Seguros',
    pratica: 'Avalia Riscos · Precifica Apólices · Desenvolve Previdência',
    perfil: 'Raciocínio Lógico-Matemático · Gosto por Dados · Foco em Detalhes',
    trabalhar: 'Seguradoras · Previdência Complementar · Consultoria',
    color: '#4527A0',
  },
  {
    id: 'cont',
    nome: 'Ciências Contábeis',
    area: 'Finanças',
    aprender: 'Contabilidade Geral · Auditoria · IFRS · Gestão Tributária',
    pratica: 'Elabora Demonstrações · Audita Contas · Otimiza Tributos',
    perfil: 'Raciocínio Analítico · Gosto por Números · Ética e Integridade',
    trabalhar: 'Empresas de Grande Porte · Escritórios de Contabilidade · Setor Público',
    color: '#00695C',
  },
  {
    id: 'eco',
    nome: 'Ciências Econômicas',
    area: 'Economia',
    aprender: 'Macroeconomia · Microeconomia · Econometria · Finanças Internacionais',
    pratica: 'Analisa Indicadores · Prevê Mercados · Estuda Políticas Públicas',
    perfil: 'Pensamento Crítico · Modelagem Matemática · Interesse Global',
    trabalhar: 'Bancos e Fundos · Grandes Corporações · Setor Público · Consultorias',
    color: '#E65100',
  },
  {
    id: 'com_ext',
    nome: 'Comércio Exterior',
    area: 'Negócios Internacionais',
    aprender: 'Comércio Internacional · Logística · Câmbio · Legislação Aduaneira',
    pratica: 'Analisa Contratos · Gerencia Despacho Aduaneiro · Calcula Estratégias',
    perfil: 'Visão Global · Facilidade com Idiomas · Análise Geopolítica',
    trabalhar: 'Exportação/Importação · Logística e Portos · Consultoria Internacional',
    color: '#F57F17',
  },
  {
    id: 'defesa',
    nome: 'Defesa Estratégica',
    area: 'Segurança Internacional',
    aprender: 'Geopolítica · Gestão de Crises · Inteligência Estratégica · Logística de Defesa',
    pratica: 'Analisa Ameaças · Planeja Operações · Negocia Acordos de Cooperação',
    perfil: 'Visão Holística · Pensamento Analítico · Decisão sob Pressão',
    trabalhar: 'Ministério da Defesa · ONU/OTAN · Consultorias de Risco · Indústria Aeroespacial',
    color: '#37474F',
  },
  {
    id: 'gastro',
    nome: 'Gastronomia',
    area: 'Alimentação & Negócios',
    aprender: 'Gestão de Cozinha · Planejamento de Menu · Engenharia de Cardápio · Logística de Alimentos',
    pratica: 'Analisa Tendências · Planeja Operações · Controla Custos',
    perfil: 'Visão de Negócios · Pensamento Analítico · Liderança em Cozinha',
    trabalhar: 'Redes de Restaurantes · Indústria de A&B · Catering de Luxo · Empreendedorismo',
    color: '#B71C1C',
  },
  {
    id: 'hotel',
    nome: 'Hotelaria',
    area: 'Hospitalidade',
    aprender: 'Gestão de Hotéis · Atendimento ao Cliente · Eventos e Gastronomia · Turismo',
    pratica: 'Recebe Hóspedes · Organiza Eventos · Gerencia Restaurantes',
    perfil: 'Gosta de Pessoas · Simpatia e Comunicação · Interesse em Viagens',
    trabalhar: 'Hotéis e Resorts · Cruzeiros · Agências de Turismo · Eventos',
    color: '#880E4F',
  },
  {
    id: 'log',
    nome: 'Logística',
    area: 'Operações & Supply Chain',
    aprender: 'Gestão de Transportes · Planejamento Logístico · Controle de Estoques · Cadeia de Suprimentos',
    pratica: 'Organiza Estoques · Planeja Rotas · Controla Custos e Prazos',
    perfil: 'Gosta de Organizar · É Atento e Focado · Curte Tecnologia',
    trabalhar: 'Transportes · Centros de Distribuição · Portos e Aeroportos · E-commerce',
    color: '#0277BD',
  },
  {
    id: 'mkt',
    nome: 'Marketing',
    area: 'Comunicação & Marcas',
    aprender: 'Gestão de Marca · Comportamento do Consumidor · Marketing Digital · Pesquisa de Mercado',
    pratica: 'Planeja Campanhas · Otimiza ROI · Monitora Tendências',
    perfil: 'Criatividade e Inovação · Pensamento Estratégico · Foco em KPIs',
    trabalhar: 'Agências de Marketing · Startups · Consultoria · Comunicação Corporativa',
    color: '#6A1B9A',
  },
  {
    id: 'seg',
    nome: 'Segurança Pública',
    area: 'Defesa & Ordem',
    aprender: 'Gestão de Forças de Segurança · Criminologia · Direito Penal · Inteligência Policial',
    pratica: 'Gerencia Crises · Coordena Operações · Desenvolve Políticas de Prevenção',
    perfil: 'Raciocínio Ético · Senso de Dever · Decisão em Crises',
    trabalhar: 'Polícias Civil e Federal · Secretarias de Segurança · Consultoria Corporativa',
    color: '#263238',
  },
  {
    id: 'tur',
    nome: 'Turismo',
    area: 'Viagens & Cultura',
    aprender: 'Gestão Hoteleira · Planejamento de Destinos · Marketing Turístico · Economia do Turismo',
    pratica: 'Planeja Roteiros · Gerencia Operações · Organiza Eventos Corporativos',
    perfil: 'Empatia e Relações Interpessoais · Paixão por Culturas · Visão Empreendedora',
    trabalhar: 'Hotéis e Resorts · Agências de Viagem · Secretarias de Turismo · Eventos',
    color: '#00838F',
  },
]

/* ── Helpers ────────────────────────────────────────────────────────────── */
function buildDeck(): DeckCard[] {
  const raw: DeckCard[] = []
  for (const c of CARTAS) {
    raw.push({ uid: `${c.id}_0`, id: c.id })
    raw.push({ uid: `${c.id}_1`, id: c.id })
  }
  // Fisher-Yates shuffle
  for (let i = raw.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [raw[i], raw[j]] = [raw[j], raw[i]]
  }
  return raw
}

function cartaById(id: string): Carta {
  return CARTAS.find(c => c.id === id)!
}

/* ── Component ──────────────────────────────────────────────────────────── */
export default function JogoDaMemoria({
  initialState,
  onStateChange,
  onComplete,
}: GameProps) {
  /* ── Restore or init state ── */
  const savedDeck = initialState?.deck as DeckCard[] | undefined
  const savedMatched = initialState?.matched as string[] | undefined
  const savedRatings = initialState?.ratings as Record<string, number> | undefined
  const savedJogadas = initialState?.jogadas as number | undefined

  const [screen, setScreen] = useState<Screen>('title')
  const [deck, setDeck] = useState<DeckCard[]>(() => savedDeck ?? buildDeck())
  const [flipped, setFlipped] = useState<string[]>([])          // uids currently face-up
  const [matched, setMatched] = useState<Set<string>>(
    () => new Set(savedMatched ?? [])
  )
  const [wrong, setWrong] = useState<string[]>([])              // wrong-pair uids
  const [blocked, setBlocked] = useState(false)
  const [jogadas, setJogadas] = useState(savedJogadas ?? 0)
  const [ratings, setRatings] = useState<Record<string, number>>(
    savedRatings ?? {}
  )
  const [modalCard, setModalCard] = useState<Carta | null>(null)
  const [starPending, setStarPending] = useState(0)             // star value in modal
  const [resultRanking, setResultRanking] = useState<{ nome: string; pts: number }[]>([])
  const [barsReady, setBarsReady] = useState(false)

  // If we have saved progress, jump to game screen
  useEffect(() => {
    if (savedDeck && savedDeck.length > 0) {
      setScreen('game')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Auto-save ── */
  const save = useCallback((
    d: DeckCard[],
    m: Set<string>,
    r: Record<string, number>,
    j: number
  ) => {
    onStateChange({ deck: d, matched: Array.from(m), ratings: r, jogadas: j })
  }, [onStateChange])

  /* ── Card click ── */
  const handleCardClick = useCallback((uid: string, id: string) => {
    if (blocked) return
    if (flipped.includes(uid)) return
    if (matched.has(id)) return
    if (flipped.length >= 2) return

    const newFlipped = [...flipped, uid]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      const newJogadas = jogadas + 1
      setJogadas(newJogadas)
      setBlocked(true)

      const [uid1, uid2] = newFlipped
      const id1 = deck.find(c => c.uid === uid1)!.id
      const id2 = deck.find(c => c.uid === uid2)!.id

      if (id1 === id2) {
        // Match!
        setTimeout(() => {
          const newMatched = new Set(matched)
          newMatched.add(id1)
          setMatched(newMatched)
          setFlipped([])
          setBlocked(false)
          // Open rating modal
          setModalCard(cartaById(id1))
          setStarPending(ratings[id1] ?? 0)
          save(deck, newMatched, ratings, newJogadas)
        }, 500)
      } else {
        // Wrong — shake then flip back
        setWrong(newFlipped)
        setTimeout(() => {
          setWrong([])
          setFlipped([])
          setBlocked(false)
        }, 900)
      }
    }
  }, [blocked, flipped, matched, jogadas, deck, ratings, save])

  /* ── Star rating ── */
  const confirmRating = useCallback(() => {
    if (starPending === 0 || !modalCard) return
    const newRatings = { ...ratings, [modalCard.id]: starPending }
    setRatings(newRatings)
    setModalCard(null)
    setStarPending(0)
    save(deck, matched, newRatings, jogadas)

    // Check if all 15 pairs matched and rated
    if (matched.size === 15) {
      setTimeout(() => {
        const ranking = CARTAS.map(c => ({
          nome: c.nome,
          pts: newRatings[c.id] ?? 0,
        })).sort((a, b) => b.pts - a.pts)
        setResultRanking(ranking)
        setScreen('result')
        setTimeout(() => setBarsReady(true), 60)
      }, 400)
    }
  }, [starPending, modalCard, ratings, deck, matched, jogadas, save])

  /* ── Complete ── */
  const handleComplete = useCallback(() => {
    const scores: Record<string, number> = {}
    for (const c of CARTAS) scores[c.nome] = ratings[c.id] ?? 0
    onComplete(
      { ranking: resultRanking, scores },
      { ratings, jogadas }
    )
  }, [resultRanking, ratings, jogadas, onComplete])

  /* ── Restart ── */
  const restart = useCallback(() => {
    const d = buildDeck()
    setDeck(d)
    setFlipped([])
    setMatched(new Set())
    setWrong([])
    setBlocked(false)
    setJogadas(0)
    setRatings({})
    setModalCard(null)
    setStarPending(0)
    setResultRanking([])
    setBarsReady(false)
    setScreen('title')
    save(d, new Set(), {}, 0)
  }, [save])

  /* ── Card class helper ── */
  const cardClass = (uid: string, id: string) => {
    const classes = [styles.card]
    if (flipped.includes(uid) || matched.has(id)) classes.push(styles.flipped)
    if (matched.has(id)) classes.push(styles.matched)
    if (wrong.includes(uid)) classes.push(styles.wrong)
    return classes.join(' ')
  }

  /* ── Screens ── */

  if (screen === 'title') {
    return (
      <div className={styles.root}>
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}>🃏</div>
          <h1 className={styles.heroTitle}>Jogo da Memória</h1>
          <p className={styles.heroSub}>Administração, Negócios e Serviços</p>

          <div className={styles.introBox}>
            <p>
              <strong>Como jogar:</strong> Encontre os <strong>15 pares</strong> de
              cartas — cada par representa um curso desta área. Ao encontrar um par,
              você poderá <strong>avaliar seu interesse</strong> no curso de 1 a 5
              estrelas.
            </p>
            <br />
            <p>
              <strong>Objetivo:</strong> Descubra todos os pares e monte seu
              <strong> ranking pessoal</strong> de interesse nos cursos.
            </p>
          </div>

          <button
            className={styles.btnPrimary}
            onClick={() => setScreen('game')}
          >
            Começar
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'result') {
    const maxPts = resultRanking[0]?.pts || 5
    return (
      <div className={styles.root}>
        <div className={styles.resultRoot}>
          <div className={styles.resultHeader}>
            <div className={styles.resultTrophy}>🏆</div>
            <div className={styles.resultTitle}>Jogo Concluído!</div>
            <div className={styles.resultSub}>
              {jogadas} jogadas · 15 pares encontrados · Área: Adm., Negócios e Serviços
            </div>
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
          <button className={styles.resultBtn} style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', marginTop: 8 }} onClick={restart}>
            Jogar Novamente
          </button>
        </div>
      </div>
    )
  }

  /* ── Game screen ── */
  const paresEncontrados = matched.size
  const totalRated = Object.keys(ratings).length

  return (
    <div className={styles.root}>
      {/* HUD */}
      <div className={styles.hud}>
        <div>
          <div className={styles.hudTitle}>Jogo da Memória</div>
          <div className={styles.hudSub}>Adm., Negócios e Serviços</div>
        </div>
        <div className={styles.hudStats}>
          <div className={styles.stat}>
            <div className={styles.statVal}>{paresEncontrados}/15</div>
            <div className={styles.statLbl}>PARES</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statVal}>{jogadas}</div>
            <div className={styles.statLbl}>JOGADAS</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statVal}>{totalRated}/15</div>
            <div className={styles.statLbl}>AVALIADOS</div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className={styles.boardWrap}>
        <div className={styles.board}>
          {deck.map(card => {
            const carta = cartaById(card.id)
            return (
              <div
                key={card.uid}
                className={cardClass(card.uid, card.id)}
                onClick={() => handleCardClick(card.uid, card.id)}
              >
                <div className={styles.cardInner}>
                  {/* Back face */}
                  <div className={`${styles.cardFace} ${styles.cardBack}`}>
                    🃏
                  </div>
                  {/* Front face */}
                  <div
                    className={`${styles.cardFace} ${styles.cardFront}`}
                    style={{ background: carta.color }}
                  >
                    {matched.has(card.id) && (
                      <div className={styles.cardMatchCheck}>✓</div>
                    )}
                    <div className={styles.cardLabel}>{carta.nome}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Rating Modal */}
      {modalCard && (
        <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) { /* don't close on backdrop */ } }}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <div className={styles.modalCourseName}>{modalCard.nome}</div>
              <div className={styles.modalArea}>{modalCard.area}</div>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalInfoGrid}>
                <div className={styles.modalInfoCard}>
                  <div className={styles.modalInfoLabel}>O que você aprende</div>
                  <div className={styles.modalInfoText}>{modalCard.aprender}</div>
                </div>
                <div className={styles.modalInfoCard}>
                  <div className={styles.modalInfoLabel}>Na prática</div>
                  <div className={styles.modalInfoText}>{modalCard.pratica}</div>
                </div>
                <div className={styles.modalInfoCard}>
                  <div className={styles.modalInfoLabel}>Perfil ideal</div>
                  <div className={styles.modalInfoText}>{modalCard.perfil}</div>
                </div>
                <div className={styles.modalInfoCard}>
                  <div className={styles.modalInfoLabel}>Onde trabalhar</div>
                  <div className={styles.modalInfoText}>{modalCard.trabalhar}</div>
                </div>
              </div>

              <div className={styles.ratingSection}>
                <div className={styles.ratingLabel}>Como você avalia seu interesse?</div>
                <div className={styles.ratingSub}>Toque nas estrelas para pontuar</div>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <span
                      key={v}
                      className={`${styles.star} ${starPending >= v ? styles.active : ''}`}
                      onClick={() => setStarPending(v)}
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
                disabled={starPending === 0}
                onClick={confirmRating}
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

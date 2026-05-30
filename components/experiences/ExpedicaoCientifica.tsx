'use client'

import { useState, useCallback, useEffect } from 'react'
import styles from './ExpedicaoCientifica.module.css'

/* ── Types ──────────────────────────────────────────────────────────────── */
interface Missao {
  id: string
  nome: string
  bioma: string
  cor: string
  desafio: string
  opcoes: string[]
  comentarios: string[]
}

type Screen = 'title' | 'map' | 'result'

interface GameProps {
  patientId: string
  experienceId: number
  initialState?: Record<string, unknown>
  onStateChange: (state: Record<string, unknown>) => void
  onComplete: (scores: Record<string, unknown>, responses: Record<string, unknown>) => void
}

/* ── Mission data ───────────────────────────────────────────────────────── */
const MISSOES: Missao[] = [
  {
    id: 'bio_bio',
    nome: 'Biotecnologia e Bioquímica',
    bioma: '🌿 Floresta Amazônica',
    cor: '#1B5E20',
    desafio: 'Uma molécula bioativa foi descoberta em planta amazônica rara. Como você avança na pesquisa?',
    opcoes: [
      'A. Coletar amostras e identificar compostos bioativos em laboratório',
      'B. Desenvolver método de síntese para preservar a planta original',
      'C. Protocolar a descoberta e buscar parceria com indústria farmacêutica',
    ],
    comentarios: [
      'Perfil analítico — você parte da investigação científica!',
      'Perfil sustentável — você protege o recurso natural!',
      'Perfil estratégico — você pensa na cadeia de valor!',
    ],
  },
  {
    id: 'meteo',
    nome: 'Meteorologia',
    bioma: '🌿 Floresta Amazônica',
    cor: '#1B5E20',
    desafio: 'Os rios voadores da Amazônia estão enfraquecendo, reduzindo chuvas no Centro-Sul. Qual é a sua ação?',
    opcoes: [
      'A. Monitorar dados de evapotranspiração e umidade em tempo real',
      'B. Modelar cenários climáticos para os próximos 10 anos',
      'C. Emitir alertas de risco de seca para estados afetados',
    ],
    comentarios: [
      'Perfil monitoramento — você coleta dados essenciais!',
      'Perfil modelagem — você projeta o futuro!',
      'Perfil comunicação — você protege as populações!',
    ],
  },
  {
    id: 'geo_fis',
    nome: 'Geofísica',
    bioma: '🌿 Floresta Amazônica',
    cor: '#1B5E20',
    desafio: 'Sinais sísmicos incomuns são detectados na bacia amazônica. Como você investiga?',
    opcoes: [
      'A. Instalar rede de sismógrafos na região afetada',
      'B. Analisar dados históricos de movimentação de placas',
      'C. Fazer levantamento aerogeofísico para mapear o subsolo',
    ],
    comentarios: [
      'Perfil campo — você age direto no território!',
      'Perfil histórico — você busca padrões nos dados!',
      'Perfil tecnológico — você usa sensoriamento remoto!',
    ],
  },
  {
    id: 'agroeco',
    nome: 'Agroecologia',
    bioma: '🌾 Cerrado',
    cor: '#E65100',
    desafio: 'Agricultores do Cerrado querem migrar para sistemas orgânicos mas têm medo de perder produtividade. O que você faz?',
    opcoes: [
      'A. Implantar sistemas agroflorestais como transição gradual',
      'B. Certificar as primeiras propriedades para abrir mercado orgânico local',
      'C. Criar programa de capacitação em manejo agroecológico do cerrado',
    ],
    comentarios: [
      'Perfil técnico — você usa a natureza como aliada!',
      'Perfil mercado — você cria incentivo econômico!',
      'Perfil educador — você transforma pela informação!',
    ],
  },
  {
    id: 'geo',
    nome: 'Geologia',
    bioma: '🌾 Cerrado',
    cor: '#E65100',
    desafio: 'Chapadas do Cerrado sofrem erosão intensa por mineração ilegal. Como você age?',
    opcoes: [
      'A. Mapear áreas de risco e lavra ilegal por imagem de satélite',
      'B. Analisar camadas sedimentares para documentar o dano histórico',
      'C. Elaborar laudo técnico geológico para subsidiar ação legal',
    ],
    comentarios: [
      'Perfil tecnológico — você usa geoprocessamento!',
      'Perfil científico — você documenta com rigor!',
      'Perfil jurídico — você dá base para a justiça agir!',
    ],
  },
  {
    id: 'alim',
    nome: 'Ciências e Tecnologia de Alimentos',
    bioma: '🌾 Cerrado',
    cor: '#E65100',
    desafio: 'Frutos do Cerrado como pequi e baru têm enorme potencial nutricional mas são pouco aproveitados. Qual sua estratégia?',
    opcoes: [
      'A. Desenvolver novos produtos alimentícios com frutos nativos do cerrado',
      'B. Estudar conservação e processamento para aumentar vida útil',
      'C. Criar protocolos de rastreabilidade e certificação de origem',
    ],
    comentarios: [
      'Perfil inovação — você cria novos mercados!',
      'Perfil tecnologia — você resolve o gargalo logístico!',
      'Perfil qualidade — você garante valor ao produto!',
    ],
  },
  {
    id: 'zoo',
    nome: 'Zootecnia',
    bioma: '🌾 Cerrado',
    cor: '#E65100',
    desafio: 'O Cerrado concentra o maior rebanho bovino do Brasil, mas degradação de pastagens ameaça a produção. Como você age?',
    opcoes: [
      'A. Implementar pastagem rotacionada e recuperação de solos degradados',
      'B. Desenvolver raças adaptadas ao cerrado com melhoramento genético',
      'C. Integrar lavoura-pecuária-floresta para produção sustentável',
    ],
    comentarios: [
      'Perfil manejo — você cuida do recurso produtivo!',
      'Perfil genética — você melhora a adaptação animal!',
      'Perfil sistêmico — você integra produção e natureza!',
    ],
  },
  {
    id: 'gest_amb',
    nome: 'Gestão Ambiental',
    bioma: '🌵 Caatinga',
    cor: '#BF360C',
    desafio: 'O avanço da desertificação no semiárido ameaça comunidades inteiras. Como você age?',
    opcoes: [
      'A. Criar planos de recuperação com espécies nativas da caatinga',
      'B. Implantar cisternas e tecnologias de captação de água de chuva',
      'C. Desenvolver zoneamento ambiental para controlar o uso do solo',
    ],
    comentarios: [
      'Perfil restauração — você recupera o que foi perdido!',
      'Perfil tecnologia social — você resolve o problema da água!',
      'Perfil planejamento — você previne o avanço do dano!',
    ],
  },
  {
    id: 'lic_cne',
    nome: 'Lic. Ciências Naturais e Exatas',
    bioma: '🌵 Caatinga',
    cor: '#BF360C',
    desafio: 'Escolas do semiárido não têm recursos para ensinar ciências com experimentos práticos. Qual sua solução?',
    opcoes: [
      'A. Criar laboratórios de ciências com materiais locais e de baixo custo',
      'B. Desenvolver aulas de campo usando a caatinga como laboratório vivo',
      'C. Produzir material didático contextualizado ao semiárido nordestino',
    ],
    comentarios: [
      'Perfil inventivo — você cria ciência com o que tem!',
      'Perfil território — você usa a natureza local como recurso!',
      'Perfil currículo — você contextualiza o conhecimento!',
    ],
  },
  {
    id: 'bio',
    nome: 'Ciências Biológicas',
    bioma: '🌳 Mata Atlântica',
    cor: '#2E7D32',
    desafio: 'O mico-leão-dourado está ameaçado de extinção por fragmentação da Mata Atlântica. Como você contribui?',
    opcoes: [
      'A. Monitorar populações com câmeras-armadilha e rastreadores',
      'B. Desenvolver corredores ecológicos entre fragmentos florestais',
      'C. Criar programas de educação ambiental nas comunidades do entorno',
    ],
    comentarios: [
      'Perfil pesquisador — você monitora com dados precisos!',
      'Perfil conservacionista — você reconecta os habitats!',
      'Perfil comunitário — você envolve as pessoas na solução!',
    ],
  },
  {
    id: 'lic_agr',
    nome: 'Lic. Ciências Agrárias',
    bioma: '🌳 Mata Atlântica',
    cor: '#2E7D32',
    desafio: 'Agricultores familiares da Mata Atlântica precisam produzir sem desmatar. Como você os orienta?',
    opcoes: [
      'A. Ensinar técnicas de agrofloresta e sistemas consorciados',
      'B. Criar programas de extensão rural com foco em conservação',
      'C. Desenvolver material didático sobre legislação ambiental rural',
    ],
    comentarios: [
      'Perfil técnico — você ensina práticas sustentáveis!',
      'Perfil extensão — você vai até o agricultor!',
      'Perfil jurídico — você educa sobre direitos e deveres!',
    ],
  },
  {
    id: 'eco',
    nome: 'Ecologia',
    bioma: '🐊 Pantanal',
    cor: '#1565C0',
    desafio: 'A seca histórica de 2024 devastou 40% do Pantanal. Como você age para proteger a fauna?',
    opcoes: [
      'A. Monitorar e mapear áreas afetadas com drones e sensores',
      'B. Criar corredores ecológicos para migração dos animais',
      'C. Acionar resgates e reintrodução de espécies ameaçadas',
    ],
    comentarios: [
      'Perfil monitoramento — você coleta dados precisos!',
      'Perfil estratégico — você pensa na mobilidade da fauna!',
      'Perfil conservacionista — você prioriza espécies em risco!',
    ],
  },
  {
    id: 'med_vet',
    nome: 'Medicina Veterinária',
    bioma: '🐊 Pantanal',
    cor: '#1565C0',
    desafio: 'Um surto de ranavirus está matando jacarés e anfíbios no Pantanal. O que você faz?',
    opcoes: [
      'A. Coletar amostras e identificar o agente viral nos animais afetados',
      'B. Isolar as populações infectadas para conter o avanço do vírus',
      'C. Acionar rede de pesquisa para desenvolver protocolo de controle',
    ],
    comentarios: [
      'Perfil diagnóstico — você identifica o problema na fonte!',
      'Perfil biossegurança — você age para conter o dano!',
      'Perfil colaborativo — você mobiliza a ciência!',
    ],
  },
  {
    id: 'agro',
    nome: 'Agronomia',
    bioma: '🐄 Pampa',
    cor: '#558B2F',
    desafio: 'O Pampa gaúcho enfrenta seca severa que compromete a safra de soja e trigo. Qual sua estratégia?',
    opcoes: [
      'A. Usar dados de satélite e IA para prever impactos e planejar ações',
      'B. Recomendar cultivares mais resilientes à seca para a próxima safra',
      'C. Adaptar logística de distribuição e gerenciar riscos de mercado',
    ],
    comentarios: [
      'Perfil tecnológico — você usa dados para decidir!',
      'Perfil pesquisa — você pensa no futuro da produção!',
      'Perfil gestão — você minimiza perdas econômicas!',
    ],
  },
  {
    id: 'bebidas',
    nome: 'Produção de Bebidas',
    bioma: '🐄 Pampa',
    cor: '#558B2F',
    desafio: 'A vitivinicultura gaúcha sofreu perdas severas com chuvas em 2024. Como você reage?',
    opcoes: [
      'A. Analisar lotes afetados e decidir entre recuperação ou descarte',
      'B. Desenvolver técnicas de vinificação adaptadas para uvas danificadas',
      'C. Replanejar safra e buscar novas castas adaptadas ao clima do Sul',
    ],
    comentarios: [
      'Perfil qualidade — você decide com critério técnico!',
      'Perfil inovação — você transforma o adverso em oportunidade!',
      'Perfil estratégico — você pensa na safra futura!',
    ],
  },
  {
    id: 'ocean',
    nome: 'Oceanografia',
    bioma: '🌊 Zona Costeira e Mangues',
    cor: '#01579B',
    desafio: 'Os recifes de coral do litoral nordestino estão branqueando por aquecimento oceânico. O que você faz?',
    opcoes: [
      'A. Monitorar temperatura da água e extensão do branqueamento',
      'B. Coletar amostras de coral para pesquisa de espécies resistentes',
      'C. Comunicar comunidades pesqueiras e propor áreas de preservação',
    ],
    comentarios: [
      'Perfil monitoramento — você documenta o fenômeno!',
      'Perfil pesquisa — você busca solução na natureza!',
      'Perfil comunitário — você protege quem depende do mar!',
    ],
  },
]

const TOTAL = MISSOES.length  // 16

/* ── Group missions by biome ────────────────────────────────────────────── */
const BIOMES = Array.from(new Set(MISSOES.map(m => m.bioma)))

/* ── Component ──────────────────────────────────────────────────────────── */
export default function ExpedicaoCientifica({
  initialState,
  onStateChange,
  onComplete,
}: GameProps) {
  const savedPontuacoes = initialState?.pontuacoes as Record<string, number> | undefined
  const savedChoices = initialState?.choices as Record<string, number> | undefined

  const [screen, setScreen] = useState<Screen>('title')
  const [pontuacoes, setPontuacoes] = useState<Record<string, number>>(savedPontuacoes ?? {})
  const [choices, setChoices] = useState<Record<string, number>>(savedChoices ?? {})
  const [modalMissao, setModalMissao] = useState<Missao | null>(null)
  const [choiceIdx, setChoiceIdx] = useState<number | null>(null)
  const [starVal, setStarVal] = useState(0)
  const [resultRanking, setResultRanking] = useState<{ nome: string; bioma: string; pts: number }[]>([])
  const [barsReady, setBarsReady] = useState(false)

  // Restore progress to map screen if any missions done
  useEffect(() => {
    if (savedPontuacoes && Object.keys(savedPontuacoes).length > 0) {
      setScreen('map')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const concluidas = Object.keys(pontuacoes).length

  const save = useCallback((p: Record<string, number>, c: Record<string, number>) => {
    onStateChange({ pontuacoes: p, choices: c })
  }, [onStateChange])

  /* ── Open mission modal ── */
  const openMissao = useCallback((m: Missao) => {
    if (pontuacoes[m.id] !== undefined) return  // already done
    setModalMissao(m)
    setChoiceIdx(null)
    setStarVal(0)
  }, [pontuacoes])

  /* ── Select answer option ── */
  const selectOpcao = useCallback((idx: number) => {
    setChoiceIdx(idx)
  }, [])

  /* ── Confirm mission ── */
  const confirmar = useCallback(() => {
    if (!modalMissao || choiceIdx === null || starVal === 0) return
    const newPontuacoes = { ...pontuacoes, [modalMissao.id]: starVal }
    const newChoices = { ...choices, [modalMissao.id]: choiceIdx }
    setPontuacoes(newPontuacoes)
    setChoices(newChoices)
    setModalMissao(null)
    save(newPontuacoes, newChoices)

    if (Object.keys(newPontuacoes).length >= TOTAL) {
      setTimeout(() => {
        const ranking = MISSOES.map(m => ({
          nome: m.nome,
          bioma: m.bioma,
          pts: newPontuacoes[m.id] ?? 0,
        })).sort((a, b) => b.pts - a.pts)
        setResultRanking(ranking)
        setScreen('result')
        setTimeout(() => setBarsReady(true), 60)
      }, 400)
    }
  }, [modalMissao, choiceIdx, starVal, pontuacoes, choices, save])

  /* ── Complete ── */
  const handleComplete = useCallback(() => {
    const scores: Record<string, number> = {}
    for (const m of MISSOES) scores[m.nome] = pontuacoes[m.id] ?? 0
    onComplete(
      { ranking: resultRanking, scores },
      { choices, pontuacoes }
    )
  }, [resultRanking, pontuacoes, choices, onComplete])

  /* ── Title screen ── */
  if (screen === 'title') {
    return (
      <div className={styles.root}>
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}>🗺️</div>
          <h1 className={styles.heroTitle}>Expedição Científica</h1>
          <p className={styles.heroSub}>Ciências Biológicas e da Terra</p>

          <div className={styles.introBox}>
            <p>
              <strong>Como funciona:</strong> Você vai explorar os{' '}
              <strong>biomas brasileiros</strong> e encontrar{' '}
              <strong>{TOTAL} missões científicas</strong> — uma por curso desta área.
            </p>
            <br />
            <p>
              Em cada missão, leia o <strong>desafio real</strong>, escolha como
              agiria e avalie seu <strong>interesse no curso</strong> de 1 a 5 estrelas.
            </p>
          </div>

          <button className={styles.btnPrimary} onClick={() => setScreen('map')}>
            Iniciar Expedição
          </button>
        </div>
      </div>
    )
  }

  /* ── Result screen ── */
  if (screen === 'result') {
    const maxPts = resultRanking[0]?.pts || 5
    return (
      <div className={styles.root}>
        <div className={styles.resultRoot}>
          <div className={styles.resultHeader}>
            <div className={styles.resultTrophy}>🌿</div>
            <div className={styles.resultTitle}>Expedição Concluída!</div>
            <div className={styles.resultSub}>
              {TOTAL} missões exploradas · Ciências Biológicas e da Terra
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
                  <div className={styles.rankBioma}>{item.bioma}</div>
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

  /* ── Map screen ── */
  return (
    <div className={styles.root}>
      {/* HUD */}
      <div className={styles.hud}>
        <div>
          <div className={styles.hudTitle}>Expedição Científica</div>
          <div className={styles.hudSub}>Biomas do Brasil</div>
        </div>
        <div className={styles.hudStats}>
          <div className={styles.stat}>
            <div className={styles.statVal}>{concluidas}/{TOTAL}</div>
            <div className={styles.statLbl}>MISSÕES</div>
          </div>
        </div>
      </div>

      {/* Biomes list */}
      <div className={styles.mapScreen}>
        {BIOMES.map(bioma => {
          const missoes = MISSOES.filter(m => m.bioma === bioma)
          const done = missoes.filter(m => pontuacoes[m.id] !== undefined).length
          const cor = missoes[0].cor

          return (
            <div key={bioma} className={styles.biomeSection}>
              <div className={styles.biomeHeader} style={{ borderLeft: `3px solid ${cor}` }}>
                <span className={styles.biomeTitle} style={{ color: cor }}>
                  {bioma}
                </span>
                <span className={styles.biomeProg}>{done}/{missoes.length}</span>
              </div>

              <div className={styles.missaoGrid}>
                {missoes.map((m, idx) => {
                  const isDone = pontuacoes[m.id] !== undefined
                  const stars = pontuacoes[m.id]
                  return (
                    <button
                      key={m.id}
                      className={`${styles.missaoCard}${isDone ? ` ${styles.done}` : ''}`}
                      onClick={() => openMissao(m)}
                      disabled={isDone}
                    >
                      <div
                        className={styles.missaoPin}
                        style={{
                          color: isDone ? '#4CAF50' : cor,
                          borderColor: isDone ? '#4CAF50' : cor,
                          background: isDone ? 'rgba(76,175,80,.12)' : 'transparent',
                        }}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div className={styles.missaoInfo}>
                        <div className={styles.missaoNome}>{m.nome}</div>
                        <div className={`${styles.missaoStatus}${isDone ? ` ${styles.done}` : ''}`}>
                          {isDone ? 'Missão concluída' : 'Clicar para explorar'}
                        </div>
                      </div>
                      {isDone && stars !== undefined && (
                        <div className={styles.missaoStars}>
                          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mission modal */}
      {modalMissao && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div
              className={styles.modalHeader}
              style={{ background: `linear-gradient(135deg, ${modalMissao.cor}22, ${modalMissao.cor}11)` }}
            >
              <div className={styles.modalBioma} style={{ color: modalMissao.cor }}>
                {modalMissao.bioma}
              </div>
              <div className={styles.modalNome}>{modalMissao.nome}</div>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.desafioTag}>Desafio de Campo</div>
              <div className={styles.desafioText}>{modalMissao.desafio}</div>

              <div className={styles.opcoes}>
                {modalMissao.opcoes.map((op, i) => (
                  <button
                    key={i}
                    className={`${styles.opcaoBtn}${choiceIdx === i ? ` ${styles.selected}` : ''}`}
                    onClick={() => selectOpcao(i)}
                  >
                    {op}
                  </button>
                ))}
              </div>

              <div className={`${styles.feedback}${choiceIdx !== null ? ` ${styles.visible}` : ''}`}>
                {choiceIdx !== null ? `💡 ${modalMissao.comentarios[choiceIdx]}` : ''}
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
                disabled={choiceIdx === null || starVal === 0}
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

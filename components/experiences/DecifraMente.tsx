'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { GameProps } from '@/types/database'
import s from './DecifraMente.module.css'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TipoData {
  n: string   // name
  d: string   // description
  c: string   // color
  cr: string  // careers (dot-separated)
}

interface Ponto {
  num: number
  px: number; py: number
  ctx: string
  eixo: [string, string]
  m: string
  a: string
  b: string
}

interface Cena { nome: string; pontos: Ponto[] }
type Screen = 'title' | 'avatar' | 'instrucoes' | 'game' | 'result'
type AvatarGen = 'm' | 'f'
type SC = Record<string, number>

// ─────────────────────────────────────────────────────────────────────────────
// Game Data
// ─────────────────────────────────────────────────────────────────────────────

const TIPOS: Record<string, TipoData> = {
  INTJ: { n:'O Arquiteto',    d:'Estrategista independente, mente analítica e visão de longo prazo. Transforma ideias complexas em planos concretos.',      c:'#7986CB', cr:'Estratégia · Engenharia · Direito' },
  INFJ: { n:'O Conselheiro',  d:'Empático e idealista, busca sentido profundo em tudo. Tem visão única e se importa genuinamente com as pessoas.',            c:'#4CAF50', cr:'Psicologia · Terapia · Escrita' },
  ENTJ: { n:'O Comandante',   d:'Líder nato, determinado e organizado. Enxerga possibilidades onde outros veem obstáculos e mobiliza pessoas com facilidade.', c:'#FF7043', cr:'Administração · Direito · Política' },
  ENFJ: { n:'O Protagonista', d:'Carismático e inspirador, vive para ajudar os outros a crescer. Natural em liderar com empatia e propósito.',               c:'#2196F3', cr:'Pedagogia · Coaching · Medicina' },
  INTP: { n:'O Lógico',       d:'Curioso e criativo, adora desmontar ideias para entender como funcionam. Pensa fora da caixa com precisão analítica.',       c:'#FFC107', cr:'Física · Programação · Pesquisa' },
  INFP: { n:'O Mediador',     d:'Idealista apaixonado, guiado por valores profundos. Criativo e sensível, busca autenticidade em tudo que faz.',              c:'#E91E63', cr:'Artes · Psicologia · Escrita' },
  ENTP: { n:'O Inovador',     d:'Mente rápida e irreverente, adora debater e questionar o status quo. Gerador nato de ideias e soluções criativas.',          c:'#FF5722', cr:'Marketing · Jornalismo · Inovação' },
  ENFP: { n:'O Idealista',    d:'Entusiasmado e imaginativo, vê potencial em tudo e em todos. Contagia com energia positiva e criatividade.',                 c:'#9C27B0', cr:'Publicidade · Educação · Artes' },
  ISTJ: { n:'O Inspetor',     d:'Confiável e metódico, leva compromissos a sério. Organizado, detalhista e garante que tudo funcione como planejado.',        c:'#3F51B5', cr:'Direito · Contabilidade · Engenharia' },
  ISFJ: { n:'O Defensor',     d:'Dedicado e atencioso, cuida das pessoas com lealdade. Discreto mas sempre presente quando alguém precisa de apoio.',         c:'#8BC34A', cr:'Enfermagem · Pedagogia · Serviço Social' },
  ESTJ: { n:'O Executor',     d:'Prático e decisivo, organiza pessoas e processos com eficiência. Gosta de clareza, regras e resultados mensuráveis.',        c:'#F44336', cr:'Gestão · Finanças · Direito' },
  ESFJ: { n:'O Cônsul',       d:'Caloroso e social, coloca as necessidades dos outros em primeiro lugar. Cria ambientes harmoniosos e inclusivos.',           c:'#FF4081', cr:'Medicina · Enfermagem · Eventos' },
  ISTP: { n:'O Virtuoso',     d:'Habilidoso e pragmático, aprende fazendo. Resolve problemas complexos com calma e precisão impressionantes.',                c:'#607D8B', cr:'Engenharia · Cirurgia · Robótica' },
  ISFP: { n:'O Aventureiro',  d:'Artístico e sensível, vive intensamente o presente. Expressivo, autêntico e sempre em busca de novas experiências.',         c:'#009688', cr:'Artes · Música · Design' },
  ESTP: { n:'O Empreendedor', d:'Energético e ousado, age antes de pensar demais. Resolve situações na hora com charme e habilidade prática.',                c:'#FF9800', cr:'Empreendedorismo · Esportes · Vendas' },
  ESFP: { n:'O Animador',     d:'Espontâneo e divertido, ilumina qualquer ambiente. Adora estar com pessoas e criar momentos memoráveis.',                    c:'#795548', cr:'Teatro · Turismo · Comunicação' },
}

const CENAS: Cena[] = [
  { nome: '🛏️ Seu Quarto', pontos: [
    { num:1, px:.18, py:.55, ctx:'Setup do computador', eixo:['S','N'],
      m:'Tem trabalho pra entregar amanhã. O que você faz?',
      a:'Abro a planilha e começo pelo mais urgente — foco total!',
      b:'Coloco uma música primeiro — preciso do estado mental certo pra produzir.' },
    { num:2, px:.52, py:.32, ctx:'Quadro branco na parede', eixo:['J','P'],
      m:'Você tem um quadro com seus compromissos anotados. Isso representa...',
      a:'Meu jeito de funcionar — sem anotar, esqueço e me estresso.',
      b:'Tentativa. Na prática faço na ordem que a vontade manda. 😅' },
    { num:3, px:.72, py:.62, ctx:'Violão encostado', eixo:['T','F'],
      m:'O violão está há semanas sem você tocar. O que passa pela sua cabeça?',
      a:'Preciso decidir — ou retomo com disciplina ou vendo. Sem uso não faz sentido.',
      b:'Não consigo vender. Tem memória afetiva — volto quando sentir vontade. 🎸' },
    { num:4, px:.88, py:.70, ctx:'Cama desfeita', eixo:['E','I'],
      m:'Final de semana livre, quarto do jeito que tá. Qual é o plano ideal?',
      a:'Arrumo rápido e saio — preciso de movimento, de gente, de barulho!',
      b:'Fico exatamente assim — cama desfeita, silêncio, no meu mundo. 😌' },
  ]},
  { nome: '🎉 Festa', pontos: [
    { num:1, px:.14, py:.28, ctx:'DJ no palco', eixo:['J','P'],
      m:'A pista tá esquentando. O DJ deve...',
      a:'Seguir a setlist planejada — foi pensada pra essa noite.',
      b:'Largar o planejado e tocar o que a galera tá pedindo agora! 🎵' },
    { num:2, px:.22, py:.60, ctx:'Grupo no balcão', eixo:['E','I'],
      m:'Você chegou na festa e não conhece quase ninguém. O que faz?',
      a:'Já chego puxando conversa — festa é pra isso! 🥳',
      b:'Fico perto de quem já conheço até me sentir confortável.' },
    { num:3, px:.50, py:.48, ctx:'Sozinho na pista', eixo:['T','F'],
      m:'Você tá sozinho numa festa enquanto todo mundo parece se divertir. O que sente?',
      a:'Analiso a situação e decido — fico ou vou embora. Não fico à toa.',
      b:'Bate um frio — começo a me questionar se as pessoas tão me ignorando. 😔' },
    { num:4, px:.80, py:.68, ctx:'Grupo na mesa', eixo:['S','N'],
      m:'O grupo tá decidindo o que fazer depois da festa. Como você contribui?',
      a:'Sugiro algo concreto — lugar conhecido, preço razoável, fácil de ir.',
      b:'Proponho algo diferente — uma ideia que ninguém tinha pensado ainda! 💡' },
  ]},
  { nome: '🏫 Sala de Aula', pontos: [
    { num:1, px:.12, py:.38, ctx:'Professor na lousa', eixo:['E','I'],
      m:'O professor pediu um voluntário pra resolver no quadro. Você...',
      a:'Levanto a mão na hora — adoro participar na frente da turma! ✋',
      b:'Espero alguém ir primeiro — prefiro resolver no caderno em silêncio.' },
    { num:2, px:.55, py:.32, ctx:'Estante de livros', eixo:['S','N'],
      m:'Você pegou um livro da estante pra pesquisar. O que te prende mais?',
      a:'Os exemplos práticos e as aplicações reais do conteúdo.',
      b:'As teorias por trás — quero entender o conceito maior antes de tudo. 🤔' },
    { num:3, px:.82, py:.52, ctx:'Aluno na janela', eixo:['T','F'],
      m:'Um colega erra no quadro na frente de todos. O que você faz?',
      a:'Corrijo — se eu sei a resposta certa, falo. Simples.',
      b:'Fico quieto — não quero constranger ele na frente da turma. 💙' },
    { num:4, px:.30, py:.65, ctx:'Dupla em grupo', eixo:['J','P'],
      m:'Vocês têm uma semana pra entregar o trabalho. Como você organiza?',
      a:'Divido as tarefas agora, defino quem faz o quê e quando entrega.',
      b:'Vamos vendo conforme a semana avança — funciono melhor assim. 😅' },
  ]},
  { nome: '🌳 Parque', pontos: [
    { num:1, px:.10, py:.72, ctx:'Piquenique montado', eixo:['J','P'],
      m:'Você tá organizando um piquenique com amigos. Como você chega?',
      a:'Com tudo planejado — toalha, comida separada, horário combinado. ✅',
      b:'Chego com o que tinha em casa e vou vendo o que os outros trouxeram.' },
    { num:2, px:.32, py:.48, ctx:'Quiosque', eixo:['S','N'],
      m:'Você chega no quiosque com várias opções. Como escolhe?',
      a:'Peço o que já conheço e sei que gosto — sem surpresas.',
      b:'Experimento algo diferente — pode ser uma boa descoberta! 😋' },
    { num:3, px:.55, py:.38, ctx:'Banco solitário', eixo:['T','F'],
      m:'Você tá no banco e um estranho senta do lado e começa a chorar. O que você faz?',
      a:'Pergunto objetivamente se precisa de ajuda — água, telefone, algo prático.',
      b:'Fico em silêncio do lado — às vezes só a presença já ajuda. 🤍' },
    { num:4, px:.80, py:.55, ctx:'Lago com patos', eixo:['E','I'],
      m:'Você tem uma tarde livre nesse parque vazio. O que sente?',
      a:'Fico inquieto — preferia estar com alguém. Logo chamo alguém pra vir! 📱',
      b:'Que alívio — silêncio, natureza e tempo só pra mim. Perfeito. 🕊️' },
  ]},
  { nome: '☕ Cafeteria', pontos: [
    { num:1, px:.14, py:.38, ctx:'Barista no balcão', eixo:['S','N'],
      m:'Você vem aqui todo dia pedir o mesmo café. O que te faz voltar?',
      a:'Sei exatamente o que vou ter — consistência e qualidade garantida.',
      b:'É o clima daqui. Tem algo especial que vai além do café em si. ✨' },
    { num:2, px:.28, py:.65, ctx:'Sofá com notebook', eixo:['J','P'],
      m:'Você tá trabalhando e surge uma ideia nova. O que faz?',
      a:'Anoto rapidinho e volto ao que estava — termino o que comecei primeiro.',
      b:'Mergulho na ideia nova — pode ser melhor que o plano original! 💡' },
    { num:3, px:.52, py:.55, ctx:'Casal na mesa', eixo:['E','I'],
      m:'Um colega te convida pra se juntar à conversa dele. O que você faz?',
      a:'Vou logo — adoro uma boa conversa, rende mais que estudar sozinho! 😄',
      b:'Agradeço mas fico no meu — preciso de silêncio pra me concentrar.' },
    { num:4, px:.82, py:.45, ctx:'Poltrona na janela', eixo:['T','F'],
      m:'Você tá aqui pensando numa decisão difícil. O que pesa mais?',
      a:'Os fatos e o que faz mais sentido racionalmente — sigo a lógica.',
      b:'O impacto nas pessoas que me importam — não consigo ignorar isso. 💛' },
  ]},
  { nome: '💪 Academia', pontos: [
    { num:1, px:.20, py:.48, ctx:'Treino com halteres', eixo:['J','P'],
      m:'Você chegou na academia. Como é seu treino?',
      a:'Sigo a planilha do personal à risca — cada série no tempo certo. 📋',
      b:'Treino o que estou com vontade — vou sentindo o que o corpo pede.' },
    { num:2, px:.38, py:.62, ctx:'Colega com postura errada', eixo:['T','F'],
      m:'Você vê um colega com postura errada num exercício pesado. O que faz?',
      a:'Chego e corrijo — postura errada machuca, simples assim.',
      b:'Espero um momento adequado — não quero constranger na frente de todos. 😬' },
    { num:3, px:.60, py:.52, ctx:'Personal trainer', eixo:['E','I'],
      m:'Você prefere treinar como?',
      a:'Com personal ou em grupo — o incentivo de alguém me faz render mais! 🙌',
      b:'Sozinho com fone — sem interrupção, no meu ritmo e no meu mundo. 🎧' },
    { num:4, px:.82, py:.40, ctx:'Pessoa na esteira', eixo:['S','N'],
      m:'Você tá na esteira pensando nos seus objetivos. O que te motiva mais?',
      a:'Resultados concretos — peso, tempo de corrida, medidas reais. 📊',
      b:'A sensação de evolução — me imagino mais saudável e com mais energia. ✨' },
  ]},
  { nome: '🎡 Parque de Diversões', pontos: [
    { num:1, px:.80, py:.35, ctx:'Roda gigante', eixo:['T','F'],
      m:'Seu grupo quer subir na roda gigante mas você tem um pouco de medo. O que faz?',
      a:'Analiso o risco — é seguro, então vou. Não deixo o medo decidir por mim.',
      b:'Falo que prefiro esperar embaixo — não quero fingir que estou bem. 💙' },
    { num:2, px:.40, py:.52, ctx:'Carrossel colorido', eixo:['S','N'],
      m:'Você tá olhando pro carrossel girando. O que passa pela sua cabeça?',
      a:'Me lembro de andar nele quando era criança — memória concreta e gostosa.',
      b:'Fico pensando em como seria ver o mundo sempre girando em círculos assim... 🌀' },
    { num:3, px:.80, py:.72, ctx:'Game booth', eixo:['J','P'],
      m:'Você tem 2 horas no parque. Como organiza o tempo?',
      a:'Defino quais atrações quero fazer em ordem — não quero perder nada.',
      b:'Vou no que aparecer — a surpresa faz parte da diversão! 🎲' },
    { num:4, px:.10, py:.55, ctx:'Coreto com bancos', eixo:['E','I'],
      m:'Seu grupo foi pra uma atração que você não quis. Você ficou sozinho. Como se sente?',
      a:'Inquieto — logo vou atrás de alguém. Não gosto de ficar parado.',
      b:'Ótimo — aproveito pra respirar, observar o movimento e recarregar. 🔋' },
  ]},
]

// Simple star positions (stable, no random on each render)
const STARS = [
  {x:5,y:8,sz:1.5,dur:2.1,dl:0},{x:15,y:22,sz:1,dur:3.2,dl:.5},{x:28,y:5,sz:2,dur:2.7,dl:1},
  {x:45,y:18,sz:1.5,dur:1.9,dl:.3},{x:60,y:8,sz:1,dur:2.4,dl:.8},{x:72,y:25,sz:2,dur:3,dl:.2},
  {x:85,y:12,sz:1.5,dur:2.2,dl:.6},{x:92,y:30,sz:1,dur:2.8,dl:.4},{x:35,y:35,sz:1,dur:3.5,dl:.7},
  {x:55,y:40,sz:1.5,dur:2,dl:.9},{x:75,y:42,sz:1,dur:2.6,dl:.1},{x:10,y:45,sz:2,dur:3.1,dl:.55},
]

function getMBTI(sc: SC) {
  return (sc.E >= sc.I ? 'E' : 'I') +
         (sc.S >= sc.N ? 'S' : 'N') +
         (sc.T >= sc.F ? 'T' : 'F') +
         (sc.J >= sc.P ? 'J' : 'P')
}

function makeDefaultSC(): SC { return { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 } }

// ─────────────────────────────────────────────────────────────────────────────
// Avatar SVGs (simplified pixel characters)
// ─────────────────────────────────────────────────────────────────────────────

function AvatarMale({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 80 112" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <rect x="24" y="56" width="32" height="36" rx="4" fill="#2563EB"/>
      {/* Head */}
      <rect x="26" y="20" width="28" height="28" rx="8" fill="#F5C07B"/>
      {/* Eyes */}
      <rect x="32" y="30" width="5" height="5" rx="1" fill="#1a1a1a"/>
      <rect x="43" y="30" width="5" height="5" rx="1" fill="#1a1a1a"/>
      {/* Smile */}
      <path d="M34 40 Q40 45 46 40" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Hair */}
      <rect x="26" y="20" width="28" height="8" rx="6" fill="#4a3520"/>
      {/* Arms */}
      <rect x="10" y="58" width="14" height="8" rx="4" fill="#2563EB"/>
      <rect x="56" y="58" width="14" height="8" rx="4" fill="#2563EB"/>
      {/* Legs */}
      <rect x="26" y="92" width="12" height="18" rx="4" fill="#1a1a1a"/>
      <rect x="42" y="92" width="12" height="18" rx="4" fill="#1a1a1a"/>
      {/* Shoes */}
      <rect x="23" y="108" width="16" height="4" rx="2" fill="#333"/>
      <rect x="41" y="108" width="16" height="4" rx="2" fill="#333"/>
    </svg>
  )
}

function AvatarFemale({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 80 112" xmlns="http://www.w3.org/2000/svg">
      {/* Skirt */}
      <path d="M20 88 Q40 110 60 88 L56 60 L24 60 Z" fill="#D4537E"/>
      {/* Body */}
      <rect x="24" y="56" width="32" height="36" rx="4" fill="#D4537E"/>
      {/* Head */}
      <rect x="26" y="20" width="28" height="28" rx="8" fill="#F5C07B"/>
      {/* Eyes */}
      <rect x="32" y="30" width="5" height="5" rx="1" fill="#1a1a1a"/>
      <rect x="43" y="30" width="5" height="5" rx="1" fill="#1a1a1a"/>
      {/* Smile */}
      <path d="M34 40 Q40 45 46 40" stroke="#C06070" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Hair */}
      <rect x="22" y="18" width="36" height="10" rx="6" fill="#4a3520"/>
      <rect x="22" y="20" width="6" height="20" rx="3" fill="#4a3520"/>
      <rect x="52" y="20" width="6" height="20" rx="3" fill="#4a3520"/>
      {/* Arms */}
      <rect x="10" y="58" width="14" height="8" rx="4" fill="#D4537E"/>
      <rect x="56" y="58" width="14" height="8" rx="4" fill="#D4537E"/>
      {/* Legs */}
      <rect x="28" y="96" width="10" height="14" rx="4" fill="#F5C07B"/>
      <rect x="42" y="96" width="10" height="14" rx="4" fill="#F5C07B"/>
      {/* Shoes */}
      <rect x="25" y="108" width="14" height="4" rx="2" fill="#C06070"/>
      <rect x="41" y="108" width="14" height="4" rx="2" fill="#C06070"/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DecifraMente({ initialState, onStateChange, onComplete }: GameProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>(() => {
    const saved = initialState?.screen as Screen | undefined
    if (saved && saved !== 'result') return saved
    return 'title'
  })
  const [avatarGen, setAvatarGen] = useState<AvatarGen>(() =>
    (initialState?.avatarGen as AvatarGen) ?? 'm'
  )
  const [cena, setCena] = useState<number>(() => (initialState?.cena as number) ?? 0)
  const [qIdx, setQIdx] = useState<number>(() => (initialState?.qIdx as number) ?? 0)
  const [SC, setSC] = useState<SC>(() => (initialState?.SC as SC) ?? makeDefaultSC())
  const [answered, setAnswered] = useState<number>(() => (initialState?.answered as number) ?? 0)

  const [transition, setTransition] = useState<string | null>(null) // scene name during transition
  const [questionKey, setQuestionKey] = useState(0)                 // triggers re-animation
  const [mbtiResult, setMbtiResult] = useState<string>('')

  const onStateChangeRef = useRef(onStateChange)
  const onCompleteRef = useRef(onComplete)
  onStateChangeRef.current = onStateChange
  onCompleteRef.current = onComplete

  // ── Auto-save ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen === 'title' || screen === 'avatar' || screen === 'instrucoes') return
    onStateChangeRef.current({ screen, avatarGen, cena, qIdx, SC, answered })
  }, [screen, avatarGen, cena, qIdx, SC, answered])

  // ── Choose an answer ───────────────────────────────────────────────────────
  const choose = useCallback((side: 'a' | 'b') => {
    const p = CENAS[cena].pontos[qIdx]
    const dim = side === 'a' ? p.eixo[0] : p.eixo[1]
    const newSC = { ...SC, [dim]: SC[dim] + 1 }
    const newAnswered = answered + 1
    setSC(newSC)
    setAnswered(newAnswered)

    const isLastQ    = qIdx === CENAS[cena].pontos.length - 1
    const isLastCena = cena === CENAS.length - 1

    if (isLastQ && isLastCena) {
      // All done — show result
      const tipo = getMBTI(newSC)
      setMbtiResult(tipo)
      setScreen('result')
    } else if (isLastQ) {
      // Move to next scene
      const nextCena = cena + 1
      setTransition(CENAS[nextCena].nome)
      setTimeout(() => {
        setCena(nextCena)
        setQIdx(0)
        setQuestionKey(k => k + 1)
        setTransition(null)
      }, 1200)
    } else {
      // Next question in same scene
      setQIdx(prev => prev + 1)
      setQuestionKey(k => k + 1)
    }
  }, [cena, qIdx, SC, answered])

  // ── Restart ────────────────────────────────────────────────────────────────
  const restart = useCallback(() => {
    setCena(0); setQIdx(0); setSC(makeDefaultSC()); setAnswered(0)
    setQuestionKey(0); setMbtiResult(''); setTransition(null)
    setScreen('avatar')
  }, [])

  // ── Done ───────────────────────────────────────────────────────────────────
  const handleDone = useCallback(() => {
    const tipo = mbtiResult || getMBTI(SC)
    const v = TIPOS[tipo] ?? TIPOS['ENFP']
    const scores: Record<string, unknown> = {
      ...SC, mbti: tipo, type_name: v.n, avatar: avatarGen
    }
    onCompleteRef.current(scores, SC as Record<string, unknown>)
  }, [SC, mbtiResult, avatarGen])

  // ──────────────────────────────────────────────────────────────────────────
  // Renders
  // ──────────────────────────────────────────────────────────────────────────

  function renderStars() {
    return STARS.map((st, i) => (
      <div key={i} className={s.star} style={{
        left: `${st.x}%`, top: `${st.y}%`,
        width: st.sz, height: st.sz,
        ['--dur' as string]: `${st.dur}s`,
        ['--delay' as string]: `${st.dl}s`,
      }} />
    ))
  }

  // ── Title ──────────────────────────────────────────────────────────────────
  function renderTitle() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', minHeight: '100vh', padding: '2rem 1.5rem 3rem', gap: 16 }}>
        {renderStars()}
        {/* Logo */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, fontFamily: "'Press Start 2P', monospace", color: 'rgba(255,215,0,.5)', letterSpacing: 3 }}>▸ DECIFRA</div>
          <div className={s.titleLogo}>MENTE</div>
          <div style={{ width: 60, height: 2, background: 'rgba(255,215,0,.3)', borderRadius: 1 }} />
          <div className={s.titleSub}>7 cenários · 28 escolhas<br />descubra seu perfil MBTI</div>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className={s.btnPrimary} onClick={() => setScreen('avatar')}>▶ JOGAR</button>
          <button className={s.btnSecondary} onClick={() => setScreen('instrucoes')}>COMO FUNCIONA</button>
        </div>
      </div>
    )
  }

  // ── Avatar ─────────────────────────────────────────────────────────────────
  function renderAvatar() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '2rem 1.5rem', gap: 20 }}>
        {renderStars()}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#FFD700', marginBottom: 4 }}>ESCOLHA SEU AVATAR</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>Quem vai explorar os cenários?</div>
        </div>

        <div style={{ display: 'flex', gap: 16, flex: 1, alignItems: 'center' }}>
          <div
            className={`${s.avatarCard} ${avatarGen === 'm' ? s.avatarCardSel : ''}`}
            onClick={() => setAvatarGen('m')}
          >
            <AvatarMale size={70} />
            <span className={`${s.avatarLabel} ${avatarGen === 'm' ? s.avatarCardSel : ''}`}>MASCULINO</span>
          </div>
          <div
            className={`${s.avatarCard} ${avatarGen === 'f' ? s.avatarCardSel : ''}`}
            onClick={() => setAvatarGen('f')}
          >
            <AvatarFemale size={70} />
            <span className={`${s.avatarLabel} ${avatarGen === 'f' ? s.avatarCardSel : ''}`}>FEMININO</span>
          </div>
        </div>

        <button className={s.btnPrimary} onClick={() => setScreen('instrucoes')}>CONTINUAR →</button>
      </div>
    )
  }

  // ── Instrucoes ─────────────────────────────────────────────────────────────
  function renderInstrucoes() {
    const steps = [
      { icon: '🗺️', title: 'Explore 7 cenários', text: 'Passaremos por lugares como quarto, festa, escola, parque e mais. Em cada cenário há 4 situações para responder.' },
      { icon: '💬', title: 'Responda com honestidade', text: 'Cada situação tem duas opções. Escolha a que realmente representa você — não existe certo ou errado!' },
      { icon: '🏆', title: 'Descubra seu perfil MBTI', text: 'Após 28 respostas você recebe seu tipo de personalidade com descrição e sugestões de carreira.' },
      { icon: '⏱️', title: 'Tempo estimado: 5 minutos', text: 'Faça com calma e sem pressa. A autenticidade nas respostas é o que gera um resultado significativo.' },
    ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {renderStars()}
        <div style={{ padding: '1rem 1.25rem .75rem', borderBottom: '1px solid rgba(255,215,0,.15)', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#FFD700', marginBottom: 4 }}>COMO JOGAR</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', lineHeight: 1.5 }}>Leia antes de começar — leva menos de 1 minuto</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((step, i) => (
            <div key={i} className={s.instCard}>
              <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{step.icon}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', lineHeight: 1.5 }}>{step.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '.75rem 1.25rem 1.25rem', borderTop: '1px solid rgba(255,255,255,.06)', flexShrink: 0 }}>
          <button className={s.btnPrimary} onClick={() => setScreen('game')}>▶ COMEÇAR A JORNADA</button>
        </div>
      </div>
    )
  }

  // ── Game ───────────────────────────────────────────────────────────────────
  function renderGame() {
    const currentCena = CENAS[cena]
    const p = currentCena.pontos[qIdx]
    const totalQ = CENAS.reduce((acc, c) => acc + c.pontos.length, 0) // 28
    const progress = (answered / totalQ) * 100

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '1rem 1.25rem' }}>
        {renderStars()}

        {/* Transition overlay */}
        {transition && (
          <div className={s.transitionBanner}>
            <div className={s.transitionText}>
              PRÓXIMO CENÁRIO<br />
              <span style={{ color: '#FFD700' }}>{transition}</span>
            </div>
          </div>
        )}

        {/* Header: progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#FFD700' }}>
            DecifraMente
          </div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'rgba(255,255,255,.5)' }}>
            {answered} / {totalQ}
          </div>
        </div>

        {/* Progress bar */}
        <div className={s.progressBar} style={{ marginBottom: 12 }}>
          <div className={s.progressFill} style={{ width: `${progress}%` }} />
        </div>

        {/* Scene dots */}
        <div className={s.sceneDots} style={{ marginBottom: 14 }}>
          {CENAS.map((c, i) => (
            <div key={i} className={`${s.sceneDot} ${i < cena ? s.sceneDotDone : i === cena ? s.sceneDotActive : ''}`} />
          ))}
        </div>

        {/* Current scene name */}
        <div className={s.sceneLabel} style={{ marginBottom: 12 }} key={cena}>
          {currentCena.nome}
        </div>

        {/* Question card */}
        <div className={s.questionCard} key={questionKey} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className={s.ctxLabel}>{p.ctx}</div>
          <div className={s.questionText}>{p.m}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
            <button className={s.choiceBtn} onClick={() => choose('a')}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#FFD700', marginRight: 8 }}>A.</span>
              {p.a}
            </button>
            <button className={s.choiceBtn} onClick={() => choose('b')}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#FFD700', marginRight: 8 }}>B.</span>
              {p.b}
            </button>
          </div>
        </div>

        {/* Scene questions mini-progress */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
          {currentCena.pontos.map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i < qIdx ? 'rgba(255,215,0,.6)' : i === qIdx ? '#FFD700' : 'rgba(255,255,255,.15)',
              transition: 'background .3s',
            }} />
          ))}
        </div>
      </div>
    )
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  function renderResult() {
    const tipo = mbtiResult || getMBTI(SC)
    const v = TIPOS[tipo] ?? TIPOS['ENFP']
    const careers = v.cr.split(' · ')
    const dims = [
      { pair: ['E','I'], label: 'Extroversão / Introversão' },
      { pair: ['S','N'], label: 'Sensação / Intuição' },
      { pair: ['T','F'], label: 'Pensamento / Sentimento' },
      { pair: ['J','P'], label: 'Julgamento / Percepção' },
    ]

    return (
      <div className={s.resultRoot}>
        <div style={{ padding: '1.25rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: '#888', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>7 cenários · 28 escolhas</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#111', letterSpacing: .5 }}>SEU PERFIL MBTI</div>
          </div>

          {/* Type card */}
          <div className={s.resultCard} style={{ borderColor: v.c, color: v.c, background: `${v.c}14` }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: '.75rem' }}>
              <div style={{ flexShrink: 0, borderRadius: 10, overflow: 'hidden', background: '#f5f5f5', padding: 8 }}>
                {avatarGen === 'f' ? <AvatarFemale size={56} /> : <AvatarMale size={56} />}
              </div>
              <div>
                <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, letterSpacing: -1, color: v.c }}>{tipo}</div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .7, opacity: .65, marginBottom: '.3rem' }}>{v.n}</div>
                <div style={{ fontSize: 12, color: '#444', lineHeight: 1.6 }}>{v.d}</div>
              </div>
            </div>

            {/* Dimension scores */}
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, opacity: .5, margin: '.75rem 0 .4rem' }}>Distribuição das dimensões</div>
            {dims.map(({ pair, label }) => {
              const [a, b] = pair
              const total = SC[a] + SC[b]
              const pct = total > 0 ? Math.round((SC[tipo.includes(a) ? a : b] / total) * 100) : 50
              const winner = tipo.includes(a) ? a : b
              return (
                <div key={label} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555', marginBottom: 3 }}>
                    <span style={{ fontWeight: 600 }}>{winner} — {winner === a ? label.split(' / ')[0] : label.split(' / ')[1]}</span>
                    <span style={{ color: v.c, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, background: '#e8e8e8', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: v.c, borderRadius: 3, transition: 'width 1s ease-out' }} />
                  </div>
                </div>
              )
            })}

            {/* Careers */}
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, opacity: .5, margin: '.9rem 0 .4rem' }}>algumas carreiras sugeridas</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: '.8rem' }}>
              {careers.map(c => (
                <span key={c} className={s.careerChip} style={{ color: v.c, borderColor: `${v.c}55` }}>{c}</span>
              ))}
            </div>

            <div style={{ fontSize: 11, color: '#666', lineHeight: 1.6, padding: '9px 12px', background: 'rgba(0,0,0,.04)', borderRadius: 9 }}>
              💡 Estas são <strong>apenas algumas sugestões</strong> — existem muitas outras carreiras que combinam com o tipo <strong>{tipo}</strong>. Converse com seu orientador para explorar mais possibilidades!
            </div>
          </div>

          {/* Buttons */}
          <div className={s.resultBtnGroup}>
            <button className={s.btnLight} onClick={restart}>⚡ JOGAR DE NOVO</button>
            <button className={s.btnLight} onClick={restart}>🔄 REFAZER</button>
          </div>
          <button className={s.btnDark} onClick={handleDone}>✓ SALVAR E VOLTAR AO PAINEL</button>
          <div style={{ fontSize: 10, color: '#aaa', textAlign: 'center', marginTop: 10 }}>Resultado salvo automaticamente</div>
        </div>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className={s.root}>
      {screen === 'title'      && renderTitle()}
      {screen === 'avatar'     && renderAvatar()}
      {screen === 'instrucoes' && renderInstrucoes()}
      {screen === 'game'       && renderGame()}
      {screen === 'result'     && renderResult()}
    </div>
  )
}

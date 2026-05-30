'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './SuperQuem.module.css'

// ── Types ────────────────────────────────────────────────────────────────────
interface ValueOpt { txt: string; val: string }
interface NPC { nome: string; cargo: string; msg: string; cor: string; pergunta: string; optA: ValueOpt; optB: ValueOpt }
interface Zone { id: number; nome: string; valor: string; npcs: [NPC, NPC, NPC] }
type Screen = 'title' | 'instrucoes' | 'game' | 'result'
type NpcIdx = 0 | 1 | 2
type Choices = Record<string, 'A' | 'B'>  // key = `z${zoneId}_n${npcIdx}`

interface GameProps {
  patientId: string
  experienceId: number
  initialState?: Record<string, unknown>
  onStateChange: (state: Record<string, unknown>) => void
  onComplete: (scores: Record<string, unknown>, responses: Record<string, unknown>) => void
}

// ── Data ─────────────────────────────────────────────────────────────────────
const ALL_VALUES = [
  'Segurança', 'Criatividade', 'Altruísmo', 'Estética', 'Variedade',
  'Estímulo Intelectual', 'Prestígio', 'Equilíbrio', 'Desenvolvimento',
  'Gestão', 'Independência', 'Retorno Econômico', 'Relacionamentos', 'Progressão', 'Ambiente',
]

const MEDALS = ['🥇', '🥈', '🥉']

// NPC avatar emojis per zone (no images needed)
const ZONE_EMOJIS = ['🏢', '🎨', '🏥', '🖼️', '🚀', '📚', '🏛️', '🏠', '❤️', '🔬', '💼', '🤝', '🏦', '☕', '🌿']

const ZONES: Zone[] = [
  {
    id: 1, nome: 'Escritório Corporativo', valor: 'Segurança',
    npcs: [
      { nome: 'Ricardo', cargo: 'Gerente de RH', cor: '#4a90d9', msg: 'Você chegou até mim! Tenho uma proposta importante.', pergunta: 'Segurança ou Variedade — qual importa mais?', optA: { txt: 'Emprego fixo com rotina previsível e salário garantido', val: 'Segurança' }, optB: { txt: 'Projetos diferentes a cada 6 meses, instável mas sempre novo', val: 'Variedade' } },
      { nome: 'Carla', cargo: 'Analista Sênior', cor: '#4a90d9', msg: 'Aqui tomamos decisões difíceis todo dia. Uma pergunta...', pergunta: 'Segurança ou Independência — qual importa mais?', optA: { txt: 'Contrato CLT com todos os benefícios garantidos', val: 'Segurança' }, optB: { txt: 'Trabalho autônomo com total liberdade de horários', val: 'Independência' } },
      { nome: 'Dr. Marcos', cargo: 'Diretor', cor: '#4a90d9', msg: 'Parabéns por chegar aqui! Última questão...', pergunta: 'Segurança ou Progressão — qual importa mais?', optA: { txt: 'Permanecer num cargo estável por anos sem surpresas', val: 'Segurança' }, optB: { txt: 'Arriscar uma mudança para crescer mais rápido', val: 'Progressão' } },
    ],
  },
  {
    id: 2, nome: 'Estúdio Criativo', valor: 'Criatividade',
    npcs: [
      { nome: 'Beatriz', cargo: 'Designer', cor: '#e879a0', msg: 'Vim criar algo incrível hoje. Mas primeiro uma pergunta...', pergunta: 'Criatividade ou Retorno Econômico — qual importa mais?', optA: { txt: 'Trabalho criativo que realiza mas paga menos', val: 'Criatividade' }, optB: { txt: 'Trabalho comum com salário excelente e estabilidade', val: 'Retorno Econômico' } },
      { nome: 'Paulo', cargo: 'Diretor de Arte', cor: '#e879a0', msg: 'A criatividade tem um preço. Você pagaria?', pergunta: 'Criatividade ou Gestão — qual importa mais?', optA: { txt: 'Continuar criando com as próprias mãos no seu ritmo', val: 'Criatividade' }, optB: { txt: 'Liderar uma equipe de criadores e coordenar projetos', val: 'Gestão' } },
      { nome: 'Luna', cargo: 'Artista', cor: '#e879a0', msg: 'Última porta do estúdio! Responde com o coração...', pergunta: 'Criatividade ou Segurança — qual importa mais?', optA: { txt: 'Largar tudo para desenvolver seu projeto criativo próprio', val: 'Criatividade' }, optB: { txt: 'Manter o emprego seguro e criar só nas horas livres', val: 'Segurança' } },
    ],
  },
  {
    id: 3, nome: 'Hospital', valor: 'Altruísmo',
    npcs: [
      { nome: 'Dra. Ana', cargo: 'Médica', cor: '#22c55e', msg: 'Bem-vindo! Temos muito trabalho aqui. Uma pergunta rápida...', pergunta: 'Altruísmo ou Retorno Econômico — qual importa mais?', optA: { txt: 'Trabalhar numa ONG que transforma vidas com salário menor', val: 'Altruísmo' }, optB: { txt: 'Empresa privada com ótima remuneração e menos impacto social', val: 'Retorno Econômico' } },
      { nome: 'Enfermeira Bia', cargo: 'Enfermeira', cor: '#22c55e', msg: 'Cuidar de pessoas é vocação. Mas vocação paga as contas?', pergunta: 'Altruísmo ou Prestígio — qual importa mais?', optA: { txt: 'Ajudar comunidades vulneráveis anonimamente', val: 'Altruísmo' }, optB: { txt: 'Atuar em cargos de visibilidade e reconhecimento público', val: 'Prestígio' } },
      { nome: 'Dr. Felipe', cargo: 'Coordenador', cor: '#22c55e', msg: 'Final do corredor! Última escolha difícil...', pergunta: 'Altruísmo ou Equilíbrio — qual importa mais?', optA: { txt: 'Dedicar mais horas ajudando pessoas mesmo sacrificando tempo pessoal', val: 'Altruísmo' }, optB: { txt: 'Preservar seu equilíbrio e cuidar do seu bem-estar primeiro', val: 'Equilíbrio' } },
    ],
  },
  {
    id: 4, nome: 'Galeria de Arte', valor: 'Estética',
    npcs: [
      { nome: 'Monsieur Claude', cargo: 'Curador', cor: '#a855f7', msg: 'Ah, um visitante com bom gosto! Permita uma questão...', pergunta: 'Estética ou Estímulo Intelectual — qual importa mais?', optA: { txt: 'Trabalhar com beleza, forma e harmonia visual', val: 'Estética' }, optB: { txt: 'Resolver problemas complexos que exigem raciocínio profundo', val: 'Estímulo Intelectual' } },
      { nome: 'Valentina', cargo: 'Galerista', cor: '#a855f7', msg: 'A arte tem valor. Mas qual valor importa mais para você?', pergunta: 'Estética ou Retorno Econômico — qual importa mais?', optA: { txt: 'Ambiente de trabalho bonito e inspirador com salário menor', val: 'Estética' }, optB: { txt: 'Escritório simples com salário muito maior', val: 'Retorno Econômico' } },
      { nome: 'Eduardo', cargo: 'Crítico de Arte', cor: '#a855f7', msg: 'Última obra da galeria! Uma questão de valores...', pergunta: 'Estética ou Altruísmo — qual importa mais?', optA: { txt: 'Criar obras belas que encantam e emocionam poucos', val: 'Estética' }, optB: { txt: 'Projetos menos belos que beneficiam muitas pessoas', val: 'Altruísmo' } },
    ],
  },
  {
    id: 5, nome: 'Startup Caótica', valor: 'Variedade',
    npcs: [
      { nome: 'Diego', cargo: 'CEO', cor: '#f97316', msg: 'Aqui mudamos de ideia todo dia! Você toparia?', pergunta: 'Variedade ou Desenvolvimento — qual importa mais?', optA: { txt: 'Fazer coisas diferentes todo dia numa empresa dinâmica', val: 'Variedade' }, optB: { txt: 'Tornar-se especialista profundo numa única área', val: 'Desenvolvimento' } },
      { nome: 'Lara', cargo: 'Product Manager', cor: '#f97316', msg: 'Na startup cada dia é uma aventura. Isso te atrai?', pergunta: 'Variedade ou Segurança — qual importa mais?', optA: { txt: 'Ambiente imprevisível com novidades e desafios constantes', val: 'Variedade' }, optB: { txt: 'Rotina estável e previsível com entregas programadas', val: 'Segurança' } },
      { nome: 'Nico', cargo: 'Lead Developer', cor: '#f97316', msg: 'Última missão da startup! Escolha com coragem...', pergunta: 'Variedade ou Relacionamentos — qual importa mais?', optA: { txt: 'Trocar de equipe e projeto frequentemente para não entediar', val: 'Variedade' }, optB: { txt: 'Construir vínculos profundos com as mesmas pessoas ao longo do tempo', val: 'Relacionamentos' } },
    ],
  },
  {
    id: 6, nome: 'Biblioteca', valor: 'Estímulo Intelectual',
    npcs: [
      { nome: 'Professora Vera', cargo: 'Bibliotecária', cor: '#06b6d4', msg: 'Pode responder baixinho uma pergunta...', pergunta: 'Estímulo Intelectual ou Retorno Econômico — qual importa mais?', optA: { txt: 'Trabalho que desafia seu intelecto constantemente', val: 'Estímulo Intelectual' }, optB: { txt: 'Trabalho simples com excelente remuneração financeira', val: 'Retorno Econômico' } },
      { nome: 'Doutor Henrique', cargo: 'Pesquisador', cor: '#06b6d4', msg: 'O conhecimento é o maior tesouro. Mas e a companhia?', pergunta: 'Estímulo Intelectual ou Relacionamentos — qual importa mais?', optA: { txt: 'Pesquisa solitária de alto nível intelectual', val: 'Estímulo Intelectual' }, optB: { txt: 'Trabalho colaborativo com pessoas mesmo que menos complexo', val: 'Relacionamentos' } },
      { nome: 'Isabela', cargo: 'Analista de Dados', cor: '#06b6d4', msg: 'Fundo da biblioteca! Última questão profunda...', pergunta: 'Estímulo Intelectual ou Progressão — qual importa mais?', optA: { txt: 'Aprofundar conhecimento sem se preocupar com hierarquia', val: 'Estímulo Intelectual' }, optB: { txt: 'Subir na carreira mesmo que pare de aprender tanto', val: 'Progressão' } },
    ],
  },
  {
    id: 7, nome: 'Sede Corporativa', valor: 'Prestígio',
    npcs: [
      { nome: 'Diretora Sofia', cargo: 'Diretora Executiva', cor: '#FFD700', msg: 'Para chegar aqui você já provou seu valor. Mas qual valor?', pergunta: 'Prestígio ou Equilíbrio — qual importa mais?', optA: { txt: 'Cargo de destaque e reconhecimento público amplo', val: 'Prestígio' }, optB: { txt: 'Trabalho discreto com muito tempo para vida pessoal', val: 'Equilíbrio' } },
      { nome: 'Conselheiro Bruno', cargo: 'Conselho de Administração', cor: '#FFD700', msg: 'O poder tem um custo. Você está disposto a pagar?', pergunta: 'Prestígio ou Altruísmo — qual importa mais?', optA: { txt: 'Ser referência e admirado na sua área profissional', val: 'Prestígio' }, optB: { txt: 'Trabalhar anonimamente por uma causa que importa', val: 'Altruísmo' } },
      { nome: 'CEO Alexandre', cargo: 'Presidente', cor: '#FFD700', msg: 'Último andar! A pergunta mais importante de todas...', pergunta: 'Prestígio ou Independência — qual importa mais?', optA: { txt: 'Cargo de alto prestígio numa grande corporação', val: 'Prestígio' }, optB: { txt: 'Negócio próprio sem reconhecimento mas com total autonomia', val: 'Independência' } },
    ],
  },
  {
    id: 8, nome: 'Home Office', valor: 'Equilíbrio',
    npcs: [
      { nome: 'Rogério', cargo: 'Consultor Remoto', cor: '#84cc16', msg: 'Trabalhando de casa é ótimo! Mas tem seus dilemas...', pergunta: 'Equilíbrio ou Progressão — qual importa mais?', optA: { txt: 'Horário flexível e vida pessoal preservada', val: 'Equilíbrio' }, optB: { txt: 'Jornada intensa que acelera sua carreira rapidamente', val: 'Progressão' } },
      { nome: 'Marina', cargo: 'Freelancer', cor: '#84cc16', msg: 'A liberdade tem um preço. Você pagaria?', pergunta: 'Equilíbrio ou Retorno Econômico — qual importa mais?', optA: { txt: 'Salário menor mas com horários humanos e vida equilibrada', val: 'Equilíbrio' }, optB: { txt: 'Salário alto com pressão constante e horas extras', val: 'Retorno Econômico' } },
      { nome: 'Thomas', cargo: 'Gerente Remoto', cor: '#84cc16', msg: 'Última parada do home office! Escolha com calma...', pergunta: 'Equilíbrio ou Gestão — qual importa mais?', optA: { txt: 'Preservar seu tempo pessoal e energia mental', val: 'Equilíbrio' }, optB: { txt: 'Assumir liderança que exige presença e disponibilidade constante', val: 'Gestão' } },
    ],
  },
  {
    id: 9, nome: 'ONG Comunitária', valor: 'Relacionamentos',
    npcs: [
      { nome: 'Voluntária Cris', cargo: 'Coordenadora', cor: '#f43f5e', msg: 'Que bom que veio nos ajudar! Uma pergunta antes...', pergunta: 'Relacionamentos ou Independência — qual importa mais?', optA: { txt: 'Trabalhar sempre em equipe construindo laços e conexões', val: 'Relacionamentos' }, optB: { txt: 'Ter autonomia total para trabalhar do seu jeito e ritmo', val: 'Independência' } },
      { nome: 'Seu Zé', cargo: 'Fundador', cor: '#f43f5e', msg: 'Quarenta anos ajudando gente. A pergunta que sempre faço...', pergunta: 'Relacionamentos ou Desenvolvimento — qual importa mais?', optA: { txt: 'Investir energia nas pessoas ao redor e nos vínculos', val: 'Relacionamentos' }, optB: { txt: 'Focar no próprio crescimento e aprendizado contínuo', val: 'Desenvolvimento' } },
      { nome: 'Professora Ruth', cargo: 'Educadora Social', cor: '#f43f5e', msg: 'Fundo da comunidade! Última reflexão...', pergunta: 'Altruísmo ou Desenvolvimento — qual importa mais?', optA: { txt: 'Dedicar sua carreira a servir e ajudar os outros', val: 'Altruísmo' }, optB: { txt: 'Investir continuamente no próprio crescimento profissional', val: 'Desenvolvimento' } },
    ],
  },
  {
    id: 10, nome: 'Laboratório', valor: 'Desenvolvimento',
    npcs: [
      { nome: 'Dr. Einstein Jr.', cargo: 'Pesquisador Sênior', cor: '#3b82f6', msg: 'Descoberta incrível! Mas antes uma questão científica...', pergunta: 'Desenvolvimento ou Ambiente — qual importa mais?', optA: { txt: 'Aprender muito num ambiente desconfortável ou precário', val: 'Desenvolvimento' }, optB: { txt: 'Crescer pouco num lugar agradável e bem estruturado', val: 'Ambiente' } },
      { nome: 'Natasha', cargo: 'Cientista de Dados', cor: '#3b82f6', msg: 'Os dados não mentem. E você também não deve mentir...', pergunta: 'Desenvolvimento ou Prestígio — qual importa mais?', optA: { txt: 'Crescer continuamente em silêncio sem reconhecimento', val: 'Desenvolvimento' }, optB: { txt: 'Parar de aprender tanto mas ganhar status e visibilidade', val: 'Prestígio' } },
      { nome: 'Professor Yuki', cargo: 'Diretor de P&D', cor: '#3b82f6', msg: 'Último experimento! Escolha com rigor científico...', pergunta: 'Desenvolvimento ou Segurança — qual importa mais?', optA: { txt: 'Buscar desafios que fazem crescer mesmo com risco', val: 'Desenvolvimento' }, optB: { txt: 'Manter-se no que já domina com conforto e segurança', val: 'Segurança' } },
    ],
  },
  {
    id: 11, nome: 'Sala Executiva', valor: 'Gestão',
    npcs: [
      { nome: 'Presidente Mário', cargo: 'Presidente do Conselho', cor: '#8b5cf6', msg: 'Poucas pessoas chegam aqui. Merece uma boa pergunta...', pergunta: 'Gestão ou Criatividade — qual importa mais?', optA: { txt: 'Coordenar e liderar outras pessoas e equipes', val: 'Gestão' }, optB: { txt: 'Ter liberdade para criar e executar com as próprias mãos', val: 'Criatividade' } },
      { nome: 'VP Helena', cargo: 'Vice-Presidente', cor: '#8b5cf6', msg: 'Liderar é servir. Mas serve a quê exatamente?', pergunta: 'Gestão ou Ambiente — qual importa mais?', optA: { txt: 'Liderar numa empresa exigente mesmo com ambiente tenso', val: 'Gestão' }, optB: { txt: 'Trabalhar num lugar agradável sem responsabilidade de liderança', val: 'Ambiente' } },
      { nome: 'CFO Roberto', cargo: 'Diretor Financeiro', cor: '#8b5cf6', msg: 'Mesa de reunião vazia, só você e eu. Última escolha...', pergunta: 'Gestão ou Progressão — qual importa mais?', optA: { txt: 'Liderar bem a equipe atual sem necessariamente subir de cargo', val: 'Gestão' }, optB: { txt: 'Abrir mão da liderança para avançar mais rápido na hierarquia', val: 'Progressão' } },
    ],
  },
  {
    id: 12, nome: 'Coworking', valor: 'Independência',
    npcs: [
      { nome: 'Freelancer Kim', cargo: 'Designer Autônomo', cor: '#ec4899', msg: 'Aqui cada um faz o que quer! Você realmente quer isso?', pergunta: 'Independência ou Ambiente — qual importa mais?', optA: { txt: 'Total autonomia num espaço improvisado sem estrutura', val: 'Independência' }, optB: { txt: 'Regras e hierarquia num ambiente estruturado e confortável', val: 'Ambiente' } },
      { nome: 'Empreendedora Jade', cargo: 'Fundadora de Startup', cor: '#ec4899', msg: 'Ser dono do próprio nariz tem um preço. Pagaria?', pergunta: 'Independência ou Progressão — qual importa mais?', optA: { txt: 'Trabalhar por conta própria sem hierarquia nem chefe', val: 'Independência' }, optB: { txt: 'Seguir estrutura corporativa que acelera sua ascensão', val: 'Progressão' } },
      { nome: 'Nômade Digital Sam', cargo: 'Consultor Global', cor: '#ec4899', msg: 'Última mesa do coworking! Pergunta de ouro...', pergunta: 'Independência ou Relacionamentos — qual importa mais?', optA: { txt: 'Trabalhar sozinho com total liberdade de decisão', val: 'Independência' }, optB: { txt: 'Dentro de uma equipe unida onde há interdependência', val: 'Relacionamentos' } },
    ],
  },
  {
    id: 13, nome: 'Banco', valor: 'Retorno Econômico',
    npcs: [
      { nome: 'Gerente Osvaldo', cargo: 'Gerente Geral', cor: '#22c55e', msg: 'O dinheiro não mente. Mas o que ele compra para você?', pergunta: 'Retorno Econômico ou Estética — qual importa mais?', optA: { txt: 'Salário excelente num ambiente sem inspiração visual', val: 'Retorno Econômico' }, optB: { txt: 'Remuneração menor num espaço bonito e criativo', val: 'Estética' } },
      { nome: 'Analista Pris', cargo: 'Especialista de Investimentos', cor: '#22c55e', msg: 'Cada escolha tem um custo de oportunidade. E a sua?', pergunta: 'Retorno Econômico ou Variedade — qual importa mais?', optA: { txt: 'Tarefa repetitiva bem remunerada com previsibilidade', val: 'Retorno Econômico' }, optB: { txt: 'Trabalho variado e dinâmico com salário mais modesto', val: 'Variedade' } },
      { nome: 'Cofre', cargo: 'Guardião do Tesouro', cor: '#22c55e', msg: 'Chegou até o cofre! A pergunta mais valiosa de todas...', pergunta: 'Retorno Econômico ou Estímulo Intelectual — qual importa mais?', optA: { txt: 'Trabalho lucrativo mas intelectualmente pouco estimulante', val: 'Retorno Econômico' }, optB: { txt: 'Desafiador e estimulante intelectualmente com salário menor', val: 'Estímulo Intelectual' } },
    ],
  },
  {
    id: 14, nome: 'Café', valor: 'Relacionamentos',
    npcs: [
      { nome: 'Barista Mel', cargo: 'Barista e Proprietária', cor: '#f59e0b', msg: 'Um café quentinho e uma pergunta direta!', pergunta: 'Relacionamentos ou Prestígio — qual importa mais?', optA: { txt: 'Trabalho com contato humano profundo e vínculos reais', val: 'Relacionamentos' }, optB: { txt: 'Cargo de destaque com pouco contato humano genuíno', val: 'Prestígio' } },
      { nome: 'Cliente Frequent', cargo: 'Escritor', cor: '#f59e0b', msg: 'Toda boa história começa aqui. E a sua história?', pergunta: 'Relacionamentos ou Criatividade — qual importa mais?', optA: { txt: 'Trabalho centrado em pessoas conexões e colaboração', val: 'Relacionamentos' }, optB: { txt: 'Trabalho solitário de criação expressão e autoria', val: 'Criatividade' } },
      { nome: 'Mesa do Canto', cargo: 'Espaço Reflexivo', cor: '#f59e0b', msg: 'Última xícara! Pergunta para levar para casa...', pergunta: 'Relacionamentos ou Equilíbrio — qual importa mais?', optA: { txt: 'Investir muito nas pessoas ao redor mesmo gastando energia', val: 'Relacionamentos' }, optB: { txt: 'Preservar-se mantendo distância saudável das demandas alheias', val: 'Equilíbrio' } },
    ],
  },
  {
    id: 15, nome: 'Escritório Sustentável', valor: 'Ambiente',
    npcs: [
      { nome: 'Eco-Gestor Tito', cargo: 'Gestor de Sustentabilidade', cor: '#10b981', msg: 'Bem-vindo ao futuro do trabalho! Uma pergunta verde...', pergunta: 'Ambiente ou Progressão — qual importa mais?', optA: { txt: 'Empresa com ambiente incrível onde você cresce lentamente', val: 'Ambiente' }, optB: { txt: 'Empresa dura e exigente onde você cresce muito rápido', val: 'Progressão' } },
      { nome: 'Arquiteta Clara', cargo: 'Arquiteta Biofílica', cor: '#10b981', msg: 'O ambiente importa. Mas quanto importa para você?', pergunta: 'Ambiente ou Variedade — qual importa mais?', optA: { txt: 'Espaço de trabalho perfeito com tarefas mais repetitivas', val: 'Ambiente' }, optB: { txt: 'Ambiente simples mas com grande diversidade de projetos', val: 'Variedade' } },
      { nome: 'Ativista Rafa', cargo: 'Diretor de Impacto', cor: '#10b981', msg: 'Última árvore do jardim! Escolha que plante algo no futuro...', pergunta: 'Ambiente ou Altruísmo — qual importa mais?', optA: { txt: 'Trabalhar num lugar bonito e estruturado para si mesmo', val: 'Ambiente' }, optB: { txt: 'Num espaço precário mas com grande impacto social real', val: 'Altruísmo' } },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeDefaultScores(): Record<string, number> {
  return Object.fromEntries(ALL_VALUES.map(v => [v, 0]))
}

function computeResults(scores: Record<string, number>) {
  return ALL_VALUES
    .map(v => ({ nome: v, pts: scores[v] ?? 0 }))
    .sort((a, b) => b.pts - a.pts)
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SuperQuem({ initialState, onStateChange, onComplete }: GameProps) {
  const [screen, setScreen] = useState<Screen>(() => {
    const s = initialState?.screen as Screen | undefined
    return s === 'game' || s === 'result' ? s : 'title'
  })
  const [zoneIdx, setZoneIdx] = useState<number>(
    typeof initialState?.zoneIdx === 'number' ? initialState.zoneIdx : 0
  )
  const [npcIdx, setNpcIdx] = useState<NpcIdx>(
    typeof initialState?.npcIdx === 'number' ? (initialState.npcIdx as NpcIdx) : 0
  )
  const [scores, setScores] = useState<Record<string, number>>(
    (initialState?.scores as Record<string, number> | undefined) ?? makeDefaultScores()
  )
  const [choices, setChoices] = useState<Choices>(
    (initialState?.choices as Choices | undefined) ?? {}
  )
  const [transition, setTransition] = useState<{ nome: string; valor: string } | null>(null)
  const [resultRanking, setResultRanking] = useState<{ nome: string; pts: number }[] | null>(
    (initialState?.resultRanking as { nome: string; pts: number }[] | null | undefined) ?? null
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
  }, [])

  // ── Auto-save ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen === 'title' || screen === 'instrucoes') return
    onStateChangeRef.current({ screen, zoneIdx, npcIdx, scores, choices, resultRanking })
  }, [screen, zoneIdx, npcIdx, scores, choices, resultRanking])

  // ── Bar animation on result ───────────────────────────────────────────────
  useEffect(() => {
    if (screen === 'result') {
      setBarsReady(false)
      const t = setTimeout(() => setBarsReady(true), 60)
      return () => clearTimeout(t)
    }
  }, [screen])

  // ── Derived state ────────────────────────────────────────────────────────
  const zone = ZONES[zoneIdx]
  const npc = zone.npcs[npcIdx]
  const choiceKey = `z${zone.id}_n${npcIdx}`
  const selectedChoice = choices[choiceKey]
  const totalAnswered = Object.keys(choices).length
  const totalQuestions = ZONES.length * 3
  const progressPct = Math.round((totalAnswered / totalQuestions) * 100)

  // ── Select an option ─────────────────────────────────────────────────────
  const selectOpt = useCallback(
    (side: 'A' | 'B') => {
      const chosen = side === 'A' ? npc.optA : npc.optB
      const newScores = { ...scores, [chosen.val]: (scores[chosen.val] ?? 0) + 1 }
      const newChoices: Choices = { ...choices, [choiceKey]: side }
      setScores(newScores)
      setChoices(newChoices)

      addTimer(() => {
        if (npcIdx < 2) {
          setNpcIdx(((npcIdx + 1) as NpcIdx))
        } else if (zoneIdx < ZONES.length - 1) {
          const nextZone = ZONES[zoneIdx + 1]
          setTransition({ nome: `Fase ${nextZone.id} — ${nextZone.nome}`, valor: `Valor: ${nextZone.valor} · 3 personagens para encontrar` })
          addTimer(() => {
            setTransition(null)
            setZoneIdx(zoneIdx + 1)
            setNpcIdx(0)
          }, 1500)
        } else {
          const ranking = computeResults(newScores)
          setResultRanking(ranking)
          setScreen('result')
        }
      }, 700)
    },
    [npc, scores, choices, choiceKey, npcIdx, zoneIdx, addTimer]
  )

  const goBack = useCallback(() => {
    if (npcIdx > 0) {
      setNpcIdx(((npcIdx - 1) as NpcIdx))
    } else if (zoneIdx > 0) {
      setZoneIdx(zoneIdx - 1)
      setNpcIdx(2)
    }
  }, [npcIdx, zoneIdx])

  const handleDone = useCallback(() => {
    if (!resultRanking) return
    const scoresOut: Record<string, number> = {}
    resultRanking.forEach(v => { scoresOut[v.nome] = v.pts })
    onCompleteRef.current({ ranking: resultRanking, scores: scoresOut }, choices)
  }, [resultRanking, choices])

  // ── Title screen ─────────────────────────────────────────────────────────
  if (screen === 'title') {
    return (
      <div className={styles.root}>
        <div className={styles.heroSection}>
          <div className={styles.heroLogo}>★ SUPER QUEM ★</div>
          <div className={styles.heroSub}>Valores Profissionais — Donald Super</div>
          <div className={styles.introBox}>
            Você é <strong>Quem</strong>. Afinal, Quem é Você?! Descubra-se através dos seus verdadeiros valores explorando cenários profissionais!<br /><br />
            Percorra <strong>15 fases</strong> diferentes e encontre os <strong>3 personagens</strong> em cada cenário.<br />
            Cada encontro traz um <strong>dilema de valores</strong> — escolha com honestidade!
          </div>
          <button className={styles.btnStart} onClick={() => setScreen('instrucoes')}>
            ▶ INICIAR AVENTURA
          </button>
        </div>
      </div>
    )
  }

  // ── Instructions ─────────────────────────────────────────────────────────
  if (screen === 'instrucoes') {
    return (
      <div className={styles.root}>
        <div className={styles.page}>
          <h2 className={styles.sectionTitle}>Como Jogar</h2>

          <div className={styles.instrCard}>
            <span className={styles.instrIcon}>🎯</span>
            <div>
              <div className={styles.instrTitle}>Objetivo</div>
              <div className={styles.instrText}>
                Explore 15 ambientes profissionais e converse com 3 personagens em cada um. Ao todo são 45 dilemas de valores para você refletir.
              </div>
            </div>
          </div>

          <div className={styles.instrCard}>
            <span className={styles.instrIcon}>⚖️</span>
            <div>
              <div className={styles.instrTitle}>Os Dilemas</div>
              <div className={styles.instrText}>
                Cada personagem apresenta duas opções opostas. Escolha o que realmente importa mais para você — não existe resposta certa.
              </div>
            </div>
          </div>

          <div className={styles.instrCard}>
            <span className={styles.instrIcon}>📊</span>
            <div>
              <div className={styles.instrTitle}>Resultado</div>
              <div className={styles.instrText}>
                Ao final, seus 15 valores profissionais (teoria de Donald Super) serão classificados por relevância pessoal.
              </div>
            </div>
          </div>

          <button
            className={styles.btnStart}
            style={{ marginTop: '1.5rem', padding: '13px 36px', fontSize: 14 }}
            onClick={() => setScreen('game')}
          >
            ▶ COMEÇAR FASE 1
          </button>
        </div>
      </div>
    )
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (screen === 'result' && resultRanking) {
    const maxPts = resultRanking[0]?.pts || 1
    return (
      <div className={styles.root}>
        <div className={styles.page}>
          <div className={styles.finishHero}>
            <div className={styles.finishTrophy}>🏆</div>
            <div className={styles.finishTitle}>AVENTURA CONCLUÍDA!</div>
            <div className={styles.finishSub}>Seus valores profissionais foram revelados</div>
          </div>

          {resultRanking.map((v, i) => {
            const pct = maxPts > 0 ? Math.round((v.pts / maxPts) * 100) : 0
            return (
              <div key={v.nome} className={styles.valItem}>
                <div className={styles.valPos}>{MEDALS[i] ?? '★'}</div>
                <div className={styles.valInfo}>
                  <div className={styles.valNome}>{v.nome}</div>
                  <div className={styles.valBarWrap}>
                    <div className={styles.valBarTrack}>
                      <div
                        className={styles.valBarFill}
                        style={{ width: barsReady ? `${pct}%` : '0%' }}
                      />
                    </div>
                    <span className={styles.valScore}>{v.pts} pts</span>
                  </div>
                </div>
              </div>
            )
          })}

          <button className={styles.btnDark} onClick={handleDone}>
            SALVAR E VOLTAR AO PAINEL
          </button>
        </div>
      </div>
    )
  }

  // ── Game screen ───────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>
      {/* Zone transition overlay */}
      {transition && (
        <div className={styles.transitionOverlay}>
          <div className={styles.transitionZone}>{transition.nome}</div>
          <div className={styles.transitionSub}>{transition.valor}</div>
          <div className={styles.transitionBar}>
            <div className={styles.transitionBarFill} />
          </div>
        </div>
      )}

      {/* Progress HUD */}
      <div className={styles.progressBar}>
        <span className={styles.progressLabel}>Fase {zone.id}</span>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
        <span className={styles.progressCount}>{totalAnswered} / {totalQuestions}</span>
      </div>

      <div className={styles.page}>
        {/* Zone badge */}
        <div className={styles.zoneBadge}>
          {ZONE_EMOJIS[zoneIdx]} Fase {zone.id} — {zone.nome}
        </div>

        {/* NPC dialog card */}
        <div className={styles.dialogCard}>
          <div className={styles.dialogHead}>
            <div className={styles.npcAvatar} style={{ borderColor: npc.cor }}>
              {ZONE_EMOJIS[zoneIdx]}
            </div>
            <div>
              <div className={styles.npcName} style={{ color: npc.cor }}>{npc.nome}</div>
              <div className={styles.npcCargo}>{npc.cargo}</div>
            </div>
          </div>

          <div className={styles.dialogBody}>
            <div className={styles.dialogMsg}>{npc.msg}</div>
            <div className={styles.dialogQuestion}>{npc.pergunta}</div>

            <div className={styles.opts}>
              {(['A', 'B'] as const).map(side => {
                const opt = side === 'A' ? npc.optA : npc.optB
                return (
                  <button
                    key={side}
                    className={`${styles.optBtn}${selectedChoice === side ? ` ${styles.optBtnSel}` : ''}`}
                    onClick={() => selectOpt(side)}
                  >
                    <span className={styles.optLabel}>Opção {side}</span>
                    {opt.txt}
                  </button>
                )
              })}
            </div>

            <div className={styles.navRow}>
              <button
                className={styles.btnBack}
                onClick={goBack}
                style={{ visibility: zoneIdx === 0 && npcIdx === 0 ? 'hidden' : 'visible' }}
              >
                ← Voltar
              </button>
              <span className={selectedChoice ? styles.hintOk : styles.hint}>
                {selectedChoice ? '✓ Escolha registrada' : 'Escolha uma opção'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

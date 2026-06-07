'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { GameProps } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SceneOpt {
  label: string
  dim: string
  pts?: number
  lose?: string
  losePts?: number
}

interface Scene {
  id: string
  block: string
  ill: string
  title: string
  text: string
  opts: SceneOpt[]
}

interface Scores {
  R: number; I: number; A: number; S: number; E: number; C: number
  EI_E: number; EI_I: number; SN_S: number; SN_N: number
  TF_T: number; TF_F: number; JP_J: number; JP_P: number
  Seg: number; Cri: number; Alt: number; Est: number; Var: number
  Est_I: number; Pre: number; Equ: number; Des: number; Ges: number
  Ind: number; Ret: number; Rel: number; Pro: number; Amb: number
  Adm: number; Bio: number; Sau: number; Hum: number; Com: number
  Art: number; Exa: number; Eng: number; Mil: number
  _AdmN: number; _BioN: number; _SauN: number; _HumN: number
  _ComN: number; _ArtN: number; _ExaN: number; _EngN: number; _MilN: number
  [k: string]: number
}

interface GameState {
  phase: 'cover' | 'scenes' | 'finish'
  scene: number
  choices: Record<string, string>
  scores: Scores
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const HOLLAND: Scene[] = [
  {id:'r01',block:'Bloco 1 · Holland',ill:'city',title:'Tempo livre para aprender',text:'No seu tempo livre, o que você prefere fazer para aprender algo novo?',opts:[{label:'Montar, consertar ou construir algo com as mãos',dim:'R',pts:2,lose:'I',losePts:0.2},{label:'Pesquisar, ler ou resolver um problema teórico',dim:'I',pts:2,lose:'R',losePts:0.2}]},
  {id:'r02',block:'Bloco 1 · Holland',ill:'lab',title:'Diante de um problema concreto',text:'Quando você se depara com um problema concreto, o que faz primeiro?',opts:[{label:'Analiso as causas, pesquiso, entendo o fundo da questão',dim:'I',pts:2,lose:'R',losePts:0.2},{label:'Coloco a mão na massa e vou resolvendo na prática',dim:'R',pts:2,lose:'I',losePts:0.2}]},
  {id:'r03',block:'Bloco 1 · Holland',ill:'workshop',title:'Iniciar um projeto pessoal do zero',text:'Ao iniciar um projeto pessoal do zero, o que é mais importante para você?',opts:[{label:'Que o resultado seja funcional e bem feito tecnicamente',dim:'R',pts:2,lose:'A',losePts:0.2},{label:'Que o resultado seja original e esteticamente marcante',dim:'A',pts:2,lose:'R',losePts:0.2}]},
  {id:'r04',block:'Bloco 1 · Holland',ill:'stage',title:'Ao desenvolver algo do zero',text:'O que te motiva mais ao desenvolver algo do zero?',opts:[{label:'A liberdade de criar sem seguir um padrão definido',dim:'A',pts:2,lose:'R',losePts:0.2},{label:'A precisão e qualidade técnica do que estou fazendo',dim:'R',pts:2,lose:'A',losePts:0.2}]},
  {id:'r05',block:'Bloco 1 · Holland',ill:'forest',title:'Em uma atividade',text:'Em uma atividade, o que você prefere?',opts:[{label:'Trabalhar com ferramentas, máquinas ou na natureza',dim:'R',pts:2,lose:'S',losePts:0.2},{label:'Estar junto de pessoas, ajudando e interagindo',dim:'S',pts:2,lose:'R',losePts:0.2}]},
  {id:'r06',block:'Bloco 1 · Holland',ill:'city',title:'No trabalho, me sinto mais motivado quando',text:'No trabalho, o que mais te motiva?',opts:[{label:'Estou apoiando, orientando ou ajudando alguém diretamente',dim:'S',pts:2,lose:'R',losePts:0.2},{label:'Estou realizando algo concreto com minhas próprias mãos',dim:'R',pts:2,lose:'S',losePts:0.2}]},
  {id:'r07',block:'Bloco 2 · Holland',ill:'market',title:'Em um projeto coletivo, qual papel prefere?',text:'Em um projeto coletivo, qual papel combina mais com você?',opts:[{label:'Executor: faço o trabalho técnico com qualidade',dim:'R',pts:2,lose:'E',losePts:0.2},{label:'Líder: coordeno, persuado e encaminho decisões',dim:'E',pts:2,lose:'R',losePts:0.2}]},
  {id:'r08',block:'Bloco 2 · Holland',ill:'mountain',title:'A ideia está pronta. O que prefere?',text:'A ideia está pronta. O que você prefere fazer?',opts:[{label:'Apresentar, vender e convencer as pessoas',dim:'E',pts:2,lose:'R',losePts:0.2},{label:'Executar, construir e entregar o resultado',dim:'R',pts:2,lose:'E',losePts:0.2}]},
  {id:'r09',block:'Bloco 2 · Holland',ill:'workshop',title:'Ao iniciar uma tarefa nova, prefere',text:'Ao iniciar uma tarefa nova, o que você prefere?',opts:[{label:'Improvisar e adaptar conforme vou avançando',dim:'R',pts:2,lose:'C',losePts:0.2},{label:'Seguir um plano claro com etapas bem definidas',dim:'C',pts:2,lose:'R',losePts:0.2}]},
  {id:'r10',block:'Bloco 2 · Holland',ill:'city',title:'Me sinto mais confortável em',text:'Em qual tipo de ambiente você se sente mais confortável?',opts:[{label:'Ambientes organizados, com regras e processos claros',dim:'C',pts:2,lose:'R',losePts:0.2},{label:'Ambientes práticos, onde posso agir de forma direta',dim:'R',pts:2,lose:'C',losePts:0.2}]},
  {id:'r11',block:'Bloco 2 · Holland',ill:'lab',title:'Ao explorar um tema novo, prefere',text:'Ao explorar um tema novo, o que te prende mais?',opts:[{label:'Investigar dados, hipóteses e explicações racionais',dim:'I',pts:2,lose:'A',losePts:0.2},{label:'Criar interpretações, imagens ou expressões pessoais',dim:'A',pts:2,lose:'I',losePts:0.2}]},
  {id:'r12',block:'Bloco 2 · Holland',ill:'stage',title:'Diante de uma questão aberta, tende a',text:'Diante de uma questão aberta, o que você tende a fazer?',opts:[{label:'Criar algo original — uma forma, um conceito, uma ideia',dim:'A',pts:2,lose:'I',losePts:0.2},{label:'Buscar dados e evidências para entender melhor',dim:'I',pts:2,lose:'A',losePts:0.2}]},
  {id:'r13',block:'Bloco 2 · Holland',ill:'ocean',title:'Em uma atividade, prefere',text:'Em uma atividade, o que você prefere?',opts:[{label:'Trabalhar com ideias, problemas e análises complexas',dim:'I',pts:2,lose:'S',losePts:0.2},{label:'Trabalhar com pessoas, relações e emoções humanas',dim:'S',pts:2,lose:'I',losePts:0.2}]},
  {id:'r14',block:'Bloco 2 · Holland',ill:'city',title:'Me envolvo mais quando',text:'Em que situação você se envolve mais?',opts:[{label:'Estou contribuindo para o bem-estar de alguém',dim:'S',pts:2,lose:'I',losePts:0.2},{label:'Estou descobrindo algo novo ou resolvendo um problema intelectual',dim:'I',pts:2,lose:'S',losePts:0.2}]},
  {id:'r15',block:'Bloco 2 · Holland',ill:'mountain',title:'Em um desafio importante, prefere',text:'Em um desafio importante, o que você prefere?',opts:[{label:'Pensar profundamente antes de agir, analisar todas as variáveis',dim:'I',pts:2,lose:'E',losePts:0.2},{label:'Agir rapidamente, testar, errar e aprender na prática',dim:'E',pts:2,lose:'I',losePts:0.2}]},
  {id:'r16',block:'Bloco 3 · Holland',ill:'market',title:'Diante de uma nova ideia, tende a',text:'Diante de uma nova ideia, o que você tende a fazer?',opts:[{label:'Apresentar logo para ver a reação das pessoas',dim:'E',pts:2,lose:'I',losePts:0.2},{label:'Pesquisar e entender bem antes de compartilhar',dim:'I',pts:2,lose:'E',losePts:0.2}]},
  {id:'r17',block:'Bloco 3 · Holland',ill:'lab',title:'Ao lidar com muitas informações, prefere',text:'Ao lidar com muitas informações, o que você prefere?',opts:[{label:'Explorar conexões inesperadas, mesmo que demore',dim:'I',pts:2,lose:'C',losePts:0.2},{label:'Organizar, categorizar e seguir uma sequência lógica',dim:'C',pts:2,lose:'I',losePts:0.2}]},
  {id:'r18',block:'Bloco 3 · Holland',ill:'workshop',title:'Me sinto mais produtivo quando',text:'Em que condição você se sente mais produtivo?',opts:[{label:'Tenho um método claro e sigo passo a passo',dim:'C',pts:2,lose:'I',losePts:0.2},{label:'Posso investigar livremente e mudar de direção',dim:'I',pts:2,lose:'C',losePts:0.2}]},
  {id:'r19',block:'Bloco 3 · Holland',ill:'stage',title:'Em um projeto em grupo, como contribui mais?',text:'Em um projeto em grupo, como você contribui mais?',opts:[{label:'Com criatividade: trago ideias únicas e soluções originais',dim:'A',pts:2,lose:'S',losePts:0.2},{label:'Com conexão: facilito o diálogo e cuido das relações',dim:'S',pts:2,lose:'A',losePts:0.2}]},
  {id:'r20',block:'Bloco 3 · Holland',ill:'city',title:'Me sinto mais realizado quando',text:'Em que situação você se sente mais realizado?',opts:[{label:'Ajudei alguém a se sentir melhor ou resolver um problema',dim:'S',pts:2,lose:'A',losePts:0.2},{label:'Criei algo que exprime quem sou de forma autêntica',dim:'A',pts:2,lose:'S',losePts:0.2}]},
  {id:'r21',block:'Bloco 3 · Holland',ill:'stage',title:'Em uma apresentação coletiva, qual papel combina mais?',text:'Em uma apresentação coletiva, qual papel combina mais com você?',opts:[{label:'Criar o conceito, o design e a narrativa visual',dim:'A',pts:2,lose:'E',losePts:0.2},{label:'Apresentar, convencer e mobilizar o grupo',dim:'E',pts:2,lose:'A',losePts:0.2}]},
  {id:'r22',block:'Bloco 3 · Holland',ill:'market',title:'Diante de uma causa em que acredita, prefere',text:'Diante de uma causa em que acredita, o que você prefere?',opts:[{label:'Liderar a mudança, mobilizar pessoas e tomar frente',dim:'E',pts:2,lose:'A',losePts:0.2},{label:'Criar conteúdo, arte ou algo que inspire outros',dim:'A',pts:2,lose:'E',losePts:0.2}]},
  {id:'r23',block:'Bloco 3 · Holland',ill:'stage',title:'Ao realizar uma tarefa, o que te deixa mais à vontade?',text:'Ao realizar uma tarefa, o que te deixa mais à vontade?',opts:[{label:'Ter liberdade para criar do meu jeito',dim:'A',pts:2,lose:'C',losePts:0.2},{label:'Ter um roteiro claro para seguir com precisão',dim:'C',pts:2,lose:'A',losePts:0.2}]},
  {id:'r24',block:'Bloco 3 · Holland',ill:'lab',title:'Me sinto mais confortável quando',text:'Em qual situação você se sente mais confortável?',opts:[{label:'Tenho regras claras, dados e procedimentos para seguir',dim:'C',pts:2,lose:'A',losePts:0.2},{label:'Tenho liberdade para expressar minha visão pessoal',dim:'A',pts:2,lose:'C',losePts:0.2}]},
  {id:'r25',block:'Bloco 3 · Holland',ill:'city',title:'Em um grupo com conflitos, o que tende a fazer?',text:'Em um grupo com conflitos, o que você tende a fazer?',opts:[{label:'Mediar, ouvir todos e buscar harmonia',dim:'S',pts:2,lose:'E',losePts:0.2},{label:'Propor soluções, tomar posição e conduzir a resolução',dim:'E',pts:2,lose:'S',losePts:0.2}]},
  {id:'r26',block:'Bloco 3 · Holland',ill:'market',title:'Ao montar um grupo para um projeto, o que prioriza?',text:'Ao montar um grupo para um projeto, o que você prioriza?',opts:[{label:'Pessoas que topem o desafio e tenham energia para executar',dim:'E',pts:2,lose:'S',losePts:0.2},{label:'Pessoas que se entendam bem e trabalhem em harmonia',dim:'S',pts:2,lose:'E',losePts:0.2}]},
  {id:'r27',block:'Bloco 3 · Holland',ill:'city',title:'Organizando um evento, o que mais quer garantir?',text:'Ao organizar um evento, o que mais quer garantir?',opts:[{label:'Que as pessoas se sintam bem e à vontade',dim:'S',pts:2,lose:'C',losePts:0.2},{label:'Que tudo esteja organizado, no horário e sem falhas',dim:'C',pts:2,lose:'S',losePts:0.2}]},
  {id:'r28',block:'Bloco 3 · Holland',ill:'workshop',title:'Diante de uma decisão coletiva equivocada',text:'Diante de uma decisão coletiva equivocada, o que você faz?',opts:[{label:'Apresento dados e argumentos para corrigir o rumo',dim:'C',pts:2,lose:'S',losePts:0.2},{label:'Converso individualmente para entender e alinhar cada um',dim:'S',pts:2,lose:'C',losePts:0.2}]},
  {id:'r29',block:'Bloco 3 · Holland',ill:'market',title:'Surgiu uma oportunidade nova e inesperada. O que faz?',text:'Surgiu uma oportunidade nova e inesperada. O que você faz?',opts:[{label:'Mergulho logo — quem hesita perde a chance',dim:'E',pts:2,lose:'C',losePts:0.2},{label:'Avalio os riscos e planejo antes de me comprometer',dim:'C',pts:2,lose:'E',losePts:0.2}]},
  {id:'r30',block:'Bloco 3 · Holland',ill:'mountain',title:'Para um projeto grande sair do papel, prefere',text:'Para um projeto grande sair do papel, o que você prefere?',opts:[{label:'Um plano detalhado com cada etapa mapeada',dim:'C',pts:2,lose:'E',losePts:0.2},{label:'Uma pessoa que lidere e mova todo mundo para agir',dim:'E',pts:2,lose:'C',losePts:0.2}]},
]

const MBTI: Scene[] = [
  {id:'m01',block:'Bloco 4 · Tipo',ill:'city',title:'O Trabalho de Amanhã',text:'Tem um trabalho para entregar amanhã. O que você faz?',opts:[{label:'Abro logo a planilha e já começo',dim:'SN_S'},{label:'Coloco uma música primeiro, entro no clima',dim:'SN_N'}]},
  {id:'m02',block:'Bloco 4 · Tipo',ill:'city',title:'O Quadro Branco',text:'Você tem um quadro branco cheio de compromissos anotados. Isso representa...',opts:[{label:'Meu jeito de funcionar — eu preciso disso',dim:'JP_J'},{label:'Uma tentativa. Faço na ordem que quiser',dim:'JP_P'}]},
  {id:'m03',block:'Bloco 4 · Tipo',ill:'city',title:'O Violão Parado',text:'Um violão que você comprou com empolgação está há semanas sem uso. O que faz?',opts:[{label:'Retomo com disciplina ou vendo — não faz sentido guardar',dim:'TF_T'},{label:'Não consigo vender, tem memória afetiva demais',dim:'TF_F'}]},
  {id:'m04',block:'Bloco 4 · Tipo',ill:'city',title:'O Final de Semana',text:'Final de semana livre, quarto do jeito que está. O que prefere?',opts:[{label:'Arrumo rápido e saio — preciso de gente e movimento',dim:'EI_E'},{label:'Fico aqui em silêncio, no meu mundo',dim:'EI_I'}]},
  {id:'m05',block:'Bloco 5 · Tipo',ill:'stage',title:'O DJ da Festa',text:'A pista está esquentando. O DJ deve...',opts:[{label:'Seguir a setlist que planejou — consistência é tudo',dim:'JP_J'},{label:'Largar o planejado e tocar o que o momento pede',dim:'JP_P'}]},
  {id:'m06',block:'Bloco 5 · Tipo',ill:'stage',title:'Chegou na Festa',text:'Você chegou e não conhece quase ninguém. O que faz?',opts:[{label:'Já chego puxando conversa com quem estiver perto',dim:'EI_E'},{label:'Fico perto de quem conheço até me sentir à vontade',dim:'EI_I'}]},
  {id:'m07',block:'Bloco 5 · Tipo',ill:'stage',title:'Sozinho na Festa',text:'Você está sozinho enquanto todos parecem se divertir. O que sente?',opts:[{label:'Analiso a situação e decido o que fazer racionalmente',dim:'TF_T'},{label:'Bate um frio — será que tem algo errado comigo?',dim:'TF_F'}]},
  {id:'m08',block:'Bloco 5 · Tipo',ill:'stage',title:'O Próximo Destino',text:'O grupo está decidindo o que fazer depois da festa.',opts:[{label:'Sugiro algo concreto que eu sei que funciona',dim:'SN_S'},{label:'Proponho algo diferente que ninguém esperaria',dim:'SN_N'}]},
  {id:'m09',block:'Bloco 6 · Tipo',ill:'lab',title:'O Voluntário',text:'O professor pediu um voluntário para resolver no quadro.',opts:[{label:'Levanto a mão — por que não?',dim:'EI_E'},{label:'Espero alguém ir primeiro',dim:'EI_I'}]},
  {id:'m10',block:'Bloco 6 · Tipo',ill:'lab',title:'O Livro de Pesquisa',text:'Pegando um livro para pesquisar. O que te prende mais?',opts:[{label:'Exemplos práticos, aplicações reais e casos concretos',dim:'SN_S'},{label:'As teorias por trás, os conceitos e conexões abstratas',dim:'SN_N'}]},
  {id:'m11',block:'Bloco 6 · Tipo',ill:'lab',title:'O Erro no Quadro',text:'Um colega erra no quadro na frente de todos. O que você faz?',opts:[{label:'Corrijo — é importante ter a informação certa',dim:'TF_T'},{label:'Fico quieto para não constranger na frente de todos',dim:'TF_F'}]},
  {id:'m12',block:'Bloco 6 · Tipo',ill:'lab',title:'O Trabalho em Grupo',text:'Uma semana para entregar o trabalho. Como começa?',opts:[{label:'Divido as tarefas com o grupo agora mesmo',dim:'JP_J'},{label:'Vamos vendo como a semana vai evoluindo',dim:'JP_P'}]},
  {id:'m13',block:'Bloco 7 · Tipo',ill:'forest',title:'O Piquenique',text:'Você organizou um piquenique. Como chegou?',opts:[{label:'Com tudo planejado: lona, comida, horário definido',dim:'JP_J'},{label:'Com o que tinha em casa — a vibe é mais importante',dim:'JP_P'}]},
  {id:'m14',block:'Bloco 7 · Tipo',ill:'forest',title:'O Quiosque',text:'No quiosque com várias opções no cardápio. Como escolhe?',opts:[{label:'Peço o que já conheço e sei que gosto',dim:'SN_S'},{label:'Experimento algo diferente — é uma oportunidade',dim:'SN_N'}]},
  {id:'m15',block:'Bloco 7 · Tipo',ill:'forest',title:'O Estranho no Banco',text:'Um estranho senta ao lado e começa a chorar. O que faz?',opts:[{label:'Pergunto objetivamente se posso ajudar de alguma forma',dim:'TF_T'},{label:'Fico em silêncio ao lado — presença já é apoio',dim:'TF_F'}]},
  {id:'m16',block:'Bloco 7 · Tipo',ill:'forest',title:'O Parque Vazio',text:'Tarde livre num parque quase vazio. Como se sente?',opts:[{label:'Fico inquieto — chamo alguém para aproveitar junto',dim:'EI_E'},{label:'Alívio — tempo só para mim é exatamente o que preciso',dim:'EI_I'}]},
  {id:'m17',block:'Bloco 8 · Tipo',ill:'market',title:'O Mesmo Café',text:'Você vem aqui todo dia e pede sempre o mesmo café. Por quê?',opts:[{label:'Sei exatamente o que vou ter — sem surpresas ruins',dim:'SN_S'},{label:'É o clima daqui, algo especial que não consigo descrever',dim:'SN_N'}]},
  {id:'m18',block:'Bloco 8 · Tipo',ill:'market',title:'A Ideia no Meio do Trabalho',text:'Trabalhando em algo importante, surge uma ideia nova. O que faz?',opts:[{label:'Anoto para não esquecer e volto ao que estava',dim:'JP_J'},{label:'Mergulho na ideia nova — ela pode ser melhor',dim:'JP_P'}]},
  {id:'m19',block:'Bloco 8 · Tipo',ill:'market',title:'O Convite do Colega',text:'Um colega convida para uma pausa e conversa.',opts:[{label:'Vou logo — adoro essas pausas com gente',dim:'EI_E'},{label:'Agradeço mas prefiro continuar no meu fluxo',dim:'EI_I'}]},
  {id:'m20',block:'Bloco 8 · Tipo',ill:'market',title:'A Decisão Difícil',text:'Você está pensando em uma decisão importante. O que pesa mais?',opts:[{label:'Os fatos, os dados e a lógica da situação',dim:'TF_T'},{label:'O impacto nas pessoas que me importam',dim:'TF_F'}]},
  {id:'m21',block:'Bloco 9 · Tipo',ill:'workshop',title:'O Treino',text:'Como é seu treino na academia?',opts:[{label:'Sigo a planilha do personal à risca — consistência traz resultado',dim:'JP_J'},{label:'Treino o que estou com vontade naquele dia',dim:'JP_P'}]},
  {id:'m22',block:'Bloco 9 · Tipo',ill:'workshop',title:'A Postura Errada',text:'Você vê um colega com postura errada que pode causar lesão.',opts:[{label:'Chego e corrijo — é o certo a fazer',dim:'TF_T'},{label:'Espero o momento certo para não parecer invasivo',dim:'TF_F'}]},
  {id:'m23',block:'Bloco 9 · Tipo',ill:'workshop',title:'Com Quem Treinar',text:'Você prefere treinar...',opts:[{label:'Com personal ou em grupo — energia coletiva me motiva',dim:'EI_E'},{label:'Sozinho com fone — meu ritmo, minha música',dim:'EI_I'}]},
  {id:'m24',block:'Bloco 9 · Tipo',ill:'workshop',title:'Na Esteira',text:'Na esteira, o que te motiva a continuar?',opts:[{label:'Ver os números, o tempo, as calorias — resultado concreto',dim:'SN_S'},{label:'Me imagino mais forte, me visualizo evoluindo',dim:'SN_N'}]},
  {id:'m25',block:'Bloco 10 · Tipo',ill:'space',title:'A Roda Gigante',text:'Seu grupo quer subir na roda gigante, mas você tem um pouco de medo.',opts:[{label:'Analiso: é seguro, o risco é baixo, então vou',dim:'TF_T'},{label:'Prefiro esperar embaixo — não vou fingir que estou bem',dim:'TF_F'}]},
  {id:'m26',block:'Bloco 10 · Tipo',ill:'space',title:'O Carrossel',text:'Olhando o carrossel girar, o que passa pela sua cabeça?',opts:[{label:'Me lembro de quando andei nele quando criança',dim:'SN_S'},{label:'Fico pensando em como seria ver o mundo sempre girando assim',dim:'SN_N'}]},
  {id:'m27',block:'Bloco 10 · Tipo',ill:'space',title:'Duas Horas no Parque',text:'Você tem exatamente 2 horas no parque. O que faz?',opts:[{label:'Defino quais atrações quero fazer e em que ordem',dim:'JP_J'},{label:'Vou no que aparecer — a surpresa é parte da diversão',dim:'JP_P'}]},
  {id:'m28',block:'Bloco 10 · Tipo',ill:'space',title:'Ficou Sozinho',text:'Seu grupo foi para uma atração sem você. Você ficou sozinho.',opts:[{label:'Fico inquieto — vou logo atrás ou chamo alguém',dim:'EI_E'},{label:'Que bom — recarrego um pouco antes de reencontrar o grupo',dim:'EI_I'}]},
]

const VALORES: Scene[] = [
  {id:'v01',block:'Bloco 11 · Valores',ill:'city',title:'O Emprego Ideal',text:'Qual situação profissional te parece mais atraente?',opts:[{label:'Emprego fixo, estável, com benefícios garantidos',dim:'Seg'},{label:'Projetos diferentes a cada 6 meses, sempre novidades',dim:'Var'}]},
  {id:'v02',block:'Bloco 11 · Valores',ill:'market',title:'CLT ou Autônomo',text:'Você recebeu duas propostas equivalentes em salário.',opts:[{label:'CLT com carteira assinada, férias e FGTS',dim:'Seg'},{label:'Trabalho autônomo com total liberdade de horário e projetos',dim:'Ind'}]},
  {id:'v03',block:'Bloco 11 · Valores',ill:'mountain',title:'A Promoção Arriscada',text:'Uma promoção exige mais responsabilidade e instabilidade.',opts:[{label:'Permanecer no cargo atual — estabilidade vale muito para mim',dim:'Seg'},{label:'Aceito o risco — quero crescer mesmo que seja incerto',dim:'Pro'}]},
  {id:'v04',block:'Bloco 11 · Valores',ill:'stage',title:'O Trabalho dos Sonhos',text:'Você precisa escolher entre duas carreiras.',opts:[{label:'Trabalho criativo que me realiza, mesmo com salário menor',dim:'Cri'},{label:'Salário excelente em área que não me inspira tanto',dim:'Ret'}]},
  {id:'v05',block:'Bloco 11 · Valores',ill:'stage',title:'A Liderança Criativa',text:'Surgiu a oportunidade de liderar uma equipe criativa.',opts:[{label:'Prefiro continuar criando com as próprias mãos',dim:'Cri'},{label:'Aceito liderar — coordenar criadores também é uma forma de criar',dim:'Ges'}]},
  {id:'v06',block:'Bloco 12 · Valores',ill:'market',title:'Largar Tudo',text:'Uma ideia criativa exige abandonar seu emprego atual.',opts:[{label:'Largo tudo para tirar meu projeto criativo do papel',dim:'Cri'},{label:'Mantenho o emprego seguro e desenvolvo o projeto nas horas vagas',dim:'Seg'}]},
  {id:'v07',block:'Bloco 12 · Valores',ill:'city',title:'A Causa ou o Salário',text:'Você escolhe entre duas oportunidades.',opts:[{label:'ONG que transforma vidas diretamente, mesmo com salário menor',dim:'Alt'},{label:'Empresa privada com excelente remuneração e pouco impacto social',dim:'Ret'}]},
  {id:'v08',block:'Bloco 12 · Valores',ill:'forest',title:'Ajudar em Silêncio',text:'Você pode contribuir com uma causa importante de duas formas.',opts:[{label:'Ajudar comunidades diretamente, sem visibilidade ou reconhecimento',dim:'Alt'},{label:'Papel de porta-voz público da causa com grande visibilidade',dim:'Pre'}]},
  {id:'v09',block:'Bloco 12 · Valores',ill:'city',title:'Horas Extras pela Causa',text:'Uma causa importante exige mais horas de trabalho.',opts:[{label:'Aceito as horas extras — a causa vale',dim:'Alt'},{label:'Preservo meu tempo pessoal — sem equilíbrio não consigo ajudar ninguém',dim:'Equ'}]},
  {id:'v10',block:'Bloco 12 · Valores',ill:'stage',title:'Beleza ou Complexidade',text:'Você prefere trabalhar com...',opts:[{label:'Beleza, forma, harmonia e estética visual',dim:'Est'},{label:'Problemas complexos que exigem raciocínio profundo',dim:'Est_I'}]},
  {id:'v11',block:'Bloco 12 · Valores',ill:'workshop',title:'O Escritório Bonito',text:'Duas ofertas com o mesmo conteúdo de trabalho.',opts:[{label:'Ambiente mais bonito e inspirador, com salário um pouco menor',dim:'Est'},{label:'Escritório simples e funcional, com salário maior',dim:'Ret'}]},
  {id:'v12',block:'Bloco 13 · Valores',ill:'stage',title:'Arte que Alcança',text:'Seu trabalho criativo pode tomar dois caminhos.',opts:[{label:'Obras belas que encantam um público seleto',dim:'Est'},{label:'Projetos menos refinados esteticamente que beneficiam muitas pessoas',dim:'Alt'}]},
  {id:'v13',block:'Bloco 13 · Valores',ill:'lab',title:'Especialista ou Generalista',text:'Como você prefere crescer profissionalmente?',opts:[{label:'Aprender coisas diferentes todo dia, nunca fazendo a mesma coisa',dim:'Var'},{label:'Me tornar especialista profundo em uma área específica',dim:'Des'}]},
  {id:'v14',block:'Bloco 13 · Valores',ill:'city',title:'A Rotina',text:'Como você se sente em relação à rotina de trabalho?',opts:[{label:'Preciso de variedade — rotina me sufoca',dim:'Var'},{label:'Prefiro rotina estável — imprevisibilidade me cansa',dim:'Seg'}]},
  {id:'v15',block:'Bloco 13 · Valores',ill:'ocean',title:'Equipes Diferentes',text:'No trabalho, você prefere...',opts:[{label:'Trabalhar com equipes diferentes em projetos variados',dim:'Var'},{label:'Construir vínculos profundos com a mesma equipe por anos',dim:'Rel'}]},
  {id:'v16',block:'Bloco 13 · Valores',ill:'lab',title:'O Desafio Intelectual',text:'Qual situação prefere?',opts:[{label:'Trabalho que desafia minha mente, mesmo com salário modesto',dim:'Est_I'},{label:'Trabalho simples e bem remunerado, sem muito estímulo intelectual',dim:'Ret'}]},
  {id:'v17',block:'Bloco 14 · Valores',ill:'space',title:'Pesquisa Solitária',text:'Você está desenvolvendo um projeto de alto nível.',opts:[{label:'Pesquisa solitária aprofundada com resultados de excelência',dim:'Est_I'},{label:'Trabalho colaborativo com equipe, mesmo que menos aprofundado',dim:'Rel'}]},
  {id:'v18',block:'Bloco 14 · Valores',ill:'mountain',title:'Conhecimento ou Cargo',text:'O que prefere para sua carreira?',opts:[{label:'Aprofundar meu conhecimento e me tornar referência técnica',dim:'Est_I'},{label:'Subir na hierarquia e ter mais poder de decisão e visibilidade',dim:'Pro'}]},
  {id:'v19',block:'Bloco 14 · Valores',ill:'market',title:'O Cargo de Destaque',text:'Você tem duas opções de trabalho.',opts:[{label:'Cargo de muito destaque e reconhecimento, com jornada intensa',dim:'Pre'},{label:'Trabalho discreto com tempo livre e vida pessoal preservada',dim:'Equ'}]},
  {id:'v20',block:'Bloco 14 · Valores',ill:'city',title:'Ser Referência',text:'Como você quer ser lembrado profissionalmente?',opts:[{label:'Como referência admirada e respeitada na minha área',dim:'Pre'},{label:'Como alguém que ajudou e transformou vidas anonimamente',dim:'Alt'}]},
  {id:'v21',block:'Bloco 14 · Valores',ill:'mountain',title:'O Prestígio',text:'Diante de uma escolha de carreira.',opts:[{label:'Cargo de alto prestígio em empresa reconhecida',dim:'Pre'},{label:'Negócio próprio sem reconhecimento externo, mas com total autonomia',dim:'Ind'}]},
  {id:'v22',block:'Bloco 15 · Valores',ill:'market',title:'A Promoção Exigente',text:'Uma promoção surge, mas exige mais dedicação.',opts:[{label:'Prefiro manter meu equilíbrio atual — vida pessoal importa muito',dim:'Equ'},{label:'Aceito a jornada intensa se isso acelerar minha carreira',dim:'Pro'}]},
  {id:'v23',block:'Bloco 15 · Valores',ill:'city',title:'Tempo vs Dinheiro',text:'Qual proposta prefere?',opts:[{label:'Salário menor com horários humanos e vida preservada',dim:'Equ'},{label:'Salário alto com pressão constante e poucas horas livres',dim:'Ret'}]},
  {id:'v24',block:'Bloco 15 · Valores',ill:'workshop',title:'Assumir a Liderança',text:'Te oferecem uma posição de liderança.',opts:[{label:'Prefiro não assumir para preservar meu tempo pessoal',dim:'Equ'},{label:'Aceito — liderar é uma oportunidade de crescimento',dim:'Ges'}]},
  {id:'v25',block:'Bloco 15 · Valores',ill:'city',title:'Sempre em Equipe',text:'Como prefere trabalhar?',opts:[{label:'Sempre em equipe, com laços profundos e interdependência',dim:'Rel'},{label:'Com total autonomia, mesmo trabalhando sozinho na maior parte do tempo',dim:'Ind'}]},
  {id:'v26',block:'Bloco 15 · Valores',ill:'forest',title:'Investir nas Pessoas',text:'Você tem energia e tempo limitados. O que prioriza?',opts:[{label:'Investir nas pessoas ao meu redor — seu crescimento me satisfaz',dim:'Rel'},{label:'Focar no meu próprio crescimento e desenvolvimento',dim:'Des'}]},
  {id:'v27',block:'Bloco 16 · Valores',ill:'city',title:'Servir ou Crescer',text:'Uma escolha de carreira te obriga a escolher.',opts:[{label:'Servir e ajudar outros, mesmo que minha carreira avance mais lentamente',dim:'Alt'},{label:'Investir no meu próprio desenvolvimento, mesmo que ajude menos os outros',dim:'Des'}]},
  {id:'v28',block:'Bloco 16 · Valores',ill:'workshop',title:'Crescer em Qualquer Lugar',text:'Você aceita trabalhar em um ambiente desconfortável se...',opts:[{label:'Aprender muito em ambiente precário — crescimento vale qualquer ambiente',dim:'Des'},{label:'Crescer pouco em um lugar agradável e bem estruturado',dim:'Amb'}]},
  {id:'v29',block:'Bloco 16 · Valores',ill:'mountain',title:'Crescimento Silencioso',text:'Qual forma de crescer prefere?',opts:[{label:'Crescer continuamente em silêncio, sem reconhecimento externo',dim:'Des'},{label:'Ganhar status e visibilidade mesmo que o crescimento real seja menor',dim:'Pre'}]},
  {id:'v30',block:'Bloco 16 · Valores',ill:'mountain',title:'Desafio vs Conforto',text:'Como prefere sua trajetória profissional?',opts:[{label:'Sempre buscar desafios que me fazem crescer, mesmo inseguros',dim:'Des'},{label:'Me manter no que já domino — conforto e maestria também têm valor',dim:'Seg'}]},
  {id:'v31',block:'Bloco 16 · Valores',ill:'stage',title:'Liderar ou Criar',text:'Você pode assumir dois papéis diferentes.',opts:[{label:'Coordenar e desenvolver uma equipe de alta performance',dim:'Ges'},{label:'Ter total liberdade para criar com as próprias mãos',dim:'Cri'}]},
  {id:'v32',block:'Bloco 17 · Valores',ill:'market',title:'Liderar em Ambiente Difícil',text:'Uma liderança surgiu, mas o ambiente da empresa é tenso.',opts:[{label:'Aceito liderar mesmo em ambiente exigente — a liderança vale',dim:'Ges'},{label:'Prefiro um lugar agradável, mesmo sem posição de liderança',dim:'Amb'}]},
  {id:'v33',block:'Bloco 17 · Valores',ill:'city',title:'Liderar ou Avançar',text:'No seu cargo de liderança atual...',opts:[{label:'Permaneço liderando bem minha equipe atual',dim:'Ges'},{label:'Abro mão da liderança para avançar mais rápido na hierarquia',dim:'Pro'}]},
  {id:'v34',block:'Bloco 17 · Valores',ill:'space',title:'Autonomia Total',text:'Você tem a oportunidade de trabalhar completamente autônomo.',opts:[{label:'Autonomia total em espaço improvisado — liberdade vale tudo',dim:'Ind'},{label:'Regras e hierarquia em ambiente estruturado e agradável',dim:'Amb'}]},
  {id:'v35',block:'Bloco 17 · Valores',ill:'mountain',title:'Por Conta Própria',text:'Como prefere construir sua carreira?',opts:[{label:'Por conta própria, no meu ritmo e nas minhas condições',dim:'Ind'},{label:'Dentro de uma estrutura corporativa que acelera minha ascensão',dim:'Pro'}]},
  {id:'v36',block:'Bloco 17 · Valores',ill:'city',title:'Sozinho ou Junto',text:'No dia a dia de trabalho, prefere...',opts:[{label:'Trabalhar sozinho com total liberdade de método e horário',dim:'Ind'},{label:'Equipe unida onde todos dependem uns dos outros',dim:'Rel'}]},
  {id:'v37',block:'Bloco 17 · Valores',ill:'workshop',title:'O Salário Vale Tudo?',text:'Duas propostas: qual escolhe?',opts:[{label:'Salário excelente em ambiente sem inspiração visual',dim:'Ret'},{label:'Remuneração menor em espaço bonito e inspirador',dim:'Est'}]},
  {id:'v38',block:'Bloco 18 · Valores',ill:'market',title:'Repetição Remunerada',text:'Uma tarefa repetitiva paga muito bem.',opts:[{label:'Aceito — a remuneração compensa a repetição',dim:'Ret'},{label:'Prefiro trabalho variado com salário modesto',dim:'Var'}]},
  {id:'v39',block:'Bloco 18 · Valores',ill:'lab',title:'Ganhar bem vs Pensar muito',text:'Qual compromisso prefere assumir?',opts:[{label:'Trabalho lucrativo com pouco estímulo intelectual',dim:'Ret'},{label:'Trabalho desafiador intelectualmente com salário menor',dim:'Est_I'}]},
  {id:'v40',block:'Bloco 18 · Valores',ill:'city',title:'Contato Humano vs Destaque',text:'Você valoriza mais em sua carreira...',opts:[{label:'Contato humano profundo e cotidiano com as pessoas',dim:'Rel'},{label:'Cargo de destaque com pouco contato direto',dim:'Pre'}]},
  {id:'v41',block:'Bloco 18 · Valores',ill:'stage',title:'Pessoas ou Criação',text:'Você prefere um trabalho centrado em...',opts:[{label:'Pessoas — ouvir, ajudar e construir vínculos',dim:'Rel'},{label:'Criação solitária com alta qualidade de entrega',dim:'Cri'}]},
  {id:'v42',block:'Bloco 18 · Valores',ill:'city',title:'Investir nas Pessoas vs Se Preservar',text:'No relacionamento com colegas e clientes...',opts:[{label:'Invisto nas relações mesmo que isso me custe energia',dim:'Rel'},{label:'Mantenho distância saudável para preservar minha energia',dim:'Equ'}]},
  {id:'v43',block:'Bloco 19 · Valores',ill:'market',title:'O Ambiente Perfeito',text:'Qual proposta faz mais sentido para você?',opts:[{label:'Empresa com ambiente incrível crescendo lentamente',dim:'Amb'},{label:'Empresa exigente e dura onde o crescimento é muito mais rápido',dim:'Pro'}]},
  {id:'v44',block:'Bloco 19 · Valores',ill:'workshop',title:'Espaço vs Variedade',text:'O que prefere abrir mão?',opts:[{label:'Espaço físico perfeito e estruturado com tarefas repetitivas',dim:'Amb'},{label:'Ambiente simples com grande diversidade de projetos',dim:'Var'}]},
  {id:'v45',block:'Bloco 19 · Valores',ill:'city',title:'Estrutura vs Impacto',text:'Você pode ter conforto ou impacto. Qual escolhe?',opts:[{label:'Lugar bonito, bem estruturado, para trabalhar melhor',dim:'Amb'},{label:'Espaço precário mas com grande impacto social',dim:'Alt'}]},
]

const BANDURA: Scene[] = [
  {id:'e01',block:'Bloco 20 · Autoeficácia',ill:'market',title:'A Reunião de Crise',text:'São 23h, a reunião de crise está começando. O grupo está dividido e olha para você.',opts:[{label:'Tomo a frente: estruturo o problema e conduzo as decisões',dim:'Adm',pts:100},{label:'Contribuo com ideias mas prefiro não liderar neste momento',dim:'Adm',pts:60},{label:'Fico desconfortável — esse tipo de pressão não é meu forte',dim:'Adm',pts:20}]},
  {id:'e02',block:'Bloco 20 · Autoeficácia',ill:'city',title:'O Plano Falhou',text:'Seu plano de ação foi bem-recebido, mas metade do time boicotou a execução.',opts:[{label:'Articulo individualmente com cada pessoa e ajusto o plano',dim:'Adm',pts:100},{label:'Peço ajuda a um superior para mediar a situação',dim:'Adm',pts:60},{label:'Me sinto paralisado — resistência do grupo me desestabiliza',dim:'Adm',pts:20}]},
  {id:'e03',block:'Bloco 20 · Autoeficácia',ill:'workshop',title:'Olhando para trás',text:'Comparando essa missão com as outras que você viveu, como se sentiu nela?',opts:[{label:'Foi onde me senti mais no meu elemento — liderança faz sentido para mim',dim:'Adm',pts:100},{label:'Me senti razoavelmente confortável, mas prefiro áreas mais técnicas',dim:'Adm',pts:60},{label:'Das missões mais difíceis para mim — não me vejo nessa área',dim:'Adm',pts:20}]},
  {id:'e04',block:'Bloco 20 · Autoeficácia',ill:'forest',title:'A Expedição no Campo',text:'Você está sozinho em campo, coleta em mãos, dados ambíguos que precisam de interpretação.',opts:[{label:'Me sinto no meu elemento — análise independente me energiza',dim:'Bio',pts:100},{label:'Consigo trabalhar, mas prefiro ter alguém para discutir os dados',dim:'Bio',pts:60},{label:'Me sinto perdido — esse tipo de trabalho me gera muita insegurança',dim:'Bio',pts:20}]},
  {id:'e05',block:'Bloco 20 · Autoeficácia',ill:'lab',title:'A Anomalia nos Dados',text:'Seus dados de campo contradizem a teoria estabelecida. O orientador quer uma explicação amanhã.',opts:[{label:'Revejo tudo do zero e apresento minha hipótese com confiança',dim:'Bio',pts:100},{label:'Busco referências e tento contextualizar a anomalia',dim:'Bio',pts:60},{label:'Fico ansioso — contradizer a teoria me paralisa',dim:'Bio',pts:20}]},
  {id:'e06',block:'Bloco 20 · Autoeficácia',ill:'forest',title:'A Missão Biológica',text:'Comparando com as outras missões, como você se sentiu explorando ciências biológicas?',opts:[{label:'Me senti muito à vontade — ciência, natureza e análise são minha área',dim:'Bio',pts:100},{label:'Interessante, mas não é onde me sinto mais capaz',dim:'Bio',pts:60},{label:'Claramente não é minha vocação — me senti fora do lugar',dim:'Bio',pts:20}]},
  {id:'e07',block:'Bloco 20 · Autoeficácia',ill:'city',title:'O Corredor do Hospital',text:'Alguém desmaiou no corredor. Você está ali. Cada segundo conta.',opts:[{label:'Ajo com calma, avalio rapidamente e busco ajuda especializada',dim:'Sau',pts:100},{label:'Entro em pânico mas consigo acionar o protocolo de emergência',dim:'Sau',pts:60},{label:'Congelo — situações assim me bloqueiam completamente',dim:'Sau',pts:20}]},
  {id:'e08',block:'Bloco 21 · Autoeficácia',ill:'city',title:'O Paciente Difícil',text:'O paciente está agitado, se recusa a cooperar e a família está pressionando.',opts:[{label:'Mantenho a calma, busco entender a resistência e negocio',dim:'Sau',pts:100},{label:'Peço apoio da equipe para lidar com a situação',dim:'Sau',pts:60},{label:'Me sinto impotente — tensão emocional me paralisa',dim:'Sau',pts:20}]},
  {id:'e09',block:'Bloco 21 · Autoeficácia',ill:'lab',title:'A Missão da Saúde',text:'Como você se sentiu nesta área comparada às outras?',opts:[{label:'Foi onde me senti mais capaz e realizado — cuidar de pessoas faz sentido para mim',dim:'Sau',pts:100},{label:'Me senti okay, mas prefiro áreas com menos carga emocional',dim:'Sau',pts:60},{label:'Não é para mim — pressão e imprevisibilidade da saúde me sobrecarregam',dim:'Sau',pts:20}]},
  {id:'e10',block:'Bloco 21 · Autoeficácia',ill:'stage',title:'O Debate Impossível',text:'Você precisa defender uma posição complexa diante de um grupo que pensa completamente diferente.',opts:[{label:'Apresento minha argumentação com confiança e abertura para o diálogo',dim:'Hum',pts:100},{label:'Consigo me expressar, mas fico inseguro frente a opiniões muito opostas',dim:'Hum',pts:60},{label:'Travo — confronto de ideias me deixa muito desconfortável',dim:'Hum',pts:20}]},
  {id:'e11',block:'Bloco 21 · Autoeficácia',ill:'lab',title:'A Pesquisa Questionada',text:'Sua pesquisa qualitativa é questionada por quem defende apenas dados quantitativos.',opts:[{label:'Defendo com solidez — metodologias qualitativas têm rigor próprio',dim:'Hum',pts:100},{label:'Aceito parcialmente — talvez eu precise de mais dados quantitativos',dim:'Hum',pts:60},{label:'Me sinto sem argumentos — críticas metodológicas me desestabilizam',dim:'Hum',pts:20}]},
  {id:'e12',block:'Bloco 21 · Autoeficácia',ill:'city',title:'A Missão Humana',text:'Como você avalia sua performance nessa área?',opts:[{label:'Me senti extremamente à vontade — análise humana e social é onde prospero',dim:'Hum',pts:100},{label:'Interessante, mas não sinto que é meu ponto mais forte',dim:'Hum',pts:60},{label:'Definitivamente não é minha área — prefiro algo mais concreto',dim:'Hum',pts:20}]},
  {id:'e13',block:'Bloco 21 · Autoeficácia',ill:'stage',title:'O Estúdio Ao Vivo',text:'Você tem 3 minutos no ar, ao vivo, para comunicar uma ideia importante para um público desconhecido.',opts:[{label:'Me preparo rapidamente e comunico com clareza e presença',dim:'Com',pts:100},{label:'Consigo, mas a pressão do ao vivo me afeta bastante',dim:'Com',pts:60},{label:'Trava — falar para câmeras e audiências desconhecidas me bloqueia',dim:'Com',pts:20}]},
  {id:'e14',block:'Bloco 21 · Autoeficácia',ill:'city',title:'A Crise de Imagem',text:'Uma notícia falsa sobre sua organização está viralizando. Você é o porta-voz.',opts:[{label:'Estruturo resposta clara, rápida e transparente para os canais certos',dim:'Com',pts:100},{label:'Consigo responder, mas fico inseguro sobre o tom e o alcance',dim:'Com',pts:60},{label:'Me sinto totalmente despreparado para esse tipo de situação',dim:'Com',pts:20}]},
  {id:'e15',block:'Bloco 22 · Autoeficácia',ill:'market',title:'A Missão da Comunicação',text:'Comparando com as outras missões, como você se sentiu nesta?',opts:[{label:'Fui onde mais me senti vivo — comunicar e informar é minha vocação',dim:'Com',pts:100},{label:'Razoável — tenho habilidade mas prefiro outros contextos',dim:'Com',pts:60},{label:'Comunicação pública não é meu forte — prefiro bastidores',dim:'Com',pts:20}]},
  {id:'e16',block:'Bloco 22 · Autoeficácia',ill:'stage',title:'O Ateliê Aberto',text:'Total liberdade. Sem referência, sem prazo, sem briefing. Você pode criar qualquer coisa.',opts:[{label:'Me jogo com entusiasmo — liberdade total é meu combustível',dim:'Art',pts:100},{label:'Começo com dificuldade, mas encontro meu caminho',dim:'Art',pts:60},{label:'Me paraliso — ausência de estrutura me deixa perdido',dim:'Art',pts:20}]},
  {id:'e17',block:'Bloco 22 · Autoeficácia',ill:'stage',title:'O Cliente Insatisfeito',text:'Você entregou o projeto. O cliente disse que "não era bem isso" sem dar mais detalhes.',opts:[{label:'Faço perguntas precisas para entender o que falta e recrío com segurança',dim:'Art',pts:100},{label:'Fico frustrado mas refaço tentando adivinhar o que quer',dim:'Art',pts:60},{label:'Crítica vaga me desmonta — não sei por onde recomeçar',dim:'Art',pts:20}]},
  {id:'e18',block:'Bloco 22 · Autoeficácia',ill:'workshop',title:'A Missão Criativa',text:'Como você se sentiu nessa missão de artes e design?',opts:[{label:'Foi a missão onde mais me senti eu mesmo — criar é o que me move',dim:'Art',pts:100},{label:'Gostei, mas prefiro áreas onde as regras são mais claras',dim:'Art',pts:60},{label:'Não é minha área — a subjetividade do processo me incomoda',dim:'Art',pts:20}]},
  {id:'e19',block:'Bloco 22 · Autoeficácia',ill:'space',title:'A Sala dos Servidores',text:'Sistema crítico com falha. Sem documentação disponível. Você precisa resolver com lógica pura.',opts:[{label:'Analiso o sistema metodicamente — problemas de lógica me energizam',dim:'Exa',pts:100},{label:'Consigo trabalhar, mas a falta de documentação me estresse',dim:'Exa',pts:60},{label:'Esse tipo de raciocínio me esgota — não é onde me sinto capaz',dim:'Exa',pts:20}]},
  {id:'e20',block:'Bloco 22 · Autoeficácia',ill:'lab',title:'O Bug Impossível',text:'Você encontrou o problema mas a solução quebra três outras partes do sistema.',opts:[{label:'Mapejo os impactos e construo uma solução elegante que resolve tudo',dim:'Exa',pts:100},{label:'Corrijo o principal e documento os impactos para resolver depois',dim:'Exa',pts:60},{label:'A complexidade me paralisa — não sei por onde continuar',dim:'Exa',pts:20}]},
  {id:'e21',block:'Bloco 22 · Autoeficácia',ill:'space',title:'A Missão Exata',text:'Como você avalia sua performance em ciências exatas e informática?',opts:[{label:'Foi onde mais me senti em casa — lógica, dados e sistemas são meu universo',dim:'Exa',pts:100},{label:'Competente, mas não apaixonado — é uma habilidade, não uma vocação',dim:'Exa',pts:60},{label:'Definitivamente não é minha área — raciocínio formal me esgota',dim:'Exa',pts:20}]},
  {id:'e22',block:'Bloco 22 · Autoeficácia',ill:'workshop',title:'O Canteiro de Obras',text:'Estrutura metálica, prazo estourado, equipe esperando decisão. As consequências são reais.',opts:[{label:'Avalio estrutura e riscos rapidamente, tomo a decisão e oriento a equipe',dim:'Eng',pts:100},{label:'Consulto a equipe técnica antes de decidir — responsabilidade me pesa',dim:'Eng',pts:60},{label:'Pressão e consequências reais me bloqueiam — não sei agir assim',dim:'Eng',pts:20}]},
  {id:'e23',block:'Bloco 22 · Autoeficácia',ill:'city',title:'A Falha Estrutural',text:'Uma falha é detectada no dia da entrega. Correção leva 3 dias. Cliente não aceita atrasos.',opts:[{label:'Comunico com transparência, apresento alternativas e negocio prazos',dim:'Eng',pts:100},{label:'Informo o problema mas fico inseguro sobre como negociar',dim:'Eng',pts:60},{label:'Entro em colapso — erro técnico em obra me paralisa completamente',dim:'Eng',pts:20}]},
  {id:'e24',block:'Bloco 22 · Autoeficácia',ill:'workshop',title:'A Missão da Engenharia',text:'Como você se sentiu nessa missão de engenharia e produção?',opts:[{label:'Me senti muito capaz — trabalho técnico com impacto físico real me satisfaz muito',dim:'Eng',pts:100},{label:'Okay, mas prefiro trabalhos com menos pressão e consequências diretas',dim:'Eng',pts:60},{label:'Não é meu perfil — engenharia e suas responsabilidades me sobrecarregam',dim:'Eng',pts:20}]},
  {id:'e25',block:'Bloco 22 · Autoeficácia',ill:'mountain',title:'O Terreno Hostil',text:'Névoa densa, equipe esperando, decisão não pode ser adiada. O grupo depende de você.',opts:[{label:'Processo as informações disponíveis, decido e lidero com firmeza',dim:'Mil',pts:100},{label:'Consulto a equipe rapidamente antes de agir',dim:'Mil',pts:60},{label:'Incerteza total me paralisa — não consigo decidir sem informações claras',dim:'Mil',pts:20}]},
  {id:'e26',block:'Bloco 22 · Autoeficácia',ill:'mountain',title:'A Ordem Questionável',text:'Você recebeu uma ordem que parece equivocada, mas o superior insiste.',opts:[{label:'Comunico minha objeção com clareza e proponho alternativa fundamentada',dim:'Mil',pts:100},{label:'Obedeço mas registro minha discordância por escrito',dim:'Mil',pts:60},{label:'Obedeço em silêncio — questionar hierarquia me gera muita ansiedade',dim:'Mil',pts:20}]},
  {id:'e27',block:'Bloco 22 · Autoeficácia',ill:'city',title:'A Missão Militar',text:'Como você avaliaria sua performance em ambientes militares e de segurança?',opts:[{label:'Me senti muito à vontade — disciplina, hierarquia e decisão sob pressão são meus pontos fortes',dim:'Mil',pts:100},{label:'Consegui funcionar, mas esse nível de pressão não é onde prospero',dim:'Mil',pts:60},{label:'Claramente não é minha área — ambientes militares me sobrecarregam muito',dim:'Mil',pts:20}]},
]

const ALL_SCENES: Scene[] = [...HOLLAND, ...MBTI, ...VALORES, ...BANDURA]
const TOTAL = ALL_SCENES.length // 130

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sceneType(s: Scene): 'holland' | 'mbti' | 'valores' | 'bandura' {
  if (s.id.startsWith('r')) return 'holland'
  if (s.id.startsWith('m')) return 'mbti'
  if (s.id.startsWith('v')) return 'valores'
  return 'bandura'
}

function initScores(): Scores {
  return {
    R:0,I:0,A:0,S:0,E:0,C:0,
    EI_E:0,EI_I:0,SN_S:0,SN_N:0,TF_T:0,TF_F:0,JP_J:0,JP_P:0,
    Seg:0,Cri:0,Alt:0,Est:0,Var:0,Est_I:0,Pre:0,Equ:0,Des:0,Ges:0,
    Ind:0,Ret:0,Rel:0,Pro:0,Amb:0,
    Adm:0,Bio:0,Sau:0,Hum:0,Com:0,Art:0,Exa:0,Eng:0,Mil:0,
    _AdmN:0,_BioN:0,_SauN:0,_HumN:0,_ComN:0,_ArtN:0,_ExaN:0,_EngN:0,_MilN:0,
  }
}

function applyScore(scores: Scores, scene: Scene, opt: SceneOpt): Scores {
  const s = { ...scores }
  const t = sceneType(scene)
  if (t === 'bandura') {
    s[opt.dim] = (s[opt.dim] || 0) + (opt.pts || 0)
    s['_' + opt.dim + 'N'] = (s['_' + opt.dim + 'N'] || 0) + 1
  } else if (t === 'holland') {
    if (s[opt.dim] !== undefined) s[opt.dim] += opt.pts || 0
    if (opt.lose && s[opt.lose] !== undefined) s[opt.lose] += (opt.losePts || 0)
  } else {
    if (s[opt.dim] !== undefined) s[opt.dim]++
  }
  return s
}

function undoScore(scores: Scores, scene: Scene, choiceKey: string): Scores {
  const s = { ...scores }
  const t = sceneType(scene)
  if (t === 'bandura') {
    const [dim, ptsStr] = choiceKey.split('|')
    const pts = parseInt(ptsStr || '0')
    if (s[dim] !== undefined) s[dim] -= pts
    if (s['_' + dim + 'N'] !== undefined) s['_' + dim + 'N'] -= 1
  } else if (t === 'holland') {
    const [dim, ptsStr] = choiceKey.split('|')
    const pts = parseInt(ptsStr || '0')
    const opt = scene.opts.find(o => o.dim === dim && o.pts === pts)
    if (opt) {
      if (s[opt.dim] !== undefined) s[opt.dim] -= opt.pts || 0
      if (opt.lose && s[opt.lose] !== undefined) s[opt.lose] -= (opt.losePts || 0)
    }
  } else {
    const dim = choiceKey.split('|')[0]
    if (s[dim] !== undefined) s[dim]--
  }
  return s
}

function choiceKeyForOpt(opt: SceneOpt): string {
  return opt.pts !== undefined ? `${opt.dim}|${opt.pts}` : opt.dim
}

function computeResults(scores: Scores) {
  // Holland
  const hDims = ['R','I','A','S','E','C'] as const
  const maxH = Math.max(...hDims.map(d => scores[d] || 0), 1)
  const holland: Record<string,number> = {}
  hDims.forEach(d => { holland[d] = Math.round(((scores[d] || 0) / maxH) * 100) })
  const hSorted = Object.entries(holland).sort((a,b) => b[1] - a[1])
  const hollandCode = hSorted.slice(0,3).map(e => e[0]).join('')

  // MBTI
  const mDims: [string,string,string,string][] = [
    ['EI_E','EI_I','E','I'],['SN_S','SN_N','S','N'],
    ['TF_T','TF_F','T','F'],['JP_J','JP_P','J','P']
  ]
  let mbtiType = ''
  const mbtiScores: Record<string,number> = {
    E:scores.EI_E||0,I:scores.EI_I||0,S:scores.SN_S||0,N:scores.SN_N||0,
    T:scores.TF_T||0,F:scores.TF_F||0,J:scores.JP_J||0,P:scores.JP_P||0
  }
  mDims.forEach(([ak,bk,al,bl]) => {
    mbtiType += (scores[ak]||0) >= (scores[bk]||0) ? al : bl
  })

  // Valores
  const vDims = ['Seg','Cri','Alt','Est','Var','Est_I','Pre','Equ','Des','Ges','Ind','Ret','Rel','Pro','Amb']
  const maxV = Math.max(...vDims.map(d => scores[d] || 0), 1)
  const valores: Record<string,number> = {}
  vDims.forEach(d => { valores[d] = Math.round(((scores[d]||0)/maxV)*100) })

  // Bandura
  const bDims = ['Adm','Bio','Sau','Hum','Com','Art','Exa','Eng','Mil']
  const bandura: Record<string,number> = {}
  bDims.forEach(d => {
    const n = scores['_'+d+'N'] || 0
    const sum = scores[d] || 0
    bandura[d] = n > 0 ? Math.round(sum / (n * 100) * 100) : 0
  })

  return { holland, hollandCode, mbti: { type: mbtiType, scores: mbtiScores }, valores, bandura }
}

// ─── Illustration backgrounds ─────────────────────────────────────────────────

const ILL_STYLES: Record<string, CSSProperties & { emoji: string }> = {
  city:     { background:'linear-gradient(180deg,#0a0a1a,#1a1a3a,#2a1a4a)', emoji:'🏙️' },
  forest:   { background:'linear-gradient(180deg,#0a1a0a,#0d2b0d,#1a3a1a)', emoji:'🌲' },
  lab:      { background:'linear-gradient(180deg,#0a0a1a,#0a1a2a,#0a2a2a)', emoji:'🔬' },
  stage:    { background:'linear-gradient(180deg,#1a0a1a,#2a0a2a,#3a1a1a)', emoji:'🎭' },
  market:   { background:'linear-gradient(180deg,#1a1000,#2a1a00,#3a2a00)', emoji:'🏪' },
  ocean:    { background:'linear-gradient(180deg,#000a1a,#001a2a,#002a3a)', emoji:'🌊' },
  mountain: { background:'linear-gradient(180deg,#0a0a14,#1a1a2a,#2a2a3a)', emoji:'⛰️' },
  workshop: { background:'linear-gradient(180deg,#1a0a00,#2a1400,#3a2000)', emoji:'🔧' },
  space:    { background:'linear-gradient(180deg,#000005,#05000a,#0a0014)', emoji:'🚀' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function JornadaVocacional({ patientId, experienceId, initialState, onStateChange, onComplete }: GameProps) {
  const savedState = initialState as Partial<GameState> | undefined

  const [phase, setPhase] = useState<'cover'|'scenes'|'finish'>(
    savedState?.phase ?? 'cover'
  )
  const [scene, setScene] = useState(savedState?.scene ?? 0)
  const [choices, setChoices] = useState<Record<string,string>>(savedState?.choices ?? {})
  const [scores, setScores] = useState<Scores>(savedState?.scores ?? initScores())
  const [transition, setTransition] = useState<{icon:string;msg:string}|null>(null)
  const [selected, setSelected] = useState<string|null>(null)
  const [animKey, setAnimKey] = useState(0)
  const saveTimer = useRef<NodeJS.Timeout|null>(null)

  const PAUSE_AT: Record<number, {icon:string;msg:string}> = {
    29: { icon:'🌟', msg:'Holland concluído! Agora: Tipo Psicológico MBTI...' },
    57: { icon:'🔤', msg:'MBTI concluído! Agora: Valores Profissionais...' },
    102:{ icon:'💎', msg:'Valores mapeados! Agora: Autoeficácia...' },
  }

  // Restore selected from choices when scene changes
  useEffect(() => {
    const sc = ALL_SCENES[scene]
    setSelected(sc ? (choices[sc.id] ?? null) : null)
    setAnimKey(k => k + 1)
  }, [scene]) // eslint-disable-line react-hooks/exhaustive-deps

  const triggerSave = useCallback((state: GameState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onStateChange(state as Record<string,unknown>), 1500)
  }, [onStateChange])

  function handleSelect(opt: SceneOpt) {
    const sc = ALL_SCENES[scene]
    if (!sc) return
    const key = choiceKeyForOpt(opt)
    setSelected(key)

    // Undo previous choice for this scene
    let newScores = scores
    const prev = choices[sc.id]
    if (prev) newScores = undoScore(newScores, sc, prev)
    newScores = applyScore(newScores, sc, opt)
    const newChoices = { ...choices, [sc.id]: key }

    setScores(newScores)
    setChoices(newChoices)
    triggerSave({ phase:'scenes', scene, choices: newChoices, scores: newScores })

    // Advance after short delay
    setTimeout(() => {
      if (scene < TOTAL - 1) {
        const pause = PAUSE_AT[scene]
        if (pause) {
          setTransition(pause)
          setTimeout(() => {
            setTransition(null)
            setScene(scene + 1)
          }, 2400)
        } else {
          setScene(scene + 1)
        }
      } else {
        finishGame(newScores)
      }
    }, 650)
  }

  function finishGame(finalScores: Scores) {
    const results = computeResults(finalScores)
    setPhase('finish')
    onComplete(
      { ...results, source: 'JORNADA_130_V3' },
      { choices }
    )
  }

  function handlePrev() {
    if (scene > 0) setScene(scene - 1)
  }

  const pct = Math.round(scene / TOTAL * 100)
  const sc = ALL_SCENES[scene]
  const ill = sc ? (ILL_STYLES[sc.ill] ?? ILL_STYLES.city) : ILL_STYLES.city
  const answeredCount = Object.keys(choices).length

  // ── Cover ──────────────────────────────────────────────────────────────────

  if (phase === 'cover') {
    return (
      <div style={{ background:'#0f0f1a', minHeight:'100vh', color:'#e2e8f0', fontFamily:'system-ui,sans-serif' }}>
        <div style={{ maxWidth:560, margin:'0 auto', padding:'0 16px 60px' }}>
          <div style={{ minHeight:'85vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'40px 0' }}>
            <div style={{ width:100, height:100, borderRadius:'50%', background:'radial-gradient(circle at 35% 35%,#7c3aed,#1e1b4b)', boxShadow:'0 0 60px rgba(124,58,237,.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, marginBottom:24 }}>
              🗺️
            </div>
            <h1 style={{ fontSize:'clamp(26px,6vw,38px)', fontWeight:800, background:'linear-gradient(135deg,#e2e8f0,#7c3aed,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:10, lineHeight:1.2 }}>
              Jornada<br/>Vocacional
            </h1>
            <p style={{ color:'#b0bec5', fontSize:14, maxWidth:380, marginBottom:28 }}>
              Embarque numa aventura e descubra quais caminhos profissionais combinam com quem você realmente é.
            </p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center', marginBottom:32 }}>
              {['🎮 130 cenas','⏱ 60–90 min','🔷 RIASEC','🔤 MBTI','💎 Valores','💪 Autoeficácia'].map(chip => (
                <span key={chip} style={{ background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.13)', borderRadius:99, padding:'4px 13px', fontSize:12, color:'#cbd5e1' }}>{chip}</span>
              ))}
            </div>

            {answeredCount > 0 && (
              <div style={{ background:'linear-gradient(135deg,#065f46,#0d9488)', borderRadius:12, padding:'12px 20px', marginBottom:20, width:'100%', maxWidth:400, textAlign:'left' }}>
                <div style={{ fontWeight:700, color:'#fff', fontSize:13, marginBottom:2 }}>Jornada anterior encontrada</div>
                <div style={{ color:'rgba(255,255,255,.75)', fontSize:12, marginBottom:10 }}>{answeredCount} de {TOTAL} cenas respondidas</div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => { setPhase('scenes') }} style={{ background:'#fff', color:'#0d9488', border:'none', borderRadius:99, padding:'7px 16px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                    Continuar →
                  </button>
                  <button onClick={() => { setChoices({}); setScores(initScores()); setScene(0) }} style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1px solid rgba(255,255,255,.3)', borderRadius:99, padding:'7px 14px', fontSize:12, cursor:'pointer' }}>
                    Recomeçar
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setPhase('scenes')}
              style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'#fff', border:'none', borderRadius:99, padding:'14px 36px', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(124,58,237,.4)' }}
            >
              {answeredCount > 0 ? 'Ir para a jornada →' : 'Começar a jornada →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Finish ─────────────────────────────────────────────────────────────────

  if (phase === 'finish') {
    const results = computeResults(scores)
    const hNames: Record<string,string> = { R:'Realista', I:'Investigativo', A:'Artístico', S:'Social', E:'Empreendedor', C:'Convencional' }
    const hColors: Record<string,string> = { R:'#f97316', I:'#3b82f6', A:'#a855f7', S:'#22c55e', E:'#f59e0b', C:'#06b6d4' }
    const vNames: Record<string,string> = { Seg:'Segurança',Cri:'Criatividade',Alt:'Altruísmo',Est:'Estética',Var:'Variedade',Est_I:'Est. Intelectual',Pre:'Prestígio',Equ:'Equilíbrio',Des:'Desenvolvimento',Ges:'Gestão',Ind:'Independência',Ret:'Ret. Econômico',Rel:'Relacionamentos',Pro:'Progressão',Amb:'Ambiente' }
    const bNames: Record<string,string> = { Adm:'Administração',Bio:'Ciências Biológicas',Sau:'Saúde',Hum:'Ciências Humanas',Com:'Comunicação',Art:'Artes e Design',Exa:'Ciências Exatas/TI',Eng:'Engenharia',Mil:'Carreiras Militares' }
    const mPairs: [string,string,string,string][] = [['E','I','Extroversão','Introversão'],['S','N','Sensação','Intuição'],['T','F','Pensamento','Sentimento'],['J','P','Julgamento','Percepção']]

    const Wrap = ({ children }: { children: ReactNode }) => (
      <div style={{ background:'#1e1e32', borderRadius:14, border:'1px solid rgba(255,255,255,.08)', padding:20, marginBottom:12, color:'#e2e8f0' }}>
        {children}
      </div>
    )
    const Bar = ({ val, color }: { val: number; color: string }) => (
      <div style={{ height:7, background:'rgba(255,255,255,.08)', borderRadius:99, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${val}%`, background:color, borderRadius:99, transition:'width .6s ease' }} />
      </div>
    )

    return (
      <div style={{ background:'#0f0f1a', minHeight:'100vh', color:'#e2e8f0', fontFamily:'system-ui,sans-serif' }}>
        <div style={{ maxWidth:560, margin:'0 auto', padding:'16px 16px 60px' }}>
          <div style={{ background:'linear-gradient(135deg,#0f172a,#1e1b4b,#0f2318)', borderRadius:14, padding:'32px 24px', textAlign:'center', border:'1px solid rgba(124,58,237,.3)', marginBottom:16 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🏆</div>
            <h1 style={{ fontSize:26, fontWeight:800, background:'linear-gradient(135deg,#e2e8f0,#7c3aed,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:8 }}>
              Jornada concluída!
            </h1>
            <p style={{ color:'#b0bec5', fontSize:14 }}>Seu perfil vocacional completo está pronto abaixo.</p>
          </div>

          <Wrap>
            <h3 style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'.07em', color:'#a855f7', marginBottom:14 }}>🔷 1. Holland (RIASEC)</h3>
            <div style={{ textAlign:'center', fontSize:28, fontWeight:800, color:'#a855f7', letterSpacing:4, marginBottom:16 }}>{results.hollandCode}</div>
            {Object.entries(results.holland).sort((a,b)=>b[1]-a[1]).map(([k,v]) => (
              <div key={k} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:13, color:'#cbd5e1' }}>{hNames[k]}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#94a3b8' }}>{v}%</span>
                </div>
                <Bar val={v} color={hColors[k] || '#7c3aed'} />
              </div>
            ))}
          </Wrap>

          <Wrap>
            <h3 style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'.07em', color:'#f59e0b', marginBottom:14 }}>🔤 2. MBTI</h3>
            <div style={{ textAlign:'center', fontSize:32, fontWeight:800, color:'#7c3aed', letterSpacing:4, marginBottom:16 }}>{results.mbti.type}</div>
            {mPairs.map(([a,b,la,lb]) => {
              const sa = results.mbti.scores[a] || 0
              const sb = results.mbti.scores[b] || 0
              const tot = sa + sb || 1
              const pa = Math.round(sa/tot*100), pb = 100-pa
              return (
                <div key={a} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ fontSize:13, color:'#cbd5e1' }}>{la} ({a})</span>
                    <span style={{ fontSize:12, fontWeight:700, color:'#7c3aed' }}>{pa}%</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
                    <Bar val={pa} color='#7c3aed' />
                    <div style={{ transform:'scaleX(-1)', transformOrigin:'center' }}>
                      <Bar val={pb} color='#06b6d4' />
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:2 }}>
                    <span style={{ fontSize:11, color:'#64748b' }}>{la}</span>
                    <span style={{ fontSize:11, color:'#64748b' }}>{lb} — {pb}%</span>
                  </div>
                </div>
              )
            })}
          </Wrap>

          <Wrap>
            <h3 style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'.07em', color:'#f97316', marginBottom:14 }}>💎 3. Valores (Super)</h3>
            {Object.entries(results.valores).sort((a,b)=>b[1]-a[1]).map(([k,v]) => (
              <div key={k} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:13, color:'#cbd5e1' }}>{vNames[k]||k}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#94a3b8' }}>{v}%</span>
                </div>
                <Bar val={v} color='#f59e0b' />
              </div>
            ))}
          </Wrap>

          <Wrap>
            <h3 style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'.07em', color:'#06b6d4', marginBottom:8 }}>💪 4. Autoeficácia (Bandura)</h3>
            <p style={{ fontSize:12, color:'#64748b', marginBottom:14 }}>🟢 Alta (≥70%) · 🟡 Moderada (40–69%) · 🔴 Desenvolver (&lt;40%)</p>
            {Object.entries(results.bandura).sort((a,b)=>b[1]-a[1]).map(([k,v]) => (
              <div key={k} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:13, color:'#cbd5e1' }}>{bNames[k]||k}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#94a3b8' }}>{v}%</span>
                </div>
                <Bar val={v} color={v>=70?'#22c55e':v>=40?'#f59e0b':'#ef4444'} />
                <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>
                  {v>=70?'Alta confiança':v>=40?'Confiança moderada':'Área de desenvolvimento'}
                </div>
              </div>
            ))}
          </Wrap>
        </div>
      </div>
    )
  }

  // ── Scenes ─────────────────────────────────────────────────────────────────

  const isBandura = sceneType(sc) === 'bandura'
  // Shuffle non-bandura options per scene (stable via scene index)
  const displayOpts = isBandura ? sc.opts : [...sc.opts]

  const ICONS = ['🅰', '🅱', '🅲']

  return (
    <div style={{ background:'#0f0f1a', minHeight:'100vh', color:'#e2e8f0', fontFamily:'system-ui,sans-serif', position:'relative' }}>

      {/* Block transition overlay */}
      {transition && (
        <div style={{ position:'fixed', inset:0, zIndex:500, background:'#0f0f1a', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
          <div style={{ fontSize:52, animation:'bounce .6s ease' }}>{transition.icon}</div>
          <p style={{ color:'#94a3b8', fontSize:15, textAlign:'center', maxWidth:300 }}>{transition.msg}</p>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ position:'sticky', top:0, zIndex:100, padding:'10px 14px', background:'rgba(15,15,26,.92)', backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, maxWidth:560, margin:'0 auto' }}>
          <span style={{ fontSize:11, fontWeight:700, color:'#b0bec5', textTransform:'uppercase', letterSpacing:'.07em', whiteSpace:'nowrap' }}>
            Cena {scene+1}
          </span>
          <div style={{ flex:1, height:5, background:'rgba(255,255,255,.1)', borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#7c3aed,#06b6d4)', borderRadius:99, transition:'width .6s cubic-bezier(.4,0,.2,1)' }} />
          </div>
          <span style={{ fontSize:12, fontWeight:700, color:'#7c3aed', width:32, textAlign:'right' }}>{pct}%</span>
        </div>
      </div>

      <div style={{ maxWidth:560, margin:'0 auto', padding:'16px 14px 60px' }} key={animKey}>
        {/* Scene card */}
        <div style={{ background:'#1e1e32', borderRadius:14, border:'1px solid rgba(255,255,255,.08)', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,.4)', marginBottom:16 }}>
          {/* Illustration */}
          <div style={{ height:140, ...ill, display:'flex', alignItems:'center', justifyContent:'center', fontSize:72 }}>
            {ill.emoji}
          </div>
          {/* Meta */}
          <div style={{ padding:'8px 18px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#7c3aed', textTransform:'uppercase', letterSpacing:'.07em' }}>Cena {scene+1} de {TOTAL}</span>
            <span style={{ fontSize:11, color:'#90a4ae', background:'rgba(255,255,255,.07)', borderRadius:99, padding:'2px 10px' }}>{sc.block}</span>
          </div>
          {/* Body */}
          <div style={{ padding:'14px 18px 18px' }}>
            <div style={{ fontSize:17, fontWeight:700, color:'#e2e8f0', marginBottom:8, lineHeight:1.35 }}>{sc.title}</div>
            <div style={{ fontSize:14, color:'#b0bec5', lineHeight:1.65, marginBottom:18 }}>{sc.text}</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#cbd5e1', marginBottom:12, textTransform:'uppercase', letterSpacing:'.05em' }}>O que você faz?</div>
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {displayOpts.map((opt, oi) => {
                const key = choiceKeyForOpt(opt)
                const isSelected = selected === key
                return (
                  <button
                    key={oi}
                    onClick={() => handleSelect(opt)}
                    style={{
                      display:'flex', alignItems:'flex-start', gap:12,
                      padding:'13px 15px', borderRadius:11,
                      border:`1.5px solid ${isSelected ? '#7c3aed' : 'rgba(255,255,255,.08)'}`,
                      background: isSelected ? 'rgba(124,58,237,.12)' : 'rgba(255,255,255,.03)',
                      cursor:'pointer', textAlign:'left', width:'100%', fontFamily:'inherit',
                      transform: isSelected ? 'translateX(3px)' : undefined,
                      transition:'all .18s',
                      color: isSelected ? '#fff' : '#cbd5e1',
                    }}
                  >
                    <span style={{ fontSize:20, flexShrink:0, width:32, textAlign:'center', marginTop:1 }}>{ICONS[oi]||'▶'}</span>
                    <span style={{ fontSize:13.5, lineHeight:1.5, fontWeight: isSelected ? 500 : 400 }}>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Nav row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <button
            onClick={handlePrev}
            disabled={scene === 0}
            style={{ background:'rgba(255,255,255,.07)', color:'#cbd5e1', border:'1px solid rgba(255,255,255,.1)', borderRadius:99, padding:'11px 22px', fontSize:13, fontWeight:700, cursor:scene===0?'not-allowed':'pointer', opacity:scene===0?.4:1, fontFamily:'inherit' }}
          >
            ← Anterior
          </button>
          <span style={{ fontSize:12, color: selected ? '#22c55e' : '#64748b' }}>
            {selected ? '✓ Escolha registrada' : 'Escolha uma opção para continuar'}
          </span>
        </div>
      </div>
    </div>
  )
}

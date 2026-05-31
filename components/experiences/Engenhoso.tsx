'use client'

import { useState, useCallback, useEffect } from 'react'
import styles from './Engenhoso.module.css'

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
  zone: number
  emoji: string
  cor: string
  nome: string
  msg: string
  pergunta: string
  opts: { txt: string; pts: number }[]
  sub: string
  est: string
  pra: string
  pf: string
  at: string
  cs: string
}

interface Answer { pts: number; star: number; optIdx: number }

// ── Zones ─────────────────────────────────────────────────────────────────────

const ZONES: Record<number, { nome: string; emoji: string }> = {
  1: { nome: 'Infraestrutura & Território', emoji: '🏗️' },
  2: { nome: 'Energia', emoji: '⚡' },
  3: { nome: 'Mecânica & Materiais', emoji: '⚙️' },
  4: { nome: 'Engenharia Digital', emoji: '💻' },
  5: { nome: 'Química & Processos', emoji: '⚗️' },
  6: { nome: 'Ambiental & Agro', emoji: '🌿' },
  7: { nome: 'Aeroespacial & Física', emoji: '✈️' },
  8: { nome: 'Mineração & Produção', emoji: '⛏️' },
  9: { nome: 'Biomédica & Especial', emoji: '🏥' },
}

// ── Data ──────────────────────────────────────────────────────────────────────

const CURSOS: Curso[] = [
  // ── Zona 1 — Infraestrutura & Território ──────────────────────────────────
  {
    id: 'civil', zone: 1, emoji: '🏗️', cor: '#FF6B35', nome: 'Engenharia Civil',
    msg: 'Sou quem sustenta civilizações. Pontes, estradas, barragens — tudo que você pisa foi calculado por mim.',
    pergunta: 'O que mais te atrai em construção?',
    opts: [
      { txt: 'Projetar estruturas que resistem ao tempo', pts: 3 },
      { txt: 'Gerenciar grandes obras e equipes', pts: 2 },
      { txt: 'Planejar cidades e infraestrutura urbana', pts: 2 },
      { txt: 'Não me identifico', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Estruturas, fundações, hidráulica, saneamento, topografia, gestão de obras, materiais de construção.',
    pra: 'Projeta e supervisiona construção de edifícios, pontes, estradas, barragens e sistemas de saneamento.',
    pf: 'Técnico e criativo, gosta de ver projetos saindo do papel, interesse em matemática e física aplicada.',
    at: 'Construtoras, prefeituras, empresas de infraestrutura, consultoras de engenharia, setor público.',
    cs: '5 anos · CREA obrigatório · Uma das engenharias mais tradicionais e empregáveis do Brasil.',
  },
  {
    id: 'transporte', zone: 1, emoji: '🛣️', cor: '#FF6B35', nome: 'Eng. de Transporte e Mobilidade',
    msg: 'Movimento é vida. Planejo como pessoas e cargas se deslocam com segurança e eficiência.',
    pergunta: 'O que mais te interessa em mobilidade urbana?',
    opts: [
      { txt: 'Projetar sistemas de transporte público', pts: 3 },
      { txt: 'Reduzir congestionamentos com tecnologia', pts: 2 },
      { txt: 'Planejar ciclovias e mobilidade sustentável', pts: 2 },
      { txt: 'Não é minha área', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Planejamento de transportes, engenharia de tráfego, logística, mobilidade urbana, sistemas ferroviários.',
    pra: 'Projeta sistemas viários, planeja transporte público, otimiza fluxo de tráfego e logística.',
    pf: 'Analítico, gosta de cidades e mobilidade, interesse em dados e planejamento urbano.',
    at: 'Prefeituras, empresas de logística, metrôs, consultorias, DNIT, concessionárias.',
    cs: '5 anos · Área em expansão com smart cities e mobilidade elétrica.',
  },
  {
    id: 'cartografica', zone: 1, emoji: '🗺️', cor: '#FF6B35', nome: 'Eng. Cartográfica e Agrimensura',
    msg: 'Meço e mapeio o mundo. Sem mim, nenhuma obra começa — sou o primeiro passo de toda construção.',
    pergunta: 'O que mais te fascina em mapeamento?',
    opts: [
      { txt: 'Usar GPS e drones para mapear territórios', pts: 3 },
      { txt: 'Criar modelos 3D precisos do terreno', pts: 2 },
      { txt: 'Registrar legalmente propriedades', pts: 2 },
      { txt: 'Não me atrai', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Topografia, geodésia, sensoriamento remoto, SIG, fotogrametria, GPS e cartografia digital.',
    pra: 'Realiza levantamentos topográficos, cria mapas digitais, usa drones e satélites.',
    pf: 'Preciso, gosta de tecnologia e campo, interesse em geotecnologia e dados espaciais.',
    at: 'Empresas de geoprocessamento, IBGE, prefeituras, cartórios, construtoras, petróleo.',
    cs: '5 anos · Alta demanda com expansão de drones e tecnologia GIS.',
  },
  {
    id: 'hidrica', zone: 1, emoji: '💧', cor: '#FF6B35', nome: 'Engenharia Hídrica',
    msg: 'Água é vida. Gerencio rios, represas e sistemas de abastecimento para que nunca falte.',
    pergunta: 'O que mais te motiva em recursos hídricos?',
    opts: [
      { txt: 'Garantir água limpa para populações', pts: 3 },
      { txt: 'Projetar sistemas de irrigação', pts: 2 },
      { txt: 'Controlar enchentes e bacias hidrográficas', pts: 2 },
      { txt: 'Não é minha área', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Hidrologia, hidráulica, irrigação, drenagem, gestão de bacias hidrográficas, saneamento.',
    pra: 'Projeta sistemas de abastecimento, barragens, canais e soluções para escassez hídrica.',
    pf: 'Analítico, preocupado com meio ambiente, gosta de física e química.',
    at: 'Sabesp, Copasa, ANA, saneamento, usinas hidrelétricas, consultorias ambientais.',
    cs: '5 anos · Área crítica com crise hídrica global crescente.',
  },

  // ── Zona 2 — Energia ──────────────────────────────────────────────────────
  {
    id: 'energia', zone: 2, emoji: '⚡', cor: '#FFD700', nome: 'Engenharia de Energia',
    msg: 'Ilumino o mundo. Planejo como a energia é gerada, distribuída e usada com máxima eficiência.',
    pergunta: 'O que mais te interessa em energia?',
    opts: [
      { txt: 'Desenvolver fontes renováveis', pts: 3 },
      { txt: 'Otimizar redes de distribuição elétrica', pts: 2 },
      { txt: 'Gerenciar eficiência energética', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Energia elétrica, termodinâmica, fontes renováveis, eficiência energética, sistemas de potência.',
    pra: 'Projeta usinas, redes elétricas, sistemas solares e eólicos, otimiza consumo.',
    pf: 'Interessado em sustentabilidade, gosta de física e matemática, visão sistêmica.',
    at: 'Eletrobras, Aneel, empresas de energia renovável, consultorias, indústrias.',
    cs: '5 anos · Setor em explosão com transição energética global.',
  },
  {
    id: 'eletrica', zone: 2, emoji: '🔌', cor: '#FFD700', nome: 'Engenharia Elétrica',
    msg: 'Do interruptor da sua casa às linhas de transmissão de mil km — tudo passa por mim.',
    pergunta: 'O que mais te atrai em sistemas elétricos?',
    opts: [
      { txt: 'Projetar sistemas de energia elétrica', pts: 3 },
      { txt: 'Desenvolver circuitos eletrônicos', pts: 2 },
      { txt: 'Automatizar sistemas industriais', pts: 2 },
      { txt: 'Não me identifico', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Circuitos elétricos, máquinas, eletrônica de potência, controle, sistemas de energia.',
    pra: 'Projeta instalações elétricas, transformadores, motores, automação e redes.',
    pf: 'Raciocínio técnico, gosta de física e matemática, aptidão para resolução de problemas.',
    at: 'Concessionárias, indústrias, construtoras, telecomunicações, automação industrial.',
    cs: '5 anos · CREA obrigatório · Uma das engenharias com maior mercado no Brasil.',
  },
  {
    id: 'nuclear', zone: 2, emoji: '☢️', cor: '#FFD700', nome: 'Engenharia Nuclear',
    msg: 'Trabalho com a maior fonte de energia concentrada que existe. Segurança é minha religião.',
    pergunta: 'O que mais te fascina em energia nuclear?',
    opts: [
      { txt: 'A geração de energia limpa em larga escala', pts: 3 },
      { txt: 'Aplicações médicas — radioterapia', pts: 2 },
      { txt: 'Pesquisa em física de partículas', pts: 2 },
      { txt: 'Me assusta — não é minha área', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Física nuclear, reatores, radioproteção, termodinâmica, materiais nucleares.',
    pra: 'Opera e projeta reatores, desenvolve aplicações médicas, pesquisa em energia.',
    pf: 'Rigoroso, responsável, fascínio por física, alta exigência técnica.',
    at: 'Eletronuclear, CNEN, hospitais, institutos de pesquisa, petroquímica.',
    cs: '5 anos · Área restrita e altamente especializada no Brasil.',
  },

  // ── Zona 3 — Mecânica & Materiais ─────────────────────────────────────────
  {
    id: 'mecanica', zone: 3, emoji: '⚙️', cor: '#AAAAAA', nome: 'Engenharia Mecânica',
    msg: 'Projeto máquinas que movem o mundo. Do motor do carro à turbina do avião, sou eu.',
    pergunta: 'O que mais te atrai em sistemas mecânicos?',
    opts: [
      { txt: 'Projetar motores e turbinas de alta performance', pts: 3 },
      { txt: 'Desenvolver robôs e sistemas automatizados', pts: 2 },
      { txt: 'Calcular resistência de estruturas', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Termodinâmica, mecânica dos fluidos, resistência dos materiais, projetos de máquinas, CAD.',
    pra: 'Projeta e desenvolve máquinas, motores, sistemas de refrigeração, equipamentos industriais.',
    pf: 'Raciocínio espacial, gosta de física, prazer em entender como as coisas funcionam.',
    at: 'Automobilística, aeroespacial, petróleo, metalurgia, linha branca, consultorias.',
    cs: '5 anos · CREA obrigatório · Uma das engenharias mais versáteis e demandadas.',
  },
  {
    id: 'mecatronica', zone: 3, emoji: '🤖', cor: '#AAAAAA', nome: 'Engenharia Mecatrônica',
    msg: 'Sou a fusão perfeita de mecânica, eletrônica e computação. Projeto os robôs do futuro.',
    pergunta: 'O que mais te atrai em mecatrônica?',
    opts: [
      { txt: 'Projetar robôs e sistemas autônomos', pts: 3 },
      { txt: 'Integrar mecânica com IA e software', pts: 2 },
      { txt: 'Automatizar linhas de produção', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Robótica, automação, eletrônica embarcada, programação, controle, inteligência artificial.',
    pra: 'Projeta robôs, sistemas de automação, veículos autônomos e dispositivos inteligentes.',
    pf: 'Multidisciplinar, gosta de tecnologia, interesse em robótica e sistemas inteligentes.',
    at: 'Indústria 4.0, automação, startups de robótica, montadoras, tecnologia.',
    cs: '5 anos · Área em explosão com a 4ª Revolução Industrial.',
  },
  {
    id: 'materiais', zone: 3, emoji: '🔬', cor: '#AAAAAA', nome: 'Engenharia de Materiais',
    msg: 'Crio os materiais do amanhã. Do aço ao carbono, desenvolvo substâncias que ninguém imaginou.',
    pergunta: 'O que mais te fascina em materiais?',
    opts: [
      { txt: 'Desenvolver materiais mais leves e resistentes', pts: 3 },
      { txt: 'Criar nanomateriais e materiais inteligentes', pts: 2 },
      { txt: 'Melhorar processos metalúrgicos', pts: 2 },
      { txt: 'Não me atrai', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Metalurgia, polímeros, cerâmicas, compósitos, caracterização de materiais.',
    pra: 'Desenvolve e testa novos materiais, melhora processos industriais, pesquisa aplicada.',
    pf: 'Curioso, gosta de química e física, interesse em laboratório e pesquisa.',
    at: 'Aeroespacial, metalurgia, petroquímica, eletrônica, centros de pesquisa.',
    cs: '5 anos · Fundamental para inovação em todos os setores industriais.',
  },
  {
    id: 'metalurgica', zone: 3, emoji: '🏭', cor: '#AAAAAA', nome: 'Engenharia Metalúrgica',
    msg: 'Transformo minérios em metais e metais em civilização. Sou a base de toda indústria.',
    pergunta: 'O que mais te atrai em metais?',
    opts: [
      { txt: 'Desenvolver ligas metálicas de alta performance', pts: 3 },
      { txt: 'Otimizar processos siderúrgicos', pts: 2 },
      { txt: 'Garantir qualidade e resistência de metais', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Siderurgia, fundição, tratamentos térmicos, corrosão, ligas metálicas.',
    pra: 'Desenvolve processos de fabricação de metais, melhora ligas, controla qualidade.',
    pf: 'Interesse em química e física, gosta de trabalho industrial.',
    at: 'Siderúrgicas como Vale e Gerdau, fundições, mineradoras, automobilística.',
    cs: '5 anos · Base histórica e fundamental para toda cadeia produtiva.',
  },
  {
    id: 'acustica', zone: 3, emoji: '🔊', cor: '#AAAAAA', nome: 'Engenharia Acústica',
    msg: 'O som é minha especialidade. Projeto salas de concerto, combato ruídos e controlo vibrações.',
    pergunta: 'O que mais te fascina em acústica?',
    opts: [
      { txt: 'Projetar salas e estúdios com acústica perfeita', pts: 3 },
      { txt: 'Controlar ruídos industriais e urbanos', pts: 2 },
      { txt: 'Desenvolver tecnologias de ultrassom', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Física do som, vibrações, isolamento acústico, ultrassom, acústica de salas.',
    pra: 'Projeta ambientes controlados, resolve problemas de ruído, desenvolve soluções.',
    pf: 'Interesse em física e música, analítico, resolve problemas de conforto.',
    at: 'Construtoras, estúdios, indústrias, fabricantes de equipamentos.',
    cs: '5 anos · Especialização rara com alta demanda específica.',
  },

  // ── Zona 4 — Engenharia Digital ───────────────────────────────────────────
  {
    id: 'computacao', zone: 4, emoji: '💻', cor: '#00BFFF', nome: 'Engenharia da Computação',
    msg: 'Projeto os chips e sistemas que fazem tudo funcionar. Hardware e software são minha linguagem.',
    pergunta: 'O que mais te atrai em computação?',
    opts: [
      { txt: 'Projetar processadores e hardware', pts: 3 },
      { txt: 'Desenvolver sistemas embarcados e IoT', pts: 2 },
      { txt: 'Programar próximo ao hardware', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Arquitetura de computadores, sistemas digitais, eletrônica, programação, embarcados.',
    pra: 'Projeta hardware, desenvolve sistemas embarcados, cria soluções de IoT.',
    pf: 'Interesse em hardware e software, raciocínio lógico aguçado, gosta de baixo nível.',
    at: 'Intel, ARM, semicondutores, startups de IoT, defesa, telecomunicações.',
    cs: '5 anos · Perfil mais técnico que Ciência da Computação — foco em hardware.',
  },
  {
    id: 'software', zone: 4, emoji: '📱', cor: '#00BFFF', nome: 'Engenharia de Software',
    msg: 'Construo sistemas que não falham. Arquitetura, testes, qualidade — software de nível industrial.',
    pergunta: 'O que mais te atrai em software?',
    opts: [
      { txt: 'Arquitetar sistemas complexos e escaláveis', pts: 3 },
      { txt: 'Garantir qualidade e testes automatizados', pts: 2 },
      { txt: 'Gerenciar projetos com metodologias ágeis', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 4 anos',
    est: 'Engenharia de requisitos, arquitetura, testes, DevOps, metodologias ágeis, segurança.',
    pra: 'Projeta arquitetura de sistemas, lidera equipes de desenvolvimento, garante qualidade.',
    pf: 'Organizado, raciocínio lógico, interesse em processos e qualidade.',
    at: 'Empresas de tecnologia, bancos, startups, consultorias.',
    cs: '4 anos · Uma das profissões mais demandadas e bem pagas do mercado.',
  },
  {
    id: 'telecomunicacoes', zone: 4, emoji: '📡', cor: '#00BFFF', nome: 'Eng. de Telecomunicações',
    msg: 'Conecto o mundo. Do 5G ao satélite, projeto as redes que fazem a comunicação acontecer.',
    pergunta: 'O que mais te fascina em telecomunicações?',
    opts: [
      { txt: 'Desenvolver redes 5G e comunicação sem fio', pts: 3 },
      { txt: 'Projetar sistemas de satélites', pts: 2 },
      { txt: 'Criar infraestrutura para internet de alta velocidade', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Redes de comunicação, sinais, antenas, fibra óptica, 5G, satélites.',
    pra: 'Projeta redes de comunicação, antenas, sistemas de satélite e infraestrutura.',
    pf: 'Interesse em tecnologia e comunicação, raciocínio matemático, física de ondas.',
    at: 'Claro, Vivo, TIM, Embratel, Anatel, aeroespacial, provedores.',
    cs: '5 anos · Setor em evolução com 5G, IoT e conectividade global.',
  },
  {
    id: 'sistemas', zone: 4, emoji: '🖥️', cor: '#00BFFF', nome: 'Engenharia de Sistemas',
    msg: 'Enxergo o todo. Projeto sistemas complexos integrando hardware, software e pessoas.',
    pergunta: 'O que mais te atrai em sistemas complexos?',
    opts: [
      { txt: 'Integrar tecnologias diferentes num sistema único', pts: 3 },
      { txt: 'Gerenciar projetos de grande escala', pts: 2 },
      { txt: 'Modelar e simular sistemas', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Modelagem de sistemas, integração, gestão de projetos complexos, simulação.',
    pra: 'Coordena desenvolvimento de sistemas como aviões, satélites e plantas industriais.',
    pf: 'Visão sistêmica, capacidade de coordenação, interesse em múltiplas áreas.',
    at: 'Aeroespacial, defesa, automobilística, alta tecnologia, consultorias.',
    cs: '5 anos · Perfil generalista e estratégico — ideal para liderança técnica.',
  },
  {
    id: 'automacao', zone: 4, emoji: '🦾', cor: '#00BFFF', nome: 'Eng. de Controle e Automação',
    msg: 'Automatizo o mundo. Programo sistemas que operam sozinhos com precisão e segurança.',
    pergunta: 'O que mais te atrai em automação?',
    opts: [
      { txt: 'Programar CLPs e sistemas SCADA', pts: 3 },
      { txt: 'Desenvolver drones e veículos autônomos', pts: 2 },
      { txt: 'Criar sistemas inteligentes com IA', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Controle automático, CLPs, robótica industrial, instrumentação, SCADA, IA aplicada.',
    pra: 'Programa sistemas automatizados, projeta robôs industriais, implementa Indústria 4.0.',
    pf: 'Preciso, gosta de matemática e programação, interesse em robótica.',
    at: 'Petrobras, química, alimentícia, automobilística, qualquer planta industrial.',
    cs: '5 anos · Área em explosão com a digitalização industrial.',
  },

  // ── Zona 5 — Química & Processos ──────────────────────────────────────────
  {
    id: 'quimica', zone: 5, emoji: '⚗️', cor: '#9B59B6', nome: 'Engenharia Química',
    msg: 'Transformo matéria em valor. Projeto os processos que fabricam tudo — de plástico a remédio.',
    pergunta: 'O que mais te atrai em processos químicos?',
    opts: [
      { txt: 'Projetar refinarias e plantas químicas', pts: 3 },
      { txt: 'Desenvolver novos produtos químicos', pts: 2 },
      { txt: 'Otimizar processos para eficiência', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Termodinâmica química, cinética, operações unitárias, reatores, controle, segurança.',
    pra: 'Projeta plantas industriais, otimiza processos, desenvolve produtos e materiais.',
    pf: 'Interesse em química e matemática, visão de processos, resolve problemas complexos.',
    at: 'Petrobras, Braskem, farmacêutica, alimentos, papel e celulose, fertilizantes.',
    cs: '5 anos · Uma das engenharias com maior diversidade de atuação.',
  },
  {
    id: 'bioquimica', zone: 5, emoji: '🧬', cor: '#9B59B6', nome: 'Engenharia Bioquímica',
    msg: 'Uso microrganismos como fábricas. Produzo medicamentos, biocombustíveis e alimentos do futuro.',
    pergunta: 'O que mais te fascina em biotecnologia?',
    opts: [
      { txt: 'Produzir medicamentos via fermentação', pts: 3 },
      { txt: 'Desenvolver biocombustíveis sustentáveis', pts: 2 },
      { txt: 'Criar alimentos via bioprocessos', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Bioquímica, microbiologia, biorreatores, fermentação, bioprocessos, bioinformática.',
    pra: 'Desenvolve bioprocessos para fármacos, biocombustíveis e alimentos.',
    pf: 'Interesse em biologia e química, gosta de laboratório, visão de processos.',
    at: 'Farmacêuticas, biocombustíveis, alimentos, cosméticos, institutos de pesquisa.',
    cs: '5 anos · Área em expansão com biotecnologia industrial crescente.',
  },
  {
    id: 'petroleo', zone: 5, emoji: '🛢️', cor: '#9B59B6', nome: 'Engenharia de Petróleo',
    msg: 'Extraio o recurso que move o mundo — com precisão, segurança e cada vez mais tecnologia.',
    pergunta: 'O que mais te atrai em petróleo e gás?',
    opts: [
      { txt: 'Exploração e perfuração de poços offshore', pts: 3 },
      { txt: 'Simulação de reservatórios', pts: 2 },
      { txt: 'Transição para energias mais limpas', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Geologia do petróleo, perfuração, reservatórios, produção, refinamento.',
    pra: 'Explora campos, otimiza produção de poços, projeta plataformas.',
    pf: 'Interesse em geologia e química, disposição para campo e offshore.',
    at: 'Petrobras, Shell, TotalEnergies, Schlumberger, Halliburton.',
    cs: '5 anos · Alta remuneração — setor estratégico para a economia brasileira.',
  },

  // ── Zona 6 — Ambiental & Agro ─────────────────────────────────────────────
  {
    id: 'ambiental', zone: 6, emoji: '🌿', cor: '#27AE60', nome: 'Eng. Ambiental e Sanitária',
    msg: 'Protejo o planeta enquanto a indústria avança. Saneamento, poluição e sustentabilidade são minha missão.',
    pergunta: 'O que mais te motiva em engenharia ambiental?',
    opts: [
      { txt: 'Tratar efluentes e garantir água limpa', pts: 3 },
      { txt: 'Recuperar áreas degradadas', pts: 2 },
      { txt: 'Desenvolver gestão de resíduos', pts: 2 },
      { txt: 'Não me identifico', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Tratamento de água e esgoto, gestão de resíduos, impacto ambiental, saneamento.',
    pra: 'Projeta sistemas de tratamento, realiza estudos de impacto, soluções sustentáveis.',
    pf: 'Comprometido com sustentabilidade, interesse em química e biologia.',
    at: 'Saneamento, mineração, indústrias, prefeituras, consultorias, IBAMA.',
    cs: '5 anos · Demanda crescente com pressões ambientais globais.',
  },
  {
    id: 'florestal', zone: 6, emoji: '🌲', cor: '#27AE60', nome: 'Engenharia Florestal',
    msg: 'Florestas são meu laboratório. Manejo e preservo ecossistemas para as próximas gerações.',
    pergunta: 'O que mais te atrai em florestas?',
    opts: [
      { txt: 'Manejo sustentável de florestas', pts: 3 },
      { txt: 'Preservação de biodiversidade', pts: 2 },
      { txt: 'Recuperação de áreas degradadas', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Silvicultura, manejo florestal, dendrologia, ecologia, inventário, legislação.',
    pra: 'Planeja manejo florestal, recupera áreas degradadas, faz inventários.',
    pf: 'Gosta de natureza e campo, interesse em biologia e ecologia.',
    at: 'Papel e celulose, IBAMA, EMBRAPA, reflorestadoras, consultorias.',
    cs: '5 anos · Essencial para a bioeconomia e agenda climática.',
  },
  {
    id: 'agricola', zone: 6, emoji: '🌾', cor: '#27AE60', nome: 'Engenharia Agrícola',
    msg: 'Coloco tecnologia no campo. Mecanizo, irigo e preservo para alimentar bilhões de pessoas.',
    pergunta: 'O que mais te atrai em engenharia agrícola?',
    opts: [
      { txt: 'Desenvolver máquinas para o campo', pts: 3 },
      { txt: 'Projetar sistemas de irrigação', pts: 2 },
      { txt: 'Integrar tecnologia e agricultura de precisão', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Mecanização agrícola, irrigação, armazenamento, construções rurais, energia.',
    pra: 'Projeta irrigação, seleciona máquinas, planeja infraestrutura rural.',
    pf: 'Interesse em campo e tecnologia, gosta de matemática aplicada, espírito prático.',
    at: 'EMBRAPA, maquinário agrícola, cooperativas, agronegócio.',
    cs: '5 anos · Setor estratégico para o agronegócio brasileiro.',
  },
  {
    id: 'pesca', zone: 6, emoji: '🐟', cor: '#27AE60', nome: 'Engenharia de Pesca',
    msg: 'Manejo os recursos do mar e dos rios com responsabilidade para que nunca se esgotem.',
    pergunta: 'O que mais te fascina em recursos pesqueiros?',
    opts: [
      { txt: 'Desenvolver aquicultura sustentável', pts: 3 },
      { txt: 'Pesquisar populações de peixes', pts: 2 },
      { txt: 'Melhorar processamento de pescados', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Aquicultura, tecnologia pesqueira, limnologia, oceanografia, processamento.',
    pra: 'Gerencia aquicultura, pesquisa recursos pesqueiros, projeta cultivo.',
    pf: 'Gosta de água e natureza, interesse em biologia e tecnologia.',
    at: 'MPA, aquicultura, frigoríficos, institutos de pesquisa, cooperativas.',
    cs: '5 anos · Setor em expansão com crescimento da aquicultura global.',
  },

  // ── Zona 7 — Aeroespacial & Física ────────────────────────────────────────
  {
    id: 'aeronautica', zone: 7, emoji: '✈️', cor: '#3498DB', nome: 'Engenharia Aeronáutica',
    msg: 'Conquisto o céu. Projeto aeronaves que desafiam a gravidade com segurança e eficiência.',
    pergunta: 'O que mais te fascina em aviação?',
    opts: [
      { txt: 'Projetar aviões mais eficientes', pts: 3 },
      { txt: 'Desenvolver foguetes e satélites', pts: 2 },
      { txt: 'Calcular aerodinâmica', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Aerodinâmica, propulsão, estruturas aeronáuticas, dinâmica de voo, aviônica.',
    pra: 'Projeta aeronaves, analisa aerodinâmica, desenvolve sistemas de propulsão.',
    pf: 'Interesse em física e matemática, fascínio por voar, raciocínio espacial.',
    at: 'Embraer, Boeing, Airbus, FAB, ITA, NASA, manutenção aeronáutica.',
    cs: '5 anos · Alta exigência técnica e excelente remuneração.',
  },
  {
    id: 'fisica', zone: 7, emoji: '⚛️', cor: '#3498DB', nome: 'Engenharia Física',
    msg: 'Aplico as leis mais fundamentais da física para criar tecnologias que parecem ficção científica.',
    pergunta: 'O que mais te atrai em física aplicada?',
    opts: [
      { txt: 'Desenvolver tecnologias quânticas', pts: 3 },
      { txt: 'Criar instrumentos ultra-precisos', pts: 2 },
      { txt: 'Pesquisar fenômenos físicos e aplicações', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Física avançada, óptica, laser, supercondutividade, física quântica, instrumentação.',
    pra: 'Desenvolve tecnologias ópticas, instrumentos de precisão, dispositivos quânticos.',
    pf: 'Profundo interesse em física, raciocínio matemático avançado, curiosidade científica.',
    at: 'Institutos de pesquisa, NASA, CERN, instrumentação, telecomunicações, defesa.',
    cs: '5 anos · Perfil altamente científico — base para pesquisa de ponta.',
  },
  {
    id: 'nanotecnologia', zone: 7, emoji: '🔩', cor: '#3498DB', nome: 'Nanotecnologia',
    msg: 'Trabalho no invisível. Na escala de nanômetros, crio materiais e dispositivos do futuro.',
    pergunta: 'O que mais te fascina em nanotecnologia?',
    opts: [
      { txt: 'Criar materiais com propriedades radicalmente novas', pts: 3 },
      { txt: 'Desenvolver nanorobôs para medicina', pts: 2 },
      { txt: 'Aplicar nano em eletrônica quântica', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Física quântica, química de superfícies, nanoestruturas, microscopia.',
    pra: 'Pesquisa e desenvolve nanoestruturas para eletrônica, medicina, energia.',
    pf: 'Altamente curioso, interesse em física e química, pesquisa de fronteira.',
    at: 'Laboratórios de pesquisa, semicondutores, farmacêuticas, defesa.',
    cs: '5 anos · Área de fronteira científica com aplicações transformadoras.',
  },

  // ── Zona 8 — Mineração & Produção ─────────────────────────────────────────
  {
    id: 'minas', zone: 8, emoji: '⛏️', cor: '#CD853F', nome: 'Engenharia de Minas',
    msg: 'Extraio da terra os recursos que a civilização precisa. Segurança e sustentabilidade primeiro.',
    pergunta: 'O que mais te atrai em mineração?',
    opts: [
      { txt: 'Planejar minas com segurança', pts: 3 },
      { txt: 'Desenvolver técnicas menos impactantes', pts: 2 },
      { txt: 'Processar minérios eficientemente', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Geomecânica, lavra de minas, processamento mineral, segurança, geologia.',
    pra: 'Planeja operações, projeta extração, controla qualidade e segurança.',
    pf: 'Gosta de geologia e campo, tecnologia pesada, preocupação com segurança.',
    at: 'Vale, Anglo American, Samarco, carvão, calcário, consultoria mineral.',
    cs: '5 anos · Alta remuneração — setor estratégico para commodities brasileiras.',
  },
  {
    id: 'producao', zone: 8, emoji: '📊', cor: '#CD853F', nome: 'Engenharia de Produção',
    msg: 'Otimizo sistemas produtivos. Menos desperdício, mais eficiência — em qualquer indústria.',
    pergunta: 'O que mais te atrai em gestão da produção?',
    opts: [
      { txt: 'Otimizar processos e reduzir desperdícios', pts: 3 },
      { txt: 'Usar dados e IA para decisões industriais', pts: 2 },
      { txt: 'Gerenciar cadeias de suprimento', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Pesquisa operacional, qualidade, logística, ergonomia, lean manufacturing.',
    pra: 'Analisa e otimiza processos, gerencia qualidade, planeja produção.',
    pf: 'Analítico, organizado, gosta de gestão e tecnologia, visão de sistemas.',
    at: 'Qualquer setor — automobilística, alimentícia, farmacêutica, logística.',
    cs: '5 anos · Engenharia mais versátil do Brasil — atua em todos os setores.',
  },
  {
    id: 'madeireira', zone: 8, emoji: '🪵', cor: '#CD853F', nome: 'Eng. Industrial Madeireira',
    msg: 'Transformo florestas em produtos com responsabilidade. Da árvore ao móvel, com ciência.',
    pergunta: 'O que mais te atrai em indústria madeireira?',
    opts: [
      { txt: 'Desenvolver produtos de madeira de alta qualidade', pts: 3 },
      { txt: 'Otimizar o processamento sustentável', pts: 2 },
      { txt: 'Criar novos materiais à base de madeira', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Tecnologia da madeira, beneficiamento, secagem, tratamento, produtos.',
    pra: 'Gerencia serraria, produz painéis e compensados, desenvolve produtos.',
    pf: 'Interesse em materiais naturais e processos industriais, sustentabilidade.',
    at: 'Indústria moveleira, papel e celulose, construção civil, beneficiamento.',
    cs: '5 anos · Setor estratégico com foco crescente em sustentabilidade.',
  },
  {
    id: 'textil', zone: 8, emoji: '🧵', cor: '#CD853F', nome: 'Engenharia Têxtil',
    msg: 'Da fibra ao tecido ao produto final — gerencio toda a cadeia que veste o mundo.',
    pergunta: 'O que mais te fascina em têxteis?',
    opts: [
      { txt: 'Desenvolver tecidos funcionais e inteligentes', pts: 3 },
      { txt: 'Otimizar processos de fiação e tecelagem', pts: 2 },
      { txt: 'Criar materiais têxteis sustentáveis', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Fiação, tecelagem, beneficiamento, controle de qualidade, fibras técnicas.',
    pra: 'Gerencia produção têxtil, desenvolve materiais, controla qualidade.',
    pf: 'Interesse em processos industriais e materiais, química e física aplicada.',
    at: 'Indústria têxtil, moda, materiais esportivos, fibras para compostos.',
    cs: '5 anos · Indústria em transformação com tecidos técnicos e inteligentes.',
  },

  // ── Zona 9 — Biomédica & Especial ─────────────────────────────────────────
  {
    id: 'biomedica', zone: 9, emoji: '🏥', cor: '#E74C3C', nome: 'Engenharia Biomédica',
    msg: 'Salvo vidas com tecnologia. Projeto os equipamentos que médicos usam para diagnóstico e tratamento.',
    pergunta: 'O que mais te atrai em engenharia biomédica?',
    opts: [
      { txt: 'Desenvolver equipamentos de diagnóstico', pts: 3 },
      { txt: 'Criar próteses e implantes inteligentes', pts: 2 },
      { txt: 'Programar sistemas hospitalares', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Instrumentação biomédica, imagens médicas, biomecânica, biomateriais.',
    pra: 'Desenvolve equipamentos médicos, monitora sistemas, pesquisa implantes.',
    pf: 'Interesse em saúde e tecnologia, motivação por impacto humano direto.',
    at: 'Philips Healthcare, Medtronic, hospitais, startups healthtech, pesquisa.',
    cs: '5 anos · Área em explosão com revolução da saúde digital.',
  },
  {
    id: 'seguranca', zone: 9, emoji: '🦺', cor: '#E74C3C', nome: 'Eng. de Segurança no Trabalho',
    msg: 'Minha missão é garantir que ninguém se machuque no trabalho. Zero acidentes é minha meta.',
    pergunta: 'O que mais te motiva em segurança?',
    opts: [
      { txt: 'Analisar riscos e prevenir acidentes', pts: 3 },
      { txt: 'Desenvolver normas de segurança', pts: 2 },
      { txt: 'Investigar acidentes para evitar recorrência', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Higiene ocupacional, ergonomia, NRs, gestão de riscos, PPRA, PCMSO.',
    pra: 'Analisa riscos, implementa programas de saúde, treina trabalhadores.',
    pf: 'Responsável, comprometido com bem-estar humano, interesse em legislação.',
    at: 'Todas as indústrias, construção, mineração, petróleo, consultorias SST.',
    cs: '5 anos · Carreira obrigatória por lei em empresas de médio e grande porte.',
  },
  {
    id: 'alimentos', zone: 9, emoji: '🍕', cor: '#E74C3C', nome: 'Engenharia de Alimentos',
    msg: 'Garanto que o que você come é seguro, saboroso e nutritivo. Alimento o mundo com tecnologia.',
    pergunta: 'O que mais te atrai em tecnologia de alimentos?',
    opts: [
      { txt: 'Desenvolver novos produtos alimentícios', pts: 3 },
      { txt: 'Garantir qualidade e segurança alimentar', pts: 2 },
      { txt: 'Criar embalagens e conservação inovadores', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Tecnologia de alimentos, microbiologia, química alimentar, conservação, embalagem.',
    pra: 'Desenvolve alimentos, controla qualidade, projeta processos industriais.',
    pf: 'Interesse em química e biologia, laboratório, saúde e nutrição.',
    at: 'JBS, Nestlé, BRF, Ambev, Embrapa, vigilância sanitária.',
    cs: '5 anos · Setor sempre em crescimento — alimentação é necessidade básica.',
  },
  {
    id: 'naval', zone: 9, emoji: '🚢', cor: '#E74C3C', nome: 'Engenharia Naval',
    msg: 'Projeto navios que cruzam oceanos. Do casco à propulsão, domino a engenharia das águas.',
    pergunta: 'O que mais te fascina em engenharia naval?',
    opts: [
      { txt: 'Projetar navios de grande porte', pts: 3 },
      { txt: 'Desenvolver plataformas offshore', pts: 2 },
      { txt: 'Criar embarcações sustentáveis', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Arquitetura naval, hidrodinâmica, estruturas navais, propulsão, offshore.',
    pra: 'Projeta embarcações, calcula estabilidade, supervisiona construção naval.',
    pf: 'Interesse em física, fascínio pelo mar, raciocínio espacial.',
    at: 'Transpetro, Petrobras, estaleiros, Marinha do Brasil, offshore.',
    cs: '5 anos · Setor estratégico com plataformas do pré-sal.',
  },
  {
    id: 'biossistemas', zone: 9, emoji: '🌱', cor: '#E74C3C', nome: 'Engenharia de Biossistemas',
    msg: 'Integro tecnologia e biologia para criar sistemas de produção sustentável.',
    pergunta: 'O que mais te atrai em biossistemas?',
    opts: [
      { txt: 'Desenvolver sistemas agrícolas inteligentes', pts: 3 },
      { txt: 'Integrar biotecnologia com produção', pts: 2 },
      { txt: 'Criar soluções para problemas ambientais', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Sistemas biológicos, automação agrícola, biotecnologia, energias renováveis.',
    pra: 'Desenvolve sistemas de produção sustentável integrando biologia e tecnologia.',
    pf: 'Visão multidisciplinar, biologia e tecnologia, compromisso com sustentabilidade.',
    at: 'Agronegócio tecnológico, startups agtech, Embrapa, pesquisa.',
    cs: '5 anos · Curso inovador na interface entre biologia e tecnologia.',
  },
  {
    id: 'inovacao', zone: 9, emoji: '💡', cor: '#E74C3C', nome: 'Engenharia de Inovação',
    msg: 'Inovo por design. Lidero projetos que transformam ideias em produtos que o mundo ainda não viu.',
    pergunta: 'O que mais te atrai em inovação?',
    opts: [
      { txt: 'Liderar projetos inovadores do zero ao mercado', pts: 3 },
      { txt: 'Integrar design thinking com engenharia', pts: 2 },
      { txt: 'Criar startups de tecnologia', pts: 2 },
      { txt: 'Não me interessa', pts: 0 },
    ],
    sub: 'Bacharelado · 5 anos',
    est: 'Design thinking, gestão da inovação, empreendedorismo, prototipagem.',
    pra: 'Lidera projetos de inovação, cria startups, desenvolve novos produtos.',
    pf: 'Criativo, empreendedor, conecta tecnologia e mercado, liderança natural.',
    at: 'Startups, centros de inovação, consultorias, aceleradoras, P&D.',
    cs: '5 anos · Focado no empreendedor tecnológico do século XXI.',
  },
]

const ZONE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const STAR_LABELS = ['Não é pra mim', '', '', '', 'É a minha área!']

// ── Component ─────────────────────────────────────────────────────────────────

export default function Engenhoso({
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
      topCourses: sorted.slice(0, 5).map(c => ({
        id: c.id, nome: c.nome, pts: answers[c.id]!.pts, star: answers[c.id]!.star,
      })),
      zoneScores: Object.fromEntries(
        ZONE_IDS.map(z => {
          const zoneCursos = CURSOS.filter(c => c.zone === z)
          const zonePts = zoneCursos.reduce((s, c) => s + (answers[c.id]?.pts ?? 0), 0)
          return [String(z), { nome: ZONES[z].nome, pts: zonePts }]
        })
      ),
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
          <div className={styles.heroIcon}>⚙️</div>
          <h1 className={styles.heroTitle}>ENGENHOSO</h1>
          <p className={styles.heroSub}>Engenharias &amp; Produção</p>
          <div className={styles.introBox}>
            <p>
              <strong>37 engenharias</strong> divididas em 9 zonas temáticas.{' '}
              Cada curso vai <strong>se apresentar diretamente</strong> para você —
              responda o que sente ao ouvi-los.
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
            <div className={styles.resultTrophy}>⚙️</div>
            <div className={styles.resultTitle}>ANÁLISE CONCLUÍDA</div>
            <div className={styles.resultSub}>
              {totalPts} pontos · {answeredCount} engenharias exploradas
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
          <div className={styles.hudTitle}>ENGENHOSO</div>
          <div className={styles.hudSub}>Engenharias &amp; Produção</div>
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

      {/* Card grid with zone headers */}
      <div className={styles.grid}>
        {ZONE_IDS.flatMap(zoneId => {
          const zone = ZONES[zoneId]
          const zoneCursos = CURSOS.filter(c => c.zone === zoneId)
          return [
            <div
              key={`zone-${zoneId}`}
              className={styles.zoneSection}
              style={{ color: zoneCursos[0]?.cor ?? '#FF6B35' }}
            >
              {zone.emoji} {zone.nome}
            </div>,
            ...zoneCursos.map(curso => {
              const ans = answers[curso.id]
              return (
                <div
                  key={curso.id}
                  className={`${styles.card}${ans ? ` ${styles.done}` : ''}`}
                  onClick={() => openCard(curso.id)}
                >
                  <div
                    className={styles.cardThumb}
                    style={{ background: `${curso.cor}18` }}
                  >
                    <span style={{ fontSize: 26, color: curso.cor }}>{curso.emoji}</span>
                  </div>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardNome}>{curso.nome}</div>
                  </div>
                  {ans && <div className={styles.cardCheck}>✓</div>}
                </div>
              )
            }),
          ]
        })}
      </div>

      {/* Ver resultados button */}
      {allDone && (
        <button className={styles.btnResult} onClick={showResult}>
          Ver Resultados
        </button>
      )}

      {/* Modal */}
      {activeCurso && (
        <div
          className={styles.modalOverlay}
          onClick={e => {
            if (e.target === e.currentTarget) {
              setActiveId(null); setChosen(null); setShowReveal(false); setStarVal(0)
            }
          }}
        >
          <div className={styles.modalBox}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalEmoji}>{activeCurso.emoji}</div>
              <div className={styles.modalNome}>{activeCurso.nome}</div>
              <span
                className={styles.modalZone}
                style={{
                  background: `${activeCurso.cor}22`,
                  color: activeCurso.cor,
                  border: `1px solid ${activeCurso.cor}44`,
                }}
              >
                {ZONES[activeCurso.zone].emoji} {ZONES[activeCurso.zone].nome}
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

            {/* Pts reveal */}
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
                <div className={styles.revealInfo}>{activeCurso.est}</div>
                <div className={styles.revealLabel}>Na prática</div>
                <div className={styles.revealInfo}>{activeCurso.pra}</div>
                <div className={styles.revealLabel}>Onde atua</div>
                <div className={styles.revealInfo}>{activeCurso.at}</div>
                <div className={styles.revealLabel}>Duração</div>
                <div className={styles.revealInfo}>{activeCurso.sub}</div>
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

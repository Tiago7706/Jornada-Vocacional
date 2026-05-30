'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { GameProps } from '@/types/database'
import s from './RiasecBattleCards.module.css'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TypeData {
  name: string; color: string; bg: string; border: string; fill: string
  tagline: string; desc: string; school: string; traits: string[]
  stats: Record<string, number>; superpowers: string[]; shadow: string; careers: string[]
}

interface Battle {
  a: string; b: string; q: string; ra: string; rb: string; flip?: boolean
}

interface GState {
  sc: Record<string, number>
  r: number
  xp: number
  vt: boolean
  nc: number
  q: Battle[]
  ancora: string | null
  votos: Record<number, string>
}

type Screen = 'intro' | 'instrucoes' | 'battle' | 'break' | 'ancora' | 'result'

// ─────────────────────────────────────────────────────────────────────────────
// Game Data
// ─────────────────────────────────────────────────────────────────────────────

const AV: Record<string, string> = {
  R: `<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="200" fill="#7A2E10"/><defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D85A30" stop-opacity=".6"/><stop offset="100%" stop-color="#3d1508" stop-opacity=".9"/></linearGradient></defs><rect width="160" height="200" fill="url(#rg)" opacity=".5"/><ellipse cx="80" cy="192" rx="38" ry="6" fill="rgba(0,0,0,.35)"/><rect x="58" y="168" width="18" height="22" rx="4" fill="#2a1a0a"/><rect x="84" y="168" width="18" height="22" rx="4" fill="#2a1a0a"/><rect x="60" y="138" width="16" height="34" rx="4" fill="#4a3520"/><rect x="84" y="138" width="16" height="34" rx="4" fill="#4a3520"/><rect x="54" y="135" width="52" height="8" rx="3" fill="#8B6914"/><rect x="76" y="134" width="10" height="10" rx="2" fill="#D4A017"/><rect x="52" y="90" width="56" height="50" rx="8" fill="#C8640A"/><rect x="68" y="72" width="8" height="24" rx="3" fill="#C8640A"/><rect x="84" y="72" width="8" height="24" rx="3" fill="#C8640A"/><rect x="72" y="64" width="16" height="14" rx="5" fill="#C68642"/><ellipse cx="80" cy="56" rx="22" ry="22" fill="#C68642"/><ellipse cx="72" cy="54" rx="4" ry="4.5" fill="#fff"/><ellipse cx="88" cy="54" rx="4" ry="4.5" fill="#fff"/><ellipse cx="73" cy="55" rx="2.5" ry="3" fill="#3d2800"/><ellipse cx="89" cy="55" rx="2.5" ry="3" fill="#3d2800"/><path d="M74 66 Q80 70 86 66" stroke="#8B4513" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M52 52 Q52 28 80 28 Q108 28 108 52 Z" fill="#F5C518"/><rect x="48" y="50" width="64" height="8" rx="3" fill="#E6B800"/><circle cx="58" cy="56" r="5" fill="#E6B800"/><circle cx="102" cy="56" r="5" fill="#E6B800"/><rect x="30" y="92" width="22" height="12" rx="5" fill="#C8640A"/><rect x="22" y="100" width="16" height="10" rx="4" fill="#C68642"/><rect x="8" y="95" width="26" height="8" rx="3" fill="#888"/><circle cx="10" cy="99" r="6" fill="none" stroke="#888" stroke-width="3"/><circle cx="32" cy="99" r="5" fill="none" stroke="#888" stroke-width="3"/><rect x="108" y="88" width="22" height="12" rx="5" fill="#C8640A"/><rect x="122" y="82" width="12" height="24" rx="4" fill="#C68642"/><rect x="118" y="60" width="8" height="28" rx="3" fill="#8B6914"/><rect x="108" y="55" width="28" height="16" rx="4" fill="#555"/></svg>`,
  I: `<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="200" fill="#0A3A6E"/><defs><linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#378ADD" stop-opacity=".5"/><stop offset="100%" stop-color="#020f24" stop-opacity=".95"/></linearGradient></defs><rect width="160" height="200" fill="url(#ig)" opacity=".6"/><ellipse cx="80" cy="193" rx="36" ry="5" fill="rgba(0,0,0,.35)"/><rect x="60" y="170" width="16" height="20" rx="4" fill="#1a2a4a"/><rect x="84" y="170" width="16" height="20" rx="4" fill="#1a2a4a"/><rect x="61" y="138" width="15" height="36" rx="4" fill="#1E3A6E"/><rect x="84" y="138" width="15" height="36" rx="4" fill="#1E3A6E"/><rect x="50" y="88" width="60" height="56" rx="8" fill="#e8eef8"/><path d="M80 88 L62 100 L62 88 Z" fill="#c8d4e8"/><path d="M80 88 L98 100 L98 88 Z" fill="#c8d4e8"/><circle cx="80" cy="105" r="2" fill="#aab8cc"/><circle cx="80" cy="116" r="2" fill="#aab8cc"/><rect x="73" y="65" width="14" height="12" rx="4" fill="#d4a574"/><ellipse cx="80" cy="52" rx="21" ry="22" fill="#d4a574"/><path d="M59 45 Q60 22 80 22 Q100 22 101 45" fill="#1a0a00"/><rect x="61" y="48" width="14" height="11" rx="4" fill="none" stroke="#1a1a4a" stroke-width="2"/><rect x="85" y="48" width="14" height="11" rx="4" fill="none" stroke="#1a1a4a" stroke-width="2"/><line x1="75" y1="53" x2="85" y2="53" stroke="#1a1a4a" stroke-width="1.5"/><circle cx="68" cy="53" r="3.5" fill="#fff"/><circle cx="92" cy="53" r="3.5" fill="#fff"/><circle cx="69" cy="54" r="2" fill="#1a0a00"/><circle cx="93" cy="54" r="2" fill="#1a0a00"/><path d="M73 63 Q80 67 87 63" stroke="#8B5020" stroke-width="1.5" fill="none" stroke-linecap="round"/><rect x="28" y="90" width="22" height="12" rx="5" fill="#e8eef8"/><rect x="18" y="98" width="18" height="12" rx="4" fill="#d4a574"/><rect x="10" y="88" width="24" height="30" rx="3" fill="#1E3A6E"/><rect x="110" y="86" width="22" height="12" rx="5" fill="#e8eef8"/><rect x="120" y="78" width="12" height="22" rx="4" fill="#d4a574"/><rect x="126" y="48" width="6" height="36" rx="3" fill="#1a2a4a"/><circle cx="129" cy="46" r="5" fill="#378ADD"/><line x1="129" y1="40" x2="129" y2="10" stroke="#7BB8F0" stroke-width="2" opacity=".7" stroke-dasharray="3 2"/></svg>`,
  A: `<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="200" fill="#5C1A30"/><defs><linearGradient id="ag" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#D4537E" stop-opacity=".4"/><stop offset="100%" stop-color="#8B1a4a" stop-opacity=".7"/></linearGradient><linearGradient id="cap" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9B2050"/><stop offset="100%" stop-color="#4a0a20"/></linearGradient></defs><rect width="160" height="200" fill="url(#ag)"/><ellipse cx="80" cy="193" rx="34" ry="5" fill="rgba(0,0,0,.35)"/><path d="M60 168 L60 190 Q60 195 68 195 L74 195 L74 168 Z" fill="#2a0a15"/><path d="M86 168 L86 190 Q86 195 94 195 L100 195 L100 168 Z" fill="#2a0a15"/><rect x="61" y="138" width="14" height="34" rx="3" fill="#3d0a1e"/><rect x="85" y="138" width="14" height="34" rx="3" fill="#3d0a1e"/><path d="M52 90 Q20 110 10 160 Q15 165 22 158 Q35 120 55 108 Z" fill="url(#cap)" opacity=".9"/><rect x="52" y="88" width="56" height="54" rx="8" fill="#8B1a4a"/><rect x="73" y="64" width="14" height="14" rx="5" fill="#C68642"/><ellipse cx="80" cy="50" rx="20" ry="22" fill="#C68642"/><path d="M60 44 Q55 20 65 14 Q70 10 75 18 Q78 12 80 12 Q82 12 85 18 Q90 10 95 14 Q105 20 100 44" fill="#1a0a05"/><ellipse cx="73" cy="50" rx="5" ry="5.5" fill="#fff"/><ellipse cx="87" cy="50" rx="5" ry="5.5" fill="#fff"/><ellipse cx="73" cy="51" rx="3.5" ry="4" fill="#1a0510"/><ellipse cx="87" cy="51" rx="3.5" ry="4" fill="#1a0510"/><path d="M74 62 Q80 67 87 63" stroke="#8B3040" stroke-width="1.5" fill="none" stroke-linecap="round"/><rect x="30" y="90" width="22" height="11" rx="5" fill="#8B1a4a"/><rect x="18" y="96" width="16" height="10" rx="4" fill="#C68642"/><ellipse cx="14" cy="106" rx="12" ry="9" fill="#6B0a2a"/><circle cx="10" cy="103" r="3" fill="#E24B4A"/><circle cx="16" cy="101" r="2.5" fill="#F5C518"/><rect x="108" y="86" width="22" height="11" rx="5" fill="#8B1a4a"/><rect x="120" y="78" width="12" height="20" rx="4" fill="#C68642"/><rect x="126" y="30" width="6" height="54" rx="3" fill="#8B6914"/><path d="M123 30 L129 14 L135 30 Z" fill="#D4537E"/></svg>`,
  S: `<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="200" fill="#1E4508"/><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#639922" stop-opacity=".5"/><stop offset="100%" stop-color="#0a1f04" stop-opacity=".9"/></linearGradient></defs><rect width="160" height="200" fill="url(#sg)" opacity=".7"/><ellipse cx="80" cy="193" rx="36" ry="5" fill="rgba(0,0,0,.35)"/><rect x="60" y="170" width="17" height="20" rx="4" fill="#1a2e0a"/><rect x="83" y="170" width="17" height="20" rx="4" fill="#1a2e0a"/><rect x="61" y="138" width="16" height="36" rx="4" fill="#2d5010"/><rect x="83" y="138" width="16" height="36" rx="4" fill="#2d5010"/><path d="M50 92 Q30 120 28 170 Q35 175 42 168 Q46 130 58 108 Z" fill="#1E4508" opacity=".85"/><path d="M110 92 Q130 120 132 170 Q125 175 118 168 Q114 130 102 108 Z" fill="#1E4508" opacity=".85"/><rect x="52" y="88" width="56" height="54" rx="8" fill="#2d5010"/><path d="M72 108 Q72 103 77 103 Q80 103 80 107 Q80 103 83 103 Q88 103 88 108 Q88 113 80 120 Q72 113 72 108 Z" fill="#97C459" opacity=".7"/><ellipse cx="50" cy="92" rx="10" ry="7" fill="#3d6815" stroke="#639922" stroke-width="1"/><ellipse cx="110" cy="92" rx="10" ry="7" fill="#3d6815" stroke="#639922" stroke-width="1"/><rect x="73" y="64" width="14" height="14" rx="5" fill="#C68642"/><ellipse cx="80" cy="50" rx="21" ry="22" fill="#C68642"/><path d="M59 42 Q62 20 80 20 Q98 20 101 42" fill="#4a2800"/><ellipse cx="72" cy="51" rx="5" ry="5" fill="#fff"/><ellipse cx="88" cy="51" rx="5" ry="5" fill="#fff"/><ellipse cx="72" cy="52" rx="3.5" ry="3.5" fill="#3d2000"/><ellipse cx="88" cy="52" rx="3.5" ry="3.5" fill="#3d2000"/><path d="M72 63 Q80 70 88 63" stroke="#8B4513" stroke-width="1.8" fill="none" stroke-linecap="round"/><rect x="30" y="88" width="22" height="12" rx="5" fill="#2d5010"/><rect x="18" y="92" width="16" height="12" rx="5" fill="#C68642"/><rect x="108" y="86" width="22" height="12" rx="5" fill="#2d5010"/><rect x="122" y="80" width="12" height="20" rx="4" fill="#C68642"/><rect x="128" y="24" width="6" height="168" rx="3" fill="#6B4F10"/><circle cx="131" cy="22" r="12" fill="none" stroke="#97C459" stroke-width="2"/><circle cx="131" cy="22" r="3" fill="#97C459"/><line x1="131" y1="10" x2="131" y2="34" stroke="#97C459" stroke-width="1.5"/><line x1="119" y1="22" x2="143" y2="22" stroke="#97C459" stroke-width="1.5"/></svg>`,
  E: `<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="200" fill="#4A2500"/><defs><linearGradient id="eg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#BA7517" stop-opacity=".6"/><stop offset="100%" stop-color="#1a0a00" stop-opacity=".9"/></linearGradient><linearGradient id="sw" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity=".9"/><stop offset="100%" stop-color="#aaa" stop-opacity=".7"/></linearGradient></defs><rect width="160" height="200" fill="url(#eg)" opacity=".7"/><ellipse cx="80" cy="193" rx="36" ry="5" fill="rgba(0,0,0,.35)"/><rect x="59" y="168" width="19" height="22" rx="3" fill="#2a1800"/><rect x="82" y="168" width="19" height="22" rx="3" fill="#2a1800"/><rect x="60" y="138" width="17" height="32" rx="3" fill="#8B6914"/><rect x="83" y="138" width="17" height="32" rx="3" fill="#8B6914"/><path d="M52 90 Q22 115 18 175 Q26 180 32 172 Q38 130 56 108 Z" fill="#8B1a00" opacity=".9"/><path d="M108 90 Q138 115 142 175 Q134 180 128 172 Q122 130 104 108 Z" fill="#8B1a00" opacity=".9"/><rect x="50" y="86" width="60" height="56" rx="6" fill="#BA7517"/><rect x="50" y="86" width="60" height="14" rx="6" fill="#D4A017"/><path d="M80 96 L86 110 L80 106 L74 110 Z" fill="#F5C518"/><path d="M38 84 Q30 88 28 98 Q30 108 40 108 L52 100 L52 84 Z" fill="#BA7517"/><path d="M122 84 Q130 88 132 98 Q130 108 120 108 L108 100 L108 84 Z" fill="#BA7517"/><rect x="68" y="62" width="24" height="14" rx="4" fill="#BA7517"/><ellipse cx="80" cy="48" rx="21" ry="22" fill="#C68642"/><path d="M59 38 Q62 18 80 18 Q98 18 101 38" fill="#2a1000"/><ellipse cx="72" cy="49" rx="5" ry="5" fill="#fff"/><ellipse cx="88" cy="49" rx="5" ry="5" fill="#fff"/><ellipse cx="72" cy="50" rx="3.5" ry="3.5" fill="#2a1000"/><ellipse cx="88" cy="50" rx="3.5" ry="3.5" fill="#2a1000"/><path d="M73 62 Q80 65 86 61" stroke="#8B4513" stroke-width="1.8" fill="none" stroke-linecap="round"/><rect x="28" y="86" width="24" height="12" rx="4" fill="#BA7517"/><rect x="16" y="90" width="16" height="14" rx="4" fill="#C68642"/><path d="M6 75 L6 108 Q6 118 16 122 Q26 118 26 108 L26 75 Q16 70 6 75 Z" fill="#8B6914"/><rect x="108" y="82" width="24" height="12" rx="4" fill="#BA7517"/><rect x="122" y="72" width="14" height="24" rx="4" fill="#C68642"/><rect x="127" y="6" width="8" height="72" rx="2" fill="url(#sw)"/><path d="M127 6 L131 0 L135 6 Z" fill="#fff" opacity=".9"/><rect x="116" y="70" width="30" height="8" rx="3" fill="#D4A017"/></svg>`,
  C: `<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="200" fill="#2A2175"/><defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7F77DD" stop-opacity=".5"/><stop offset="100%" stop-color="#0d0a30" stop-opacity=".9"/></linearGradient></defs><rect width="160" height="200" fill="url(#cg)" opacity=".6"/><line x1="0" y1="40" x2="160" y2="40" stroke="#7F77DD" stroke-width=".4" opacity=".2"/><line x1="0" y1="80" x2="160" y2="80" stroke="#7F77DD" stroke-width=".4" opacity=".2"/><line x1="0" y1="120" x2="160" y2="120" stroke="#7F77DD" stroke-width=".4" opacity=".2"/><line x1="40" y1="0" x2="40" y2="200" stroke="#7F77DD" stroke-width=".4" opacity=".2"/><line x1="80" y1="0" x2="80" y2="200" stroke="#7F77DD" stroke-width=".4" opacity=".2"/><line x1="120" y1="0" x2="120" y2="200" stroke="#7F77DD" stroke-width=".4" opacity=".2"/><ellipse cx="80" cy="193" rx="36" ry="5" fill="rgba(0,0,0,.35)"/><rect x="60" y="170" width="17" height="20" rx="3" fill="#1a1540"/><rect x="83" y="170" width="17" height="20" rx="3" fill="#1a1540"/><rect x="61" y="138" width="16" height="36" rx="3" fill="#3d3688"/><rect x="83" y="138" width="16" height="36" rx="3" fill="#3d3688"/><rect x="50" y="86" width="60" height="56" rx="6" fill="#4a4299"/><rect x="50" y="86" width="28" height="28" rx="4" fill="#5a52a9"/><rect x="82" y="86" width="28" height="28" rx="4" fill="#5a52a9"/><rect x="50" y="118" width="60" height="24" rx="4" fill="#5a52a9"/><rect x="36" y="84" width="16" height="20" rx="3" fill="#5a52a9"/><rect x="108" y="84" width="16" height="20" rx="3" fill="#5a52a9"/><rect x="72" y="62" width="16" height="14" rx="4" fill="#C68642"/><ellipse cx="80" cy="48" rx="21" ry="22" fill="#C68642"/><path d="M59 40 Q62 20 80 20 Q98 20 101 40" fill="#1a1540"/><rect x="62" y="45" width="13" height="10" rx="2" fill="none" stroke="#1a1540" stroke-width="1.8"/><rect x="85" y="45" width="13" height="10" rx="2" fill="none" stroke="#1a1540" stroke-width="1.8"/><line x1="75" y1="50" x2="85" y2="50" stroke="#1a1540" stroke-width="1.5"/><rect x="64" y="47" width="9" height="6" rx="1" fill="#fff"/><rect x="87" y="47" width="9" height="6" rx="1" fill="#fff"/><circle cx="68" cy="50" r="2.5" fill="#1a1540"/><circle cx="91" cy="50" r="2.5" fill="#1a1540"/><line x1="73" y1="62" x2="87" y2="62" stroke="#8B4513" stroke-width="1.5" stroke-linecap="round"/><rect x="28" y="88" width="24" height="12" rx="4" fill="#5a52a9"/><rect x="16" y="92" width="16" height="12" rx="4" fill="#C68642"/><rect x="4" y="80" width="20" height="36" rx="6" fill="#F5F0DC"/><rect x="4" y="80" width="20" height="8" rx="4" fill="#D4C870"/><rect x="4" y="108" width="20" height="8" rx="4" fill="#D4C870"/><rect x="108" y="84" width="24" height="12" rx="4" fill="#5a52a9"/><rect x="122" y="74" width="14" height="24" rx="4" fill="#C68642"/><rect x="125" y="4" width="12" height="76" rx="2" fill="#c0bce8"/><line x1="127" y1="12" x2="133" y2="12" stroke="#3d3688" stroke-width="1"/><line x1="127" y1="24" x2="133" y2="24" stroke="#3d3688" stroke-width="1"/><rect x="125" y="4" width="3" height="76" rx="1" fill="#AFA9EC" opacity=".4"/></svg>`,
}

const T: Record<string, TypeData> = {
  R: { name: 'Realista', color: '#7A2E10', bg: '#FAECE7', border: '#F0997B', fill: '#D85A30',
       tagline: '"Aprendo fazendo — não ouvindo."',
       desc: 'Prefere atividades concretas que envolvam construção, conserto, operação de máquinas ou trabalho manual. Valoriza resultados tangíveis e habilidades técnicas.',
       school: 'Destaca-se em: Física (lab), Educação Física, Artes Técnicas, Tecnologia.',
       traits: ['Prático','Físico','Direto','Resiliente','Concreto'],
       stats: { Execução: 95, Raciocínio: 62, Relações: 38, Criatividade: 50, Liderança: 55 },
       superpowers: ['Transforma planos abstratos em coisas reais','Resolve problemas com o que tem na mão','Aprende qualquer ferramenta rapidamente'],
       shadow: 'Pode perder a paciência com debates longos sem ação.',
       careers: ['Engenharia Mecânica','Arquitetura','Medicina Cirúrgica','Pilotagem','Robótica','Geologia','Educação Física'] },
  I: { name: 'Investigativo', color: '#0A3A6E', bg: '#E6F1FB', border: '#85B7EB', fill: '#378ADD',
       tagline: '"Não aceito resposta que não faz sentido."',
       desc: 'Gosta de observar, explorar e analisar fenômenos. Prefere trabalhar com ideias e dados. Motivado por descobrir como o mundo funciona de verdade.',
       school: 'Destaca-se em: Matemática, Biologia, Química, Física.',
       traits: ['Analítico','Curioso','Meticuloso','Cético','Autônomo'],
       stats: { Execução: 35, Raciocínio: 98, Relações: 42, Criatividade: 68, Liderança: 44 },
       superpowers: ['Detecta inconsistências que outros ignoram','Pesquisa até encontrar a resposta real','Formula perguntas que mudam a conversa'],
       shadow: 'Às vezes analisa tanto que demora a tomar uma decisão.',
       careers: ['Medicina','Ciência de Dados','Neurociência','Física','Direito Penal','Filosofia','Cibersegurança'] },
  A: { name: 'Artístico', color: '#5C1A30', bg: '#FBEAF0', border: '#ED93B1', fill: '#D4537E',
       tagline: '"Crio antes de explicar — sinto antes de pensar."',
       desc: 'Prefere atividades expressivas e criativas. Valoriza originalidade, estética e liberdade para criar sem seguir padrões rígidos.',
       school: 'Destaca-se em: Redação, Artes, Literatura, Teatro.',
       traits: ['Original','Expressivo','Intuitivo','Sensível','Inconformista'],
       stats: { Execução: 44, Raciocínio: 70, Relações: 62, Criatividade: 98, Liderança: 40 },
       superpowers: ['Cria narrativas que ficam na cabeça','Transforma emoção em linguagem visual','Enxerga possibilidades que ainda não existem'],
       shadow: 'Pode ter dificuldade com prazos e estruturas rígidas.',
       careers: ['Direção de Cinema','UX/UI Design','Publicidade','Composição Musical','Escrita Criativa','Curadoria','Moda'] },
  S: { name: 'Social', color: '#1E4508', bg: '#EAF3DE', border: '#97C459', fill: '#639922',
       tagline: '"Conectar e desenvolver pessoas é o que me move."',
       desc: 'Gosta de interagir com pessoas para informar, orientar, treinar ou ajudá-las. Motivado por contribuir para o desenvolvimento e bem-estar dos outros.',
       school: 'Destaca-se em: Sociologia, Português, Inglês, Filosofia.',
       traits: ['Empático','Paciente','Colaborativo','Comunicativo','Generoso'],
       stats: { Execução: 52, Raciocínio: 64, Relações: 98, Criatividade: 58, Liderança: 72 },
       superpowers: ['Percebe necessidades antes que sejam ditas','Cria ambientes de confiança e colaboração','Media conflitos com habilidade'],
       shadow: 'Pode ter dificuldade em estabelecer limites.',
       careers: ['Psicologia','Pedagogia','Enfermagem','Serviço Social','Mediação','Terapia Ocupacional','Relações Internacionais'] },
  E: { name: 'Empreendedor', color: '#4A2500', bg: '#FAEEDA', border: '#EF9F27', fill: '#BA7517',
       tagline: '"Identifico oportunidades onde outros veem obstáculos."',
       desc: 'Prefere atividades que envolvam iniciar projetos, persuadir e liderar. Motivado por resultados, influência e conquista de objetivos.',
       school: 'Destaca-se em: Apresentações orais, Debates, Projetos empreendedores.',
       traits: ['Ambicioso','Persuasivo','Decisivo','Competitivo','Visionário'],
       stats: { Execução: 62, Raciocínio: 68, Relações: 84, Criatividade: 74, Liderança: 97 },
       superpowers: ['Mobiliza grupos com energia e clareza','Enxerga o potencial antes de todos','Toma decisões com confiança em situações ambíguas'],
       shadow: 'Pode ser impulsivo e subestimar riscos.',
       careers: ['Administração','Direito Empresarial','Marketing','Startups','Política','Relações Públicas','Gestão em Saúde'] },
  C: { name: 'Convencional', color: '#2A2175', bg: '#EEEDFE', border: '#AFA9EC', fill: '#7F77DD',
       tagline: '"Sistemas bem estruturados fazem o mundo funcionar."',
       desc: 'Prefere atividades ordenadas e sistemáticas que envolvam trabalhar com dados, registros ou organizar informações. Valoriza precisão e eficiência.',
       school: 'Destaca-se em: Matemática, Contabilidade, Informática.',
       traits: ['Preciso','Metódico','Confiável','Disciplinado','Sistemático'],
       stats: { Execução: 78, Raciocínio: 82, Relações: 54, Criatividade: 36, Liderança: 60 },
       superpowers: ['Garante que processos não quebram','Encontra inconsistências que outros ignoraram','Cria sistemas escaláveis e confiáveis'],
       shadow: 'Pode resistir a mudanças não planejadas.',
       careers: ['Ciências Contábeis','Direito Tributário','Análise de Sistemas','Logística','Gestão de Qualidade','Atuária','Administração Pública'] },
}

const BATTLES: Battle[] = [
  { a:'R',b:'I',q:'Você tem tempo livre e quer aprender algo novo. Prefere...', ra:'Montar, desmontar ou testar algo na prática — ver como funciona de verdade', rb:'Pesquisar, ler e entender profundamente como algo funciona por dentro' },
  { a:'I',b:'R',q:'Diante de um problema concreto, você tende a...', ra:'Investigar as causas, levantar dados e testar hipóteses antes de agir', rb:'Partir direto para a ação e ajustar conforme o resultado aparece' },
  { a:'R',b:'A',q:'Você inicia um projeto pessoal do zero. O que te motiva mais?', ra:'Construir algo funcional e útil que resolva um problema real', rb:'Criar algo original que expresse uma ideia ou sensação sua' },
  { a:'A',b:'R',q:'Ao desenvolver algo do zero, você valoriza mais...', ra:'Estética, expressão e uma identidade marcante', rb:'Funcionamento, resultado prático e durabilidade' },
  { a:'R',b:'S',q:'Em uma atividade, você prefere...', ra:'Lidar com tarefas concretas — construir, consertar ou operar algo', rb:'Interagir diretamente com pessoas — orientar, apoiar ou ensinar' },
  { a:'S',b:'R',q:'No trabalho, você se sente mais motivado quando...', ra:'Está em contato direto com pessoas, contribuindo para elas', rb:'Está executando tarefas técnicas ou operacionais com resultado tangível' },
  { a:'R',b:'E',q:'Em um projeto coletivo, qual papel você prefere?', ra:'Executar a parte técnica — fazer acontecer de forma prática e precisa', rb:'Coordenar o grupo, tomar decisões e garantir que o projeto avance' },
  { a:'E',b:'R',q:'A ideia está pronta. O que você prefere fazer?', ra:'Liderar o time, manter o foco e conduzir até o resultado', rb:'Pegar a parte prática e executar com qualidade e precisão técnica' },
  { a:'R',b:'C',q:'Ao iniciar uma tarefa nova, você prefere...', ra:'Começar fazendo e ir ajustando conforme os desafios aparecem', rb:'Estudar o processo, seguir um método claro e garantir que nada escape' },
  { a:'C',b:'R',q:'Você se sente mais confortável em...', ra:'Trabalhar com processos organizados, etapas definidas e registros precisos', rb:'Lidar com situações práticas que exigem ação imediata e adaptação' },
  { a:'I',b:'A',q:'Ao explorar um tema novo, você prefere...', ra:'Analisar dados, buscar padrões e construir uma explicação lógica', rb:'Interpretar de forma criativa e gerar conexões e ideias originais' },
  { a:'A',b:'I',q:'Diante de uma questão aberta, você tende a...', ra:'Buscar uma abordagem original, simbólica ou expressiva', rb:'Investigar sistematicamente até encontrar uma explicação fundamentada' },
  { a:'I',b:'S',q:'Em uma atividade, você prefere...', ra:'Trabalhar com ideias, teorias ou dados — análise em profundidade', rb:'Trabalhar diretamente com pessoas — apoiar, orientar ou colaborar' },
  { a:'S',b:'I',q:'Você se envolve mais quando...', ra:'Pode ajudar, orientar ou contribuir para o desenvolvimento de alguém', rb:'Pode investigar, analisar ou compreender algo em profundidade' },
  { a:'I',b:'E',q:'Em um desafio importante, você prefere...', ra:'Compreender todas as variáveis antes de decidir qualquer coisa', rb:'Agir, testar e corrigir o rumo ao longo do processo' },
  { a:'E',b:'I',q:'Diante de uma nova ideia, você tende a...', ra:'Recrutar pessoas, montar um plano e colocar em prática logo', rb:'Avaliar os dados, verificar a viabilidade e agir com segurança' },
  { a:'I',b:'C',q:'Ao lidar com muitas informações, você prefere...', ra:'Explorar, questionar e buscar interpretações além do óbvio', rb:'Organizar em categorias, estruturar com método e garantir precisão' },
  { a:'C',b:'I',q:'Você se sente mais produtivo quando...', ra:'Segue procedimentos definidos e garante que nada vai sair errado', rb:'Tem liberdade para investigar e explorar possibilidades sem roteiro' },
  { a:'A',b:'S',q:'Em um projeto em grupo, como você contribui mais?', ra:'Criando a identidade visual, o conceito e a linguagem do projeto', rb:'Garantindo que todos sejam ouvidos e que o grupo funcione bem junto' },
  { a:'S',b:'A',q:'Você se sente mais realizado quando...', ra:'Contribui de forma concreta para o bem-estar ou crescimento de alguém', rb:'Expressa uma ideia, emoção ou visão de forma criativa e original' },
  { a:'A',b:'E',q:'Em uma apresentação coletiva, qual papel combina mais com você?', ra:'Desenvolver o conceito, a narrativa e a identidade estética', rb:'Apresentar, defender a proposta e convencer a audiência' },
  { a:'E',b:'A',q:'Diante de uma causa em que acredita, você prefere...', ra:'Mobilizar pessoas, articular apoio e liderar a iniciativa', rb:'Criar uma campanha expressiva que comunique a causa de forma impactante' },
  { a:'A',b:'C',q:'Ao realizar uma tarefa, o que te deixa mais à vontade?', ra:'Ter liberdade para criar do seu jeito, sem formato fixo', rb:'Seguir padrões e critérios que garantam consistência e qualidade' },
  { a:'C',b:'A',q:'Você se sente mais confortável quando...', ra:'Há procedimentos definidos e um padrão claro que evita retrabalho', rb:'Pode experimentar, inovar e criar sem restrições de formato' },
  { a:'S',b:'E',q:'Em um grupo com conflitos, o que você tende a fazer?', ra:'Ouvir todos os lados com cuidado e buscar um acordo coletivo', rb:'Tomar uma posição clara e conduzir o grupo a uma decisão' },
  { a:'E',b:'S',q:'Ao montar um grupo para um projeto, o que você prioriza?', ra:'Recrutar pessoas motivadas, definir papéis e manter o foco no resultado', rb:'Escolher pessoas que se complementam e cultivar um bom clima no grupo' },
  { a:'S',b:'C',q:'Organizando um evento, o que você mais quer garantir?', ra:'Que todas as pessoas se sintam incluídas e o ambiente seja acolhedor', rb:'Que a logística, o cronograma e os recursos estejam organizados com precisão' },
  { a:'C',b:'S',q:'Diante de uma decisão coletiva equivocada, você...', ra:'Revisa os dados, aponta os erros e propõe uma correção estruturada', rb:'Conversa individualmente com cada pessoa para entender as perspectivas' },
  { a:'E',b:'C',q:'Surgiu uma oportunidade nova e inesperada. O que você faz?', ra:'Age rápido — aproveitar antes que a janela se feche é fundamental', rb:'Analisa os riscos com cuidado e só avança se houver um plano sólido' },
  { a:'C',b:'E',q:'Para um projeto grande sair do papel, você prefere...', ra:'Criar o cronograma, detalhar cada etapa e garantir que nada escape', rb:'Liderar o time, manter a energia e tomar as decisões que travam o grupo' },
]

const PN = ['FASE 1 — AQUECIMENTO', 'FASE 2 — INTENSIDADE', 'FASE 3 — DESEMPATE FINAL']
const PNXT = ['Você já se aqueceu. Agora fica sério.', 'A reta final — cada voto conta.']
const INS: Record<string, string[]> = {
  R: ['Preferem atividades físicas e concretas', 'Aprendem fazendo, não ouvindo', 'Valorizam resultados tangíveis e práticos'],
  I: ['Analisam e pesquisam em profundidade', 'Precisam entender o porquê de tudo', 'Preferem trabalhar com ideias e dados'],
  A: ['Criam e expressam com originalidade', 'Valorizam liberdade e expressão própria', 'Conectam coisas que outros não veem'],
  S: ['Preferem atividades de apoio e orientação', 'Percebem as necessidades dos outros facilmente', 'Energia vem de contribuir para o desenvolvimento de pessoas'],
  E: ['Preferem liderar e conduzir projetos', 'Identificam oportunidades antes de todos', 'Motivados por resultados e conquistas'],
  C: ['Preferem atividades organizadas e sistemáticas', 'Garantem que processos e prazos funcionem', 'Precisão e confiabilidade são seus pontos fortes'],
}
const ANCORA_OPTS = [
  { k: 'R', label: 'Prefiro construir, consertar ou operar coisas com as mãos' },
  { k: 'I', label: 'Gosto de investigar, analisar e entender como as coisas funcionam' },
  { k: 'A', label: 'Me expresso criando — arte, escrita, design ou música' },
  { k: 'S', label: 'Me realizo orientando, ensinando ou ajudando outras pessoas' },
  { k: 'E', label: 'Prefiro liderar projetos, convencer pessoas e alcançar resultados' },
  { k: 'C', label: 'Trabalho melhor com processos organizados, dados e procedimentos claros' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function shuf<T>(a: T[]): T[] {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = 0 | (Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

function prepBattles(): Battle[] {
  const raw = shuf([...BATTLES])
  const leftCount: Record<string, number> = { R:0,I:0,A:0,S:0,E:0,C:0 }
  return raw.map(b => {
    const flip = leftCount[b.b] < leftCount[b.a]
    leftCount[flip ? b.b : b.a]++
    return { ...b, flip }
  })
}

function calcConsistencia(G: GState) {
  const q = G.q; let ok = 0, total = 0
  for (let i = 0; i < q.length; i++) {
    for (let j = i + 1; j < q.length; j++) {
      if (q[i].a === q[j].b && q[i].b === q[j].a) {
        total++
        const vi = G.votos[i], vj = G.votos[j]
        if (!vi || !vj) continue
        function winner(b: Battle, v: string) {
          if (v === 'n') return null
          if (!b.flip) return v === 'a' ? b.a : b.b
          return v === 'a' ? b.b : b.a
        }
        const wi = winner(q[i], vi), wj = winner(q[j], vj)
        if (wi && wj && wi === wj) ok++
      }
    }
  }
  const taxa = total > 0 ? ok / total : 0
  if (taxa >= 0.8) return { nivel: 'Alta', cor: '#1a6e1a', bgc: '#e8f5e9', texto: 'As respostas foram consistentes ao longo das batalhas. O perfil gerado tem boa estabilidade interna.', ok, total }
  if (taxa >= 0.5) return { nivel: 'Moderada', cor: '#7a5500', bgc: '#fff8e1', texto: 'Houve alguma variação nas escolhas. O perfil é indicativo — aprofunde na conversa com o orientador.', ok, total }
  return { nivel: 'Baixa', cor: '#8b1a1a', bgc: '#fff0f0', texto: 'As escolhas apresentaram bastante variação. Use o perfil como ponto de partida para conversa, não como conclusão.', ok, total }
}

function makeDefaultG(): GState {
  return { sc: {R:0,I:0,A:0,S:0,E:0,C:0}, r:0, xp:0, vt:false, nc:0, q:[], ancora:null, votos:{} }
}

function avatarInner(type: string) {
  return AV[type].replace(/<svg[^>]*>/g, '').replace(/<\/svg>/g, '')
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function RiasecBattleCards({ initialState, onStateChange, onComplete }: GameProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>(() => {
    const saved = initialState?.screen as Screen | undefined
    if (saved && saved !== 'result') return saved
    return 'intro'
  })
  const [G, setG] = useState<GState>(() => {
    if (initialState?.G) return initialState.G as GState
    return makeDefaultG()
  })
  const [voteAnim, setVoteAnim] = useState<'a' | 'b' | 'n' | null>(null)
  const [vsVisible, setVsVisible] = useState(false)
  const [ncVisible, setNcVisible] = useState(false)
  const [interactionEnabled, setInteractionEnabled] = useState(false)
  const [flashActive, setFlashActive] = useState(false)
  const [badgeText, setBadgeText] = useState('')
  const [badgeAnim, setBadgeAnim] = useState(false)
  const [barsReady, setBarsReady] = useState(false)
  const [battleKey, setBattleKey] = useState(0)
  const [modalType, setModalType] = useState<string | null>(null)
  const [anchorSel, setAnchorSel] = useState<string | null>(null)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const onStateChangeRef = useRef(onStateChange)
  const onCompleteRef = useRef(onComplete)
  onStateChangeRef.current = onStateChange
  onCompleteRef.current = onComplete

  // ── Clear timers ───────────────────────────────────────────────────────────
  const clearAllTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms)
    timers.current.push(t)
    return t
  }, [])

  // ── Flash + badge effects ──────────────────────────────────────────────────
  const doFlash = useCallback(() => {
    setFlashActive(true)
    setTimeout(() => setFlashActive(false), 120)
  }, [])

  const doBadge = useCallback((text: string) => {
    setBadgeText(text)
    setBadgeAnim(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setBadgeAnim(true)))
    setTimeout(() => setBadgeAnim(false), 700)
  }, [])

  // ── Advance round after vote ────────────────────────────────────────────────
  const advanceRound = useCallback((nextR: number) => {
    setVoteAnim(null)
    setG(prev => ({ ...prev, r: nextR, vt: false }))
    if (nextR >= 30) {
      setScreen('ancora')
      setAnchorSel(null)
    } else if (nextR === 10 || nextR === 20) {
      setBarsReady(false)
      setScreen('break')
    } else {
      setBattleKey(k => k + 1)
      setScreen('battle')
    }
  }, [])

  // ── Vote ───────────────────────────────────────────────────────────────────
  const vote = useCallback((side: 'a' | 'b') => {
    if (!interactionEnabled) return
    const b = G.q[G.r]
    const winner = !b.flip ? (side === 'a' ? b.a : b.b) : (side === 'a' ? b.b : b.a)
    const loser  = !b.flip ? (side === 'a' ? b.b : b.a) : (side === 'a' ? b.a : b.b)
    const currentR = G.r

    setInteractionEnabled(false)
    setVsVisible(false)
    setNcVisible(false)
    setVoteAnim(side)
    doFlash()
    doBadge('⚡')

    setG(prev => ({
      ...prev,
      sc: { ...prev.sc, [winner]: prev.sc[winner] + 2, [loser]: prev.sc[loser] + 0.2 },
      xp: prev.xp + 10,
      votos: { ...prev.votos, [currentR]: side },
      vt: true,
    }))
    addTimer(() => advanceRound(currentR + 1), 880)
  }, [G, interactionEnabled, doFlash, doBadge, addTimer, advanceRound])

  // ── Abstain ────────────────────────────────────────────────────────────────
  const voteN = useCallback(() => {
    if (!interactionEnabled) return
    const currentR = G.r

    setInteractionEnabled(false)
    setVsVisible(false)
    setNcVisible(false)
    setVoteAnim('n')
    doBadge('🤷')

    setG(prev => ({
      ...prev,
      nc: prev.nc + 1,
      xp: prev.xp + 3,
      votos: { ...prev.votos, [currentR]: 'n' },
      vt: true,
    }))
    addTimer(() => advanceRound(currentR + 1), 780)
  }, [G, interactionEnabled, doBadge, addTimer, advanceRound])

  // ── Continue from break screen ─────────────────────────────────────────────
  const cont = useCallback(() => {
    const nextR = G.r + 1
    setG(prev => ({ ...prev, r: nextR, vt: false }))
    setBattleKey(k => k + 1)
    setScreen('battle')
  }, [G.r])

  // ── Start game ─────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    clearAllTimers()
    setVoteAnim(null)
    setBarsReady(false)
    setAnchorSel(null)
    const newG = makeDefaultG()
    newG.q = prepBattles()
    setG(newG)
    setBattleKey(0)
    setScreen('battle')
  }, [clearAllTimers])

  // ── Finalize with anchor ───────────────────────────────────────────────────
  const finalizarComAncora = useCallback((k: string | null) => {
    setG(prev => ({ ...prev, ancora: k }))
    setBarsReady(false)
    setScreen('result')
  }, [])

  // ── Done button (save + exit) ──────────────────────────────────────────────
  const handleDone = useCallback(() => {
    const sorted = Object.entries(G.sc).sort((a, b) => b[1] - a[1])
    const [top, t2, t3] = sorted.map(x => x[0])
    const code = top + t2 + t3
    const consist = calcConsistencia(G)
    const scores: Record<string, unknown> = {
      R: G.sc.R, I: G.sc.I, A: G.sc.A, S: G.sc.S, E: G.sc.E, C: G.sc.C,
      top, code, consistency: consist.nivel,
      xp: G.xp, abstencoes: G.nc, ancora: G.ancora,
    }
    onCompleteRef.current(scores, G.votos as Record<string, unknown>)
  }, [G])

  // ── Auto-save state ────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen === 'intro' || screen === 'instrucoes') return
    onStateChangeRef.current({ G, screen })
  }, [G, screen])

  // ── Battle screen setup (animations) ──────────────────────────────────────
  useEffect(() => {
    if (screen !== 'battle') return
    setInteractionEnabled(false)
    setVsVisible(false)
    setNcVisible(false)

    const t = addTimer(() => {
      doFlash()
      setVsVisible(true)
      setInteractionEnabled(true)
      setNcVisible(true)
    }, 700)
    return () => clearTimeout(t)
  }, [screen, battleKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Bar animation (break + result) ────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'break' && screen !== 'result') return
    setBarsReady(false)
    const t = addTimer(() => setBarsReady(true), 80)
    return () => clearTimeout(t)
  }, [screen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => () => clearAllTimers(), [clearAllTimers])

  // ──────────────────────────────────────────────────────────────────────────
  // Screen renders
  // ──────────────────────────────────────────────────────────────────────────

  function renderIntro() {
    return (
      <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 2, marginBottom: 4 }}>
          RIASEC<span style={{ color: '#E24B4A' }}>⚡</span>BATTLE
        </div>
        <p style={{ fontSize: 13, color: '#555', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          30 batalhas · 3 fases · código vocacional.<br />Toque em qualquer perfil para conhecê-lo.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: '1.5rem' }}>
          {Object.entries(T).map(([k, v]) => (
            <div key={k} className={s.rosterCard} style={{ borderColor: v.border }} onClick={() => setModalType(k)}>
              <svg width="100%" viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg"
                dangerouslySetInnerHTML={{ __html: avatarInner(k) }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 6,
                background: 'linear-gradient(transparent,rgba(0,0,0,.6))', color: '#fff',
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{k} — {v.name}</div>
            </div>
          ))}
        </div>
        <button className={s.playBtn} onClick={() => setScreen('instrucoes')}>⚡ ENTRAR NA ARENA</button>
      </div>
    )
  }

  function renderInstrucoes() {
    const steps = [
      { icon: '⚔️', title: '30 batalhas em 3 fases', text: 'Em cada rodada, dois perfis se enfrentam. Você vê uma situação e duas formas diferentes de agir ou preferir.' },
      { icon: '👆', title: 'Vote no que realmente combina com você', text: 'Não existe certo ou errado. Escolha o que realmente representa como você pensa e age hoje — não como gostaria de ser.' },
      { icon: '🤷', title: 'Use "Nenhuma das duas" com moderação', text: 'Após 5 abstenções você verá um aviso. Cada escolha que você faz torna o seu resultado mais preciso.' },
      { icon: '🏆', title: 'Código vocacional + análise completa', text: 'Você recebe um código de 3 letras (ex: RIA, SEC), o perfil completo das 6 dimensões e um indicador de consistência.' },
      { icon: '⏱️', title: 'Tempo estimado: 8 a 12 minutos', text: 'Faça com calma e honestidade. Escolhas apressadas comprometem a qualidade do resultado.', yellow: true },
    ]
    return (
      <div style={{ padding: '2rem 1.5rem' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: '.25rem' }}>Como funciona</div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: '1.5rem', lineHeight: 1.5 }}>Leia com atenção antes de começar — leva menos de 1 minuto.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: '2rem' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 14, background: step.yellow ? '#fff8e1' : '#f9f9f9', borderRadius: 14, borderLeft: `4px solid ${step.yellow ? '#F5C518' : '#E24B4A'}` }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{step.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.55 }}>{step.text}</div>
              </div>
            </div>
          ))}
        </div>
        <button className={s.playBtn} style={{ width: '100%', fontSize: 20 }} onClick={startGame}>⚡ COMEÇAR AS BATALHAS</button>
      </div>
    )
  }

  function renderBattle() {
    if (!G.q.length) return null
    const b = G.q[G.r]
    const phase = G.r < 10 ? 0 : G.r < 20 ? 1 : 2
    const lt = b.flip ? b.b : b.a
    const rt = b.flip ? b.a : b.b
    const lr = b.flip ? b.rb : b.ra
    const rr = b.flip ? b.ra : b.rb
    const vl = T[lt], vr = T[rt]
    const avisoTxt = G.nc >= 5 ? `🤷 Você já se absteve ${G.nc}× — cada escolha aumenta a precisão do resultado.` : ''

    const cardClassA = [
      s.card,
      s.cardSlideLeft,
      voteAnim === 'a' ? s.cardWin : '',
      voteAnim === 'b' ? s.cardLose : '',
      voteAnim === 'n' ? s.cardNone : '',
    ].filter(Boolean).join(' ')

    const cardClassB = [
      s.card,
      s.cardSlideRight,
      voteAnim === 'b' ? s.cardWin : '',
      voteAnim === 'a' ? s.cardLose : '',
      voteAnim === 'n' ? s.cardNone : '',
    ].filter(Boolean).join(' ')

    return (
      <div key={battleKey}>
        {/* Header */}
        <div style={{ padding: '.75rem 1.5rem .4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1 }}>ROUND {G.r + 1}</div>
            <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '.7px' }}>Fase {phase + 1} · batalha {(G.r % 10) + 1}/10</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 17 }}>{G.xp} XP</div>
            <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '.7px' }}>pontos</div>
          </div>
        </div>

        {/* Phase dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '.25rem 0 .15rem' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 26, height: 4, borderRadius: 2,
              background: i < phase ? '#888' : i === phase ? '#E24B4A' : '#e0e0e0' }} />
          ))}
        </div>

        {/* Phase name */}
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', textAlign: 'center', color: '#666', marginBottom: '.3rem' }}>{PN[phase]}</div>

        {/* XP bar */}
        <div style={{ height: 4, background: '#e0e0e0', margin: '0 1.5rem .4rem' }}>
          <div className={s.xpFill} style={{ width: `${(G.r / 30) * 100}%` }} />
        </div>

        {/* Energy bars */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 1fr', padding: '0 .75rem .4rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', opacity: .6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vl.name}</div>
            <div style={{ height: 7, background: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
              <div className={s.energyFill} style={{ background: vl.fill, width: interactionEnabled ? '100%' : '0%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#888', opacity: .7 }}>NRG</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', opacity: .6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vr.name}</div>
            <div style={{ height: 7, background: '#e0e0e0', borderRadius: 4, overflow: 'hidden', width: '100%' }}>
              <div className={s.energyFill} style={{ background: vr.fill, width: interactionEnabled ? '100%' : '0%' }} />
            </div>
          </div>
        </div>

        {/* Question */}
        <div style={{ margin: '.2rem .75rem .4rem', padding: '9px 14px', background: '#f5f5f5', borderRadius: 10, fontSize: 13, fontWeight: 700, lineHeight: 1.5, textAlign: 'center',
          opacity: vsVisible ? 1 : 0, transition: 'opacity .2s .1s' }}>
          {b.q}
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', padding: '0 .75rem', alignItems: 'stretch' }}>
          <div className={cardClassA}
            style={{ background: vl.bg, borderColor: vl.border, color: vl.color, pointerEvents: interactionEnabled ? 'auto' : 'none' }}
            onClick={() => vote('a')}>
            <svg width="100%" viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg"
              dangerouslySetInnerHTML={{ __html: avatarInner(lt) }} />
            <div style={{ padding: '.45rem .6rem .6rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, lineHeight: 1 }}>{lt}</div>
              <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px' }}>{vl.name}</div>
              <div style={{ fontSize: 9, fontWeight: 600, fontStyle: 'italic', lineHeight: 1.3, opacity: .8 }}>{vl.tagline}</div>
              <div style={{ fontSize: 10, lineHeight: 1.4, padding: '3px 5px', borderRadius: 6, background: 'rgba(0,0,0,.06)', marginTop: 2, color: vl.color }}>{lr}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 3 }}>
                {vl.traits.slice(0,3).map(t => (
                  <span key={t} style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 8, border: `1px solid ${vl.border}`, opacity: .6, textTransform: 'uppercase', color: vl.color }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={`${s.vsLabel} ${vsVisible ? s.vsLabelVisible : ''}`}>VS</div>
          </div>

          <div className={cardClassB}
            style={{ background: vr.bg, borderColor: vr.border, color: vr.color, pointerEvents: interactionEnabled ? 'auto' : 'none' }}
            onClick={() => vote('b')}>
            <svg width="100%" viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg"
              dangerouslySetInnerHTML={{ __html: avatarInner(rt) }} />
            <div style={{ padding: '.45rem .6rem .6rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, lineHeight: 1 }}>{rt}</div>
              <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px' }}>{vr.name}</div>
              <div style={{ fontSize: 9, fontWeight: 600, fontStyle: 'italic', lineHeight: 1.3, opacity: .8 }}>{vr.tagline}</div>
              <div style={{ fontSize: 10, lineHeight: 1.4, padding: '3px 5px', borderRadius: 6, background: 'rgba(0,0,0,.06)', marginTop: 2, color: vr.color }}>{rr}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 3 }}>
                {vr.traits.slice(0,3).map(t => (
                  <span key={t} style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 8, border: `1px solid ${vr.border}`, opacity: .6, textTransform: 'uppercase', color: vr.color }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Abstain */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '.5rem .75rem .25rem' }}>
          <div className={`${s.abstainBtn} ${ncVisible ? s.abstainBtnVisible : ''} ${G.nc >= 5 ? s.abstainBtnAlert : ''}`}
            onClick={voteN}>
            <span style={{ fontSize: 20 }}>🤷</span>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: '.5px', color: '#1a1a1a' }}>Nenhuma das duas</div>
              <div style={{ fontSize: 10, color: '#666', marginTop: 1 }}>Não me identifico — sem pontuação</div>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: '#B8860B', textAlign: 'center', padding: '2px 1.5rem .6rem', fontStyle: 'italic', minHeight: 20 }}>{avisoTxt}</div>
      </div>
    )
  }

  function renderBreak() {
    const cp = G.r === 10 ? 0 : 1
    const np = cp + 1
    const sorted = Object.entries(G.sc).sort((a, b) => b[1] - a[1])
    const lk = sorted[0][0], v = T[lk], mx = sorted[0][1] || 1
    const lembretes = [
      'Lembre: escolha como você <strong>realmente é</strong> hoje, não como gostaria de ser.',
      'Escolhas autênticas geram resultados mais precisos. Continue sendo honesto.'
    ]

    return (
      <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 2, color: '#666', marginBottom: 4 }}>FIM DA FASE {cp + 1}</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 1, marginBottom: '1.25rem' }}>RESULTADO PARCIAL</div>

        {/* Bar chart */}
        <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
          {sorted.map(([k, sc]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, width: 108, textAlign: 'right', flexShrink: 0, color: T[k].color }}>{k} {T[k].name}</div>
              <div style={{ flex: 1, height: 9, background: '#e0e0e0', borderRadius: 5, overflow: 'hidden' }}>
                <div className={s.breakBarFill} style={{ background: T[k].fill, width: barsReady ? `${(sc / mx) * 100}%` : '0%' }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, width: 24, textAlign: 'right', color: '#666' }}>{Math.round(sc)}</div>
            </div>
          ))}
        </div>

        {G.nc > 0 && (
          <div style={{ fontSize: 11, color: '#666', marginBottom: '1rem', padding: '8px 12px', border: '1px dashed #ccc', borderRadius: 8, textAlign: 'left' }}>
            🤷 "Nenhuma das duas" usada {G.nc}×
          </div>
        )}

        {/* Leading type */}
        <div style={{ borderRadius: 12, padding: '.9rem', marginBottom: '1.25rem', border: `1.5px solid ${v.border}`, background: v.bg, textAlign: 'left' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: '#666', marginBottom: '.3rem' }}>liderando até aqui</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1, color: v.color }}>{lk} — {v.name}</div>
          <div style={{ fontSize: 12, color: '#555', fontStyle: 'italic', marginTop: 3, lineHeight: 1.5 }}>{INS[lk][cp]}</div>
        </div>

        <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6, marginBottom: '1rem', padding: '10px 12px', background: '#f5f5f5', borderRadius: 10, textAlign: 'left' }}
          dangerouslySetInnerHTML={{ __html: `💡 ${lembretes[cp]}` }} />

        <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6, marginBottom: '1rem', padding: '10px 12px', background: '#f5f5f5', borderRadius: 10, textAlign: 'left' }}>
          <strong>{PN[np]}</strong><br />
          <span style={{ opacity: .8 }}>{PNXT[cp]} Mais 10 batalhas.</span>
        </div>

        <button className={s.continueBtn} onClick={cont}>CONTINUAR → FASE {np + 1}</button>
      </div>
    )
  }

  function renderAncora() {
    return (
      <div style={{ padding: '1.5rem' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, marginBottom: '.3rem' }}>UMA ÚLTIMA QUESTÃO</div>
        <div style={{ fontSize: 13, color: '#555', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Independente das batalhas — qual dessas frases soa mais verdadeira pra você <strong>agora</strong>?<br />
          <span style={{ fontSize: 12, color: '#aaa' }}>Escolha a que representa seu jeito natural de ser, não o que gostaria de ser.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.25rem' }}>
          {ANCORA_OPTS.map(o => {
            const v = T[o.k]
            const isSel = anchorSel === o.k
            return (
              <button key={o.k} className={s.anchorOpt}
                style={isSel ? { borderColor: v.border, background: v.bg, borderWidth: 2.5 } : {}}
                onClick={() => setAnchorSel(o.k)}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${v.border}`, background: isSel ? v.bg : 'transparent' }} />
                <span>{o.label}</span>
              </button>
            )
          })}
        </div>

        <button className={`${s.continueBtn} ${!anchorSel ? s.continueBtnDisabled : ''}`}
          style={{ marginBottom: '.75rem' }}
          onClick={() => anchorSel && finalizarComAncora(anchorSel)}>
          VER MEU RESULTADO →
        </button>
        <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline', marginBottom: '.5rem' }}
          onClick={() => finalizarComAncora(null)}>
          Pular esta etapa
        </div>
      </div>
    )
  }

  function renderResult() {
    const sorted = Object.entries(G.sc).sort((a, b) => b[1] - a[1])
    const [top, t2, t3] = sorted.map(x => x[0])
    const v = T[top], code = top + t2 + t3, maxPts = sorted[0][1] || 1
    const consist = calcConsistencia(G)

    let ancoraTxt: React.ReactNode = null
    if (G.ancora) {
      if (G.ancora === top) {
        ancoraTxt = (
          <div style={{ fontSize: 11, padding: '7px 11px', borderRadius: 8, background: '#e8f5e9', color: '#1a6e1a', marginBottom: '.75rem', border: '1px solid #a5d6a7' }}>
            ✓ Sua escolha na âncora (<strong>{T[G.ancora].name}</strong>) confirma o resultado das batalhas.
          </div>
        )
      } else {
        ancoraTxt = (
          <div style={{ fontSize: 11, padding: '7px 11px', borderRadius: 8, background: '#fff8e1', color: '#7a5500', marginBottom: '.75rem', border: '1px solid #ffe082' }}>
            💬 Âncora: você se identificou com <strong>{T[G.ancora].name}</strong>, mas <strong>{T[top].name}</strong> liderou nas batalhas. Vale explorar com o orientador.
          </div>
        )
      }
    }

    return (
      <div style={{ padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, letterSpacing: 2, color: '#666' }}>30 BATALHAS · 3 FASES CONCLUÍDAS</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 1 }}>SEU CÓDIGO VOCACIONAL</div>
        </div>

        {/* Podium */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: 'center', height: 136, marginBottom: '1.25rem' }}>
          <div className={s.podiumSlot} style={{ height: 100, background: T[t2].bg, borderColor: T[t2].border, color: T[t2].color }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 10, letterSpacing: 1, opacity: .65 }}>2°</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, lineHeight: 1 }}>{t2}</div>
            <div style={{ fontSize: 10, fontWeight: 600, opacity: .65 }}>{Math.round(sorted[1][1])}pts</div>
          </div>
          <div className={s.podiumSlot} style={{ height: 140, background: v.bg, borderColor: v.border, color: v.color }}>
            <div style={{ fontSize: 15 }}>🏆</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 10, letterSpacing: 1, opacity: .65 }}>CAMPEÃO</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, lineHeight: 1 }}>{top}</div>
            <div style={{ fontSize: 10, fontWeight: 600, opacity: .65 }}>{Math.round(sorted[0][1])}pts</div>
          </div>
          <div className={s.podiumSlot} style={{ height: 72, background: T[t3].bg, borderColor: T[t3].border, color: T[t3].color }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 10, letterSpacing: 1, opacity: .65 }}>3°</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, lineHeight: 1 }}>{t3}</div>
            <div style={{ fontSize: 10, fontWeight: 600, opacity: .65 }}>{Math.round(sorted[2][1])}pts</div>
          </div>
        </div>

        {/* Radar / bar chart */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', opacity: .5, marginBottom: '.7rem' }}>Perfil completo — todas as dimensões</div>
          {sorted.map(([k, sc]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, width: 126, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, color: T[k].color }}>
                <span style={{ fontSize: 10, background: T[k].bg, border: `1px solid ${T[k].border}`, borderRadius: 4, padding: '1px 5px' }}>{k}</span>
                {T[k].name}
              </div>
              <div style={{ flex: 1, height: 10, background: '#e0e0e0', borderRadius: 5, overflow: 'hidden' }}>
                <div className={s.radarFill} style={{ background: T[k].fill, width: barsReady ? `${(sc / maxPts) * 100}%` : '0%' }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#666', width: 28, textAlign: 'right' }}>{Math.round(sc)}</div>
              <div style={{ fontSize: 9, color: '#aaa', width: 30, textAlign: 'right' }}>{Math.round((sc / maxPts) * 100)}%</div>
            </div>
          ))}
        </div>

        {/* Consistency semaphore */}
        <div style={{ borderRadius: 12, padding: '.85rem 1rem', marginBottom: '1rem', border: `1.5px solid ${consist.cor}`, background: consist.bgc, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2, background: consist.cor }} />
          <div style={{ fontSize: 11, lineHeight: 1.55, color: '#555' }}>
            <strong style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>Consistência interna: {consist.nivel} ({consist.ok}/{consist.total} pares convergentes)</strong>
            {consist.texto}
          </div>
        </div>

        {ancoraTxt}

        {/* Code card */}
        <div style={{ borderRadius: 18, border: `2px solid ${v.border}`, padding: '1.4rem', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden', background: v.bg, color: v.color }}>
          <div style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%) rotate(90deg)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, opacity: .05, pointerEvents: 'none' }}>RIASEC</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '.75rem' }}>
            <div style={{ width: 76, flexShrink: 0, borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${v.border}` }}>
              <svg width="100%" viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg"
                dangerouslySetInnerHTML={{ __html: avatarInner(top) }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, lineHeight: 1, letterSpacing: -1 }}>{code}</div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', opacity: .65 }}>{v.name} · {T[t2].name} · {T[t3].name}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, fontStyle: 'italic', marginBottom: '.6rem', lineHeight: 1.4 }}>{v.tagline}</div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: '#555', marginBottom: '.9rem' }}>{v.desc}</div>
          {v.superpowers.map((p, i) => (
            <div key={i} style={{ fontSize: 12, fontWeight: 600, padding: '5px 0', borderBottom: '1px solid rgba(0,0,0,.06)', display: 'flex', gap: 6, lineHeight: 1.4, color: v.color }}>
              <span>⚡</span><span>{p}</span>
            </div>
          ))}
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', opacity: .5, margin: '1rem 0 .4rem' }}>algumas áreas relacionadas</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '.9rem' }}>
            {[...v.careers, ...T[t2].careers].slice(0, 7).map(c => (
              <span key={c} className={s.chip} style={{ background: 'rgba(0,0,0,.05)', color: v.color, borderColor: v.border }}>{c}</span>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#666', lineHeight: 1.6, padding: '9px 12px', background: 'rgba(0,0,0,.04)', borderRadius: 9, marginBottom: '.75rem' }}>
            💡 Estas são <strong>sugestões iniciais</strong>. Existem muitas outras áreas relacionadas ao código <strong>{code}</strong>. Converse com seu orientador para explorar todas as possibilidades.
          </div>
        </div>

        {/* XP / abstentions summary */}
        <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginBottom: '.75rem', padding: '6px 10px', border: '1px dashed #ddd', borderRadius: 8 }}>
          {G.nc > 0 ? `🤷 Abstenções: ${G.nc} · ` : ''}XP: {G.xp} · 30 batalhas
        </div>

        <div style={{ fontSize: 12, color: '#555', textAlign: 'center', marginBottom: '1rem', padding: 10, background: '#f5f5f5', borderRadius: 10, lineHeight: 1.5 }}>
          📋 <strong>Código: {code}</strong> · Consistência: <strong>{consist.nivel}</strong><br />
          Seu orientador receberá estes resultados automaticamente.
        </div>

        {/* Restart + Done buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button className={s.restartBtnPrimary} onClick={startGame}>⚡ JOGAR DE NOVO</button>
          <button className={s.restartBtnSecondary} onClick={startGame}>🔄 REFAZER</button>
        </div>
        <button className={s.doneBtn} onClick={handleDone}>✓ SALVAR E VOLTAR AO PAINEL</button>
      </div>
    )
  }

  // ── Modal ──────────────────────────────────────────────────────────────────
  function renderModal() {
    if (!modalType) return null
    const v = T[modalType]
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}
        onClick={(e) => { if (e.target === e.currentTarget) setModalType(null) }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', maxWidth: 380, width: '100%', maxHeight: '86vh', overflowY: 'auto', border: `2px solid ${v.border}` }}>
          <button style={{ float: 'right', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888' }} onClick={() => setModalType(null)}>✕</button>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '.75rem' }}>
            <div style={{ width: 76, flexShrink: 0, borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${v.border}` }}>
              <svg width="100%" viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg"
                dangerouslySetInnerHTML={{ __html: avatarInner(modalType) }} />
            </div>
            <div style={{ color: v.color }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, lineHeight: 1 }}>{modalType}</div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{v.name}</div>
              <div style={{ fontSize: 13, fontWeight: 600, fontStyle: 'italic' }}>{v.tagline}</div>
            </div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', opacity: .5, margin: '.75rem 0 .3rem' }}>O que caracteriza este perfil</div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: '#555' }}>{v.desc}</div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', opacity: .5, margin: '.75rem 0 .3rem' }}>Ambiente escolar</div>
          <div style={{ borderRadius: 10, padding: '10px 12px', border: `1.5px solid ${v.border}`, background: v.bg }}>
            <p style={{ fontSize: 12, lineHeight: 1.55, color: v.color }}>{v.school}</p>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', opacity: .5, margin: '.75rem 0 .3rem' }}>Dimensões</div>
          {Object.entries(v.stats).map(([sk, sv]) => (
            <div key={sk} style={{ marginBottom: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: .55, marginBottom: 2 }}><span>{sk}</span><span>{sv}</span></div>
              <div className={s.statBg}><div className={s.statFill} style={{ width: `${sv}%`, background: v.fill }} /></div>
            </div>
          ))}
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', opacity: .5, margin: '.75rem 0 .3rem' }}>Pontos fortes</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {v.superpowers.map(p => (
              <span key={p} className={s.chip} style={{ background: v.bg, color: v.color, borderColor: v.border }}>⚡ {p}</span>
            ))}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', opacity: .5, margin: '.75rem 0 .3rem' }}>Ponto de atenção</div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: '#555', fontStyle: 'italic' }}>{v.shadow}</div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', opacity: .5, margin: '.75rem 0 .3rem' }}>Áreas relacionadas</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {v.careers.map(c => (
              <span key={c} className={s.chip} style={{ background: v.bg, color: v.color, borderColor: v.border }}>{c}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: '#fff', minHeight: '100vh', position: 'relative', fontFamily: "'Inter', sans-serif", color: '#1a1a1a' }}>
      {/* Flash overlay */}
      <div className={`${s.flashOverlay} ${flashActive ? s.flashOverlayActive : ''}`} />

      {/* Floating badge */}
      <div className={s.badgeOverlay}>
        <div className={`${s.badgeText} ${badgeAnim ? s.badgeTextAnim : ''}`}>{badgeText}</div>
      </div>

      {/* Screen content */}
      {screen === 'intro' && renderIntro()}
      {screen === 'instrucoes' && renderInstrucoes()}
      {screen === 'battle' && renderBattle()}
      {screen === 'break' && renderBreak()}
      {screen === 'ancora' && renderAncora()}
      {screen === 'result' && renderResult()}

      {/* Type detail modal */}
      {renderModal()}
    </div>
  )
}

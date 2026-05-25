/**
 * Script para executar as migrations no Supabase
 * Uso: node scripts/run-migrations.mjs
 *
 * Requer: SUPABASE_DB_URL no .env.local
 * Formato: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xglulsznrvnidtuiuqcv.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY nao encontrada. Configure no .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

console.log('Verificando tabelas existentes...')

// Verificar se as tabelas ja existem
const { data: tables, error } = await supabase
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_schema', 'public')
  .in('table_name', ['patients', 'experiences', 'patient_experiences', 'experience_scores', 'reports', 'report_prompts', 'activity_logs'])

if (error) {
  console.log('Erro ao verificar tabelas:', error.message)
  console.log('')
  console.log('===================================================')
  console.log('INSTRUCOES PARA EXECUTAR AS MIGRATIONS MANUALMENTE:')
  console.log('===================================================')
  console.log('1. Acesse: https://supabase.com/dashboard/project/xglulsznrvnidtuiuqcv/sql/new')
  console.log('2. Cole o conteudo do arquivo: supabase/migrations.sql')
  console.log('3. Clique em "RUN"')
  console.log('===================================================')
} else {
  console.log(`Tabelas encontradas: ${tables?.map(t => t.table_name).join(', ') || 'nenhuma'}`)

  if (!tables || tables.length < 7) {
    console.log('')
    console.log('Algumas tabelas estao faltando.')
    console.log('Execute o arquivo supabase/migrations.sql no Supabase SQL Editor.')
  } else {
    console.log('Todas as tabelas ja existem!')

    // Verificar seed das experiencias
    const { data: expCount } = await supabase.from('experiences').select('id', { count: 'exact', head: true })
    console.log(`Experiencias no banco: ${expCount}`)

    const { data: promptCount } = await supabase.from('report_prompts').select('id', { count: 'exact', head: true })
    console.log(`Prompts configurados: ${promptCount}`)
  }
}

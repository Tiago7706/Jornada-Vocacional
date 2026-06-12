-- ============================================================
-- Jornada Vocacional — Migrations
-- Executar no Supabase SQL Editor
-- ============================================================

-- Perfil dos pacientes
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  birth_date DATE,
  admin_notes TEXT,
  path_type TEXT CHECK (path_type IN ('traditional', 'interactive')),
  max_experience_unlocked INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  invited_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ
);

-- Catálogo de experiências
CREATE TABLE IF NOT EXISTS experiences (
  id INT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('interactive', 'traditional', 'universal')),
  order_index INT NOT NULL
);

-- Progresso por paciente × experiência
CREATE TABLE IF NOT EXISTS patient_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  experience_id INT NOT NULL REFERENCES experiences(id),
  status TEXT DEFAULT 'locked' CHECK (status IN ('locked','unlocked','in_progress','completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  time_spent_seconds INT DEFAULT 0,
  game_state JSONB,
  UNIQUE (patient_id, experience_id)
);

-- Scores finais
CREATE TABLE IF NOT EXISTS experience_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  experience_id INT NOT NULL REFERENCES experiences(id),
  scores JSONB NOT NULL,
  raw_responses JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (patient_id, experience_id)
);

-- Log de atividades
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  experience_id INT REFERENCES experiences(id),
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relatórios gerados
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('clinical','simplified')),
  content TEXT NOT NULL,
  prompt_snapshot TEXT NOT NULL,
  gemini_model TEXT NOT NULL,
  generated_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates de prompt
CREATE TABLE IF NOT EXISTS report_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_type TEXT NOT NULL UNIQUE CHECK (prompt_type IN ('clinical','simplified')),
  template TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Pacientes só veem seus próprios dados
CREATE POLICY "patients_self" ON patients FOR ALL USING (auth.uid() = id);
CREATE POLICY "patient_experiences_self" ON patient_experiences FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "experience_scores_self" ON experience_scores FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "activity_logs_self" ON activity_logs FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "reports_self" ON reports FOR SELECT USING (auth.uid() = patient_id);

-- Experiências são públicas (leitura) para usuários autenticados
CREATE POLICY "experiences_read" ON experiences FOR SELECT USING (auth.role() = 'authenticated');

-- Prompts: apenas service role (admin via API) escreve; autenticados leem
CREATE POLICY "report_prompts_read" ON report_prompts FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED — Catálogo de Experiências
-- ============================================================

INSERT INTO experiences (id, slug, title, description, type, order_index) VALUES
  (0,  'jornada-vocacional-v5',     'Jornada Vocacional',         'Formulário tradicional RIASEC narrativo (91 cenas)',        'traditional', 0),
  (1,  'riasec-battle-cards',       'RIASEC Battle Cards',         '45 batalhas pareadas Holland types',                       'interactive', 1),
  (2,  'decifra-mente',             'DecifraMente',                'MBTI avatar game (7 cenas, 28 pontos)',                     'interactive', 2),
  (3,  'agencia-missao-impossivel', 'Agência Missão Impossível',   'Valores de carreira (9 missões)',                          'interactive', 3),
  (4,  'super-quem',                'Super Quem',                  'Ranking de valores',                                       'interactive', 4),
  (5,  'jogo-da-memoria',           'Jogo da Memória',             'Memory matching (15 pares, carreira-temáticos)',            'interactive', 5),
  (6,  'expedicao-cientifica',      'Expedição Científica',        'Quiz geográfico/biomas',                                   'interactive', 6),
  (7,  'hq-da-saude',               'HQ da Saúde',                 'Rating de carreiras da saúde (1-5 estrelas, 21 cursos)',   'interactive', 7),
  (8,  'face-a-face',               'Face a Face',                 'Adivinha citações + imagens (Ciências Humanas)',           'interactive', 8),
  (9,  'quem-fala-isso',            'Quem Fala Isso',              'Atribuição de frases/imagens a cursos',                   'interactive', 9),
  (10, 'uma-noite-no-museu',        'Uma Noite no Museu',          'Match obra-curso + rating (Artes & Design)',               'interactive', 10),
  (11, 'inside-exe',                'INSIDE.exe',                  'Plataformer 2D (Ciências Exatas)',                         'interactive', 11),
  (12, 'engenhoso',                 'Engenhoso',                   'Plataformer 2D (Engenharias)',                             'interactive', 12),
  (13, 'desafio-cst-final',         'Desafio CST Final',           'Quiz 153 cursos com timer e estrelas',                    'universal',   13),
  (14, 'avaliacao-cslb',            'Avaliação CSLB',               'Avaliação de interesse em 149 cursos de Licenciatura e Bacharelado (escala 1-10)', 'traditional', 14)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED — Prompts padrão
-- ============================================================

INSERT INTO report_prompts (prompt_type, template) VALUES
(
  'clinical',
  'Você é um psicólogo especialista em orientação vocacional. Com base nos dados a seguir, gere um relatório clínico detalhado para o(a) paciente {{patient_name}}.

Tipo de percurso: {{path_type}}
Data de geração: {{generated_at}}

Scores e respostas brutas por experiência:
{{scores_json}}

O relatório deve incluir:
1. Perfil psicológico vocacional
2. Áreas de interesse predominantes (Holland/RIASEC)
3. Perfil tipológico (MBTI se disponível)
4. Valores de carreira identificados
5. Áreas de conhecimento com maior afinidade
6. Sugestões de cursos superiores compatíveis
7. Considerações clínicas e próximos passos

Tom: técnico, empático, orientado ao desenvolvimento do paciente.'
),
(
  'simplified',
  'Com base nos resultados da Jornada Vocacional de {{patient_name}}, gere um relatório simplificado e acessível.

Tipo de percurso: {{path_type}}
Data de geração: {{generated_at}}

Dados das atividades:
{{scores_json}}

O relatório deve:
1. Apresentar os pontos fortes e interesses do(a) jovem em linguagem acessível
2. Listar as 5 áreas de curso mais indicadas com breve descrição
3. Destacar características pessoais observadas
4. Oferecer encorajamento e orientação positiva

Tom: acolhedor, motivador, linguagem clara para adolescentes e familiares.'
)
ON CONFLICT (prompt_type) DO NOTHING;

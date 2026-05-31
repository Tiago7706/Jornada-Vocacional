-- ══════════════════════════════════════════════════════════════════════════════
-- Jornada Vocacional — RLS Policies
-- Aplicar no Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Helper: verifica se o usuário autenticado tem role=admin ─────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  )
$$;

-- ── Habilitar RLS em todas as tabelas ────────────────────────────────────────
ALTER TABLE patients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences        ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_scores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports            ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_prompts     ENABLE ROW LEVEL SECURITY;

-- ── patients ─────────────────────────────────────────────────────────────────
-- Paciente lê/atualiza somente sua própria linha; admin acessa tudo
CREATE POLICY "patients_select" ON patients
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "patients_update" ON patients
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

-- Somente admin pode cadastrar pacientes (via API com service role — bypassa RLS,
-- mas esta policy protege contra inserção direta pelo cliente)
CREATE POLICY "patients_insert" ON patients
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- ── experiences (catálogo público para autenticados) ──────────────────────────
CREATE POLICY "experiences_select" ON experiences
  FOR SELECT TO authenticated
  USING (true);

-- Somente admin altera o catálogo
CREATE POLICY "experiences_admin_write" ON experiences
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── patient_experiences ───────────────────────────────────────────────────────
CREATE POLICY "pe_select" ON patient_experiences
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid() OR is_admin());

CREATE POLICY "pe_insert" ON patient_experiences
  FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid() OR is_admin());

CREATE POLICY "pe_update" ON patient_experiences
  FOR UPDATE TO authenticated
  USING (patient_id = auth.uid() OR is_admin())
  WITH CHECK (patient_id = auth.uid() OR is_admin());

-- ── experience_scores ─────────────────────────────────────────────────────────
CREATE POLICY "scores_select" ON experience_scores
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid() OR is_admin());

CREATE POLICY "scores_insert" ON experience_scores
  FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid() OR is_admin());

-- Paciente não pode alterar score já enviado; admin pode corrigir
CREATE POLICY "scores_update_admin" ON experience_scores
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── activity_logs ─────────────────────────────────────────────────────────────
CREATE POLICY "logs_insert" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid() OR is_admin());

CREATE POLICY "logs_select" ON activity_logs
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid() OR is_admin());

-- ── reports (somente admin) ───────────────────────────────────────────────────
CREATE POLICY "reports_admin" ON reports
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── report_prompts (somente admin) ───────────────────────────────────────────
CREATE POLICY "prompts_admin" ON report_prompts
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

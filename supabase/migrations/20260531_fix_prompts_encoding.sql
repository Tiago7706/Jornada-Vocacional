-- ══════════════════════════════════════════════════════════════════════════════
-- Fix: reescreve os prompts com encoding UTF-8 correto
-- Aplicar no Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════

-- Apaga e reinsere com texto correto (evita problemas de UPDATE com encoding)
DELETE FROM report_prompts;

INSERT INTO report_prompts (prompt_type, template, updated_at) VALUES (
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
5. Estilo cognitivo e preferências de aprendizado
6. Áreas de atuação profissional recomendadas (liste pelo menos 5 cursos/carreiras)
7. Pontos de atenção e considerações clínicas
8. Recomendações para o processo de orientação vocacional

Escreva em português, com linguagem técnica mas acessível. Use títulos e subtítulos para organizar o conteúdo.',
NOW()
);

INSERT INTO report_prompts (prompt_type, template, updated_at) VALUES (
'simplified',
'Você é um orientador vocacional. Com base nos dados a seguir, gere um relatório simplificado e motivador para o(a) paciente {{patient_name}}.

Tipo de percurso: {{path_type}}
Data de geração: {{generated_at}}

Dados das experiências realizadas:
{{scores_json}}

O relatório deve incluir:
1. Seus pontos fortes identificados
2. Áreas que mais combinam com você
3. Sugestões de carreiras e cursos (pelo menos 5)
4. Uma mensagem motivadora de encerramento

Escreva em português, de forma amigável, positiva e encorajadora. Use linguagem simples, sem jargões técnicos. O texto é para ser lido diretamente pelo paciente.',
NOW()
);

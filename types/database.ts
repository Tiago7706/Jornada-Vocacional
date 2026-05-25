export type PathType = 'traditional' | 'interactive'
export type ExperienceStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed'
export type ExperienceType = 'interactive' | 'traditional' | 'universal'
export type ReportType = 'clinical' | 'simplified'

export interface Patient {
  id: string
  full_name: string
  email: string
  phone?: string
  birth_date?: string
  admin_notes?: string
  path_type?: PathType
  max_experience_unlocked: number
  created_at: string
  invited_at?: string
  last_seen_at?: string
}

export interface Experience {
  id: number
  slug: string
  title: string
  description?: string
  type: ExperienceType
  order_index: number
}

export interface PatientExperience {
  id: string
  patient_id: string
  experience_id: number
  status: ExperienceStatus
  started_at?: string
  completed_at?: string
  last_activity_at?: string
  time_spent_seconds: number
  game_state?: Record<string, unknown>
}

export interface ExperienceScore {
  id: string
  patient_id: string
  experience_id: number
  scores: Record<string, unknown>
  raw_responses?: Record<string, unknown>
  created_at: string
}

export interface ActivityLog {
  id: string
  patient_id: string
  experience_id?: number
  action: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface Report {
  id: string
  patient_id: string
  report_type: ReportType
  content: string
  prompt_snapshot: string
  gemini_model: string
  generated_by: string
  created_at: string
}

export interface ReportPrompt {
  id: string
  prompt_type: ReportType
  template: string
  updated_at: string
  updated_by?: string
}

export interface GameProps {
  patientId: string
  experienceId: number
  initialState?: Record<string, unknown>
  onStateChange: (state: Record<string, unknown>) => void
  onComplete: (scores: Record<string, unknown>, responses: Record<string, unknown>) => void
}

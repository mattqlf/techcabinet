export interface Profile {
  id: string
  username: string
  is_admin: boolean
  created_at: string
}

export interface Competition {
  id: string
  name: string
  short_description?: string
  description?: string
  num_questions: number
  created_by: string | null
  start_date: string
  end_date: string
  created_at: string
  is_active?: boolean
  is_past?: boolean
}

export interface CompetitionRegistration {
  id: string
  competition_id: string
  user_id: string
  registered_at: string
}

export interface Submission {
  id: string
  competition_id: string
  user_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'error'
  score?: number
  is_best_score: boolean
  admin_reason?: string
  error_message?: string
  retry_count: number
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  completed_at?: string
}

export interface Problem {
  id: string
  submission_id: string
  question_number: number
  problem_text: string
  user_solution: string
  user_answer: string
  created_at: string
}

export interface AIEvaluation {
  id: string
  problem_id: string
  ai_solution?: string
  ai_answer?: string
  is_correct?: boolean
  evaluated_at: string
}

export interface LeaderboardEntry {
  competition_id: string
  competition_name: string
  username: string
  user_id: string
  best_score: number
  total_submissions: number
  last_submission: string
}

export interface SubmissionWithDetails extends Submission {
  problems: (Problem & { ai_evaluation?: AIEvaluation })[]
  competition: Competition
  user_profile: Profile
  reviewed_by_profile?: Profile
}

export interface CompetitionWithStatus extends Competition {
  is_active: boolean
  is_past: boolean
}

// Form types
export interface SubmissionFormData {
  competition_id: string
  user_id: string
  problems: Array<{
    question_number: number
    problem_text: string
    user_solution: string
    user_answer: string
  }>
}

export interface CompetitionFormData {
  name: string
  short_description?: string
  description?: string
  num_questions: number
  start_date: string
  end_date: string
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface SubmissionReviewData {
  status: 'accepted' | 'rejected'
  admin_reason?: string
}

// Dashboard Stats
export interface DashboardStats {
  totalCompetitions: number
  totalSubmissions: number
  completedSubmissions: number
  pendingSubmissions: number
  averageScore: number
}
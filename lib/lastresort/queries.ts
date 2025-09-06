import { createClient } from '@/lib/supabase/server'
import type { 
  CompetitionWithStatus, 
  SubmissionWithDetails, 
  LeaderboardEntry
} from './types'

export async function getCompetitions() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('competitions_with_status')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as CompetitionWithStatus[]
}

export async function getActiveCompetitions() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('competitions_with_status')
    .select('*')
    .eq('is_active', true)
    .order('end_date', { ascending: true })
  
  if (error) throw error
  return data as CompetitionWithStatus[]
}

export async function getPastCompetitions() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('competitions_with_status')
    .select('*')
    .eq('is_past', true)
    .order('end_date', { ascending: false })
  
  if (error) throw error
  return data as CompetitionWithStatus[]
}

export async function getCompetitionById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('competitions_with_status')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as CompetitionWithStatus
}

export async function getUserRegistrations(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('competition_registrations')
    .select(`
      *,
      competition:competitions_with_status(*)
    `)
    .eq('user_id', userId)
    .order('registered_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function isUserRegistered(competitionId: string, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('competition_registrations')
    .select('id')
    .eq('competition_id', competitionId)
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

export async function getUserSubmissions(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      competition:competitions(name),
      problems:problems(
        *,
        ai_evaluation:ai_evaluations(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as SubmissionWithDetails[]
}

export async function getSubmissionById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      competition:competitions(*),
      user_profile:profiles(username),
      reviewed_by_profile:profiles!submissions_reviewed_by_fkey(username),
      problems:problems(
        *,
        ai_evaluation:ai_evaluations(*)
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as SubmissionWithDetails
}

export async function getCompetitionSubmissions(competitionId: string, userId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('submissions')
    .select(`
      *,
      user_profile:profiles(username),
      problems:problems(*)
    `)
    .eq('competition_id', competitionId)
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getLeaderboard(competitionId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('competition_id', competitionId)
    .order('best_score', { ascending: false })
  
  if (error) throw error
  return data as LeaderboardEntry[]
}

export async function getPendingSubmissions() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      competition:competitions(name),
      user_profile:profiles(username),
      problems:problems(*)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

export async function getAdminStats() {
  const supabase = await createClient()
  
  const [
    { count: totalCompetitions },
    { count: activeCompetitions },
    { count: pendingSubmissions },
    { count: totalUsers }
  ] = await Promise.all([
    supabase.from('competitions').select('*', { count: 'exact', head: true }),
    supabase.from('competitions_with_status').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
  ])
  
  return {
    totalCompetitions: totalCompetitions || 0,
    activeCompetitions: activeCompetitions || 0,
    pendingSubmissions: pendingSubmissions || 0,
    totalUsers: totalUsers || 0
  }
}

export async function canUserRegisterForCompetition(competitionId: string, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('can_register_for_competition', {
      competition_id_param: competitionId,
      user_id_param: userId
    })
  
  if (error) throw error
  return data as boolean
}

export async function canUserSubmitToCompetition(competitionId: string, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('can_submit_to_competition', {
      competition_id_param: competitionId,
      user_id_param: userId
    })
  
  if (error) throw error
  return data as boolean
}
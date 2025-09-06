'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CompetitionFormData } from '../types'

export async function createCompetition(formData: CompetitionFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!profile?.is_admin) {
    throw new Error('Admin access required')
  }

  const { data, error } = await supabase
    .from('competitions')
    .insert({
      ...formData,
      created_by: user.id
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create competition: ${error.message}`)
  }
  
  revalidatePath('/lastresort/admin/competitions')
  return { data, error: null }
}

export async function updateCompetition(id: string, formData: Partial<CompetitionFormData>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!profile?.is_admin) {
    throw new Error('Admin access required')
  }

  const { data, error } = await supabase
    .from('competitions')
    .update(formData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update competition: ${error.message}`)
  }
  
  revalidatePath('/lastresort/admin/competitions')
  revalidatePath(`/lastresort/competitions/${id}`)
  return { data, error: null }
}

export async function deleteCompetition(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!profile?.is_admin) {
    throw new Error('Admin access required')
  }

  const { error } = await supabase
    .from('competitions')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to delete competition: ${error.message}`)
  }
  
  revalidatePath('/lastresort/admin/competitions')
  return { error: null }
}

export async function registerForCompetition(competitionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check if user can register using the database function
  const { data: canRegister } = await supabase
    .rpc('can_register_for_competition', {
      competition_id_param: competitionId,
      user_id_param: user.id
    })
  
  if (!canRegister) {
    throw new Error('Cannot register for this competition')
  }

  const { data, error } = await supabase
    .from('competition_registrations')
    .insert({
      competition_id: competitionId,
      user_id: user.id
    })
    .select()
    .single()
  
  if (error) {
    if (error.code === '23505') { // unique violation
      throw new Error('Already registered for this competition')
    }
    throw new Error(`Failed to register: ${error.message}`)
  }
  
  revalidatePath('/lastresort/dashboard')
  revalidatePath(`/lastresort/competitions/${competitionId}`)
  return { data, error: null }
}

export async function unregisterFromCompetition(competitionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('competition_registrations')
    .delete()
    .eq('competition_id', competitionId)
    .eq('user_id', user.id)
  
  if (error) {
    throw new Error(`Failed to unregister: ${error.message}`)
  }
  
  revalidatePath('/lastresort/dashboard')
  revalidatePath(`/lastresort/competitions/${competitionId}`)
  return { error: null }
}
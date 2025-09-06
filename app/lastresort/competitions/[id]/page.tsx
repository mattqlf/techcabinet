import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CompetitionDetails } from '@/components/lastresort/CompetitionDetails'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: competition } = await supabase
    .from('competitions')
    .select('name, short_description')
    .eq('id', id)
    .single()

  if (!competition) {
    return {
      title: 'not found',
    }
  }

  return {
    title: competition.name,
    description: competition.short_description,
  }
}

export default async function CompetitionPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get competition details using the view
  const { data: competition } = await supabase
    .from('competitions_with_status')
    .select(`
      *,
      created_by:profiles!competitions_created_by_fkey(username)
    `)
    .eq('id', id)
    .single()

  if (!competition) {
    notFound()
  }

  // Check if user is registered
  const { data: registration } = await supabase
    .from('competition_registrations')
    .select('id, registered_at')
    .eq('competition_id', id)
    .eq('user_id', user.id)
    .single()

  // Get user's submissions for this competition
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      id,
      status,
      score,
      admin_reason,
      created_at,
      completed_at
    `)
    .eq('competition_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get registration count
  const { count: registrationCount } = await supabase
    .from('competition_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('competition_id', id)

  return (
    <CompetitionDetails
      competition={competition}
      isRegistered={!!registration}
      registration={registration}
      userSubmissions={submissions || []}
      registrationCount={registrationCount || 0}
    />
  )
}
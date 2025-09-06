import { createClient } from '@/lib/supabase/server'
import { CompetitionCard } from '@/components/lastresort/CompetitionCard'

export const metadata = {
  title: 'active competitions',
  description: 'Browse and register for active AI challenge competitions'
}

export default async function ActiveCompetitionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get all active competitions using the view
  const { data: competitions } = await supabase
    .from('competitions_with_status')
    .select(`
      *,
      created_by:profiles!competitions_created_by_fkey(username)
    `)
    .eq('is_active', true)
    .order('end_date', { ascending: true })

  // Get user's registrations
  const { data: registrations } = await supabase
    .from('competition_registrations')
    .select('competition_id')
    .eq('user_id', user.id)

  const registrationIds = new Set(registrations?.map(r => r.competition_id) || [])

  // Get user's submissions for registered competitions
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, status, score, competition_id')
    .eq('user_id', user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extralight bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">Active Competitions</h1>
        <p className="mt-2 text-gray-300 font-light">
          Browse and register for currently running competitions
        </p>
      </div>

      {competitions && competitions.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {competitions.map((competition) => (
            <CompetitionCard
              key={competition.id}
              competition={competition}
              isRegistered={registrationIds.has(competition.id)}
              userSubmissions={submissions?.filter(s => s.competition_id === competition.id) || []}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-3xl border border-gray-800/50">
          <div className="mx-auto max-w-md">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-purple-500/30">
              <div className="text-2xl">🏆</div>
            </div>
            <h3 className="mt-2 text-lg font-light text-gray-200">
              No active competitions
            </h3>
            <p className="mt-1 text-sm text-gray-400 font-light">
              Check back soon for new competitions or browse past competitions to see what you missed.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
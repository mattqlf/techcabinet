import { createClient } from '@/lib/supabase/server'
import { CompetitionCard } from '@/components/lastresort/CompetitionCard'
import { DashboardStats } from '@/components/lastresort/DashboardStats'
import Link from 'next/link'

export const metadata = {
  title: 'dashboard',
  description: 'Your competition dashboard'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's registered competitions
  const { data: registeredCompetitions } = await supabase
    .from('competition_registrations')
    .select(`
      *,
      competition:competitions_with_status(
        id,
        name,
        short_description,
        start_date,
        end_date,
        is_active,
        is_past,
        num_questions
      )
    `)
    .eq('user_id', user.id)
    .order('registered_at', { ascending: false })

  // Get user's submission stats
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, status, score, competition_id')
    .eq('user_id', user.id)

  const competitions = registeredCompetitions?.map(reg => reg.competition) || []
  const activeCompetitions = competitions.filter(c => c.is_active)
  const pastCompetitions = competitions.filter(c => c.is_past)
  const upcomingCompetitions = competitions.filter(c => !c.is_active && !c.is_past)

  // Get user profile for personalization
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          {/* Greeting */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">
                {getTimeOfDay() === 'morning' ? '🌅' : getTimeOfDay() === 'afternoon' ? '☀️' : '🌙'}
              </div>
              <div>
                <h1 className="text-4xl font-extralight bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent tracking-wide">
                  Good {getTimeOfDay()}, {profile?.username || 'there'}!
                </h1>
                <p className="text-xl text-gray-300 mt-1 font-light">
                  Ready to challenge some AI models? 🤖⚡
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/lastresort/competitions/active"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-light shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Browse Active Competitions
            </Link>
            
            <Link
              href="/lastresort/submissions"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-gray-200 font-light hover:bg-gray-700/50 hover:shadow-lg transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View My Submissions
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <DashboardStats 
        submissions={submissions || []}
        totalCompetitions={competitions.length}
      />

      {competitions.length === 0 ? (
        /* Empty State */
        <div className="relative">
          <div className="text-center py-16 px-8">
            <div className="mx-auto max-w-md space-y-6">
              {/* Animated illustration */}
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-violet-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
                <div className="text-4xl animate-bounce">🚀</div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  Ready for Your First Challenge?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Join the AI testing revolution! Register for competitions and see if you can create problems that stump the smartest AI models.
                </p>
              </div>
              
              <div className="pt-4">
                <Link
                  href="/lastresort/competitions/active"
                  className="inline-flex items-center px-8 py-4 rounded-xl btn-gradient text-lg font-semibold shadow-lg shadow-violet-500/25"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Explore Competitions
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Competitions Sections */
        <div className="space-y-12">
          {activeCompetitions.length > 0 && (
            <section className="fade-in">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    Active Competitions ({activeCompetitions.length})
                  </h2>
                  <p className="text-gray-600">Competitions you can submit to right now</p>
                </div>
                <Link
                  href="/lastresort/competitions/active"
                  className="btn-ghost-modern flex items-center space-x-2 text-green-600 hover:text-green-700"
                >
                  <span>View all</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {activeCompetitions.map((competition, index) => (
                  <div key={competition.id} className="slide-in-left" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CompetitionCard
                      competition={competition}
                      isRegistered={true}
                      userSubmissions={submissions?.filter(s => s.competition_id === competition.id) || []}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {upcomingCompetitions.length > 0 && (
            <section className="fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    Upcoming Competitions ({upcomingCompetitions.length})
                  </h2>
                  <p className="text-gray-600">Get ready for these upcoming challenges</p>
                </div>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingCompetitions.map((competition, index) => (
                  <div key={competition.id} className="slide-in-left" style={{ animationDelay: `${(index + 3) * 0.1}s` }}>
                    <CompetitionCard
                      competition={competition}
                      isRegistered={true}
                      userSubmissions={[]}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {pastCompetitions.length > 0 && (
            <section className="fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent flex items-center">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                    Past Competitions ({pastCompetitions.length})
                  </h2>
                  <p className="text-gray-600">Review your previous challenges and results</p>
                </div>
                <Link
                  href="/lastresort/competitions/past"
                  className="btn-ghost-modern flex items-center space-x-2 text-gray-600 hover:text-gray-700"
                >
                  <span>View all</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {pastCompetitions.slice(0, 6).map((competition, index) => (
                  <div key={competition.id} className="slide-in-left" style={{ animationDelay: `${(index + 6) * 0.1}s` }}>
                    <CompetitionCard
                      competition={competition}
                      isRegistered={true}
                      userSubmissions={submissions?.filter(s => s.competition_id === competition.id) || []}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
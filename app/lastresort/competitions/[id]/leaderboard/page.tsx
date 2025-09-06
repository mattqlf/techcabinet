import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LeaderboardTable } from '@/components/lastresort/LeaderboardTable'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: competition } = await supabase
    .from('competitions')
    .select('name')
    .eq('id', id)
    .single()

  return {
    title: 'leaderboard',
    description: 'View competition rankings and scores',
  }
}

export default async function LeaderboardPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get competition details using the view
  const { data: competition } = await supabase
    .from('competitions_with_status')
    .select('*')
    .eq('id', id)
    .single()

  if (!competition) {
    notFound()
  }

  // Get leaderboard data with fresh usernames - simplified approach
  let leaderboardData = []
  let leaderboardError = null
  
  try {
    // First get all completed submissions with scores
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('user_id, score, created_at')
      .eq('competition_id', id)
      .eq('status', 'completed')
      .not('score', 'is', null)
    
    if (submissionsError) {
      leaderboardError = submissionsError
      console.error('Submissions query error:', submissionsError)
    } else if (submissions && submissions.length > 0) {
      // Get unique user IDs
      const userIds = [...new Set(submissions.map(s => s.user_id))]
      
      // Get usernames for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds)
      
      if (profilesError) {
        leaderboardError = profilesError
        console.error('Profiles query error:', profilesError)
      } else {
        // Combine the data
        leaderboardData = submissions.map(submission => {
          const profile = profiles?.find(p => p.id === submission.user_id)
          return {
            ...submission,
            profiles: { username: profile?.username || 'Unknown User' }
          }
        })
      }
    }
  } catch (error) {
    leaderboardError = error
    console.error('Leaderboard query error:', error)
  }
  
  console.log('Leaderboard data:', leaderboardData)

  // Process to get best scores per user with fresh usernames
  const userBestScores = new Map()
  const userSubmissionCounts = new Map()
  const userLastSubmissions = new Map()

  leaderboardData?.forEach(submission => {
    const userId = submission.user_id
    const score = parseFloat(submission.score) || 0
    const username = submission.profiles?.username
    
    // Track best score
    if (!userBestScores.has(userId) || score > userBestScores.get(userId).best_score) {
      userBestScores.set(userId, {
        user_id: userId,
        username,
        best_score: score,
        competition_id: id
      })
    }
    
    // Count total submissions
    userSubmissionCounts.set(userId, (userSubmissionCounts.get(userId) || 0) + 1)
    
    // Track last submission
    if (!userLastSubmissions.has(userId) || new Date(submission.created_at) > new Date(userLastSubmissions.get(userId))) {
      userLastSubmissions.set(userId, submission.created_at)
    }
  })

  // Convert to final format and sort by best score
  const processedLeaderboardData = Array.from(userBestScores.values())
    .map(entry => ({
      ...entry,
      total_submissions: userSubmissionCounts.get(entry.user_id) || 0,
      last_submission: userLastSubmissions.get(entry.user_id)
    }))
    .sort((a, b) => b.best_score - a.best_score)
  
  console.log('Processed leaderboard data:', processedLeaderboardData)

  // Get total participants count
  const { count: totalParticipants } = await supabase
    .from('competition_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('competition_id', id)

  // Calculate average score if there are submissions
  const averageScore = processedLeaderboardData && processedLeaderboardData.length > 0
    ? processedLeaderboardData.reduce((sum, entry) => sum + (entry.best_score || 0), 0) / processedLeaderboardData.length
    : 0

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">🏆</div>
              <div>
                <h1 className="text-4xl font-extralight bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                  {competition.name}
                </h1>
                <p className="text-xl text-gray-300 font-light mt-1">
                  Live leaderboard rankings 🏅
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competition Stats */}
      <section className="fade-in">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
              Competition Statistics
            </h2>
            <p className="text-gray-300 font-light mt-1">Performance metrics and participation overview</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                label: 'Total Participants', 
                value: totalParticipants || 0, 
                icon: '👥', 
                color: 'from-blue-500 to-cyan-500', 
                bg: 'from-gray-900/50 to-black/50',
                description: 'Registered users'
              },
              { 
                label: 'Active Submissions', 
                value: processedLeaderboardData?.length || 0, 
                icon: '🏆', 
                color: 'from-green-500 to-emerald-500', 
                bg: 'from-gray-900/50 to-black/50',
                description: 'With scores'
              },
              { 
                label: 'Average Score', 
                value: `${averageScore.toFixed(1)}%`, 
                icon: '📊', 
                color: 'from-purple-500 to-violet-500', 
                bg: 'from-gray-900/50 to-black/50',
                description: 'Competition average'
              }
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="group relative hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500`}></div>
                
                <div className={`relative bg-gradient-to-br ${stat.bg} backdrop-blur-sm border border-gray-800/50 rounded-3xl shadow-lg overflow-hidden`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                        <span className="text-xl text-white">{stat.icon}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`text-3xl font-light bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                      <h3 className="font-light text-gray-200 text-sm">
                        {stat.label}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status indicator */}
      <div className="flex items-center justify-center">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-light backdrop-blur-sm border ${competition.is_active ? 'bg-green-900/50 text-green-300 border-green-800/50' : competition.is_past ? 'bg-gray-900/50 text-gray-300 border-gray-800/50' : 'bg-yellow-900/50 text-yellow-300 border-yellow-800/50'}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${competition.is_active ? 'bg-green-400 animate-pulse' : competition.is_past ? 'bg-gray-400' : 'bg-yellow-400 animate-pulse'}`}></div>
          {competition.is_active ? '🔥 Live Competition' : competition.is_past ? '🏁 Competition Ended' : '⏳ Competition Not Started'}
        </div>
      </div>

      {leaderboardError ? (
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-gradient-to-br from-red-900/50 to-pink-900/50 border border-red-800/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-light text-red-300 mb-2">Error Loading Leaderboard</h3>
            <p className="text-red-400 font-light">{leaderboardError.message || 'Unknown error occurred'}</p>
            <p className="text-red-500 text-sm font-light mt-2">Please check the browser console for more details.</p>
          </div>
        </div>
      ) : (
        <LeaderboardTable 
          data={processedLeaderboardData || []}
          competition={competition}
          currentUserId={user.id}
        />
      )}
    </div>
  )
}
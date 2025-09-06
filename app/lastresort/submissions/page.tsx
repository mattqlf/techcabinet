import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/lastresort/StatusBadge'
import Link from 'next/link'

export const metadata = {
  title: 'submissions',
  description: 'View all your competition submissions'
}

// Force dynamic rendering for real-time updates
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SubmissionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get all user submissions with competition info
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      competition:competitions_with_status(
        id,
        name,
        is_active,
        is_past
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get user profile for personalization
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  // Organize submissions by status
  const pendingSubmissions = submissions?.filter(s => s.status === 'pending') || []
  const reviewingSubmissions = submissions?.filter(s => s.status === 'reviewing') || []
  const completedSubmissions = submissions?.filter(s => s.status === 'completed') || []
  const rejectedSubmissions = submissions?.filter(s => s.status === 'rejected') || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'reviewing': return '🔄' 
      case 'completed': return '✅'
      case 'rejected': return '❌'
      default: return '📝'
    }
  }

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'pending': return 'from-amber-500 to-orange-500'
      case 'reviewing': return 'from-blue-500 to-cyan-500'
      case 'completed': return 'from-green-500 to-emerald-500'
      case 'rejected': return 'from-red-500 to-pink-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'pending': return 'from-amber-500/10 to-orange-500/10'
      case 'reviewing': return 'from-blue-500/10 to-cyan-500/10'
      case 'completed': return 'from-green-500/10 to-emerald-500/10'
      case 'rejected': return 'from-red-500/10 to-pink-500/10'
      default: return 'from-gray-500/10 to-slate-500/10'
    }
  }

  const SubmissionCard = ({ submission, index }: { submission: any, index: number }) => (
    <div 
      className="group relative hover-lift"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Gradient border effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${getStatusGradient(submission.status)} rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500`}></div>
      
      <div className={`relative border border-gray-800/50 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm overflow-hidden rounded-3xl`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${getStatusBg(submission.status)} opacity-30`}></div>
        {/* Status stripe */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getStatusGradient(submission.status)}`}></div>
        
        <Link 
          href={`/lastresort/submissions/${submission.id}`}
          className="block p-6"
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getStatusGradient(submission.status)} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <span className="text-lg text-white">{getStatusIcon(submission.status)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-blue-400 transition-all duration-300">
                      {submission.competition.name}
                    </h3>
                    <p className="text-sm text-gray-400 font-light">
                      Submitted {new Date(submission.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <StatusBadge status={submission.status} />
            </div>

            {/* Content */}
            <div className="space-y-3">
              {/* Score display */}
              {submission.score !== null && (
                <div className="flex items-center justify-between p-3 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30">
                  <span className="text-sm font-light text-gray-300">Final Score</span>
                  <span className={`text-lg font-bold bg-gradient-to-r ${getStatusGradient(submission.status)} bg-clip-text text-transparent`}>
                    {submission.score}%
                  </span>
                </div>
              )}

              {/* AI feedback */}
              {submission.ai_feedback && (
                <div className="p-3 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white">🤖</span>
                    </div>
                    <div>
                      <p className="text-xs font-light text-gray-300 mb-1">AI Feedback</p>
                      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 font-light">
                        {submission.ai_feedback}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin note */}
              {submission.admin_reason && (
                <div className="p-3 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white">👨‍💼</span>
                    </div>
                    <div>
                      <p className="text-xs font-light text-gray-300 mb-1">Admin Note</p>
                      <p className="text-sm text-gray-400 leading-relaxed font-light">
                        {submission.admin_reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
              <div className="text-xs text-gray-500 font-light">
                Competition {submission.competition.is_past ? 'ended' : submission.competition.is_active ? 'active' : 'upcoming'}
              </div>
              <svg className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">📝</div>
              <div>
                <h1 className="text-4xl font-extralight bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                  My Submissions
                </h1>
                <p className="text-xl text-gray-300 mt-1 font-light">
                  Track your progress, {profile?.username || 'challenger'}! 🚀
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {submissions && submissions.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total', count: submissions.length, color: 'from-purple-500 to-violet-500', bg: 'from-purple-500/10 to-violet-500/10', icon: '📊' },
                { label: 'Completed', count: completedSubmissions.length, color: 'from-green-500 to-emerald-500', bg: 'from-green-500/10 to-emerald-500/10', icon: '✅' },
                { label: 'Pending', count: pendingSubmissions.length, color: 'from-amber-500 to-orange-500', bg: 'from-amber-500/10 to-orange-500/10', icon: '⏳' },
                { label: 'Reviewing', count: reviewingSubmissions.length, color: 'from-blue-500 to-cyan-500', bg: 'from-blue-500/10 to-cyan-500/10', icon: '🔄' }
              ].map((stat, index) => (
                <div 
                  key={stat.label}
                  className="group relative hover-lift"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500`}></div>
                  
                  <div className={`relative border border-gray-800/50 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm overflow-hidden rounded-3xl`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-30`}></div>
                    <div className="p-6 relative">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                          <span className="text-xl text-white">{stat.icon}</span>
                        </div>
                        <div>
                          <div className={`text-3xl font-light bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                            {stat.count}
                          </div>
                          <div className="text-sm font-light text-gray-300">{stat.label}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/lastresort/competitions/active"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-light shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Submit to Active Competitions
            </Link>
            
            <Link
              href="/lastresort/dashboard"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-gray-200 font-light hover:bg-gray-700/50 hover:shadow-lg transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Submissions Content */}
      {submissions && submissions.length > 0 ? (
        <div className="space-y-8">
          {/* Recent Submissions */}
          <section className="fade-in">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                  All Submissions ({submissions.length})
                </h2>
                <p className="text-gray-400 font-light">Your complete submission history</p>
              </div>
            </div>
            
            <div className="grid gap-6">
              {submissions.map((submission, index) => (
                <SubmissionCard key={submission.id} submission={submission} index={index} />
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* Empty State */
        <div className="relative">
          <div className="text-center py-16 px-8">
            <div className="mx-auto max-w-md space-y-6">
              {/* Animated illustration */}
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-purple-500/30">
                <div className="text-4xl animate-bounce">📝</div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                  No Submissions Yet
                </h3>
                <p className="text-gray-300 leading-relaxed font-light">
                  Ready to challenge some AI? Join competitions and submit your most creative problems to see if you can make AI models fail!
                </p>
              </div>
              
              <div className="pt-4">
                <Link
                  href="/lastresort/competitions/active"
                  className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-lg font-light shadow-lg shadow-purple-500/25"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Browse Active Competitions
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
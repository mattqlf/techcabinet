import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { StatusBadge } from '@/components/lastresort/StatusBadge'
import { DeleteCompetitionButton } from '@/components/lastresort/DeleteCompetitionButton'

export const metadata = {
  title: 'competitions',
  description: 'Create and manage competitions'
}

export default async function AdminCompetitionsPage() {
  const supabase = await createClient()

  // Get all competitions with creator info using the view
  const { data: competitions } = await supabase
    .from('competitions_with_status')
    .select(`
      *,
      created_by:profiles!competitions_created_by_fkey(username)
    `)
    .order('created_at', { ascending: false })

  // Get registration and submission counts for each competition
  const competitionIds = competitions?.map(c => c.id) || []
  
  const [registrationCounts, submissionCounts] = await Promise.all([
    Promise.all(competitionIds.map(async (id) => {
      const { count } = await supabase
        .from('competition_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('competition_id', id)
      return { id, count: count || 0 }
    })),
    Promise.all(competitionIds.map(async (id) => {
      const { count } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('competition_id', id)
      return { id, count: count || 0 }
    }))
  ])

  const registrationMap = new Map(registrationCounts.map(r => [r.id, r.count]))
  const submissionMap = new Map(submissionCounts.map(s => [s.id, s.count]))

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'active': return 'from-green-500 to-emerald-500'
      case 'past': return 'from-gray-500 to-slate-500'
      case 'upcoming': return 'from-blue-500 to-violet-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'from-green-900/50 to-emerald-900/50'
      case 'past': return 'from-gray-900/50 to-slate-900/50'
      case 'upcoming': return 'from-blue-900/50 to-violet-900/50'
      default: return 'from-gray-900/50 to-slate-900/50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🔥'
      case 'past': return '📚'
      case 'upcoming': return '🚀'
      default: return '📋'
    }
  }

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="text-4xl">⚙️</div>
                <div>
                  <h1 className="text-4xl font-extralight bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                    Manage Competitions
                  </h1>
                  <p className="text-xl text-gray-300 font-light mt-1">
                    Create, edit, and monitor AI challenges 🏆
                  </p>
                </div>
              </div>
            </div>
            
            <Link
              href="/lastresort/admin/competitions/new"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-light shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Competition
            </Link>
          </div>

          {/* Quick Stats */}
          {competitions && competitions.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { 
                  label: 'Total', 
                  count: competitions.length, 
                  color: 'from-purple-500 to-violet-500', 
                  bg: 'from-gray-900/50 to-black/50', 
                  icon: '🏆' 
                },
                { 
                  label: 'Active', 
                  count: competitions.filter(c => c.is_active).length, 
                  color: 'from-green-500 to-emerald-500', 
                  bg: 'from-gray-900/50 to-black/50', 
                  icon: '🔥' 
                },
                { 
                  label: 'Past', 
                  count: competitions.filter(c => c.is_past).length, 
                  color: 'from-gray-500 to-slate-500', 
                  bg: 'from-gray-900/50 to-black/50', 
                  icon: '📚' 
                },
                { 
                  label: 'Upcoming', 
                  count: competitions.filter(c => !c.is_active && !c.is_past).length, 
                  color: 'from-blue-500 to-cyan-500', 
                  bg: 'from-gray-900/50 to-black/50', 
                  icon: '🚀' 
                }
              ].map((stat, index) => (
                <div 
                  key={stat.label}
                  className="relative group hover-lift"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-20`}></div>
                  <div className={`relative bg-gradient-to-br ${stat.bg} p-4 rounded-3xl border border-gray-800/50 backdrop-blur-sm`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <span className="text-white">{stat.icon}</span>
                      </div>
                      <div>
                        <div className={`text-2xl font-light bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.count}
                        </div>
                        <div className="text-sm text-gray-400 font-light">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {competitions && competitions.length > 0 ? (
        <section className="fade-in">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                All Competitions ({competitions.length})
              </h2>
              <p className="text-gray-300 font-light mt-1">Manage and monitor your AI challenges</p>
            </div>
            
            <div className="grid gap-6">
              {competitions.map((competition, index) => {
                const registrations = registrationMap.get(competition.id) || 0
                const submissions = submissionMap.get(competition.id) || 0
                
                let status: 'active' | 'upcoming' | 'past'
                if (competition.is_active) {
                  status = 'active'
                } else if (competition.is_past) {
                  status = 'past'
                } else {
                  status = 'upcoming'
                }

                return (
                  <div 
                    key={competition.id}
                    className="group relative hover-lift"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Gradient border effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${getStatusGradient(status)} rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500`}></div>
                    
                    <div className={`relative bg-gradient-to-br ${getStatusBg(status)} backdrop-blur-sm border border-gray-800/50 rounded-3xl shadow-lg overflow-hidden`}>
                      {/* Status stripe */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getStatusGradient(status)}`}></div>
                      
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-3">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getStatusGradient(status)} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                                <span className="text-xl text-white">{getStatusIcon(status)}</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-blue-400 transition-all duration-300">
                                  {competition.name}
                                </h3>
                                <p className="text-sm text-gray-400 font-light">
                                  Created by {competition.created_by?.username || 'Unknown'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={status} />
                        </div>

                        {/* Description */}
                        {competition.short_description && (
                          <div className="mb-4">
                            <p className="text-gray-300 font-light leading-relaxed">
                              {competition.short_description}
                            </p>
                          </div>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                            <div className={`text-lg font-light bg-gradient-to-r ${getStatusGradient(status)} bg-clip-text text-transparent`}>
                              {registrations}
                            </div>
                            <div className="text-xs text-gray-500">Registered</div>
                          </div>
                          <div className="text-center p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                            <div className={`text-lg font-light bg-gradient-to-r ${getStatusGradient(status)} bg-clip-text text-transparent`}>
                              {submissions}
                            </div>
                            <div className="text-xs text-gray-500">Submissions</div>
                          </div>
                          <div className="text-center p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                            <div className={`text-lg font-light bg-gradient-to-r ${getStatusGradient(status)} bg-clip-text text-transparent`}>
                              {competition.num_questions}
                            </div>
                            <div className="text-xs text-gray-500">Questions</div>
                          </div>
                          <div className="text-center p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                            <div className={`text-lg font-light bg-gradient-to-r ${getStatusGradient(status)} bg-clip-text text-transparent`}>
                              {Math.ceil((new Date(competition.end_date).getTime() - new Date(competition.start_date).getTime()) / (1000 * 60 * 60 * 24))}
                            </div>
                            <div className="text-xs text-gray-500">Days</div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center justify-between text-sm text-gray-300 font-light mb-6">
                          <span>
                            📅 {new Date(competition.start_date).toLocaleDateString()} - {new Date(competition.end_date).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`/lastresort/competitions/${competition.id}/leaderboard`}
                            className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300 font-light hover:bg-gray-700/50 hover:shadow-lg transition-all duration-300 text-sm"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Leaderboard
                          </Link>
                          <Link
                            href={`/lastresort/admin/competitions/${competition.id}/edit`}
                            className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300 font-light hover:bg-gray-700/50 hover:shadow-lg transition-all duration-300 text-sm"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                          <Link
                            href={`/lastresort/admin/review?competition=${competition.id}`}
                            className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-light hover:shadow-lg transition-all duration-300 text-sm"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            Review ({submissions})
                          </Link>
                          <DeleteCompetitionButton 
                            competitionId={competition.id}
                            competitionName={competition.name}
                            hasSubmissions={submissions > 0}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : (
        /* Empty State */
        <div className="relative">
          <div className="text-center py-16 px-8">
            <div className="mx-auto max-w-md space-y-6">
              {/* Animated illustration */}
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-purple-500/30 backdrop-blur-sm">
                <div className="text-4xl animate-bounce">🏆</div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                  No Competitions Yet
                </h3>
                <p className="text-gray-300 font-light leading-relaxed">
                  Ready to challenge AI models? Create your first competition and see if users can stump the smartest systems!
                </p>
              </div>
              
              <div className="pt-4">
                <Link
                  href="/lastresort/admin/competitions/new"
                  className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-lg font-light shadow-lg shadow-purple-500/25"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Create First Competition
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get admin statistics
  const [
    { count: totalCompetitions },
    { count: activeCompetitions },
    { count: pendingSubmissions },
    { count: totalUsers },
    { count: reviewingSubmissions },
    { count: completedSubmissions }
  ] = await Promise.all([
    supabase.from('competitions').select('*', { count: 'exact', head: true }),
    supabase.from('competitions_with_status').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'reviewing'),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'completed')
  ])

  // Get user profile for greeting
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user?.id)
    .single()

  const stats = [
    {
      name: 'Total Competitions',
      value: totalCompetitions || 0,
      href: '/lastresort/admin/competitions',
      icon: '🏆',
      color: 'from-purple-500 to-violet-500',
      bg: 'from-purple-500/10 to-violet-500/10',
      description: 'All competitions created'
    },
    {
      name: 'Active Competitions',
      value: activeCompetitions || 0,
      href: '/lastresort/admin/competitions',
      icon: '🔥',
      color: 'from-green-500 to-emerald-500',
      bg: 'from-green-500/10 to-emerald-500/10',
      description: 'Currently running'
    },
    {
      name: 'Pending Reviews',
      value: pendingSubmissions || 0,
      href: '/lastresort/admin/review',
      icon: '⏳',
      color: 'from-amber-500 to-orange-500',
      bg: 'from-amber-500/10 to-orange-500/10',
      description: 'Awaiting admin review',
      urgent: (pendingSubmissions || 0) > 0
    },
    {
      name: 'Total Users',
      value: totalUsers || 0,
      href: '/lastresort/admin/users',
      icon: '👥',
      color: 'from-blue-500 to-cyan-500',
      bg: 'from-blue-500/10 to-cyan-500/10',
      description: 'Registered users'
    },
    {
      name: 'Under Review',
      value: reviewingSubmissions || 0,
      href: '/lastresort/admin/review',
      icon: '🔄',
      color: 'from-indigo-500 to-blue-500',
      bg: 'from-indigo-500/10 to-blue-500/10',
      description: 'AI evaluation in progress'
    },
    {
      name: 'Completed',
      value: completedSubmissions || 0,
      href: '/lastresort/admin/review',
      icon: '✅',
      color: 'from-green-500 to-teal-500',
      bg: 'from-green-500/10 to-teal-500/10',
      description: 'Successfully processed'
    }
  ]

  const quickActions = [
    {
      name: 'Create Competition',
      href: '/lastresort/admin/competitions/new',
      icon: '➕',
      description: 'Launch a new AI challenge',
      color: 'btn-gradient',
      primary: true
    },
    {
      name: 'Review Submissions',
      href: '/lastresort/admin/review',
      icon: '👀',
      description: 'Process pending submissions',
      color: 'btn-ghost-modern',
      badge: pendingSubmissions > 0 ? pendingSubmissions : null
    },
    {
      name: 'Manage Competitions',
      href: '/lastresort/admin/competitions',
      icon: '⚙️',
      description: 'Edit and configure competitions',
      color: 'btn-ghost-modern'
    },
    {
      name: 'View Analytics',
      href: '/lastresort/admin/analytics',
      icon: '📊',
      description: 'Platform performance metrics',
      color: 'btn-ghost-modern'
    }
  ]

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
          {/* Admin Greeting */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">
                {getTimeOfDay() === 'morning' ? '🌅' : getTimeOfDay() === 'afternoon' ? '☀️' : '🌙'}
              </div>
              <div>
                <h1 className="text-4xl font-extralight bg-gradient-to-r from-red-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                  Good {getTimeOfDay()}, Admin {profile?.username || ''}!
                </h1>
                <p className="text-xl text-gray-300 mt-1 font-light">
                  Keep the platform running smoothly ⚡🛡️
                </p>
              </div>
            </div>
          </div>

          {/* Alert for pending reviews */}
          {pendingSubmissions > 0 && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-white">⚠️</span>
                </div>
                <div>
                  <p className="text-amber-300 font-light">
                    {pendingSubmissions} submission{pendingSubmissions === 1 ? '' : 's'} awaiting your review
                  </p>
                  <p className="text-amber-400 text-sm font-light">
                    Users are waiting for approval to participate in competitions
                  </p>
                </div>
                <Link
                  href="/lastresort/admin/review"
                  className="ml-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-light hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  Review Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <section className="fade-in">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
              Platform Overview
            </h2>
            <p className="text-gray-400 mt-1 font-light">Real-time metrics and system health</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={stat.name}
                className="group relative hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient border effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500 ${stat.urgent ? 'opacity-40 animate-pulse' : ''}`}></div>
                
                <Link href={stat.href}>
                  <div className={`relative border border-gray-800/50 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm overflow-hidden rounded-3xl`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-30`}></div>
                    {/* Urgent indicator */}
                    {stat.urgent && (
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} animate-pulse`}></div>
                    )}
                    
                    <div className="p-6 relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                          <span className="text-xl text-white">{stat.icon}</span>
                        </div>
                        
                        {stat.urgent && (
                          <div className="animate-pulse">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-light bg-red-500/20 text-red-300 border border-red-500/30">
                              Action Needed
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className={`text-3xl font-light bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.value}
                        </div>
                        <h3 className="font-light text-gray-200">
                          {stat.name}
                        </h3>
                        <p className="text-sm text-gray-400 font-light">
                          {stat.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
              Quick Actions
            </h2>
            <p className="text-gray-400 mt-1 font-light">Common administrative tasks</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <div
                key={action.name}
                className="group relative hover-lift"
                style={{ animationDelay: `${(index + 3) * 0.1}s` }}
              >
                <Link href={action.href}>
                  <div className="border border-gray-800/50 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm overflow-hidden rounded-3xl">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-xl ${action.primary ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-gray-700 to-gray-600'} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                          <span className={`text-xl ${action.primary ? 'text-white' : 'text-gray-300'}`}>{action.icon}</span>
                        </div>
                        
                        {action.badge && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-light bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
                            {action.badge}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className={`font-light ${action.primary ? 'bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent' : 'text-gray-200'} group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                          {action.name}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed font-light">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Status */}
      <section className="fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
              System Status
            </h2>
            <p className="text-gray-400 mt-1 font-light">Current platform health and activity</p>
          </div>
          
          <div className="border border-gray-800/50 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-3xl">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white">🟢</span>
                  </div>
                  <div>
                    <div className="text-lg font-light text-green-400">All Systems Operational</div>
                    <div className="text-sm text-gray-400 font-light">Platform running smoothly</div>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white">🤖</span>
                  </div>
                  <div>
                    <div className="text-lg font-light text-blue-400">AI Models Active</div>
                    <div className="text-sm text-gray-400 font-light">Ready for evaluation</div>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white">⚡</span>
                  </div>
                  <div>
                    <div className="text-lg font-light text-purple-400">High Performance</div>
                    <div className="text-sm text-gray-400 font-light">Optimal response times</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
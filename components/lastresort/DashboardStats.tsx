interface Submission {
  id: string
  status: string
  score?: number
  competition_id: string
}

interface DashboardStatsProps {
  submissions: Submission[]
  totalCompetitions: number
}

export function DashboardStats({ submissions, totalCompetitions }: DashboardStatsProps) {
  const completedSubmissions = submissions.filter(s => s.status === 'completed')
  const pendingSubmissions = submissions.filter(s => s.status === 'pending')
  const averageScore = completedSubmissions.length > 0 
    ? completedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSubmissions.length
    : 0

  const stats = [
    {
      name: 'Registered Competitions',
      value: totalCompetitions,
      description: 'Total competitions you\'ve joined',
      icon: '🏆',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'from-purple-500/10 to-violet-500/10',
      iconBg: 'bg-gradient-to-r from-purple-500 to-violet-600'
    },
    {
      name: 'Total Submissions',
      value: submissions.length,
      description: 'Across all competitions',
      icon: '📝',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      iconBg: 'bg-gradient-to-r from-blue-500 to-cyan-600'
    },
    {
      name: 'Completed Submissions',
      value: completedSubmissions.length,
      description: 'Successfully evaluated by AI',
      icon: '✅',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      iconBg: 'bg-gradient-to-r from-green-500 to-emerald-600'
    },
    {
      name: 'Pending Review',
      value: pendingSubmissions.length,
      description: 'Awaiting admin approval',
      icon: '⏳',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'from-amber-500/10 to-orange-500/10',
      iconBg: 'bg-gradient-to-r from-amber-500 to-orange-600'
    },
    {
      name: 'Average Score',
      value: averageScore > 0 ? `${averageScore.toFixed(1)}%` : 'N/A',
      description: 'Across completed submissions',
      icon: '🎯',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'from-pink-500/10 to-rose-500/10',
      iconBg: 'bg-gradient-to-r from-pink-500 to-rose-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
          Your Stats Overview
        </h2>
        <p className="text-gray-400 mt-1 font-light">Track your performance across all competitions</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className="group relative overflow-hidden border border-gray-800/50 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-3xl hover:scale-105 transition-all duration-300"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-20`}></div>
            
            {/* Gradient border effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500`}></div>
            
            <div className="relative p-6 h-full flex flex-col">
              {/* Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <span className="text-xl text-white">{stat.icon}</span>
                </div>
                
                {/* Trending indicator */}
                <div className="text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              
              {/* Value */}
              <div className="flex-1 space-y-2">
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <h3 className="font-light text-gray-200 text-sm leading-tight">
                  {stat.name}
                </h3>
              </div>
              
              {/* Description */}
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
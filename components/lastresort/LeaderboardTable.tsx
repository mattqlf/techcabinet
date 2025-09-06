'use client'

import { Badge } from '@/components/ui/badge'

interface LeaderboardEntry {
  competition_id: string
  username: string
  user_id: string
  best_score: number
  total_submissions: number
  last_submission: string
}

interface Competition {
  id: string
  name: string
  is_active: boolean
  is_past: boolean
}

interface LeaderboardTableProps {
  data: LeaderboardEntry[]
  competition: Competition
  currentUserId: string
}

export function LeaderboardTable({ data, competition, currentUserId }: LeaderboardTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-16 text-center">
            <div className="mx-auto max-w-md space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
                <div className="text-4xl">📈</div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                  No submissions yet
                </h3>
                <p className="text-gray-300 font-light leading-relaxed">
                  {competition.is_active 
                    ? 'Be the first to submit a solution and claim the top spot! 🏆' 
                    : 'No participants submitted solutions for this competition.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return null
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 font-light'
    if (score >= 60) return 'text-yellow-400 font-light'
    if (score >= 40) return 'text-orange-400 font-light'
    return 'text-red-400 font-light'
  }

  return (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-20"></div>
      <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 rounded-3xl shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-xl text-white">🏆</span>
            </div>
            <div>
              <h3 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                Leaderboard
              </h3>
              <p className="text-gray-300 font-light">{data.length} participants competing</p>
            </div>
          </div>
        
          <div className="space-y-3">
            {data.map((entry, index) => {
              const rank = index + 1
              const medal = getRankMedal(rank)
              const isCurrentUser = entry.user_id === currentUserId
              
              return (
                <div 
                  key={entry.user_id}
                  className={`relative group hover-lift ${isCurrentUser ? 'ring-2 ring-purple-500/50' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${isCurrentUser ? 'from-purple-500 to-blue-500' : 'from-gray-700 to-gray-800'} rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-500`}></div>
                  
                  <div className={`relative bg-gradient-to-br ${isCurrentUser ? 'from-purple-900/50 to-blue-900/50' : 'from-gray-900/30 to-black/30'} backdrop-blur-sm rounded-xl border ${isCurrentUser ? 'border-purple-800/50' : 'border-gray-800/50'} shadow-sm hover:shadow-lg transition-all duration-300`}>
                    <div className="p-6">
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl ${rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-gray-600 to-gray-700'} flex items-center justify-center shadow-lg text-white font-light`}>
                            {medal ? medal : rank}
                          </div>
                          <span className="text-sm font-light text-gray-400">#{rank}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-light text-gray-200">
                            {entry.username}
                          </span>
                          {isCurrentUser && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 text-xs font-light">
                              You
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <span className={`text-xl ${getScoreColor(entry.best_score)}`}>
                            {entry.best_score.toFixed(1)}%
                          </span>
                          <p className="text-xs text-gray-500">Best Score</p>
                        </div>
                        
                        <div className="text-center">
                          <span className="text-lg font-light text-gray-200">
                            {entry.total_submissions}
                          </span>
                          <p className="text-xs text-gray-500">Submissions</p>
                        </div>
                        
                        <div className="text-center">
                          <span className="text-sm font-light text-gray-300">
                            {new Date(entry.last_submission).toLocaleDateString()}
                          </span>
                          <p className="text-xs text-gray-500">Last Activity</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl border border-blue-800/50 backdrop-blur-sm">
            <p className="text-sm text-blue-300 font-light">
              <strong className="text-blue-200 font-light">🎯 Scoring:</strong> Higher percentages indicate the AI got more questions wrong on your submission.
              The goal is to stump the AI with creative problems!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
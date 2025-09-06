import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'

interface Competition {
  id: string
  name: string
  short_description?: string
  start_date: string
  end_date: string
  is_active: boolean
  is_past: boolean
  num_questions: number
}

interface Submission {
  id: string
  status: string
  score?: number
  competition_id: string
}

interface CompetitionCardProps {
  competition: Competition
  isRegistered?: boolean
  userSubmissions?: Submission[]
  showRegisterButton?: boolean
}

export function CompetitionCard({ 
  competition, 
  isRegistered = false, 
  userSubmissions = [],
  showRegisterButton = false 
}: CompetitionCardProps) {
  const bestSubmission = userSubmissions
    .filter(s => s.status === 'completed')
    .sort((a, b) => (b.score || 0) - (a.score || 0))[0]
  
  const pendingSubmissions = userSubmissions.filter(s => s.status === 'pending').length
  const totalSubmissions = userSubmissions.length

  const getCompetitionStatus = () => {
    if (competition.is_past) return 'past'
    if (competition.is_active) return 'active'
    return 'upcoming'
  }

  const canSubmit = competition.is_active && isRegistered

  const statusColor = {
    active: 'from-green-500 to-emerald-500',
    past: 'from-gray-500 to-slate-500',
    upcoming: 'from-blue-500 to-violet-500'
  }[getCompetitionStatus()]

  return (
    <div className="group relative hover-lift">
      {/* Gradient border effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${statusColor} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200`}></div>
      
      <Card className="relative overflow-hidden border border-gray-800/50 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-3xl">
        {/* Status indicator stripe */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statusColor}`}></div>
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-xl font-light">
                <Link 
                  href={`/lastresort/competitions/${competition.id}`}
                  className="bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent hover:from-purple-400 hover:to-blue-400 transition-all duration-300"
                >
                  {competition.name}
                </Link>
              </CardTitle>
              {competition.short_description && (
                <CardDescription className="text-gray-400 leading-relaxed font-light">
                  {competition.short_description}
                </CardDescription>
              )}
            </div>
            <div className="ml-4">
              <StatusBadge status={getCompetitionStatus()} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow space-y-4 pb-4">
          {/* Competition info with modern icons */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3 text-sm text-gray-300">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-light">{new Date(competition.start_date).toLocaleDateString()}</div>
                <div className="text-xs text-gray-500 font-light">Start Date</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-sm text-gray-300">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-light">{new Date(competition.end_date).toLocaleDateString()}</div>
                <div className="text-xs text-gray-500 font-light">End Date</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-sm text-gray-300">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-light">{competition.num_questions} questions</div>
                <div className="text-xs text-gray-500 font-light">Total Questions</div>
              </div>
            </div>
          </div>

          {/* User progress section */}
          {isRegistered && (
            <div className="space-y-3 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-300">Your Progress</span>
                <div className="flex items-center space-x-2">
                  {totalSubmissions > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-light bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {totalSubmissions} submissions
                    </span>
                  )}
                </div>
              </div>
              
              {pendingSubmissions > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-300 font-light">Pending review</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-light bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {pendingSubmissions}
                  </span>
                </div>
              )}
              
              {bestSubmission && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-300 font-light">Best score</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-light bg-green-500/20 text-green-300 border border-green-500/30">
                    {bestSubmission.score?.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0 pb-6">
          <div className="w-full space-y-3">
            {/* Primary action button */}
            {canSubmit && (
              <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-light shadow-lg shadow-purple-500/25 hover:from-purple-600 hover:to-blue-600">
                <Link href={`/lastresort/competitions/${competition.id}/submit`}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Submit Solution
                </Link>
              </Button>
            )}
            
            {isRegistered && !canSubmit && competition.is_past && (
              <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-light shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-600">
                <Link href={`/lastresort/competitions/${competition.id}/leaderboard`}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Leaderboard
                </Link>
              </Button>
            )}

            {showRegisterButton && !isRegistered && !competition.is_past && (
              <Button asChild className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-light shadow-lg shadow-green-500/25 hover:from-green-600 hover:to-emerald-600">
                <Link href={`/lastresort/competitions/${competition.id}`}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Register Now
                </Link>
              </Button>
            )}

            {/* Secondary actions */}
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" asChild className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white font-light">
                <Link href={`/lastresort/competitions/${competition.id}`}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Details
                </Link>
              </Button>
              
              {competition.is_past && (
                <Button variant="outline" size="sm" asChild className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white font-light">
                  <Link href={`/lastresort/competitions/${competition.id}/leaderboard`}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Results
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
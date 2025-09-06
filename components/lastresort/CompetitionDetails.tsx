'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { registerForCompetition, unregisterFromCompetition } from '@/lib/lastresort/actions/competitions'

interface Competition {
  id: string
  name: string
  short_description?: string
  description?: string
  num_questions: number
  start_date: string
  end_date: string
  is_active: boolean
  is_past: boolean
  created_by?: { username: string }
}

interface Registration {
  id: string
  registered_at: string
}

interface Submission {
  id: string
  status: string
  score?: number
  admin_reason?: string
  created_at: string
  completed_at?: string
}

interface CompetitionDetailsProps {
  competition: Competition
  isRegistered: boolean
  registration?: Registration | null
  userSubmissions: Submission[]
  registrationCount: number
}

export function CompetitionDetails({
  competition,
  isRegistered,
  registration,
  userSubmissions,
  registrationCount
}: CompetitionDetailsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getCompetitionStatus = () => {
    if (competition.is_past) return 'past'
    if (competition.is_active) return 'active'
    return 'upcoming'
  }

  const canRegister = !isRegistered && !competition.is_past
  const canSubmit = competition.is_active && isRegistered
  const canUnregister = isRegistered && !competition.is_active && userSubmissions.length === 0

  const handleRegister = async () => {
    if (loading) return
    
    setLoading(true)
    setError('')
    
    try {
      await registerForCompetition(competition.id)
      window.location.reload() // Simple refresh for now
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  const handleUnregister = async () => {
    if (loading) return
    
    setLoading(true)
    setError('')
    
    try {
      await unregisterFromCompetition(competition.id)
      window.location.reload() // Simple refresh for now
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unregister')
    } finally {
      setLoading(false)
    }
  }

  const bestSubmission = userSubmissions
    .filter(s => s.status === 'completed')
    .sort((a, b) => (b.score || 0) - (a.score || 0))[0]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-extralight bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
              {competition.name}
            </h1>
            {competition.short_description && (
              <p className="mt-2 text-lg text-gray-300 font-light">
                {competition.short_description}
              </p>
            )}
          </div>
          <StatusBadge status={getCompetitionStatus()} />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-gradient-to-br from-red-900/50 to-pink-900/50 border border-red-800/50 rounded-xl backdrop-blur-sm">
          <p className="text-sm text-red-300 font-light">{error}</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Competition Info */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-light text-gray-500">Start Date</dt>
                  <dd className="text-sm text-gray-200 font-light">
                    {new Date(competition.start_date).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-light text-gray-500">End Date</dt>
                  <dd className="text-sm text-gray-200 font-light">
                    {new Date(competition.end_date).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-light text-gray-500">Questions</dt>
                  <dd className="text-sm text-gray-200 font-light">{competition.num_questions}</dd>
                </div>
                <div>
                  <dt className="text-sm font-light text-gray-500">Participants</dt>
                  <dd className="text-sm text-gray-200 font-light">{registrationCount}</dd>
                </div>
              </div>

              {competition.created_by && (
                <div>
                  <dt className="text-sm font-light text-gray-500">Created by</dt>
                  <dd className="text-sm text-gray-200 font-light">{competition.created_by.username}</dd>
                </div>
              )}

              {competition.description && (
                <div>
                  <dt className="text-sm font-light text-gray-500">Description</dt>
                  <dd className="text-sm text-gray-200 font-light whitespace-pre-wrap">
                    {competition.description}
                  </dd>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Submissions */}
          {isRegistered && userSubmissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Submissions</CardTitle>
                <CardDescription>
                  Track your submission history and scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-4 border border-gray-800/50 bg-gradient-to-br from-gray-900/30 to-black/30 rounded-xl backdrop-blur-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={submission.status} />
                          {submission.score !== null && submission.score !== undefined && (
                            <span className="text-sm font-light text-green-400">
                              Score: {submission.score.toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Submitted {new Date(submission.created_at).toLocaleString()}
                        </p>
                        {submission.admin_reason && (
                          <p className="text-xs text-gray-400">
                            Admin note: {submission.admin_reason}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/lastresort/submissions/${submission.id}`}
                        className="text-sm text-purple-400 hover:text-purple-300 font-light"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>

                {bestSubmission && (
                  <div className="mt-6 p-4 bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-800/50 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-light text-green-300">
                          Your Best Score
                        </h4>
                        <p className="text-2xl font-light text-green-200">
                          {bestSubmission.score?.toFixed(1)}%
                        </p>
                      </div>
                      <Link
                        href={`/lastresort/competitions/${competition.id}/leaderboard`}
                        className="text-sm text-green-400 hover:text-green-300 underline font-light"
                      >
                        View Leaderboard
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canRegister && (
                <Button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Registering...' : 'Register for Competition'}
                </Button>
              )}

              {canSubmit && (
                <Button asChild className="w-full">
                  <Link href={`/lastresort/competitions/${competition.id}/submit`}>
                    Submit Solution
                  </Link>
                </Button>
              )}

              {canUnregister && (
                <Button
                  variant="outline"
                  onClick={handleUnregister}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Unregistering...' : 'Unregister'}
                </Button>
              )}

              {competition.is_past && (
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/lastresort/competitions/${competition.id}/leaderboard`}>
                    View Results
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Registration Info */}
          {registration && (
            <Card>
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 font-light">
                  Registered on{' '}
                  {new Date(registration.registered_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Competition Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Participants:</span>
                <span className="font-light text-gray-200">{registrationCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Your Submissions:</span>
                <span className="font-light text-gray-200">{userSubmissions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Questions:</span>
                <span className="font-light text-gray-200">{competition.num_questions}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
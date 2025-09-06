'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { reviewSubmission } from '@/lib/lastresort/actions/submissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from './StatusBadge'
import Link from 'next/link'

interface AdminReviewCardProps {
  submission: {
    id: string
    status: string
    created_at: string
    admin_reason?: string
    score?: number
    error_message?: string
    competition: {
      id: string
      name: string
    }
    user_profile: {
      id: string
      username: string
    }
    problems: Array<{
      id: string
      question_number: number
      problem_text: string
      user_solution: string
      user_answer: string
    }>
  }
}

export function AdminReviewCard({ submission }: AdminReviewCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [adminReason, setAdminReason] = useState(submission.admin_reason || '')

  const handleReview = async (status: 'accepted' | 'rejected') => {
    if (status === 'rejected' && !adminReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setIsLoading(true)
    try {
      await reviewSubmission(submission.id, {
        status,
        admin_reason: adminReason.trim() || undefined
      })
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to review submission')
    } finally {
      setIsLoading(false)
    }
  }

  const isPending = submission.status === 'pending'
  const isCompleted = submission.status === 'completed'

  return (
    <Card className="w-full bg-gradient-to-br from-gray-900/50 to-black/50 border-gray-800/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {submission.user_profile.username}&rsquo;s Submission
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Competition: {submission.competition.name}</span>
              <span>•</span>
              <span>{new Date(submission.created_at).toLocaleString()}</span>
              <span>•</span>
              <span>{submission.problems.length} problems</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={submission.status} />
            {isCompleted && submission.score !== undefined && (
              <Badge variant="secondary">
                Score: {submission.score.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Show error message if exists */}
        {submission.error_message && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-red-300 text-sm font-light">Error:</p>
            <p className="text-red-400 text-sm">{submission.error_message}</p>
          </div>
        )}

        {/* Show admin reason if exists */}
        {submission.admin_reason && (
          <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-blue-300 text-sm font-light">Admin Note:</p>
            <p className="text-blue-400 text-sm">{submission.admin_reason}</p>
          </div>
        )}

        {/* Problems preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-light text-gray-200">Problems Preview</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>

          {showDetails ? (
            <div className="space-y-4">
              {submission.problems
                .sort((a, b) => a.question_number - b.question_number)
                .map((problem) => (
                  <div key={problem.id} className="border border-gray-700/50 bg-gray-800/30 rounded-lg p-4 backdrop-blur-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Question {problem.question_number}</Badge>
                      </div>
                      
                      <div>
                        <h5 className="font-light text-sm text-gray-200 mb-1">Problem:</h5>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {problem.problem_text}
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="font-light text-sm text-gray-200 mb-1">User&rsquo;s Solution:</h5>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {problem.user_solution}
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="font-light text-sm text-gray-200 mb-1">Expected Answer:</h5>
                        <p className="text-sm text-gray-300 font-mono bg-gray-800/50 px-2 py-1 rounded">
                          {problem.user_answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              {submission.problems.slice(0, 2).map((problem) => (
                <div key={problem.id} className="mb-2">
                  <span className="font-light">Q{problem.question_number}:</span>{' '}
                  {problem.problem_text.slice(0, 100)}
                  {problem.problem_text.length > 100 && '...'}
                </div>
              ))}
              {submission.problems.length > 2 && (
                <p className="text-gray-500">
                  And {submission.problems.length - 2} more problems...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Admin actions for pending submissions */}
        {isPending && (
          <div className="border-t pt-4 space-y-3">
            <div>
              <label className="block text-sm font-light text-gray-300 mb-2">
                Admin Reason (required for rejection, optional for acceptance)
              </label>
              <Textarea
                value={adminReason}
                onChange={(e) => setAdminReason(e.target.value)}
                placeholder="Provide feedback or reason for your decision..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => handleReview('accepted')}
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? 'Processing...' : 'Accept & Start AI Evaluation'}
              </Button>
              <Button
                onClick={() => handleReview('rejected')}
                disabled={isLoading}
                variant="destructive"
              >
                {isLoading ? 'Processing...' : 'Reject Submission'}
              </Button>
            </div>
          </div>
        )}

        {/* View full submission link */}
        <div className="border-t pt-4">
          <Link
            href={`/lastresort/submissions/${submission.id}`}
            className="inline-flex items-center text-sm font-light bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-blue-300 transition-all duration-200"
          >
            View Full Submission Details →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
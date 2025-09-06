import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/lastresort/StatusBadge'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: submission } = await supabase
    .from('submissions')
    .select(`
      *,
      competition:competitions(name)
    `)
    .eq('id', id)
    .single()

  return {
    title: 'submission',
    description: 'View submission details and results',
  }
}

export default async function SubmissionDetailsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get submission with competition and problems
  const { data: submission } = await supabase
    .from('submissions')
    .select(`
      *,
      competition:competitions(
        id,
        name,
        description,
        num_questions
      ),
      problems:problems(
        id,
        question_number,
        problem_text,
        user_solution,
        user_answer,
        ai_evaluations(
          ai_solution,
          ai_answer,
          is_correct,
          evaluated_at
        )
      )
    `)
    .eq('id', id)
    .single()

  if (!submission) {
    notFound()
  }

  // Check ownership (users can only view their own submissions unless admin)
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const canView = submission.user_id === user.id || profile?.is_admin

  if (!canView) {
    notFound()
  }

  // Sort problems by question number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortedProblems = submission.problems?.sort((a: any, b: any) => a.question_number - b.question_number) || []

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
      case 'pending': return 'from-amber-50 to-orange-50'
      case 'reviewing': return 'from-blue-50 to-cyan-50'
      case 'completed': return 'from-green-50 to-emerald-50'
      case 'rejected': return 'from-red-50 to-pink-50'
      default: return 'from-gray-50 to-slate-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'reviewing': return '🔄'
      case 'completed': return '✅'
      case 'rejected': return '❌'
      default: return '📝'
    }
  }

  return (
    <div className="space-y-10">
      {/* Breadcrumb and Header */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <Link 
              href="/lastresort/submissions"
              className="inline-flex items-center text-violet-600 hover:text-violet-500 font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Submissions
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="text-4xl">{getStatusIcon(submission.status)}</div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Submission Details
                </h1>
                <p className="text-xl text-gray-600 mt-1">
                  {submission.competition.name} 🎯
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Overview */}
      <section className="fade-in">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Submission Overview
            </h2>
            <p className="text-gray-600 mt-1">Your submission status and results</p>
          </div>
          
          <div className={`relative card-modern border-0 bg-gradient-to-br ${getStatusBg(submission.status)} backdrop-blur-sm overflow-hidden`}>
            {/* Status stripe */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getStatusGradient(submission.status)}`}></div>
            
            <div className="p-8">
              {/* Header with status */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${getStatusGradient(submission.status)} flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl text-white">{getStatusIcon(submission.status)}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {submission.competition.name}
                    </h3>
                    <p className="text-gray-600">
                      Submitted on {new Date(submission.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <StatusBadge status={submission.status} />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                  <div className="text-sm font-medium text-gray-600 mb-2">Status</div>
                  <div className={`text-xl font-bold bg-gradient-to-r ${getStatusGradient(submission.status)} bg-clip-text text-transparent capitalize`}>
                    {submission.status}
                  </div>
                </div>
                
                {submission.score !== null && (
                  <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                    <div className="text-sm font-medium text-gray-600 mb-2">Final Score</div>
                    <div className={`text-3xl font-bold bg-gradient-to-r ${getStatusGradient(submission.status)} bg-clip-text text-transparent`}>
                      {submission.score}%
                    </div>
                  </div>
                )}

                <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                  <div className="text-sm font-medium text-gray-600 mb-2">Problems</div>
                  <div className={`text-xl font-bold bg-gradient-to-r ${getStatusGradient(submission.status)} bg-clip-text text-transparent`}>
                    {sortedProblems.length}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(submission.admin_reason || submission.completed_at) && (
                <div className="mt-6 pt-6 border-t border-gray-200/50 space-y-4">
                  {submission.admin_reason && (
                    <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-sm text-white">👨‍💼</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 mb-1">Admin Note</div>
                          <div className="text-gray-700 leading-relaxed">
                            {submission.admin_reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {submission.completed_at && (
                    <div className="text-center text-sm text-gray-600">
                      <span className="font-medium">Completed:</span> {new Date(submission.completed_at).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Download Button */}
      {submission.status === 'completed' && (
        <section className="fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-center">
            <Link
              href={`/lastresort/submissions/${submission.id}/download`}
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4-10v2a4 4 0 00-4 4H4a4 4 0 004-4h2V6z" />
              </svg>
              Download Results (JSON)
            </Link>
          </div>
        </section>
      )}

      {/* Problems and Evaluations */}
      <section className="fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Problems & Solutions ({sortedProblems.length})
            </h2>
            <p className="text-gray-600 mt-1">Your submitted problems and AI evaluation results</p>
          </div>

          <div className="space-y-8">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {sortedProblems.map((problem: any, index: number) => {
              const evaluation = problem.ai_evaluations?.[0]
              const wasSuccessful = evaluation && !evaluation.is_correct
              
              return (
                <div 
                  key={problem.id} 
                  className="group relative hover-lift"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient border effect */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${wasSuccessful ? 'from-green-500 to-emerald-500' : 'from-blue-500 to-violet-500'} rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500`}></div>
                  
                  <div className="relative card-modern border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                    {/* Question header */}
                    <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${wasSuccessful ? 'from-green-500 to-emerald-500' : 'from-blue-500 to-violet-500'} flex items-center justify-center shadow-lg`}>
                            <span className="text-white font-bold">{problem.question_number}</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Question {problem.question_number}
                          </h3>
                        </div>
                        
                        {evaluation && (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            evaluation.is_correct 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {evaluation.is_correct ? 'AI Solved (0 pts)' : 'AI Failed (1 pt)'}
                            {evaluation.is_correct ? ' 😞' : ' 🎉'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {/* Problem Statement */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-white">❓</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">Problem Statement</h4>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200/50">
                          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                            {problem.problem_text}
                          </p>
                        </div>
                      </div>

                      {/* Your Solution */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-white">💡</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">Your Solution</h4>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200/50">
                          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                            {problem.user_solution}
                          </p>
                        </div>
                      </div>

                      {/* Your Answer */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-white">✓</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">Your Answer</h4>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200/50">
                          <p className="text-gray-900 font-medium">
                            {problem.user_answer}
                          </p>
                        </div>
                      </div>

                      {/* AI Evaluation Results */}
                      {evaluation && (
                        <div className="pt-6 border-t border-gray-200/50">
                          <div className="space-y-6">
                            {/* AI Solution */}
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-white">🤖</span>
                                </div>
                                <h4 className="font-semibold text-gray-900">AI Solution</h4>
                              </div>
                              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200/50">
                                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                                  {evaluation.ai_solution}
                                </p>
                              </div>
                            </div>

                            {/* AI Answer */}
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-white">⚡</span>
                                </div>
                                <h4 className="font-semibold text-gray-900">AI Answer</h4>
                              </div>
                              <div className="p-4 bg-red-50 rounded-xl border border-red-200/50">
                                <p className="text-gray-900 font-medium">
                                  {evaluation.ai_answer}
                                </p>
                              </div>
                            </div>

                            {/* Result Summary */}
                            <div className={`p-4 rounded-xl border-2 ${
                              evaluation.is_correct 
                                ? 'bg-red-50 border-red-200 text-red-900' 
                                : 'bg-green-50 border-green-200 text-green-900'
                            }`}>
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  evaluation.is_correct 
                                    ? 'bg-red-200' 
                                    : 'bg-green-200'
                                }`}>
                                  <span className="text-lg">
                                    {evaluation.is_correct ? '😞' : '🎉'}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-bold text-lg">
                                    {evaluation.is_correct ? 'AI Solved Your Problem' : 'Success! AI Failed'}
                                  </div>
                                  <div className="text-sm">
                                    {evaluation.is_correct 
                                      ? 'The AI managed to solve your problem correctly. No points awarded.' 
                                      : 'Congratulations! Your problem stumped the AI. You earned 1 point!'
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
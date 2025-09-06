'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SubmissionFormData, SubmissionReviewData } from '../types'

export async function createSubmission(formData: SubmissionFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  if (formData.user_id !== user.id) {
    throw new Error('Invalid user ID')
  }

  // Check if user can submit using the database function
  const { data: canSubmit } = await supabase
    .rpc('can_submit_to_competition', {
      competition_id_param: formData.competition_id,
      user_id_param: user.id
    })
  
  if (!canSubmit) {
    throw new Error('Cannot submit to this competition')
  }

  // Create submission
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .insert({
      competition_id: formData.competition_id,
      user_id: user.id,
      status: 'pending'
    })
    .select()
    .single()
  
  if (submissionError) {
    throw new Error(`Failed to create submission: ${submissionError.message}`)
  }

  // Create problems
  const problemsData = formData.problems.map(problem => ({
    ...problem,
    submission_id: submission.id
  }))

  const { error: problemsError } = await supabase
    .from('problems')
    .insert(problemsData)
  
  if (problemsError) {
    // Rollback submission if problems creation fails
    await supabase.from('submissions').delete().eq('id', submission.id)
    throw new Error(`Failed to create problems: ${problemsError.message}`)
  }
  
  revalidatePath('/lastresort/dashboard')
  revalidatePath('/lastresort/submissions')
  revalidatePath('/lastresort/admin/review')
  
  return { data: submission, error: null }
}

export async function reviewSubmission(submissionId: string, reviewData: SubmissionReviewData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!profile?.is_admin) {
    throw new Error('Admin access required')
  }

  const { data, error } = await supabase
    .from('submissions')
    .update({
      status: reviewData.status,
      admin_reason: reviewData.admin_reason,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', submissionId)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to review submission: ${error.message}`)
  }

  // If accepted, trigger AI evaluation
  if (reviewData.status === 'accepted') {
    try {
      await triggerAIEvaluation(submissionId)
    } catch (evaluationError) {
      console.error('AI evaluation failed:', evaluationError)
      // Update submission status to error
      await supabase
        .from('submissions')
        .update({
          status: 'error',
          error_message: 'AI evaluation failed'
        })
        .eq('id', submissionId)
    }
  }
  
  revalidatePath('/lastresort/admin/review')
  revalidatePath(`/lastresort/submissions/${submissionId}`)
  
  return { data, error: null }
}

async function triggerAIEvaluation(submissionId: string) {
  const supabase = await createClient()
  
  // Get submission with problems
  const { data: submission, error } = await supabase
    .from('submissions')
    .select(`
      *,
      problems(*)
    `)
    .eq('id', submissionId)
    .single()
  
  if (error || !submission) {
    throw new Error('Submission not found')
  }

  // Process each problem with AI
  const evaluationResults = await Promise.allSettled(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submission.problems.map(async (problem: any) => {
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          const evaluation = await evaluateProblemWithAI(problem)
          
          // Save evaluation to database
          await supabase
            .from('ai_evaluations')
            .insert({
              problem_id: problem.id,
              ai_solution: evaluation.solution,
              ai_answer: evaluation.answer,
              is_correct: evaluation.is_correct
            })
          
          return evaluation
        } catch (error) {
          retryCount++
          if (retryCount >= maxRetries) {
            throw error
          }
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
        }
      }
    })
  )

  // Calculate score
  const completedEvaluations = evaluationResults.filter(result => result.status === 'fulfilled')
  const correctAnswers = completedEvaluations.reduce((count, result) => {
    return count + (result.status === 'fulfilled' && result.value.is_correct ? 1 : 0)
  }, 0)
  
  const score = 100 - (correctAnswers * 100 / submission.problems.length)
  
  // Update submission with final score
  await supabase
    .from('submissions')
    .update({
      status: 'completed',
      score: score,
      completed_at: new Date().toISOString()
    })
    .eq('id', submissionId)

  // Refresh leaderboard materialized view
  await supabase.rpc('refresh_leaderboard')
}

async function evaluateProblemWithAI(problem: { id: string; problem_text: string; user_solution: string; user_answer: string }) {
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant tasked with solving problems. Provide your solution and final answer clearly.'
        },
        {
          role: 'user',
          content: `Problem: ${problem.problem_text}\n\nPlease provide:\n1. Your solution approach\n2. Your final answer`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  const aiResponse = data.choices[0].message.content

  // Parse AI response to extract solution and answer
  // This is a simple parsing - could be enhanced with structured outputs
  const lines = aiResponse.split('\n')
  let solution = ''
  let answer = ''
  let inAnswer = false
  
  for (const line of lines) {
    if (line.toLowerCase().includes('answer') && line.includes(':')) {
      inAnswer = true
      answer = line.split(':')[1]?.trim() || ''
    } else if (!inAnswer) {
      solution += line + ' '
    }
  }

  // If no clear answer found, use the last line
  if (!answer) {
    answer = lines[lines.length - 1]?.trim() || ''
  }

  // Compare AI answer with correct answer
  const isCorrect = compareAnswers(answer, problem.user_answer)

  return {
    solution: solution.trim(),
    answer: answer,
    is_correct: isCorrect
  }
}

function compareAnswers(aiAnswer: string, correctAnswer: string): boolean {
  // Normalize both answers for comparison
  const normalize = (str: string) => str.toLowerCase().trim().replace(/[^\w\s]/g, '')
  
  const normalizedAI = normalize(aiAnswer)
  const normalizedCorrect = normalize(correctAnswer)
  
  // Exact match
  if (normalizedAI === normalizedCorrect) return true
  
  // Check if AI answer contains correct answer or vice versa
  if (normalizedAI.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedAI)) {
    return true
  }
  
  // For numeric answers, try parsing and comparing
  const aiNum = parseFloat(aiAnswer)
  const correctNum = parseFloat(correctAnswer)
  
  if (!isNaN(aiNum) && !isNaN(correctNum)) {
    return Math.abs(aiNum - correctNum) < 0.001
  }
  
  return false
}

export async function deleteSubmission(submissionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check if user owns this submission or is admin
  const { data: submission } = await supabase
    .from('submissions')
    .select('user_id')
    .eq('id', submissionId)
    .single()
  
  if (!submission) {
    throw new Error('Submission not found')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (submission.user_id !== user.id && !profile?.is_admin) {
    throw new Error('Access denied')
  }

  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', submissionId)
  
  if (error) {
    throw new Error(`Failed to delete submission: ${error.message}`)
  }
  
  revalidatePath('/lastresort/submissions')
  revalidatePath('/lastresort/admin/review')
  
  return { error: null }
}
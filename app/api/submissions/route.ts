import { NextRequest, NextResponse } from 'next/server'
import { createSubmission } from '@/lib/lastresort/actions/submissions'
import type { SubmissionFormData } from '@/lib/lastresort/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SubmissionFormData
    
    // Validate request body
    if (!body.competition_id || !body.user_id || !body.problems) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.problems) || body.problems.length === 0) {
      return NextResponse.json(
        { error: 'Problems array is required and cannot be empty' },
        { status: 400 }
      )
    }

    // Validate each problem
    for (const problem of body.problems) {
      if (!problem.problem_text || !problem.user_solution || !problem.user_answer) {
        return NextResponse.json(
          { error: 'Each problem must have problem_text, user_solution, and user_answer' },
          { status: 400 }
        )
      }
      
      if (typeof problem.question_number !== 'number' || problem.question_number < 1) {
        return NextResponse.json(
          { error: 'Invalid question_number' },
          { status: 400 }
        )
      }
    }

    const result = await createSubmission(body)
    
    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error('Submission API error:', error)
    
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('Unauthorized') ? 401 :
                  message.includes('Cannot submit') ? 403 : 500
    
    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}
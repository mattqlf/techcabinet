import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface SubmissionDownload {
  submission: {
    id: string
    competition_name: string
    username: string
    score: number | null
    status: string
    admin_reason: string | null
    submitted_at: string
    reviewed_at: string | null
    completed_at: string | null
  }
  problems: Array<{
    question_number: number
    problem_text: string
    user_solution: string
    user_answer: string
    ai_evaluation: {
      ai_solution: string | null
      ai_answer: string | null
      is_correct: boolean | null
      evaluated_at: string | null
    } | null
  }>
  competition_details: {
    name: string
    description: string
    start_date: string
    end_date: string
    num_questions: number
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get submission with all related data
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        *,
        competition:competitions(
          name,
          description,
          start_date,
          end_date,
          num_questions
        ),
        user:profiles!submissions_user_id_fkey(username),
        problems:problems(
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

    if (submissionError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Check ownership (users can only download their own submissions unless admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const canDownload = submission.user_id === user.id || profile?.is_admin

    if (!canDownload) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only allow download of completed submissions
    if (submission.status !== 'completed') {
      return NextResponse.json({ 
        error: 'Submission must be completed before download' 
      }, { status: 400 })
    }

    // Build download data structure
    const downloadData: SubmissionDownload = {
      submission: {
        id: submission.id,
        competition_name: submission.competition.name,
        username: submission.user.username,
        score: submission.score,
        status: submission.status,
        admin_reason: submission.admin_reason,
        submitted_at: submission.created_at,
        reviewed_at: submission.reviewed_at,
        completed_at: submission.completed_at
      },
      problems: submission.problems
        .sort((a: { question_number: number }, b: { question_number: number }) => a.question_number - b.question_number)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((problem: any) => ({
          question_number: problem.question_number,
          problem_text: problem.problem_text,
          user_solution: problem.user_solution,
          user_answer: problem.user_answer,
          ai_evaluation: problem.ai_evaluations?.[0] ? {
            ai_solution: problem.ai_evaluations[0].ai_solution,
            ai_answer: problem.ai_evaluations[0].ai_answer,
            is_correct: problem.ai_evaluations[0].is_correct,
            evaluated_at: problem.ai_evaluations[0].evaluated_at
          } : null
        })),
      competition_details: {
        name: submission.competition.name,
        description: submission.competition.description,
        start_date: submission.competition.start_date,
        end_date: submission.competition.end_date,
        num_questions: submission.competition.num_questions
      }
    }

    // Set headers for file download
    const filename = `submission_${submission.id}_${submission.user.username}.json`
    
    return new NextResponse(JSON.stringify(downloadData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
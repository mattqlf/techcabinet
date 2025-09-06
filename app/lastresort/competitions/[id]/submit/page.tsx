import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { SubmissionForm } from '@/components/lastresort/SubmissionForm'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: competition } = await supabase
    .from('competitions')
    .select('name')
    .eq('id', id)
    .single()

  return {
    title: 'submit',
    description: 'Submit your AI challenge solutions',
  }
}

export default async function SubmitPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get competition details using the view
  const { data: competition } = await supabase
    .from('competitions_with_status')
    .select('*')
    .eq('id', id)
    .single()

  if (!competition) {
    notFound()
  }

  // Check if user is registered and can submit
  const { data: registration } = await supabase
    .from('competition_registrations')
    .select('id')
    .eq('competition_id', id)
    .eq('user_id', user.id)
    .single()

  if (!registration) {
    redirect(`/lastresort/competitions/${id}`)
  }

  // Check if competition allows submissions (active + grace period)
  const now = new Date()
  const endWithGrace = new Date(competition.end_date)
  endWithGrace.setDate(endWithGrace.getDate() + 1)
  
  const canSubmit = now >= new Date(competition.start_date) && now <= endWithGrace

  if (!canSubmit) {
    redirect(`/lastresort/competitions/${id}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extralight bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
          Submit to {competition.name}
        </h1>
        <p className="mt-2 text-gray-300 font-light">
          Create your AI challenge submission with {competition.num_questions} question{competition.num_questions > 1 ? 's' : ''}
        </p>
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-3xl">
          <p className="text-sm text-yellow-300 font-light">
            <strong className="font-normal">Remember:</strong> Your goal is to create problems that the AI will get wrong. 
            Higher scores mean the AI failed more often on your problems!
          </p>
        </div>
      </div>

      <SubmissionForm 
        competition={competition}
        userId={user.id}
      />
    </div>
  )
}
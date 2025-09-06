import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { CompetitionForm } from '@/components/lastresort/CompetitionForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: competition } = await supabase
    .from('competitions')
    .select('name')
    .eq('id', id)
    .single()

  return {
    title: 'edit competition',
    description: 'Edit competition details'
  }
}

export default async function EditCompetitionPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/lastresort/dashboard')
  }

  // Get competition details
  const { data: competition, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !competition) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extralight bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">Edit Competition</h1>
        <p className="mt-2 text-gray-300 font-light">
          Update competition details for: <span className="font-light">{competition.name}</span>
        </p>
      </div>

      <CompetitionForm competition={competition} mode="edit" />
    </div>
  )
}
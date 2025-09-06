import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CompetitionForm } from '@/components/lastresort/CompetitionForm'

export const metadata = {
  title: 'create competition',
  description: 'Create a new competition'
}

export default async function CreateCompetitionPage() {
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extralight bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">Create Competition</h1>
        <p className="mt-2 text-gray-300 font-light">
          Set up a new competition for users to participate in
        </p>
      </div>

      <CompetitionForm />
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/lastresort/Navigation'
import { StarfieldBackground } from '@/components/lastresort/StarfieldBackground'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'lastresort',
  description: 'Challenge AI models with creative problem-solving tasks'
}

export default async function LastResortLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile for navigation
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_admin')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      <StarfieldBackground />
      
      <Navigation user={user} profile={profile} />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
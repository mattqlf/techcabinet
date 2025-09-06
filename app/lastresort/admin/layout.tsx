import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminNavigation } from '@/components/lastresort/AdminNavigation'
import { StarfieldBackground } from '@/components/lastresort/StarfieldBackground'

export const metadata = {
  title: 'admin',
  description: 'Administrative interface for managing competitions'
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, username')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/lastresort/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      <StarfieldBackground />
      <div className="flex relative z-10">
        <AdminNavigation />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
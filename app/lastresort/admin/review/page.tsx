import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminReviewCard } from '@/components/lastresort/AdminReviewCard'
import { ReviewFilters } from '@/components/lastresort/ReviewFilters'

export const metadata = {
  title: 'review',
  description: 'Review pending submissions'
}

interface SearchParams {
  competition?: string
  status?: string
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function ReviewSubmissionsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, username')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/lastresort/dashboard')
  }

  const params = await searchParams
  const competitionFilter = params.competition
  const statusFilter = params.status || 'pending'

  // Build query for submissions
  let query = supabase
    .from('submissions')
    .select(`
      *,
      competition:competitions(id, name),
      user_profile:profiles!user_id(id, username),
      problems(
        id,
        question_number,
        problem_text,
        user_solution,
        user_answer
      )
    `)
    .eq('status', statusFilter)
    .order('created_at', { ascending: false })

  if (competitionFilter) {
    query = query.eq('competition_id', competitionFilter)
  }

  const { data: submissions, error } = await query

  if (error) {
    console.error('Error fetching submissions:', error)
  }

  // Get all submissions for stats (not just filtered ones)
  const { data: allSubmissions } = await supabase
    .from('submissions')
    .select('status')

  // Get competitions for filter dropdown
  const { data: competitions } = await supabase
    .from('competitions')
    .select('id, name')
    .order('created_at', { ascending: false })

  const statusOptions = [
    { value: 'pending', label: 'Pending Review', icon: '⏳', color: 'from-amber-500 to-orange-500', bg: 'from-gray-900/50 to-black/50' },
    { value: 'accepted', label: 'Accepted', icon: '✅', color: 'from-green-500 to-emerald-500', bg: 'from-gray-900/50 to-black/50' },
    { value: 'rejected', label: 'Rejected', icon: '❌', color: 'from-red-500 to-pink-500', bg: 'from-gray-900/50 to-black/50' },
    { value: 'completed', label: 'Completed', icon: '🎉', color: 'from-blue-500 to-cyan-500', bg: 'from-gray-900/50 to-black/50' },
    { value: 'error', label: 'Error', icon: '⚠️', color: 'from-gray-500 to-slate-500', bg: 'from-gray-900/50 to-black/50' }
  ]

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">👀</div>
              <div>
                <h1 className="text-4xl font-extralight bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                  Review Submissions
                </h1>
                <p className="text-xl text-gray-300 font-light mt-1">
                  Good {getTimeOfDay()}, {profile?.username}! Review and approve submissions 🔍
                </p>
              </div>
            </div>
          </div>

          {/* Alert for pending submissions */}
          {statusFilter === 'pending' && submissions && submissions.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-amber-900/50 to-orange-900/50 border border-amber-800/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-white">⚠️</span>
                </div>
                <div>
                  <p className="text-amber-300 font-light">
                    {submissions.length} submission{submissions.length === 1 ? '' : 's'} awaiting review
                  </p>
                  <p className="text-amber-400 text-sm font-light">
                    Users are waiting for approval to participate in competitions
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <section className="fade-in">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
              Filter Submissions
            </h2>
            <p className="text-gray-300 font-light mt-1">Find specific submissions to review</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 rounded-3xl shadow-lg">
            <div className="p-6">
              <ReviewFilters 
                statusOptions={statusOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                competitions={competitions || []}
                currentStatus={statusFilter}
                currentCompetition={competitionFilter}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
              Submission Statistics
            </h2>
            <p className="text-gray-300 font-light mt-1">Current status breakdown across all submissions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {statusOptions.map((option, index) => {
              const count = allSubmissions?.filter(s => s.status === option.value).length || 0
              const isCurrentFilter = statusFilter === option.value
              
              return (
                <div
                  key={option.value}
                  className={`group relative hover-lift ${isCurrentFilter ? 'ring-2 ring-violet-500' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient border effect */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${option.color} rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500 ${isCurrentFilter ? 'opacity-40' : ''}`}></div>
                  
                  <div className={`relative card-modern border-0 bg-gradient-to-br ${option.bg} backdrop-blur-sm overflow-hidden`}>
                    {/* Current filter indicator */}
                    {isCurrentFilter && (
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${option.color}`}></div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                          <span className="text-xl text-white">{option.icon}</span>
                        </div>
                        
                        {isCurrentFilter && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800">
                            Current
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className={`text-3xl font-light bg-gradient-to-r ${option.color} bg-clip-text text-transparent`}>
                          {count}
                        </div>
                        <h3 className="font-light text-gray-200 text-sm">
                          {option.label}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Submissions List */}
      <section className="fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                {statusOptions.find(opt => opt.value === statusFilter)?.label || 'Submissions'} 
                {submissions ? ` (${submissions.length})` : ''}
              </h2>
              <p className="text-gray-300 font-light mt-1">
                {submissions && submissions.length > 0 ? 'Review and take action on these submissions' : 'No submissions match your current filters'}
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            {!submissions || submissions.length === 0 ? (
              <div className="relative">
                <div className="text-center py-16 px-8">
                  <div className="mx-auto max-w-md space-y-6">
                    {/* Status-specific illustration */}
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-gray-100 to-slate-100 rounded-full flex items-center justify-center mb-6">
                      <div className="text-4xl animate-pulse">
                        {statusOptions.find(opt => opt.value === statusFilter)?.icon || '📝'}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                        No {statusOptions.find(opt => opt.value === statusFilter)?.label || 'Submissions'}
                      </h3>
                      <p className="text-gray-300 font-light leading-relaxed">
                        {statusFilter === 'pending' 
                          ? "Great news! No submissions are waiting for your review right now."
                          : `No submissions found with status "${statusOptions.find(opt => opt.value === statusFilter)?.label}".`
                        }
                      </p>
                    </div>
                    
                    {statusFilter === 'pending' && (
                      <div className="pt-4">
                        <p className="text-sm text-gray-500">
                          Check back later or try different filters to find submissions to review.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              submissions.map((submission, index) => (
                <div
                  key={submission.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="slide-in-left"
                >
                  <AdminReviewCard submission={submission} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
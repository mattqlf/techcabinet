import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'users',
  description: 'View and manage platform users'
}

export default async function AdminUsersPage() {
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

  // Get all users with their basic info
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (usersError) {
    console.error('Users query error:', usersError)
  }
  
  console.log('Users data:', users?.length, users)

  // Get activity stats for all users in batch queries
  const userIds = users?.map(u => u.id) || []
  let submissionStats = []
  let allSubmissions = []
  let allRegistrations = []
  
  if (userIds.length > 0) {
    try {
      // Get total submissions per user
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('user_id, status')
        .in('user_id', userIds)
      
      if (submissionsError) {
        console.error('Submissions query error:', submissionsError)
      } else {
        allSubmissions = submissions || []
      }
      
      // Get total registrations per user
      const { data: registrations, error: registrationsError } = await supabase
        .from('competition_registrations')
        .select('user_id')
        .in('user_id', userIds)
      
      if (registrationsError) {
        console.error('Registrations query error:', registrationsError)
      } else {
        allRegistrations = registrations || []
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
    
    // Process stats
    submissionStats = userIds.map(userId => {
      const userSubmissions = allSubmissions.filter(s => s.user_id === userId)
      const pending = userSubmissions.filter(s => s.status === 'pending').length
      const completed = userSubmissions.filter(s => s.status === 'completed').length
      const total = userSubmissions.length
      const registrations = allRegistrations.filter(r => r.user_id === userId).length
      
      return {
        userId,
        pending,
        completed,
        total,
        registrations
      }
    })
  }

  const statsMap = new Map(submissionStats.map(s => [s.userId, s]))

  const totalUsers = users?.length || 0
  const adminUsers = users?.filter(u => u.is_admin).length || 0
  const activeUsers = users?.filter(u => {
    const stats = statsMap.get(u.id)
    return (stats?.pending || 0) + (stats?.completed || 0) > 0
  }).length || 0
  const totalPending = submissionStats.length > 0 ? submissionStats.reduce((sum, s) => sum + s.pending, 0) : 0
  const totalCompleted = submissionStats.length > 0 ? submissionStats.reduce((sum, s) => sum + s.completed, 0) : 0

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }

  const getUserRoleColor = (isAdmin: boolean) => {
    return isAdmin ? 'from-red-500 to-pink-500' : 'from-blue-500 to-cyan-500'
  }

  const getUserRoleBg = (isAdmin: boolean) => {
    return isAdmin ? 'from-gray-900/50 to-black/50' : 'from-gray-900/50 to-black/50'
  }

  const getUserRoleIcon = (isAdmin: boolean) => {
    return isAdmin ? '👑' : '👤'
  }

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">👥</div>
              <div>
                <h1 className="text-4xl font-extralight bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                  Manage Users
                </h1>
                <p className="text-xl text-gray-300 font-light mt-1">
                  Good {getTimeOfDay()}, {profile?.username}! Monitor user activity 📊
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <section className="fade-in">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
              User Statistics
            </h2>
            <p className="text-gray-300 font-light mt-1">Platform user metrics and activity overview</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { 
                label: 'Total Users', 
                value: totalUsers, 
                icon: '👥', 
                color: 'from-purple-500 to-violet-500', 
                bg: 'from-gray-900/50 to-black/50',
                description: 'Registered users'
              },
              { 
                label: 'Administrators', 
                value: adminUsers, 
                icon: '👑', 
                color: 'from-red-500 to-pink-500', 
                bg: 'from-gray-900/50 to-black/50',
                description: 'Admin accounts'
              },
              { 
                label: 'Active Users', 
                value: activeUsers, 
                icon: '🔥', 
                color: 'from-green-500 to-emerald-500', 
                bg: 'from-gray-900/50 to-black/50',
                description: 'Users with submissions'
              },
              { 
                label: 'Pending Reviews', 
                value: totalPending, 
                icon: '⏳', 
                color: 'from-amber-500 to-orange-500', 
                bg: 'from-gray-900/50 to-black/50',
                description: 'Awaiting approval'
              },
              { 
                label: 'Completed', 
                value: totalCompleted, 
                icon: '✅', 
                color: 'from-blue-500 to-cyan-500', 
                bg: 'from-gray-900/50 to-black/50',
                description: 'Processed submissions'
              }
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="group relative hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500`}></div>
                
                <div className={`relative card-modern border-0 bg-gradient-to-br ${stat.bg} backdrop-blur-sm overflow-hidden`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                        <span className="text-xl text-white">{stat.icon}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`text-3xl font-light bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                      <h3 className="font-light text-gray-200 text-sm">
                        {stat.label}
                      </h3>
                      <p className="text-xs text-gray-300 font-light">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Users List */}
      <section className="fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
              All Users ({totalUsers})
            </h2>
            <p className="text-gray-300 font-light mt-1">Complete list of platform users and their activity</p>
          </div>
          
          {usersError ? (
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 border border-red-500/50 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-light text-red-400 mb-2">Error Loading Users</h3>
                <p className="text-red-300">{usersError.message}</p>
              </div>
            </div>
          ) : users && users.length > 0 ? (
            <div className="grid gap-6">
              {users.map((userProfile, index) => {
                const stats = statsMap.get(userProfile.id)
                const totalSubmissions = stats?.total || 0
                const totalRegistrations = stats?.registrations || 0
                const isActive = (stats?.pending || 0) + (stats?.completed || 0) > 0
                
                return (
                  <div 
                    key={userProfile.id}
                    className="group relative hover-lift"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${getUserRoleColor(userProfile.is_admin)} rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500`}></div>
                    
                    <div className={`relative card-modern border-0 bg-gradient-to-br ${getUserRoleBg(userProfile.is_admin)} backdrop-blur-sm overflow-hidden`}>
                      {/* Role stripe */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getUserRoleColor(userProfile.is_admin)}`}></div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${getUserRoleColor(userProfile.is_admin)} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                              <span className="text-2xl text-white">
                                {getUserRoleIcon(userProfile.is_admin)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-xl font-light text-gray-200">
                                {userProfile.username}
                              </h3>
                              <p className="text-gray-300 font-light">
                                ID: {userProfile.id.slice(0, 8)}... • Joined {new Date(userProfile.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-light ${
                              userProfile.is_admin 
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                              {userProfile.is_admin ? 'Administrator' : 'User'}
                            </span>
                            {isActive && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-light bg-green-500/20 text-green-300 border border-green-500/30">
                                Active
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Activity Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                            <div className={`text-lg font-light bg-gradient-to-r ${getUserRoleColor(userProfile.is_admin)} bg-clip-text text-transparent`}>
                              {totalRegistrations}
                            </div>
                            <div className="text-xs text-gray-300 font-light">Registrations</div>
                          </div>
                          <div className="text-center p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                            <div className={`text-lg font-light bg-gradient-to-r ${getUserRoleColor(userProfile.is_admin)} bg-clip-text text-transparent`}>
                              {totalSubmissions}
                            </div>
                            <div className="text-xs text-gray-300 font-light">Total Submissions</div>
                          </div>
                          <div className="text-center p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                            <div className={`text-lg font-light bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent`}>
                              {stats?.pending || 0}
                            </div>
                            <div className="text-xs text-gray-300 font-light">Pending</div>
                          </div>
                          <div className="text-center p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                            <div className={`text-lg font-light bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent`}>
                              {stats?.completed || 0}
                            </div>
                            <div className="text-xs text-gray-300 font-light">Completed</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="relative">
              <div className="text-center py-16 px-8">
                <div className="mx-auto max-w-md space-y-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-gray-800 to-slate-700 rounded-full flex items-center justify-center mb-6">
                    <div className="text-4xl">👥</div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                      {users === null ? 'Loading Users...' : 'No Users Found'}
                    </h3>
                    <p className="text-gray-300 font-light leading-relaxed">
                      {users === null 
                        ? 'Please wait while we load the user data...' 
                        : 'This is unexpected - there should be at least your admin account visible. Check the browser console for any errors.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
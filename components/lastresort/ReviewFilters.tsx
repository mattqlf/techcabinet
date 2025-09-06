'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface ReviewFiltersProps {
  statusOptions: Array<{ value: string; label: string }>
  competitions: Array<{ id: string; name: string }>
  currentStatus: string
  currentCompetition?: string
}

export function ReviewFilters({ 
  statusOptions, 
  competitions, 
  currentStatus, 
  currentCompetition 
}: ReviewFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    
    if (value && value !== 'pending') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Clear other filter if changing to default
    if (key === 'status' && value === 'pending') {
      // Keep competition filter
    } else if (key === 'competition' && !value) {
      // Keep status filter
    }

    router.push(`/lastresort/admin/review?${params.toString()}`)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Status Filter */}
      <div className="space-y-3">
        <label htmlFor="status-filter" className="block text-sm font-light text-gray-200">
          Filter by Status
        </label>
        <div className="relative">
          <select 
            id="status-filter"
            className="w-full appearance-none bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-3 text-gray-200 font-light shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            value={currentStatus}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value} className="py-2">
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Competition Filter */}
      <div className="space-y-3">
        <label htmlFor="competition-filter" className="block text-sm font-light text-gray-200">
          Filter by Competition
        </label>
        <div className="relative">
          <select 
            id="competition-filter"
            className="w-full appearance-none bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-3 text-gray-200 font-light shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            value={currentCompetition || ''}
            onChange={(e) => updateFilter('competition', e.target.value)}
          >
            <option value="" className="py-2">All Competitions</option>
            {competitions.map(competition => (
              <option key={competition.id} value={competition.id} className="py-2">
                {competition.name}
              </option>
            ))}
          </select>
          {/* Custom arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
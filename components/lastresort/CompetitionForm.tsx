'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCompetition, updateCompetition } from '@/lib/lastresort/actions/competitions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Competition } from '@/lib/lastresort/types'

interface CompetitionFormProps {
  competition?: Competition
  mode?: 'create' | 'edit'
}

export function CompetitionForm({ competition, mode = 'create' }: CompetitionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: competition?.name || '',
    short_description: competition?.short_description || '',
    description: competition?.description || '',
    num_questions: competition?.num_questions || 1,
    start_date: competition?.start_date ? 
      new Date(competition.start_date).toISOString().slice(0, 16) : '',
    end_date: competition?.end_date ? 
      new Date(competition.end_date).toISOString().slice(0, 16) : ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Competition name is required')
      }
      if (!formData.start_date || !formData.end_date) {
        throw new Error('Start and end dates are required')
      }
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        throw new Error('End date must be after start date')
      }
      if (formData.num_questions < 1) {
        throw new Error('Number of questions must be at least 1')
      }

      const submitData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      }

      if (mode === 'edit' && competition) {
        await updateCompetition(competition.id, submitData)
      } else {
        await createCompetition(submitData)
      }

      router.push('/lastresort/admin/competitions')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-20"></div>
      <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 rounded-3xl shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                <span className="text-xl text-white">{mode === 'edit' ? '✏️' : '🏆'}</span>
              </div>
              <div>
                <h2 className="text-2xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                  {mode === 'edit' ? 'Edit Competition' : 'Competition Details'}
                </h2>
                <p className="text-gray-300 font-light">{mode === 'edit' ? 'Update competition settings' : 'Create a new competition'}</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl blur opacity-20"></div>
                <div className="relative bg-gradient-to-br from-red-900/50 to-pink-900/50 border border-red-800/50 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-red-300 text-sm font-light">{error}</p>
                </div>
              </div>
            )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300 font-light">Competition Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter competition name"
              className="bg-gray-800/50 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description" className="text-gray-300 font-light">Short Description</Label>
            <Input
              id="short_description"
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="Brief description for cards (optional)"
              className="bg-gray-800/50 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300 font-light">Full Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed competition description and rules (optional)"
              className="bg-gray-800/50 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:ring-purple-500"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="num_questions" className="text-gray-300 font-light">Number of Questions *</Label>
            <Input
              id="num_questions"
              type="number"
              min="1"
              max="50"
              value={formData.num_questions}
              onChange={(e) => setFormData({ ...formData, num_questions: parseInt(e.target.value) || 1 })}
              className="bg-gray-800/50 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:ring-purple-500"
              required
            />
            <p className="text-sm text-gray-500">
              How many questions participants must submit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-gray-300 font-light">Start Date & Time *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="bg-gray-800/50 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:ring-purple-500"
                required
              />
              <p className="text-sm text-gray-500">
                When users can start submitting
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-gray-300 font-light">End Date & Time *</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="bg-gray-800/50 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:ring-purple-500"
                required
              />
              <p className="text-sm text-gray-500">
                Submissions close 1 day after this
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isLoading}
              className="font-light"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="font-light">
              {isLoading ? 'Saving...' : (mode === 'edit' ? 'Update Competition' : 'Create Competition')}
            </Button>
          </div>
          </form>
        </div>
      </div>
    </div>
  )
}
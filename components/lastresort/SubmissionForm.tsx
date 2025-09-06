'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface Competition {
  id: string
  name: string
  num_questions: number
}

interface Problem {
  question_number: number
  problem_text: string
  user_solution: string
  user_answer: string
}

interface SubmissionFormProps {
  competition: Competition
  userId: string
}

export function SubmissionForm({ competition, userId }: SubmissionFormProps) {
  const router = useRouter()
  const [problems, setProblems] = useState<Problem[]>(
    Array.from({ length: competition.num_questions }, (_, i) => ({
      question_number: i + 1,
      problem_text: '',
      user_solution: '',
      user_answer: ''
    }))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateProblem = (index: number, field: keyof Problem, value: string) => {
    setProblems(prev => prev.map((problem, i) => 
      i === index ? { ...problem, [field]: value } : problem
    ))
    
    // Clear error for this field
    const errorKey = `${index}.${field}`
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    problems.forEach((problem, index) => {
      if (!problem.problem_text.trim()) {
        newErrors[`${index}.problem_text`] = 'Problem text is required'
      } else if (problem.problem_text.length < 10) {
        newErrors[`${index}.problem_text`] = 'Problem text must be at least 10 characters'
      }
      
      if (!problem.user_solution.trim()) {
        newErrors[`${index}.user_solution`] = 'Solution is required'
      } else if (problem.user_solution.length < 5) {
        newErrors[`${index}.user_solution`] = 'Solution must be at least 5 characters'
      }
      
      if (!problem.user_answer.trim()) {
        newErrors[`${index}.user_answer`] = 'Answer is required'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competition_id: competition.id,
          user_id: userId,
          problems: problems
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit')
      }
      
      const result = await response.json()
      router.push(`/lastresort/submissions/${result.id}`)
    } catch (error) {
      console.error('Submission error:', error)
      setErrors({ general: 'Failed to submit. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.general && (
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl blur opacity-20"></div>
          <div className="relative bg-gradient-to-br from-red-900/50 to-pink-900/50 border border-red-800/50 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-red-300 font-light">{errors.general}</p>
          </div>
        </div>
      )}
      
      {problems.map((problem, index) => (
        <div key={index} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 rounded-3xl shadow-lg overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-light">{problem.question_number}</span>
                </div>
                <h3 className="text-xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                  Question {problem.question_number}
                </h3>
              </div>
              <div className="space-y-6">
            <div>
              <Label htmlFor={`problem-text-${index}`} className="text-gray-300 font-light">
                Problem Statement *
              </Label>
              <textarea
                id={`problem-text-${index}`}
                className="mt-1 block w-full rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm px-4 py-3 text-sm font-light text-gray-200 shadow-sm transition-all duration-200 placeholder:text-gray-500 hover:shadow-lg hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
                placeholder="Describe your problem clearly. The AI will see this and attempt to solve it."
                value={problem.problem_text}
                onChange={(e) => updateProblem(index, 'problem_text', e.target.value)}
              />
              {errors[`${index}.problem_text`] && (
                <p className="mt-1 text-sm text-red-400">{errors[`${index}.problem_text`]}</p>
              )}
            </div>

            <div>
              <Label htmlFor={`user-solution-${index}`} className="text-gray-300 font-light">
                Your Solution *
              </Label>
              <textarea
                id={`user-solution-${index}`}
                className="mt-1 block w-full rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm px-4 py-3 text-sm font-light text-gray-200 shadow-sm transition-all duration-200 placeholder:text-gray-500 hover:shadow-lg hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="How would you solve this problem? This helps validate your answer."
                value={problem.user_solution}
                onChange={(e) => updateProblem(index, 'user_solution', e.target.value)}
              />
              {errors[`${index}.user_solution`] && (
                <p className="mt-1 text-sm text-red-400">{errors[`${index}.user_solution`]}</p>
              )}
            </div>

            <div>
              <Label htmlFor={`user-answer-${index}`} className="text-gray-300 font-light">
                Correct Answer *
              </Label>
              <Input
                id={`user-answer-${index}`}
                type="text"
                placeholder="The correct answer to your problem"
                className="bg-gray-800/50 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:ring-purple-500"
                value={problem.user_answer}
                onChange={(e) => updateProblem(index, 'user_answer', e.target.value)}
              />
              {errors[`${index}.user_answer`] && (
                <p className="mt-1 text-sm text-red-400">{errors[`${index}.user_answer`]}</p>
              )}
            </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="font-light"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="font-light"
        >
          {isSubmitting ? 'Submitting...' : 'Submit for Review'}
        </Button>
      </div>
    </form>
  )
}
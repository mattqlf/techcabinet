'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCompetition } from '@/lib/lastresort/actions/competitions'
import { Button } from '@/components/ui/button'

interface DeleteCompetitionButtonProps {
  competitionId: string
  competitionName: string
  hasSubmissions: boolean
}

export function DeleteCompetitionButton({ 
  competitionId, 
  competitionName, 
  hasSubmissions 
}: DeleteCompetitionButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsDeleting(true)
    try {
      await deleteCompetition(competitionId)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete competition')
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-300 font-light">
          Delete &ldquo;{competitionName}&rdquo;?
          {hasSubmissions && (
            <span className="text-red-400 font-light">
              {' '}(Will delete all submissions!)
            </span>
          )}
        </span>
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          size="sm"
          variant="destructive"
        >
          {isDeleting ? 'Deleting...' : 'Confirm'}
        </Button>
        <Button
          onClick={handleCancel}
          disabled={isDeleting}
          size="sm"
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={handleDelete}
      size="sm"
      variant="ghost"
      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 font-light"
    >
      Delete
    </Button>
  )
}
import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return {
          variant: 'default' as const,
          label: 'Active',
          className: 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 font-light'
        }
      case 'upcoming':
        return {
          variant: 'secondary' as const,
          label: 'Upcoming',
          className: 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 font-light'
        }
      case 'past':
        return {
          variant: 'outline' as const,
          label: 'Past',
          className: 'bg-gray-500/20 text-gray-300 border border-gray-500/30 hover:bg-gray-500/30 font-light'
        }
      case 'pending':
        return {
          variant: 'secondary' as const,
          label: 'Pending Review',
          className: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30 font-light'
        }
      case 'accepted':
        return {
          variant: 'default' as const,
          label: 'Accepted',
          className: 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 font-light'
        }
      case 'rejected':
        return {
          variant: 'destructive' as const,
          label: 'Rejected',
          className: 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 font-light'
        }
      case 'completed':
        return {
          variant: 'default' as const,
          label: 'Completed',
          className: 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 font-light'
        }
      case 'error':
        return {
          variant: 'destructive' as const,
          label: 'Error',
          className: 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 font-light'
        }
      default:
        return {
          variant: 'secondary' as const,
          label: status,
          className: 'bg-gray-500/20 text-gray-300 border border-gray-500/30 hover:bg-gray-500/30 font-light'
        }
    }
  }

  const config = getStatusConfig(status)
  
  return (
    <Badge 
      variant={config.variant}
      className={config.className}
    >
      {config.label}
    </Badge>
  )
}
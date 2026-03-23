import { cn } from '@/lib/utils'
import { LeadStatus } from '@/types'

interface StatusBadgeProps {
  status: LeadStatus
  id?: string
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  qualified: 'Qualifié',
  lost: 'Perdu',
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-500/15 text-blue-400',
  contacted: 'bg-yellow-500/15 text-yellow-400',
  qualified: 'bg-green-500/15 text-green-400',
  lost: 'bg-red-500/15 text-red-400',
}

export function StatusBadge({ status, id }: StatusBadgeProps) {
  return (
    <span
      id={id}
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        STATUS_COLORS[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

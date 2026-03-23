import { cn } from '@/lib/utils'

interface ScoreBadgeProps {
  score: number | null
  id?: string
}

function getScoreColor(score: number): string {
  if (score > 70) return 'bg-green-500/15 text-green-400'
  if (score >= 40) return 'bg-orange-500/15 text-orange-400'
  return 'bg-red-500/15 text-red-400'
}

export function ScoreBadge({ score, id }: ScoreBadgeProps) {
  return (
    <span
      id={id}
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        score !== null ? getScoreColor(score) : 'bg-muted text-muted-foreground',
      )}
    >
      {score ?? '—'}
    </span>
  )
}

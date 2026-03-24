'use client'

import { LeadStatus } from '@/types'

interface LeadsFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  statusFilter: LeadStatus | 'all'
  onStatusFilterChange: (v: LeadStatus | 'all') => void
  statusCounts: Record<LeadStatus | 'all', number>
}

const STATUS_OPTIONS: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'new', label: 'Nouveau' },
  { value: 'contacted', label: 'Contacté' },
  { value: 'qualified', label: 'Qualifié' },
  { value: 'lost', label: 'Perdu' },
]

export function LeadsFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  statusCounts,
}: LeadsFiltersProps) {
  return (
    <div className="space-y-3 mb-4">
      <input
        id="search-input"
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Rechercher par nom, société, email…"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => {
          const isActive = statusFilter === option.value
          return (
            <button
              key={option.value}
              onClick={() => onStatusFilterChange(option.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option.label} ({statusCounts[option.value]})
            </button>
          )
        })}
      </div>
    </div>
  )
}

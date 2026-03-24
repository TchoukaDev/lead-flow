'use client'

import { useState } from 'react'
import { updateLeadStatus } from '@/actions/leads'
import type { LeadStatus } from '@/types'

interface StatusSelectProps {
  leadId: string
  currentStatus: LeadStatus
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  qualified: 'Qualifié',
  lost: 'Perdu',
}

const STATUS_OPTIONS: LeadStatus[] = ['new', 'contacted', 'qualified', 'lost']

export function StatusSelect({ leadId, currentStatus }: StatusSelectProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as LeadStatus
    setError(null)
    setPending(true)

    const result = await updateLeadStatus(leadId, newStatus)

    setPending(false)
    if ('error' in result) {
      setError(result.error)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={pending}
        className="rounded-md border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

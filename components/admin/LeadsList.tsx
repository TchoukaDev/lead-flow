'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lead, LeadStatus } from '@/types'
import { LeadsFilters } from './LeadsFilters'
import { ScoreBadge } from './ScoreBadge'
import { StatusBadge } from './StatusBadge'

interface LeadsListProps {
  leads: Lead[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  })
}

export function LeadsList({ leads }: LeadsListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')

  const filtered = leads.filter((lead) => {
    const matchStatus = statusFilter === 'all' || lead.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(q) ||
      lead.company.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  return (
    <div>
      <LeadsFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={leads.length}
        filteredCount={filtered.length}
      />

      <div id="leads-table" className="relative overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-border">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 text-sm">
            Aucun lead ne correspond à votre recherche.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Nom &amp; Société</th>
                <th className="pb-3 pr-4 font-medium hidden sm:table-cell">Email</th>
                <th className="pb-3 pr-4 font-medium">Score</th>
                <th className="pb-3 pr-4 font-medium">Statut</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, index) => (
                <tr
                  key={lead.id}
                  id={index === 0 ? 'lead-row-first' : undefined}
                  className="border-b border-border hover:bg-muted/40 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <Link href={`/admin/leads/${lead.id}`} className="block">
                      <div className="font-medium">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-muted-foreground text-xs">{lead.company}</div>
                    </Link>
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell">
                    <Link href={`/admin/leads/${lead.id}`} className="block text-muted-foreground">
                      {lead.email}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <Link href={`/admin/leads/${lead.id}`} className="block">
                      <ScoreBadge
                        score={lead.score}
                        id={index === 0 ? 'score-badge' : undefined}
                      />
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <Link href={`/admin/leads/${lead.id}`} className="block">
                      <StatusBadge
                        status={lead.status}
                        id={index === 0 ? 'status-badge' : undefined}
                      />
                    </Link>
                  </td>
                  <td className="py-3 hidden sm:table-cell">
                    <Link href={`/admin/leads/${lead.id}`} className="block text-muted-foreground">
                      {formatDate(lead.created_at)}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

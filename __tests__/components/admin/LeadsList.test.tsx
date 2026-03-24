import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { LeadsList } from '@/components/admin/LeadsList'
import type { Lead } from '@/types'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const makeLead = (overrides: Partial<Lead>): Lead => ({
  id: 'id-1',
  first_name: 'Jean',
  last_name: 'Dupont',
  email: 'jean@example.com',
  company: 'Acme',
  sector: 'Tech',
  main_need: 'CRM',
  budget_range: '5k-15k',
  status: 'new',
  score: 80,
  source: null,
  enrichment: null,
  email_draft: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_demo: false,
  ...overrides,
})

const leads: Lead[] = [
  makeLead({ id: '1', first_name: 'Alice', last_name: 'Martin', email: 'alice@example.com', company: 'Acme', status: 'new' }),
  makeLead({ id: '2', first_name: 'Bob', last_name: 'Dupont', email: 'bob@example.com', company: 'Beta', status: 'contacted' }),
  makeLead({ id: '3', first_name: 'Claire', last_name: 'Dupont', email: 'claire@example.com', company: 'Gamma', status: 'qualified' }),
  makeLead({ id: '4', first_name: 'David', last_name: 'Leroy', email: 'david@acme.fr', company: 'Acme', status: 'new' }),
  makeLead({ id: '5', first_name: 'Eve', last_name: 'Blanc', email: 'eve@example.com', company: 'Delta', status: 'lost' }),
]

describe('LeadsList — interaction recherche + filtres statut', () => {
  it('affiche tous les leads par défaut', () => {
    render(<LeadsList leads={leads} />)
    expect(screen.getAllByRole('row')).toHaveLength(leads.length + 1) // +1 header
  })

  it('les counts initiaux reflètent tous les leads', () => {
    render(<LeadsList leads={leads} />)
    expect(screen.getByRole('button', { name: 'Tous (5)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nouveau (2)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Contacté (1)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Qualifié (1)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Perdu (1)' })).toBeInTheDocument()
  })

  it('filtre les leads par recherche (nom)', async () => {
    const user = userEvent.setup()
    render(<LeadsList leads={leads} />)

    await user.type(screen.getByPlaceholderText(/Rechercher/), 'dupont')

    expect(screen.getAllByRole('row')).toHaveLength(3) // 2 résultats + header
    expect(screen.getByText('Bob Dupont')).toBeInTheDocument()
    expect(screen.getByText('Claire Dupont')).toBeInTheDocument()
    expect(screen.queryByText('Alice Martin')).not.toBeInTheDocument()
  })

  it('les counts se mettent à jour quand la recherche est active', async () => {
    const user = userEvent.setup()
    render(<LeadsList leads={leads} />)

    await user.type(screen.getByPlaceholderText(/Rechercher/), 'dupont')

    // Bob Dupont (contacted) + Claire Dupont (qualified)
    expect(screen.getByRole('button', { name: 'Tous (2)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nouveau (0)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Contacté (1)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Qualifié (1)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Perdu (0)' })).toBeInTheDocument()
  })

  it('filtre par recherche ET statut combinés', async () => {
    const user = userEvent.setup()
    render(<LeadsList leads={leads} />)

    await user.type(screen.getByPlaceholderText(/Rechercher/), 'acme')
    await user.click(screen.getByRole('button', { name: /Nouveau/ }))

    // Alice Martin (acme company, new) + David Leroy (acme.fr email, new) → 2
    expect(screen.getAllByRole('row')).toHaveLength(3)
  })

  it('filtre par recherche sur l\'email', async () => {
    const user = userEvent.setup()
    render(<LeadsList leads={leads} />)

    await user.type(screen.getByPlaceholderText(/Rechercher/), 'acme.fr')

    // David Leroy uniquement
    expect(screen.getAllByRole('row')).toHaveLength(2)
  })

  it('filtre par recherche sur la société', async () => {
    const user = userEvent.setup()
    render(<LeadsList leads={leads} />)

    await user.type(screen.getByPlaceholderText(/Rechercher/), 'Gamma')

    // Claire Dupont uniquement
    expect(screen.getAllByRole('row')).toHaveLength(2)
  })

  it('remet à zéro les counts quand la recherche est effacée', async () => {
    const user = userEvent.setup()
    render(<LeadsList leads={leads} />)

    await user.type(screen.getByPlaceholderText(/Rechercher/), 'dupont')
    expect(screen.getByRole('button', { name: 'Tous (2)' })).toBeInTheDocument()

    await user.clear(screen.getByPlaceholderText(/Rechercher/))
    expect(screen.getByRole('button', { name: 'Tous (5)' })).toBeInTheDocument()
  })

  it('affiche le message vide si aucun lead ne correspond', async () => {
    const user = userEvent.setup()
    render(<LeadsList leads={leads} />)

    await user.type(screen.getByPlaceholderText(/Rechercher/), 'zzznomatch')

    expect(screen.getByText(/Aucun lead ne correspond/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tous (0)' })).toBeInTheDocument()
  })
})

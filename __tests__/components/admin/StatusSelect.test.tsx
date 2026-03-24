import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StatusSelect } from '@/components/admin/StatusSelect'

// Mock de la server action
vi.mock('@/actions/leads', () => ({
  updateLeadStatus: vi.fn(),
}))

import { updateLeadStatus } from '@/actions/leads'
const mockUpdateLeadStatus = vi.mocked(updateLeadStatus)

describe('StatusSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rend le select avec la valeur courante sélectionnée', () => {
    mockUpdateLeadStatus.mockResolvedValue({ ok: true })
    render(<StatusSelect leadId="lead-1" currentStatus="new" />)
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    // defaultValue positionne la valeur initiale
    expect((select as HTMLSelectElement).value).toBe('new')
  })

  it('affiche les 4 options de statut', () => {
    mockUpdateLeadStatus.mockResolvedValue({ ok: true })
    render(<StatusSelect leadId="lead-1" currentStatus="new" />)
    expect(screen.getByText('Nouveau')).toBeInTheDocument()
    expect(screen.getByText('Contacté')).toBeInTheDocument()
    expect(screen.getByText('Qualifié')).toBeInTheDocument()
    expect(screen.getByText('Perdu')).toBeInTheDocument()
  })

  it('appelle updateLeadStatus avec le bon leadId et le nouveau statut', async () => {
    mockUpdateLeadStatus.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(<StatusSelect leadId="lead-42" currentStatus="new" />)

    await user.selectOptions(screen.getByRole('combobox'), 'contacted')

    expect(mockUpdateLeadStatus).toHaveBeenCalledOnce()
    expect(mockUpdateLeadStatus).toHaveBeenCalledWith('lead-42', 'contacted')
  })

  it('désactive le select pendant le chargement', async () => {
    // Promesse qui ne se résout pas immédiatement pour observer l'état pending
    let resolve: (v: { ok: true }) => void
    const pendingPromise = new Promise<{ ok: true }>((res) => { resolve = res })
    mockUpdateLeadStatus.mockReturnValue(pendingPromise)

    const user = userEvent.setup()
    render(<StatusSelect leadId="lead-1" currentStatus="new" />)

    const select = screen.getByRole('combobox')
    expect(select).not.toBeDisabled()

    await user.selectOptions(select, 'qualified')

    expect(select).toBeDisabled()

    // Résolution pour nettoyer
    resolve!({ ok: true })
    await waitFor(() => expect(select).not.toBeDisabled())
  })

  it('affiche le message d\'erreur si updateLeadStatus retourne { error }', async () => {
    mockUpdateLeadStatus.mockResolvedValue({ error: 'Erreur de base de données' })
    const user = userEvent.setup()
    render(<StatusSelect leadId="lead-1" currentStatus="new" />)

    await user.selectOptions(screen.getByRole('combobox'), 'lost')

    await waitFor(() => {
      expect(screen.getByText('Erreur de base de données')).toBeInTheDocument()
    })
  })

  it('n\'affiche pas d\'erreur en cas de succès', async () => {
    mockUpdateLeadStatus.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(<StatusSelect leadId="lead-1" currentStatus="new" />)

    await user.selectOptions(screen.getByRole('combobox'), 'contacted')

    await waitFor(() => {
      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
    })
  })

  it('efface l\'erreur précédente avant un nouvel appel', async () => {
    // Premier appel échoue
    mockUpdateLeadStatus.mockResolvedValueOnce({ error: 'Première erreur' })
    // Second appel réussit
    mockUpdateLeadStatus.mockResolvedValueOnce({ ok: true })

    const user = userEvent.setup()
    render(<StatusSelect leadId="lead-1" currentStatus="new" />)

    await user.selectOptions(screen.getByRole('combobox'), 'contacted')
    await waitFor(() => {
      expect(screen.getByText('Première erreur')).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByRole('combobox'), 'qualified')
    await waitFor(() => {
      expect(screen.queryByText('Première erreur')).not.toBeInTheDocument()
    })
  })
})

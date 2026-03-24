import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LeadsFilters } from '@/components/admin/LeadsFilters'
import type { LeadStatus } from '@/types'

const defaultStatusCounts = {
  all: 10,
  new: 3,
  contacted: 2,
  qualified: 4,
  lost: 1,
}

function renderFilters(overrides: Partial<Parameters<typeof LeadsFilters>[0]> = {}) {
  const defaultProps = {
    search: '',
    onSearchChange: vi.fn(),
    statusFilter: 'all' as LeadStatus | 'all',
    onStatusFilterChange: vi.fn(),
    statusCounts: defaultStatusCounts,
    ...overrides,
  }
  return { ...render(<LeadsFilters {...defaultProps} />), props: defaultProps }
}

describe('LeadsFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- Champ de recherche ---

  it('affiche un champ de recherche texte', () => {
    renderFilters()
    expect(screen.getByPlaceholderText('Rechercher par nom, société, email…')).toBeInTheDocument()
  })

  it('affiche la valeur de search dans l\'input', () => {
    renderFilters({ search: 'dupont' })
    const input = screen.getByPlaceholderText('Rechercher par nom, société, email…') as HTMLInputElement
    expect(input.value).toBe('dupont')
  })

  it('appelle onSearchChange quand l\'utilisateur tape dans l\'input', async () => {
    const onSearchChange = vi.fn()
    const user = userEvent.setup()
    renderFilters({ onSearchChange })

    await user.type(screen.getByPlaceholderText('Rechercher par nom, société, email…'), 'abc')

    expect(onSearchChange).toHaveBeenCalledTimes(3)
    expect(onSearchChange).toHaveBeenNthCalledWith(1, 'a')
    expect(onSearchChange).toHaveBeenNthCalledWith(2, 'b')
    expect(onSearchChange).toHaveBeenNthCalledWith(3, 'c')
  })

  // --- Filtres par statut ---

  it('affiche les 5 boutons de filtre avec leur count', () => {
    renderFilters()
    expect(screen.getByRole('button', { name: 'Tous (10)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nouveau (3)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Contacté (2)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Qualifié (4)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Perdu (1)' })).toBeInTheDocument()
  })

  it('affiche le count correct dans chaque pill depuis statusCounts', () => {
    renderFilters({
      statusCounts: { all: 5, new: 1, contacted: 2, qualified: 1, lost: 1 },
    })
    expect(screen.getByRole('button', { name: 'Tous (5)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nouveau (1)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Contacté (2)' })).toBeInTheDocument()
  })

  it('appelle onStatusFilterChange avec "all" au clic sur Tous', async () => {
    const onStatusFilterChange = vi.fn()
    const user = userEvent.setup()
    renderFilters({ onStatusFilterChange, statusFilter: 'new' })

    await user.click(screen.getByRole('button', { name: /Tous/ }))

    expect(onStatusFilterChange).toHaveBeenCalledOnce()
    expect(onStatusFilterChange).toHaveBeenCalledWith('all')
  })

  it('appelle onStatusFilterChange avec "new" au clic sur Nouveau', async () => {
    const onStatusFilterChange = vi.fn()
    const user = userEvent.setup()
    renderFilters({ onStatusFilterChange })

    await user.click(screen.getByRole('button', { name: /Nouveau/ }))

    expect(onStatusFilterChange).toHaveBeenCalledWith('new')
  })

  it('appelle onStatusFilterChange avec "contacted" au clic sur Contacté', async () => {
    const onStatusFilterChange = vi.fn()
    const user = userEvent.setup()
    renderFilters({ onStatusFilterChange })

    await user.click(screen.getByRole('button', { name: /Contacté/ }))

    expect(onStatusFilterChange).toHaveBeenCalledWith('contacted')
  })

  it('appelle onStatusFilterChange avec "qualified" au clic sur Qualifié', async () => {
    const onStatusFilterChange = vi.fn()
    const user = userEvent.setup()
    renderFilters({ onStatusFilterChange })

    await user.click(screen.getByRole('button', { name: /Qualifié/ }))

    expect(onStatusFilterChange).toHaveBeenCalledWith('qualified')
  })

  it('appelle onStatusFilterChange avec "lost" au clic sur Perdu', async () => {
    const onStatusFilterChange = vi.fn()
    const user = userEvent.setup()
    renderFilters({ onStatusFilterChange })

    await user.click(screen.getByRole('button', { name: /Perdu/ }))

    expect(onStatusFilterChange).toHaveBeenCalledWith('lost')
  })

  // --- État actif du filtre ---

  it('applique les classes "actif" au bouton Tous quand statusFilter est "all"', () => {
    renderFilters({ statusFilter: 'all' })
    const button = screen.getByRole('button', { name: /Tous/ })
    expect(button.className).toContain('bg-primary')
    expect(button.className).toContain('text-primary-foreground')
  })

  it('applique les classes "inactif" aux autres boutons quand statusFilter est "all"', () => {
    renderFilters({ statusFilter: 'all' })
    const button = screen.getByRole('button', { name: /Nouveau/ })
    expect(button.className).toContain('bg-muted')
    expect(button.className).toContain('text-muted-foreground')
  })

  it('applique les classes "actif" au bouton du statut sélectionné', () => {
    renderFilters({ statusFilter: 'qualified' })
    const button = screen.getByRole('button', { name: /Qualifié/ })
    expect(button.className).toContain('bg-primary')
    expect(button.className).toContain('text-primary-foreground')
  })

  it('applique les classes "inactif" au bouton Tous quand un statut spécifique est actif', () => {
    renderFilters({ statusFilter: 'lost' })
    const button = screen.getByRole('button', { name: /Tous/ })
    expect(button.className).toContain('bg-muted')
  })
})

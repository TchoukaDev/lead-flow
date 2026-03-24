import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from '@/components/admin/StatusBadge'

describe('StatusBadge', () => {
  it('affiche "Nouveau" pour le statut new', () => {
    render(<StatusBadge status="new" />)
    expect(screen.getByText('Nouveau')).toBeInTheDocument()
  })

  it('affiche "Contacté" pour le statut contacted', () => {
    render(<StatusBadge status="contacted" />)
    expect(screen.getByText('Contacté')).toBeInTheDocument()
  })

  it('affiche "Qualifié" pour le statut qualified', () => {
    render(<StatusBadge status="qualified" />)
    expect(screen.getByText('Qualifié')).toBeInTheDocument()
  })

  it('affiche "Perdu" pour le statut lost', () => {
    render(<StatusBadge status="lost" />)
    expect(screen.getByText('Perdu')).toBeInTheDocument()
  })

  it('applique les classes bleues pour new', () => {
    render(<StatusBadge status="new" />)
    const badge = screen.getByText('Nouveau')
    expect(badge.className).toContain('bg-blue-500/15')
    expect(badge.className).toContain('text-blue-400')
  })

  it('applique les classes jaunes pour contacted', () => {
    render(<StatusBadge status="contacted" />)
    const badge = screen.getByText('Contacté')
    expect(badge.className).toContain('bg-yellow-500/15')
    expect(badge.className).toContain('text-yellow-400')
  })

  it('applique les classes vertes pour qualified', () => {
    render(<StatusBadge status="qualified" />)
    const badge = screen.getByText('Qualifié')
    expect(badge.className).toContain('bg-green-500/15')
    expect(badge.className).toContain('text-green-400')
  })

  it('applique les classes rouges pour lost', () => {
    render(<StatusBadge status="lost" />)
    const badge = screen.getByText('Perdu')
    expect(badge.className).toContain('bg-red-500/15')
    expect(badge.className).toContain('text-red-400')
  })

  it('transmet la prop id au span', () => {
    render(<StatusBadge status="new" id="status-badge-tour" />)
    expect(document.getElementById('status-badge-tour')).toBeInTheDocument()
  })

  it('rend sans id si la prop est absente', () => {
    const { container } = render(<StatusBadge status="new" />)
    const span = container.querySelector('span')
    expect(span?.id).toBe('')
  })
})

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ScoreBadge } from '@/components/admin/ScoreBadge'

describe('ScoreBadge', () => {
  it('affiche le score quand il est fourni', () => {
    render(<ScoreBadge score={85} />)
    expect(screen.getByText('85')).toBeInTheDocument()
  })

  it('affiche "—" quand le score est null', () => {
    render(<ScoreBadge score={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('applique les classes vertes pour score > 70', () => {
    render(<ScoreBadge score={71} />)
    const badge = screen.getByText('71')
    expect(badge.className).toContain('bg-green-500/15')
    expect(badge.className).toContain('text-green-400')
  })

  it('applique les classes vertes pour score = 71 (cas limite haut)', () => {
    render(<ScoreBadge score={100} />)
    const badge = screen.getByText('100')
    expect(badge.className).toContain('bg-green-500/15')
  })

  it('applique les classes oranges pour score = 40 (borne inférieure incluse)', () => {
    render(<ScoreBadge score={40} />)
    const badge = screen.getByText('40')
    expect(badge.className).toContain('bg-orange-500/15')
    expect(badge.className).toContain('text-orange-400')
  })

  it('applique les classes oranges pour score = 70 (borne supérieure incluse)', () => {
    render(<ScoreBadge score={70} />)
    const badge = screen.getByText('70')
    expect(badge.className).toContain('bg-orange-500/15')
    expect(badge.className).toContain('text-orange-400')
  })

  it('applique les classes oranges pour score entre 40 et 70', () => {
    render(<ScoreBadge score={55} />)
    const badge = screen.getByText('55')
    expect(badge.className).toContain('bg-orange-500/15')
  })

  it('applique les classes rouges pour score < 40', () => {
    render(<ScoreBadge score={39} />)
    const badge = screen.getByText('39')
    expect(badge.className).toContain('bg-red-500/15')
    expect(badge.className).toContain('text-red-400')
  })

  it('applique les classes rouges pour score = 0', () => {
    render(<ScoreBadge score={0} />)
    const badge = screen.getByText('0')
    expect(badge.className).toContain('bg-red-500/15')
  })

  it('applique les classes grises pour score null', () => {
    render(<ScoreBadge score={null} />)
    const badge = screen.getByText('—')
    expect(badge.className).toContain('bg-muted')
    expect(badge.className).toContain('text-muted-foreground')
  })

  it('ne applique pas de couleur de score quand null (pas de vert/orange/rouge)', () => {
    render(<ScoreBadge score={null} />)
    const badge = screen.getByText('—')
    expect(badge.className).not.toContain('bg-green-500')
    expect(badge.className).not.toContain('bg-orange-500')
    expect(badge.className).not.toContain('bg-red-500')
  })

  it('transmet la prop id au span', () => {
    render(<ScoreBadge score={50} id="score-badge-tour" />)
    expect(document.getElementById('score-badge-tour')).toBeInTheDocument()
  })

  it('rend sans id si la prop est absente', () => {
    const { container } = render(<ScoreBadge score={50} />)
    const span = container.querySelector('span')
    expect(span?.id).toBe('')
  })
})

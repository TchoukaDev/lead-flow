import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EmailDraftEditor } from '@/components/admin/EmailDraftEditor'

// Mock de la server action
vi.mock('@/actions/leads', () => ({
  updateEmailDraft: vi.fn(),
}))

import { updateEmailDraft } from '@/actions/leads'
const mockUpdateEmailDraft = vi.mocked(updateEmailDraft)

// Mock de fetch global
const mockFetch = vi.fn()

describe('EmailDraftEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', mockFetch)
  })

  const defaultProps = {
    leadId: 'lead-1',
    leadEmail: 'contact@example.com',
    initialDraft: 'Bonjour, suite à votre demande…',
  }

  it('affiche le brouillon initial dans le textarea', () => {
    render(<EmailDraftEditor {...defaultProps} />)
    const textarea = screen.getByRole('textbox')
    expect((textarea as HTMLTextAreaElement).value).toBe('Bonjour, suite à votre demande…')
  })

  it('affiche un textarea vide si initialDraft est null', () => {
    render(<EmailDraftEditor {...defaultProps} initialDraft={null} />)
    const textarea = screen.getByRole('textbox')
    expect((textarea as HTMLTextAreaElement).value).toBe('')
  })

  it('affiche les boutons Sauvegarder et Envoyer', () => {
    render(<EmailDraftEditor {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Sauvegarder' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeInTheDocument()
  })

  // --- Bouton Sauvegarder ---

  it('appelle updateEmailDraft avec le bon leadId et contenu actuel', async () => {
    mockUpdateEmailDraft.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(<EmailDraftEditor {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Sauvegarder' }))

    expect(mockUpdateEmailDraft).toHaveBeenCalledOnce()
    expect(mockUpdateEmailDraft).toHaveBeenCalledWith('lead-1', 'Bonjour, suite à votre demande…')
  })

  it('appelle updateEmailDraft avec le contenu modifié', async () => {
    mockUpdateEmailDraft.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(<EmailDraftEditor {...defaultProps} initialDraft="" />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Nouveau contenu')
    await user.click(screen.getByRole('button', { name: 'Sauvegarder' }))

    expect(mockUpdateEmailDraft).toHaveBeenCalledWith('lead-1', 'Nouveau contenu')
  })

  it('affiche "Brouillon sauvegardé" après une sauvegarde réussie', async () => {
    mockUpdateEmailDraft.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(<EmailDraftEditor {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Sauvegarder' }))

    await waitFor(() => {
      expect(screen.getByText('Brouillon sauvegardé')).toBeInTheDocument()
    })
  })

  it('affiche le message d\'erreur si updateEmailDraft retourne { error }', async () => {
    mockUpdateEmailDraft.mockResolvedValue({ error: 'Erreur Supabase' })
    const user = userEvent.setup()
    render(<EmailDraftEditor {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Sauvegarder' }))

    await waitFor(() => {
      expect(screen.getByText('Erreur Supabase')).toBeInTheDocument()
    })
  })

  it('désactive les deux boutons pendant la sauvegarde', async () => {
    let resolve: (v: { ok: true }) => void
    const pendingPromise = new Promise<{ ok: true }>((res) => { resolve = res })
    mockUpdateEmailDraft.mockReturnValue(pendingPromise)

    const user = userEvent.setup()
    render(<EmailDraftEditor {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Sauvegarder' }))

    expect(screen.getByRole('button', { name: 'Sauvegarde…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeDisabled()

    resolve!({ ok: true })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sauvegarder' })).not.toBeDisabled()
    })
  })

  it('désactive le textarea pendant la sauvegarde', async () => {
    let resolve: (v: { ok: true }) => void
    const pendingPromise = new Promise<{ ok: true }>((res) => { resolve = res })
    mockUpdateEmailDraft.mockReturnValue(pendingPromise)

    const user = userEvent.setup()
    render(<EmailDraftEditor {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Sauvegarder' }))

    expect(screen.getByRole('textbox')).toBeDisabled()

    resolve!({ ok: true })
    await waitFor(() => {
      expect(screen.getByRole('textbox')).not.toBeDisabled()
    })
  })

  // --- Bouton Envoyer ---

  it('appelle /api/send-email avec le bon payload', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })
    const user = userEvent.setup()
    render(<EmailDraftEditor {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Envoyer' }))

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/send-email')
    expect(options.method).toBe('POST')
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' })

    const body = JSON.parse(options.body)
    expect(body).toEqual({
      leadId: 'lead-1',
      to: 'contact@example.com',
      subject: 'Suite à votre demande',
      body: 'Bonjour, suite à votre demande…',
    })
  })

  it('affiche "Email envoyé — statut mis à jour" après un envoi réussi', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })
    const user = userEvent.setup()
    render(<EmailDraftEditor {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Envoyer' }))

    await waitFor(() => {
      expect(screen.getByText('Email envoyé — statut mis à jour')).toBeInTheDocument()
    })
  })

  it('affiche le message d\'erreur de l\'API si data.error est présent', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Adresse invalide' }),
    })
    const user = userEvent.setup()
    render(<EmailDraftEditor {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Envoyer' }))

    await waitFor(() => {
      expect(screen.getByText('Adresse invalide')).toBeInTheDocument()
    })
  })

  it('affiche le message d\'erreur générique si res.ok est false et pas de data.error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    })
    const user = userEvent.setup()
    render(<EmailDraftEditor {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Envoyer' }))

    await waitFor(() => {
      expect(screen.getByText("Erreur lors de l'envoi")).toBeInTheDocument()
    })
  })

  it('affiche "Erreur réseau" en cas d\'exception fetch', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()
    render(<EmailDraftEditor {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Envoyer' }))

    await waitFor(() => {
      expect(screen.getByText('Erreur réseau')).toBeInTheDocument()
    })
  })

  it('désactive les deux boutons pendant l\'envoi', async () => {
    let resolve: (v: Response) => void
    const pendingPromise = new Promise<Response>((res) => { resolve = res })
    mockFetch.mockReturnValue(pendingPromise)

    const user = userEvent.setup()
    render(<EmailDraftEditor {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Envoyer' }))

    expect(screen.getByRole('button', { name: 'Envoi…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Sauvegarder' })).toBeDisabled()

    resolve!({ ok: true, json: async () => ({ ok: true }) } as unknown as Response)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Envoyer' })).not.toBeDisabled()
    })
  })

  it('efface le message précédent avant une nouvelle action', async () => {
    // Première sauvegarde réussie
    mockUpdateEmailDraft.mockResolvedValueOnce({ ok: true })
    // Puis sauvegarde en erreur
    mockUpdateEmailDraft.mockResolvedValueOnce({ error: 'Deuxième erreur' })

    const user = userEvent.setup()
    render(<EmailDraftEditor {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Sauvegarder' }))
    await waitFor(() => {
      expect(screen.getByText('Brouillon sauvegardé')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Sauvegarder' }))
    await waitFor(() => {
      expect(screen.queryByText('Brouillon sauvegardé')).not.toBeInTheDocument()
      expect(screen.getByText('Deuxième erreur')).toBeInTheDocument()
    })
  })
})

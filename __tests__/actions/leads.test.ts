import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted() est exécuté avant le hoisting des vi.mock(),
// ce qui permet de partager des références entre factories et corps du test.
const {
  mockEq,
  mockUpdate,
  mockFrom,
  mockSupabaseClient,
  cookieStore,
} = vi.hoisted(() => {
  const mockEq = vi.fn()
  const mockUpdate = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn(() => ({ update: mockUpdate }))
  const mockSupabaseClient = { from: mockFrom }
  // Objet sentinelle retourné par cookies() pour vérifier le passage au client
  const cookieStore = { __sentinel: true }
  return { mockEq, mockUpdate, mockFrom, mockSupabaseClient, cookieStore }
})

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue(cookieStore),
}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(() => mockSupabaseClient),
}))

// Imports après les mocks
import { updateLeadStatus, updateEmailDraft } from '@/actions/leads'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const mockRevalidatePath = vi.mocked(revalidatePath)
const mockCreateClient = vi.mocked(createSupabaseServerClient)

describe('actions/leads', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Réinitialise la chaîne de mock après chaque clearAllMocks
    mockFrom.mockReturnValue({ update: mockUpdate })
    mockUpdate.mockReturnValue({ eq: mockEq })
    // Par défaut : succès sans erreur
    mockEq.mockResolvedValue({ error: null })
  })

  // ----------------------------------------------------------------
  // updateLeadStatus
  // ----------------------------------------------------------------

  describe('updateLeadStatus', () => {
    it('crée le client Supabase avec le cookie store retourné par cookies()', async () => {
      await updateLeadStatus('lead-1', 'contacted')
      expect(mockCreateClient).toHaveBeenCalledOnce()
      expect(mockCreateClient).toHaveBeenCalledWith(cookieStore)
    })

    it('appelle supabase.from("leads").update({ status }).eq("id", id)', async () => {
      await updateLeadStatus('lead-42', 'qualified')

      expect(mockFrom).toHaveBeenCalledWith('leads')
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'qualified' })
      expect(mockEq).toHaveBeenCalledWith('id', 'lead-42')
    })

    it('retourne { ok: true } en cas de succès', async () => {
      const result = await updateLeadStatus('lead-1', 'new')
      expect(result).toEqual({ ok: true })
    })

    it('appelle revalidatePath sur /admin/leads et /admin/leads/:id en cas de succès', async () => {
      await updateLeadStatus('lead-7', 'lost')

      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/leads')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/leads/lead-7')
      expect(mockRevalidatePath).toHaveBeenCalledTimes(2)
    })

    it('retourne { error: string } si Supabase retourne une erreur', async () => {
      mockEq.mockResolvedValue({ error: { message: 'Row not found' } })

      const result = await updateLeadStatus('lead-1', 'new')
      expect(result).toEqual({ error: 'Row not found' })
    })

    it("ne appelle pas revalidatePath en cas d'erreur Supabase", async () => {
      mockEq.mockResolvedValue({ error: { message: 'Permission denied' } })

      await updateLeadStatus('lead-1', 'contacted')
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('passe correctement chaque valeur de LeadStatus', async () => {
      const statuses = ['new', 'contacted', 'qualified', 'lost'] as const
      for (const status of statuses) {
        vi.clearAllMocks()
        mockFrom.mockReturnValue({ update: mockUpdate })
        mockUpdate.mockReturnValue({ eq: mockEq })
        mockEq.mockResolvedValue({ error: null })

        const result = await updateLeadStatus('lead-1', status)
        expect(result).toEqual({ ok: true })
        expect(mockUpdate).toHaveBeenCalledWith({ status })
      }
    })
  })

  // ----------------------------------------------------------------
  // updateEmailDraft
  // ----------------------------------------------------------------

  describe('updateEmailDraft', () => {
    it('crée le client Supabase avec le cookie store retourné par cookies()', async () => {
      await updateEmailDraft('lead-1', 'Mon brouillon')
      expect(mockCreateClient).toHaveBeenCalledOnce()
      expect(mockCreateClient).toHaveBeenCalledWith(cookieStore)
    })

    it('appelle supabase.from("leads").update({ email_draft }).eq("id", id)', async () => {
      await updateEmailDraft('lead-99', 'Contenu du brouillon')

      expect(mockFrom).toHaveBeenCalledWith('leads')
      expect(mockUpdate).toHaveBeenCalledWith({ email_draft: 'Contenu du brouillon' })
      expect(mockEq).toHaveBeenCalledWith('id', 'lead-99')
    })

    it('retourne { ok: true } en cas de succès', async () => {
      const result = await updateEmailDraft('lead-1', 'Brouillon')
      expect(result).toEqual({ ok: true })
    })

    it('appelle revalidatePath uniquement sur /admin/leads/:id en cas de succès', async () => {
      await updateEmailDraft('lead-5', 'Contenu')

      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/leads/lead-5')
      expect(mockRevalidatePath).toHaveBeenCalledTimes(1)
      // Contrairement à updateLeadStatus, /admin/leads (liste) n'est pas revalidée
      expect(mockRevalidatePath).not.toHaveBeenCalledWith('/admin/leads')
    })

    it('retourne { error: string } si Supabase retourne une erreur', async () => {
      mockEq.mockResolvedValue({ error: { message: 'Update failed' } })

      const result = await updateEmailDraft('lead-1', 'Brouillon')
      expect(result).toEqual({ error: 'Update failed' })
    })

    it("ne appelle pas revalidatePath en cas d'erreur Supabase", async () => {
      mockEq.mockResolvedValue({ error: { message: 'Unauthorized' } })

      await updateEmailDraft('lead-1', 'Brouillon')
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('accepte une chaîne vide comme brouillon valide', async () => {
      const result = await updateEmailDraft('lead-1', '')
      expect(result).toEqual({ ok: true })
      expect(mockUpdate).toHaveBeenCalledWith({ email_draft: '' })
    })
  })
})

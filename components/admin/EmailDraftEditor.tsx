'use client'

import { useState } from 'react'
import { updateEmailDraft } from '@/actions/leads'

interface EmailDraftEditorProps {
  leadId: string
  leadEmail: string
  initialDraft: string | null
}

export function EmailDraftEditor({ leadId, leadEmail, initialDraft }: EmailDraftEditorProps) {
  const [draft, setDraft] = useState(initialDraft ?? '')
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSave() {
    setMessage(null)
    setSaving(true)

    const result = await updateEmailDraft(leadId, draft)

    setSaving(false)
    if ('error' in result) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Brouillon sauvegardé' })
    }
  }

  async function handleSend() {
    setMessage(null)
    setSending(true)

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          to: leadEmail,
          subject: 'Suite à votre demande',
          body: draft,
        }),
      })

      const data = await res.json() as { ok?: boolean; error?: string }

      if (!res.ok || data.error) {
        setMessage({ type: 'error', text: data.error ?? 'Erreur lors de l\'envoi' })
      } else {
        setMessage({ type: 'success', text: 'Email envoyé — statut mis à jour' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur réseau' })
    } finally {
      setSending(false)
    }
  }

  const busy = saving || sending

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={6}
        disabled={busy}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 resize-y"
        placeholder="Rédigez votre email ici…"
      />

      {message && (
        <p className={`text-xs ${message.type === 'error' ? 'text-destructive' : 'text-green-500'}`}>
          {message.text}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={handleSave}
          disabled={busy}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50 transition-colors"
        >
          {saving ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
        <button
          onClick={handleSend}
          disabled={busy}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {sending ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>
    </div>
  )
}

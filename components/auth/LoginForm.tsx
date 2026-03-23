'use client'

import { useState } from 'react'
import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export function DemoButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDemo() {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('email', 'demo@leadflow.fr')
    formData.append('password', 'demo1234')

    const result = await login(formData)
    if (result?.error) {
      setError('Impossible de démarrer la démo. Réessaie dans un instant.')
      setLoading(false)
    }
    // Sinon le Server Action redirige vers /admin/leads
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={handleDemo}
        disabled={loading}
        size="lg"
        className="w-full gap-2"
      >
        {loading ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Démarrage en cours…
          </>
        ) : (
          'Accéder à la démo'
        )}
      </Button>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { submitLead } from '@/actions/form'
import { Button } from '@/components/ui/button'
import type { BudgetRange } from '@/types'

const SECTORS = [
  'SaaS / Logiciel',
  'Conseil & Services',
  'Santé & Médical',
  'Immobilier',
  'Commerce & Retail',
  'Industrie & BTP',
  'Finance & Assurance',
  'Restauration & Hôtellerie',
  'Marketing & Communication',
  'Autre',
]

const BUDGET_OPTIONS: { value: BudgetRange; label: string }[] = [
  { value: '<5k', label: 'Moins de 5 000 €' },
  { value: '5k-15k', label: '5 000 – 15 000 €' },
  { value: '15k-50k', label: '15 000 – 50 000 €' },
  { value: '>50k', label: 'Plus de 50 000 €' },
]

const SOURCE_OPTIONS = [
  'LinkedIn',
  'Google',
  'Recommandation',
  'Réseaux sociaux',
  'Événement',
  'Publicité',
  'Autre',
]

const inputClass =
  'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground disabled:opacity-50'

const labelClass = 'block text-sm font-medium text-foreground mb-1.5'

export function LeadForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await submitLead(new FormData(e.currentTarget))

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="py-8 text-center">
        <div className="mb-4 text-3xl">✓</div>
        <h2 className="text-lg font-semibold text-foreground">
          Demande envoyée !
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Vous recevrez un accusé de réception par email dans quelques instants.
          Notre équipe vous recontactera rapidement.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className={labelClass}>Prénom</label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            required
            placeholder="Marie"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="last_name" className={labelClass}>Nom</label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            required
            placeholder="Dupont"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email professionnel</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="marie.dupont@entreprise.fr"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="company" className={labelClass}>Société</label>
        <input
          id="company"
          name="company"
          type="text"
          required
          placeholder="Acme SAS"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="sector" className={labelClass}>Secteur d&apos;activité</label>
        <select
          id="sector"
          name="sector"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>Sélectionnez un secteur</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="main_need" className={labelClass}>Votre besoin principal</label>
        <textarea
          id="main_need"
          name="main_need"
          required
          rows={3}
          placeholder="Décrivez votre besoin en quelques lignes…"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground resize-none"
        />
      </div>

      <div>
        <label htmlFor="budget_range" className={labelClass}>Budget approximatif</label>
        <select
          id="budget_range"
          name="budget_range"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>Sélectionnez une fourchette</option>
          {BUDGET_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="source" className={labelClass}>
          Comment avez-vous entendu parler de nous ?
          <span className="ml-1 text-xs font-normal text-muted-foreground">(optionnel)</span>
        </label>
        <select
          id="source"
          name="source"
          defaultValue=""
          className={inputClass}
        >
          <option value="">— Sélectionnez une option</option>
          {SOURCE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Envoi en cours…
          </>
        ) : (
          'Envoyer ma demande'
        )}
      </Button>
    </form>
  )
}

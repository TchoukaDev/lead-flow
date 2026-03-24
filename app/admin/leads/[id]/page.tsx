import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Lead, Enrichment } from '@/types'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import { EnrichmentPanel } from '@/components/admin/EnrichmentPanel'
import { StatusSelect } from '@/components/admin/StatusSelect'
import { EmailDraftEditor } from '@/components/admin/EmailDraftEditor'

interface LeadDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params

  const cookieStore = await cookies()
  const supabase = createSupabaseServerClient(cookieStore)

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const lead: Lead = {
    ...data,
    enrichment: data.enrichment as Enrichment | null,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <Link
            href="/admin/leads"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            ← Retour
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">
              {lead.first_name} {lead.last_name}
            </h1>
            <ScoreBadge score={lead.score} />
            <StatusSelect leadId={lead.id} currentStatus={lead.status} />
          </div>
        </header>

        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Informations
          </h2>
          <div className="rounded-lg border border-border bg-card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Email</p>
              <p className="text-sm">{lead.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Société</p>
              <p className="text-sm">{lead.company}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Secteur</p>
              <p className="text-sm">{lead.sector}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Besoin principal</p>
              <p className="text-sm">{lead.main_need}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Budget</p>
              <p className="text-sm">{lead.budget_range}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Source</p>
              <p className="text-sm">{lead.source ?? '—'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground mb-0.5">Date de création</p>
              <p className="text-sm">
                {new Date(lead.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Enrichissement IA
          </h2>
          {lead.enrichment !== null ? (
            <EnrichmentPanel enrichment={lead.enrichment} />
          ) : (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                En attente d&apos;enrichissement…
              </p>
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Brouillon email
          </h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <EmailDraftEditor
              leadId={lead.id}
              leadEmail={lead.email}
              initialDraft={lead.email_draft}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

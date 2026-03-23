import { LeadForm } from '@/components/form/LeadForm'

export default function FormulairePage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-lg">

        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            LeadFlow
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Parlez-nous de votre projet
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Nous vous répondons sous 24h avec une analyse personnalisée.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <LeadForm />
        </div>

      </div>
    </main>
  )
}

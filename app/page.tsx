import { DemoButton } from '@/components/auth/LoginForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8 text-center max-w-lg w-full">
        <span className="inline-block rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground tracking-wide uppercase">
          Démo interactive
        </span>

        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Qualifiez vos leads.{' '}
            <span className="text-primary">Automatiquement.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            De la capture au premier email en moins d&apos;une minute.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {(['Scoring IA', 'Enrichissement', "Brouillons d'emails"] as const).map(
            (label) => (
              <span
                key={label}
                className="rounded-md border border-border bg-muted/50 px-3 py-1 text-sm text-muted-foreground"
              >
                {label}
              </span>
            )
          )}
        </div>

        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <DemoButton />
          <p className="text-xs text-muted-foreground">
            Aucune création de compte requise
          </p>
        </div>
      </div>
    </main>
  )
}

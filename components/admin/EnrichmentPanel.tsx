import { Enrichment } from '@/types'

interface EnrichmentPanelProps {
  enrichment: Enrichment
}

const MATURITY_STYLES: Record<Enrichment['maturity_level'], string> = {
  low: 'bg-red-500/15 text-red-400',
  medium: 'bg-yellow-500/15 text-yellow-400',
  high: 'bg-green-500/15 text-green-400',
}

const MATURITY_LABELS: Record<Enrichment['maturity_level'], string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
}

export function EnrichmentPanel({ enrichment }: EnrichmentPanelProps) {
  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium mb-2">Analyse sectorielle</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {enrichment.sector_analysis}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium mb-2">Besoins probables</h3>
        <ul className="list-disc list-inside space-y-1">
          {enrichment.probable_needs.map((need, index) => (
            <li key={index} className="text-sm text-muted-foreground">
              {need}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium mb-2">Maturité</h3>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${MATURITY_STYLES[enrichment.maturity_level]}`}
        >
          {MATURITY_LABELS[enrichment.maturity_level]}
        </span>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium mb-2">Raisonnement</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {enrichment.reasoning}
        </p>
      </div>
    </div>
  )
}

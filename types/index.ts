export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost'

export type BudgetRange = '<5k' | '5k-15k' | '15k-50k' | '>50k'

export interface Enrichment {
  sector_analysis: string
  probable_needs: string[]
  maturity_level: 'low' | 'medium' | 'high'
  reasoning: string
}

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  // Form fields
  first_name: string
  last_name: string
  email: string
  company: string
  sector: string
  main_need: string
  budget_range: BudgetRange
  source: string | null
  // AI enrichment
  score: number | null
  enrichment: Enrichment | null
  email_draft: string | null
  // Status
  status: LeadStatus
  // Meta
  is_demo: boolean
}

// Payload sent by n8n to POST /api/leads
export interface LeadWebhookPayload {
  first_name: string
  last_name: string
  email: string
  company: string
  sector: string
  main_need: string
  budget_range: BudgetRange
  source: string | null
  score: number
  enrichment: Enrichment
  email_draft: string
}

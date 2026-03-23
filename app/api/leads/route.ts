import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase/service'
import type { LeadWebhookPayload } from '@/types'
import type { Json } from '@/types/supabase'

export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.N8N_API_SECRET

  if (!secret) {
    console.warn('[api/leads] N8N_API_SECRET is not defined')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const incoming = request.headers.get('x-api-secret') ?? ''
  const incomingBuf = Buffer.from(incoming, 'utf8')
  const secretBuf = Buffer.from(secret, 'utf8')
  if (
    incomingBuf.length !== secretBuf.length ||
    !timingSafeEqual(incomingBuf, secretBuf)
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: LeadWebhookPayload

  try {
    payload = (await request.json()) as LeadWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const supabase = getServiceClient()

  const { error } = await supabase.from('leads').insert({
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    company: payload.company,
    sector: payload.sector,
    main_need: payload.main_need,
    budget_range: payload.budget_range,
    source: payload.source,
    score: payload.score,
    enrichment: payload.enrichment as unknown as Json,
    email_draft: payload.email_draft,
  })

  if (error) {
    console.error('[api/leads] Supabase insert error:', error.message)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

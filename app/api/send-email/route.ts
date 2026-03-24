import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/service'

interface SendEmailBody {
  leadId: string
  to: string
  subject: string
  body: string
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createSupabaseServerClient(cookieStore)

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: SendEmailBody
  try {
    body = await request.json() as SendEmailBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { leadId, to, subject, body: emailBody } = body

  if (!leadId || !to || !subject || !emailBody) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  // TODO: remplacer `text` par `react: <LeadContactEmail ... />` quand le template sera créé
  const { error: sendError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    text: emailBody,
  })

  if (sendError) {
    return NextResponse.json({ error: sendError.message }, { status: 500 })
  }

  const { error: updateError } = await getServiceClient()
    .from('leads')
    .update({ status: 'contacted' })
    .eq('id', leadId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${leadId}`)

  return NextResponse.json({ ok: true })
}

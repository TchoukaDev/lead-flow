'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { LeadStatus } from '@/types'

const VALID_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'lost']

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<{ ok: true } | { error: string }> {
  if (!VALID_STATUSES.includes(status)) {
    return { error: 'Invalid status' }
  }

  const cookieStore = await cookies()
  const supabase = createSupabaseServerClient(cookieStore)

  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/leads')
  revalidatePath('/admin/leads/' + id)
  return { ok: true }
}

export async function updateEmailDraft(
  id: string,
  draft: string
): Promise<{ ok: true } | { error: string }> {
  const cookieStore = await cookies()
  const supabase = createSupabaseServerClient(cookieStore)

  const { error } = await supabase
    .from('leads')
    .update({ email_draft: draft })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/leads/' + id)
  return { ok: true }
}

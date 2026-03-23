import { cookies } from 'next/headers'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Lead } from '@/types'
import { LeadsList } from '@/components/admin/LeadsList'
import TourStarter from '@/components/tour/TourStarter'

export default async function AdminLeadsPage() {
  const cookieStore = await cookies()
  const supabase = createSupabaseServerClient(cookieStore)

  const { data } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  const leads = (data as Lead[]) ?? []

  return (
    <div className="min-h-screen bg-background">
      <TourStarter />
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">LeadFlow Admin</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {leads.length} lead{leads.length !== 1 ? 's' : ''} qualifié{leads.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/formulaire"
            id="create-lead-btn"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Tester avec vos infos →
          </Link>
        </header>

        <LeadsList leads={leads} />
      </div>
    </div>
  )
}

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Client service_role : bypass RLS, usage réservé aux API Routes
// Ne jamais importer côté client

let _client: ReturnType<typeof createClient<Database>> | null = null

export function getServiceClient() {
  if (!_client) {
    _client = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return _client
}

import { createClient } from '@supabase/supabase-js'

// Service role client — server-only, bypasses RLS.
// Never import this in client components or expose to browser.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

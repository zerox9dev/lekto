import { createClient } from '@/lib/supabase/server'
import { importGoogleEvents } from '@/lib/google/importEvents'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response(null, { status: 401 })

  try {
    await importGoogleEvents(user.id)
    return new Response(null, { status: 200 })
  } catch (err) {
    console.error('Google Calendar sync error:', err)
    return new Response(null, { status: 500 })
  }
}

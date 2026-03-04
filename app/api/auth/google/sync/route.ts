import { createClient } from '@/lib/supabase/server'
import { importGoogleEvents } from '@/lib/google/importEvents'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await importGoogleEvents(user.id)
    return Response.json(result, { status: 200 })
  } catch (err) {
    console.error('Google Calendar sync error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Sync failed' },
      { status: 500 }
    )
  }
}

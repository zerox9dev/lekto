import { createClient } from '@/lib/supabase/server'
import { importGoogleEvents } from '@/lib/google/importEvents'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { manualMapping?: boolean }

    const result = await importGoogleEvents(user.id, {
      manualMapping: Boolean(body.manualMapping),
    })
    return Response.json(result, { status: 200 })
  } catch (err) {
    console.error('Google Calendar sync error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Sync failed' },
      { status: 500 }
    )
  }
}

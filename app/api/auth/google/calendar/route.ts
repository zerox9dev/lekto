import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json().catch(() => ({}))) as { calendarId?: string }
  const calendarId = body.calendarId?.trim()

  if (!calendarId) {
    return Response.json({ error: 'calendarId is required' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service
    .from('google_calendar_tokens')
    .update({
      calendar_id: calendarId,
      sync_token: null,
    })
    .eq('user_id', user.id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true }, { status: 200 })
}

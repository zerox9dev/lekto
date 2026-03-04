import { createClient } from '@/lib/supabase/server'
import { getAccessToken } from '@/lib/google/getAccessToken'

interface GoogleCalendarListResponse {
  items?: Array<{
    id: string
    summary?: string
    primary?: boolean
    accessRole?: string
  }>
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const accessToken = await getAccessToken(user.id)
    const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      return Response.json({ error: `Google API error: ${res.status}` }, { status: 500 })
    }

    const data = (await res.json()) as GoogleCalendarListResponse
    const calendars =
      data.items?.map((c) => ({
        id: c.id,
        name: c.summary ?? c.id,
        primary: Boolean(c.primary),
      })) ?? []

    return Response.json({ calendars }, { status: 200 })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to load calendars' },
      { status: 500 }
    )
  }
}

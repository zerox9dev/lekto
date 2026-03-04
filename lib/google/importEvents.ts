import { createServiceClient } from '@/lib/supabase/service'
import { getAccessToken } from './getAccessToken'

interface GoogleEvent {
  id: string
  status: string
  summary?: string
  description?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
}

interface GoogleEventsResponse {
  items?: GoogleEvent[]
  nextSyncToken?: string
}

export async function importGoogleEvents(userId: string): Promise<void> {
  const supabase = createServiceClient()
  const accessToken = await getAccessToken(userId)

  const { data: tokenRow } = await supabase
    .from('google_calendar_tokens')
    .select('calendar_id, sync_token')
    .eq('user_id', userId)
    .single()

  if (!tokenRow) throw new Error('Token row not found')

  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
    ...(tokenRow.sync_token
      ? { syncToken: tokenRow.sync_token }
      : {
          timeMin: new Date(Date.now() - 30 * 86400000).toISOString(),
          timeMax: new Date(Date.now() + 90 * 86400000).toISOString(),
        }
    ),
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(tokenRow.calendar_id)}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  // syncToken expired → full re-sync
  if (res.status === 410) {
    await supabase
      .from('google_calendar_tokens')
      .update({ sync_token: null })
      .eq('user_id', userId)
    return importGoogleEvents(userId)
  }

  if (!res.ok) throw new Error(`Google Calendar API error: ${res.status}`)

  const data = await res.json() as GoogleEventsResponse

  const { data: students } = await supabase
    .from('students')
    .select('id, name')
    .eq('tutor_id', userId)
    .eq('status', 'active')

  for (const event of data.items ?? []) {
    if (!event.start?.dateTime) continue // skip all-day events

    if (event.status === 'cancelled') {
      await supabase
        .from('lessons')
        .update({ status: 'cancelled' })
        .eq('google_event_id', event.id)
      continue
    }

    const scheduledAt = event.start.dateTime
    const endAt = event.end?.dateTime ?? scheduledAt
    const durationMin = Math.round(
      (new Date(endAt).getTime() - new Date(scheduledAt).getTime()) / 60000
    )

    const matchedStudent = students?.find((s) =>
      event.summary?.toLowerCase().includes(s.name.toLowerCase())
    ) ?? null

    await supabase.from('lessons').upsert(
      {
        google_event_id:   event.id,
        synced_from_google: true,
        tutor_id:          userId,
        student_id:        matchedStudent?.id ?? null,
        scheduled_at:      scheduledAt,
        duration_min:      durationMin,
        topic:             event.summary ?? null,
        notes:             event.description ?? null,
        status:            'planned',
        is_paid:           false,
      },
      { onConflict: 'google_event_id' }
    )
  }

  await supabase
    .from('google_calendar_tokens')
    .update({
      sync_token:    data.nextSyncToken ?? null,
      last_synced_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
}

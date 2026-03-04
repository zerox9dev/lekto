import { createServiceClient } from '@/lib/supabase/service'

// Returns a valid access token for the given tutor, refreshing if needed.
export async function getAccessToken(userId: string): Promise<string> {
  const supabase = createServiceClient()

  const { data: tokenRow, error } = await supabase
    .from('google_calendar_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single()

  if (error || !tokenRow) throw new Error('Google Calendar not connected')

  const expiresAt = new Date(tokenRow.expires_at).getTime()
  const bufferMs = 5 * 60 * 1000 // refresh 5 min before expiry

  if (Date.now() < expiresAt - bufferMs) {
    return tokenRow.access_token
  }

  // Token expired — refresh
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: tokenRow.refresh_token,
      grant_type:    'refresh_token',
    }),
  })

  if (!res.ok) throw new Error('Failed to refresh Google token')

  const data = await res.json() as { access_token: string; expires_in: number }

  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

  await supabase
    .from('google_calendar_tokens')
    .update({ access_token: data.access_token, expires_at: newExpiresAt })
    .eq('user_id', userId)

  return data.access_token
}

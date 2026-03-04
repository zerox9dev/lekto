import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { importGoogleEvents } from '@/lib/google/importEvents'
import { redirect } from 'next/navigation'

export async function GET(req: NextRequest) {
  const code  = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error || !code) redirect('/settings?gcal=error')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri:  process.env.GOOGLE_REDIRECT_URI!,
      grant_type:    'authorization_code',
    }),
  })

  if (!tokenRes.ok) redirect('/settings?gcal=error')

  const tokens = await tokenRes.json() as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  const service = createServiceClient()
  await service.from('google_calendar_tokens').upsert(
    {
      user_id:       user.id,
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at:    expiresAt,
    },
    { onConflict: 'user_id' }
  )

  // Initial import — fire and forget, don't block redirect
  importGoogleEvents(user.id).catch(console.error)

  redirect('/settings?gcal=connected')
}

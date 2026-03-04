import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id',     process.env.GOOGLE_CLIENT_ID!)
  url.searchParams.set('redirect_uri',  process.env.GOOGLE_REDIRECT_URI!)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope',         SCOPES.join(' '))
  url.searchParams.set('access_type',   'offline')
  url.searchParams.set('prompt',        'consent') // force refresh_token

  return Response.redirect(url.toString())
}

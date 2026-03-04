import { createServiceClient } from '@/lib/supabase/service'
import { importGoogleEvents } from '@/lib/google/importEvents'

export async function POST(req: Request) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(null, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: tokens } = await supabase
    .from('google_calendar_tokens')
    .select('user_id')

  if (tokens) {
    await Promise.allSettled(tokens.map((t) => importGoogleEvents(t.user_id)))
  }

  return new Response(null, { status: 200 })
}

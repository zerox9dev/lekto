import { getPortalStudentByToken } from '@/lib/student-portal'
import { createServiceClient } from '@/lib/supabase/service'

interface Body {
  body?: string
}

export async function GET(_: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params
  const student = await getPortalStudentByToken(token)
  if (!student) return Response.json({ error: 'Not found' }, { status: 404 })

  const service = createServiceClient()
  const { data } = await service
    .from('messages')
    .select('*')
    .eq('student_id', student.id)
    .order('created_at', { ascending: true })
    .limit(50)

  return Response.json({ messages: data ?? [] }, { status: 200 })
}

export async function POST(req: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params
  const student = await getPortalStudentByToken(token)
  if (!student) return Response.json({ error: 'Not found' }, { status: 404 })

  const payload = (await req.json().catch(() => ({}))) as Body
  const body = payload.body?.trim()
  if (!body) return Response.json({ error: 'Message is empty' }, { status: 400 })
  if (body.length > 2000) return Response.json({ error: 'Message too long' }, { status: 400 })

  const service = createServiceClient()
  const { error } = await service.from('messages').insert({
    student_id: student.id,
    sender_role: 'student',
    body,
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true }, { status: 200 })
}

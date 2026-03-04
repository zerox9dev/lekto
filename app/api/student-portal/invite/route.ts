import { createClient } from '@/lib/supabase/server'

interface InviteBody {
  studentId?: string
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json().catch(() => ({}))) as InviteBody
  const studentId = body.studentId?.trim()

  if (!studentId) {
    return Response.json({ error: 'studentId is required' }, { status: 400 })
  }

  const { data: student } = await supabase
    .from('students')
    .select('id, name')
    .eq('id', studentId)
    .single()

  if (!student) {
    return Response.json({ error: 'Student not found' }, { status: 404 })
  }

  const token = crypto.randomUUID()
  const inviteSentAt = new Date().toISOString()

  const { error } = await supabase
    .from('students')
    .update({
      invite_token: token,
      invite_sent_at: inviteSentAt,
      portal_active: true,
    })
    .eq('id', student.id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const origin = new URL(req.url).origin
  const inviteLink = `${origin}/portal/${token}/homework`

  return Response.json(
    {
      ok: true,
      inviteLink,
      email: null,
      studentName: student.name,
    },
    { status: 200 }
  )
}

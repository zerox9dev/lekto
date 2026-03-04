import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

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
    .select('id, email, contact, name')
    .eq('id', studentId)
    .single()

  if (!student) {
    return Response.json({ error: 'Student not found' }, { status: 404 })
  }

  const contactAsEmail =
    typeof student.contact === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.contact.trim())
      ? student.contact.trim()
      : null
  const recipientEmail = student.email ?? contactAsEmail

  if (!recipientEmail) {
    return Response.json(
      { error: 'У ученика не указан email. Добавьте email в карточке ученика.' },
      { status: 400 }
    )
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
  const inviteLink = `${origin}/join/${token}`
  const redirectTo = `${origin}/join/${token}`
  const service = createServiceClient()

  let directLoginLink: string | null = null

  // Preferred: one-click magic link that can be shared by tutor directly.
  const magicRes = await service.auth.admin.generateLink({
    type: 'magiclink',
    email: recipientEmail,
    options: { redirectTo },
  })

  if (!magicRes.error) {
    const payload = magicRes.data as unknown as {
      properties?: { action_link?: string }
      action_link?: string
    }
    directLoginLink = payload.properties?.action_link ?? payload.action_link ?? null
  }

  // Fallback for cases where user does not yet exist in auth.
  if (!directLoginLink) {
    const inviteRes = await service.auth.admin.generateLink({
      type: 'invite',
      email: recipientEmail,
      options: { redirectTo },
    })
    if (!inviteRes.error) {
      const payload = inviteRes.data as unknown as {
        properties?: { action_link?: string }
        action_link?: string
      }
      directLoginLink = payload.properties?.action_link ?? payload.action_link ?? null
    }
  }

  return Response.json(
    {
      ok: true,
      inviteLink,
      directLoginLink,
      email: recipientEmail,
      studentName: student.name,
    },
    { status: 200 }
  )
}

import { createClient } from '@/lib/supabase/server'

interface MappingPayload {
  preplyName?: string
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

  const body = (await req.json().catch(() => ({}))) as MappingPayload
  const preplyName = body.preplyName?.trim()
  const studentId = body.studentId?.trim()

  if (!preplyName || !studentId) {
    return Response.json({ error: 'preplyName and studentId are required' }, { status: 400 })
  }

  const { error } = await supabase.from('preply_student_mappings').upsert(
    {
      user_id: user.id,
      preply_name: preplyName,
      student_id: studentId,
    },
    { onConflict: 'user_id,preply_name' }
  )

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true }, { status: 200 })
}

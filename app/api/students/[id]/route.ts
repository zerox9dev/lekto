import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

const HOMEWORK_BUCKET = 'homework-files'

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id, auth_user_id')
    .eq('id', id)
    .maybeSingle()

  if (studentError) {
    return Response.json({ error: studentError.message }, { status: 500 })
  }
  if (!student) {
    return Response.json({ error: 'Ученик не найден или нет доступа' }, { status: 404 })
  }

  const service = createServiceClient()

  const { data: homeworkRows } = await service
    .from('homework')
    .select('file_url')
    .eq('student_id', id)

  const storagePaths = Array.from(
    new Set(
      (homeworkRows ?? [])
        .map((row) => row.file_url)
        .filter((path): path is string => Boolean(path))
    )
  )

  if (storagePaths.length > 0) {
    for (let i = 0; i < storagePaths.length; i += 100) {
      const chunk = storagePaths.slice(i, i + 100)
      await service.storage.from(HOMEWORK_BUCKET).remove(chunk)
    }
  }

  let shouldDeleteAuthUser = false
  if (student.auth_user_id) {
    const { count } = await service
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('auth_user_id', student.auth_user_id)
    shouldDeleteAuthUser = (count ?? 0) <= 1
  }

  const { data: deletedStudent, error: deleteError } = await service
    .from('students')
    .delete()
    .eq('id', id)
    .eq('tutor_id', user.id)
    .select('id')
    .maybeSingle()

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 })
  }
  if (!deletedStudent) {
    return Response.json({ error: 'Ученик не найден или нет доступа' }, { status: 404 })
  }

  if (student.auth_user_id && shouldDeleteAuthUser) {
    const { error: authDeleteError } = await service.auth.admin.deleteUser(student.auth_user_id)
    if (authDeleteError) {
      console.error('Student auth delete warning:', authDeleteError)
    }
  }

  return Response.json({ ok: true }, { status: 200 })
}

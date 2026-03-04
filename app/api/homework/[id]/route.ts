import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Ownership check via RLS-aware client.
  const { data: hw, error: hwError } = await supabase
    .from('homework')
    .select('id, file_url')
    .eq('id', id)
    .maybeSingle()

  if (hwError) {
    return Response.json({ error: hwError.message }, { status: 500 })
  }
  if (!hw) {
    return Response.json({ error: 'Задание не найдено или нет доступа' }, { status: 404 })
  }

  const service = createServiceClient()

  if (hw.file_url) {
    await service.storage.from('homework-files').remove([hw.file_url])
  }

  const { error: deleteError } = await service.from('homework').delete().eq('id', id)
  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 })
  }

  return Response.json({ ok: true }, { status: 200 })
}

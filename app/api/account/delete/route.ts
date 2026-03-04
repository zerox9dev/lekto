import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

const HOMEWORK_BUCKET = 'homework-files'

async function collectStoragePathsRecursively(
  service: ReturnType<typeof createServiceClient>,
  prefix: string
): Promise<string[]> {
  const bucket = service.storage.from(HOMEWORK_BUCKET)
  const toVisit: string[] = [prefix]
  const filePaths: string[] = []

  while (toVisit.length > 0) {
    const current = toVisit.pop()
    if (!current) continue

    const { data, error } = await bucket.list(current, { limit: 1000 })
    if (error || !data) continue

    for (const item of data) {
      const itemPath = `${current}/${item.name}`
      if (item.id) {
        filePaths.push(itemPath)
      } else {
        toVisit.push(itemPath)
      }
    }
  }

  return filePaths
}

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()

  try {
    const filePaths = await collectStoragePathsRecursively(service, user.id)
    if (filePaths.length > 0) {
      // Remove in chunks to avoid oversized payloads.
      for (let i = 0; i < filePaths.length; i += 100) {
        const chunk = filePaths.slice(i, i + 100)
        await service.storage.from(HOMEWORK_BUCKET).remove(chunk)
      }
    }
  } catch (err) {
    console.error('Account delete: storage cleanup failed', err)
  }

  const { error } = await service.auth.admin.deleteUser(user.id)
  if (error) {
    console.error('Account delete error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true }, { status: 200 })
}

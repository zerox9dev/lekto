import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { getPortalStudentByToken } from '@/lib/student-portal'
import type { Message } from '@/types'
import { PortalChatClient } from './PortalChatClient'

export default async function PortalChatPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const student = await getPortalStudentByToken(token)
  if (!student) notFound()

  const service = createServiceClient()
  const { data } = await service
    .from('messages')
    .select('*')
    .eq('student_id', student.id)
    .order('created_at', { ascending: true })
    .limit(50)

  return <PortalChatClient token={token} initialMessages={(data ?? []) as Message[]} />
}

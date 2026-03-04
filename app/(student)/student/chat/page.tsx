import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Message } from '@/types'
import { StudentChatClient } from './StudentChatClient'

export const metadata = { title: 'Чат — Lekto' }

export default async function StudentChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!student) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('student_id', student.id)
    .order('created_at', { ascending: true })
    .limit(50)

  return (
    <StudentChatClient
      studentId={student.id}
      initialMessages={(messages ?? []) as Message[]}
    />
  )
}

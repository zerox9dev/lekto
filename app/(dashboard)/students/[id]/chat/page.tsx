import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Message } from '@/types'
import { TutorChatClient } from './TutorChatClient'

export const metadata = { title: 'Чат с учеником — Lekto' }

export default async function StudentChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [studentRes, messagesRes] = await Promise.all([
    supabase.from('students').select('id, name').eq('id', id).single(),
    supabase
      .from('messages')
      .select('*')
      .eq('student_id', id)
      .order('created_at', { ascending: true })
      .limit(50),
  ])

  if (!studentRes.data) notFound()
  const student = studentRes.data

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-4">
        <Link
          href={`/students/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {student.name}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Чат</h1>
      </div>

      <TutorChatClient studentId={student.id} initialMessages={(messagesRes.data ?? []) as Message[]} />
    </div>
  )
}

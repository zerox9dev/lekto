import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils/format'
import type { Homework } from '@/types'
import { StudentHomeworkActions } from './StudentHomeworkActions'

export default async function StudentHomeworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  const { data: hw } = await supabase
    .from('homework')
    .select('*')
    .eq('id', id)
    .eq('student_id', student.id)
    .single()

  if (!hw) notFound()

  const homework = hw as Homework

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link href="/student/homework" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Назад к списку
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-gray-900">Домашнее задание</h1>
          <StatusBadge status={homework.status} />
        </div>

        <p className="text-sm text-gray-700 whitespace-pre-wrap">{homework.description}</p>

        <div className="text-sm text-gray-500">
          Дедлайн: {homework.deadline ? formatDate(homework.deadline) : 'без срока'}
        </div>

        {homework.teacher_comment && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Комментарий преподавателя</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{homework.teacher_comment}</p>
          </div>
        )}

        <StudentHomeworkActions homeworkId={homework.id} status={homework.status} />
      </div>
    </div>
  )
}

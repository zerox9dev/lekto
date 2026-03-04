import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { getPortalStudentByToken } from '@/lib/student-portal'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils/format'
import type { Homework, Lesson } from '@/types'

type StudentHomework = Homework & {
  lessons?: Pick<Lesson, 'id' | 'topic' | 'scheduled_at'> | null
}

export default async function PortalHomeworkPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const student = await getPortalStudentByToken(token)
  if (!student) notFound()

  const service = createServiceClient()
  const { data: homework } = await service
    .from('homework')
    .select('*, lessons(id, topic, scheduled_at)')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })

  const items = (homework ?? []) as StudentHomework[]

  if (items.length === 0) {
    return (
      <div className="pt-2">
        <EmptyState
          icon={<BookOpen className="w-5 h-5 text-gray-400" />}
          title="Пока нет домашних заданий"
          description="Когда преподаватель добавит задание, оно появится здесь."
        />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Описание</th>
            <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Срок</th>
            <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Статус</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((hw) => (
            <tr key={hw.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3">
                <Link href={`/portal/${token}/homework/${hw.id}`} className="text-gray-700 hover:text-gray-900">
                  {hw.description}
                </Link>
                {hw.lessons?.topic && (
                  <p className="text-xs text-gray-400 mt-0.5">{hw.lessons.topic}</p>
                )}
              </td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-500">
                {hw.deadline ? formatDate(hw.deadline) : <span className="text-gray-300">—</span>}
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={hw.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

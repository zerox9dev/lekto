import { notFound } from 'next/navigation'
import { CalendarDays } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { getPortalStudentByToken } from '@/lib/student-portal'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDateTime, formatDuration } from '@/lib/utils/format'
import type { Lesson } from '@/types'

export default async function PortalLessonsPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const student = await getPortalStudentByToken(token)
  if (!student) notFound()

  const service = createServiceClient()
  const { data: lessons } = await service
    .from('lessons')
    .select('*')
    .eq('student_id', student.id)
    .order('scheduled_at', { ascending: false })

  const items = (lessons ?? []) as Lesson[]
  if (items.length === 0) {
    return (
      <div className="pt-2">
        <EmptyState
          icon={<CalendarDays className="w-5 h-5 text-gray-400" />}
          title="Уроков пока нет"
          description="Когда преподаватель добавит урок, он появится здесь."
        />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Дата</th>
            <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Тема</th>
            <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Длит.</th>
            <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Статус</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((lesson) => (
            <tr key={lesson.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3 whitespace-nowrap text-gray-700">{formatDateTime(lesson.scheduled_at)}</td>
              <td className="px-5 py-3 text-gray-700">{lesson.topic ?? <span className="text-gray-300">—</span>}</td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-500">{formatDuration(lesson.duration_min)}</td>
              <td className="px-5 py-3">
                <StatusBadge status={lesson.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

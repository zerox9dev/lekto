import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AttachStudentButton } from './AttachStudentButton'
import { formatRelativeDay, formatDuration } from '@/lib/utils/format'
import type { Lesson, Student } from '@/types'

type LessonWithStudent = Lesson & {
  students?: Pick<Student, 'id' | 'name' | 'level'>
}

interface LessonRowProps {
  lesson: LessonWithStudent
  showStudent?: boolean
  students?: Pick<Student, 'id' | 'name'>[]
}

export function LessonRow({ lesson, showStudent = true, students }: LessonRowProps) {
  const date = new Date(lesson.scheduled_at)
  const time = date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
  const isCancelled = lesson.status === 'cancelled'
  const isGoogle = lesson.synced_from_google

  return (
    <tr className={`hover:bg-gray-50/50 transition-colors ${isCancelled ? 'opacity-50' : ''}`}>
      <td className="py-3 pr-4 whitespace-nowrap">
        <Link href={`/lessons/${lesson.id}`} className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1.5">
          {isGoogle && (
            <span className="text-[10px] font-semibold text-blue-500 border border-blue-200 rounded px-1 py-0.5 leading-none">G</span>
          )}
          <span className="font-medium">{formatRelativeDay(lesson.scheduled_at)}</span>
          <span className="text-gray-400">{time}</span>
        </Link>
      </td>

      {showStudent && (
        <td className="py-3 pr-4">
          {isGoogle && !lesson.student_id && students ? (
            <AttachStudentButton lessonId={lesson.id} students={students} />
          ) : (
            <Link href={`/lessons/${lesson.id}`} className="text-sm text-gray-700 hover:text-gray-900">
              {lesson.students?.name ?? '—'}
              {lesson.students?.level && (
                <span className="text-xs text-gray-400 ml-1.5">{lesson.students.level}</span>
              )}
            </Link>
          )}
        </td>
      )}

      <td className="py-3 pr-4">
        <Link href={`/lessons/${lesson.id}`} className="text-sm text-gray-500 hover:text-gray-700 line-clamp-1">
          {lesson.topic || <span className="text-gray-300">—</span>}
        </Link>
      </td>

      <td className="py-3 pr-4 text-sm text-gray-400 whitespace-nowrap">
        {formatDuration(lesson.duration_min)}
      </td>

      <td className="py-3 pr-4">
        <StatusBadge status={lesson.status} />
      </td>

      <td className="py-3 text-center">
        {lesson.is_paid ? (
          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>
    </tr>
  )
}

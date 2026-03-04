import type { LessonStatus, HomeworkStatus, StudentStatus } from '@/types'

type Status = LessonStatus | HomeworkStatus | StudentStatus

const config: Record<Status, { label: string; className: string }> = {
  // Lesson
  planned:   { label: 'Запланирован', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  done:      { label: 'Проведён',     className: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'Отменён',      className: 'bg-gray-100 text-gray-500 border-gray-200' },
  // Homework
  assigned:  { label: 'Задано',       className: 'bg-blue-50 text-blue-700 border-blue-200' },
  submitted: { label: 'Сдано',        className: 'bg-amber-50 text-amber-700 border-amber-200' },
  reviewed:  { label: 'Проверено',    className: 'bg-green-50 text-green-700 border-green-200' },
  // Student
  active:    { label: 'Активен',      className: 'bg-green-50 text-green-700 border-green-200' },
  archived:  { label: 'Архив',        className: 'bg-gray-100 text-gray-400 border-gray-100' },
}

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = config[status]
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}

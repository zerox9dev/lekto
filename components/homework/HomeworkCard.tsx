import Link from 'next/link'
import { Paperclip, AlertTriangle } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatTimeAgo } from '@/lib/utils/format'
import type { Homework, Student } from '@/types'

type HomeworkWithStudent = Homework & {
  students?: Pick<Student, 'id' | 'name' | 'level'>
}

interface HomeworkCardProps {
  homework: HomeworkWithStudent
  overdue?: boolean
}

export function HomeworkCard({ homework, overdue = false }: HomeworkCardProps) {
  return (
    <Link
      href={`/homework/${homework.id}`}
      className={[
        'block bg-white rounded-xl border p-4 hover:shadow-sm transition-all',
        overdue
          ? 'border-l-4 border-l-red-400 border-t-gray-200 border-r-gray-200 border-b-gray-200 hover:border-l-red-500'
          : homework.status === 'submitted'
          ? 'border-amber-200 hover:border-amber-300'
          : homework.status === 'reviewed'
          ? 'border-gray-100 opacity-70'
          : 'border-gray-200 hover:border-gray-300',
      ].join(' ')}
    >
      {/* Header: student + status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-900 truncate">
              {homework.students?.name ?? '—'}
            </span>
            {homework.students?.level && (
              <span className="text-xs text-gray-400 shrink-0">
                {homework.students.level}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {homework.file_url && (
            <Paperclip className="w-3.5 h-3.5 text-gray-400" />
          )}
          <StatusBadge status={homework.status} />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{homework.description}</p>

      {/* Deadline */}
      {homework.deadline && (
        <div className={`flex items-center gap-1.5 text-xs ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
          {overdue && <AlertTriangle className="w-3.5 h-3.5" />}
          {overdue
            ? `Просрочено ${formatTimeAgo(homework.deadline)}`
            : `до ${formatDate(homework.deadline)}`}
        </div>
      )}
    </Link>
  )
}

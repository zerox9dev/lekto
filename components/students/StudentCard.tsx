import Link from 'next/link'
import { MessageCircle, BookOpen, GraduationCap } from 'lucide-react'
import type { Student } from '@/types'

interface StudentCardProps {
  student: Student & { lesson_count?: number; active_hw_count?: number }
  currency: string
}

const levelColors: Record<string, string> = {
  A1: 'bg-green-50 text-green-700',
  A2: 'bg-green-50 text-green-700',
  B1: 'bg-blue-50 text-blue-700',
  B2: 'bg-blue-50 text-blue-700',
  C1: 'bg-purple-50 text-purple-700',
  C2: 'bg-purple-50 text-purple-700',
}

export function StudentCard({ student, currency }: StudentCardProps) {
  return (
    <Link
      href={`/students/${student.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug">{student.name}</h3>
        {student.level && (
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ml-2 shrink-0 ${
              levelColors[student.level] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {student.level}
          </span>
        )}
      </div>

      {/* Contact */}
      {student.contact && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 truncate">
          <MessageCircle className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{student.contact}</span>
        </div>
      )}

      {/* Price */}
      {student.price_per_hour != null && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <GraduationCap className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span>
            {new Intl.NumberFormat('ru-RU', { style: 'currency', currency, minimumFractionDigits: 0 }).format(
              student.price_per_hour
            )}
            /ч
          </span>
        </div>
      )}

      {/* Footer counts */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
        {student.lesson_count !== undefined && (
          <span className="text-xs text-gray-400">
            {student.lesson_count} {pluralLesson(student.lesson_count)}
          </span>
        )}
        {(student.active_hw_count ?? 0) > 0 && (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <BookOpen className="w-3 h-3" />
            {student.active_hw_count} ДЗ активных
          </span>
        )}
      </div>
    </Link>
  )
}

function pluralLesson(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 19) return 'уроков'
  if (n % 10 === 1) return 'урок'
  if (n % 10 >= 2 && n % 10 <= 4) return 'урока'
  return 'уроков'
}

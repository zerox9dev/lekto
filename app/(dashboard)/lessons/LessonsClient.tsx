'use client'

import { useState, useMemo } from 'react'
import { LessonRow } from '@/components/lessons/LessonRow'
import { EmptyState } from '@/components/shared/EmptyState'
import { SelectField } from '@/components/ui/SelectField'
import { CalendarDays } from 'lucide-react'
import type { Lesson, Student } from '@/types'

type LessonWithStudent = Lesson & {
  students?: Pick<Student, 'id' | 'name' | 'level'>
}

interface LessonsClientProps {
  lessons: LessonWithStudent[]
  students: Pick<Student, 'id' | 'name'>[]
}

const STATUS_FILTER = [
  { value: 'all',       label: 'Все статусы' },
  { value: 'planned',   label: 'Запланирован' },
  { value: 'done',      label: 'Проведён' },
  { value: 'cancelled', label: 'Отменён' },
]

export function LessonsClient({ lessons, students }: LessonsClientProps) {
  const [studentFilter, setStudentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const studentOptions = [
    { value: 'all', label: 'Все ученики' },
    ...students.map((s) => ({ value: s.id, label: s.name })),
  ]

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      const matchStudent = studentFilter === 'all' || l.student_id === studentFilter
      const matchStatus = statusFilter === 'all' || l.status === statusFilter
      return matchStudent && matchStatus
    })
  }, [lessons, studentFilter, statusFilter])

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-48">
          <SelectField
            value={studentFilter}
            onValueChange={setStudentFilter}
            options={studentOptions}
          />
        </div>
        <div className="w-44">
          <SelectField
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={STATUS_FILTER}
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-5 h-5 text-gray-400" />}
          title="Нет уроков"
          description="Попробуйте изменить фильтры или создайте новый урок"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Дата</th>
                <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Ученик</th>
                <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Тема</th>
                <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Длит.</th>
                <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Статус</th>
                <th className="px-5 pb-3 pt-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wide">Опл.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 [&_td]:px-5 [&_th]:px-5">
              {filtered.map((lesson) => (
                <LessonRow key={lesson.id} lesson={lesson} showStudent={true} students={students} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

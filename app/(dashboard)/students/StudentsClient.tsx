'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { StudentCard } from '@/components/students/StudentCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Users } from 'lucide-react'
import type { Student } from '@/types'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STATUS_OPTIONS = [
  { value: 'active',    label: 'Активные' },
  { value: 'archived',  label: 'Архив' },
  { value: 'all',       label: 'Все' },
]

interface StudentsClientProps {
  students: (Student & { lesson_count?: number; active_hw_count?: number })[]
  currency: string
}

export function StudentsClient({ students, currency }: StudentsClientProps) {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('all')
  const [status, setStatus] = useState('active')

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchName = s.name.toLowerCase().includes(search.toLowerCase())
      const matchLevel = level === 'all' || s.level === level
      const matchStatus = status === 'all' || s.status === status
      return matchName && matchLevel && matchStatus
    })
  }, [students, search, level, status])

  const hasStudents = students.length > 0

  return (
    <div>
      {/* Filters */}
      {hasStudents && (
        <div className="flex items-center gap-2 mb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск по имени..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/15 focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Level filter */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLevel('all')}
              className={filterPill(level === 'all')}
            >
              Все уровни
            </button>
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(level === l ? 'all' : l)}
                className={filterPill(level === l)}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 ml-auto">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={filterPill(status === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        hasStudents ? (
          <EmptyState
            title="Нет учеников по выбранным фильтрам"
            description="Попробуйте изменить критерии поиска"
          />
        ) : (
          <EmptyState
            icon={<Users className="w-5 h-5 text-gray-400" />}
            title="Нет учеников"
            description="Добавьте первого ученика"
          />
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((student) => (
            <StudentCard key={student.id} student={student} currency={currency} />
          ))}
        </div>
      )}
    </div>
  )
}

function filterPill(active: boolean) {
  return [
    'h-7 px-2.5 rounded-md text-xs font-medium transition-colors',
    active
      ? 'bg-gray-900 text-white'
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
  ].join(' ')
}

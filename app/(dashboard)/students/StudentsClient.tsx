'use client'

import { useState, useMemo } from 'react'
import { Search, Users, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Student } from '@/types'

const levelColors: Record<string, string> = {
  A1: 'bg-green-50 text-green-700',
  A2: 'bg-green-50 text-green-700',
  B1: 'bg-blue-50 text-blue-700',
  B2: 'bg-blue-50 text-blue-700',
  C1: 'bg-purple-50 text-purple-700',
  C2: 'bg-purple-50 text-purple-700',
}

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

      {/* Table */}
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Имя</th>
                <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Контакт</th>
                <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Цена/ч</th>
                <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Уроков</th>
                <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">ДЗ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((student) => (
                <tr key={student.id} className={`hover:bg-gray-50/50 transition-colors ${student.status === 'archived' ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3">
                    <Link href={`/students/${student.id}`} className="flex items-center gap-2 hover:text-brand-600 transition-colors">
                      <span className="font-medium text-gray-900">{student.name}</span>
                      {student.level && (
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ${levelColors[student.level] ?? 'bg-gray-100 text-gray-600'}`}>
                          {student.level}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-500 max-w-[180px] truncate">
                    {student.contact || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-700 whitespace-nowrap">
                    {student.price_per_hour != null
                      ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency, minimumFractionDigits: 0 }).format(student.price_per_hour)
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {student.lesson_count ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    {(student.active_hw_count ?? 0) > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <BookOpen className="w-3 h-3" />
                        {student.active_hw_count}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

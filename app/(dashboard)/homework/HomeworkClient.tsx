'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, BookOpen } from 'lucide-react'
import { HomeworkCard } from '@/components/homework/HomeworkCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { SelectField } from '@/components/ui/SelectField'
import { Button } from '@/components/ui/Button'
import type { Homework, Student } from '@/types'

type HomeworkWithStudent = Homework & {
  students?: Pick<Student, 'id' | 'name' | 'level'>
}

interface HomeworkClientProps {
  homework: HomeworkWithStudent[]
  students: Pick<Student, 'id' | 'name'>[]
}

const STATUS_FILTER = [
  { value: 'all',       label: 'Все статусы' },
  { value: 'assigned',  label: 'Задано' },
  { value: 'submitted', label: 'Сдано' },
  { value: 'reviewed',  label: 'Проверено' },
]

function isOverdue(hw: HomeworkWithStudent): boolean {
  if (hw.status !== 'assigned' || !hw.deadline) return false
  return new Date(hw.deadline) < new Date(new Date().toDateString())
}

export function HomeworkClient({ homework, students }: HomeworkClientProps) {
  const [studentFilter, setStudentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const studentOptions = [
    { value: 'all', label: 'Все ученики' },
    ...students.map((s) => ({ value: s.id, label: s.name })),
  ]

  const filtered = useMemo(() => {
    return homework.filter((hw) => {
      const matchStudent = studentFilter === 'all' || hw.student_id === studentFilter
      const matchStatus = statusFilter === 'all' || hw.status === statusFilter
      return matchStudent && matchStatus
    })
  }, [homework, studentFilter, statusFilter])

  // Группировка
  const overdue   = filtered.filter((hw) => isOverdue(hw))
  const active    = filtered.filter((hw) => hw.status === 'assigned' && !isOverdue(hw))
  const submitted = filtered.filter((hw) => hw.status === 'submitted')
  const reviewed  = filtered.filter((hw) => hw.status === 'reviewed')

  const total = filtered.length

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
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

      {total === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-5 h-5 text-gray-400" />}
          title="Нет домашних заданий"
          description="Добавьте первое задание ученику"
          action={
            <Button asChild variant="primary" size="sm">
              <Link href="/homework/new">
                <Plus className="w-4 h-4" />
                Добавить ДЗ
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          <HwSection title="Просрочено" items={overdue} overdue />
          <HwSection title="Активные" items={active} />
          <HwSection title="Сдано — ожидает проверки" items={submitted} />
          <ReviewedSection items={reviewed} />
        </div>
      )}
    </div>
  )
}

function HwSection({
  title,
  items,
  overdue = false,
}: {
  title: string
  items: HomeworkWithStudent[]
  overdue?: boolean
}) {
  if (items.length === 0) return null

  return (
    <section>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
        {title}
        <span className="text-gray-300 font-normal normal-case tracking-normal">
          {items.length}
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((hw) => (
          <HomeworkCard key={hw.id} homework={hw} overdue={overdue} />
        ))}
      </div>
    </section>
  )
}

function ReviewedSection({ items }: { items: HomeworkWithStudent[] }) {
  if (items.length === 0) return null

  return (
    <details>
      <summary className="text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer select-none hover:text-gray-600 transition-colors mb-3 flex items-center gap-2">
        Проверено ({items.length})
      </summary>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
        {items.map((hw) => (
          <HomeworkCard key={hw.id} homework={hw} />
        ))}
      </div>
    </details>
  )
}

'use client'

import { useState, useMemo, Fragment } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, BookOpen, Paperclip, AlertTriangle } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { SelectField } from '@/components/ui/SelectField'
import { InlineStatusSelect } from '@/components/shared/InlineStatusSelect'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { stripRichText } from '@/components/ui/MarkdownContent'
import { formatDate, formatTimeAgo } from '@/lib/utils/format'
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

const HOMEWORK_STATUS_OPTIONS = [
  { value: 'assigned', label: 'Задано' },
  { value: 'submitted', label: 'Сдано' },
  { value: 'reviewed', label: 'Проверено' },
] as const

function isOverdue(hw: HomeworkWithStudent): boolean {
  if (hw.status !== 'assigned' || !hw.deadline) return false
  return new Date(hw.deadline) < new Date(new Date().toDateString())
}

function getHomeworkPreview(description: string): string {
  const firstMeaningfulLine =
    description
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0 && !/^[-|:\s]+$/.test(line)) ?? description

  const normalized = stripRichText(firstMeaningfulLine)
    .replace(/\|+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalized) return '—'
  return normalized.length > 110 ? `${normalized.slice(0, 107)}...` : normalized
}

export function HomeworkClient({ homework, students }: HomeworkClientProps) {
  const router = useRouter()
  const [studentFilter, setStudentFilter] = useState('all')
  const [statusFilter, setStatusFilter]   = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const studentOptions = [
    { value: 'all', label: 'Все ученики' },
    ...students.map((s) => ({ value: s.id, label: s.name })),
  ]

  const filtered = useMemo(() => {
    return homework.filter((hw) => {
      const matchStudent = studentFilter === 'all' || hw.student_id === studentFilter
      const matchStatus  = statusFilter === 'all' || hw.status === statusFilter
      return matchStudent && matchStatus
    })
  }, [homework, studentFilter, statusFilter])

  const overdue   = filtered.filter((hw) => isOverdue(hw))
  const active    = filtered.filter((hw) => hw.status === 'assigned' && !isOverdue(hw))
  const submitted = filtered.filter((hw) => hw.status === 'submitted')
  const reviewed  = filtered.filter((hw) => hw.status === 'reviewed')

  async function handleDeleteHomework(homeworkId: string) {
    setDeletingId(homeworkId)
    const res = await fetch(`/api/homework/${homeworkId}`, { method: 'DELETE' })
    setDeletingId(null)

    if (!res.ok) {
      const payload = (await res.json().catch(() => ({ error: 'Не удалось удалить задание' }))) as {
        error?: string
      }
      toast.error(payload.error ?? 'Не удалось удалить задание')
      return
    }

    toast.success('Задание удалено')
    router.refresh()
  }

  const visibleGroups = [
    ...(overdue.length   ? [{ label: 'Просрочено',              items: overdue,   overdueGroup: true  }] : []),
    ...(active.length    ? [{ label: 'Активные',                items: active,    overdueGroup: false }] : []),
    ...(submitted.length ? [{ label: 'Сдано — ждёт проверки',   items: submitted, overdueGroup: false }] : []),
  ]

  if (filtered.length === 0) {
    return (
      <div>
        <Filters
          studentFilter={studentFilter} setStudentFilter={setStudentFilter}
          statusFilter={statusFilter}   setStatusFilter={setStatusFilter}
          studentOptions={studentOptions}
        />
        <EmptyState
          icon={<BookOpen className="w-5 h-5 text-gray-400" />}
          title="Нет домашних заданий"
          description="Добавьте первое задание ученику"
          action={
            <Button asChild variant="primary" size="sm">
              <Link href="/homework/new"><Plus className="w-4 h-4" />Добавить ДЗ</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <Filters
        studentFilter={studentFilter} setStudentFilter={setStudentFilter}
        statusFilter={statusFilter}   setStatusFilter={setStatusFilter}
        studentOptions={studentOptions}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Название</th>
              <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Ученик</th>
              <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Дедлайн</th>
              <th className="px-5 pb-3 pt-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Статус</th>
              <th className="px-5 pb-3 pt-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wide w-10">Файл</th>
              <th className="px-5 pb-3 pt-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visibleGroups.map(({ label, items, overdueGroup }) => (
              <Fragment key={label}>
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {label} · {items.length}
                  </td>
                </tr>
                {items.map((hw) => (
                  <HwRow
                    key={hw.id}
                    hw={hw}
                    overdue={overdueGroup}
                    deleting={deletingId === hw.id}
                    onDelete={handleDeleteHomework}
                  />
                ))}
              </Fragment>
            ))}

            {reviewed.length > 0 && (
              <ReviewedRows
                items={reviewed}
                deletingId={deletingId}
                onDelete={handleDeleteHomework}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function HwRow({
  hw,
  overdue,
  deleting = false,
  onDelete,
}: {
  hw: HomeworkWithStudent
  overdue?: boolean
  deleting?: boolean
  onDelete: (homeworkId: string) => Promise<void> | void
}) {
  const preview = getHomeworkPreview(hw.description)
  return (
    <tr className={`hover:bg-gray-50/50 transition-colors ${hw.status === 'reviewed' ? 'opacity-60' : ''}`}>
      <td className="px-5 py-3 max-w-[520px]">
        <Link href={`/homework/${hw.id}`} className="text-gray-700 hover:text-gray-900 block truncate">
          {preview}
        </Link>
      </td>
      <td className="px-5 py-3 whitespace-nowrap">
        <Link href={`/homework/${hw.id}`} className="text-gray-700 hover:text-gray-900">
          {hw.students?.name ?? '—'}
          {hw.students?.level && (
            <span className="text-xs text-gray-400 ml-1.5">{hw.students.level}</span>
          )}
        </Link>
      </td>
      <td className="px-5 py-3 whitespace-nowrap">
        {hw.deadline ? (
          <span className={`text-sm flex items-center gap-1 ${overdue ? 'text-red-500' : 'text-gray-500'}`}>
            {overdue && <AlertTriangle className="w-3.5 h-3.5" />}
            {overdue ? formatTimeAgo(hw.deadline) : formatDate(hw.deadline)}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="px-5 py-3">
        <InlineStatusSelect
          table="homework"
          rowId={hw.id}
          value={hw.status}
          options={HOMEWORK_STATUS_OPTIONS}
        />
      </td>
      <td className="px-5 py-3 text-center">
        {hw.file_url
          ? <Paperclip className="w-3.5 h-3.5 text-gray-400 mx-auto" />
          : <span className="text-gray-300">—</span>
        }
      </td>
      <td className="px-5 py-3 text-right">
        <ConfirmDialog
          trigger={<Button variant="destructive" size="sm">Удалить</Button>}
          title="Удалить задание?"
          description="Это действие нельзя отменить."
          confirmLabel="Удалить"
          variant="destructive"
          loading={deleting}
          onConfirm={() => {
            void onDelete(hw.id)
          }}
        />
      </td>
    </tr>
  )
}

function ReviewedRows({
  items,
  deletingId,
  onDelete,
}: {
  items: HomeworkWithStudent[]
  deletingId: string | null
  onDelete: (homeworkId: string) => Promise<void> | void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr>
        <td
          colSpan={6}
          className="px-5 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide select-none">
            {open ? '▾' : '▸'} Проверено · {items.length}
          </span>
        </td>
      </tr>
      {open && items.map((hw) => (
        <HwRow
          key={hw.id}
          hw={hw}
          deleting={deletingId === hw.id}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}

function Filters({
  studentFilter, setStudentFilter,
  statusFilter, setStatusFilter,
  studentOptions,
}: {
  studentFilter: string
  setStudentFilter: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  studentOptions: { value: string; label: string }[]
}) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div className="w-48">
        <SelectField value={studentFilter} onValueChange={setStudentFilter} options={studentOptions} />
      </div>
      <div className="w-44">
        <SelectField value={statusFilter} onValueChange={setStatusFilter} options={STATUS_FILTER} />
      </div>
    </div>
  )
}

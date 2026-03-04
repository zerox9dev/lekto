import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { HomeworkDetailClient } from './HomeworkDetailClient'
import { formatDate, formatDateTime } from '@/lib/utils/format'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('homework')
    .select('description, students(name)')
    .eq('id', id)
    .single()
  if (!data) return { title: 'Задание — Lekto' }
  const student = Array.isArray(data.students) ? data.students[0] : data.students
  return { title: `ДЗ: ${student?.name ?? ''} — Lekto` }
}

export default async function HomeworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: hw } = await supabase
    .from('homework')
    .select('*, students(id, name, level), lessons(id, topic, scheduled_at)')
    .eq('id', id)
    .single()

  if (!hw) notFound()

  const student = Array.isArray(hw.students) ? hw.students[0] : hw.students
  const lesson  = Array.isArray(hw.lessons)  ? hw.lessons[0]  : hw.lessons

  const isOverdue =
    hw.status === 'assigned' &&
    hw.deadline != null &&
    new Date(hw.deadline) < new Date(new Date().toDateString())

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/homework"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            ДЗ
          </Link>
          <span className="text-gray-300 shrink-0">/</span>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight truncate">
            {student?.name ?? '—'} · {hw.description.slice(0, 40)}{hw.description.length > 40 ? '…' : ''}
          </h1>
        </div>
        <Button asChild variant="secondary" size="sm" className="shrink-0 ml-3">
          <Link href={`/homework/${id}/edit`}>Редактировать</Link>
        </Button>
      </div>

      {/* Overdue banner */}
      {isOverdue && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Задание просрочено — дедлайн был {formatDate(hw.deadline!)}
        </div>
      )}

      {/* Info card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 grid grid-cols-2 gap-x-8 gap-y-3">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Ученик</p>
          <Link
            href={`/students/${student?.id}`}
            className="text-sm text-gray-900 hover:text-brand-600 transition-colors"
          >
            {student?.name}
            {student?.level && (
              <span className="text-xs text-gray-400 ml-1.5">{student.level}</span>
            )}
          </Link>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Статус</p>
          <StatusBadge status={hw.status} />
        </div>

        {lesson && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Урок</p>
            <Link
              href={`/lessons/${lesson.id}`}
              className="text-sm text-gray-700 hover:text-brand-600 transition-colors"
            >
              {formatDateTime(lesson.scheduled_at)}
              {lesson.topic ? ` — ${lesson.topic}` : ''}
            </Link>
          </div>
        )}

        {hw.deadline && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Дедлайн</p>
            <p className={`text-sm ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-700'}`}>
              {formatDate(hw.deadline)}
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Описание задания</h3>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{hw.description}</p>
      </div>

      {/* Interactive: status, file, comment, delete */}
      <HomeworkDetailClient
        homeworkId={id}
        initialStatus={hw.status}
        initialComment={hw.teacher_comment}
        fileUrl={hw.file_url}
      />
    </div>
  )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LessonDetailClient } from './LessonDetailClient'
import { formatDateTime, formatDuration, formatCurrency } from '@/lib/utils/format'
import type { Homework } from '@/types'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('lessons')
    .select('scheduled_at, students(name)')
    .eq('id', id)
    .single()
  if (!data) return { title: 'Урок — Lekto' }
  const student = Array.isArray(data.students) ? data.students[0] : data.students
  return { title: `Урок: ${student?.name ?? ''} — Lekto` }
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [lessonResult, homeworkResult, settingsResult] = await Promise.all([
    supabase
      .from('lessons')
      .select('*, students(id, name, level, price_per_hour)')
      .eq('id', id)
      .single(),
    supabase
      .from('homework')
      .select('*')
      .eq('lesson_id', id)
      .order('created_at'),
    supabase.from('tutor_settings').select('currency').single(),
  ])

  if (!lessonResult.data) notFound()

  const lesson = lessonResult.data
  const homework = (homeworkResult.data ?? []) as Homework[]
  const currency = settingsResult.data?.currency ?? 'USD'
  const student = Array.isArray(lesson.students) ? lesson.students[0] : lesson.students

  // Расчёт стоимости урока
  const lessonPrice =
    student?.price_per_hour != null
      ? student.price_per_hour * (lesson.duration_min / 60)
      : null

  const isCancelled = lesson.status === 'cancelled'

  return (
    <div className={`max-w-2xl ${isCancelled ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/lessons"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Уроки
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            {student?.name ?? 'Урок'} · {formatDateTime(lesson.scheduled_at)}
          </h1>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/lessons/${id}/edit`}>Редактировать</Link>
        </Button>
      </div>

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
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Дата и время</p>
          <p className="text-sm text-gray-700">{formatDateTime(lesson.scheduled_at)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Длительность</p>
          <p className="text-sm text-gray-700">{formatDuration(lesson.duration_min)}</p>
        </div>
        {lessonPrice != null && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Стоимость</p>
            <p className="text-sm text-gray-700">{formatCurrency(lessonPrice, currency)}</p>
          </div>
        )}
        {lesson.topic && (
          <div className="col-span-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Тема</p>
            <p className="text-sm text-gray-700">{lesson.topic}</p>
          </div>
        )}
      </div>

      {/* Inline editable: status, payment, notes */}
      <LessonDetailClient
        lessonId={id}
        initialStatus={lesson.status}
        initialIsPaid={lesson.is_paid}
        initialNotes={lesson.notes}
      />

      {/* Homework */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Домашние задания</h3>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/homework/new?lessonId=${id}&studentId=${student?.id ?? ''}`}>
              <Plus className="w-3.5 h-3.5" />
              Добавить ДЗ
            </Link>
          </Button>
        </div>

        {homework.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Нет домашних заданий</p>
        ) : (
          <div className="space-y-2">
            {homework.map((hw) => (
              <Link
                key={hw.id}
                href={`/homework/${hw.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-700 line-clamp-1">{hw.description}</p>
                <StatusBadge status={hw.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

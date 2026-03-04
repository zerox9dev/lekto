import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Plus, MessageCircle, GraduationCap, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { StudentDetailClient } from './StudentDetailClient'
import { StudentInviteButton } from './StudentInviteButton'
import { formatCurrency, formatDateTime, formatRelativeDay } from '@/lib/utils/format'
import type { Lesson, Homework } from '@/types'

function isEmail(value?: string | null): boolean {
  if (!value) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('students').select('name').eq('id', id).single()
  return { title: data ? `${data.name} — Lekto` : 'Ученик — Lekto' }
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [studentResult, lessonsResult, homeworkResult, settingsResult] = await Promise.all([
    supabase.from('students').select('*, subjects(*)').eq('id', id).single(),
    supabase
      .from('lessons')
      .select('*')
      .eq('student_id', id)
      .order('scheduled_at', { ascending: false })
      .limit(20),
    supabase
      .from('homework')
      .select('*')
      .eq('student_id', id)
      .order('created_at', { ascending: false }),
    supabase.from('tutor_settings').select('currency').single(),
  ])

  if (!studentResult.data) notFound()

  const student = studentResult.data
  const lessons = (lessonsResult.data ?? []) as Lesson[]
  const homework = (homeworkResult.data ?? []) as Homework[]
  const currency = settingsResult.data?.currency ?? 'USD'

  const activeHomework = homework.filter((h) => h.status !== 'reviewed')
  const reviewedHomework = homework.filter((h) => h.status === 'reviewed')
  return (
    <div className="max-w-3xl">
      {/* Top nav */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/students"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ученики
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{student.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <StudentInviteButton studentId={id} />
          <Button asChild variant="secondary" size="sm">
            <Link href={`/students/${id}/chat`}>
              <MessageCircle className="w-3.5 h-3.5" />
              Чат
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/students/${id}/edit`}>Редактировать</Link>
          </Button>
          <StudentDetailClient studentId={id} isArchived={student.status === 'archived'} />
        </div>
      </div>

      {/* Archived banner */}
      {student.status === 'archived' && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Ученик в архиве. Восстановите, чтобы продолжить работу.
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 grid grid-cols-2 gap-x-8 gap-y-3">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Статус</p>
          <StatusBadge status={student.status} />
        </div>
        {student.level && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Уровень</p>
            <p className="text-sm text-gray-900">{student.level}</p>
          </div>
        )}
        {student.contact && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Контакт</p>
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
              {student.contact}
            </div>
          </div>
        )}
        {(student.email ?? (isEmail(student.contact) ? student.contact : null)) && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Email</p>
            <p className="text-sm text-gray-700">
              {student.email ?? (isEmail(student.contact) ? student.contact : null)}
            </p>
          </div>
        )}
        {student.portal_active != null && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Портал</p>
            <p className="text-sm text-gray-700">
              {student.portal_active ? 'Активен' : 'Не активен'}
              {student.invite_sent_at ? ` · приглашение: ${formatDateTime(student.invite_sent_at)}` : ''}
            </p>
          </div>
        )}
        {student.price_per_hour != null && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Цена за урок</p>
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
              {formatCurrency(student.price_per_hour, currency)}/ч
            </div>
          </div>
        )}
        {student.notes && (
          <div className="col-span-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Заметки</p>
            <div className="flex items-start gap-1.5 text-sm text-gray-700">
              <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <p className="whitespace-pre-wrap">{student.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Lessons section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Уроки</h2>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/lessons/new?studentId=${id}`}>
              <Plus className="w-3.5 h-3.5" />
              Создать урок
            </Link>
          </Button>
        </div>

        {lessons.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Нет уроков</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Дата</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Тема</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lessons.slice(0, 5).map((lesson) => (
                <tr
                  key={lesson.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3 text-gray-600 whitespace-nowrap">
                    <Link href={`/lessons/${lesson.id}`} className="hover:text-gray-900">
                      {formatRelativeDay(lesson.scheduled_at)}, {new Date(lesson.scheduled_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                    </Link>
                  </td>
                  <td className="py-3 text-gray-700">
                    <Link href={`/lessons/${lesson.id}`} className="hover:text-gray-900">
                      {lesson.topic || <span className="text-gray-400">—</span>}
                    </Link>
                  </td>
                  <td className="py-3">
                    <StatusBadge status={lesson.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {lessons.length > 5 && (
          <p className="mt-3 text-xs text-gray-400 text-center">
            И ещё {lessons.length - 5} уроков
          </p>
        )}
      </div>

      {/* Homework section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Домашние задания</h2>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/homework/new?studentId=${id}`}>
              <Plus className="w-3.5 h-3.5" />
              Добавить ДЗ
            </Link>
          </Button>
        </div>

        {homework.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Нет домашних заданий</p>
        ) : (
          <div className="space-y-2">
            {activeHomework.map((hw) => (
              <Link
                key={hw.id}
                href={`/homework/${hw.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-700 line-clamp-1">{hw.description}</p>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  {hw.deadline && (
                    <span className="text-xs text-gray-400">{formatRelativeDay(hw.deadline)}</span>
                  )}
                  <StatusBadge status={hw.status} />
                </div>
              </Link>
            ))}

            {reviewedHomework.length > 0 && (
              <details className="mt-2">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none py-1">
                  Проверенные ({reviewedHomework.length})
                </summary>
                <div className="space-y-2 mt-2">
                  {reviewedHomework.map((hw) => (
                    <Link
                      key={hw.id}
                      href={`/homework/${hw.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors opacity-60"
                    >
                      <p className="text-sm text-gray-700 line-clamp-1">{hw.description}</p>
                      <StatusBadge status={hw.status} />
                    </Link>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { QuizSurvey } from '@/components/homework/QuizSurvey'
import { formatDate } from '@/lib/utils/format'
import { normalizeQuizSchema } from '@/lib/homework-quiz'
import type { Homework } from '@/types'
import { StudentHomeworkActions } from './StudentHomeworkActions'

export default async function StudentHomeworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!student) notFound()

  const { data: hw } = await supabase
    .from('homework')
    .select('*')
    .eq('id', id)
    .eq('student_id', student.id)
    .single()

  if (!hw) notFound()

  const homework = hw as Homework
  const quizSchema = normalizeQuizSchema(homework.interactive_tasks)
  const initialAnswers =
    homework.student_answers && typeof homework.student_answers === 'object'
      ? homework.student_answers
      : {}

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link href="/student/homework" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Назад к списку
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-gray-900">Домашнее задание</h1>
          <StatusBadge status={homework.status} />
        </div>

        <MarkdownContent content={homework.description} />

        <div className="text-sm text-gray-500">
          Дедлайн: {homework.deadline ? formatDate(homework.deadline) : 'без срока'}
        </div>

        {quizSchema && (
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Тест / квиз</p>
            <QuizSurvey schema={quizSchema} data={initialAnswers} mode="display" />
          </div>
        )}

        {homework.teacher_comment && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Комментарий преподавателя</p>
            <MarkdownContent content={homework.teacher_comment} />
          </div>
        )}

        <StudentHomeworkActions
          homeworkId={homework.id}
          status={homework.status}
          quizSchema={quizSchema}
          initialAnswers={initialAnswers}
        />
      </div>
    </div>
  )
}

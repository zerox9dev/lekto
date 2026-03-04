'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { QuizSurvey } from '@/components/homework/QuizSurvey'
import { normalizeQuizSchema, type QuizDefinition } from '@/lib/homework-quiz'
import type { HomeworkStatus } from '@/types'

interface StudentHomeworkActionsProps {
  homeworkId: string
  status: HomeworkStatus
  quizSchema: QuizDefinition | null
  initialAnswers: Record<string, unknown>
}

export function StudentHomeworkActions({
  homeworkId,
  status,
  quizSchema,
  initialAnswers,
}: StudentHomeworkActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers)

  async function handleSubmitHomework() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('homework')
      .update({ status: 'submitted', student_answers: answers })
      .eq('id', homeworkId)
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Домашнее задание отправлено')
    router.refresh()
  }

  if (status === 'reviewed') return null

  const normalizedSchema = normalizeQuizSchema(quizSchema)

  return (
    <div className="space-y-3">
      {normalizedSchema && (
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">Квиз</p>
          <QuizSurvey
            schema={normalizedSchema}
            data={answers}
            mode="edit"
            onDataChange={setAnswers}
          />
        </div>
      )}

      <Button size="sm" onClick={handleSubmitHomework} loading={loading}>
        {status === 'submitted' ? 'Обновить ответы' : 'Сдать задание'}
      </Button>
    </div>
  )
}
